from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel, select
from backend.core.config import settings
import json
import os
import uuid
from datetime import datetime

# Setup async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True
)

# Setup session maker
async_session = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def init_db():
    """Initialize database tables and run data migration."""
    # Importing models to make sure they are registered on SQLModel.metadata
    from backend.models.db_models import UserDB, SessionDB, AnswerDB, EvaluationDB
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
        
    # Run data migration from JSON
    async with async_session() as session:
        try:
            await migrate_json_data(session)
        except Exception as e:
            print(f"Migration failed: {e}")
        finally:
            await session.close()

async def get_session() -> AsyncSession:
    """FastAPI Dependency for database session."""
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()

async def migrate_json_data(db: AsyncSession):
    """Migrate users.json and history.json data into PostgreSQL."""
    # Importing models
    from backend.models.db_models import UserDB, SessionDB, AnswerDB, EvaluationDB
    
    # 1. Migrate Users
    users_file = os.path.join(settings.DATA_DIR, "users.json")
    if os.path.exists(users_file):
        try:
            with open(users_file, "r", encoding="utf-8") as f:
                users_data = json.load(f)
            for u in users_data:
                # Check if user already exists
                stmt = select(UserDB).where((UserDB.username == u["username"]) | (UserDB.email == u["email"]))
                res = await db.execute(stmt)
                if not res.scalars().first():
                    db_user = UserDB(
                        id=uuid.UUID(u["id"]),
                        username=u["username"],
                        email=u["email"],
                        hashed_password=u["hashed_password"],
                        is_active=True
                    )
                    db.add(db_user)
            await db.commit()
            print("Users migrated successfully.")
        except Exception as e:
            print(f"Error migrating users: {e}")
            
    # 2. Migrate Histories (sessions and evaluations)
    history_file = os.path.join(settings.DATA_DIR, "history.json")
    if os.path.exists(history_file):
        try:
            with open(history_file, "r", encoding="utf-8") as f:
                history_data = json.load(f)
                
            # Get a default user ID to associate histories with (e.g. the first user)
            stmt = select(UserDB)
            res = await db.execute(stmt)
            default_user = res.scalars().first()
            if not default_user:
                print("No users found to associate history with. Skipping history migration.")
                return
                
            for h in history_data:
                # Check if session already exists
                sess_stmt = select(SessionDB).where(SessionDB.id == uuid.UUID(h["session_id"]))
                sess_res = await db.execute(sess_stmt)
                if not sess_res.scalars().first():
                    meta = h.get("meta") or {}
                    results = h.get("results") or []
                    
                    # Extract questions and ideal answers from results
                    questions = [r["question"] for r in results if "question" in r]
                    ideal_answers = [r["ideal_answer"] for r in results if "ideal_answer" in r]
                    user_answers = [r["user_answer"] for r in results if "user_answer" in r]
                    
                    completed_at_val = None
                    if h.get("timestamp"):
                        try:
                            completed_at_val = datetime.strptime(h["timestamp"], "%Y-%m-%d %H:%M:%S")
                        except:
                            completed_at_val = datetime.utcnow()
                    else:
                        completed_at_val = datetime.utcnow()
                        
                    # Create SessionDB
                    db_sess = SessionDB(
                        id=uuid.UUID(h["session_id"]),
                        user_id=default_user.id,
                        job_role=meta.get("job_role", "General"),
                        experience_level=meta.get("experience_level", "Mid"),
                        industry=meta.get("industry", "General"),
                        num_questions=len(questions),
                        questions=questions,
                        ideal_answers=ideal_answers,
                        status="completed",
                        created_at=completed_at_val,
                        completed_at=completed_at_val
                    )
                    db.add(db_sess)
                    
                    # Create AnswerDBs
                    for idx, ans_val in enumerate(user_answers):
                        db_ans = AnswerDB(
                            session_id=db_sess.id,
                            question_index=idx,
                            user_answer=ans_val,
                            submitted_at=completed_at_val
                        )
                        db.add(db_ans)
                        
                    # Create EvaluationDB
                    per_question_results = []
                    for r in results:
                        per_question_results.append({
                            "question": r.get("question", ""),
                            "user_answer": r.get("user_answer", ""),
                            "ideal_answer": r.get("ideal_answer", ""),
                            "similarity_score": r.get("similarity_score", 0.0),
                            "keywords": r.get("keywords", {}),
                            "topics": r.get("topics", {}),
                            "feedback": r.get("feedback", "")
                        })
                        
                    db_eval = EvaluationDB(
                        session_id=db_sess.id,
                        overall_score=h.get("overall_score", 0.0),
                        per_question_results=per_question_results,
                        evaluated_at=completed_at_val
                    )
                    db.add(db_eval)
                    
            await db.commit()
            print("Histories migrated successfully.")
        except Exception as e:
            print(f"Error migrating histories: {e}")
