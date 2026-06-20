import os
import sys

# On Windows the default `pip install twilio` can fail to fully extract because
# of the OS path-length limit, leaving a broken install. A complete copy lives
# in `twilio_temp/` at the project root; put it first on the import path so
# `from twilio.rest import Client` resolves to the working copy.
_here = os.path.dirname(os.path.abspath(__file__))
for _candidate in (
    os.path.join(_here, "..", "..", "..", "twilio_temp"),  # repo root / twilio_temp
    os.path.join(_here, "..", "..", "twilio_temp"),         # hisably / twilio_temp
):
    _candidate = os.path.abspath(_candidate)
    if os.path.isdir(os.path.join(_candidate, "twilio")) and _candidate not in sys.path:
        sys.path.insert(0, _candidate)
        break

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    from app.db.supabase import test_connection
    test_connection()
    yield


app = FastAPI(title="Hisably API", version="2.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok", "version": "2.0", "product": "Hisably"}


from app.api import analytics, annual_report, auth, ca_dashboard, chatbot, gstr2b, invoices, itc, risk, suppliers, tasks, voice, webhook  # noqa: E402

app.include_router(auth.router)
app.include_router(annual_report.router)
app.include_router(invoices.router)
app.include_router(gstr2b.router)
app.include_router(itc.router)
app.include_router(risk.router)
app.include_router(tasks.router)
app.include_router(suppliers.router)
app.include_router(chatbot.router)
app.include_router(analytics.router)
app.include_router(voice.router)
app.include_router(webhook.router)
app.include_router(ca_dashboard.router)
