#!/bin/bash

echo "--> Intentando crear migraciones..."
python manage.py makemigrations || echo "⚠️ Error en makemigrations, continuando de todas formas..."

echo "--> Intentando aplicar migraciones..."
python manage.py migrate || echo "⚠️ Error en migrate, continuando de todas formas..."

echo "--> Iniciando servidor Django..."
exec python manage.py runserver 0.0.0.0:8000
