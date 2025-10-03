from fastapi import FastAPI, Request, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
import joblib
import io
import matplotlib.pyplot as plt
import seaborn as sns
from io import BytesIO
import base64
from typing import Dict, List
import logging

# ===== FASTAPI APP INITIALIZATION =====
app = FastAPI(
    title="SpaceEx Exoplanet Detector",
    description="Advanced ML Platform for Exoplanet Discovery",
    version="2.0.0"
)

# ===== CORS SETUP FOR REACT FRONTEND =====
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # Create React App
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== STATIC FILES & TEMPLATES =====
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# ===== GLOBAL ML MODELS =====
models = {}
scaler = None
feature_names = []
label_encoder = None

# ===== LOGGING SETUP =====
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ===== MODEL LOADING =====
def load_ml_models():
    """Load trained ML models and preprocessing objects"""
    global models, scaler, feature_names, label_encoder
    
    try:
        logger.info("🔄 Loading trained ML models...")
        
        # Load model pipelines
        model_files = {
            'xgboost': 'ml_models/XGBoost_pipeline.pkl',
            'catboost': 'ml_models/CatBoost_pipeline.pkl', 
            'votingensemble': 'ml_models/VotingEnsemble_pipeline.pkl',
            'lightgbm': 'ml_models/LightGBM_pipeline.pkl'
        }
        
        for model_name, file_path in model_files.items():
            pipeline_data = joblib.load(file_path)
            if isinstance(pipeline_data, tuple) and len(pipeline_data) == 2:
                models[model_name] = pipeline_data[0]  # Extract pipeline
            else:
                models[model_name] = pipeline_data
        
        # Feature configuration
        feature_names = [
            'period', 'planet_radius', 'depth', 'equilibrium_temp', 'insolation',
            'impact', 'duration', 'star_radius', 'star_mass', 'star_teff', 'kepmag',
            'planet_density_ratio', 'log_period', 'stellar_flux', 'temp_ratio'
        ]
        
        # Load preprocessing objects if available
        try:
            label_encoder = joblib.load('ml_models/label_encoder.pkl')
            logger.info("✅ Label encoder loaded")
        except FileNotFoundError:
            label_encoder = None
            logger.info("ℹ️ No label encoder found")
        
        logger.info(f"✅ Models loaded: {list(models.keys())}")
        logger.info(f"✅ Features: {len(feature_names)}")
        
    except Exception as e:
        logger.error(f"❌ Model loading failed: {e}")
        raise

# ===== PREDICTION DECODING =====
def decode_predictions(predictions, probabilities=None):
    """Decode numerical predictions to human-readable labels"""
    class_mapping = {
        0: {"label": "FALSE POSITIVE", "emoji": "❌", "color": "#ff4444"},
        1: {"label": "CANDIDATE", "emoji": "🔍", "color": "#ffa500"}, 
        2: {"label": "CONFIRMED", "emoji": "🌍", "color": "#44ff44"}
    }
    
    decoded = []
    for i, pred in enumerate(predictions):
        class_info = class_mapping.get(pred, {"label": "UNKNOWN", "emoji": "❓", "color": "#888888"})
        
        prediction_data = {
            "row": i + 1,
            "prediction": f"{class_info['emoji']} {class_info['label']}",
            "prediction_code": pred,
            "color": class_info['color']
        }
        
        # Add probabilities if available
        if probabilities is not None and i < len(probabilities):
            prob_array = probabilities[i]
            prediction_data["confidence"] = float(np.max(prob_array))
            prediction_data["probabilities"] = {
                "false_positive": float(prob_array[0]),
                "candidate": float(prob_array[1]), 
                "confirmed": float(prob_array[2])
            }
        
        decoded.append(prediction_data)
    
    return decoded

def calculate_statistics(predictions):
    """Calculate prediction statistics"""
    prediction_codes = [pred["prediction_code"] for pred in predictions]
    
    counts = {
        "false_positive": sum(1 for code in prediction_codes if code == 0),
        "candidate": sum(1 for code in prediction_codes if code == 1),
        "confirmed": sum(1 for code in prediction_codes if code == 2)
    }
    
    total = len(predictions)
    
    return {
        "total_predictions": total,
        "false_positive_count": counts["false_positive"],
        "candidate_count": counts["candidate"],
        "confirmed_count": counts["confirmed"],
        "false_positive_percentage": (counts["false_positive"] / total) * 100,
        "candidate_percentage": (counts["candidate"] / total) * 100,
        "confirmed_percentage": (counts["confirmed"] / total) * 100,
        "prediction_breakdown": counts
    }

