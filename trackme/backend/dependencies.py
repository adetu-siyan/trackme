from fastapi import Header, HTTPException, status, Request
from services.supabase_service import get_user_from_token
import re


# Suspicious patterns in inputs
INJECTION_PATTERNS = [
    r'<script.*?>',
    r'javascript:',
    r'on\w+\s*=',
    r'union\s+select',
    r'drop\s+table',
    r'insert\s+into',
    r'delete\s+from',
    r'--\s*$',
    r';\s*drop',
    r'exec\s*\(',
    r'xp_cmdshell',
]

COMPILED_PATTERNS = [re.compile(p, re.IGNORECASE) for p in INJECTION_PATTERNS]


def sanitize_input(text: str) -> str:
    """Strip null bytes and check for injection patterns."""
    if not text:
        return text

    # Remove null bytes
    text = text.replace('\x00', '')

    # Check for injection attempts
    for pattern in COMPILED_PATTERNS:
        if pattern.search(text):
            raise HTTPException(
                status_code=400,
                detail="Invalid input detected"
            )

    return text


async def get_current_user(
    authorization: str = Header(...),
    request: Request = None
):
    """Extract and validate the Bearer token."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header"
        )

    token = authorization.replace("Bearer ", "").strip()

    # Basic token format check
    if len(token) < 20 or len(token) > 2000:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token format"
        )

    user = await get_user_from_token(token)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    return user