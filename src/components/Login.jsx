import React, { useState } from 'react';
import { login } from '../api';
import logo from '../assets/logo.png';
// 1. Import the icons
import { Eye, EyeOff } from 'lucide-react';

const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  // 2. State to track if password is shown
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await login(formData);
      
      // 3. Save separately so Interceptor and App can both find what they need
      localStorage.setItem('token', data.token); // For the API interceptor
      localStorage.setItem('profile', JSON.stringify(data)); // For the user state
      
      setUser(data.user);
    } catch (err) {
      alert(err.response?.data?.msg || "Login failed");
    }
  };

  const inputStyle = { width: '100%', textAlign: 'left', padding: '12px' };

  return (
    <div className="history-wrapper">
      <header>
        <div className="logo-container">
          <img src={logo} alt="Logo" className="app-logo" />
        </div>
        <h2>Welcome Back</h2>
      </header>

      <div className="history-list">
        <div className="history-day-card" style={{ padding: '30px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            <div className="login-input-group">
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#666' }}>Email Address</label>
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
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#666' }}>Password</label>
              {/* 4. Wrap in a relative div to position the eye icon */}
              <div style={{ position: 'relative' }}>
                <input 
                  className="time-input" 
                  style={inputStyle}
                  // 5. Toggle type between password and text
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  onChange={(e) => setFormData({...formData, password: e.target.value})} 
                  required 
                />
                <div 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ 
                    position: 'absolute', 
                    right: '10px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    cursor: 'pointer', 
                    color: '#888',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </div>
              </div>
            </div>

            <button className="save-btn" type="submit" style={{ marginTop: '10px' }}>
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;