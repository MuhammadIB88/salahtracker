/* eslint-disable no-restricted-globals */

// 1. Force immediate activation
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// 2. Take control of the page immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// 3. Listener for messages from Tracker.jsx
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_AZAAN') {
    const { prayerTimes } = event.data;
    
    Object.entries(prayerTimes).forEach(([name, time]) => {
      scheduleNotification(name, time);
    });
  }
});

function scheduleNotification(prayerName, timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  const now = new Date();
  let targetTime = new Date();
  targetTime.setHours(hours, minutes, 0, 0);

  // If the time has already passed today, schedule it for tomorrow
  if (targetTime <= now) {
    targetTime.setDate(targetTime.getDate() + 1);
  }

  const delay = targetTime.getTime() - now.getTime();

  console.log(`Scheduling ${prayerName} for ${targetTime.toLocaleString()} (in ${Math.round(delay/60000)} mins)`);
  
  setTimeout(() => {
    self.registration.showNotification('Salah Tracker', {
      body: `It's time for ${prayerName}. Assalamu Alaikum!`,
      icon: '/logo.png', 
      badge: '/logo.png',
      tag: prayerName, // Unique tag per prayer
      renotify: true, // Vibrate/Alert even if a previous notification is present
      requireInteraction: true, 
      vibrate: [200, 100, 200] // Custom vibration pattern for mobile
    });
  }, delay);
}

// 4. Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      if (clientList.length > 0) return clientList[0].focus();
      return self.clients.openWindow('/');
    })
  );
});