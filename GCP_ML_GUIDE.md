# ☁️ Google Cloud & Kaggle ML Integration Guide

This guide explains how to scale EcoLedger's classification model using Google Cloud Platform (GCP) and Kaggle datasets.

## 1. Finding & Downloading Datasets on Kaggle

### Recommended Datasets
- **[Supply Chain Greenhouse Gas Emission](https://www.kaggle.com/datasets/thedevastator/economic-impact-of-greenhouse-gas-emissions)**: Contains economic sectors and emission factors.
- **[GHG Protocol Categories](https://www.kaggle.com/datasets/over-view-of-greenhouse-gas-emissions)**: General overview of emission sources.

### Using Kaggle API on Google Cloud
1. Generate a `kaggle.json` API token from your Kaggle Account settings.
2. Upload it to your GCP instance or Vertex AI Notebook.
3. Run:
   ```bash
   pip install kaggle
   mkdir ~/.kaggle
   cp kaggle.json ~/.kaggle/
   chmod 600 ~/.kaggle/kaggle.json
   kaggle datasets download -d thedevastator/economic-impact-of-greenhouse-gas-emissions --unzip
   ```

## 2. Setting up Google Cloud (Vertex AI)

### Step A: Enable APIs
Enable the **Vertex AI API** in your Google Cloud Console.

### Step B: Create a Vertex AI Workbench Instance
1. Go to **Vertex AI > Workbench**.
2. Create a **User-Managed Notebook** with a GPU (e.g., T4) if you plan to use Deep Learning (Transformers).
3. Open JupyterLab.

### Step C: Advanced Training (Transformer Model)
If the simple Scikit-learn model isn't enough, use a Transformer (like DistilBERT):

```python
from transformers import AutoTokenizer, AutoModelForSequenceClassification, Trainer, TrainingArguments
import torch

# Load a pre-trained model for fine-tuning
model_name = "distilbert-base-uncased"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=4)

# [Add training logic here using Trainer API]
```

## 3. Exporting for Local Use

Once training is complete in the cloud:
1. Save your model:
   - For Scikit-learn: `joblib.dump(model, 'activity_classifier_v1.joblib')`
   - For Transformers: `model.save_pretrained('./model_export')`
2. Download the exported file(s).
3. Place them in the `backend/` folder of your EcoLedger project.

## 4. Why Use Google Cloud?
- **Speed**: Train on millions of rows in minutes using GPUs.
- **AutoML**: If you don't want to write code, use **Vertex AI AutoML** to upload your CSV and have Google build the model for you.
- **Deployment**: Scale the model as a separate microservice using **Cloud Run**.
