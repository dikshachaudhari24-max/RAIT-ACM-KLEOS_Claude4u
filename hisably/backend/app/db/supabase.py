from __future__ import annotations

from typing import TYPE_CHECKING

from app.config import settings

if TYPE_CHECKING:
    from supabase import Client

_client: Client | None = None
_admin: Client | None = None


def get_client() -> Client:
    global _client
    if _client is None:
        from supabase import create_client
        _client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    return _client


def get_admin_client() -> Client:
    global _admin
    if _admin is None:
        from supabase import create_client
        _admin = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    return _admin


def test_connection():
    try:
        client = get_admin_client()
        result = client.table("users").select("id").limit(1).execute()
        print("Supabase connection successful")
        return result
    except Exception as e:
        print(f"Supabase connection error: {e}")
        return None
