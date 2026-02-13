import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "sauti-yangu-siri-yangu") # Added by JB for Auth JWT purposes
    SQLALCHEMY_DATABASE_URI = ("postgresql+psycopg2://otiende:12345678@localhost:5432/nextgen_food_court_db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

