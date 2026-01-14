/* eslint-disable no-restricted-globals */

// 1. Force the service worker to activate immediately without waiting for a refresh
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// 2. Ensure the service worker controls the page immediately on activation
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// 3. Listener for messages from the Tracker.jsx component
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_AZAAN') {
    const { prayerTimes } = event.data;
    
    // Clear any existing timers if needed (browser handles overlapping setTimeouts usually)
    Object.entries(prayerTimes).forEach(([name, time]) => {
      scheduleNotification(name, time);
    });
  }
});

function scheduleNotification(prayerName, timeString) {
  // Convert "13:30" string to a real date object for today
  const [hours, minutes] = timeString.split(':').map(Number);
  const now = new Date();
  const targetTime = new Date(now);
  targetTime.setHours(hours, minutes, 0, 0);

  // Calculate the delay in milliseconds
  const delay = targetTime.getTime() - now.getTime();

  // If the prayer is in the future (today), set a timer
  if (delay > 0) {
    console.log(`Scheduling ${prayerName} for ${timeString} (in ${Math.round(delay/60000)} mins)`);
    
    setTimeout(() => {
      self.registration.showNotification('Salah Tracker', {
        body: `It's time for ${prayerName}. Assalamu Alaikum!`,
        icon: '/logo192.png', 
        badge: '/logo192.png',
        tag: prayerName, 
        requireInteraction: true 
      });
    }, delay);
  }
}

// Ensure the notification opens the app when clicked
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      // If the app is already open, just focus it
      if (clientList.length > 0) return clientList[0].focus();
      // Otherwise, open a new window
      return self.clients.openWindow('/');
    })
  );
});