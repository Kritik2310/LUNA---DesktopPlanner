// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDdgZpDbuhazXi8luNwWMVpIX-Z6FI2RQA",
  authDomain: "luna-4836c.firebaseapp.com",
  projectId: "luna-4836c",
  storageBucket: "luna-4836c.firebasestorage.app",
  messagingSenderId: "342695934481",
  appId: "1:342695934481:web:143d664d572f9fbb26cfb0",
  measurementId: "G-T0X2V66YG6"
};

// Initialize Firebase
//initializeApp(firebaseConfig);
window.auth = firebase.auth();
window.db = firebase.firestore();