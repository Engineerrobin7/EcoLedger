import joblib
import os

# Load ML Model if available
MODEL_PATH = os.path.join(os.path.dirname(__file__), "activity_classifier_v1.joblib")
classifier = None

if os.path.exists(MODEL_PATH):
    try:
        classifier = joblib.load(MODEL_PATH)
        print(f"ML Model loaded successfully from {MODEL_PATH}")
    except Exception as e:
        print(f"Error loading ML model: {e}")

# Mock Emission Factors (CO2e per unit)
EMISSION_FACTORS = {
    "Transport": {"factor": 0.21, "unit": "kg/km", "source": "DEFRA (2023) - Passenger vehicles"},
    "Energy": {"factor": 0.35, "unit": "kg/kWh", "source": "EPA (2023) - Grid average"},
    "Procurement": {"factor": 0.50, "unit": "kg/$", "source": "EEIO Model - General goods"},
    "Cloud Services": {"factor": 0.08, "unit": "kg/GB", "source": "Cloud Carbon Footprint Methodology"},
}

def classify_activity(description: str):
    """
    Classify activity using ML model if available, otherwise fallback to heuristics.
    """
    if classifier:
        try:
            prediction = classifier.predict([description])[0]
            return prediction
        except Exception:
            pass

    # Fallback to heuristics
    desc = description.lower()
    if any(word in desc for word in ["drive", "truck", "flight", "shipping", "km", "mile"]):
        return "Transport"
    elif any(word in desc for word in ["electricity", "power", "grid", "heating", "gas", "kwh"]):
        return "Energy"
    elif any(word in desc for word in ["aws", "azure", "google cloud", "hosting", "server", "data center"]):
        return "Cloud Services"
    else:
        return "Procurement"

def compute_emissions(activity_type: str, quantity: float):
    """
    Calculate CO2e based on factor * quantity.
    Returns (co2e, factor, source, formula, confidence)
    """
    factor_info = EMISSION_FACTORS.get(activity_type, EMISSION_FACTORS["Procurement"])
    factor = factor_info["factor"]
    source = factor_info["source"]
    unit = factor_info["unit"]
    
    co2e = quantity * factor
    formula = f"CO2e = {quantity} {unit} * {factor} kg CO2e/{unit.split('/')[-1]}"
    
    # Confidence scoring logic
    if activity_type == "Energy":
        confidence = "High"
    elif activity_type in ["Transport", "Cloud Services"]:
        confidence = "Medium"
    else:
        confidence = "Low"
        
    return co2e, factor, source, formula, confidence, unit

def get_recommendations(activities):
    """
    Generate mock recommendations based on activity data.
    """
    if not activities:
        return []
    
    # Aggregate by type
    totals = {}
    for a in activities:
        totals[a.activity_type] = totals.get(a.activity_type, 0) + a.co2e
        
    sorted_totals = sorted(totals.items(), key=lambda x: x[1], reverse=True)
    top_category = sorted_totals[0][0]
    
    recommendations = [
        {
            "category": top_category,
            "title": f"Optimize {top_category} Footprint",
            "suggestion": f"Your {top_category} emissions are the highest hotspot. Consider switching to renewable sources or optimizing usage.",
            "impact": "High"
        },
        {
            "category": "General",
            "title": "Data Accuracy Improvement",
            "suggestion": "Increase the frequency of meter readings to improve Confidence Scores from Medium to High.",
            "impact": "Medium"
        }
    ]
    return recommendations
