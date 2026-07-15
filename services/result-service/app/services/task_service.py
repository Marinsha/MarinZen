import random
import os
import json
import urllib.request
import urllib.error
import logging
import datetime
from datetime import date
from sqlalchemy.orm import Session
from app.models.task import TaskTracking
from app.models.daily_task import DailyTask
from app.models.user_task_history import UserTaskHistory
from app.constants.tasks import TASK_TEMPLATES

logger = logging.getLogger(__name__)


class TaskService:
    def __init__(self, db: Session):
        self.db = db

    def get_tasks(self, dosha: str, state: str, user_id: int) -> list:
        # 1. Fetch from DB
        tasks = self.fetch_from_db(dosha, state)
        
        # Check and dynamically translate any tasks that have English-only text_ta
        import re
        tamil_char_regex = re.compile(r'[\u0b80-\u0bff]')
        
        updated_any = False
        for t in tasks:
            if not t.text_ta or t.text_ta == t.text_en or not tamil_char_regex.search(t.text_ta):
                logger.info(f"[TaskService] Healing missing Tamil translation for task ID={t.id}: {t.text_en}")
                translated_text = self.translate_to_tamil(t.text_en)
                if translated_text:
                    t.text_ta = translated_text
                    self.db.add(t)
                    updated_any = True
                    
        if updated_any:
            try:
                self.db.commit()
                logger.info("[TaskService] Successfully healed and committed Tamil translations to daily_tasks table.")
                tasks = self.fetch_from_db(dosha, state)
            except Exception as e:
                self.db.rollback()
                logger.error(f"[TaskService] Error committing healed Tamil translations: {e}")
                
        # 2. Check fallback condition (none found or less than 5 tasks)
        if self.should_use_fallback(tasks):
            logger.info(f"[TaskService] Insufficient tasks ({len(tasks)}) for dosha={dosha}, state={state}. Triggering AI fallback...")
            # 3. Generate fallback tasks using AI
            ai_tasks = self.generate_fallback_tasks(dosha, state)
            
            # 4. Save newly generated tasks to database
            if ai_tasks:
                self.save_tasks(ai_tasks)
                # Fetch again from DB to ensure clean ID mapping and proper limits
                tasks = self.fetch_from_db(dosha, state)
                
        # Limit to 5 tasks
        final_tasks = tasks[:5]
        
        # STEP 3 (NEW): Auto-assign these tasks to the user's history for today
        today = date.today()
        tracking_assignments = []
        for t in final_tasks:
            # Check if this assignment already exists for this (user_id, task_date, text_en) to prevent duplicates
            exists = (
                self.db.query(UserTaskHistory)
                .filter(
                    UserTaskHistory.user_id == user_id,
                    UserTaskHistory.task_date == today,
                    UserTaskHistory.text_en == t.text_en
                )
                .first()
            )
            if not exists:
                assignment = UserTaskHistory(
                    user_id=user_id,
                    dosha=t.dosha,
                    state=t.state,
                    task_type=t.task_type,
                    text_en=t.text_en,
                    text_ta=t.text_ta,
                    status="pending",
                    task_date=today
                )
                self.db.add(assignment)
                tracking_assignments.append(assignment)
        
        if tracking_assignments:
            try:
                self.db.commit()
                logger.info(f"[TaskService] Assigned {len(tracking_assignments)} daily tasks to user_id={user_id}")
            except Exception as e:
                self.db.rollback()
                logger.error(f"[TaskService] Error committing task assignments: {e}")
                
        # Return the actual tracking records for today for this user
        return (
            self.db.query(UserTaskHistory)
            .filter(
                UserTaskHistory.user_id == user_id,
                UserTaskHistory.task_date == today
            )
            .all()
        )

    def fetch_from_db(self, dosha: str, state: str) -> list:
        # SELECT * FROM daily_tasks WHERE dosha = ? AND state = ? LIMIT 5
        # Robust case-insensitive comparison using .ilike()
        return (
            self.db.query(DailyTask)
            .filter(
                DailyTask.dosha.ilike(dosha),
                DailyTask.state.ilike(state)
            )
            .limit(5)
            .all()
        )

    def translate_to_tamil(self, text_en: str) -> str:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            return None
            
        prompt = f"""Translate this Ayurvedic wellness task from English to natural, fluent Tamil script.
Return ONLY the exact translated Tamil text. Do not include any explanations, markdown, or wrappers.

English Text: "{text_en}"
Tamil Translation:"""

        models = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-1.5-pro", "gemini-pro"]
        for model in models:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
                body = {
                    "contents": [{"parts": [{"text": prompt}]}]
                }
                
                req = urllib.request.Request(
                    url,
                    data=json.dumps(body).encode("utf-8"),
                    headers={"Content-Type": "application/json"},
                    method="POST"
                )
                
                with urllib.request.urlopen(req, timeout=10) as response:
                    res_body = response.read().decode("utf-8")
                    res_data = json.loads(res_body)
                    if "candidates" in res_data and res_data["candidates"]:
                        translation = res_data["candidates"][0]["content"]["parts"][0]["text"].strip()
                        if translation:
                            translation = translation.replace('"', '').replace("'", "").strip()
                            return translation
            except Exception as e:
                logger.warning(f"[TaskService] Dynamic translation with {model} failed: {e}")
                continue
        return None

    def should_use_fallback(self, tasks: list) -> bool:
        return len(tasks) < 5

    def generate_fallback_tasks(self, dosha: str, state: str) -> list:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            openai_key = os.getenv("OPENAI_API_KEY")
            if openai_key:
                return self._generate_via_openai(openai_key, dosha, state)
            logger.error("[TaskService] AI Fallback triggered but no API key (GEMINI_API_KEY or OPENAI_API_KEY) found in env.")
            return []

        prompt = f"""Generate exactly 5 Ayurvedic daily wellness tasks for the following user profile:
- Dosha: {dosha}
- State: {state}

REQUIREMENTS:
1. Return strictly a raw JSON array of objects. No markdown backticks, no explanations, no wrappers.
2. Each object must have exactly these keys: "dosha", "state", "task_type", "text_en", "text_ta".
3. The "task_type" must be one of exactly: "diet", "yoga", "routine", "avoid".
4. Tasks must be highly specific and Sri Lankan context-based (incorporating local elements like red rice kanji, gotukola sambol, king coconut water, herbal tea, kottu, local lifestyle, etc.).
5. Do NOT provide generic wellness advice. Make them realistic daily actions.
6. The "dosha" and "state" values in each JSON object must be exactly "{dosha}" and "{state}".
7. Ensure they do NOT repeat existing standard tasks.
8. The "text_ta" value MUST contain the high-quality, authentic translation of the "text_en" in natural Tamil script. It must NOT be in English.

STRICT JSON FORMAT:
[
  {{
    "dosha": "{dosha}",
    "state": "{state}",
    "task_type": "diet",
    "text_en": "Drink warm coriander herbal water after waking up.",
    "text_ta": "காலை எழுந்ததும் சூடான கொத்தமல்லி மூலிகை நீர் குடிக்கவும்."
  }},
  ...
]"""

        # Try different Gemini models sequentially for robust generation
        models = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-1.5-pro", "gemini-pro"]
        for model in models:
            try:
                logger.info(f"[TaskService] Attempting task generation with model: {model}...")
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
                body = {
                    "contents": [{"parts": [{"text": prompt}]}]
                }
                
                req = urllib.request.Request(
                    url,
                    data=json.dumps(body).encode("utf-8"),
                    headers={"Content-Type": "application/json"},
                    method="POST"
                )
                
                with urllib.request.urlopen(req, timeout=15) as response:
                    res_body = response.read().decode("utf-8")
                    res_data = json.loads(res_body)
                    
                    if "candidates" in res_data and res_data["candidates"]:
                        text_content = res_data["candidates"][0]["content"]["parts"][0]["text"]
                        logger.info(f"[TaskService] Received AI Response from {model}.")
                        tasks = self._parse_ai_json(text_content)
                        if tasks:
                            # Filter and validate schema of parsed objects
                            valid_tasks = []
                            for t in tasks:
                                if all(k in t for k in ["dosha", "state", "task_type", "text_en", "text_ta"]):
                                    if t["task_type"] in ["diet", "yoga", "routine", "avoid"]:
                                        valid_tasks.append(t)
                            if valid_tasks:
                                logger.info(f"[TaskService] Successfully generated {len(valid_tasks)} fallback tasks.")
                                return valid_tasks
            except Exception as e:
                logger.warning(f"[TaskService] Gemini model {model} failed: {e}")
                continue

        # Fallback to OpenAI if key exists and Gemini failed
        openai_key = os.getenv("OPENAI_API_KEY")
        if openai_key:
            logger.info("[TaskService] Gemini models failed. Trying OpenAI fallback...")
            return self._generate_via_openai(openai_key, dosha, state)

        logger.error("[TaskService] All AI fallback generation attempts failed.")
        return []

    def _generate_via_openai(self, api_key: str, dosha: str, state: str) -> list:
        prompt = f"""Generate exactly 5 Ayurvedic daily wellness tasks for the following user profile:
- Dosha: {dosha}
- State: {state}

REQUIREMENTS:
1. Return strictly a raw JSON array of objects. No markdown backticks, no explanations, no wrappers.
2. Each object must have exactly these keys: "dosha", "state", "task_type", "text_en", "text_ta".
3. The "task_type" must be one of exactly: "diet", "yoga", "routine", "avoid".
4. Tasks must be highly specific and Sri Lankan context-based (incorporating local elements like red rice kanji, gotukola sambol, king coconut water, herbal tea, kottu, local lifestyle, etc.).
5. Do NOT provide generic wellness advice. Make them realistic daily actions.
6. The "dosha" and "state" values in each JSON object must be exactly "{dosha}" and "{state}".
7. Ensure they do NOT repeat existing standard tasks.
8. The "text_ta" value MUST contain the high-quality, authentic translation of the "text_en" in natural Tamil script. It must NOT be in English.

STRICT JSON FORMAT:
[
  {{
    "dosha": "{dosha}",
    "state": "{state}",
    "task_type": "diet",
    "text_en": "Drink warm coriander herbal water after waking up.",
    "text_ta": "காலை எழுந்ததும் சூடான கொத்தமல்லி மூலிகை நீர் குடிக்கவும்."
  }}
]"""
        try:
            url = "https://api.openai.com/v1/chat/completions"
            body = {
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": "You are a professional Ayurvedic doctor specializing in Sri Lankan traditional medicine. You output strict JSON."},
                    {"role": "user", "content": prompt}
                ]
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(body).encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {api_key}"
                },
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=15) as response:
                res_body = response.read().decode("utf-8")
                res_data = json.loads(res_body)
                content = res_data["choices"][0]["message"]["content"]
                tasks = self._parse_ai_json(content)
                
                valid_tasks = []
                for t in tasks:
                    if all(k in t for k in ["dosha", "state", "task_type", "text_en", "text_ta"]):
                        if t["task_type"] in ["diet", "yoga", "routine", "avoid"]:
                            valid_tasks.append(t)
                return valid_tasks
        except Exception as e:
            logger.error(f"[TaskService] OpenAI generation failed: {e}")
        return []

    def _parse_ai_json(self, content: str) -> list:
        try:
            clean_content = content.replace("```json", "").replace("```", "").strip()
            return json.loads(clean_content)
        except Exception:
            try:
                start = content.find("[")
                end = content.rfind("]")
                if start != -1 and end != -1 and end > start:
                    json_str = content[start:end + 1]
                    return json.loads(json_str)
            except Exception as e:
                logger.error(f"[TaskService] JSON parsing failed: {e}")
        return []

    def save_tasks(self, tasks: list):
        try:
            db_tasks = []
            for t in tasks:
                db_task = DailyTask(
                    dosha=t.get("dosha"),
                    state=t.get("state"),
                    task_type=t.get("task_type"),
                    text_en=t.get("text_en"),
                    text_ta=t.get("text_ta")
                )
                db_tasks.append(db_task)
            self.db.add_all(db_tasks)
            self.db.commit()
            logger.info(f"[TaskService] Successfully saved {len(db_tasks)} generated tasks to DB.")
        except Exception as e:
            self.db.rollback()
            logger.error(f"[TaskService] Error saving tasks: {e}")

    def mark_task_completed(self, task_id: int) -> UserTaskHistory:
        task = self.db.query(UserTaskHistory).filter(UserTaskHistory.id == task_id).first()
        if task:
            task.status = "completed"
            self.db.commit()
            self.db.refresh(task)
            logger.info(f"[TaskService] Task id={task_id} marked as completed.")
        return task

    def mark_task_skipped(self, task_id: int) -> UserTaskHistory:
        task = self.db.query(UserTaskHistory).filter(UserTaskHistory.id == task_id).first()
        if task:
            task.status = "skipped"
            self.db.commit()
            self.db.refresh(task)
            logger.info(f"[TaskService] Task id={task_id} marked as skipped.")
        return task

    def mark_task_pending(self, task_id: int) -> UserTaskHistory:
        task = self.db.query(UserTaskHistory).filter(UserTaskHistory.id == task_id).first()
        if task:
            task.status = "pending"
            self.db.commit()
            self.db.refresh(task)
            logger.info(f"[TaskService] Task id={task_id} marked as pending.")
        return task


    def get_daily_history(self, user_id: int, target_date: date) -> list:
        return (
            self.db.query(UserTaskHistory)
            .filter(
                UserTaskHistory.user_id == user_id,
                UserTaskHistory.task_date == target_date
            )
            .all()
        )

    def get_weekly_history(self, user_id: int) -> list:
        seven_days_ago = date.today() - datetime.timedelta(days=6)
        return (
            self.db.query(UserTaskHistory)
            .filter(
                UserTaskHistory.user_id == user_id,
                UserTaskHistory.task_date >= seven_days_ago,
                UserTaskHistory.task_date <= date.today()
            )
            .order_by(UserTaskHistory.task_date.desc(), UserTaskHistory.id.asc())
            .all()
        )

    def get_monthly_history(self, user_id: int) -> list:
        thirty_days_ago = date.today() - datetime.timedelta(days=29)
        return (
            self.db.query(UserTaskHistory)
            .filter(
                UserTaskHistory.user_id == user_id,
                UserTaskHistory.task_date >= thirty_days_ago,
                UserTaskHistory.task_date <= date.today()
            )
            .order_by(UserTaskHistory.task_date.desc(), UserTaskHistory.id.asc())
            .all()
        )

    def sync_task_status(self, user_id: int, task_text: str, status: str) -> UserTaskHistory:
        today = date.today()
        # Find the active history assignment for this user, date, and English task description
        task = (
            self.db.query(UserTaskHistory)
            .filter(
                UserTaskHistory.user_id == user_id,
                UserTaskHistory.task_date == today,
                UserTaskHistory.text_en == task_text
            )
            .first()
        )
        mapped_status = "completed" if status == "done" else "pending" if status == "pending" else status

        if task:
            task.status = mapped_status
            self.db.commit()
            self.db.refresh(task)
            logger.info(f"[TaskService] Synced task '{task_text[:20]}...' status to '{mapped_status}' for user_id={user_id}")
        else:
            # Self-healing: If no history record exists for today, fetch details from master and seed it dynamically!
            master_task = (
                self.db.query(DailyTask)
                .filter(DailyTask.text_en == task_text)
                .first()
            )
            dosha = master_task.dosha if master_task else "Vata"
            state = master_task.state if master_task else "Recovery"
            task_type = master_task.task_type if master_task else "routine"
            text_ta = master_task.text_ta if master_task else task_text

            task = UserTaskHistory(
                user_id=user_id,
                dosha=dosha,
                state=state,
                task_type=task_type,
                text_en=task_text,
                text_ta=text_ta,
                status=mapped_status,
                task_date=today
            )
            self.db.add(task)
            self.db.commit()
            self.db.refresh(task)
            logger.info(f"[TaskService] Self-healed: dynamically created and synced task history record for '{task_text[:20]}...'")

        return task




