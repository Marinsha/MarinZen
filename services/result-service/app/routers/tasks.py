from typing import List
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.auth import verify_access_token
from app.schemas.task import TaskRead, TaskUpdate, DailyTaskRead, UserTaskHistoryRead
from app.services.task_service import (
    generate_weighted_tasks,
    update_task_status,
    reset_today_tasks,
    TaskService,
)

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("/daily-ritual/generate", response_model=List[UserTaskHistoryRead])
def get_daily_ritual_tasks(
    dosha: str = Query(...),
    state: str = Query(...),
    user_id: int = Query(...),
    db: Session = Depends(get_db),
):
    """
    Fetches daily tasks based on dosha and state.
    Uses database-first retrieval and triggers an AI fallback if tasks are insufficient (< 5).
    Autosaves/assigns assignments into user_task_history.
    """
    service = TaskService(db)
    return service.get_tasks(dosha, state, user_id)




@router.delete("/reset")
def reset_daily_tasks(
    db: Session = Depends(get_db),
    user_id: str = Depends(verify_access_token),
):
    """Deletes all tasks for the current day to allow fresh regeneration."""
    deleted = reset_today_tasks(db, user_id)
    return {"message": "Tasks reset successfully", "deleted": deleted}


@router.get("/{category}", response_model=List[TaskRead])
def get_daily_tasks(
    category: str,
    vata: float = Query(...),
    pitta: float = Query(...),
    kapha: float = Query(...),
    db: Session = Depends(get_db),
    user_id: str = Depends(verify_access_token),
):
    """
    Fetches today's tasks for the given category.
    If no tasks exist, generates them using the provided dosha scores.
    """
    if category not in ["diet", "yoga", "routine"]:
        raise HTTPException(status_code=400, detail="Invalid category")

    return generate_weighted_tasks(db, user_id, category, vata, pitta, kapha)


@router.patch("/{task_id}", response_model=TaskRead)
def toggle_task(
    task_id: int,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    user_id: str = Depends(verify_access_token),
):
    """Updates the completion status of a task."""
    task = update_task_status(db, user_id, task_id, payload.completed)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.patch("/history/{task_id}/completed", response_model=UserTaskHistoryRead)
def mark_history_task_completed(
    task_id: int,
    db: Session = Depends(get_db),
):
    """Marks a user history task as completed."""
    service = TaskService(db)
    task = service.mark_task_completed(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="History task record not found")
    return task


@router.patch("/history/{task_id}/skipped", response_model=UserTaskHistoryRead)
def mark_history_task_skipped(
    task_id: int,
    db: Session = Depends(get_db),
):
    """Marks a user history task as skipped."""
    service = TaskService(db)
    task = service.mark_task_skipped(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="History task record not found")
    return task


@router.patch("/history/{task_id}/pending", response_model=UserTaskHistoryRead)
def mark_history_task_pending(
    task_id: int,
    db: Session = Depends(get_db),
):
    """Marks a user history task as pending."""
    service = TaskService(db)
    task = service.mark_task_pending(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="History task record not found")
    return task



@router.get("/history/clean-db")
def clean_db(db: Session = Depends(get_db)):
    from app.models.daily_task import DailyTask
    deleted = db.query(DailyTask).filter(DailyTask.text_ta == DailyTask.text_en).delete(synchronize_session=False)
    db.commit()
    return {"message": f"Successfully deleted {deleted} English fallback tasks from daily_tasks table."}


@router.get("/history/check-seeded")
def check_seeded(db: Session = Depends(get_db)):
    from app.models.daily_task import DailyTask
    tasks = db.query(DailyTask).filter(DailyTask.dosha.ilike("vata")).limit(5).all()
    return tasks


@router.get("/history/daily", response_model=List[UserTaskHistoryRead])
def get_user_daily_history(
    user_id: int = Query(...),
    target_date: str = Query(...),  # YYYY-MM-DD format
    db: Session = Depends(get_db),
):
    """Fetches user task assignments for a specific date."""
    try:
        parsed_date = date.fromisoformat(target_date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    service = TaskService(db)
    return service.get_daily_history(user_id, parsed_date)


@router.get("/history/weekly", response_model=List[UserTaskHistoryRead])
def get_user_weekly_history(
    user_id: int = Query(...),
    db: Session = Depends(get_db),
):
    """Fetches user task assignments for the last 7 days."""
    service = TaskService(db)
    return service.get_weekly_history(user_id)


@router.get("/history/monthly", response_model=List[UserTaskHistoryRead])
def get_user_monthly_history(
    user_id: int = Query(...),
    db: Session = Depends(get_db),
):
    """Fetches user task assignments for the last 30 days."""
    service = TaskService(db)
    return service.get_monthly_history(user_id)


@router.post("/history/sync-status", response_model=UserTaskHistoryRead)
def sync_dashboard_task_status(
    user_id: int = Query(...),
    task_text: str = Query(...),
    status: str = Query(...),
    db: Session = Depends(get_db)
):
    """Syncs a dashboard task status toggle directly with the PostgreSQL history table."""
    service = TaskService(db)
    task = service.sync_task_status(user_id, task_text, status)
    if not task:
        raise HTTPException(status_code=404, detail="Corresponding history task not found for today")
    return task


