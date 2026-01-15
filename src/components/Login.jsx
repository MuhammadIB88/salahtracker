import React, { useState } from 'react';
import { login } from '../api';
import logo from '../assets/logo.png';
import { Eye, EyeOff } from 'lucide-react';

const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await login(formData);
      
      localStorage.setItem('token', data.token); 
      localStorage.setItem('profile', JSON.stringify(data)); 
      
      setUser(data.user);
    } catch (err) {
      alert(err.response?.data?.msg || "Login failed");
    }
  };

  // Simplified style, as box-sizing: border-box in App.css now handles padding correctly
  const inputStyle = { width: '100%', textAlign: 'left', padding: '12px' };

  return (
    <div className="login-wrapper">
      <header>
        <div className="logo-container">
          <img src={logo} alt="Logo" className="app-logo" />
        </div>
        <h2>Welcome Back</h2>
        <p className="date-text" style={{ color: 'var(--text-muted)' }}>Sign in to continue your journey</p>
      </header>

      <div className="history-list">
        <div className="history-day-card" style={{ padding: '24px', margin: '0 16px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div className="login-input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>
                Email Address
              </label>
              <input 
                className="time-input" 
                style={inputStyle}
                type="email" 
                placeholder="email@example.com" 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                required 
              />
            </div>

            <div className="login-input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  className="time-input" 
                  style={inputStyle}
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  onChange={(e) => setFormData({...formData, password: e.target.value})} 
                  required 
                />
                <div 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ 
                    position: 'absolute', 
                    right: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    cursor: 'pointer', 
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>
            </div>

            <button className="save-btn" type="submit" style={{ margin: '10px 0 0 0', width: '100%' }}>
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;