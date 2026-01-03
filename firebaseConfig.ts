
/**
 * Firebase Configuration
 * Update these values with your Firebase Project settings.
 */
export const firebaseConfig = {
  apiKey: "AIzaSy...", // Replace with your API Key
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

export const initializeFirebase = () => {
  if (typeof window !== 'undefined' && (window as any).firebase) {
    const firebase = (window as any).firebase;
    // Check if Firebase is already initialized
    if (!firebase.apps.length) {
      // Only initialize if the project ID has been changed from the default placeholder
      if (firebaseConfig.projectId && firebaseConfig.projectId !== "your-project-id") {
        try {
          firebase.initializeApp(firebaseConfig);
          console.log("shopyZ: Firebase connected successfully.");
        } catch (error) {
          console.error("shopyZ: Firebase initialization failed", error);
        }
      } else {
        console.info("shopyZ: Using Local Storage (Firebase config not yet provided).");
      }
    }
  }
};
