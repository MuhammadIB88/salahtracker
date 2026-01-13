import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { saveLog, getLogs } from '../api';
import logo from '../assets/logo.png';

const prayersList = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

const Tracker = ({ user }) => {
  const [trackerData, setTrackerData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New state for travel/location changes
  const [location, setLocation] = useState({ city: user.state, country: user.country });
  const [isEditingLoc, setIsEditingLoc] = useState(false);
  const [locInput, setLocInput] = useState({ city: user.state, country: user.country });

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

  // The main fetcher is now dependent on 'location'
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      try {
        const today = getTodayString();
        
        // 1. Get Azaan Times using current location state
        const apiRes = await axios.get(
          `https://api.aladhan.com/v1/timingsByCity?city=${location.city}&country=${location.country}&method=2`
        );
        const timings = apiRes.data.data.timings;

        // 2. Get Saved Data from Server
        const historyRes = await getLogs(user.id);
        const serverLog = historyRes.data.find(log => log.date === today);

        // 3. Get Local Backup
        const localBackup = JSON.parse(localStorage.getItem(`tracker_${today}_${user.id}`)) || {};

        const mergedData = prayersList.map(name => {
          const apiTime = timings[name].match(/\d{2}:\d{2}/)[0];
          const savedFromDB = serverLog?.prayers?.find(p => p.name === name);
          const savedTime = savedFromDB?.observed || savedFromDB?.time || localBackup[name] || "";

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
  }, [user, location]); // Re-runs when location state changes

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
    setLocation({ city: locInput.city, country: locInput.country });
    setIsEditingLoc(false);
  };

  const handleSave = async () => {
    try {
      const today = getTodayString();
      const payload = {
        userId: user.id,
        date: today,
        prayers: trackerData.map(p => {
            const status = calculateRemark(p.actual, p.observed);
            const timeLabel = p.observed ? `(${format12h(p.observed)})` : "";
            return {
                name: p.name,
                actual: p.actual,
                observed: p.observed, 
                remark: p.observed ? `${status} ${timeLabel}` : p.remark
            }
        })
      };
      await saveLog(payload);
      alert("Journey updated successfully!");
    } catch (err) {
      alert("Save failed. Please check your connection.");
    }
  };

  if (loading) return <div className="loading-state">Syncing Journey...</div>;

  return (
    <div className="tracker-body">
      <header>
        <div className="logo-container"><img src={logo} alt="Logo" className="app-logo" /></div>
        <h2>Daily Tracker</h2>
        
        {/* --- TRAVEL/LOCATION SECTION --- */}
        <div className="location-pill">
          {!isEditingLoc ? (
            <div className="location-display" onClick={() => setIsEditingLoc(true)}>
              <span>📍 {location.city}, {location.country}</span>
              <button className="loc-edit-btn">Change</button>
            </div>
          ) : (
            <div className="location-form">
              <input 
                placeholder="City" 
                value={locInput.city} 
                onChange={(e) => setLocInput({...locInput, city: e.target.value})}
              />
              <input 
                placeholder="Country" 
                value={locInput.country} 
                onChange={(e) => setLocInput({...locInput, country: e.target.value})}
              />
              <button onClick={updateLocation} className="loc-save-btn">Update</button>
            </div>
          )}
        </div>
      </header>

      {trackerData.map((salah, index) => (
        <div key={salah.name} className="prayer-card">
          <div className="salah-info">
            <h4>{salah.name}</h4>
            <span className="azaan-time">Azaan: {salah.actual}</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <input 
              type="time" 
              className="time-input"
              value={salah.observed || ""} 
              onChange={(e) => handleTimeChange(index, e.target.value)}
            />
            <div className="remark-text">{salah.remark || "Pending"}</div>
          </div>
        </div>
      ))}
      <button className="save-btn" onClick={handleSave}>Save Progress</button>
    </div>
  );
};

export default Tracker;