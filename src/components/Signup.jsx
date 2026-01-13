import React, { useState } from 'react';
import { signUp } from '../api'; 
import logo from '../assets/logo.png';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', country: '', state: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await signUp(formData);
      alert(response.data.msg); 
      // Optionally redirect to login here
    } catch (err) {
      alert(err.response?.data?.msg || "Something went wrong");
    }
  };

  const inputStyle = { width: '100%', textAlign: 'left', padding: '12px', marginBottom: '5px' };

  return (
    <div className="history-wrapper">
      <header>
        <div className="logo-container">
          <img src={logo} alt="Logo" className="app-logo" />
        </div>
        <h2>Create Account</h2>
      </header>

      <div className="history-list">
        <div className="history-day-card" style={{ padding: '25px', marginBottom: '50px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            <div>
              <input 
                className="time-input" 
                style={inputStyle}
                type="text" 
                placeholder="Full Name" 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                required 
              />
            </div>

            <div>
              <input 
                className="time-input" 
                style={inputStyle}
                type="email" 
                placeholder="Email Address" 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                required 
              />
            </div>

            <div>
              <input 
                className="time-input" 
                style={inputStyle}
                type="password" 
                placeholder="Create Password" 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                required 
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                className="time-input" 
                style={inputStyle}
                type="text" 
                placeholder="Country" 
                onChange={(e) => setFormData({...formData, country: e.target.value})} 
                required 
              />
              <input 
                className="time-input" 
                style={inputStyle}
                type="text" 
                placeholder="State/City" 
                onChange={(e) => setFormData({...formData, state: e.target.value})} 
                required 
              />
            </div>

            <button className="save-btn" type="submit" style={{ marginTop: '15px' }}>
              Create Account
            </button>

            <p style={{ textAlign: 'center', fontSize: '14px', color: '#888', marginTop: '10px' }}>
              Already have an account? <span style={{ color: '#4CAF50', cursor: 'pointer', fontWeight: 'bold' }}>Login</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;