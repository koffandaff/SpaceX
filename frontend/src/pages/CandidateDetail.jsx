// pages/CandidateDetail.js - Detailed candidate view
import React from 'react';
import { useParams, Link } from 'react-router-dom';


const CandidateDetail = () => {
  const { id } = useParams();
  
  // Mock data - in a real app, this would come from your API based on the ID
  const candidate = {
    id: id,
    name: `KIC ${1234567 + parseInt(id)}`,
    probability: 0.94,
    period: 4.3,
    depth: 0.02,
    duration: 2.1,
    radius: 1.4,
    equilibriumTemp: 320,
    stellarType: 'G2V',
    status: 'Confirmed',
    discoveryDate: '2023-05-12'
  };

  return (
    <div className="predict-main">
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="page-title" style={{ marginBottom: 0 }}>{candidate.name}</h1>
          <Link to="/results" className="pill-btn">Back to Results</Link>
        </div>
        
        <div className="results-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <h3>Detection Probability</h3>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4CAF50' }}>
                {(candidate.probability * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <h3>Orbital Period</h3>
              <p>{candidate.period} days</p>
            </div>
            <div>
              <h3>Transit Depth</h3>
              <p>{(candidate.depth * 100).toFixed(2)}%</p>
            </div>
            <div>
              <h3>Planet Radius</h3>
              <p>{candidate.radius} R⊕</p>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <h3>Light Curve</h3>
              <div style={{ 
                height: '200px', 
                background: 'rgba(255,255,255,0.05)', 
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #444'
              }}>
                [Light Curve Visualization]
              </div>
            </div>
            
            <div>
              <h3>Phase Folded</h3>
              <div style={{ 
                height: '200px', 
                background: 'rgba(255,255,255,0.05)', 
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #444'
              }}>
                [Phase Folded Plot]
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: '2rem' }}>
            <h3>Additional Data</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <div>
                <strong>Equilibrium Temperature:</strong> {candidate.equilibriumTemp} K
              </div>
              <div>
                <strong>Host Star:</strong> {candidate.stellarType}
              </div>
              <div>
                <strong>Status:</strong> {candidate.status}
              </div>
              <div>
                <strong>Discovery Date:</strong> {candidate.discoveryDate}
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
            <button className="pill-btn">Download Data</button>
            <button className="pill-btn">Compare Similar</button>
            <button className="pill-btn">Add to Watchlist</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetail;