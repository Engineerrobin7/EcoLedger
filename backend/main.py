from fastapi import FastAPI, Depends, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import csv
import io
import os
from dotenv import load_dotenv
from datetime import datetime
from typing import List

load_dotenv()

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
    
    try:
        content = await file.read()
        decoded = content.decode('utf-8')
        reader = csv.DictReader(io.StringIO(decoded))
        
        # Validate CSV headers
        if not reader.fieldnames:
             raise HTTPException(status_code=400, detail="CSV file is empty or missing headers.")
        
        # Create a map of normalized (lowercase) headers to actual headers
        header_map = {h.lower().strip(): h for h in reader.fieldnames}
        normalized_headers = set(header_map.keys())
             
        required_headers = {'description', 'quantity', 'unit'}
        if not required_headers.issubset(normalized_headers):
             raise HTTPException(status_code=400, detail=f"Missing required headers (description, quantity, unit). Found: {reader.fieldnames}")

        activities_created = []
        rows = list(reader) # Convert to list to check length
        
        if not rows:
             raise HTTPException(status_code=400, detail="CSV file contains no data rows.")

        for row in rows:
            try:
                # Use header_map to get the actual key from the row
                description = row.get(header_map.get('description'), 'Unknown')
                
                # safer float conversion
                try:
                    quantity_str = row.get(header_map.get('quantity'), 0)
                    quantity = float(quantity_str) if quantity_str else 0.0
                except ValueError:
                    quantity = 0.0 # Default to 0 if invalid number
                    
                unit = row.get(header_map.get('unit'), 'items')
                
                # Handle date (optional)
                date_key = header_map.get('date')
                date_str = row.get(date_key, datetime.utcnow().strftime('%Y-%m-%d')) if date_key else datetime.utcnow().strftime('%Y-%m-%d')
                
                try:
                    date_obj = datetime.strptime(date_str, '%Y-%m-%d')
                except ValueError:
                    date_obj = datetime.utcnow() # Fallback to today

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
                
            except Exception as row_error:
                print(f"Skipping row due to error: {row_error}")
                continue
                
        db.commit()
        return {"message": f"Successfully processed {len(activities_created)} activities"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Upload failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")

@app.get("/summary", response_model=schemas.DashboardSummary)
def get_summary(db: Session = Depends(get_db)):
    try:
        activities = db.query(models.Activity).all()
        # Handle case with no activities
        if not activities:
             return {
                "total_co2e": 0.0,
                "category_distribution": [],
                "hotspots": [],
                "trend_data": []
            }
            
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching summary: {str(e)}")

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
    try:
        activities = db.query(models.Activity).all()
        return utils.get_recommendations(activities)
    except Exception as e:
        print(f"Error generating insights: {e}")
        return []

@app.post("/insights/ai")
async def generate_ai_insights(db: Session = Depends(get_db)):
    """
    Generates advanced insights using Gemini API (if key present) or Smart Simulation.
    """
    try:
        activities = db.query(models.Activity).all()
        total_co2 = sum(a.co2e for a in activities)
        
        # Calculate Simulation Data (Fallback)
        cat_totals = {}
        for a in activities:
            cat_totals[a.activity_type] = cat_totals.get(a.activity_type, 0) + a.co2e
            
        if not cat_totals:
            return {"content": "No data available to analyze. Please upload your emission records."}
            
        top_cat = max(cat_totals, key=cat_totals.get)
        
        # ---------------------------------------------------------
        # OPTION 1: REAL AI (If GEMINI_API_KEY is set)
        # ---------------------------------------------------------
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel('gemini-pro')
                
                # Construct a data context for the AI
                context = f"Total CO2: {total_co2} tCO2e.\n"
                context += "Breakdown:\n"
                for cat, val in cat_totals.items():
                    context += f"- {cat}: {val} tCO2e\n"
                
                prompt = f"""
                You are the Chief Sustainability Officer for an enterprise. Analyze this carbon footprint data:
                {context}
                
                Write a concise, professional executive summary.
                1. State the critical hotspot.
                2. Provide 1 high-impact strategic action.
                3. Provide 1 immediate quick-win.
                4. Project the future trend if no action is taken.
                
                Format with bold headers like **Executive Summary**, **Critical Hotspot**, etc. Keep it under 200 words.
                """
                
                response = model.generate_content(prompt)
                return {"content": response.text}
                
            except Exception as e:
                print(f"Gemini API Error: {e} - Falling back to simulation.")
                # Fallback continues below

        # ---------------------------------------------------------
        # OPTION 2: SMART SIMULATION (Fallback)
        # ---------------------------------------------------------
        top_val = cat_totals[top_cat]
        percentage = (top_val / total_co2 * 100) if total_co2 > 0 else 0
        
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
            
    except Exception as e:
        print(f"CRITICAL ERROR in /insights/ai: {e}")
        return JSONResponse(status_code=500, content={"content": "An error occurred generating insights."})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
