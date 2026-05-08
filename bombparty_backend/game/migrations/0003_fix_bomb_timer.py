from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('game', '0002_room_custom_timer'),
    ]

    operations = [
        migrations.RunSQL(
            "ALTER TABLE game_room ALTER COLUMN bomb_timer SET DEFAULT 20;",
            reverse_sql="ALTER TABLE game_room ALTER COLUMN bomb_timer DROP DEFAULT;"
        ),
        migrations.RunSQL(
            "UPDATE game_room SET bomb_timer = 20 WHERE bomb_timer IS NULL;",
            reverse_sql="SELECT 1;"
        ),
    ]