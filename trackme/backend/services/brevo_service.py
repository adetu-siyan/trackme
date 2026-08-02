import httpx
from config import settings

BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"
FROM_ADDRESS = {"name": "Dôti", "email": "trackme.notify@gmail.com"}
BANNER_URL = "https://sttreniayhkfjyuepkfi.supabase.co/storage/v1/object/public/assets/Welcomes%20you.png"


async def send_email(to: str, subject: str, html: str):
    payload = {
        "sender": FROM_ADDRESS,
        "to": [{"email": to}],
        "subject": subject,
        "htmlContent": html,
    }
    headers = {
        "api-key": settings.brevo_api_key,
        "Content-Type": "application/json",
    }
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(BREVO_API_URL, json=payload, headers=headers)
            print(f"[BREVO] Status: {response.status_code}")
            print(f"[BREVO] Response: {response.text}")
            response.raise_for_status()
            return response.json()
    except Exception as e:
        print(f"[BREVO] ❌ Exception: {type(e).__name__}: {e}")
        raise


async def send_welcome_email(
    user_email: str,
    full_name: str,
    role: str,
):
    first_name = full_name.split(" ")[0] if full_name else "there"
    is_mentor = role == "mentor"

    role_blurb = (
        "As a <strong>mentor</strong>, you can create projects, assign tasks, "
        "review your mentees' daily logs, sign them off, and send weekly progress reviews. "
        "Your mentees are counting on you to show up."
        if is_mentor else
        "As a <strong>mentee</strong>, you can log what you learn every day, take AI-powered "
        "verification tests, and send your logs to your mentor for sign-off. "
        "Consistency is everything — your streak starts today."
    )

    what_is_doti = [
        ("📝", "Daily Logging", "Write what you learned. AI restructures it into a clean, professional log in seconds."),
        ("🤖", "AI Verification", "After each log, get a real-world scenario question to test if you actually understood what you studied."),
        ("✍️", "Mentor Sign-off", "Send your log to your mentor. They review, leave a note, and sign it — keeping you accountable."),
        ("📋", "Projects & Tasks", "Mentors create projects and weekly focus areas. Mentees log against them to track real progress."),
        ("🔥", "Streaks", "Log every day. Build your streak. Don't let it die."),
    ]

    features_html = "".join([
        f"""
        <div style="display:flex;gap:14px;align-items:flex-start;
                    padding:14px 0;border-bottom:1px solid #F0EEF8;">
          <div style="font-size:24px;flex-shrink:0;width:32px;text-align:center;">{emoji}</div>
          <div>
            <div style="font-size:14px;font-weight:700;color:#0D0D0D;margin-bottom:3px;">{title}</div>
            <div style="font-size:13px;color:#555;line-height:1.6;">{desc}</div>
          </div>
        </div>
        """
        for emoji, title, desc in what_is_doti
    ])

    html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#F5F4FF;font-family:Urbanist,Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:20px;
              overflow:hidden;box-shadow:0 4px 32px rgba(124,58,237,0.10);">

    <!-- Banner -->
    <div style="width:100%;line-height:0;">
      <img
        src="{BANNER_URL}"
        alt="Dôti — Welcomes you"
        style="width:100%;display:block;object-fit:cover;"
      />
    </div>

    <!-- Body -->
    <div style="padding:36px 40px;">

      <!-- Greeting -->
      <h1 style="font-size:22px;font-weight:800;color:#0D0D0D;
                 margin:0 0 8px;letter-spacing:-0.3px;">
        Welcome, {first_name} 👋
      </h1>
      <p style="font-size:15px;color:#555;line-height:1.7;margin:0 0 24px;">
        {role_blurb}
      </p>

      <!-- What is Dôti -->
      <div style="background:#F8F6FF;border-radius:14px;padding:20px 24px;margin-bottom:28px;
                  border:1px solid #E8E5FF;">
        <div style="font-size:10px;letter-spacing:2.5px;font-weight:700;
                    color:#7C3AED;text-transform:uppercase;margin-bottom:4px;">
          What is Dôti?
        </div>
        <p style="font-size:14px;color:#444;line-height:1.7;margin:0 0 16px;">
          <strong>Don't Overthink it — Stay Accountable.</strong> Dôti is a mentorship 
          accountability platform that bridges the gap between learning and real progress. 
          Every day you log, your mentor sees it. Every week, you get reviewed. 
          No room to coast.
        </p>
        {features_html}
      </div>

      <!-- CTA -->
      <div style="text-align:center;margin-bottom:28px;">
        <a href="{settings.app_url}"
           style="display:inline-block;background:#7C3AED;color:#fff;
                  text-decoration:none;padding:15px 48px;border-radius:12px;
                  font-weight:700;font-size:15px;font-family:Urbanist,Arial,sans-serif;
                  letter-spacing:0.2px;">
          {"→ Start Reviewing Your Mentees" if is_mentor else "→ Log Your First Day"}
        </a>
      </div>

      <!-- Mental health note -->
      <div style="background:#F5F0FF;border:1px solid #DDD6FE;border-radius:10px;
                  padding:14px 18px;margin-bottom:28px;text-align:center;">
        <p style="color:#7C3AED;font-size:13px;margin:0;font-weight:600;line-height:1.6;">
          💜 Dôti cares about your mental health.<br>
          <span style="font-weight:400;color:#6D28D9;">
            Progress isn't linear — log the hard days too.
          </span>
        </p>
      </div>

      <hr style="border:none;border-top:1px solid #F0EEF8;margin:0 0 20px;">
      <p style="color:#ccc;font-size:11px;text-align:center;margin:0;letter-spacing:0.5px;">
        Powered by Dôti &nbsp;·&nbsp; Built by S / Y A N
      </p>
    </div>
  </div>
