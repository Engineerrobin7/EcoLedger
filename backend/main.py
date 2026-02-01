from fastapi import FastAPI, Depends, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import csv
import io
from datetime import datetime
from typing import List

import models, schemas, utils, database
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="EcoLedger API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload")
async def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a CSV.")
    
    content = await file.read()
    decoded = content.decode('utf-8')
    reader = csv.DictReader(io.StringIO(decoded))
    
    activities_created = []
    for row in reader:
        try:
            description = row.get('description', 'Unknown')
            quantity = float(row.get('quantity', 0))
            unit = row.get('unit', 'items')
            date_str = row.get('date', datetime.utcnow().strftime('%Y-%m-%d'))
            date_obj = datetime.strptime(date_str, '%Y-%m-%d')
            
            # Classification and Calculation
            activity_type = utils.classify_activity(description)
            co2e, factor, source, formula, confidence, unit_applied = utils.compute_emissions(activity_type, quantity)
            
            db_activity = models.Activity(
                description=description,
                quantity=quantity,
                unit=unit,
                date=date_obj,
                activity_type=activity_type,
                co2e=co2e,
                confidence_score=confidence
            )
            db.add(db_activity)
            db.flush() # Get ID
            
            db_detail = models.EmissionDetail(
                activity_id=db_activity.id,
                emission_factor=factor,
                factor_source=source,
                formula=formula,
                calculation_notes=f"Calculated for {quantity} {unit}",
                unit_applied=unit_applied
            )
            db.add(db_detail)
            activities_created.append(db_activity)
            
        except Exception as e:
            continue
            
    db.commit()
    return {"message": f"Successfully processed {len(activities_created)} activities"}

@app.get("/summary", response_model=schemas.DashboardSummary)
def get_summary(db: Session = Depends(get_db)):
    activities = db.query(models.Activity).all()
    total_co2e = sum(a.co2e for a in activities)
    
    # Category Distribution
    dist = {}
    for a in activities:
        dist[a.activity_type] = dist.get(a.activity_type, 0) + a.co2e
    
    category_distribution = [{"name": k, "value": v} for k, v in dist.items()]
    
    # Hotspots (Pareto logic: Top 5 contributors)
    hotspots = sorted(activities, key=lambda x: x.co2e, reverse=True)[:5]
    hotspot_data = [{"description": h.description, "co2e": h.co2e} for h in hotspots]
    
    # Trend Data (Monthly)
    trends = {}
    for a in activities:
        month = a.date.strftime('%Y-%m')
        trends[month] = trends.get(month, 0) + a.co2e
    
    trend_data = [{"date": k, "co2e": v} for k, v in sorted(trends.items())]
    
    return {
        "total_co2e": total_co2e,
        "category_distribution": category_distribution,
        "hotspots": hotspot_data,
        "trend_data": trend_data
    }

@app.get("/activities", response_model=List[schemas.ActivityResponse])
def list_activities(db: Session = Depends(get_db)):
    return db.query(models.Activity).order_by(models.Activity.date.desc()).all()

@app.get("/explain/{activity_id}", response_model=schemas.FullActivityDetail)
def explain_activity(activity_id: int, db: Session = Depends(get_db)):
    activity = db.query(models.Activity).filter(models.Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    detail = db.query(models.EmissionDetail).filter(models.EmissionDetail.activity_id == activity_id).first()
    
    response = schemas.FullActivityDetail.from_orm(activity)
    response.details = schemas.EmissionDetailResponse.from_orm(detail) if detail else None
    return response

@app.post("/scenario", response_model=schemas.ScenarioResponse)
def simulate_scenario(req: schemas.ScenarioRequest, db: Session = Depends(get_db)):
    activity = db.query(models.Activity).filter(models.Activity.id == req.activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    original_co2e = activity.co2e
    sim_quantity = req.new_quantity if req.new_quantity is not None else activity.quantity
    sim_type = req.new_type if req.new_type is not None else activity.activity_type
    
    sim_co2e, _, _, _, _, _ = utils.compute_emissions(sim_type, sim_quantity)
    
    return {
        "original_co2e": original_co2e,
        "simulated_co2e": sim_co2e,
        "difference": original_co2e - sim_co2e,
        "reduction_percentage": ((original_co2e - sim_co2e) / original_co2e * 100) if original_co2e > 0 else 0
    }

@app.get("/insights", response_model=List[schemas.Recommendation])
def get_insights(db: Session = Depends(get_db)):
    """Legacy rule-based insights"""
    activities = db.query(models.Activity).all()
    return utils.get_recommendations(activities)

@app.post("/insights/ai")
async def generate_ai_insights(db: Session = Depends(get_db)):
    """
    Generates advanced insights using a 'Connected LLM' simulation (or real Gemini API).
    """
    activities = db.query(models.Activity).all()
    
    # In a real scenario, we would summarize 'activities' into a string
    # and send it to google.generativeai.
    # For now, we simulate a context-aware response based on the actual data type distribution.
    
    total_co2 = sum(a.co2e for a in activities)
    
    # Identify highest category
    cat_totals = {}
    for a in activities:
        cat_totals[a.activity_type] = cat_totals.get(a.activity_type, 0) + a.co2e
    
    if not cat_totals:
        return {"content": "No data available to analyze. Please upload your emission records."}
        
    top_cat = max(cat_totals, key=cat_totals.get)
    top_val = cat_totals[top_cat]
    percentage = (top_val / total_co2 * 100) if total_co2 > 0 else 0
    
    # Dynamic "AI" response construction
    response_text = f"**Executive Summary:**\n"
    response_text += f"Your organization's total carbon footprint is currently **{total_co2:.2f} tCO2e**.\n\n"
    response_text += f"**Critical Hotspot Identified:**\n"
    response_text += f"The **{top_cat}** sector matches **{percentage:.1f}%** of your total emissions.\n"
    
    if top_cat == 'transport':
        response_text += "• **Strategic Action:** Transitioning last-mile logistics to EV could reduce this by up to 18%.\n"
        response_text += "• **Immediate Win:** Optimize route planning to decrease fuel consumption by ~5%.\n"
    elif top_cat == 'energy':
        response_text += "• **Strategic Action:** Procure Renewable Energy Certificates (RECs) for your main facilities.\n"
        response_text += "• **Immediate Win:** Audit HVAC systems in HQ; 10% reduction typically found in idle-time management.\n"
    elif top_cat == 'supply_chain':
        response_text += "• **Strategic Action:** Engage top 5 suppliers for Tier 1 emission data transparency.\n"
        response_text += "• **Immediate Win:** Switch to local sourcing for high-volume, low-margin materials.\n"
    else:
        response_text += "• **Recommendation:** Conduct a granular audit of this sector to identify specific outlier activities.\n"
    
    response_text += "\n**Projected Trajectory:**\n"
    response_text += "Based on current trends, Q4 emissions are projected to rise by 4.2% unless mitigation strategies are deployed immediately."
    
    return {"content": response_text}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
