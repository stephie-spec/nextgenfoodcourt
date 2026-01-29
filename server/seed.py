from app import create_app
from extensions import db
from models import Owner
from werkzeug.security import generate_password_hash

app = create_app()

def seed_owners():
    print(" Seeding owners...")

    owners = [
        {
            "name": "Aliya Kysha",
            "email": "kysha@nextgen.com",
            "password": "password123"
        },
        {
            "name": "Jane Doe",
            "email": "jane@nextgen.com",
            "password": "password123"
        }
    ]

    for data in owners:
        existing = Owner.query.filter_by(email=data["email"]).first()
        if existing:
            print(f" Owner {data['email']} already exists, skipping...")
            continue

        owner = Owner(
            name=data["name"],
            email=data["email"],
            password_hashed=generate_password_hash(data["password"])
        )
        db.session.add(owner)

    db.session.commit()
    print(" Owners seeded successfully")


if __name__ == "__main__":
    with app.app_context():
        seed_owners()
