import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { predictExoplanet } from '../services/api';

const Predict = () => {
  const [activeTab, setActiveTab] = useState('single');
  const [selectedModels, setSelectedModels] = useState({
    single: 'xgboost',
    batch: 'xgboost', // Changed from batch1 to batch
    batch1: 'xgboost',
    batch2: 'lightgbm'
  });
  const [files, setFiles] = useState({
    single: null,
    batch: [], // Changed from single file to array for true batch processing
    batch1: null,
    batch2: null
  });
  const [filePreviews, setFilePreviews] = useState({
    single: null,
    batch: [], // Array of previews for batch files
    batch1: null,
    batch2: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const models = {
    xgboost: { name: 'XGBoost', color: '#ff6b6b' },
    lightgbm: { name: 'LightGBM', color: '#4ecdc4' },
    catboost: { name: 'CatBoost', color: '#45b7d1' },
    votingensemble: { name: 'Voting Ensemble', color: '#96ceb4' }
  };

  // Required CSV columns for validation
  const requiredColumns = [
    'period', 'planet_radius', 'depth', 'equilibrium_temp', 'insolation', 
    'impact', 'duration', 'star_radius', 'star_mass', 'star_teff', 'kepmag',
    'planet_density_ratio', 'log_period', 'stellar_flux', 'temp_ratio'
  ];

  const handleModelChange = (tab, model) => {
    setSelectedModels(prev => ({
      ...prev,
      [tab]: model
    }));
  };

  // Validate CSV file structure
  const validateCSV = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const csvText = e.target.result;
          const lines = csvText.split('\n');
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          
          // Check for required columns
          const missingColumns = requiredColumns.filter(col => 
            !headers.includes(col.toLowerCase())
          );
          
          if (missingColumns.length > 0) {
            reject(`Missing required columns: ${missingColumns.join(', ')}`);
            return;
          }
          
          // Parse first few rows for preview
          const previewRows = lines.slice(1, 6).filter(line => line.trim());
          const previewData = previewRows.map(row => {
            const values = row.split(',');
            const rowData = {};
            headers.forEach((header, index) => {
              rowData[header] = values[index]?.trim() || '';
            });
            return rowData;
          });
          
          resolve({
            headers,
            preview: previewData,
            totalRows: lines.length - 1,
            fileName: file.name
          });
        } catch (err) {
          reject('Invalid CSV format');
        }
      };
      
      reader.onerror = () => reject('Error reading file');
      reader.readAsText(file);
    });
  };

  const handleFileChange = async (tab, event) => {
    const newFiles = Array.from(event.target.files);
    if (newFiles.length === 0) return;

    // Check file extensions
    const invalidFiles = newFiles.filter(file => !file.name.toLowerCase().endsWith('.csv'));
    if (invalidFiles.length > 0) {
      setError('Please upload CSV files only');
      return;
    }

    setError('');
    setLoading(true);

    try {
      if (tab === 'batch') {
        // Handle multiple files for batch processing
        const validationPromises = newFiles.map(file => validateCSV(file));
        const validations = await Promise.all(validationPromises);
        
        setFiles(prev => ({ ...prev, [tab]: [...prev[tab], ...newFiles] }));
        setFilePreviews(prev => ({ 
          ...prev, 
          [tab]: [...prev[tab], ...validations]
        }));
      } else {
        // Handle single file for other tabs
        const file = newFiles[0];
        const validation = await validateCSV(file);
        
        setFiles(prev => ({ ...prev, [tab]: file }));
        setFilePreviews(prev => ({ 
          ...prev, 
          [tab]: validation 
        }));
      }
      
    } catch (err) {
      setError(err);
      if (tab === 'batch') {
        setFiles(prev => ({ ...prev, [tab]: [] }));
        setFilePreviews(prev => ({ ...prev, [tab]: [] }));
      } else {
        setFiles(prev => ({ ...prev, [tab]: null }));
        setFilePreviews(prev => ({ ...prev, [tab]: null }));
      }
    } finally {
      setLoading(false);
    }
  };

  const removeBatchFile = (index) => {
    setFiles(prev => ({
      ...prev,
      batch: prev.batch.filter((_, i) => i !== index)
    }));
    setFilePreviews(prev => ({
      ...prev,
      batch: prev.batch.filter((_, i) => i !== index)
    }));
  };

  const handleSingleAnalysis = async () => {
    if (!files.single) {
      setError('Please upload a CSV file first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const results = await predictExoplanet(files.single, selectedModels.single);
      navigate('/results', { 
        state: { 
          results,
          analysisType: 'single'
        } 
      });
    } catch (err) {
      setError(err.message || 'Failed to analyze data');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchAnalysis = async () => {
    if (files.batch.length === 0) {
      setError('Please upload at least one CSV file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Process all batch files with the selected model
      const analysisPromises = files.batch.map(file => 
        predictExoplanet(file, selectedModels.batch)
      );
      
      const allResults = await Promise.all(analysisPromises);
      
      navigate('/results', { 
        state: { 
          batchResults: allResults,
          analysisType: 'batch',
          modelUsed: selectedModels.batch
        } 
      });
    } catch (err) {
      setError(err.message || 'Failed to process batch data');
    } finally {
      setLoading(false);
    }
  };

  const handleMultiBatchAnalysis = async () => {
    if (!files.batch1 || !files.batch2) {
      setError('Please upload both CSV files for comparison');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [results1, results2] = await Promise.all([
        predictExoplanet(files.batch1, selectedModels.batch1),
        predictExoplanet(files.batch2, selectedModels.batch2)
      ]);
      
      navigate('/results', { 
        state: { 
          results1, 
          results2, 
          analysisType: 'comparison',
          model1: selectedModels.batch1,
          model2: selectedModels.batch2
        }});
    } catch (err) {
      setError(err.message || 'Failed to compare datasets');
    } finally {
      setLoading(false);
    }
  };

  const FilePreview = ({ preview, fileName, totalRows, onRemove, showRemove = false }) => {
    if (!preview) return null;

    return (
      <div className="file-preview">
        <div className="file-preview-header">
          <h4>📊 File Preview: {fileName}</h4>
          {showRemove && (
            <button className="remove-file-btn" onClick={onRemove}>×</button>
          )}
        </div>
        <p><strong>Rows:</strong> {totalRows} | <strong>Columns:</strong> {preview.headers.length}</p>
        
        <div className="preview-table">
          <table>
            <thead>
              <tr>
                {preview.headers.slice(0, 6).map(header => (
                  <th key={header}>{header}</th>
                ))}
                {preview.headers.length > 6 && <th>...</th>}
              </tr>
            </thead>
            <tbody>
              {preview.preview.map((row, index) => (
                <tr key={index}>
                  {preview.headers.slice(0, 6).map(header => (
                    <td key={header}>{row[header] || '-'}</td>
                  ))}
                  {preview.headers.length > 6 && <td>...</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#88ffff', marginTop: '0.5rem' }}>
          Showing first 5 rows and 6 columns
        </p>
      </div>
    );
  };

  const BatchFilesList = () => {
    if (files.batch.length === 0) return null;

    return (
      <div className="batch-files-list">
        <h4>📁 Selected Files ({files.batch.length})</h4>
        <div className="files-grid">
          {files.batch.map((file, index) => (
            <div key={index} className="file-item">
              <span>📄 {file.name}</span>
              <button 
                className="remove-file-btn"
                onClick={() => removeBatchFile(index)}
                disabled={loading}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        
        {/* Show previews for all batch files */}
        <div className="batch-previews">
          {filePreviews.batch.map((preview, index) => (
            <FilePreview
              key={index}
              preview={preview}
              fileName={files.batch[index]?.name}
              totalRows={preview.totalRows}
              onRemove={() => removeBatchFile(index)}
              showRemove={true}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="page-container">
      <div className="predict-container">
        <div className="predict-tabs">
          <button className={`predict-tab ${activeTab === 'single' ? 'active' : ''}`} onClick={() => setActiveTab('single')}>
            🔍 SINGLE ANALYSIS
          </button>
          <button className={`predict-tab ${activeTab === 'batch' ? 'active' : ''}`} onClick={() => setActiveTab('batch')}>
            📚 BATCH PROCESSING
          </button>
          <button className={`predict-tab ${activeTab === 'multi' ? 'active' : ''}`} onClick={() => setActiveTab('multi')}>
            ⚖️ MULTI-BATCH COMPARISON
          </button>
        </div>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {/* SINGLE ANALYSIS */}
        <div className={`tab-content ${activeTab === 'single' ? 'active' : ''}`}>
          <div className="analysis-section">
            <div className="model-header">
              <h2 className="model-title">🔍 SINGLE CANDIDATE ANALYSIS</h2>
              <select className="model-dropdown" value={selectedModels.single} onChange={(e) => handleModelChange('single', e.target.value)}>
                {Object.entries(models).map(([key, model]) => (
                  <option key={key} value={key}>{model.name}</option>
                ))}
              </select>
            </div>

            <div className="glass-card">
              <h3 className="section-title">Upload Light Curve Data</h3>
              <div className="upload-zone">
                <input 
                  type="file" 
                  className="file-input" 
                  id="single-file" 
                  accept=".csv"
                  onChange={(e) => handleFileChange('single', e)}
                  disabled={loading}
                />
                <label htmlFor="single-file" className="file-label">
                  {loading ? '🔄 VALIDATING CSV...' : '📁 CHOOSE LIGHT CURVE FILE'}
                </label>
                <p style={{marginTop: '1rem', fontSize: '0.8rem', color: '#aaffff'}}>
                  Required columns: period, planet_radius, depth, equilibrium_temp, insolation, impact, duration, star_radius, star_mass, star_teff, kepmag, planet_density_ratio, log_period, stellar_flux, temp_ratio
                </p>
              </div>

              {filePreviews.single && (
                <FilePreview 
                  preview={filePreviews.single}
                  fileName={files.single?.name}
                  totalRows={filePreviews.single.totalRows}
                />
              )}
            </div>

            <div className="action-buttons">
              <button 
                className="cyber-btn primary" 
                onClick={handleSingleAnalysis}
                disabled={!files.single || loading}
              >
                {loading ? '🔄 ANALYZING...' : `🚀 ANALYZE WITH ${models[selectedModels.single].name.toUpperCase()}`}
              </button>
            </div>
          </div>
        </div>

        {/* BATCH PROCESSING */}
        <div className={`tab-content ${activeTab === 'batch' ? 'active' : ''}`}>
          <div className="analysis-section">
            <div className="model-header">
              <h2 className="model-title">📚 TRUE BATCH PROCESSING</h2>
              <select className="model-dropdown" value={selectedModels.batch} onChange={(e) => handleModelChange('batch', e.target.value)}>
                {Object.entries(models).map(([key, model]) => (
                  <option key={key} value={key}>{model.name}</option>
                ))}
              </select>
            </div>

            <div className="glass-card">
              <h3 className="section-title">Upload Multiple CSV Files</h3>
              <div className="upload-zone batch-upload">
                <input 
                  type="file" 
                  className="file-input" 
                  id="batch-files" 
                  accept=".csv"
                  multiple
                  onChange={(e) => handleFileChange('batch', e)}
                  disabled={loading}
                />
                <label htmlFor="batch-files" className="file-label">
                  {loading ? '🔄 VALIDATING FILES...' : '📁 CHOOSE MULTIPLE CSV FILES'}
                </label>
                <p style={{marginTop: '1rem', fontSize: '0.8rem', color: '#aaffff'}}>
                  Select multiple CSV files for batch processing. All files will be processed with the selected model.
                </p>
              </div>

              <BatchFilesList />
            </div>

            <div className="action-buttons">
              <button 
                className="cyber-btn primary" 
                onClick={handleBatchAnalysis}
                disabled={files.batch.length === 0 || loading}
              >
                {loading ? '🔄 PROCESSING BATCH...' : `🚀 PROCESS ${files.batch.length} FILES WITH ${models[selectedModels.batch].name.toUpperCase()}`}
              </button>
            </div>
          </div>
        </div>

        {/* MULTI-BATCH COMPARISON */}
        <div className={`tab-content ${activeTab === 'multi' ? 'active' : ''}`}>
          <div className="analysis-section">
            <div className="model-header">
              <h2 className="model-title">⚖️ HEAD-TO-HEAD COMPARISON</h2>
              <p style={{color: '#aaffff', fontSize: '0.9rem', marginTop: '0.5rem'}}>
                Compare different models or datasets side-by-side
              </p>
            </div>

            <div className="batch-model-selection">
              {/* BATCH 1 */}
              <div className="batch-model-card">
                <h3 className="section-title">🔷 Batch 1</h3>
                <select className="model-dropdown" value={selectedModels.batch1} onChange={(e) => handleModelChange('batch1', e.target.value)} style={{width: '100%', marginBottom: '1rem'}}>
                  {Object.entries(models).map(([key, model]) => (
                    <option key={key} value={key}>{model.name}</option>
                  ))}
                </select>
                <div className="upload-zone">
                  <input 
                    type="file" 
                    className="file-input" 
                    id="batch1-file" 
                    accept=".csv"
                    onChange={(e) => handleFileChange('batch1', e)}
                    disabled={loading}
                  />
                  <label htmlFor="batch1-file" className="file-label">
                    {loading ? '🔄 VALIDATING...' : '📁 UPLOAD BATCH 1 DATA'}
                  </label>
                </div>
                
                {filePreviews.batch1 && (
                  <FilePreview 
                    preview={filePreviews.batch1}
                    fileName={files.batch1?.name}
                    totalRows={filePreviews.batch1.totalRows}
                  />
                )}
              </div>

              {/* BATCH 2 */}
              <div className="batch-model-card">
                <h3 className="section-title">🔶 Batch 2</h3>
                <select className="model-dropdown" value={selectedModels.batch2} onChange={(e) => handleModelChange('batch2', e.target.value)} style={{width: '100%', marginBottom: '1rem'}}>
                  {Object.entries(models).map(([key, model]) => (
                    <option key={key} value={key}>{model.name}</option>
                  ))}
                </select>
                <div className="upload-zone">
                  <input 
                    type="file" 
                    className="file-input" 
                    id="batch2-file" 
                    accept=".csv"
                    onChange={(e) => handleFileChange('batch2', e)}
                    disabled={loading}
                  />
                  <label htmlFor="batch2-file" className="file-label">
                    {loading ? '🔄 VALIDATING...' : '📁 UPLOAD BATCH 2 DATA'}
                  </label>
                </div>
                
                {filePreviews.batch2 && (
                  <FilePreview 
                    preview={filePreviews.batch2}
                    fileName={files.batch2?.name}
                    totalRows={filePreviews.batch2.totalRows}
                  />
                )}
              </div>
            </div>

            <div className="action-buttons">
              <button 
                className="cyber-btn primary" 
                onClick={handleMultiBatchAnalysis}
                disabled={!files.batch1 || !files.batch2 || loading}
              >
                {loading ? '🔄 COMPARING...' : `⚖️ COMPARE ${models[selectedModels.batch1].name} VS ${models[selectedModels.batch2].name}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Predict;