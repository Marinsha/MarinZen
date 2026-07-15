import os
import psycopg2
from dotenv import load_dotenv

# Import structure
from vata_seed import tasks as vata_tasks
from pitta_seed import tasks as pitta_tasks
from kapha_seed import tasks as kapha_tasks
from vata_pitta_seed import tasks as vata_pitta_tasks
from pitta_kapha_seed import tasks as pitta_kapha_tasks
from vata_kapha_seed import tasks as vata_kapha_tasks

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Connect to database using DATABASE_URL if available, otherwise fallback to DB_CONFIG
if DATABASE_URL:
    print("Connecting to PostgreSQL using DATABASE_URL...")
    conn = psycopg2.connect(DATABASE_URL)
else:
    print("DATABASE_URL not found. Falling back to local DB_CONFIG...")
    DB_CONFIG = {
        "dbname": "your_db_name",
        "user": "postgres",
        "password": "your_password",
        "host": "localhost",
        "port": "5432"
    }
    conn = psycopg2.connect(**DB_CONFIG)

cur = conn.cursor()

# =========================================================
# CREATE SINGLE MASTER TABLE
# =========================================================
print("Creating table daily_tasks if it does not exist...")
cur.execute("""
CREATE TABLE IF NOT EXISTS daily_tasks (
    id SERIAL PRIMARY KEY,
    dosha VARCHAR(50),
    state VARCHAR(50),
    task_type VARCHAR(30),
    text_en TEXT,
    text_ta TEXT
);
""")

# =========================================================
# CLEAN OLD DATA (TRUNCATE BEFORE INSERTING TO AVOID DUPLICATES)
# =========================================================
print("Truncating daily_tasks table to prevent duplicates...")
cur.execute("TRUNCATE TABLE daily_tasks RESTART IDENTITY;")

# =========================================================
# MERGE ALL TASK FILES INTO ONE LIST
# =========================================================
all_tasks = (
    vata_tasks +
    pitta_tasks +
    kapha_tasks +
    vata_pitta_tasks +
    pitta_kapha_tasks +
    vata_kapha_tasks
)

# =========================================================
# INSERT ALL TASKS
# =========================================================
print(f"Inserting {len(all_tasks)} tasks into daily_tasks...")
insert_query = """
INSERT INTO daily_tasks
(dosha, state, task_type, text_en, text_ta)
VALUES (%s, %s, %s, %s, %s)
"""

cur.executemany(insert_query, all_tasks)

conn.commit()
cur.close()
conn.close()

print(f"Seed completed successfully! Total tasks inserted: {len(all_tasks)}")