</body>
</html>"""

    await send_email(
        to=user_email,
        subject=f"Welcome to Dôti, {first_name} 👋 — Don't Overthink it. Stay Accountable.",
        html=html
    )


async def send_log_to_mentor(
    mentor_email: str,
    mentor_name: str,
    mentee_name: str,
    log_title: str,
    log_content: str,
    log_topics: list,
    sign_token: str,
    log_id: str
):
    sign_url = f"{settings.backend_url}/api/sign/{sign_token}"

    topics_html = "".join([
        f'<span style="background:#7C3AED22;color:#7C3AED;padding:3px 10px;'
        f'border-radius:20px;font-size:12px;margin-right:6px;font-family:Urbanist,sans-serif;">'
        f'{t}</span>'
        for t in log_topics
    ])

    content_html = (log_content or "").replace("\n\n", "</p><p>").replace("\n", "<br>")

    html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#F5F4FF;font-family:Urbanist,Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:16px;
              overflow:hidden;box-shadow:0 4px 24px rgba(124,58,237,0.08);">
    <div style="background:#0A0A0F;padding:28px 36px;">
      <div style="font-size:24px;font-weight:800;color:#fff;letter-spacing:-0.5px;">Dôti</div>
      <div style="color:#555;font-size:11px;margin-top:4px;letter-spacing:4px;font-weight:600;">S / Y A N</div>
    </div>
    <div style="padding:36px 40px;">
      <p style="color:#555;font-size:15px;margin:0 0 6px;">Hello {mentor_name},</p>
      <h1 style="font-size:21px;font-weight:700;color:#0D0D0D;margin:0 0 6px;letter-spacing:-0.3px;">
        {mentee_name} submitted a daily log
      </h1>
      <p style="color:#888;font-size:14px;margin:0 0 28px;">
        They are waiting for your sign-off to confirm today's session.
      </p>
      <div style="border:1.5px solid #E8E5FF;border-radius:12px;overflow:hidden;margin-bottom:28px;">
        <div style="background:#F8F6FF;padding:18px 24px;border-bottom:1px solid #E8E5FF;">
          <div style="font-size:10px;letter-spacing:2px;color:#7C3AED;font-weight:700;
                      text-transform:uppercase;margin-bottom:8px;">Today's Log</div>
          <h2 style="font-size:17px;font-weight:700;color:#0D0D0D;margin:0 0 10px;
                     letter-spacing:-0.2px;">{log_title}</h2>
          <div>{topics_html}</div>
        </div>
        <div style="padding:22px 24px;color:#444;font-size:14px;line-height:1.8;">
          <p style="margin:0;">{content_html}</p>
        </div>
      </div>
      <div style="text-align:center;margin-bottom:28px;">
        <a href="{sign_url}"
           style="display:inline-block;background:#7C3AED;color:#fff;text-decoration:none;
                  padding:14px 40px;border-radius:10px;font-weight:700;font-size:15px;
                  font-family:Urbanist,Arial,sans-serif;letter-spacing:0.2px;">
          ✍️ Sign This Log
        </a>
        <p style="color:#bbb;font-size:11px;margin-top:12px;">
          Or copy this link:<br>
          <a href="{sign_url}" style="color:#7C3AED;word-break:break-all;">{sign_url}</a>
        </p>
      </div>
      <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:8px;
                  padding:12px 16px;margin-bottom:24px;">
        <p style="color:#92400E;font-size:12px;margin:0;line-height:1.6;">
          📌 If this landed in spam, please mark it as <strong>Not Spam</strong>
          so future logs reach you instantly.
        </p>
      </div>
      <hr style="border:none;border-top:1px solid #F0EEF8;margin:0 0 20px;">
      <p style="color:#ccc;font-size:11px;text-align:center;margin:0;letter-spacing:0.5px;">
        Powered by Dôti &nbsp;·&nbsp; Built by S / Y A N
      </p>
    </div>
  </div>
</body>
</html>"""

    await send_email(
        to=mentor_email,
        subject=f"📋 {mentee_name} logged today — sign-off needed",
        html=html
    )


