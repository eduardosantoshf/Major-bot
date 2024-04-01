from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware

import subprocess

fast_api_tags_metadata = [
    {
        "name": "/api/chatroom",
        "description": "Endpoint to get complete chat name",
    },
    {
        "name": "/api/get_chat",
        "description": "Endpoint to get available chat",
    }
]



app = FastAPI(
    title="XMPP Chat Manager API",
    description="Create and manage chatrooms",
    contact={
        "name": "Major BETos Alert",
        "email": "majorbetosalert@ua.pt",
    },
    openapi_tags=fast_api_tags_metadata
)

origins = [
    "http://localhost",
    "http://localhost:8888",
    "http://backend",
    "https://backend",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

available_chats = []

@app.post("/api/chatroom",
    tags=["/api/chatroom"],
    summary="Returns chat name",
    description="Returns the complete name for access"
)
def create_chatroom(name: str):
    process = subprocess.Popen(["/home/ejabberd/bin/ejabberdctl", "create_room", name+".helpDesk", "conference.localhost", "localhost"] , stdout= subprocess.PIPE)
    output, error = process.communicate()
    print(error)
    name = name+".helpDesk" + "@conference.localhost"
    available_chats.append(name)
    return name

@app.get("/api/get_chat",
    tags=["/api/get_chat"],
    summary="Return available chat",
    description="From the available chats, returns one and rremoves it from the group"
)
def get_chat():
    if available_chats:
        return available_chats.pop()
    else:
        return ""

