from celery import Celery
from kombu import Queue

from app.config import settings

celery_app = Celery(
    "hisably",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.task_queues = (
    Queue("high_priority"),
    Queue("normal"),
    Queue("low"),
)

celery_app.conf.task_default_queue = "normal"
