# ThinkTwice Hackathon's 2022 Finalist Project

## Major BOT

Major BOT is an IA/ML powered flight booking assistant that allows you to search available flights, given your geolocation and a destination of your choice. Besides, it can help you connect to a human assistant in case of need.

Our bot has the following features:
* High tolerance to human error
* High message throughput and low latency response
* Easily scalable
* Easily adaptable to other contexts

Our bot is built considering different services interactions, where our chatbot combines different external APIs and a chat service to provide a seamless costumer experience.

## Authors

This project was developed by our team, Major BETos Alert:
* **Eduardo Santos**: [eduardosantoshf](https://github.com/eduardosantoshf)
* **Pedro Bastos**: [bastos-01](https://github.com/bastos-01)
* **Rafael Teixeira**: [rgtzths](https://github.com/rgtzths)

## Architecture

![Major BOT Architecture](/images/majorBOT_architecture_diagram_tt.png)

## How to Run

To deploy Major BOT, run the following command:

`docker-compose up --build`

## Ports
Our chatbot has the following services running:
* Major BOT - http://localhost:8080
* Chatbot API - http://localhost:8001/docs
* Chatbot API Documentation - http://localhost:8001/docs
* Major Flights Alert API - http://localhost:5000
* Major Flights Alert API Documentation - http://localhost:5000/docs
* XMPP HTTP Service - http://localhost:5443 
* XMPP Chatroom API - http://localhost:8888
* XMPP Chatroom API Documentation - http://localhost:8888/docs

## ChatBOT API

This API can be found at **/backend/flights_api/flights_api.py**

### API Documentation

Our API documentation can be found at `http://127.0.0.1:8001/docs#/`.

![Major Flight Alert API](/images/chatBOT_api.png)

## Major Flights Alert API

This API can be found at **/backend/bot/chatbot.py** 

Our flights API uses two external APIs:
* [aviatiostack API](https://aviationstack.com/) - used to get real-time flights 
* [AirLabs Data API](https://airlabs.co/) - used to get nearby airports, given the user's location, this will allow us to recommend flights to the user interacting with the chatbot

### API Documentation

Our API documentation can be found at `http://127.0.0.1:5000/docs#/`.

![Major Flight Alert API](/images/major_flight_alert_api.png)

### API Unit Tests

Our flights API also has some unit tests, which can be found at **/backend/flights_api/flights_api_tests.py**

garante roobustez resiliência face aos serviços (apis) externas (vai consumir)

![Major Flight Alert API Unit Tests](/images/flights_api_test_code.png)

![Major Flight Alert API Unit Tests Results](/images/unit_tests.png)

## XMPP Chat Manager API

This API is used to create and manage XMPP chatrooms in the ejabbered server.

### API Documentation

Our API documentation can be found at `http://localhost:8888/docs#/`.

![XMPP Chat Manager API](/images/XMPP_documentation.png)

## Future Work

* Add range of possible flight dates;
* Usability tests with users;
* Improve intent heuristic selection;
* Improve some live chat features and interactions;
* Increase reliability using docker swarm;
* Integrate with a real booking system;
