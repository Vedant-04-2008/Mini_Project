from flask import Blueprint, request, jsonify
from model import CivicTicket
from extensions import db
from tasks import escalate_to_kmc
from utils import token_required

civic_bp = Blueprint('civic', __name__)

@civic_bp.route('/report', methods=['POST'])
@token_required
def report_civic_issue(current_user):
    data = request.json
    geom = f"POINT({data['lng']} {data['lat']})"
    
    new_ticket = CivicTicket(
        issue_type=data.get('issue_type'),
        description=data.get('description'),
        location=geom
    )
    db.session.add(new_ticket)
    db.session.commit()
    
    # Asynchronously dispatch to Celery for KMC escalation
    escalate_to_kmc.delay(new_ticket.id)
    
    return jsonify({
        "message": "Civic issue logged. Escalation task queued.",
        "ticket_id": new_ticket.id
    }), 201

