import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { saveLog, getLogs } from '../api';
import logo from '../assets/logo.png';
// Import the location library
import { Country, State, City } from 'country-state-city';

const prayersList = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

const Tracker = ({ user }) => {
  const [trackerData, setTrackerData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 1. Initialize with user's profile location from login
  const [location, setLocation] = useState({ 
    city: user.state || 'Lagos', 
    country: user.country || 'Nigeria' 
  });

  const [isEditingLoc, setIsEditingLoc] = useState(false);
  
  // LocInput stores the selection IDs/Names for the dropdowns during editing
  const [locInput, setLocInput] = useState({ 
    countryCode: '', 
    stateCode: '', 
    cityName: '' 
  });

  const getTodayString = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const format12h = (timeStr) => {
    if (!timeStr) return "";
    try {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const h = hours % 12 || 12;
      return `${h}:${minutes.toString().padStart(2, '0')}${ampm}`;
    } catch (e) { return timeStr; }
  };

  const calculateRemark = (actual, observed) => {
    if (!observed || observed === "") return "";
    const [aH, aM] = actual.split(':').map(Number);
    const [oH, oM] = observed.split(':').map(Number);
    const diff = (oH * 60 + oM) - (aH * 60 + aM);
    if (diff < 0) return "Early";
    if (diff <= 5) return "Excellent";
    if (diff <= 10) return "Very Good";
    if (diff <= 15) return "Good";
    if (diff <= 20) return "Fair";
    return "Can do better";
  };

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      try {
        const today = getTodayString();
        
        // Fetch Azaan Times from Aladhan API based on current location state
        const apiRes = await axios.get(
          `https://api.aladhan.com/v1/timingsByCity?city=${location.city}&country=${location.country}&method=2`
        );
        const timings = apiRes.data.data.timings;

        // Fetch user history to see if today is already logged
        const historyRes = await getLogs(user.id);
        const serverLog = historyRes.data.find(log => log.date === today);
        const localBackup = JSON.parse(localStorage.getItem(`tracker_${today}_${user.id}`)) || {};

        const mergedData = prayersList.map(name => {
          const apiTime = timings[name].match(/\d{2}:\d{2}/)[0];
          const savedFromDB = serverLog?.prayers?.find(p => p.name === name);
          
          // Match keys from your Log Schema (observedTime)
          const savedTime = savedFromDB?.observedTime || savedFromDB?.observed || localBackup[name] || "";
          
          return {
            name: name,
            actual: apiTime,
            observed: savedTime, 
            remark: savedFromDB?.remark || (savedTime ? calculateRemark(apiTime, savedTime) : "")
          };
        });

        setTrackerData(mergedData);
        setLoading(false);
      } catch (err) {
        console.error("Init error:", err);
        setLoading(false);
      }
    };
    initialize();
  }, [user, location]);

  const handleTimeChange = (index, val) => {
    const updated = [...trackerData];
    updated[index].observed = val;
    updated[index].remark = calculateRemark(updated[index].actual, val);
    setTrackerData(updated);
    
    const today = getTodayString();
    const backupObj = JSON.parse(localStorage.getItem(`tracker_${today}_${user.id}`)) || {};
    backupObj[updated[index].name] = val;
    localStorage.setItem(`tracker_${today}_${user.id}`, JSON.stringify(backupObj));
  };

  const updateLocation = () => {
    if (locInput.cityName && locInput.countryCode) {
      const countryName = Country.getCountryByCode(locInput.countryCode).name;
      setLocation({ city: locInput.cityName, country: countryName });
      setIsEditingLoc(false);
    }
  };

  const handleSave = async () => {
    try {
      const today = getTodayString();
      const payload = {
        userId: user.id,
        date: today,
        location: { city: location.city, country: location.country },
        prayers: trackerData.map(p => ({
          name: p.name,
          actualTime: p.actual,   // Matches your Log Schema
          observedTime: p.observed, // Matches your Log Schema
          remark: p.observed ? `${calculateRemark(p.actual, p.observed)} (${format12h(p.observed)})` : p.remark
        }))
      };
      await saveLog(payload);
      alert("Journey updated successfully!");
    } catch (err) {
      alert("Save failed. Please check your connection.");
    }
  };

  // Logic for the Dropdown lists
  const countries = Country.getAllCountries();
  const states = locInput.countryCode ? State.getStatesOfCountry(locInput.countryCode) : [];
  const cities = (locInput.countryCode && locInput.stateCode) ? City.getCitiesOfState(locInput.countryCode, locInput.stateCode) : [];

  if (loading) return <div className="loading-state">Syncing Journey...</div>;

  return (
    <div className="tracker-body">
      <header>
        <div className="logo-container"><img src={logo} alt="Logo" className="app-logo" /></div>
        <h2>Daily Tracker</h2>
        
        {/* --- DYNAMIC LOCATION SECTION --- */}
        <div className="location-pill" style={{ backgroundColor: '#f0f4f8', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
          {!isEditingLoc ? (
            <div className="location-display" onClick={() => setIsEditingLoc(true)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '500' }}>📍 {location.city}, {location.country}</span>
              <button className="loc-edit-btn" style={{ fontSize: '12px', padding: '5px 10px', borderRadius: '5px' }}>Change Location</button>
            </div>
          ) : (
            <div className="location-form" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <select 
                className="time-input" 
                onChange={(e) => setLocInput({ ...locInput, countryCode: e.target.value, stateCode: '', cityName: '' })}
                style={{ width: '100%' }}
              >
                <option value="">Select Country</option>
                {countries.map(c => <option key={c.isoCode} value={c.isoCode}>{c.name}</option>)}
              </select>

              <select 
                className="time-input" 
                disabled={!locInput.countryCode}
                onChange={(e) => setLocInput({ ...locInput, stateCode: e.target.value, cityName: '' })}
                style={{ width: '100%' }}
              >
                <option value="">Select State</option>
                {states.map(s => <option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
              </select>

              <select 
                className="time-input" 
                disabled={!locInput.stateCode}
                onChange={(e) => setLocInput({ ...locInput, cityName: e.target.value })}
                style={{ width: '100%' }}
              >
                <option value="">Select City</option>
                {cities.length > 0 ? cities.map(ct => <option key={ct.name} value={ct.name}>{ct.name}</option>) : <option value={locInput.stateCode}>Use State as City</option>}
              </select>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={updateLocation} className="save-btn" style={{ flex: 1, padding: '10px', fontSize: '14px' }}>Update</button>
                <button onClick={() => setIsEditingLoc(false)} style={{ flex: 1, padding: '10px', fontSize: '14px', backgroundColor: '#888' }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* --- PRAYER LIST --- */}
      {trackerData.map((salah, index) => (
        <div key={salah.name} className="prayer-card" style={{ marginBottom: '12px' }}>
          <div className="salah-info">
            <h4 style={{ margin: 0 }}>{salah.name}</h4>
            <span className="azaan-time" style={{ color: '#2e7d32', fontWeight: 'bold' }}>
              Azaan: {format12h(salah.actual)}
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <input 
              type="time" 
              className="time-input"
              value={salah.observed || ""} 
              onChange={(e) => handleTimeChange(index, e.target.value)}
              style={{ padding: '8px' }}
            />
            <div className="remark-text" style={{ fontSize: '12px', marginTop: '4px', fontWeight: '600' }}>
               {salah.remark || "Pending"}
            </div>
          </div>
        </div>
      ))}
      
      <button 
        className="save-btn" 
        onClick={handleSave} 
        style={{ width: '100%', padding: '15px', marginTop: '20px', fontWeight: 'bold', fontSize: '16px' }}
      >
        Save Progress
      </button>
    </div>
  );
};

export default Tracker;