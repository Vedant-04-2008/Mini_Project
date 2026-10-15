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
    phone = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'phone': self.phone or '',
            'created_at': self.created_at.strftime("%d %b %Y") if self.created_at else "Member",
            'emergency_contacts': [
                {
                    'id': c.id,
                    'name': c.name,
                    'phone': c.phone,
                    'relationship': c.relationship
                } for c in getattr(self, 'emergency_contacts', [])
            ]
        }

class EmergencyContact(db.Model):
    __tablename__ = 'emergency_contacts'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(25), nullable=False)
    relationship = db.Column(db.String(50), default='Emergency Contact')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('emergency_contacts', lazy=True, cascade='all, delete-orphan'))

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
