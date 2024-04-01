import json
import pprint

with open('all_cities.json') as json_file:
    cities = json.load(json_file)['data']

parsed_cities = []

for city in cities:
    d = dict()

    d['city_name'] = city['city_name']
    d['iata_code'] = city['iata_code']

    parsed_cities.append(d)

#print(parsed_cities)

d = dict()
d['data'] = parsed_cities

#pprint.pprint(d)

with open('parsed_cities.json', 'w') as outfile:
    json.dump(d, outfile, indent=4)