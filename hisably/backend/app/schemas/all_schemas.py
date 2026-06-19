from __future__ import annotations

from typing import Optional

from pydantic import BaseModel


class InvoiceUploadResponse(BaseModel):
    invoice_id: str
    status: str


class ConfidenceScores(BaseModel):
    supplier_name: float
    gstin: float
    invoice_number: float
    date: float
    amount: float
    taxable_value: float
    gst_amount: float
    hsn_code: float
    product_description: float


class InvoiceListItem(BaseModel):
    id: str
    supplier_name: str
    invoice_number: str
    date: str
    amount: float
    status: str
    anomaly_score: float
    confidence_scores: ConfidenceScores


class InvoiceListResponse(BaseModel):
    invoices: list[InvoiceListItem]
    total: int
    page: int


class GSTR2BUploadResponse(BaseModel):
    upload_id: str
    status: str


class MismatchItem(BaseModel):
    id: str
    invoice_id: str
    supplier_name: str
    mismatch_type: str
    amount_difference: float
    explanation_hi: str
    explanation_en: str
    root_cause_category: str
    root_cause_confidence: float
    recommended_action: str
    resolved: bool


class MismatchListResponse(BaseModel):
    mismatches: list[MismatchItem]
    total_blocked_itc: float


class PriorityAction(BaseModel):
    invoice_id: str
    amount: float
    issue: str
    action_label: str
    action_label_hi: str


class ITCSummaryResponse(BaseModel):
    total_eligible: float
    total_blocked: float
    total_recoverable: float
    priority_actions: list[PriorityAction]
    month: str


class RiskBreakdown(BaseModel):
    unresolved_mismatches: int
    unresolved_hsn_errors: int
    days_to_deadline: int
    uncleared_anomalies: int


class RiskScoreResponse(BaseModel):
    score: int
    tier: str
    tier_color: str
    breakdown: RiskBreakdown
    next_deadline: str


class TaskItem(BaseModel):
    id: str
    task_type: str
    supplier_name: Optional[str]
    amount: Optional[float]
    due_date: Optional[str]
    status: str
    proof_type: Optional[str]


class TaskListResponse(BaseModel):
    tasks: list[TaskItem]


class TaskDoneRequest(BaseModel):
    task_id: str
    proof_type: str
    cash_note: Optional[str] = None


class TaskDoneResponse(BaseModel):
    task_id: str
    status: str
    completed_at: str


class SupplierListItem(BaseModel):
    id: str
    name: str
    gstin: str
    reliability_score: float
    reliability_tier: str
    total_itc_blocked: float
    invoice_count: int
    error_count: int
    suggested_action: str


class SupplierListResponse(BaseModel):
    suppliers: list[SupplierListItem]


class SupplierMessageRequest(BaseModel):
    supplier_id: str
    related_invoice_id: str
    channel: str
    edited_message: Optional[str] = None


class SupplierMessageResponse(BaseModel):
    task_id: str
    message_sent: bool
    channel: str


class ChatbotTextRequest(BaseModel):
    query: str


class ChatbotTextResponse(BaseModel):
    response_text: str
    retrieved_namespaces: list[str]
    grounded: bool


class ChatbotVoiceResponse(BaseModel):
    transcribed_text: str
    response_text: str
    audio_url: str
    retrieved_namespaces: list[str]


class MonthlyAnalyticsResponse(BaseModel):
    month: str
    cash_total: float
    online_total: float
    itc_recovered: float
    estimated_ca_cost_saved: float
