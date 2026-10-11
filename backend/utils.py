from functools import wraps
from flask import request, jsonify, current_app
import jwt
from model import User

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Check for token in Authorization Header (Bearer format)
        if 'Authorization' in request.headers:
            parts = request.headers['Authorization'].split()
            if len(parts) == 2 and parts[0] == 'Bearer':
                token = parts[1]
                
        if not token:
            return jsonify({'message': 'Authentication Token is missing. Access Denied.'}), 401
            
        try:
            # Decode payload using the secure App Secret Key
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
            
            if not current_user:
                raise Exception("User not found in Database")
                
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired. Please log in again.'}), 401
        except Exception as e:
            return jsonify({'message': 'Invalid Authentication Token.'}), 401
            
        # Inject the current user into the route logic
        return f(current_user, *args, **kwargs)
        
    return decorated

