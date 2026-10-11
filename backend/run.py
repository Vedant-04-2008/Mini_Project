from factory import create_app
from extensions import db, socketio

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        try:
            db.create_all()
            print("[INFO] Database tables verified/created via SQLAlchemy.")
        except Exception as e:
            print(f"[WARNING] Database initialization failed. Is Docker running? Error: {e}")
            
    print("[INFO] Starting Flask-SocketIO Server via Eventlet/Werkzeug...")
    # socketio.run wraps app.run() and enables WebSocket transports
    socketio.run(app, debug=True, port=5000)
