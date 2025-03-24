# API routers module for Reply Guy backend

from .tweets import router as tweets_router
from .replies import router as replies_router

__all__ = ["tweets_router", "replies_router"]