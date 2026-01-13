import React, { useState, useEffect } from 'react';
import './App.css'; // This connects your CSS file
import Signup from './components/Signup';
import Login from './components/Login';
import Tracker from './components/Tracker';
import History from './components/History';

function App() {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);
  const [view, setView] = useState('tracker');

  useEffect(() => {
    const savedUser = localStorage.getItem('profile');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser).user);
      } catch (e) {
        console.error("Error parsing user profile", e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('profile');
    setUser(null);
  };

  if (user) {
    return (
      <div className="App">
        <header>
          <h1>Salah Tracker</h1>
          <p>Assalamu Alaikum, <strong>{user.name}</strong>!</p>
          
          {/* NAVIGATION TABS */}
          <div className="nav-container">
            <button 
              className={`nav-btn ${view === 'tracker' ? 'active' : ''}`}
              onClick={() => setView('tracker')}
            >
              Daily Tracker
            </button>
            <button 
              className={`nav-btn ${view === 'history' ? 'active' : ''}`}
              onClick={() => setView('history')}
            >
              View History
            </button>
          </div>
        </header>

        <main style={{ padding: '20px' }}>
          <div style={{ marginBottom: '15px' }}>
            <small>Welcome</small> | 
            <button 
              onClick={handleLogout} 
              style={{ marginLeft: '10px', background: 'none', border: 'none', color: '#d32f2f', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Logout
            </button>
          </div>

          {/* VIEW TOGGLE */}
          {view === 'tracker' ? <Tracker user={user} /> : <History user={user} />}
        </main>
      </div>
    );
  }

  return (
    <div className="App" style={{ padding: '40px 20px' }}>
      <h1 style={{ color: '#2e7d32', textAlign: 'center' }}>Salah Tracker</h1>
      
      {showLogin ? <Login setUser={setUser} /> : <Signup />}
      
      <center>
        <button 
          onClick={() => setShowLogin(!showLogin)} 
          style={{ background: 'none', border: 'none', color: '#2e7d32', textDecoration: 'underline', cursor: 'pointer', marginTop: '15px' }}
        >
          {showLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
        </button>
      </center>
    </div>
  );
}

export default App;