from flask import Blueprint, request, jsonify
from model import CivicTicket
from extensions import db
from utils import token_required
from sqlalchemy import text
from datetime import datetime

civic_bp = Blueprint('civic', __name__)

@civic_bp.route('/report', methods=['POST'])
@token_required
def report_civic_issue(current_user):
    data = request.json
    lat = data.get('lat')
    lng = data.get('lng')
    
    if not lat or not lng:
        return jsonify({"message": "Latitude and longitude are required."}), 400
        
    geom = f"POINT({lng} {lat})"
    issue_type = data.get('issue_type', 'broken_streetlight')
    description = data.get('description', '')
    
    new_ticket = CivicTicket(
        issue_type=issue_type,
        description=description,
        status='escalated', # Simulated automatic triage to KMC
        location=geom,
        escalated_at=datetime.utcnow()
    )
    db.session.add(new_ticket)
    db.session.commit()
    
    # Try Celery escalation if worker is active, otherwise log locally
    try:
        from tasks import escalate_to_kmc
        escalate_to_kmc.delay(new_ticket.id)
    except Exception as e:
        print(f"[KMC SIMULATION] Ticket #{new_ticket.id} queued directly for KMC systems (Standalone mode).")

    # Determine simulated KMC department
    dept_map = {
        'broken_streetlight': 'KMC Electrical Division & Public Illumination',
        'pothole': 'KMC Roads & Infrastructure Engineering Cell',
        'flooded_road': 'KMC Drainage & Water Supply Department',
        'open_manhole': 'KMC Urban Sanitation & Emergency Response',
        'damaged_sidewalk': 'KMC Town Planning & Pedestrian Safety'
    }
    department = dept_map.get(issue_type, 'KMC General Public Grievance Cell')

    return jsonify({
        "message": "Grievance successfully registered with Kolhapur Municipal Corporation queue.",
        "ticket_id": new_ticket.id,
        "reference_number": f"KMC-2026-TKT-{1000 + new_ticket.id}",
        "department": department,
        "status": "Escalated to Ward Officer",
        "estimated_resolution": "48 - 72 Hours"
    }), 201

@civic_bp.route('/tickets', methods=['GET'])
def get_civic_tickets():
    """Returns recent KMC civic tickets for demonstration and live status tracking."""
    query = text("""
        SELECT id, issue_type, description, status, created_at,
               ST_Y(location) AS lat, ST_X(location) AS lng
        FROM civic_tickets
        ORDER BY id DESC
        LIMIT 20
    """)
    try:
        rows = db.session.execute(query).fetchall()
        tickets = []
        dept_map = {
            'broken_streetlight': 'KMC Electrical Division',
            'pothole': 'KMC Roads Department',
            'flooded_road': 'KMC Drainage Dept',
            'open_manhole': 'KMC Sanitation Cell',
            'damaged_sidewalk': 'KMC Pedestrian Safety'
        }
        for r in rows:
            tickets.append({
                "id": r[0],
                "reference_number": f"KMC-2026-TKT-{1000 + r[0]}",
                "issue_type": r[1],
                "description": r[2],
                "status": r[3],
                "created_at": r[4].strftime("%d %b %Y, %I:%M %p") if r[4] else "Recent",
                "lat": r[5],
                "lng": r[6],
                "department": dept_map.get(r[1], 'KMC Public Grievance')
            })
        return jsonify(tickets), 200
    except Exception as e:
        print(f"[CIVIC QUERY ERROR] {e}")
        return jsonify([]), 200
