FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    pkg-config \
    default-libmysqlclient-dev \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PYTHONPATH=/app/src

# Dar permisos de ejecución al entrypoint
RUN chmod +x entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["./entrypoint.sh"]