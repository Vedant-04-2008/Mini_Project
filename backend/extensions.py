from flask_sqlalchemy import SQLAlchemy
from celery import Celery
from flask_socketio import SocketIO

db = SQLAlchemy()
celery = Celery(__name__)

# Enable CORS for the frontend Vite server
socketio = SocketIO(cors_allowed_origins="*")
