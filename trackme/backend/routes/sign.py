from datetime import datetime
from fastapi import APIRouter, HTTPException
from fastapi.responses import HTMLResponse
from services.supabase_service import supabase, create_notification
from services.resend_service import send_signed_notification_to_mentee

router = APIRouter(prefix="/sign", tags=["sign"])


@router.get("/{token}", response_class=HTMLResponse)
async def get_sign_page(token: str):
    """
    Mentor clicks the email link → sees this page with the log and sign button.
    This is a standalone HTML page, no auth required (token is the auth).
    """
    # Look up log by sign token
    result = supabase.table("daily_logs") \
        .select("*, profiles!daily_logs_user_id_fkey(full_name)") \
        .eq("mentor_sign_token", token) \
        .execute()

    if not result.data:
        return HTMLResponse("""
        <html><body style="font-family:sans-serif;text-align:center;padding:80px">
          <h2 style="color:#e53e3e">Invalid or expired link</h2>
          <p>This signing link is not valid or has already been used.</p>
        </body></html>
        """, status_code=404)

    log = result.data[0]

    if log.get("signed"):
        return HTMLResponse(f"""
        <html><body style="font-family:sans-serif;text-align:center;padding:80px">
          <div style="font-size:48px">✅</div>
          <h2 style="color:#38a169">Already Signed</h2>
          <p>You signed this log on {log['signed_at'][:10] if log.get('signed_at') else 'a previous date'}.</p>
        </body></html>
        """)

    mentee_name = log.get("profiles", {}).get("full_name", "Your mentee")
    topics = log.get("structured_topics", [])
    topics_html = " ".join([
        f'<span style="background:#7C3AED22;color:#7C3AED;padding:4px 12px;border-radius:20px;font-size:13px;margin-right:6px">{t}</span>'
        for t in topics
    ])

    content_html = (log.get("structured_content") or "").replace("\n\n", "</p><p>").replace("\n", "<br>")

    return HTMLResponse(f"""
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Sign Log — Trackme</title>
<link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{ font-family: Urbanist, sans-serif; background: #F5F4FF; min-height: 100vh; }}
  .header {{ background: #0A0A0F; padding: 24px 40px; display: flex; align-items: center; gap: 12px; }}
  .logo {{ font-size: 24px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }}
  .logo span {{ color: #7C3AED; }}
  .container {{ max-width: 700px; margin: 40px auto; padding: 0 20px 60px; }}
  .card {{ background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(124,58,237,0.08); margin-bottom: 24px; }}
  .card-header {{ background: #F8F6FF; padding: 24px 32px; border-bottom: 1px solid #E8E5FF; }}
  .card-body {{ padding: 28px 32px; }}
  .eyebrow {{ font-size: 11px; letter-spacing: 2px; color: #7C3AED; font-weight: 600; text-transform: uppercase; margin-bottom: 8px; }}
  h1 {{ font-size: 22px; font-weight: 700; color: #0D0D0D; margin-bottom: 14px; }}
  .topics {{ margin-bottom: 0; }}
  .content {{ color: #444; line-height: 1.8; font-size: 15px; }}
  .sign-section {{ text-align: center; padding: 32px; }}
  .sign-btn {{ background: #7C3AED; color: #fff; border: none; padding: 16px 48px; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; font-family: Urbanist, sans-serif; transition: all 0.2s; }}
  .sign-btn:hover {{ background: #6D28D9; transform: translateY(-1px); box-shadow: 0 8px 20px rgba(124,58,237,0.3); }}
  .sign-btn:disabled {{ background: #aaa; cursor: not-allowed; transform: none; box-shadow: none; }}
  .success {{ display: none; text-align: center; padding: 20px; }}
  .success-icon {{ font-size: 48px; margin-bottom: 12px; }}
  .mentor-note {{ color: #888; font-size: 13px; margin-top: 12px; }}
  h2 {{ font-size: 18px; font-weight: 700; color: #0D0D0D; }}
</style>
</head>
<body>
<div class="header">
  <div class="logo">Trackm<span>e</span></div>
</div>
<div class="container">
  <p style="color:#666;font-size:15px;margin-bottom:20px;">{mentee_name} submitted this log and is waiting for your sign-off.</p>
  
  <div class="card">
    <div class="card-header">
      <div class="eyebrow">Daily Log · {log.get('log_date', '')}</div>
      <h1>{log.get('structured_title', 'Daily Log')}</h1>
      <div class="topics">{topics_html}</div>
    </div>
    <div class="card-body">
      <div class="content"><p>{content_html}</p></div>
    </div>
  </div>

  <div class="card">
    <div class="sign-section" id="sign-section">
     <p style="color:#555;margin-bottom:16px;font-size:15px;">By signing, you confirm you've reviewed this log.</p>
<textarea
  id="mentor-message"
  placeholder="Add a note for your mentee (optional) — feedback, encouragement, corrections..."
  style="width:100%;padding:14px;border-radius:10px;border:1.5px solid #E8E5FF;font-family:Urbanist,sans-serif;font-size:14px;line-height:1.7;resize:vertical;min-height:100px;margin-bottom:16px;box-sizing:border-box;outline:none;color:#444;"
  onfocus="this.style.borderColor='#7C3AED'"
  onblur="this.style.borderColor='#E8E5FF'"
></textarea>
<button class="sign-btn" onclick="signLog()" id="sign-btn">✍️ Sign This Log</button>
      <p class="mentor-note">This action cannot be undone.</p>
    </div>
    <div class="success" id="success-section">
      <div class="success-icon">✅</div>
      <h2>Log Signed!</h2>
      <p style="color:#777;margin-top:8px;font-size:15px;">{mentee_name} will be notified right away.</p>
    </div>
  </div>
</div>

<script>
async function signLog() {{
  const btn = document.getElementById('sign-btn');
  const message = document.getElementById('mentor-message').value;
  btn.disabled = true;
  btn.textContent = 'Signing...';
  
  try {{
    const res = await fetch(`/api/sign/{token}/confirm`, {{
      method: 'POST',
      headers: {{ 'Content-Type': 'application/json' }},
      body: JSON.stringify({{ message: message }})
    }});
    const data = await res.json();
    
    if (data.success) {{
      document.getElementById('sign-section').style.display = 'none';
      document.getElementById('success-section').style.display = 'block';
    }} else {{
      btn.disabled = false;
      btn.textContent = '✍️ Sign This Log';
      alert('Something went wrong. Please try again.');
    }}
  }} catch (e) {{
    btn.disabled = false;
    btn.textContent = '✍️ Sign This Log';
    alert('Network error. Please try again.');
  }}
}}
</script>
</body>
</html>
""")


