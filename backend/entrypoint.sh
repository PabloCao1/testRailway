#!/bin/sh

echo "--- RAILWAY DEPLOYMENT DEBUG ---"
echo "PORT variable: $PORT"
echo "DATABASE_URL present: $([ -n "$DATABASE_URL" ] && echo 'YES' || echo 'NO')"
echo "Current directory: $(pwd)"
echo "Files in directory: $(ls -la)"
echo "--------------------------------"

echo "--> Collecting static files..."
python manage.py collectstatic --noinput || echo "⚠️ Error en collectstatic, continuando..."

echo "--> Intentando crear migraciones..."
python manage.py makemigrations --noinput || echo "⚠️ Error en makemigrations, continuando de todas formas..."

echo "--> Intentando aplicar migraciones..."
python manage.py migrate --noinput || echo "⚠️ Error en migrate, continuando de todas formas..."

echo "--> Iniciando servidor en puerto $PORT..."
exec "$@"
