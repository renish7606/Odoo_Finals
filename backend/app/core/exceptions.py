class DealFlowError(Exception):
    """Base exception for application-level errors."""


class ResourceNotFoundError(DealFlowError):
    pass
