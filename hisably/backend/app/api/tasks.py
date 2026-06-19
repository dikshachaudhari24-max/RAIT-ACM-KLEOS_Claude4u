from fastapi import APIRouter, Depends, HTTPException

from app.db import queries
from app.deps import verify_jwt
from app.schemas.all_schemas import TaskDoneRequest, TaskDoneResponse, TaskListResponse

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("/list", response_model=TaskListResponse)
async def list_tasks(user=Depends(verify_jwt)):
    """List all pending and completed tasks."""
    tasks = queries.get_tasks(user["uid"])
    items = []
    for t in tasks:
        items.append({
            "id": t["id"],
            "task_type": t.get("task_type") or "",
            "supplier_name": t.get("supplier_name"),
            "amount": float(t["amount"]) if t.get("amount") else None,
            "due_date": str(t["due_date"]) if t.get("due_date") else None,
            "status": t.get("status") or "pending",
            "proof_type": t.get("proof_type"),
        })
    return TaskListResponse(tasks=items)


@router.post("/done", response_model=TaskDoneResponse)
async def mark_task_done(request: TaskDoneRequest, user=Depends(verify_jwt)):
    """Mark a task as completed with proof."""
    result = queries.complete_task(
        task_id=request.task_id,
        proof_type=request.proof_type,
        cash_note=request.cash_note,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Task not found")
    return TaskDoneResponse(
        task_id=result["id"],
        status=result["status"],
        completed_at=result["completed_at"],
    )
