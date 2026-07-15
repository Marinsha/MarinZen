from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.schemas.auth import UpdateDoshaRequest
from app.core.database import get_db
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    verify_access_token,
)
from app.models.user import User
from app.models.history import UserHistory
from app.schemas.auth import (
    SignupRequest,
    SignupResponse,
    LoginRequest,
    LoginResponse,
    AvatarUpdateRequest,
)

router = APIRouter()


@router.get("/health")
def health_check():
    return {"status": "ok", "service": "auth-service"}


@router.post("/signup", response_model=SignupResponse)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == payload.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )

    db.add(new_user)
    try:
        db.commit()
        db.refresh(new_user)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email already registered") from exc
    except Exception:
        db.rollback()
        raise

    return SignupResponse(
        message="User created successfully",
        user_id=new_user.id,
        name=new_user.name,
        email=new_user.email,
    )


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email}
    )

    scores = None
    if (
        user.vata_score is not None
        and user.pitta_score is not None
        and user.kapha_score is not None
    ):
        scores = {
            "vata": user.vata_score,
            "pitta": user.pitta_score,
            "kapha": user.kapha_score,
        }

    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        name=user.name,
        email=user.email,
        dosha=user.dosha,
        scores=scores,
        avatar=user.avatar,
    )


@router.patch("/dosha")
def update_dosha(
    payload: UpdateDoshaRequest,
    db: Session = Depends(get_db),
    user_id: str = Depends(verify_access_token),
):
    user = db.query(User).filter(User.id == int(user_id)).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.dosha = payload.dosha
    if payload.scores:
        user.vata_score = payload.scores.get("vata")
        user.pitta_score = payload.scores.get("pitta")
        user.kapha_score = payload.scores.get("kapha")

    db.commit()
    db.refresh(user)

    try:
        history = UserHistory(
            user_id=str(user.id),
            dosha=payload.dosha.lower(),
            event_type="dosha_selected",
        )
        db.add(history)
        db.commit()
    except Exception:
        db.rollback()

    return {"message": "Dosha updated", "dosha": user.dosha}


@router.patch("/avatar")
def update_avatar(
    payload: AvatarUpdateRequest,
    db: Session = Depends(get_db),
    user_id: str = Depends(verify_access_token),
):
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.avatar = payload.avatar
    db.commit()
    return {"message": "Avatar updated"}
