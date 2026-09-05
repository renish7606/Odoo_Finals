"""Automatically include every endpoint router in this API version."""

from importlib import import_module
from pkgutil import iter_modules

from fastapi import APIRouter

from app.api.v1 import endpoints


def build_api_router() -> APIRouter:
    """Find endpoint files that export `router` and include them once."""
    api_router = APIRouter(prefix="/api/v1")
    for module_info in iter_modules(endpoints.__path__, f"{endpoints.__name__}."):
        module = import_module(module_info.name)
        router = getattr(module, "router", None)
        if isinstance(router, APIRouter):
            api_router.include_router(router)
    return api_router


# Teams add a file with `router = APIRouter(...)`; no central edit is needed.
api_router = build_api_router()
