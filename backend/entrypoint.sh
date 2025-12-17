#!/bin/sh

echo "--- RAILWAY DEPLOYMENT DEBUG ---"
echo "PORT variable: $PORT"
echo "--------------------------------"

echo "--> Collecting static files..."
python manage.py collectstatic --noinput || true

echo "--> Applying migrations..."
python manage.py migrate --noinput || true

echo "--> Starting server on port $PORT..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120 --access-logfile - --error-logfile -
