from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, default=datetime.datetime.utcnow)
    description = Column(String)
    quantity = Column(Float)
    unit = Column(String)
    activity_type = Column(String)
    co2e = Column(Float)
    confidence_score = Column(String) # High, Medium, Low
    
    emission_detail = relationship("EmissionDetail", back_populates="activity", uselist=False)

class EmissionDetail(Base):
    __tablename__ = "emission_details"

    id = Column(Integer, primary_key=True, index=True)
    activity_id = Column(Integer, ForeignKey("activities.id"))
    emission_factor = Column(Float)
    factor_source = Column(String)
    formula = Column(String)
    calculation_notes = Column(String)
    unit_applied = Column(String)

    activity = relationship("Activity", back_populates="emission_detail")
