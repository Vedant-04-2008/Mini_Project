from extensions import celery, db
from model import CivicTicket, Hazard
import time

@celery.task
def escalate_to_kmc(ticket_id):
    """
    Simulates batching and forwarding a civic report to the Kolhapur Municipal Corporation API.
    """
    # Note: In production, you would fetch the ticket inside the app context
    print(f"[CELERY WORKER] Processing Ticket #{ticket_id} for KMC escalation...")
    time.sleep(2) # Simulate network call
    print(f"[CELERY WORKER] Successfully escalated Ticket #{ticket_id} to KMC systems.")
    return True

@celery.task
def time_decay_hazards():
    """
    Nightly CRON job to reduce severity of temporary hazards.
    """
    print("[CELERY BEAT] Running nightly hazard decay routine...")
    # Production logic:
    # db.session.execute("UPDATE spatial_hazards SET severity_score = severity_score * 0.85 WHERE severity_score > 0.5")
    # db.session.commit()
    print("[CELERY BEAT] Hazard decay complete.")
    return True

