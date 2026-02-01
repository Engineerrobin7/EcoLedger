import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report
import joblib
import os

def train_and_export():
    # 1. Load Data
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(script_dir, 'training_data.csv')
    if not os.path.exists(data_path):
        print(f"Error: {data_path} not found.")
        return

    df = pd.read_csv(data_path)
    print(f"Loaded {len(df)} samples for training.")

    # 2. Split Data
    X = df['description']
    y = df['label']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # 3. Build Pipeline (TF-IDF + Logistic Regression)
    # This is lightweight, fast, and highly effective for short text classification
    model_pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1, 2), stop_words='english')),
        ('clf', LogisticRegression(max_iter=1000, multi_class='auto'))
    ])

    # 4. Train Model
    print("Training model...")
    model_pipeline.fit(X_train, y_train)

    # 5. Evaluate
    y_pred = model_pipeline.predict(X_test)
    print("\nModel Performance:")
    print(classification_report(y_test, y_pred))

    # 6. Export Model
    model_filename = os.path.join(script_dir, '..', 'backend', 'activity_classifier_v1.joblib')
    joblib.dump(model_pipeline, model_filename)
    print(f"\nModel exported successfully to {os.path.abspath(model_filename)}")

if __name__ == "__main__":
    train_and_export()
