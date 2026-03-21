from typing import Optional

from app.models.schemas import WearableImportResponse

_latest_wearable: Optional[WearableImportResponse] = None


def set_latest_wearable(data: WearableImportResponse) -> None:
    global _latest_wearable
    _latest_wearable = data


def get_latest_wearable() -> Optional[WearableImportResponse]:
    return _latest_wearable