# ==============================================================================
# LEGACY HELPER FUNCTIONS FOR BACKWARD COMPATIBILITY
# ==============================================================================

def generate_weighted_tasks(
    db: Session,
    user_id: str,
    category: str,
    vata: float,
    pitta: float,
    kapha: float,
):
    """
    Generates personalized tasks based on weighted dosha percentages.
    Includes fallback logic to ensure tasks are always returned.
    """
    today = date.today()

    try:
        existing = (
            db.query(TaskTracking)
            .filter(
                TaskTracking.id > 0,
                TaskTracking.user_id == str(user_id),
                TaskTracking.category == str(category),
                TaskTracking.date == today,
            )
            .all()
        )

        if existing:
            return existing

        task_pool_dict = TASK_TEMPLATES.get(category, {})
        if not task_pool_dict:
            return []

        scores = {
            "vata": float(vata),
            "pitta": float(pitta),
            "kapha": float(kapha),
        }
        total_score = sum(scores.values())
        if total_score <= 0:
            scores = {"vata": 33.3, "pitta": 33.3, "kapha": 33.4}

        dosha_keys = list(scores.keys())
        dosha_weights = [scores[k] for k in dosha_keys]

        selections = []
        generated_names = set()

        max_attempts = 50
        attempts = 0

        while len(selections) < 5 and attempts < max_attempts:
            attempts += 1
            chosen_dosha = random.choices(
                dosha_keys,
                weights=dosha_weights,
                k=1,
            )[0]
            pool = task_pool_dict.get(chosen_dosha, [])

            if not pool:
                continue

            task_text = random.choice(pool)
            if task_text not in generated_names:
                generated_names.add(task_text)
                task_obj = TaskTracking(
                    user_id=str(user_id),
                    category=str(category),
                    task_name=task_text,
                    date=today,
                    completed=False,
                )
                selections.append(task_obj)

        if selections:
            db.add_all(selections)
            db.commit()
            for task in selections:
                db.refresh(task)
            return selections

        return []

    except Exception as e:
        logger.error("Error generating tasks: %s", e)
        db.rollback()
        return []


def update_task_status(
    db: Session,
    user_id: str,
    task_id: int,
    completed: bool,
):
    """Updates the completion status of a specific task."""
    task = (
        db.query(TaskTracking)
        .filter(TaskTracking.id == task_id, TaskTracking.user_id == user_id)
        .first()
    )
    if task:
        task.completed = completed
        db.commit()
        db.refresh(task)
    return task


def reset_today_tasks(db: Session, user_id: str):
    """Deletes all tasks generated today for a user.

    This forces fresh generation on the next fetch.
    """
    try:
        deleted = db.query(TaskTracking).filter(
            TaskTracking.user_id == str(user_id),
            TaskTracking.date == date.today()
        ).delete()
        db.commit()
        return deleted
    except Exception as e:
        db.rollback()
        logger.error("Error resetting tasks: %s", e)
        return 0
