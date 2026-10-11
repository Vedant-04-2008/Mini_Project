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
