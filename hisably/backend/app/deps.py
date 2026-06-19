import jwt
from fastapi import Header, HTTPException

from app.config import settings

DEV_TOKENS = {
    "test-token": {"uid": "00000000-0000-0000-0000-000000000001", "email": "", "role": "authenticated"},
    "demo-token": {"uid": "00000000-0000-0000-0000-000000000002", "email": "demo@hisably.in", "role": "authenticated"},
}


async def verify_jwt(authorization: str = Header(...)) -> dict:
    """Verify Supabase JWT token and return user payload with 'uid' field."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid or missing Authorization header")

    token = authorization.replace("Bearer ", "")

    if settings.APP_ENV == "development" and token in DEV_TOKENS:
        return DEV_TOKENS[token]

    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token missing user ID")
        return {"uid": user_id, "email": payload.get("email", ""), "role": payload.get("role", "")}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
