from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit, join_room

app = Flask(__name__)
# Initialize SocketIO purely in-memory (no Redis required for mock mode)
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/login', methods=['POST'])
def login():
    return jsonify({"message": "login_Done", "token": "mock-jwt-token"}), 200

@app.route('/create-account', methods=['POST'])
def register():
    return jsonify({"message": "data_sent"}), 201

@app.route('/api/hazards', methods=['GET'])
def get_hazards():
    mock_hazards = [
        {"id": 1, "type": "poor_lighting", "description": "Very dark alley, no streetlights.", "severity_score": 2, "lat": 16.7000, "lng": 74.2400},
        {"id": 2, "type": "safe_area", "description": "Well-lit and heavily patrolled.", "severity_score": 0, "lat": 16.6980, "lng": 74.2300},
        {"id": 3, "type": "suspicious_activity", "description": "Reported harassment recently.", "severity_score": 3, "lat": 16.6950, "lng": 74.2235}
    ]
    return jsonify(mock_hazards), 200

@app.route('/api/hazards', methods=['POST'])
def report_hazard():
    return jsonify({"message": "Hazard reported successfully (Mocked)", "id": 999}), 201

@app.route('/api/civic', methods=['POST'])
def report_civic():
    return jsonify({"message": "Civic issue logged (Mocked).", "ticket_id": 888}), 201

@app.route('/api/routes', methods=['GET'])
def get_routes():
    # Provide a simple mocked route path near Kolhapur coordinates
    return jsonify({
        "safest_route": {
            "description": "Mocked Safest Route. Avoids known hazard zones.",
            "time": "18 mins",
            "distance": "4.2 km",
            "path": [[16.7050, 74.2433], [16.7020, 74.2400], [16.6980, 74.2300], [16.6915, 74.2155]],
            "hazard_count": 0
        },
        "fastest_route": {
            "description": "Mocked Fastest Route. Direct path.",
            "time": "12 mins",
            "distance": "3.5 km",
            "path": [[16.7050, 74.2433], [16.6990, 74.2250], [16.6915, 74.2155]],
            "hazard_count": 2
        }
    }), 200

# ----- MOCK WEBSOCKET EVENTS (IN-MEMORY) -----
@socketio.on('start_guardian_session')
def on_start_session(data):
    session_id = data.get('session_id')
    join_room(session_id)
    print(f"[MOCK SOCKET] Session Started: {session_id}")
    emit('session_active', {'status': 'active', 'session_id': session_id}, room=session_id)

@socketio.on('broadcast_location')
def on_broadcast_location(data):
    session_id = data.get('session_id')
    emit('location_update', {'lat': data.get('lat'), 'lng': data.get('lng')}, room=session_id)

@socketio.on('trigger_sos')
def on_trigger_sos(data):
    session_id = data.get('session_id')
    print(f"[MOCK SOCKET] SOS TRIGGERED: {session_id}")
    emit('sos_alert', {'alert': 'CRITICAL', 'message': 'User triggered SOS!'}, room=session_id)

if __name__ == '__main__':
    print("[INFO] Starting SafeRoute MOCK SERVER (No Database / No Redis required)...")
    socketio.run(app, debug=True, port=5000)

