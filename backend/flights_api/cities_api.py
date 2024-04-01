import requests
import json
import pprint

response = requests.get("http://api.aviationstack.com/v1/cities?access_key=e56d8837966a08b492ffd0146a8e130a")
response = response.json()

#pprint.pprint(response)

for n in range(100,9400,100):
    response2 = requests.get("http://api.aviationstack.com/v1/cities?access_key=e56d8837966a08b492ffd0146a8e130a&offset=" + str(n))
    response2 = response2.json()
    response['data'] += response2['data']

d = dict()
d['data'] = response['data']

with open('json_data.json', 'w') as outfile:
    json.dump(d, outfile, indent=4)