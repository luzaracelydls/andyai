FROM python:3.14-slim

# Logs sin buffer para que aparezcan de inmediato en Cloud Logging
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

# Cloud Run indica el puerto en la variable PORT
CMD exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}
