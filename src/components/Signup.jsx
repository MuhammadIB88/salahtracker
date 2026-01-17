import React, { useState } from 'react';
import { signUp } from '../api'; 
import logo from '../assets/logo.png';
import { Country, State, City } from 'country-state-city'; // Added City import
import { Eye, EyeOff } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', country: '', state: '', city: '' // Added city field
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState('');
  const [selectedStateCode, setSelectedStateCode] = useState(''); // Added state code tracker

  const countries = Country.getAllCountries();
  const states = selectedCountryCode ? State.getStatesOfCountry(selectedCountryCode) : [];
  // Get cities based on country and state
  const cities = (selectedCountryCode && selectedStateCode) ? City.getCitiesOfState(selectedCountryCode, selectedStateCode) : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await signUp(formData);
      alert(response.data.msg); 
    } catch (err) {
      alert(err.response?.data?.msg || "Something went wrong");
    }
  };

  const inputStyle = { width: '100%', textAlign: 'left', padding: '12px' };

  return (
    <div className="signup-wrapper">
      <header>
        <div className="logo-container">
          <img src={logo} alt="Logo" className="app-logo" />
        </div>
        <h2>Create Account</h2>
        <p className="date-text" style={{ color: 'var(--text-muted)' }}>Join the community</p>
      </header>

      <div className="history-list">
        <div className="history-day-card" style={{ padding: '24px', margin: '0 16px 40px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
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

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {/* COUNTRY SELECTOR */}
              <select 
                className="time-input"
                style={{ ...inputStyle, flex: '1 1 100%' }}
                required
                onChange={(e) => {
                  const country = countries.find(c => c.isoCode === e.target.value);
                  setSelectedCountryCode(e.target.value);
                  setSelectedStateCode(''); // Reset state/city
                  setFormData({...formData, country: country?.name || '', state: '', city: ''}); 
                }}
              >
                <option value="">Select Country</option>
                {countries.map((c) => (
                  <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
                ))}
              </select>

              {/* STATE SELECTOR */}
              <select 
                className="time-input"
                style={{ ...inputStyle, flex: '1 1 45%' }}
                required
                disabled={!selectedCountryCode}
                onChange={(e) => {
                  const stateObj = states.find(s => s.isoCode === e.target.value);
                  setSelectedStateCode(e.target.value);
                  setFormData({...formData, state: stateObj?.name || '', city: ''});
                }}
              >
                <option value="">Select State</option>
                {states.map((s) => (
                  <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                ))}
              </select>

              {/* CITY SELECTOR - Added New */}
              <select 
                className="time-input"
                style={{ ...inputStyle, flex: '1 1 45%' }}
                required
                disabled={!selectedStateCode}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
              >
                <option value="">Select City</option>
                {cities.length > 0 ? (
                  cities.map((ct) => (
                    <option key={ct.name} value={ct.name}>{ct.name}</option>
                  ))
                ) : (
                  <option value={formData.state}>Use State as City</option>
                )}
              </select>
            </div>

            <button className="save-btn" type="submit" style={{ margin: '10px 0 0 0', width: '100%' }}>
              Create Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;