async def send_signed_notification_to_mentee(
    mentee_email: str,
    mentee_name: str,
    mentor_name: str,
    log_title: str,
    mentor_message: str = ""
):
    mentor_note_html = ""
    if mentor_message and mentor_message.strip():
        mentor_note_html = f"""
      <div style="background:#F8F6FF;border-left:3px solid #7C3AED;border-radius:0 8px 8px 0;
                  padding:14px 18px;margin:0 0 20px;text-align:left;">
        <div style="font-size:10px;letter-spacing:2px;font-weight:700;color:#7C3AED;
                    margin-bottom:6px;text-transform:uppercase;">Mentor's Note</div>
        <p style="color:#444;font-size:14px;line-height:1.7;margin:0;">{mentor_message}</p>
      </div>"""

    html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#F5F4FF;font-family:Urbanist,Arial,sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:16px;
              overflow:hidden;box-shadow:0 4px 24px rgba(124,58,237,0.08);">
    <div style="background:#0A0A0F;padding:24px 32px;">
      <div style="font-size:22px;font-weight:800;color:#fff;">Dôti</div>
    </div>
    <div style="padding:36px 40px;text-align:center;">
      <div style="font-size:52px;margin-bottom:14px;">✅</div>
      <h1 style="font-size:20px;font-weight:700;color:#0D0D0D;margin:0 0 10px;letter-spacing:-0.3px;">
        Your log has been signed!
      </h1>
      <p style="color:#777;font-size:14px;margin:0 0 24px;line-height:1.7;">
        {mentor_name} reviewed and signed your log:<br>
        <strong style="color:#0D0D0D;">"{log_title}"</strong>
      </p>
      {mentor_note_html}
      <div style="background:#F0FDF4;border-radius:10px;padding:14px 18px;margin-bottom:20px;">
        <p style="color:#166534;font-size:13px;margin:0;line-height:1.6;">
          🔥 Keep the streak alive — log again tomorrow!
        </p>
      </div>
      <hr style="border:none;border-top:1px solid #F0EEF8;margin:0 0 16px;">
      <p style="color:#ccc;font-size:11px;margin:0;letter-spacing:0.5px;">
        Powered by Dôti &nbsp;·&nbsp; S / Y A N
      </p>
    </div>
  </div>
