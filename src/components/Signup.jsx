import React, { useState } from 'react';
import { signUp } from '../api'; 
import logo from '../assets/logo.png';
import { Country, State, City } from 'country-state-city';
import { Eye, EyeOff } from 'lucide-react';
// Assuming you have this helper to get the token
// import { getFcmToken } from '../firebase'; 

const Signup = ({ setUser }) => { // Added setUser prop
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', country: '', state: '', city: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState('');
  const [selectedStateCode, setSelectedStateCode] = useState('');

  const countries = Country.getAllCountries();
  const states = selectedCountryCode ? State.getStatesOfCountry(selectedCountryCode) : [];
  const cities = (selectedCountryCode && selectedStateCode) ? City.getCitiesOfState(selectedCountryCode, selectedStateCode) : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Try to get the FCM token before signing up
      let fcmToken = null;
      try {
        // If you have a function to get the token, call it here:
        // fcmToken = await getFcmToken(); 
      } catch (tokenErr) {
        console.log("FCM Token fetch failed, user can still sign up", tokenErr);
      }

      // 2. Combine form data with the token
      const finalData = { ...formData, fcmToken };

      const response = await signUp(finalData);
      
      // 3. Save to localStorage immediately so App.jsx sees the user
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('profile', JSON.stringify(response.data));
      
      // 4. Update the global user state to log them in
      if (setUser) {
        setUser(response.data.user);
      }

      alert("Welcome to the Journey!"); 
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
              <select 
                className="time-input"
                style={{ ...inputStyle, flex: '1 1 100%' }}
                required
                onChange={(e) => {
                  const country = countries.find(c => c.isoCode === e.target.value);
                  setSelectedCountryCode(e.target.value);
                  setSelectedStateCode('');
                  setFormData({...formData, country: country?.name || '', state: '', city: ''}); 
                }}
              >
                <option value="">Select Country</option>
                {countries.map((c) => (
                  <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
                ))}
              </select>

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