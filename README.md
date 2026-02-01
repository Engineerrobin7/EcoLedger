# 🌍 EcoLedger

EcoLedger is an enterprise-grade AI-powered carbon accounting and emissions intelligence platform. It enables organizations to measure, explain, compare, and reduce their carbon footprint with transparency and decision-grade insights.

## ✨ Features

- **Structured Data Ingestion**: Cleanly import business activity data via CSV.
- **Intelligent Classification**: Automated categorization of activities into transport, energy, procurement, and cloud services.
- **Explainable CO2e Calculation**: Full traceability for every emission value (Activity x Factor).
- **Confidence Scoring**: Transparent "High/Medium/Low" indicators for all data points.
- **Executive Dashboard**: KPIs, category distribution, and hotspot detection using Pareto logic.
- **Scenario Analysis**: Compare "What-If" operational changes to quantify emission reductions.
- **Sustainability Insights**: Data-driven, AI-assisted recommendations.

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+

### Backend Setup
1. Navigate to the `backend` folder.
2. Install dependencies:
   ```bash
   pip install fastapi uvicorn sqlalchemy pydantic python-multipart
   ```
3. Run the server:
   ```bash
   python main.py
   ```
   The API will be available at `http://localhost:8000`.

### Frontend Setup
1. Navigate to the `frontend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

## 📂 Project Structure
- `backend/`: FastAPI application, database models, and calculation logic.
- `frontend/`: React application with Recharts and Lucide-React.
- `assets/`: Project assets (logo, etc.).
- `sample_data.csv`: A sample file to test the ingestion system.

## 🛡️ Methodology
EcoLedger follows the GHG Protocol standards, using factors from EPA, DEFRA, and IPCC to ensure audit-ready compliance.
