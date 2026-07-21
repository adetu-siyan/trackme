from supabase import create_client, Client
from config import settings

# Service role client — full access, use only server-side
supabase: Client = create_client(
    settings.supabase_url,
    settings.supabase_service_role_key
)


def get_supabase() -> Client:
    """Dependency injection for routes."""
    return supabase


async def get_user_from_token(token: str) -> dict | None:
    """Verify a Supabase JWT and return the user."""
    try:
        response = supabase.auth.get_user(token)
        return response.user
    except Exception:
        return None


async def update_streak(user_id: str, log_date: str):
    """Update the streak counter after a successful log submission."""
    from datetime import date, timedelta

    today = date.fromisoformat(log_date)

    # Get existing streak
    result = supabase.table("streaks").select("*").eq("user_id", user_id).execute()

    if not result.data:
        # First ever log
        supabase.table("streaks").insert({
            "user_id": user_id,
            "current_streak": 1,
            "longest_streak": 1,
            "last_log_date": log_date
        }).execute()
        return

    streak = result.data[0]
    last_date = date.fromisoformat(streak["last_log_date"]) if streak["last_log_date"] else None

    if last_date is None:
        new_current = 1
    elif last_date == today - timedelta(days=1):
        # Consecutive day
        new_current = streak["current_streak"] + 1
    elif last_date == today:
        # Already logged today
        return
    else:
        # Streak broken
        new_current = 1

    new_longest = max(new_current, streak["longest_streak"])

    supabase.table("streaks").update({
        "current_streak": new_current,
        "longest_streak": new_longest,
        "last_log_date": log_date
    }).eq("user_id", user_id).execute()


async def create_notification(
    user_id: str,
    notif_type: str,
    title: str,
    message: str,
    metadata: dict = {}
):
    """Insert a notification for a user."""
    supabase.table("notifications").insert({
        "user_id": user_id,
        "type": notif_type,
        "title": title,
        "message": message,
        "metadata": metadata
    }).execute()
