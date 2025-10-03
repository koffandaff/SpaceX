// pages/ScientistDashboard.js - Scientist tools and dataset management
import React, { useState } from 'react';


const ScientistDashboard = () => {
  const [activeTab, setActiveTab] = useState('datasets');
  
  // Mock data
  const datasets = [
    { id: 1, name: 'Kepler Q1-17 Full', size: '4.2 GB', records: '2.1M', status: 'Processed' },
    { id: 2, name: 'TESS Sector 41', size: '1.8 GB', records: '890K', status: 'Processing' },
    { id: 3, name: 'K2 Campaign 9', size: '3.1 GB', records: '1.5M', status: 'Processed' },
  ];

  const models = [
    { id: 1, name: 'Kepler CNN v2.1', accuracy: '96.2%', status: 'Production' },
    { id: 2, name: 'TESS Transformer v1.4', accuracy: '94.7%', status: 'Staging' },
    { id: 3, name: 'Ensemble Model', accuracy: '97.1%', status: 'Development' },
  ];

  return (
    <div className="predict-main">
      <div className="glass-card">
        <h1 className="page-title">Scientist Dashboard</h1>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <button 
            className={`pill-btn ${activeTab === 'datasets' ? 'active' : ''}`}
            onClick={() => setActiveTab('datasets')}
          >
            Dataset Management
          </button>
          <button 
            className={`pill-btn ${activeTab === 'models' ? 'active' : ''}`}
            onClick={() => setActiveTab('models')}
          >
            Model Training
          </button>
          <button 
            className={`pill-btn ${activeTab === 'research' ? 'active' : ''}`}
            onClick={() => setActiveTab('research')}
          >
            Research Tools
          </button>
        </div>

        {activeTab === 'datasets' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>Available Datasets</h2>
              <button className="pill-btn">Upload New Dataset</button>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #444' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Name</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Size</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Records</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {datasets.map(dataset => (
                    <tr key={dataset.id} style={{ borderBottom: '1px solid #333' }}>
                      <td style={{ padding: '0.75rem' }}>{dataset.name}</td>
                      <td style={{ padding: '0.75rem' }}>{dataset.size}</td>
                      <td style={{ padding: '0.75rem' }}>{dataset.records}</td>
                      <td style={{ padding: '0.75rem' }}>{dataset.status}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <button className="pill-btn" style={{ padding: '0.3rem 0.8rem', fontSize: '0.7rem', marginRight: '0.5rem' }}>
                          Download
                        </button>
                        <button className="pill-btn" style={{ padding: '0.3rem 0.8rem', fontSize: '0.7rem' }}>
                          Process
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'models' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>Model Training</h2>
              <button className="pill-btn">Start New Training</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {models.map(model => (
                <div key={model.id} className="glass-card">
                  <h3>{model.name}</h3>
                  <p>Accuracy: {model.accuracy}</p>
                  <p>Status: {model.status}</p>
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <button className="pill-btn" style={{ padding: '0.4rem 1rem', fontSize: '0.7rem' }}>
                      Evaluate
                    </button>
                    <button className="pill-btn" style={{ padding: '0.4rem 1rem', fontSize: '0.7rem' }}>
                      Retrain
                    </button>
                    {model.status === 'Staging' && (
                      <button className="pill-btn" style={{ padding: '0.4rem 1rem', fontSize: '0.7rem' }}>
                        Deploy
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="glass-card" style={{ marginTop: '2rem' }}>
              <h3>Training Configuration</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label>Dataset</label>
                  <select className="glass-dropdown" style={{ width: '100%', marginTop: '0.5rem' }}>
                    <option>Kepler Q1-17 Full</option>
                    <option>TESS Sector 41</option>
                    <option>K2 Campaign 9</option>
                  </select>
                </div>
                <div>
                  <label>Model Architecture</label>
                  <select className="glass-dropdown" style={{ width: '100%', marginTop: '0.5rem' }}>
                    <option>CNN</option>
                    <option>Transformer</option>
                    <option>Ensemble</option>
                  </select>
                </div>
                <div>
                  <label>Epochs</label>
                  <input type="number" defaultValue={50} className="glass-dropdown" style={{ width: '100%', marginTop: '0.5rem' }} />
                </div>
                <div>
                  <label>Batch Size</label>
                  <input type="number" defaultValue={32} className="glass-dropdown" style={{ width: '100%', marginTop: '0.5rem' }} />
                </div>
              </div>
              <button className="pill-btn" style={{ marginTop: '1.5rem', width: '100%' }}>
                Start Training Job
              </button>
            </div>
          </div>
        )}

        {activeTab === 'research' && (
          <div>
            <h2>Advanced Research Tools</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
              <div className="glass-card" style={{ textAlign: 'center', cursor: 'pointer' }}>
                <h3>Statistical Analysis</h3>
                <p>Run advanced statistical tests on candidate data</p>
              </div>
              <div className="glass-card" style={{ textAlign: 'center', cursor: 'pointer' }}>
                <h3>Data Visualization</h3>
                <p>Create custom plots and visualizations</p>
              </div>
              <div className="glass-card" style={{ textAlign: 'center', cursor: 'pointer' }}>
                <h3>Export Tools</h3>
                <p>Export data in various formats for publication</p>
              </div>
              <div className="glass-card" style={{ textAlign: 'center', cursor: 'pointer' }}>
                <h3>Collaboration</h3>
                <p>Share findings with research teams</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScientistDashboard;