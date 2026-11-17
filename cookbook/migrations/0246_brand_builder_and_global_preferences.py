from django.db import migrations, models


def apply_table_defaults(apps, schema_editor):
    UserPreference = apps.get_model('cookbook', 'UserPreference')
    UserPreference.objects.filter(default_unit='g').update(default_unit='cup')
    UserPreference.objects.filter(use_fractions=False).update(use_fractions=True)


class Migration(migrations.Migration):

    dependencies = [
        ('cookbook', '0245_userpreference_table_themes'),
    ]

    operations = [
        migrations.AddField(
            model_name='space',
            name='brand_color',
            field=models.CharField(blank=True, default='#ffffff', max_length=8),
        ),
        migrations.AddField(
            model_name='space',
            name='brand_font',
            field=models.CharField(blank=True, default='sans', max_length=24),
        ),
        migrations.AddField(
            model_name='space',
            name='brand_frame',
            field=models.CharField(blank=True, default='none', max_length=24),
        ),
        migrations.AddField(
            model_name='space',
            name='brand_layout',
            field=models.CharField(blank=True, default='left', max_length=24),
        ),
        migrations.AddField(
            model_name='userpreference',
            name='show_mealplan_on_start',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='userpreference',
            name='show_pantry',
            field=models.BooleanField(default=True),
        ),
        migrations.AlterField(
            model_name='userpreference',
            name='default_unit',
            field=models.CharField(default='cup', max_length=32),
        ),
        migrations.AlterField(
            model_name='userpreference',
            name='nav_bg_color',
            field=models.CharField(default='#1877f2', max_length=8),
        ),
        migrations.AlterField(
            model_name='userpreference',
            name='nav_text_color',
            field=models.CharField(choices=[('LIGHT', 'Light'), ('DARK', 'Dark')], default='LIGHT', max_length=16),
        ),
        migrations.AlterField(
            model_name='userpreference',
            name='use_fractions',
            field=models.BooleanField(default=True),
        ),
        migrations.RunPython(apply_table_defaults, migrations.RunPython.noop),
    ]
