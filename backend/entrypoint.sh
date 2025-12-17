#!/bin/sh

echo "--> Intentando crear migraciones..."
python manage.py makemigrations --noinput || echo "⚠️ Error en makemigrations, continuando de todas formas..."

echo "--> Intentando aplicar migraciones..."
python manage.py migrate --noinput || echo "⚠️ Error en migrate, continuando de todas formas..."

echo "--> Iniciando servidor..."
exec "$@"
