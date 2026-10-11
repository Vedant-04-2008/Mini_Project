from extensions import db
from geoalchemy2 import Geometry
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='user') # e.g., 'user', 'admin', 'kmc_official'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Hazard(db.Model):
    __tablename__ = 'spatial_hazards'
    id = db.Column(db.Integer, primary_key=True)
    hazard_type = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=True)
    severity_score = db.Column(db.Float, default=1.0)
    
    location = db.Column(Geometry(geometry_type='POINT', srid=4326, spatial_index=True), nullable=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class CivicTicket(db.Model):
    __tablename__ = 'civic_tickets'
    id = db.Column(db.Integer, primary_key=True)
    issue_type = db.Column(db.String(50), nullable=False) # e.g., 'broken_streetlight', 'flooded_road'
    description = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default='pending') # pending, escalated, resolved
    
    # Spatial Column for Civic Issues
    location = db.Column(Geometry(geometry_type='POINT', srid=4326, spatial_index=True), nullable=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    escalated_at = db.Column(db.DateTime, nullable=True)
