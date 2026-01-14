import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// --- SERVICE WORKER REGISTRATION ---
// This enables background Azaan notifications for your Vite app
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((reg) => {
        console.log('Azaan Service Worker Registered!', reg.scope);
      })
      .catch((err) => {
        console.error('Service Worker Registration Failed:', err);
      });
  });
}