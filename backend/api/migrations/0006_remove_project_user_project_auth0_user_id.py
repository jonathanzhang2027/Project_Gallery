# Generated by Django 5.0.3 on 2024-08-15 13:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_delete_testproject'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='project',
            name='user',
        ),
        migrations.AddField(
            model_name='project',
            name='auth0_user_id',
            field=models.CharField(default='temp_user', max_length=255),
        ),
    ]