from django.db import migrations, models


THEMES = [
    ('SOCIAL', 'Social'),
    ('TABLE', 'Table'),
    ('ROSE', 'Rosewater'),
    ('PEACH', 'Peach Fizz'),
    ('LEMON', 'Lemon Cream'),
    ('MINT', 'Mint Leaf'),
    ('SKY', 'Sky Wash'),
    ('LAVENDER', 'Lavender Milk'),
    ('BLUSH', 'Blush Clay'),
    ('SAGE', 'Soft Sage'),
    ('BUTTER', 'Buttercream'),
    ('POWDER', 'Powder Blue'),
    ('LILAC', 'Lilac'),
    ('SAND', 'Sandstone'),
    ('GREY', 'Grey'),
    ('TABLE_DARK', 'Table Night'),
    ('TANDOOR', 'Table (legacy)'),
    ('BOOTSTRAP', 'Bootstrap'),
    ('DARKLY', 'Darkly'),
    ('FLATLY', 'Flatly'),
    ('SUPERHERO', 'Superhero'),
    ('TANDOOR_DARK', 'Table Dark (INCOMPLETE)'),
]


def move_legacy_defaults_to_social(apps, schema_editor):
    UserPreference = apps.get_model('cookbook', 'UserPreference')

    UserPreference.objects.filter(theme__in=['TANDOOR', 'BOOTSTRAP', 'FLATLY']).update(theme='SOCIAL')
    UserPreference.objects.filter(theme__in=['TANDOOR_DARK', 'DARKLY', 'SUPERHERO']).update(theme='TABLE_DARK')
    UserPreference.objects.filter(theme='SOCIAL', nav_bg_color='#ddbf86').update(nav_bg_color='#1877f2', nav_text_color='LIGHT')


class Migration(migrations.Migration):

    dependencies = [
        ('cookbook', '0244_space_brand_mark'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userpreference',
            name='theme',
            field=models.CharField(choices=THEMES, default='SOCIAL', max_length=128),
        ),
        migrations.RunPython(move_legacy_defaults_to_social, migrations.RunPython.noop),
    ]
