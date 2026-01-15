import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDsbP7-xXaGnHz7FnrdpPjz6mrN00SnJhc",
  authDomain: "salah-tracker-df3b2.firebaseapp.com",
  projectId: "salah-tracker-df3b2",
  storageBucket: "salah-tracker-df3b2.firebasestorage.app",
  messagingSenderId: "167141553767",
  appId: "1:167141553767:web:a95009d1c4e93a87cac6c2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

// This function asks for permission and gets the device token
export const requestForToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: "BKLSGg9bW4jWBIXATEvvL0TFTO5UsI_CAgLlcJ_2RZPWCap2daHM8p4RJNsGExa3W699Bh-GSIc45Ok_yROmHys" 
      });
      if (token) {
        console.log("FCM Token Generated:", token);
        // We will send this token to your backend later
        return token;
      }
    } else {
      console.log("Notification permission denied");
    }
  } catch (error) {
    console.error("Error getting token:", error);
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });