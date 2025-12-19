from django.db import migrations, models
import django.utils.timezone

def add_columns_if_missing(apps, schema_editor):
    connection = schema_editor.connection
    with connection.cursor() as cursor:
        # Check auditoria_institucion
        cursor.execute("SHOW COLUMNS FROM auditoria_institucion LIKE 'created_at'")
        if not cursor.fetchone():
            cursor.execute("ALTER TABLE auditoria_institucion ADD COLUMN created_at datetime(6) NOT NULL")
        
        cursor.execute("SHOW COLUMNS FROM auditoria_institucion LIKE 'updated_at'")
        if not cursor.fetchone():
            cursor.execute("ALTER TABLE auditoria_institucion ADD COLUMN updated_at datetime(6) NOT NULL")

        # Check auditoria_visitaauditoria
        cursor.execute("SHOW COLUMNS FROM auditoria_visitaauditoria LIKE 'created_at'")
        if not cursor.fetchone():
            cursor.execute("ALTER TABLE auditoria_visitaauditoria ADD COLUMN created_at datetime(6) NOT NULL")
            
        cursor.execute("SHOW COLUMNS FROM auditoria_visitaauditoria LIKE 'updated_at'")
        if not cursor.fetchone():
            cursor.execute("ALTER TABLE auditoria_visitaauditoria ADD COLUMN updated_at datetime(6) NOT NULL")

class Migration(migrations.Migration):

    dependencies = [
        ('auditoria', '0005_ingredienteplantilla_auditoria_i_plato_p_92feed_idx_and_more'),
    ]

    state_operations = [
        migrations.AddField(
            model_name='institucion',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='institucion',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AddField(
            model_name='visitaauditoria',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='visitaauditoria',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(add_columns_if_missing, reverse_code=migrations.RunPython.noop),
            ],
            state_operations=state_operations,
        ),
    ]
