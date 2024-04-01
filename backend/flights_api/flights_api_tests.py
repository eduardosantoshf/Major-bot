from fastapi.testclient import TestClient
from flights_api import app
import json

client = TestClient(app)

response = client.get("/getFlights", params={"dep_city": "porto", "arr_city": "frankfurt"})

def test_get_flights():
    with open('get_flights_api_response.json') as json_file:
        f = json.load(json_file)

        assert response.status_code == 200
        assert sorted(response.json().items())[0:10] == sorted(f.items())[0:10]
    
def test_get_nearest_airport():
    r = [
        "Porto",
        "Lisbon"
    ]

    response = client.get("/getNearestAirport", params={"lat": "40.62613706602988", "lon": "-8.660634835740018"})
    
    assert response.status_code == 200
    assert [x.replace('"', '') for x in response.text.replace('[', '').replace(']', '').split(',')] == r