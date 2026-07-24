import time
import os
from datetime import datetime, date, timedelta, timezone
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
from services.supabase_service import supabase
from services.groq_service import client as groq_client
from config import settings

router = APIRouter(tags=["health"])

HEALTH_SECRET = os.getenv("HEALTH_SECRET", "trackme-health-secret")


def verify_health_key(request: Request):
    key = (
        request.headers.get("X-Health-Key")
        or request.query_params.get("key")
    )
    # TEMPORARY DEBUG — remove after fixing
    print(f">>> KEY RECEIVED: '{key}'")
    print(f">>> KEY EXPECTED: '{HEALTH_SECRET}'")
    print(f">>> MATCH: {key == HEALTH_SECRET}")
    if not key or key != HEALTH_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")


def ms_since(start: float) -> int:
    return round((time.time() - start) * 1000)


def row_status(pct: float) -> str:
    if pct >= 90:
        return "critical"
    if pct >= 70:
        return "warning"
    return "ok"


def check_env(var: str, settings_attr: str = None) -> str:
    # Check os.getenv first, then fall back to settings object
    val = os.getenv(var)
    if not val and settings_attr:
        val = getattr(settings, settings_attr, None)
    return "set" if val else "MISSING"


@router.get("/health")
async def health_check(request: Request):
    verify_health_key(request)

    result = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "services": {},
        "database": {},
        "security": {},
        "quotas": {},
        "activity": {},
    }

    # ── SERVICES ─────────────────────────────────────────

    result["services"]["fastapi"] = {
        "status": "ok",
        "latency_ms": 0,
    }

    t = time.time()
    try:
        supabase.table("profiles").select("id").limit(1).execute()
        result["services"]["supabase"] = {
            "status": "ok",
            "latency_ms": ms_since(t),
        }
    except Exception as e:
        result["services"]["supabase"] = {
            "status": "error",
            "latency_ms": ms_since(t),
            "error": str(e),
        }

    t = time.time()
    try:
        groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": "ping"}],
            max_tokens=1,
        )
        result["services"]["groq"] = {
            "status": "ok",
            "latency_ms": ms_since(t),
        }
    except Exception as e:
        result["services"]["groq"] = {
            "status": "error",
            "latency_ms": ms_since(t),
            "error": str(e),
        }

    resend_key = getattr(settings, "resend_api_key", None) or os.getenv("RESEND_API_KEY")
    result["services"]["resend"] = {
        "status": "ok" if resend_key else "missing_key",
        "note": "Key presence check only — no live ping to preserve quota",
    }

    # ── DATABASE ─────────────────────────────────────────

    tables = [
        "daily_logs",
        "profiles",
        "weekly_tasks",
        "weekly_focus",
        "projects",
        "mentor_relationships",
        "notifications",
    ]

    table_counts = {}
    for table in tables:
        try:
            res = supabase.table(table).select(
                "*", count="exact"
            ).limit(1).execute()
            table_counts[table] = res.count if res.count is not None else 0
        except Exception as e:
            table_counts[table] = f"error: {str(e)}"

    result["database"]["tables"] = table_counts
    total_rows = sum(v for v in table_counts.values() if isinstance(v, int))
    result["database"]["total_rows"] = total_rows

    FREE_TIER_ROWS = 50000
    row_pct = round((total_rows / FREE_TIER_ROWS) * 100, 1)
    result["database"]["row_limit"] = {
        "used": total_rows,
        "limit": FREE_TIER_ROWS,
        "percent": row_pct,
        "status": row_status(row_pct),
    }

    try:
        size_res = supabase.rpc("get_db_size_mb").execute()
        db_size_mb = float(size_res.data or 0)
        storage_pct = round((db_size_mb / 500) * 100, 1)
        result["database"]["storage"] = {
            "used_mb": db_size_mb,
            "limit_mb": 500,
            "percent": storage_pct,
            "status": row_status(storage_pct),
        }
    except Exception:
        result["database"]["storage"] = {
            "used_mb": "unavailable",
            "note": "Run the get_db_size_mb() SQL RPC in Supabase to enable this",
        }

    # ── SECURITY ─────────────────────────────────────────

    env_status = {
        "SUPABASE_URL":         check_env("SUPABASE_URL",         "supabase_url"),
        "SUPABASE_ANON_KEY":    check_env("SUPABASE_ANON_KEY",    "supabase_anon_key"),
        "SUPABASE_SERVICE_KEY": check_env("SUPABASE_SERVICE_KEY", "supabase_service_key"),
        "GROQ_API_KEY":         check_env("GROQ_API_KEY",         "groq_api_key"),
        "RESEND_API_KEY":       check_env("RESEND_API_KEY",       "resend_api_key"),
        "HEALTH_SECRET":        check_env("HEALTH_SECRET",        None) or ("set" if HEALTH_SECRET != "trackme-health-secret" else "using_default"),
    }

    result["security"]["env_vars"] = env_status

    # RLS probe
    try:
        from supabase import create_client
        anon_key = os.getenv("SUPABASE_ANON_KEY") or getattr(settings, "supabase_anon_key", None)
        supabase_url = os.getenv("SUPABASE_URL") or getattr(settings, "supabase_url", None)
        if anon_key and supabase_url:
            anon_client = create_client(supabase_url, anon_key)
            probe = anon_client.table("daily_logs").select("id").limit(5).execute()
            rows_returned = len(probe.data) if probe.data else 0
            result["security"]["rls_probe"] = {
                "status": "ok" if rows_returned == 0 else "BREACH",
                "detail": (
                    "Anon key correctly blocked from reading logs"
                    if rows_returned == 0
                    else f"WARNING: Anon key returned {rows_returned} rows — RLS may be broken on daily_logs"
                ),
            }
        else:
            result["security"]["rls_probe"] = {
                "status": "skipped",
                "detail": "SUPABASE_ANON_KEY or SUPABASE_URL not set",
            }
    except Exception as e:
        result["security"]["rls_probe"] = {
            "status": "error",
            "detail": str(e),
        }

    cors_origins = getattr(settings, "cors_origins_list", ["not configured"])
    result["security"]["cors_origins"] = cors_origins

    # ── QUOTAS ───────────────────────────────────────────

    try:
        month_start = date.today().replace(day=1).isoformat()
        email_res = supabase.table("email_logs").select(
            "*", count="exact"
        ).gte("sent_at", month_start).limit(1).execute()
        emails_sent = email_res.count or 0
        result["quotas"]["resend_emails"] = {
            "sent_this_month": emails_sent,
            "free_limit": 3000,
            "percent": round((emails_sent / 3000) * 100, 1),
            "status": "warning" if emails_sent > 2500 else "ok",
        }
    except Exception:
        result["quotas"]["resend_emails"] = {
            "sent_this_month": "unavailable",
            "note": "Create an email_logs table to track Resend usage",
        }

    # ── ACTIVITY ─────────────────────────────────────────

    try:
        today = date.today().isoformat()
        week_ago = (date.today() - timedelta(days=7)).isoformat()

        logs_today = supabase.table("daily_logs").select(
            "*", count="exact"
        ).gte("log_date", today).limit(1).execute()

        logs_week = supabase.table("daily_logs").select(
            "*", count="exact"
        ).gte("log_date", week_ago).limit(1).execute()

        last_log = supabase.table("daily_logs").select(
            "log_date, created_at"
        ).order("created_at", desc=True).limit(1).execute()

        last_signup = supabase.table("profiles").select(
            "created_at"
        ).order("created_at", desc=True).limit(1).execute()

        active_week = supabase.table("daily_logs").select(
            "user_id"
        ).gte("log_date", week_ago).execute()

        unique_active = len(set(
            r["user_id"] for r in (active_week.data or [])
        ))

        result["activity"] = {
            "logs_today": logs_today.count or 0,
            "logs_this_week": logs_week.count or 0,
            "unique_active_users_week": unique_active,
            "last_log_at": (
                last_log.data[0]["created_at"] if last_log.data else "never"
            ),
            "last_signup_at": (
                last_signup.data[0]["created_at"] if last_signup.data else "never"
            ),
            "total_users": table_counts.get("profiles", 0),
        }
    except Exception as e:
        result["activity"] = {"error": str(e)}

    return result


# Add OPTIONS handler for CORS preflight
@router.options("/health")
async def health_options():
    """Handle OPTIONS preflight requests"""
    return JSONResponse(
        status_code=200,
        content={"message": "OK"},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Credentials": "true",
        }
    )