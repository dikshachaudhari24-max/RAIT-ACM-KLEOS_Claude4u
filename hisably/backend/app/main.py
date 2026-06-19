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


from app.api import analytics, auth, chatbot, gstr2b, invoices, itc, risk, suppliers, tasks, webhook  # noqa: E402

app.include_router(auth.router)
app.include_router(invoices.router)
app.include_router(gstr2b.router)
app.include_router(itc.router)
app.include_router(risk.router)
app.include_router(tasks.router)
app.include_router(suppliers.router)
app.include_router(chatbot.router)
app.include_router(analytics.router)
app.include_router(webhook.router)
