from flask import Blueprint, request, jsonify, current_app
from model import User
from extensions import db
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    
    # Secure DB query
    user = User.query.filter_by(email=data.get('username')).first()
    
    # Cryptographic Password Verification
    if not user or not check_password_hash(user.password, data.get('password')):
        return jsonify({"message": "Invalid Email or password"}), 401
        
    # Generate strict JWT payload
    token = jwt.encode({
        'user_id': user.id,
        'role': user.role,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24) # 24 Hour Expiry
    }, current_app.config['SECRET_KEY'], algorithm="HS256")
    
    return jsonify({"message": "login_Done", "token": token}), 200

@auth_bp.route('/create-account', methods=['POST'])
def register():
    data = request.json
    
    # Check duplicate
    if User.query.filter_by(email=data.get('Email')).first():
        return jsonify({"message": "Email or Username Exists"}), 400
    
    # Hash password (pbkdf2:sha256 algorithm natively supported by Werkzeug)
    hashed_password = generate_password_hash(data.get('password'), method='pbkdf2:sha256')
    
    # Instantiate User via DB Session
    new_user = User(
        username=data.get('Username'),
        email=data.get('Email'),
        password=hashed_password
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({"message": "data_sent"}), 201

from utils import token_required
from model import EmergencyContact

@auth_bp.route('/api/user/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    return jsonify(current_user.to_dict()), 200

@auth_bp.route('/api/user/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    data = request.json or {}
    if 'phone' in data:
        current_user.phone = data['phone']
    if 'username' in data and data['username'].strip():
        current_user.username = data['username'].strip()
    db.session.commit()
    return jsonify({"message": "Profile updated successfully.", "user": current_user.to_dict()}), 200

@auth_bp.route('/api/user/emergency-contacts', methods=['POST'])
@token_required
def add_emergency_contact(current_user):
    data = request.json or {}
    name = (data.get('name') or '').strip()
    phone = (data.get('phone') or '').strip()
    relationship = (data.get('relationship') or 'Emergency Contact').strip()
    
    if not name or not phone:
        return jsonify({"message": "Contact name and phone number are required."}), 400
        
    contact = EmergencyContact(
        user_id=current_user.id,
        name=name,
        phone=phone,
        relationship=relationship
    )
    db.session.add(contact)
    db.session.commit()
    
    return jsonify({
        "message": "Emergency contact added successfully.",
        "contact": {
            "id": contact.id,
            "name": contact.name,
            "phone": contact.phone,
            "relationship": contact.relationship
        }
    }), 201

@auth_bp.route('/api/user/emergency-contacts/<int:contact_id>', methods=['DELETE'])
@token_required
def delete_emergency_contact(current_user, contact_id):
    contact = EmergencyContact.query.filter_by(id=contact_id, user_id=current_user.id).first()
    if not contact:
        return jsonify({"message": "Contact not found."}), 404
        
    db.session.delete(contact)
    db.session.commit()
    return jsonify({"message": "Emergency contact removed successfully."}), 200

