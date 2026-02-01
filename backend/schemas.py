from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ActivityBase(BaseModel):
    description: str
    quantity: float
    unit: str

class ActivityCreate(ActivityBase):
    date: Optional[datetime] = None

class ActivityResponse(ActivityBase):
    id: int
    date: datetime
    activity_type: str
    co2e: float
    confidence_score: str

    class Config:
        orm_mode = True

class EmissionDetailResponse(BaseModel):
    emission_factor: float
    factor_source: str
    formula: str
    calculation_notes: str
    unit_applied: str

    class Config:
        orm_mode = True

class FullActivityDetail(ActivityResponse):
    details: Optional[EmissionDetailResponse]

class DashboardSummary(BaseModel):
    total_co2e: float
    category_distribution: List[dict]
    hotspots: List[dict]
    trend_data: List[dict]

class Recommendation(BaseModel):
    category: str
    title: str
    suggestion: str
    impact: str

class ScenarioRequest(BaseModel):
    activity_id: int
    new_quantity: Optional[float] = None
    new_type: Optional[str] = None

class ScenarioResponse(BaseModel):
    original_co2e: float
    simulated_co2e: float
    difference: float
    reduction_percentage: float
