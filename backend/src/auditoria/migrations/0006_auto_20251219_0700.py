from django.db import migrations, models
import django.utils.timezone

class Migration(migrations.Migration):

    dependencies = [
        ('auditoria', '0005_ingredienteplantilla_auditoria_i_plato_p_92feed_idx_and_more'),
    ]

    operations = [
        # Institucion
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
        # VisitaAuditoria
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
