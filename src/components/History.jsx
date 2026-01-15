import React, { useState, useEffect } from 'react';
import { getLogs } from '../api';
import logo from '../assets/logo.png';

const History = ({ user }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ excellent: 0, totalLogged: 0 });

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await getLogs(user.id);
        const data = Array.isArray(response.data) ? response.data : [];
        // Stable sort for date strings (Descending)
        const sorted = data.sort((a, b) => b.date.localeCompare(a.date));
        setLogs(sorted);
        calculateStats(sorted);
      } catch (err) {
        console.error("History fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user.id]);

  const calculateStats = (allLogs) => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    let excellentCount = 0;
    let prayersLogged = 0;

    allLogs.forEach(log => {
      const [year, month] = log.date.split('-').map(Number);
      
      if (month === currentMonth && year === currentYear) {
        log.prayers?.forEach(p => {
          if (p.remark && p.remark !== "--:--") {
            prayersLogged++;
            if (p.remark.includes('Excellent')) excellentCount++;
          }
        });
      }
    });
    setStats({ excellent: excellentCount, totalLogged: prayersLogged });
  };

  const handleShare = async () => {
    const monthName = new Date().toLocaleString('default', { month: 'long' });
    const shareText = `🌙 My Salah Journey Update (${monthName}):\n✨ ${stats.excellent} Excellent Prayers\n📊 ${stats.totalLogged} Total Logged\n\nTracking my progress on Salah Tracker!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Salah Journey Progress',
          text: shareText,
          url: window.location.origin,
        });
      } catch (err) {
        console.log('Share failed', err);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert("Progress copied to clipboard! 📋");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const renderBadgeContent = (remark) => {
    if (!remark || remark === "--:--" || remark === "Pending") return "--:--";
    if (remark.includes('(')) {
      const [status, time] = remark.split(' (');
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1.2' }}>
          <span style={{ fontWeight: '700', fontSize: '10px' }}>{status}</span>
          <span style={{ fontSize: '8px', opacity: '0.8', fontWeight: '500' }}>{`(${time}`}</span>
        </div>
      );
    }
    return remark;
  };

  if (loading) return <div className="loading-state">Loading Journey...</div>;

  return (
    <div className="history-wrapper">
      <header>
        <div className="logo-container">
          <img src={logo} alt="Logo" className="app-logo" />
        </div>
        <h2>Journey History</h2>
      </header>

      <div className="summary-card" style={{ margin: '0 16px 20px' }}>
        <div className="summary-header">
            <span style={{ color: 'var(--text-muted)' }}>This Month's Progress</span>
            <button className="share-pill-btn" onClick={handleShare}>
              Share ↗
            </button>
        </div>
        <div className="summary-stats">
          <div className="stat-box">
            <span className="stat-value">{stats.excellent}</span>
            <span className="stat-label">Excellent</span>
          </div>
          <div className="stat-box" style={{ borderLeft: '1px solid #f1f5f9' }}>
            <span className="stat-value">{stats.totalLogged}</span>
            <span className="stat-label">Total Logged</span>
          </div>
        </div>
      </div>
      
      <div className="history-list" style={{ paddingBottom: '40px' }}>
        {logs.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px 20px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>No history yet! ✨</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log._id || log.date} className="history-day-card" style={{ margin: '0 16px 12px' }}>
              <div className="history-date-header" style={{ borderBottom: '1px solid #f8fafc', paddingBottom: '8px', marginBottom: '12px', fontWeight: '700', color: 'var(--primary-dark)' }}>
                {formatDate(log.date)}
              </div>
              <div className="history-prayers-grid">
                {["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].map((pName) => {
                  const salah = log.prayers?.find(p => p.name === pName);
                  const remarkText = salah?.remark || "--:--";
                  
                  return (
                    <div key={pName} className="history-item">
                      <span className="history-salah-name" style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        {pName}
                      </span>
                      <div className={`history-status-badge ${
                        remarkText.includes('Excellent') || remarkText.includes('Good') || remarkText.includes('Very Good') 
                        ? 'badge-excellent' : remarkText !== '--:--' ? 'badge-good' : 'badge-empty'
                      }`} style={{ height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px' }}>
                        {renderBadgeContent(remarkText)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;