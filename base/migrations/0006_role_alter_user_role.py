
import django.db.models.deletion
from django.db import migrations, models


def convert_user_roles(apps, schema_editor):
    Role = apps.get_model("base", "Role")
    User = apps.get_model("base", "User")

    db_alias = schema_editor.connection.alias

    user_role, _ = Role.objects.using(db_alias).get_or_create(
        name="USER",
        defaults={"description": "Regular user"}
    )

    root_admin_role, _ = Role.objects.using(db_alias).get_or_create(
        name="ROOT_ADMIN",
        defaults={"description": "Root administrator"}
    )

    # Existing values are still strings at this stage.
    User.objects.using(db_alias).filter(
        role="USER"
    ).update(role=user_role.pk)

    User.objects.using(db_alias).filter(
        role="ROOT_ADMIN"
    ).update(role=root_admin_role.pk)


class Migration(migrations.Migration):

    dependencies = [
        ("base", "0005_user_role"),
    ]

    operations = [
        # Create the Role table.
        migrations.CreateModel(
            name="Role",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "name",
                    models.CharField(
                        choices=[
                            ("USER", "User"),
                            ("ROOT_ADMIN", "Root Admin"),
                        ],
                        max_length=50,
                        unique=True,
                    ),
                ),
                ("description", models.TextField(blank=True, null=True)),
            ],
        ),

        # Convert old role values into Role IDs.
        # At this point, User.role is still a CharField.
        migrations.RunPython(
            convert_user_roles,
            migrations.RunPython.noop
        ),

        # Now change the field into a ForeignKey.
        migrations.AlterField(
            model_name="user",
            name="role",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="users",
                to="base.role",
            ),
        ),
    ]
