import json
from collections import Counter
import statistics
f=open('exports/dataset.json','r')
data=json.load(f)
db={}
provinces=[]
i=0
features=[]
for feature in data['features']:
    latlng=feature['geometry']['coordinates']    
    score = feature['properties']['score']
    province = feature['properties']['address'].split(", ")[-2]
    provinces.append(province)
    address = feature['properties']['address']
    postcode = feature['properties']['postcode']
    latlng=str(latlng[0])+","+str(latlng[1])
    if(latlng not in db):
        db[latlng] = {'score': [score]}
        db[latlng]['province'] = province
        db[latlng]['postcode'] = postcode
        db[latlng]['address'] = address
    else:
        db[latlng]['score'].append(score)
    i+=1
allScores=[]
for province in db:
  allScores.extend(db[province]['score'])
  features.append({
    "type": "Feature",
    "properties": {
        "scores": db[province]['score'],          
        "score-avg": statistics.mean(db[province]['score']),
        "province": db[province]['province'],
        "postcode": db[province]["postcode"],
        "address": db[province]["address"],
    },
    "geometry": {
      "type": "Point",
      "coordinates": [float(province.split(',')[0]),float(province.split(',')[1])]
    }
  })
geojson = {
  "type": "FeatureCollection",
  "features": features
} 
f.close()
print(Counter(allScores))
#f=open("exports/dataset-exported.json","w")
#f.write(json.dumps(geojson))
#f.close()
