import firebase from 'firebase/app'
import "firebase/firestore"
import "firebase/auth"
import 'firebase/analytics'

const config = {
    apiKey: "AIzaSyDePFQ-LJ_VmIjdH1i9XDMI6mtDoLUAflI",
    authDomain: "mask-track-72ee8.firebaseapp.com",
    projectId: "mask-track-72ee8",
    storageBucket: "mask-track-72ee8.appspot.com",
    messagingSenderId: "805973824135",
    appId: "1:805973824135:web:4f138d28469a2a1164de22",
    measurementId: "G-BY7MZBBQ10"
}
if (!firebase.apps.length) {
    try {
        firebase.initializeApp(config)
        firebase.analytics()
    }
    catch (err) {
        console.log(err)
    }
}
export default firebase