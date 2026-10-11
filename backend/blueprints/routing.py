from flask import Blueprint, jsonify, request
from services.routing_engine import get_optimal_routes

routing_bp = Blueprint('routing', __name__)

@routing_bp.route('', methods=['GET'])
def get_routes():
    # Expecting coordinates from query params
    start_lat = request.args.get('start_lat', type=float)
    start_lng = request.args.get('start_lng', type=float)
    end_lat = request.args.get('end_lat', type=float)
    end_lng = request.args.get('end_lng', type=float)
    
    # Fallback bounds for prototyping if none provided (Kolhapur CBS to Rankala)
    if not all([start_lat, start_lng, end_lat, end_lng]):
        start_lat, start_lng = 16.7032, 74.2432 
        end_lat, end_lng = 16.6915, 74.2155
        
    try:
        routes_data = get_optimal_routes(start_lat, start_lng, end_lat, end_lng)
        return jsonify(routes_data), 200
    except Exception as e:
        print(f"[ROUTING ENGINE ERROR] {e}")
        return jsonify({"error": "Failed to calculate secure routes."}), 500
