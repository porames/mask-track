import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import datetime
import json
import os

cred = credentials.Certificate({
  "type": "service_account",
  "project_id": "mask-track-72ee8",
  "private_key_id": "2d9c8906c7c8c72839c48d2acd3e21388426e1e8",
  "private_key": os.getenv('FIREBASE_PRIVATE_KEY'),
  "client_email": "firebase-adminsdk-lmt1c@mask-track-72ee8.iam.gserviceaccount.com",
  "client_id": "111191150103797745142",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-lmt1c%40mask-track-72ee8.iam.gserviceaccount.com"
})
print(cred)
firebase_admin.initialize_app(cred)

db = firestore.client()
timequery = datetime.datetime.now() - datetime.timedelta(days=7)
features = []

docs = db.collection('app').document('data').collection('survey').where('timestamp','>=',timequery).get()
for doc in docs:
    data=doc.to_dict()
    features.append({
      "type": "Feature",
      "properties": {
          "score": data['heat']
      },
      "geometry": {
        "type": "Point",
        "coordinates": data['latlng']
      }
    })

geojson = {
  "type": "FeatureCollection",
  "features": features
}   


f=open("exports/dataset.geojson","w")
f.write(json.dumps(geojson))
f.close()
