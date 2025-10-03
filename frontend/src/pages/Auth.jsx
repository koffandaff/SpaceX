import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    name: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup, login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isLogin) {
        // --- LOGIN LOGIC ---
        const result = login(formData.email, formData.password);
        if (result.success) {
          // REDIRECTION LOGIC
          if (result.user.role === 'admin') {
            navigate('/admin');
          } else if (result.user.role === 'scientist') {
            navigate('/scientist');
          } else {
            navigate('/predict');
          }
        } else {
          setMessage(result.message);
        }
      } else {
        // --- SIGNUP LOGIC ---
        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
          setMessage('Passwords do not match');
          setLoading(false);
          return;
        }

        // Validate password length
        if (formData.password.length < 6) {
          setMessage('Password must be at least 6 characters');
          setLoading(false);
          return;
        }

        const result = signup(formData);
        if (result.success) {
          setMessage(result.message);
          // Switch to login form after successful signup
          setIsLogin(true);
          // Clear form
          setFormData({
            email: '',
            password: '',
            confirmPassword: '',
            role: 'user',
            name: ''
          });
        } else {
          setMessage(result.message);
        }
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="auth-container">
        <div className="glass-card">
          <div className="auth-tabs">
            <button 
              className={`auth-tab ${isLogin ? 'active' : ''}`}
              onClick={() => {
                setIsLogin(true);
                setMessage('');
              }}
            >
              LOGIN
            </button>
            <button 
              className={`auth-tab ${!isLogin ? 'active' : ''}`}
              onClick={() => {
                setIsLogin(false);
                setMessage('');
              }}
            >
              SIGN UP
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="form-group">
                <label className="form-label">FULL NAME</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  required={!isLogin}
                  placeholder="Enter your full name"
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">EMAIL</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">PASSWORD</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                required
                minLength={6}
                placeholder="Enter your password"
              />
            </div>

            {!isLogin && (
              <>
                <div className="form-group">
                  <label className="form-label">CONFIRM PASSWORD</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="form-input"
                    required
                    minLength={6}
                    placeholder="Confirm your password"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">ACCOUNT TYPE</label>
                  <select 
                    name="role" 
                    value={formData.role} 
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="user">USER</option>
                    <option value="scientist">SCIENTIST</option>
                  </select>
                  <small style={{color: '#88ffff', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block'}}>
                    Scientist accounts require admin approval
                  </small>
                </div>
              </>
            )}

            {message && (
              <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}

            <button 
              type="submit" 
              className="auth-submit"
              disabled={loading}
            >
              {loading ? 'PROCESSING...' : (isLogin ? 'LOGIN' : 'CREATE ACCOUNT')}
            </button>
          </form>

          {/* Test Accounts Hint */}
          <div style={{marginTop: '1.5rem', padding: '1rem', background: 'rgba(136, 255, 255, 0.1)', borderRadius: '0.5rem', fontSize: '0.8rem'}}>
            <strong>Test Accounts:</strong><br/>
            Admin: admin@spaceex.org / admin123<br/>
            Scientist: scientist@spaceex.org / science123
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;