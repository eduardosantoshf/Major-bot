FROM python:3.8-slim-buster

WORKDIR /code

COPY requirements.txt requirements.txt

RUN pip install --no-cache-dir --upgrade -r requirements.txt

COPY . .

CMD ["uvicorn", "flights_api:app", "--host", "0.0.0.0"]