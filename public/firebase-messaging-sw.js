importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

firebase.initializeApp({
  apiKey: "AIzaSyDsbP7-xXaGnHz7FnrdpPjz6mrN00SnJhc",
  authDomain: "salah-tracker-df3b2.firebaseapp.com",
  projectId: "salah-tracker-df3b2",
  storageBucket: "salah-tracker-df3b2.firebasestorage.app",
  messagingSenderId: "167141553767",
  appId: "1:167141553767:web:a95009d1c4e93a87cac6c2"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Background message received: ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});