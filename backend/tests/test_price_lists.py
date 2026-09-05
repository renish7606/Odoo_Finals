from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from app.api.routes.price_lists import add_entry
from app.schemas.pricing import PriceEntryCreate


class FakeSession:
    def __init__(self, variant_product_id: int = 2) -> None:
        self.objects = {
            "price_list": SimpleNamespace(id=2),
            "product": SimpleNamespace(id=2),
            "variant": SimpleNamespace(id=1, product_id=variant_product_id),
        }
        self.added = None

    def get(self, model, object_id):
        model_name = model.__name__
        if model_name == "PriceList":
            return self.objects["price_list"] if object_id == 2 else None
        if model_name == "Product":
            return self.objects["product"] if object_id == 2 else None
        if model_name == "Variant":
            return self.objects["variant"] if object_id == 1 else None
        return None

    def add(self, item) -> None:
        self.added = item

    def commit(self) -> None:
        return None

    def refresh(self, item) -> None:
        item.id = 1

    def rollback(self) -> None:
        return None


def test_add_entry_rejects_variant_from_another_product() -> None:
    data = PriceEntryCreate(product_id=2, variant_id=1, resolved_price=10000)

    with pytest.raises(HTTPException) as error:
        add_entry(2, data, FakeSession(variant_product_id=1), SimpleNamespace())

    assert error.value.status_code == 400
    assert error.value.detail == "Variant does not belong to the selected product"


def test_add_entry_accepts_a_valid_product_variant_reference() -> None:
    data = PriceEntryCreate(product_id=2, variant_id=1, resolved_price=10000)
    session = FakeSession(variant_product_id=2)

    result = add_entry(2, data, session, SimpleNamespace())

    assert result.id == 1
    assert session.added.product_id == 2
    assert session.added.variant_id == 1