from pydantic import BaseModel as PydanticBase

class SignConfirmRequest(PydanticBase):
    message: str = ""

@router.post("/{token}/confirm")
async def confirm_sign(token: str, body: SignConfirmRequest = None):
    if body is None:
        body = SignConfirmRequest()
    """
    Mentor confirms signing — update DB and notify mentee.
    """
    # Find log
    result = supabase.table("daily_logs") \
        .select("*, profiles!daily_logs_user_id_fkey(full_name, id)") \
        .eq("mentor_sign_token", token) \
        .execute()

    if not result.data:
        raise HTTPException(404, "Invalid token")

    log = result.data[0]

    if log.get("signed"):
        raise HTTPException(400, "Already signed")

    # Mark as signed
    supabase.table("daily_logs").update({
        "signed": True,
        "signed_at": datetime.utcnow().isoformat(),
    }).eq("id", log["id"]).execute()

    mentor_message = body.message if body else ""

    # Notify mentee in app
    mentee_profile = log.get("profiles", {})
    mentee_id = mentee_profile.get("id")
    mentee_name = mentee_profile.get("full_name", "Mentee")

    if mentee_id:
       notif_message = f"Your mentor signed your log: \"{log.get('structured_title', 'Daily Log')}\""
       if mentor_message:
          notif_message += f"\n\nMentor's note: {mentor_message}"

    await create_notification(
        mentee_id,
        "log_signed",
        "✍️ Your log was signed!",
        notif_message
    )

    # Get mentee email from auth
    try:
        users = supabase.auth.admin.list_users()
        mentee_email = None
        for u in users:
            if str(u.id) == str(mentee_id):
                mentee_email = u.email
                break

        if mentee_email:
            # Get mentor name from the mentor_id stored on the log
            mentor_name = "Your Mentor"
            if log.get("mentor_id"):
                mentor_profile = supabase.table("profiles") \
                    .select("full_name") \
                    .eq("id", log["mentor_id"]) \
                    .execute()
                if mentor_profile.data:
                    mentor_name = mentor_profile.data[0]["full_name"]

            await send_signed_notification_to_mentee(
                mentee_email=mentee_email,
                mentee_name=mentee_name,
                mentor_name=mentor_name,
                log_title=log.get("structured_title", "Daily Log"),
                mentor_message=mentor_message,
            )
            
    except Exception:
        pass  # Don't fail the request if notification email errors

    return {"success": True}



