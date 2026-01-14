import React, { useState } from 'react';
import { signUp } from '../api'; 
import logo from '../assets/logo.png';
// Import the location library
import { Country, State } from 'country-state-city';
// Import icons for the password toggle
import { Eye, EyeOff } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', country: '', state: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState('');

  // Get all countries for the dropdown
  const countries = Country.getAllCountries();
  // Get states based on selected country
  const states = selectedCountryCode ? State.getStatesOfCountry(selectedCountryCode) : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await signUp(formData);
      alert(response.data.msg); 
    } catch (err) {
      alert(err.response?.data?.msg || "Something went wrong");
    }
  };

  const inputStyle = { width: '100%', textAlign: 'left', padding: '12px', marginBottom: '5px', border: '1px solid #ddd', borderRadius: '4px' };

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
            
            <input 
              className="time-input" 
              style={inputStyle}
              type="text" 
              placeholder="Full Name" 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              required 
            />

            <input 
              className="time-input" 
              style={inputStyle}
              type="email" 
              placeholder="Email Address" 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
              required 
            />

            {/* PASSWORD FIELD WITH TOGGLE */}
            <div style={{ position: 'relative' }}>
              <input 
                className="time-input" 
                style={inputStyle}
                type={showPassword ? "text" : "password"} 
                placeholder="Create Password" 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                required 
              />
              <div 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '10px', top: '30%', cursor: 'pointer', color: '#888' }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              {/* COUNTRY SELECTOR */}
              <select 
                style={inputStyle}
                required
                onChange={(e) => {
                  const country = countries.find(c => c.isoCode === e.target.value);
                  setSelectedCountryCode(e.target.value);
                  setFormData({...formData, country: country.name, state: ''}); // Save name, reset state
                }}
              >
                <option value="">Select Country</option>
                {countries.map((c) => (
                  <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
                ))}
              </select>

              {/* STATE SELECTOR */}
              <select 
                style={inputStyle}
                required
                disabled={!selectedCountryCode}
                onChange={(e) => setFormData({...formData, state: e.target.value})}
              >
                <option value="">Select State/City</option>
                {states.map((s) => (
                  <option key={s.isoCode} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            <button className="save-btn" type="submit" style={{ marginTop: '15px' }}>
              Create Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;