from datetime import datetime

from fastapi import APIRouter, Depends, Query

from app.db import queries
from app.deps import verify_jwt
from app.schemas.all_schemas import MonthlyAnalyticsResponse

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/monthly", response_model=MonthlyAnalyticsResponse)
async def get_monthly_analytics(
    month: str = Query(default=None, description="Month in YYYY-MM format"),
    user=Depends(verify_jwt),
):
    """Get monthly analytics summary."""
    if not month:
        month = datetime.now().strftime("%Y-%m")

    result = queries.get_monthly_analytics(user["uid"], month)

    return MonthlyAnalyticsResponse(
        month=result["month"],
        cash_total=result["cash_total"],
        online_total=result["online_total"],
        itc_recovered=result["itc_recovered"],
        estimated_ca_cost_saved=result["estimated_ca_cost_saved"],
    )
