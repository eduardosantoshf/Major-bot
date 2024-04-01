import json
import random
import spacy
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

class Opinion(BaseModel):
    score: int
    conversation: list

origins = [
    "http://localhost",
    "http://localhost:8001",
    "http://backend",
    "https://backend",
    "*"
]

nlp = spacy.load("en_core_web_md")

intents = json.load(open('intents.json'))

for intent in intents:
    if intent != "noanswer":
        processed_intents = []

        for pattern in intents[intent]["patterns"]:
            processed_intents.append(nlp(pattern))

        intents[intent]["patterns"] = processed_intents

affirmations = json.load(open('affirmations.json'))

for affirmation in affirmations:
    processed_affirmation = []

    for pattern in affirmations[affirmation]["patterns"]:
        processed_affirmation.append(nlp(pattern))

    affirmations[affirmation]["patterns"] = processed_affirmation

fast_api_tags_metadata = [
    {
        "name": "query_chatbot",
        "description": "Endpoint to query chatbot and answer user",
    },
    {
        "name": "find_destination",
        "description": "Endpoint to find user's destination",
    },
    {
        "name": "sentiment_analysis",
        "description": "Endpoint to retrieve user's sentiment",
    },
    {
        "name": "store_feedback",
        "description": "Endpoint to store user's feedback",
    },
    {
        "name": "get_feedback",
        "description": "Endpoint to get previously given user's feedback",
    }
]

app = FastAPI(
    title="ChatBOT API",
    description="Chatbot API",
    contact={
        "name": "Major BETos Alert",
        "email": "majorbetosalert@ua.pt",
    },
    openapi_tags=fast_api_tags_metadata)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

feedback = json.load(open('feedback.json'))

@app.get("/query_chatbot/",
    tags=["query_chatbot"],
    summary="Query chatbot",
    description="Chatbot receives a query from a user and returns its intent and an answer"
)
async def query_chatbot(statement: str):

    statement = nlp(statement)

    target_intent = None
    max_sim = 0

    for intent in intents:
        for pattern in intents[intent]["patterns"]:
            sim = statement.similarity(pattern)
            if sim > max_sim:
                max_sim = sim
                target_intent = intent

    if max_sim > 0.7:
        return random.choice(intents[target_intent]["responses"]), target_intent
    else:
        return random.choice(intents["noanswer"]["responses"]), "noanswer"

@app.get("/find_destination/",
    tags=["find_destination"],
    summary="Find user's destination",
    description="Given a statement, the chatbot returns a city as a geopolitical entity"
)
async def find_destination(statement: str):
    statement = nlp(statement)

    city = None
    
    for ent in statement.ents:
      if ent.label_ == "GPE": # GeoPolitical Entity
        city = ent.text

    if city == None:
        return random.choice(intents["noanswer"]["responses"]), "noanswer"
    else:
        return city, "success"

@app.get("/sentiment_analysis/",
    tags=["sentiment_analysis"],
    summary="Assume user's sentiment",
    description="Given a statement, assumes user's sentiment (positive/negative)"
)
async def analyse_sentiment(statement: str):
    statement = nlp(statement)

    target_affirmation = None
    max_sim = 0

    for affirmation in affirmations:
        for pattern in affirmations[affirmation]["patterns"]:
            sim = statement.similarity(pattern)
            if sim > max_sim:
                max_sim = sim
                target_affirmation = affirmation

    if max_sim > 0.7:
        return target_affirmation
    else:
        return random.choice(intents["noanswer"]["responses"]), "noanswer"


@app.post("/store_feedback/",
    tags=["store_feedback"],
    summary="Store user's feedback",
    description="Store user's feedback"
)
async def store_feedback(opinion: Opinion):

    feedback["reviews"].append({"score": opinion.score, "conversation" : opinion.conversation})

    json.dump(feedback, open("feedback.json", "w"))

    return True

@app.get("/get_feedback",
    tags=["get_feedback"],
    summary="Give user's feedback",
    description="Returns user's feedback"
)
async def get_feedback():
    return feedback