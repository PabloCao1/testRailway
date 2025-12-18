#!/bin/bash
set -e

echo "=========================================="
echo "INICIANDO SISTEMA DE AUDITORIA"
echo "=========================================="

# PASO 1: Esperar a que la base de datos este lista
echo ""
echo "PASO 1: Verificando conexion a base de datos..."
python wait-for-db.py

# PASO 2: Aplicar migraciones existentes
echo ""
echo "PASO 2: Aplicando migraciones existentes..."
python manage.py migrate --noinput

# PASO 3: Crear nuevas migraciones si hay cambios
echo ""
echo "PASO 3: Detectando cambios en modelos..."
python manage.py makemigrations --noinput

# PASO 4: Aplicar las nuevas migraciones
echo ""
echo "PASO 4: Aplicando nuevas migraciones..."
python manage.py migrate --noinput

# PASO 5: Cargar fixtures (datos iniciales)
echo ""
echo "PASO 5: Cargando datos iniciales..."

# Verificar si ya hay datos
ALIMENTOS_COUNT=$(python manage.py shell -c "from nutricion.models import AlimentoNutricional; print(AlimentoNutricional.objects.count())" 2>/dev/null || echo "0")

if [ "$ALIMENTOS_COUNT" = "0" ]; then
    echo "   No hay alimentos. Cargando fixtures..."
    
    if [ -f "/app/fixtures/alimentos_inicial.json" ]; then
        python manage.py loaddata /app/fixtures/alimentos_inicial.json
        echo "   Datos cargados correctamente"
    else
        echo "   ADVERTENCIA: No se encontro el archivo de fixtures"
    fi
else
    echo "   Ya hay $ALIMENTOS_COUNT alimentos. Omitiendo carga."
fi

# PASO 6: Crear superusuario si no existe
echo ""
echo "PASO 6: Verificando superusuario..."

python manage.py shell <<EOF
from django.contrib.auth import get_user_model
User = get_user_model()

if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser(
        username='admin',
        email='admin@auditoria.gob.ar',
        password='admin123'
    )
    print('   Superusuario creado: admin / admin123')
else:
    print('   Superusuario ya existe')
EOF

# PASO 7: Iniciar servidor
echo ""
PORT=${PORT:-8080}
echo "=========================================="
echo "SISTEMA LISTO"
echo "=========================================="
echo "Backend: http://localhost:$PORT"
echo "Admin: http://localhost:$PORT/admin"
echo "Usuario: admin / admin123"
echo "=========================================="
echo ""

exec python manage.py runserver 0.0.0.0:$PORT
