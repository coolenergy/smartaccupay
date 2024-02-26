FROM tiangolo/uvicorn-gunicorn-fastapi:python3.8

WORKDIR /app

COPY ./api/requirements.txt .
RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

COPY ./api/main.py .
COPY ./src .
COPY ./.env .
COPY ./worker/worker.py .

# ENTRYPOINT gunicorn main:app -w 2 --threads 2 -b 0.0.0.0:8000
ENTRYPOINT gunicorn -k uvicorn.workers.UvicornWorker --bind "0.0.0.0:8000" --log-level debug main:app
