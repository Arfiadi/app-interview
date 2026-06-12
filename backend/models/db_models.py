import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlmodel import SQLModel, Field, Relationship, JSON, Column

class UserDB(SQLModel, table=True):
    __tablename__ = "users"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    username: str = Field(unique=True, index=True, nullable=False)
    email: str = Field(unique=True, index=True, nullable=False)
    hashed_password: str = Field(nullable=False)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    sessions: List["SessionDB"] = Relationship(back_populates="user", cascade_delete=True)

class SessionDB(SQLModel, table=True):
    __tablename__ = "sessions"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", nullable=False, index=True)
    job_role: str = Field(nullable=False)
    experience_level: str = Field(nullable=False)
    industry: str = Field(nullable=False)
    num_questions: int = Field(nullable=False)
    
    # Storing JSON lists
    questions: List[str] = Field(sa_column=Column(JSON, nullable=False))
    ideal_answers: List[str] = Field(sa_column=Column(JSON, nullable=False))
    
    status: str = Field(default="active", nullable=False)  # active, completed, abandoned
    created_at: datetime = Field(sa_column=Column(JSON, default=datetime.utcnow)) # wait, default_factory is better
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = Field(default=None)
    
    # Relationships
    user: UserDB = Relationship(back_populates="sessions")
    answers: List["AnswerDB"] = Relationship(back_populates="session", cascade_delete=True)
    evaluation: Optional["EvaluationDB"] = Relationship(back_populates="session", cascade_delete=True)

class AnswerDB(SQLModel, table=True):
    __tablename__ = "answers"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    session_id: uuid.UUID = Field(foreign_key="sessions.id", nullable=False, index=True)
    question_index: int = Field(nullable=False)
    user_answer: str = Field(nullable=False)
    submitted_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    session: SessionDB = Relationship(back_populates="answers")

class EvaluationDB(SQLModel, table=True):
    __tablename__ = "evaluations"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    session_id: uuid.UUID = Field(foreign_key="sessions.id", unique=True, nullable=False, index=True)
    overall_score: float = Field(nullable=False)
    
    # Storing list of evaluation results for each question
    per_question_results: List[Dict[str, Any]] = Field(sa_column=Column(JSON, nullable=False))
    
    evaluated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    session: SessionDB = Relationship(back_populates="evaluation")
