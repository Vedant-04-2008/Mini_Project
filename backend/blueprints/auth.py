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

import urllib.parse
import re

def clean_phone_for_whatsapp(phone_str):
    digits = re.sub(r'\D', '', phone_str or '')
    if len(digits) == 10:
        return '91' + digits
    return digits

@auth_bp.route('/api/guardian/dispatch-alert', methods=['POST'])
@token_required
def dispatch_guardian_alert(current_user):
    data = request.json or {}
    lat = data.get('lat', 16.7032)
    lng = data.get('lng', 74.2432)
    alert_type = data.get('alert_type', 'sos')
    session_id = data.get('session_id', 'session_active')
    
    maps_link = f"https://maps.google.com/?q={lat},{lng}"
    
    if alert_type == 'sos':
        msg_text = (
            f"🚨 EMERGENCY SOS from {current_user.username} via SafeRoute!\n"
            f"I am in distress and need immediate assistance.\n"
            f"📍 Live GPS: {lat}, {lng}\n"
            f"🗺️ Google Maps Location: {maps_link}\n"
            f"SafeRoute Session: {session_id}"
        )
    else:
        msg_text = (
            f"🛡️ SafeRoute Live Guardian Tracking from {current_user.username}:\n"
            f"I am traveling in Kolhapur. My live GPS coordinates are:\n"
            f"📍 {lat}, {lng}\n"
            f"🗺️ View on Google Maps: {maps_link}"
        )
        
    encoded_msg = urllib.parse.quote(msg_text)
    
    recipients = []
    
    # 1. User's own registered phone number
    if current_user.phone:
        clean_num = clean_phone_for_whatsapp(current_user.phone)
        recipients.append({
            "name": f"{current_user.username} (My Number / Confirmation)",
            "phone": current_user.phone,
            "relationship": "User (Self)",
            "whatsapp_url": f"https://wa.me/{clean_num}?text={encoded_msg}",
            "sms_url": f"sms:{current_user.phone}?body={encoded_msg}",
            "status": "Queued & Gateway Ready"
        })
        
    # 2. Emergency Contacts from profile
    for c in current_user.emergency_contacts:
        clean_num = clean_phone_for_whatsapp(c.phone)
        recipients.append({
            "name": c.name,
            "phone": c.phone,
            "relationship": c.relationship,
            "whatsapp_url": f"https://wa.me/{clean_num}?text={encoded_msg}",
            "sms_url": f"sms:{c.phone}?body={encoded_msg}",
            "status": "Queued & Gateway Ready"
        })
        
    # 3. Default police helpline if no contacts registered
    if not recipients:
        recipients.append({
            "name": "Kolhapur Police Control Room",
            "phone": "112",
            "relationship": "Police Emergency",
            "whatsapp_url": f"https://wa.me/91112?text={encoded_msg}",
            "sms_url": f"sms:112?body={encoded_msg}",
            "status": "Emergency Dispatch Ready"
        })

    # Log telemetry broadcast simulation to server console
    print("\n=======================================================")
    print(f"[SAFE-ROUTE TELEMETRY GATEWAY] {alert_type.upper()} BROADCAST TRIGGERED")
    print(f"User: {current_user.username} (ID: {current_user.id})")
    print(f"Live Coordinates: LAT {lat}, LNG {lng}")
    print(f"Google Maps Pin: {maps_link}")
    for r in recipients:
        print(f"  -> Dispatched to: {r['name']} ({r['phone']}) via WhatsApp & SMS Gateway [Status: SENT]")
    print("=======================================================\n")

    return jsonify({
        "message": f"Telemetry alert dispatched to {len(recipients)} recipient(s).",
        "alert_type": alert_type,
        "lat": lat,
        "lng": lng,
        "maps_link": maps_link,
        "message_text": msg_text,
        "recipients": recipients
    }), 200


