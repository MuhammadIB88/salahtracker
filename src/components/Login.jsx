import React, { useState } from 'react';
import { login } from '../api';
import logo from '../assets/logo.png'; // Importing the logo to match other pages

const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await login(formData);
      // Save the user and token so the browser remembers them
      localStorage.setItem('profile', JSON.stringify(data));
      setUser(data.user);
    } catch (err) {
      alert(err.response?.data?.msg || "Login failed");
    }
  };

  return (
    <div className="history-wrapper"> {/* Using history-wrapper class for consistent background/layout */}
      <header>
        <div className="logo-container">
          <img src={logo} alt="Logo" className="app-logo" />
        </div>
        <h2>Welcome Back</h2>
      </header>

      <div className="history-list"> {/* Using history-list class for the center container style */}
        <div className="history-day-card" style={{ padding: '30px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            <div className="login-input-group">
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#666' }}>Email Address</label>
              <input 
                className="time-input" // Reusing time-input class for consistent borders/padding
                style={{ width: '100%', textAlign: 'left', padding: '12px' }}
                type="email" 
                placeholder="email@example.com" 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                required 
              />
            </div>

            <div className="login-input-group">
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#666' }}>Password</label>
              <input 
                className="time-input" 
                style={{ width: '100%', textAlign: 'left', padding: '12px' }}
                type="password" 
                placeholder="••••••••" 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                required 
              />
            </div>

            <button className="save-btn" type="submit" style={{ marginTop: '10px' }}>
              Sign In
            </button>
            
            <p style={{ textAlign: 'center', fontSize: '14px', color: '#888', marginTop: '10px' }}>
              Don't have an account? <span style={{ color: '#4CAF50', cursor: 'pointer' }}>Register</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;