import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="page-container">
      <div className="floating-bar left-bar">
        <h3>About SpaceEx</h3>
        <p>SpaceEx is an advanced platform for exoplanet discovery and analysis using machine learning algorithms trained on Kepler and TESS data.</p>
        <p>Our mission is to accelerate the discovery of habitable worlds beyond our solar system.</p>
      </div>

      <div className="floating-bar right-bar">
        <h3>Features</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li>• Single candidate analysis</li>
          <li>• Batch processing</li>
          <li>• Multi-batch comparison</li>
          <li>• Advanced visualization</li>
          <li>• Scientific validation tools</li>
        </ul>
      </div>

      <div className="home-main">
        <div className="glass-card">
          <h1 className="page-title">DISCOVER NEW WORLDS</h1>
          <p className="hero-text text-center">
            SpaceEx leverages cutting-edge machine learning to identify potential exoplanets from telescope light curve data. 
            Join our mission to expand the catalog of known exoplanets and search for potentially habitable worlds.
          </p>
          
          <div className="home-buttons">
            <Link to="/predict" className="cyber-btn primary">START ANALYSIS</Link>
            <Link to="/auth" className="cyber-btn">CREATE ACCOUNT</Link>
          </div>
        </div>

        <div className="glass-card">
          <h2 className="section-title text-center">How It Works</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>1. Upload Data</h3>
              <p>Import light curve data from Kepler, TESS, or other telescopes.</p>
            </div>
            <div className="feature-card">
              <h3>2. Analyze</h3>
              <p>Our models detect transit patterns and calculate probability scores.</p>
            </div>
            <div className="feature-card">
              <h3>3. Validate</h3>
              <p>Review results with advanced visualization and statistical tools.</p>
            </div>
            <div className="feature-card">
              <h3>4. Discover</h3>
              <p>Identify promising candidates for further scientific study.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;