</body>
</html>"""

    await send_email(
        to=mentee_email,
        subject=f"✅ {mentor_name} signed your log — {log_title}",
        html=html
    )


async def send_reminder_email(
    mentee_email: str,
    mentee_name: str,
    slot: str,
    day_of_week: str = "",
    subject_override: str = None,
    body_override: str = None,
):
    slot_meta = {
        "morning": ("☀️", "Good morning"),
        "evening": ("🌙", "Hey hey"),
        "mentor":  ("📋", "Hi there"),
    }
    emoji, default_greeting = slot_meta.get(slot, slot_meta["morning"])

    subject = subject_override or (
        f"Good morning {mentee_name} 😊 — {day_of_week} starts now"
        if slot == "morning" else
        f"Hey hey {mentee_name} — don't forget to log today 🌙"
        if slot == "evening" else
        f"Hi {mentee_name} — your mentees need you 📋"
    )

    body = body_override or (
        f"Good morning {mentee_name}! Today is {day_of_week} — let's get it. Dôti cares about your mental health 💜"
        if slot == "morning" else
        f"Hey hey {mentee_name}, the day is almost over — don't forget to log your activity before you sleep!"
        if slot == "evening" else
        f"Hi there {mentee_name}, your mentees are counting on you — check for any unsigned logs and stay on high alert."
    )

    mental_health_html = ""
    if slot == "morning":
        mental_health_html = """
      <div style="margin-top:20px;padding:12px 16px;border-radius:10px;
                  background:#F5F0FF;border:1px solid #DDD6FE;text-align:center;">
        <p style="color:#7C3AED;font-size:13px;margin:0;font-weight:600;">
          💜 Dôti cares about your mental health
        </p>
      </div>"""

    cta_text = "→ View Mentees" if slot == "mentor" else "📝 Log Today"

    html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#F5F4FF;font-family:Urbanist,Arial,sans-serif;">
  <div style="max-width:480px;margin:40px auto;background:#fff;border-radius:16px;
              overflow:hidden;box-shadow:0 4px 24px rgba(124,58,237,0.08);">
    <div style="background:#0A0A0F;padding:24px 32px;">
      <div style="font-size:22px;font-weight:800;color:#fff;">Dôti</div>
    </div>
    <div style="padding:36px 40px;text-align:center;">
      <div style="font-size:48px;margin-bottom:16px;">{emoji}</div>
      <p style="color:#444;font-size:15px;line-height:1.8;margin:0 0 8px;text-align:left;">
        {body}
      </p>
      {mental_health_html}
      <div style="margin-top:28px;">
        <a href="{settings.app_url}"
           style="display:inline-block;background:#7C3AED;color:#fff;text-decoration:none;
                  padding:14px 40px;border-radius:10px;font-weight:700;font-size:15px;
                  font-family:Urbanist,Arial,sans-serif;">
          {cta_text}
        </a>
      </div>
      <p style="color:#ccc;font-size:11px;margin-top:24px;">
        You're receiving this because reminders are enabled in your Dôti settings.
      </p>
    </div>
  </div>
</body>
</html>"""

    await send_email(to=mentee_email, subject=subject, html=html)
    
async def send_project_assigned_email(
    mentee_email: str,
    mentee_name: str,
    mentor_name: str,
    project_title: str,
    project_id: str,
):
    first_name = mentee_name.split(" ")[0] if mentee_name else "there"


    html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#F5F4FF;font-family:Urbanist,Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;
              overflow:hidden;box-shadow:0 4px 24px rgba(124,58,237,0.08);">
    <div style="background:#0A0A0F;padding:24px 32px;">
      <div style="font-size:22px;font-weight:800;color:#fff;">Dôti</div>
    </div>
    <div style="padding:36px 40px;">
      <div style="font-size:36px;margin-bottom:16px;">📋</div>
      <h1 style="font-size:20px;font-weight:800;color:#0D0D0D;margin:0 0 8px;">
        You've been added to a project
      </h1>
      <p style="font-size:15px;color:#555;line-height:1.7;margin:0 0 24px;">
        Hey {first_name}, <strong>{mentor_name}</strong> just assigned you to a new project.
      </p>
      <div style="background:#F8F6FF;border:1.5px solid #E8E5FF;border-radius:12px;
                  padding:20px 24px;margin-bottom:28px;">
        <div style="font-size:10px;letter-spacing:2px;color:#7C3AED;font-weight:700;
                    text-transform:uppercase;margin-bottom:8px;">Project</div>
        <div style="font-size:18px;font-weight:700;color:#0D0D0D;">{project_title}</div>
      </div>
      <div style="text-align:center;margin-bottom:28px;">
        <a href="{settings.app_url}"
           style="display:inline-block;background:#7C3AED;color:#fff;
                  text-decoration:none;padding:14px 40px;border-radius:10px;
                  font-weight:700;font-size:15px;font-family:Urbanist,Arial,sans-serif;">
          → View Project
        </a>
      </div>
      <hr style="border:none;border-top:1px solid #F0EEF8;margin:0 0 16px;">
      <p style="color:#ccc;font-size:11px;text-align:center;margin:0;">
        Powered by Dôti &nbsp;·&nbsp; Built by S / Y A N
      </p>
    </div>
  </div>
