

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='room',
            name='custom_timer',
            field=models.IntegerField(default=20),
        ),
    ]
