/* eslint-disable no-restricted-globals */

// This listener waits for a message from your Tracker component
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_AZAAN') {
    const { prayerTimes } = event.data;
    
    // We loop through each prayer (Fajr, Dhuhr, etc.)
    Object.entries(prayerTimes).forEach(([name, time]) => {
      scheduleNotification(name, time);
    });
  }
});

function scheduleNotification(prayerName, timeString) {
  // 1. Convert "13:30" string to a real date object for today
  const [hours, minutes] = timeString.split(':').map(Number);
  const now = new Date();
  const targetTime = new Date();
  targetTime.setHours(hours, minutes, 0, 0);

  // 2. Calculate the delay in milliseconds
  const delay = targetTime.getTime() - now.getTime();

  // 3. If the prayer is still in the future, set a timer
  if (delay > 0) {
    console.log(`Scheduling ${prayerName} in ${Math.round(delay/60000)} minutes`);
    
    setTimeout(() => {
      self.registration.showNotification('Salah Tracker', {
        body: `It's time for ${prayerName}. Assalamu Alaikum!`,
        icon: '/logo192.png', // Ensure this exists in your public folder
        badge: '/logo192.png',
        tag: prayerName, // Prevents duplicate notifications
        requireInteraction: true // Keeps notification visible until clicked
      });
    }, delay);
  }
}

// Ensure the notification opens the app when clicked
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      if (clientList.length > 0) return clientList[0].focus();
      return self.clients.openWindow('/');
    })
  );
});