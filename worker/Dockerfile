FROM python:3.8

WORKDIR /app

COPY ./worker/requirements.txt .
RUN pip install -r requirements.txt

COPY ./worker/worker.py .
COPY ./src .
COPY ./.env .

ENTRYPOINT rq worker --url redis://cache:6379/0