</body>
</html>"""

    await send_email(
        to=mentee_email,
        subject=f"📋 {mentor_name} added you to \"{project_title}\"",
        html=html
    )


async def send_weekly_focus_email(
    mentee_email: str,
    mentee_name: str,
    mentor_name: str,
    summary: str,
    task_count: int,
    week_start: str,
    week_end: str,
):
    first_name = mentee_name.split(" ")[0] if mentee_name else "there"

    html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#F5F4FF;font-family:Urbanist,Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;
              overflow:hidden;box-shadow:0 4px 24px rgba(124,58,237,0.08);">
    <div style="background:#0A0A0F;padding:24px 32px;">
      <div style="font-size:22px;font-weight:800;color:#fff;">Dôti</div>
    </div>
    <div style="padding:36px 40px;">
      <div style="font-size:36px;margin-bottom:16px;">📅</div>
      <h1 style="font-size:20px;font-weight:800;color:#0D0D0D;margin:0 0 8px;">
        Your weekly focus is set
      </h1>
      <p style="font-size:15px;color:#555;line-height:1.7;margin:0 0 24px;">
        Hey {first_name}, <strong>{mentor_name}</strong> just set your focus for the week of
        <strong>{week_start}</strong> → <strong>{week_end}</strong>.
      </p>
      <div style="background:#F8F6FF;border:1.5px solid #E8E5FF;border-radius:12px;
                  padding:20px 24px;margin-bottom:16px;">
        <div style="font-size:10px;letter-spacing:2px;color:#7C3AED;font-weight:700;
                    text-transform:uppercase;margin-bottom:8px;">This Week's Focus</div>
        <p style="font-size:15px;color:#0D0D0D;font-weight:600;margin:0 0 12px;">{summary}</p>
        <div style="display:inline-flex;align-items:center;gap:6px;
                    background:#7C3AED;color:#fff;padding:6px 14px;
                    border-radius:20px;font-size:13px;font-weight:700;">
          {task_count} tasks waiting for you
        </div>
      </div>
      <div style="background:#F0FDF4;border-radius:10px;padding:14px 18px;margin-bottom:28px;">
        <p style="color:#166534;font-size:13px;margin:0;line-height:1.6;">
          🔥 Log every day this week and keep the streak alive.
        </p>
      </div>
      <div style="text-align:center;margin-bottom:28px;">
        <a href="{settings.app_url}"
           style="display:inline-block;background:#7C3AED;color:#fff;
                  text-decoration:none;padding:14px 40px;border-radius:10px;
                  font-weight:700;font-size:15px;font-family:Urbanist,Arial,sans-serif;">
          → View Weekly Plan
        </a>
      </div>
      <hr style="border:none;border-top:1px solid #F0EEF8;margin:0 0 16px;">
      <p style="color:#ccc;font-size:11px;text-align:center;margin:0;">
        Powered by Dôti &nbsp;·&nbsp; Built by S / Y A N
      </p>
    </div>
  </div>
</body>
</html>"""

    await send_email(
        to=mentee_email,
        subject=f"📅 {mentor_name} set your focus for this week — {task_count} tasks",
        html=html
    )


async def send_mentor_request_accepted_email(
    mentee_email: str,
    mentee_name: str,
    mentor_name: str,
):
    first_name = mentee_name.split(" ")[0] if mentee_name else "there"

    html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#F5F4FF;font-family:Urbanist,Arial,sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:16px;
              overflow:hidden;box-shadow:0 4px 24px rgba(124,58,237,0.08);">
    <div style="background:#0A0A0F;padding:24px 32px;">
      <div style="font-size:22px;font-weight:800;color:#fff;">Dôti</div>
    </div>
    <div style="padding:36px 40px;text-align:center;">
      <div style="font-size:52px;margin-bottom:14px;">🎉</div>
      <h1 style="font-size:20px;font-weight:800;color:#0D0D0D;margin:0 0 10px;">
        Your mentor request was accepted!
      </h1>
      <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 24px;">
        Hey {first_name}, <strong>{mentor_name}</strong> accepted your request.
        You're now connected — start logging and send your first log today.
      </p>
      <div style="background:#F0FDF4;border-radius:10px;padding:14px 18px;margin-bottom:28px;">
        <p style="color:#166534;font-size:13px;margin:0;line-height:1.6;">
          🔥 Your streak starts now. Log something today.
        </p>
      </div>
      <a href="{settings.app_url}"
         style="display:inline-block;background:#7C3AED;color:#fff;
                text-decoration:none;padding:14px 40px;border-radius:10px;
                font-weight:700;font-size:15px;font-family:Urbanist,Arial,sans-serif;">
        → Start Logging
      </a>
      <hr style="border:none;border-top:1px solid #F0EEF8;margin:28px 0 16px;">
      <p style="color:#ccc;font-size:11px;margin:0;">
        Powered by Dôti &nbsp;·&nbsp; Built by S / Y A N
      </p>
    </div>
  </div>
</body>
</html>"""

    await send_email(
        to=mentee_email,
        subject=f"🎉 {mentor_name} accepted your mentor request — you're connected!",
        html=html
    )