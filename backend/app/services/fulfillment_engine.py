def get_delivery_slippage_days(quotation_id: int) -> int:
    """
    TODO: Stub for Group B's fulfillment engine estimate.
    Returns the number of days the delivery is expected to slip.
    """
    # For Deal Health demonstration purposes, we return a mock slippage
    # for specific quotations (e.g. quotation_id % 3 == 0)
    # But only if it's explicitly one of our seeded deals to match the requested 3 deals
    if quotation_id in [1000, 1001, 1002]:
        return 14
    return 0
