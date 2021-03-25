import admin from 'firebase-admin'
import axios from 'axios'
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      "project_id": "mask-track-72ee8",
      "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      "client_email": "firebase-adminsdk-lmt1c@mask-track-72ee8.iam.gserviceaccount.com",
    })
  })
}
const db = admin.firestore()
export default async (req, res) => {
  if (req.method === 'POST') {
    try {
      const { score, postcode, token } = req.body
      const userData = await admin.auth().verifyIdToken(req.headers.authorization)
      const captcha = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=6LdhBI0aAAAAAGQtMYg6dpySPgSvPM9pKUJisqjX&response=${token}`)
      if (!captcha.data.success) {
        return res.status(401).send({ message: 'unauthorized' })
      }
      const geocoding = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${postcode}.json?access_token=${process.env.NEXT_PUBLIC_mapboxKey}&country=th&types=postcode&language=th`)
      if (geocoding.data.features.length == 0) {
        return res.status(400).send({ message: 'postcode invalid' })
      }
      const latlng = geocoding.data.features[0]['center']
      const address = geocoding.data.features[0]['place_name']

      db.collection('app').doc('data').collection('survey').add({
        heat: Number(score) / 5,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        latlng: latlng,
        postcode: postcode,
        uid: userData.uid,
        address: address
      })
      console.log('done')
      res.status(200).send({ message: 'success' })
    }
    catch (err) {
      console.log(err)
      res.status(500).json({ message: 'server side error' })
    }
  }
}
