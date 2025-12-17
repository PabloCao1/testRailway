# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    default-libmysqlclient-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Make entrypoint executable
RUN chmod +x entrypoint.sh

# Expose port (documentary)
EXPOSE 8000

# Entrypoint script handles migrations
ENTRYPOINT ["/app/entrypoint.sh"]

# Default command: If PORT env var is set (Railway), run Gunicorn. Otherwise run dev server.
CMD sh -c "if [ -n '$PORT' ]; then gunicorn config.wsgi --bind 0.0.0.0:$PORT; else python manage.py runserver 0.0.0.0:8000; fi"
