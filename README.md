# MarinZen 🌿 

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

MarinZen is a modern, full-stack wellness application built on a **scalable microservices architecture**. It helps users discover their Ayurvedic body constitution (Dosha - Vata, Pitta, Kapha) through an interactive assessment and provides personalized wellness, diet, and lifestyle recommendations, along with daily task tracking.

It natively supports dynamic, real-time **Bilingual i18n Translation (English & Tamil)** across both the React frontend and Python backend endpoints.

---

## ✨ Features
- **Prakriti Quiz Engine**: 21-question fast assessment tool to determine your primary Dosha.
- **Task Tracking System**: Dedicated service for managing personalized daily wellness tasks.
- **Microservices Backend**: Containerized FastAPI services orchestrating Routing, Authentication, Quizzes, Recommendations, and Tasks.
- **Bilingual Support (Tamil & English)**: Real-time UI updates and backend payload transitions using custom HTTP `X-Language` headers and `react-i18next`.
- **JWT Authentication**: Secure user login and registration protocols using encrypted tokens.
- **Responsive Glassmorphism UI**: High-end UX utilizing Tailwind CSS v4, Lucide icons, and shadcn/ui components.

## 🏗️ Architecture Overview

The project relies entirely on **Docker Compose** to run distinct microservices. The Frontend only speaks to the **API Gateway**, which securely reverse-proxies requests into the internal Docker network.

```text
                                  +-------------------+
                                  |      Frontend     |
                                  |  (React + Vite)   |
                                  +---------+---------+
                                            |
                                            v (Port 8000)
                                  +---------+---------+
                                  |   API Gateway     |
                                  |    (FastAPI)      |
                                  +----+----+----+----+
                                       |    |    |
         +-----------------------------+    |    +-----------------------------+
         |                                  |                                  |
         |         +------------------------+--------+                         |
         |         |                                 |                         |
         v         v                                 v                         v
+--------+--------+ +--------+--------+ +------------+---------+  +------------+---------+
|  Quiz Service   | | Result Service  | |    Auth Service      |  |    Task Service      |
|    (Port 8001)  | |   (Port 8002)   | |      (Port 8003)     |  |      (Port 8004)     |
+-----------------+ +-----------------+ +----------------------+  +----------------------+
          (Internal Docker Network strictly isolating sub-services)
```

## 🚀 Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, `react-i18next`, `lucide-react`, `shadcn/ui`
- **Backend / Microservices**: FastAPI, Uvicorn, Python 3.11
- **Data Persistence**: SQLAlchemy, PostgreSQL
- **Containerization**: Docker & Docker Compose

---

## 🛠️ Step-by-Step Setup Instructions

Anyone can securely clone and boot this environment locally. 

### 1. Prerequisites
- **Docker** and **Docker Compose** installed.
- **Node.js (v18+)** installed.
- **A PostgreSQL instance URI** (Local or Cloud like NeonDB).

### 2. Clone the Repository
```bash
git clone [https://github.com/Marinsha/MarinZen.git](https://github.com/Marinsha/MarinZen.git)
cd MarinZen
```
### 3. Environment Configuration
You need to establish `.env` files for the microservices requiring database or security keys. Create these `.env` files in their respective subsystem folders:

**`services/auth-service/.env`, `services/result-service/.env`, `services/task-service/.env`**
```env
# Must identically match across services for JWT token validation
SECRET_KEY="your-super-secret-key-12345"
ALGORITHM="HS256"
DATABASE_URL="postgresql://user:pass@host/dbname"

# Task / Result services (optional): enables AI-generated tasks and dynamic Tamil self-healing translation.
# If omitted or invalid, services fall back to standard seeded tasks.
GEMINI_API_KEY="your-gemini-api-key"
```

Recommended split for clarity:

- `services/auth-service/.env`: `SECRET_KEY`, `ALGORITHM`, `DATABASE_URL`
- `services/result-service/.env`: `SECRET_KEY`, `ALGORITHM`, `DATABASE_URL`, optional `GEMINI_API_KEY`
- `services/task-service/.env`: `SECRET_KEY`, `ALGORITHM`, `DATABASE_URL`, optional `GEMINI_API_KEY`

**`services/api-gateway/.env`**
```env
AUTH_SERVICE_URL="http://auth-service:8000"
QUIZ_SERVICE_URL="http://quiz-service:8000"
RESULT_SERVICE_URL="http://result-service:8000"
TASK_SERVICE_URL="http://task-service:8000"
```

**`frontend/.env`**
```env
VITE_API_GATEWAY_URL="http://localhost:8000"
```

### 4. Boot Microservices (Docker)
Ensure Docker daemon is running, execute the following from the root directory to generate the python images and boot the proxy.
```bash
docker compose up --build -d
```

Check container status:
```bash
docker compose ps
```

If a service fails, inspect logs:
```bash
docker compose logs -f task-service
docker compose logs -f result-service
docker compose logs -f auth-service
docker compose logs -f api-gateway
```

> Use `docker compose up --build -d` exactly (not `docker compose build up`).

All python services employ auto-reloading (`--reload` with volume mounts) and the Express task-service runs with `nodemon` so that codebase edits inherently reflect live.

### 5. Seed Bilingual Recommendations & Daily Tasks (Required)
The dashboard strictly requires existing records in the database to map Dosha suggestions and daily tasks. We run the native seed scripts from *inside* the active Docker container to push data to Postgres:

**A. Seed Recommendations (Profiles):**
```bash
docker compose exec result-service python app/seed_recommendations.py
```
> *This automatically populates the 6 dominant Dosha profile templates (3 Doshas x 2 Languages).*

**B. Seed Daily Tasks (350+ Wellness Actions):**
```bash
docker compose exec result-service python all_seed.py
```
> *This loads all 350+ fully localized, high-quality wellness tasks (bilingual Tamil and English) directly into the daily_tasks table, preventing cold-starts or blank dashboards.*

### 6. Boot Frontend Client
In a new terminal, launch the Vite dev server:
```bash
cd frontend
npm install
npm run dev
```

The application is now live at `http://localhost:5173`. 

---

## 📡 Gateway Routing Table
Our API Gateway intelligently isolates logic. If you are developing and hit `http://localhost:8000`:

| Proxy Endpoint | Internal Destination Service | Purpose |
| :--- | :--- | :--- |
| **`/auth/*`** | Auth Service (Port 8003) | JWT creation, User Profiles |
| **`/quiz/*`** | Quiz Service (Port 8001) | Bilingual Array processing |
| **`/recommendations/*`** | Result Service (Port 8002) | PostgreSQL recommendations fetch |
| **`/tasks/*`** | Task Service (Port 8004) | Daily Task tracking |

> **Note on Languages**: All GET/POST endpoints that deliver text data read for the custom `X-Language` header flag sent natively by the Frontend (`en` or `ta`).
