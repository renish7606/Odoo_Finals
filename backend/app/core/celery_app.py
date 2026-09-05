"""Configure Celery only; teams add tasks in their own modules later."""

from celery import Celery

from app.core.config import settings

# Redis carries background job messages and their simple results.
celery_app = Celery("dealflow360", broker=settings.redis_url, backend=settings.redis_url)
celery_app.conf.update(task_track_started=True)
