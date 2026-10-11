from flask_socketio import emit, join_room, leave_room
from extensions import socketio

@socketio.on('connect')
def handle_connect():
    print("[SOCKETIO] Client established connection.")

@socketio.on('disconnect')
def handle_disconnect():
    print("[SOCKETIO] Client disconnected.")

@socketio.on('start_guardian_session')
def on_start_session(data):
    """
    Primary user initiates a Guardian session.
    A dedicated room is created based on their session_id.
    """
    session_id = data.get('session_id')
    join_room(session_id)
    print(f"[SOCKETIO] Guardian Session Initiated: {session_id}")
    emit('session_active', {'status': 'active', 'session_id': session_id}, room=session_id)

@socketio.on('join_guardian_session')
def on_join_session(data):
    """
    Trusted contacts (family/friends) join the room to receive live telemetry.
    """
    session_id = data.get('session_id')
    join_room(session_id)
    print(f"[SOCKETIO] Trusted Contact Joined Session: {session_id}")
    emit('contact_joined', {'message': 'A trusted contact is now monitoring your route.'}, room=session_id)

@socketio.on('broadcast_location')
def on_broadcast_location(data):
    """
    Primary user continuously streams GPS coordinates.
    Server instantly relays this to all trusted contacts in the room.
    """
    session_id = data.get('session_id')
    lat = data.get('lat')
    lng = data.get('lng')
    
    emit('location_update', {'lat': lat, 'lng': lng}, room=session_id)

@socketio.on('trigger_sos')
def on_trigger_sos(data):
    """
    User triggers Panic Button. Overrides standard polling and sends immediate alert.
    """
    session_id = data.get('session_id')
    print(f"[SOCKETIO] SOS TRIGGERED IN SESSION: {session_id}")
    emit('sos_alert', {'alert': 'CRITICAL', 'message': 'User triggered SOS! Immediate intervention required.'}, room=session_id)

