import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import datetime
import json
import os
from dotenv import load_dotenv, find_dotenv
import requests

if(find_dotenv()!=''):
  load_dotenv(find_dotenv())

cred = credentials.Certificate({
  "type": "service_account",
  "project_id": "mask-track-72ee8",
  "private_key_id": "2d9c8906c7c8c72839c48d2acd3e21388426e1e8",
  "private_key": os.getenv('FIREBASE_PRIVATE_KEY').replace('\\n', '\n').replace('\\\\n', '\\n'),
  "client_email": "firebase-adminsdk-lmt1c@mask-track-72ee8.iam.gserviceaccount.com",
  "client_id": "111191150103797745142",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-lmt1c%40mask-track-72ee8.iam.gserviceaccount.com"
})

firebase_admin.initialize_app(cred)

db = firestore.client()
timequery = datetime.datetime.now() - datetime.timedelta(days=7)
features = []

docs = db.collection('app').document('data').collection('survey').where('timestamp','>=',timequery).get()
print(len(docs))
for doc in docs:
    data=doc.to_dict()
    if("address" not in data):
      r=requests.get("https://api.mapbox.com/geocoding/v5/mapbox.places/"+str(data['latlng'][0])+","+str(data['latlng'][1])+".json?access_token="+str(os.getenv('mapboxKey'))+"&country=th&types=postcode&language=th")
      postcode=r.json()['features'][0]["text"]
      address=r.json()['features'][0]["place_name"]      
      db.collection('app').document('data').collection('survey').document(doc.id).set({
        'address': address,
        'postcode': postcode
      },merge=True)
      print(doc.id)
      
    features.append({
      "type": "Feature",
      "properties": {
          "score": data['heat'],
          "address": data['address'],
          "postcode": data["postcode"]
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
