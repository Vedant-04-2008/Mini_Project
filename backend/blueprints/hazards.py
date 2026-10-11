from flask import Blueprint, request, jsonify
from model import Hazard
from extensions import db
from sqlalchemy import text

hazards_bp = Blueprint('hazards', __name__)

@hazards_bp.route('', methods=['GET'])
def get_hazards():
    # Use MySQL ST_X and ST_Y to extract coordinates directly, avoiding Python Shapely dependency
    query = text("""
        SELECT id, hazard_type, description, severity_score, 
               ST_Y(location) AS lat, ST_X(location) AS lng 
        FROM spatial_hazards
    """)
    
    # execute query
    hazards = db.session.execute(query).fetchall()
    
    results = []
    for h in hazards:
        results.append({
            "id": h[0],
            "type": h[1],
            "description": h[2],
            "severity_score": h[3],
            "lat": h[4],
            "lng": h[5]
        })
    return jsonify(results), 200

from utils import token_required

@hazards_bp.route('', methods=['POST'])
@token_required
def report_hazard(current_user):
    data = request.json
    # Convert lat/lng to WKT geometry (POINT(lng lat))
    geom = f"POINT({data['lng']} {data['lat']})"
    
    new_hazard = Hazard(
        hazard_type=data.get('type', 'suspicious_activity'),
        description=data.get('description', ''),
        severity_score=data.get('severity_score', 1.0),
        location=geom
    )
    db.session.add(new_hazard)
    db.session.commit()
    
    return jsonify({"message": "Hazard reported successfully", "id": new_hazard.id}), 201
