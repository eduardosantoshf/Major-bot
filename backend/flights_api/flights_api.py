import requests
import json
import pprint
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import sys

fast_api_tags_metadata = [
    {
        "name": "getFlights",
        "description": "Endpoint to book flights",
    },
    {
        "name": "getNearestAirport",
        "description": "Endpoint to get nearest airport",
    }
]

app = FastAPI(
    title="Major Flight Alert API",
    description="API to book flights",
    contact={
        "name": "Major BETos Alert",
        "email": "majorbetosalert@ua.pt",
    },
    openapi_tags=fast_api_tags_metadata
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# dummy accounts, doesn't need encryption
FLIGHTS_ACCESS_KEY = "3b80ff862edee1bb60ef7f5f7b8f5b12"
AIRPORTS_ACCESS_KEY = "a1620c14-9896-490f-8334-097dd1c6465a"

with open('parsed_cities.json') as json_file:
    cities = json.load(json_file)

parsed_cities = cities['data']

@app.get("/getFlights",
    tags=["getFlights"],
    summary="Get flights",
    description="Get flights given departure and arrival cities and flight date (optional)"
)
async def get_flights(dep_city: str, arr_city: str, flight_date: Optional[str] = None):

    dep_city_iata = ""
    arr_city_iata = ""

    dep_city_found = 0
    arr_city_found = 0
    
    for city in parsed_cities:
        if city['city_name'].lower() == dep_city.lower():
            dep_city_iata = city['iata_code']
            dep_city_found = 1

        if city['city_name'].lower() == arr_city.lower():
            arr_city_iata = city['iata_code']
            arr_city_found = 1
        
    if dep_city_found == 0 or arr_city_found == 0:
        raise HTTPException(status_code=404, detail="City not found")

    #print(dep_city_iata, file=sys.stderr)
    #print(arr_city_iata, file=sys.stderr)
    #print(flight_date, file=sys.stderr)

    if flight_date != None:
        response = requests.get("http://api.aviationstack.com/v1/flights?access_key=" + FLIGHTS_ACCESS_KEY + "&dep_iata=" + dep_city_iata + "&arr_iata=" + arr_city_iata + "&flight_date=" + flight_date)
        return response.json()
    
    response = requests.get("http://api.aviationstack.com/v1/flights?access_key=" + FLIGHTS_ACCESS_KEY + "&dep_iata=" + dep_city_iata + "&arr_iata=" + arr_city_iata)
    return response.json()
    

@app.get("/getNearestAirport",
    tags=["getNearestAirport"],
    summary="Get nearest airport",
    description="Get nearest airport given user's geolocation"
)
async def get_nearest_airport(lat: str, lon: str):
    accepted_airports = {"LPPR": "Porto", "LPPT": "Lisbon"} # [Porto, Lisboa]
    common_airports = []

    nearby_airports = requests.get("https://airlabs.co/api/v9/nearby?lat=" + lat + "&lng=" + lon + "&distance=400&api_key=" + AIRPORTS_ACCESS_KEY).json()

    common_airports = [airport['icao_code'] for airport in nearby_airports['response']['airports'] if airport['icao_code'] in accepted_airports.keys()] # get iata code of accepted (close) airports

    accepted_cities = [accepted_airports[icao_code] for icao_code in common_airports]

    if accepted_cities == []:
        raise HTTPException(status_code=404, detail="No cities found")

    return accepted_cities