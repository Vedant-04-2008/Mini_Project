import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'super-secret-safe-route-key'
    
    # Connect to the Docker MySQL container by default
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'mysql+pymysql://saferoute_user:saferoute_password@localhost:3306/saferoute_db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # # Redis & Celery Config mapping to the Docker Redis container
    # REDIS_URL = os.environ.get('REDIS_URL') or 'redis://localhost:6379/0'
    # CELERY_BROKER_URL = REDIS_URL
    # CELERY_RESULT_BACKEND = REDIS_URL

