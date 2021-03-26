import json
f=open('exports/dataset.json','r')
data=json.load(f)
db={}
i=0
for feature in data['features']:
    latlng=feature['geometry']['coordinates']    
    score = feature['properties']['score']
    latlng=str(latlng[0])+","+str(latlng[1])
    if(latlng not in db):
        db[latlng] = [score]
    else:
        db[latlng].append(score)
    i+=1
print(db)
f.close()