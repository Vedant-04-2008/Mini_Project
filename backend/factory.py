from flask import Flask
from config import Config
from extensions import db, celery, socketio

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)

    # Configure Celery
    celery.conf.update(app.config)
    
    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)
    celery.Task = ContextTask

    # Initialize SocketIO
    # Fallback to purely in-memory if REDIS_URL is strictly 'redis://localhost:6379/0' and we want to allow local dev without Docker.
    # For true production, we'd enable the message_queue.
    import os
    redis_url = app.config.get('REDIS_URL')
    use_queue = redis_url if os.environ.get('USE_REDIS_QUEUE') == 'true' else None
    
    socketio.init_app(app, message_queue=use_queue)

    # Register Blueprints
    from blueprints.auth import auth_bp
    from blueprints.hazards import hazards_bp
    from blueprints.civic import civic_bp
    from blueprints.routing import routing_bp

    app.register_blueprint(auth_bp, url_prefix='')  
    app.register_blueprint(hazards_bp, url_prefix='/api/hazards')
    app.register_blueprint(civic_bp, url_prefix='/api/civic')
    app.register_blueprint(routing_bp, url_prefix='/api/routes')

    # Import sockets so event handlers are registered with the SocketIO instance
    import sockets

    return app
