import os
import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from dotenv import load_dotenv
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("api-gateway")

load_dotenv()

app = FastAPI(
    title="MarinZen API Gateway",
    description="Main entry point for MarinZen microservices",
    version="1.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL") or "http://auth-service:8000"
QUIZ_SERVICE_URL = os.getenv("QUIZ_SERVICE_URL") or "http://quiz-service:8000"
RESULT_SERVICE_URL = (
    os.getenv("RESULT_SERVICE_URL")
    or "http://result-service:8000"
)
TASK_SERVICE_URL = "http://task-service:8000"


@app.get("/")
def read_root():
    return {"message": "API Gateway is running"}


async def proxy_request(url: str, request: Request):
    async with httpx.AsyncClient(timeout=10.0) as client:
        method = request.method
        headers = dict(request.headers)

        # Remove host header to avoid issues with target service
        headers.pop("host", None)
        # Remove content-length to prevent mismatch when forwarding JSON
        headers.pop("content-length", None)

        try:
            logger.info(f"Forwarding {method} request to {url}")

            # Forward JSON body for methods that usually send request data.
            if method in ["POST", "PUT", "PATCH"]:
                try:
                    body_json = await request.json()
                    response = await client.request(
                        method,
                        url,
                        json=body_json,
                        headers=headers,
                        params=request.query_params
                    )
                except Exception:
                    # Fall back to raw bytes if JSON parsing fails.
                    content = await request.body()
                    response = await client.request(
                        method,
                        url,
                        content=content,
                        headers=headers,
                        params=request.query_params
                    )
            else:
                content = await request.body()
                response = await client.request(
                    method,
                    url,
                    content=content,
                    headers=headers,
                    params=request.query_params
                )

            logger.info(f"Received {response.status_code} from {url}")

            resp_headers = dict(response.headers)
            # Remove hop-by-hop headers that might cause issues
            resp_headers.pop("content-length", None)
            resp_headers.pop("content-encoding", None)

            return Response(
                content=response.content,
                status_code=response.status_code,
                headers=resp_headers
            )
        except httpx.RequestError as exc:
            logger.error(f"Request error forwarding to {url}: {str(exc)}")
            raise HTTPException(
                status_code=503,
                detail=f"Service unavailable: {str(exc)}",
            )
        except Exception as exc:
            raise HTTPException(status_code=500, detail=str(exc))


@app.api_route(
    "/auth/{path:path}",
    methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
)
async def proxy_auth(path: str, request: Request):
    return await proxy_request(f"{AUTH_SERVICE_URL}/auth/{path}", request)


@app.api_route("/quiz/{path:path}", methods=["GET", "POST"])
async def proxy_quiz(path: str, request: Request):
    return await proxy_request(f"{QUIZ_SERVICE_URL}/{path}", request)


@app.get("/api/questions")
async def get_questions(request: Request):
    return await proxy_request(f"{QUIZ_SERVICE_URL}/questions", request)


@app.api_route("/recommendations/{path:path}", methods=["GET", "POST"])
async def proxy_result(path: str, request: Request):
    return await proxy_request(
        f"{RESULT_SERVICE_URL}/recommendations/{path}",
        request,
    )


@app.api_route(
    "/tasks/{path:path}",
    methods=["GET", "POST", "PATCH", "DELETE"],
)
async def proxy_tasks(path: str, request: Request):
    if path.startswith("daily-ritual") or path.startswith("history"):
        return await proxy_request(f"{RESULT_SERVICE_URL}/tasks/{path}", request)
    return await proxy_request(f"{TASK_SERVICE_URL}/tasks/{path}", request)




@app.post("/api/result")
async def calculate_result(request: Request):
    return await proxy_request(
        f"{RESULT_SERVICE_URL}/quiz/calculate-result",
        request,
    )