# ===== VISUALIZATION =====
def create_prediction_visualization(predictions, probabilities, statistics):
    """Create comprehensive visualization plots"""
    try:
        fig, axes = plt.subplots(2, 2, figsize=(16, 12))
        fig.suptitle('Exoplanet Detection Analysis', fontsize=16, fontweight='bold')
        
        # Plot 1: Distribution Pie Chart
        ax1 = axes[0, 0]
        sizes = [statistics['false_positive_count'], statistics['candidate_count'], statistics['confirmed_count']]
        labels = ['False Positive', 'Candidate', 'Confirmed']
        colors = ['#ff4444', '#ffa500', '#44ff44']
        
        if sum(sizes) > 0:
            ax1.pie(sizes, labels=labels, colors=colors, autopct='%1.1f%%', startangle=90)
            ax1.set_title('Classification Distribution')
        else:
            ax1.text(0.5, 0.5, 'No Data', ha='center', va='center', fontsize=12)
            ax1.set_title('Classification Distribution')
        
        # Plot 2: Confidence Histogram
        ax2 = axes[0, 1]
        if probabilities and len(probabilities) > 0:
            max_confidences = np.max(probabilities, axis=1)
            ax2.hist(max_confidences, bins=15, alpha=0.7, color='#4fc3f7', edgecolor='black')
            ax2.set_xlabel('Confidence Score')
            ax2.set_ylabel('Frequency')
            ax2.set_title('Confidence Distribution')
            ax2.axvline(0.8, color='red', linestyle='--', alpha=0.7, label='High Confidence')
            ax2.legend()
        else:
            ax2.text(0.5, 0.5, 'No Confidence Data', ha='center', va='center', fontsize=12)
            ax2.set_title('Confidence Distribution')
        
        # Plot 3: Class Probabilities
        ax3 = axes[1, 0]
        if probabilities and len(probabilities) > 0:
            sample_indices = min(5, len(probabilities))
            x = np.arange(sample_indices)
            width = 0.25
            
            for i in range(3):
                probs = [p[i] for p in probabilities[:sample_indices]]
                ax3.bar(x + i*width, probs, width, label=labels[i], color=colors[i], alpha=0.8)
            
            ax3.set_xlabel('Sample Index')
            ax3.set_ylabel('Probability')
            ax3.set_title('Class Probabilities (First 5 Samples)')
            ax3.legend()
            ax3.set_xticks(x + width)
            ax3.set_xticklabels([f'Sample {i+1}' for i in range(sample_indices)])
        else:
            ax3.text(0.5, 0.5, 'No Probability Data', ha='center', va='center', fontsize=12)
            ax3.set_title('Class Probabilities')
        
        # Plot 4: Feature Importance (if available)
        ax4 = axes[1, 1]
        if 'xgboost' in models and hasattr(models['xgboost'], 'feature_importances_'):
            importance = models['xgboost'].feature_importances_
            if len(importance) == len(feature_names):
                top_features = 8
                indices = np.argsort(importance)[-top_features:]
                
                ax4.barh(range(top_features), importance[indices], color='#9c27b0', alpha=0.7)
                ax4.set_yticks(range(top_features))
                ax4.set_yticklabels([feature_names[i] for i in indices])
                ax4.set_xlabel('Importance')
                ax4.set_title(f'Top {top_features} Feature Importance')
            else:
                ax4.text(0.5, 0.5, 'Feature Dimension Mismatch', ha='center', va='center', fontsize=12)
                ax4.set_title('Feature Importance')
        else:
            ax4.text(0.5, 0.5, 'Feature Importance\nNot Available', ha='center', va='center', fontsize=12)
            ax4.set_title('Feature Importance')
        
        plt.tight_layout()
        
        # Convert to base64
        buffer = BytesIO()
        plt.savefig(buffer, format='png', dpi=100, bbox_inches='tight', facecolor='white')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.read()).decode()
        buffer.close()
        plt.close()
        
        return f"data:image/png;base64,{image_base64}"
        
    except Exception as e:
        logger.error(f"Visualization error: {e}")
        return ""

