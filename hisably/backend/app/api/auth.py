import random
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.config import settings
from app.db import queries

router = APIRouter(prefix="/auth", tags=["auth"])


def _generate_otp() -> str:
    return str(random.randint(100000, 999999))


def _create_jwt(user_id: str, phone: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "phone": phone,
        "aud": "authenticated",
        "role": "authenticated",
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(days=30)).timestamp()),
    }
    return jwt.encode(payload, settings.SUPABASE_JWT_SECRET, algorithm="HS256")


class SendOtpRequest(BaseModel):
    phone: str


class VerifyOtpRequest(BaseModel):
    phone: str
    otp: str


@router.post("/send-otp")
async def send_otp(req: SendOtpRequest):
    phone = req.phone.strip()
    if not phone.startswith("+"):
        phone = f"+91{phone}"

    otp = _generate_otp()
    expires_at = (datetime.now(timezone.utc) + timedelta(minutes=5)).isoformat()

    queries.store_otp(phone, otp, expires_at)

    from app.api.webhook import _send_whatsapp
    message = f"🔐 Aapka Hisably OTP: *{otp}*\n\nYeh 5 minute mein expire ho jayega.\nKisi ke saath share na karein."
    sent = _send_whatsapp(phone, message)

    if not sent:
        raise HTTPException(status_code=500, detail="OTP send failed. Check your WhatsApp number.")

    return {"message": "OTP sent to WhatsApp", "phone": phone}


@router.post("/verify-otp")
async def verify_otp(req: VerifyOtpRequest):
    phone = req.phone.strip()
    if not phone.startswith("+"):
        phone = f"+91{phone}"

    stored = queries.get_latest_otp(phone)
    if not stored:
        raise HTTPException(status_code=400, detail="No OTP found. Request a new one.")

    expires_at = datetime.fromisoformat(stored["expires_at"].replace("Z", "+00:00"))
    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(status_code=400, detail="OTP expired. Request a new one.")

    if stored["otp"] != req.otp.strip():
        raise HTTPException(status_code=400, detail="Wrong OTP. Try again.")

    queries.mark_otp_verified(stored["id"])

    user = queries.get_user_by_phone(phone)
    if not user:
        user = queries.create_user(phone)
    elif not user.get("is_verified"):
        queries.verify_user(user["id"])

    token = _create_jwt(user["id"], phone)

    from app.api.webhook import _send_whatsapp
    _send_whatsapp(phone, "✅ Aapka number verify ho gaya!\n\nAb aap Hisably app aur WhatsApp dono se GST queries kar sakte hain. 🙏")

    return {
        "message": "Verified successfully",
        "user_id": user["id"],
        "phone": phone,
        "token": token,
    }
