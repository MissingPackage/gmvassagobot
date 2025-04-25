from app.db import SessionLocal
from app.models.user import User

db = SessionLocal()
user = User(name="Cristiano Mazzella", email="cristiano.mazzella@gmail.com", phone="393383231742")
db.add(user)
db.commit()
db.close()