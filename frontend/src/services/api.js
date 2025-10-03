// frontend/src/services/api.js

const API_BASE_URL = 'http://localhost:8000';

/**
 * Sends prediction request to FastAPI backend
 * @param {File} file - CSV file uploaded by user
 * @param {string} modelType - 'xgboost', 'catboost', 'lightgbm', 'votingensemble'
 * @returns {Promise<object>} Full JSON response from backend
 */
export const predictExoplanet = async (file, modelType) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('model_type', modelType);

  try {
    console.log(`🚀 Sending prediction request for ${file.name} with model: ${modelType}`);
    
    const response = await fetch(`${API_BASE_URL}/api/predict`, {
      method: 'POST',
      body: formData,
      // Note: Don't set Content-Type header for FormData - browser sets it automatically
    });

    if (!response.ok) {
      let errorMessage = 'Backend API error';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    console.log('✅ Prediction successful:', result);
    return result;
    
  } catch (error) {
    console.error("❌ Error in API service:", error);
    
    // Provide more user-friendly error messages
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Cannot connect to backend server. Make sure the FastAPI server is running on port 8000.');
    }
    
    throw error;
  }
};

/**
 * Health check to verify backend is running
 */
export const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/`);
    return response.ok;
  } catch (error) {
    console.log('🔴 Backend server is not running');
    return false;
  }
};

/**
 * Get available models from backend
 */
export const getAvailableModels = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/models`);
    if (response.ok) {
      const data = await response.json();
      return data.available_models || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching models:', error);
    return [];
  }
};

/**
 * Model display names mapping
 */
export const MODEL_DISPLAY_NAMES = {
  'xgboost': 'XGBoost',
  'catboost': 'CatBoost', 
  'lightgbm': 'LightGBM',
  'votingensemble': 'Voting Ensemble'
};

/**
 * Model descriptions for UI
 */
export const MODEL_DESCRIPTIONS = {
  'xgboost': {
    name: 'XGBoost',
    accuracy: '94.2%',
    bestFor: 'High precision on structured data',
    color: '#ff6b6b'
  },
  'catboost': {
    name: 'CatBoost', 
    accuracy: '93.5%',
    bestFor: 'Categorical features handling',
    color: '#4ecdc4'
  },
  'lightgbm': {
    name: 'LightGBM',
    accuracy: '92.8%', 
    bestFor: 'Large datasets and fast training',
    color: '#45b7d1'
  },
  'votingensemble': {
    name: 'Voting Ensemble',
    accuracy: '96.1%',
    bestFor: 'Maximum accuracy through model combination',
    color: '#96ceb4'
  }
};