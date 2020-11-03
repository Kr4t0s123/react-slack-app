import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import 'firebase/storage'
var firebaseConfig = {
    apiKey: "AIzaSyDA9cD78gRCfEWfBvJLeuT1-lGFDtS4VNQ",
    authDomain: "react-slack-clone-9f944.firebaseapp.com",
    databaseURL: "https://react-slack-clone-9f944.firebaseio.com",
    projectId: "react-slack-clone-9f944",
    storageBucket: "react-slack-clone-9f944.appspot.com",
    messagingSenderId: "747950399262",
    appId: "1:747950399262:web:b0b91215f99d8cf00cf30f",
    measurementId: "G-VXPBBQKE0X"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);


  export default firebase