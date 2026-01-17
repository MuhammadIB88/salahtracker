import React, { useState, useEffect } from 'react';
import './App.css'; 
import Signup from './components/Signup';
import Login from './components/Login';
import Tracker from './components/Tracker';
import History from './components/History';

function App() {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);
  const [view, setView] = useState('tracker');
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('profile');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        // This handles both the old format and the new format with 'city'
        setUser(userData.user || userData); 
      } catch (e) {
        console.error("Error parsing user profile", e);
      }
    }
    setIsAppLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('profile');
    localStorage.removeItem('token'); 
    setUser(null);
  };

  if (isAppLoading) return <div className="loading-state">Starting Salah Tracker...</div>;

  if (user) {
    return (
      <div className="App">
        <header>
          <h1>Salah Tracker</h1>
          <p>Assalamu Alaikum, <strong>{user.name}</strong>!</p>
          <div className="nav-container">
            <button className={`nav-btn ${view === 'tracker' ? 'active' : ''}`} onClick={() => setView('tracker')}>
              Daily Tracker
            </button>
            <button className={`nav-btn ${view === 'history' ? 'active' : ''}`} onClick={() => setView('history')}>
              View History
            </button>
          </div>
        </header>

        <main style={{ padding: '20px' }}>
          <div style={{ marginBottom: '15px' }}>
            <small>Session: Active</small> | 
            <button onClick={handleLogout} style={{ marginLeft: '10px', background: 'none', border: 'none', color: '#d32f2f', cursor: 'pointer', textDecoration: 'underline' }}>
              Logout
            </button>
          </div>
          {view === 'tracker' ? <Tracker user={user} /> : <History user={user} />}
        </main>
      </div>
    );
  }

  // --- AUTH SECTION ---
  return (
    <div className="App" style={{ padding: '20px 20px' }}>
      <h1 style={{ color: '#2e7d32', textAlign: 'center', marginBottom: '10px' }}>Salah Tracker</h1>
      
      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        {/* We pass setUser to both Login and Signup now */}
        {showLogin ? (
          <Login setUser={setUser} />
        ) : (
          <Signup setUser={setUser} />
        )}
        
        <p style={{ textAlign: 'center', fontSize: '14px', color: '#888', marginTop: '15px' }}>
          {showLogin ? "Don't have an account? " : "Already have an account? "}
          <span 
            onClick={() => setShowLogin(!showLogin)} 
            style={{ color: '#4CAF50', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {showLogin ? "Sign Up" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
}

export default App;