#!/bin/bash
set -e

echo "=========================================="
echo "INICIANDO SISTEMA DE AUDITORIA"
echo "=========================================="

export PYTHONPATH="/app:/app/src:${PYTHONPATH}"

if [ -n "$MYSQL_URL" ]; then
  eval "$(python - <<'EOF'
import os
from urllib.parse import urlparse

url = os.environ.get("MYSQL_URL")
parsed = urlparse(url) if url else None
if parsed:
    host = parsed.hostname or ""
    port = parsed.port or 3306
    user = parsed.username or ""
    password = parsed.password or ""
    name = (parsed.path or "").lstrip("/") or ""
    print(f'DB_HOST="{host}"')
    print(f'DB_PORT="{port}"')
    if user:
        print(f'DB_USER="{user}"')
    if password:
        print(f'DB_PASSWORD="{password}"')
    if name:
        print(f'DB_NAME="{name}"')
EOF
)"
fi

echo ""
echo "PASO 0: Verificando conexion a base de datos..."
python wait-for-db.py

echo ""
echo "PASO 1: Recolectando archivos estáticos..."
python manage.py collectstatic --noinput || true

echo ""
echo "PASO 2: Aplicando migraciones..."
python manage.py migrate --noinput

echo ""
echo "PASO 3: Creando superusuario por defecto (si no existe)..."
python manage.py shell <<'EOF'
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('   Superusuario creado: admin / admin123')
else:
    print('   Superusuario ya existe')
EOF

echo ""
echo "PASO 4: Iniciando servidor Gunicorn..."
PORT=${PORT:-8080}
exec gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120 --access-logfile - --error-logfile -
