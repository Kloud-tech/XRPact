# models.py
from datetime import datetime
from typing import Optional
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    Enum,
    Boolean,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from pydantic import BaseModel
import enum

from database import Base


# ---------- Enums ----------

class ProjectStatus(str, enum.Enum):
    OPEN = "OPEN"
    FUNDED = "FUNDED"
    IN_PROGRESS = "IN_PROGRESS"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"


class DonationStatus(str, enum.Enum):
    LOCKED = "LOCKED"
    RELEASED = "RELEASED"
    REFUNDED = "REFUNDED"


# ---------- SQLAlchemy Models ----------

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    ong_address = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    deadline = Column(DateTime, nullable=False)
    amount_target = Column(Float, nullable=False)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.OPEN)

    donations = relationship("Donation", back_populates="project")


class Donation(Base):
    __tablename__ = "donations"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    donor_address = Column(String, nullable=False)
    amount_xrp = Column(Float, nullable=False)

    escrow_owner = Column(String, nullable=False)
    escrow_sequence = Column(Integer, nullable=False)
    condition_hex = Column(String, nullable=False)
    fulfillment_hex = Column(String, nullable=False)

    cancel_after = Column(DateTime, nullable=False)
    status = Column(Enum(DonationStatus), default=DonationStatus.LOCKED)

    project = relationship("Project", back_populates="donations")


class Validator(Base):
    __tablename__ = "validators"

    id = Column(Integer, primary_key=True, index=True)
    xrpl_address = Column(String, unique=True, index=True, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    success_rate = Column(Float, default=1.0)
    missions_completed = Column(Integer, default=0)
    missions_failed = Column(Integer, default=0)
    slashed = Column(Boolean, default=False)


class Evidence(Base):
    __tablename__ = "evidences"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    validator_id = Column(Integer, ForeignKey("validators.id"), nullable=False)
    image_url = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    timestamp = Column(DateTime, nullable=False)
    wallet_signature = Column(String, nullable=False)


# ---------- Pydantic Schemas ----------

class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = None
    ong_address: str
    latitude: float
    longitude: float
    deadline: datetime
    amount_target: float


class ProjectOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    ong_address: str
    latitude: float
    longitude: float
    deadline: datetime
    amount_target: float
    status: ProjectStatus

    class Config:
        orm_mode = True


class DonationCreate(BaseModel):
    donor_address: str
    amount_xrp: float


class DonationOut(BaseModel):
    id: int
    project_id: int
    donor_address: str
    amount_xrp: float
    status: DonationStatus

    class Config:
        orm_mode = True


class EvidenceCreate(BaseModel):
    validator_address: str
    image_url: str
    latitude: float
    longitude: float
    timestamp: datetime
    wallet_signature: str