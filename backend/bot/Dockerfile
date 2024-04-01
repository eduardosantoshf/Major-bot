FROM python:3.8-slim-buster

WORKDIR /app

COPY requirements.txt requirements.txt

RUN pip3 install -r requirements.txt

RUN python -m spacy download en_core_web_md

COPY . .

EXPOSE 8001

CMD python -m uvicorn chatbot:app --host 0.0.0.0 --port 8001

