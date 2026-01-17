import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Added updateFCMToken to the imports
import { saveLog, getLogs, updateFCMToken } from '../api';
import logo from '../assets/logo.png';
import { Country, State, City } from 'country-state-city';
import { requestForToken } from '../firebase'; 

const prayersList = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

const Tracker = ({ user }) => {
  const [trackerData, setTrackerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(Notification.permission === 'granted');
  
  // Logic: If user has a city in DB, use it; otherwise fallback to state
  const [location, setLocation] = useState({ 
    city: user.city || user.state || 'Lagos', 
    country: user.country || 'Nigeria' 
  });

  const [isEditingLoc, setIsEditingLoc] = useState(false);
  const [locInput, setLocInput] = useState({ 
    countryCode: '', 
    stateCode: '', 
    cityName: '' 
  });

  // Updated useEffect to request token AND save it to backend
  useEffect(() => {
    requestForToken().then(token => {
      if (token && user.id) {
        updateFCMToken(user.id, token)
          .then(() => console.log("Device synced with database"))
          .catch(err => console.error("Database sync failed", err));
      }
    });
  }, [user.id]);

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

  const syncAzaanNotifications = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const prayerTimes = {};
      trackerData.forEach(p => {
        prayerTimes[p.name] = p.actual;
      });

      navigator.serviceWorker.controller.postMessage({
        type: 'SCHEDULE_AZAAN',
        prayerTimes: prayerTimes
      });
    }
  };

  const enableNotifications = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support notifications.");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setNotificationsEnabled(true);
      // Get token and save to database immediately on click
      const token = await requestForToken(); 
      if (token && user.id) {
        await updateFCMToken(user.id, token);
      }
      syncAzaanNotifications();
      alert("Azaan notifications enabled! 🔔");
    }
  };

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      try {
        const today = getTodayString();
        // Using city first for best accuracy
        const apiRes = await axios.get(
          `https://api.aladhan.com/v1/timingsByCity?city=${location.city}&country=${location.country}&method=3`
        );
        const timings = apiRes.data.data.timings;

        const historyRes = await getLogs(user.id);
        const serverLog = historyRes.data.find(log => log.date === today);
        const localBackup = JSON.parse(localStorage.getItem(`tracker_${today}_${user.id}`)) || {};

        const mergedData = prayersList.map(name => {
          const apiTime = timings[name].match(/\d{2}:\d{2}/)[0];
          const savedFromDB = serverLog?.prayers?.find(p => p.name === name);
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

  // --- UPDATED: SENDS CITY, STATE, AND COUNTRY TO BACKEND ---
  const updateLocation = async () => {
    if (locInput.cityName && locInput.countryCode && locInput.stateCode) {
      const countryObj = Country.getCountryByCode(locInput.countryCode);
      const stateObj = State.getStateByCodeAndCountry(locInput.stateCode, locInput.countryCode);
      
      try {
        // 1. Tell the backend to update the database with all 3 fields
        await axios.post('https://salahtracker-backend.onrender.com/api/auth/update-location', {
          userId: user.id,
          country: countryObj.name,
          state: stateObj.name,
          city: locInput.cityName
        });

        // 2. Update UI
        setLocation({ city: locInput.cityName, country: countryObj.name });
        setIsEditingLoc(false);
        alert("Location updated successfully! Please logout and login to sync your journey.");
      } catch (err) {
        console.error("Failed to sync location with database:", err);
        alert("Update failed. Please check your connection.");
      }
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
          actualTime: p.actual,
          observedTime: p.observed,
          remark: p.observed ? `${calculateRemark(p.actual, p.observed)} (${format12h(p.observed)})` : p.remark
        }))
      };
      await saveLog(payload);
      alert("Journey updated successfully!");
    } catch (err) {
      alert("Save failed. Please check your connection.");
    }
  };

  const countries = Country.getAllCountries();
  const states = locInput.countryCode ? State.getStatesOfCountry(locInput.countryCode) : [];
  const cities = (locInput.countryCode && locInput.stateCode) ? City.getCitiesOfState(locInput.countryCode, locInput.stateCode) : [];

  if (loading) return <div className="loading-state">Syncing Journey...</div>;

  return (
    <div className="tracker-wrapper">
      <header style={{ paddingBottom: '10px' }}>
        <div className="logo-container">
          <img src={logo} alt="Logo" className="app-logo" />
        </div>
        <h2 style={{ marginBottom: '15px' }}>Daily Tracker</h2>
        
        <div style={{ padding: '0 24px' }}>
            {!isEditingLoc ? (
            <div style={{ textAlign: 'center' }}>
                <div 
                    onClick={() => setIsEditingLoc(true)}
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '8px', 
                        background: 'white', 
                        padding: '10px 16px', 
                        borderRadius: '50px', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        cursor: 'pointer',
                        width: 'fit-content',
                        margin: '0 auto'
                    }}
                >
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>📍 {location.city}</span>
                    <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Change</span>
                </div>
                <p style={{ fontSize: '10px', color: '#666', marginTop: '8px', fontStyle: 'italic' }}>
                    Logout and login to see time changes after updating location.
                </p>
            </div>
            ) : (
            <div className="location-form" style={{ background: 'white', padding: '16px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                <select 
                className="time-input" 
                onChange={(e) => setLocInput({ ...locInput, countryCode: e.target.value, stateCode: '', cityName: '' })}
                style={{ width: '100%', marginBottom: '8px' }}
                >
                <option value="">Select Country</option>
                {countries.map(c => <option key={c.isoCode} value={c.isoCode}>{c.name}</option>)}
                </select>
                <select 
                className="time-input" 
                disabled={!locInput.countryCode} 
                onChange={(e) => setLocInput({ ...locInput, stateCode: e.target.value, cityName: '' })}
                style={{ width: '100%', marginBottom: '8px' }}
                >
                <option value="">Select State</option>
                {states.map(s => <option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
                </select>
                <select 
                className="time-input" 
                disabled={!locInput.stateCode} 
                onChange={(e) => setLocInput({ ...locInput, cityName: e.target.value })}
                style={{ width: '100%', marginBottom: '12px' }}
                >
                <option value="">Select City</option>
                {cities.length > 0 ? cities.map(ct => <option key={ct.name} value={ct.name}>{ct.name}</option>) : <option value={locInput.stateCode}>Use State as City</option>}
                </select>
                <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                    onClick={updateLocation} 
                    className="save-btn" 
                    style={{ flex: 2, margin: 0, padding: '12px', fontSize: '14px' }}
                >
                    Update
                </button>
                <button 
                    onClick={() => setIsEditingLoc(false)} 
                    className="loc-cancel-btn"
                    style={{ flex: 1 }}
                >
                    Cancel
                </button>
                </div>
            </div>
            )}
        </div>

        <div style={{ margin: '20px 24px 10px' }}>
          {!notificationsEnabled ? (
            <button onClick={enableNotifications} className="save-btn" style={{ margin: '0', width: '100%', padding: '14px', fontSize: '14px' }}>
              🔔 Enable Azaan Alerts
            </button>
          ) : (
            <div style={{ 
                textAlign: 'center', 
                color: 'var(--primary-dark)', 
                fontSize: '12px', 
                fontWeight: '800', 
                padding: '10px 16px', 
                background: 'var(--accent-soft)', 
                borderRadius: '50px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <span style={{ fontSize: '14px' }}>✅</span> AZAAN ALERTS ACTIVE
            </div>
          )}
        </div>
      </header>

      <div style={{ paddingBottom: '20px' }}>
        {trackerData.map((salah, index) => (
            <div key={salah.name} className="prayer-card">
            <div className="salah-info">
                <h4>{salah.name}</h4>
                <span className="azaan-time">
                Azaan: {format12h(salah.actual)}
                </span>
            </div>
            <div style={{ textAlign: 'right' }}>
                <input 
                type="time" 
                className="time-input"
                value={salah.observed || ""} 
                onChange={(e) => handleTimeChange(index, e.target.value)}
                />
                <div className={`remark-text ${salah.remark.includes('Excellent') ? 'remark-excellent' : ''}`}>
                {salah.remark || "Pending"}
                </div>
            </div>
            </div>
        ))}
      </div>
      
      <button className="save-btn" onClick={handleSave} style={{ marginBottom: '40px' }}>
        Save Progress
      </button>

      {/* FLOATING WHATSAPP BUTTON */}
      <a 
        href="https://wa.me/2347038219706" 
        target="_blank" 
        rel="noopener noreferrer"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#25D366',
          color: 'white',
          borderRadius: '50px',
          padding: '10px 15px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          textDecoration: 'none',
          zIndex: 1000,
          cursor: 'pointer'
        }}
      >
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
          <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.06 3.973L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
        </svg>
        <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Need Help?</span>
      </a>
    </div>
  );
};

export default Tracker;