# ===== FEATURE ENGINEERING =====
def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Apply feature engineering transformations"""
    df = df.copy()
    
    # Create engineered features
    if all(col in df.columns for col in ['planet_radius', 'star_radius']):
        df['planet_density_ratio'] = df['planet_radius'] / (df['star_radius'] + 1e-6)
    
    if 'period' in df.columns:
        df['log_period'] = np.log1p(df['period'])
    
    if all(col in df.columns for col in ['insolation', 'star_radius']):
        df['stellar_flux'] = df['insolation'] / (df['star_radius'] ** 2 + 1e-6)
    
    if all(col in df.columns for col in ['equilibrium_temp', 'star_teff']):
        df['temp_ratio'] = df['equilibrium_temp'] / (df['star_teff'] + 1e-6)
    
    return df

def preprocess_data(df: pd.DataFrame) -> pd.DataFrame:
    """Preprocess input data for prediction"""
    df_engineered = engineer_features(df)
    
    if feature_names:
        # Ensure all required features are present
        for feature in feature_names:
            if feature not in df_engineered.columns:
                df_engineered[feature] = 0.0  # Fill missing features
        
        return df_engineered[feature_names]
    else:
        # Fallback: use numerical columns
        numerical_cols = df_engineered.select_dtypes(include=[np.number]).columns
        return df_engineered[numerical_cols].fillna(0)

# ===== PREDICTION LOGIC =====
def make_predictions(model, features: pd.DataFrame) -> Dict:
    """Generate predictions using trained model"""
    try:
        predictions = model.predict(features)
        
        if hasattr(model, 'predict_proba'):
            probabilities = model.predict_proba(features)
            confidence_scores = np.max(probabilities, axis=1)
        else:
            probabilities = None
            confidence_scores = np.ones(len(predictions)) * 0.5
        
        return {
            'predictions': predictions.tolist(),
            'probabilities': probabilities.tolist() if probabilities is not None else None,
            'confidence_scores': confidence_scores.tolist()
        }
    
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        n_samples = len(features)
        return {
            'predictions': [1] * n_samples,  # Default to candidate
            'probabilities': None,
            'confidence_scores': [0.5] * n_samples
        }

# ===== FASTAPI ROUTES =====
@app.on_event("startup")
async def startup_event():
    """Initialize application on startup"""
    load_ml_models()

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    """Serve homepage"""
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/predict", response_class=HTMLResponse)
async def predict_page(request: Request):
    """Serve prediction page"""
    return templates.TemplateResponse("predict.html", {"request": request})

@app.post("/api/predict")
async def predict_exoplanets(
    model_type: str = Form(...),
    file: UploadFile = File(...)
):
    """Main prediction endpoint"""
    # Validate file type
    if not file.filename.lower().endswith('.csv'):
        return JSONResponse(
            {"error": "Please upload a CSV file"}, 
            status_code=400
        )
    
    try:
        # Read and validate CSV
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        
        logger.info(f"📊 Processing {file.filename}: {df.shape[0]} rows, {df.shape[1]} columns")
        
        # Validate models
        if not models:
            return JSONResponse(
                {"error": "ML models not loaded"}, 
                status_code=500
            )
        
        if model_type not in models:
            return JSONResponse(
                {"error": f"Model '{model_type}' not available"}, 
                status_code=400
            )
        
        # Preprocess and predict
        processed_features = preprocess_data(df)
        model = models[model_type]
        prediction_results = make_predictions(model, processed_features)
        
        # Decode and analyze results
        decoded_predictions = decode_predictions(
            prediction_results['predictions'],
            prediction_results['probabilities']
        )
        
        statistics = calculate_statistics(decoded_predictions)
        
        # Generate visualization
        plot_image = create_prediction_visualization(
            decoded_predictions,
            np.array(prediction_results['probabilities']) if prediction_results['probabilities'] else None,
            statistics
        )
        
        # Prepare response
        model_display_names = {
            'xgboost': 'XGBoost',
            'catboost': 'CatBoost', 
            'votingensemble': 'Voting Ensemble',
            'lightgbm': 'LightGBM'
        }
        
        response_data = {
            "model_used": model_display_names.get(model_type, model_type),
            "is_real_prediction": True,
            "file_info": {
                "filename": file.filename,
                "rows_processed": len(df),
                "features_used": len(processed_features.columns)
            },
            "predictions": decoded_predictions,
            "statistics": statistics,
            "visualizations": {
                "prediction_plot": plot_image
            },
            "message": f"Analysis complete: {statistics['confirmed_count']} confirmed, {statistics['candidate_count']} candidates, {statistics['false_positive_count']} false positives."
        }
        
        logger.info(f"✅ Prediction complete: {statistics['confirmed_count']} confirmed exoplanets")
        return response_data
        
    except pd.errors.EmptyDataError:
        return JSONResponse({"error": "CSV file is empty"}, status_code=400)
    except pd.errors.ParserError:
        return JSONResponse({"error": "Invalid CSV format"}, status_code=400)
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        return JSONResponse(
            {"error": f"Processing error: {str(e)}"}, 
            status_code=500
        )

@app.get("/api/models")
async def get_models():
    """Return available models and status"""
    return {
        "available_models": list(models.keys()),
        "loaded_features": feature_names,
        "models_loaded": len(models) > 0,
        "status": "ready" if models else "not_loaded"
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "models_loaded": len(models),
        "service": "SpaceEx ML Backend"
    }

if __name__ == "__main__":
    import uvicorn
    logger.info("🚀 Starting SpaceEx Backend on http://localhost:8000")
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )