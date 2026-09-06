"""Configure Celery with fallback when celery package is not installed."""

from app.core.config import settings

try:
    from celery import Celery
    celery_app = Celery("dealflow360", broker=settings.redis_url, backend=settings.redis_url)
    celery_app.conf.update(task_track_started=True)
except ModuleNotFoundError:
    class DummyCelery:
        def task(self, *args, **kwargs):
            def decorator(func):
                func.delay = func
                return func
            return decorator

    celery_app = DummyCelery()
