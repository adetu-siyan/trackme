import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import settings


def send_email(to: str, subject: str, html: str):
    """
    Core Gmail SMTP sender.
    Uses app password — never the main Gmail password.
    """
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"Trackme <{settings.gmail_user}>"
    msg["To"] = to
    msg["X-Priority"] = "1"
    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(settings.gmail_user, settings.gmail_app_password)
        server.sendmail(settings.gmail_user, to, msg.as_string())


def send_log_to_mentor(
    mentor_email: str,
    mentor_name: str,
    mentee_name: str,
    log_title: str,
    log_content: str,
    log_topics: list,
    sign_token: str,
    log_id: str
):
    """Send structured log to mentor with signing link."""
    sign_url = f"{settings.app_url}/sign/{sign_token}"

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
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(124,58,237,0.08);">

    <!-- Header -->
    <div style="background:#0A0A0F;padding:28px 36px;">
      <div style="font-size:24px;font-weight:800;color:#fff;letter-spacing:-0.5px;">
        Trackm<span style="color:#7C3AED;">e</span>
      </div>
      <div style="color:#555;font-size:11px;margin-top:4px;letter-spacing:4px;font-weight:600;">
        S / Y A N
      </div>
    </div>

    <!-- Body -->
    <div style="padding:36px 40px;">
      <p style="color:#555;font-size:15px;margin:0 0 6px;font-family:Urbanist,Arial,sans-serif;">
        Hello {mentor_name},
      </p>
      <h1 style="font-size:21px;font-weight:700;color:#0D0D0D;margin:0 0 6px;letter-spacing:-0.3px;">
        {mentee_name} submitted a daily log
      </h1>
      <p style="color:#888;font-size:14px;margin:0 0 28px;">
        They are waiting for your sign-off to confirm today's session.
      </p>

      <!-- Log Card -->
      <div style="border:1.5px solid #E8E5FF;border-radius:12px;overflow:hidden;margin-bottom:28px;">
        <div style="background:#F8F6FF;padding:18px 24px;border-bottom:1px solid #E8E5FF;">
          <div style="font-size:10px;letter-spacing:2px;color:#7C3AED;font-weight:700;text-transform:uppercase;margin-bottom:8px;">
            Today's Log
          </div>
          <h2 style="font-size:17px;font-weight:700;color:#0D0D0D;margin:0 0 10px;letter-spacing:-0.2px;">
            {log_title}
          </h2>
          <div>{topics_html}</div>
        </div>
        <div style="padding:22px 24px;color:#444;font-size:14px;line-height:1.8;">
          <p style="margin:0;">{content_html}</p>
        </div>
      </div>

      <!-- CTA -->
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

      <!-- Anti-spam note -->
      <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:8px;padding:12px 16px;margin-bottom:24px;">
        <p style="color:#92400E;font-size:12px;margin:0;line-height:1.6;">
          📌 If this landed in spam, please mark it as <strong>Not Spam</strong> so future logs reach you instantly.
        </p>
      </div>

      <hr style="border:none;border-top:1px solid #F0EEF8;margin:0 0 20px;">
      <p style="color:#ccc;font-size:11px;text-align:center;margin:0;letter-spacing:0.5px;">
        Powered by Trackme &nbsp;·&nbsp; Built by S / Y A N
      </p>
    </div>
  </div>
</body>
</html>"""

    send_email(
        to=mentor_email,
        subject=f"📋 {mentee_name} logged today — sign-off needed",
        html=html
    )


def send_signed_notification_to_mentee(
    mentee_email: str,
    mentee_name: str,
    mentor_name: str,
    log_title: str,
    mentor_message: str = ""
):
    """Notify mentee that their log has been signed, with optional mentor note."""

    mentor_note_html = ""
    if mentor_message and mentor_message.strip():
        mentor_note_html = f"""
      <div style="background:#F8F6FF;border-left:3px solid #7C3AED;border-radius:0 8px 8px 0;
                  padding:14px 18px;margin:0 0 20px;text-align:left;">
        <div style="font-size:10px;letter-spacing:2px;font-weight:700;color:#7C3AED;
                    margin-bottom:6px;text-transform:uppercase;">
          Mentor's Note
        </div>
        <p style="color:#444;font-size:14px;line-height:1.7;margin:0;">
          {mentor_message}
        </p>
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

    <!-- Header -->
    <div style="background:#0A0A0F;padding:24px 32px;">
      <div style="font-size:22px;font-weight:800;color:#fff;">
        Trackm<span style="color:#7C3AED;">e</span>
      </div>
    </div>

    <!-- Body -->
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
        Powered by Trackme &nbsp;·&nbsp; S / Y A N
      </p>
    </div>
  </div>
</body>
</html>"""

    send_email(
        to=mentee_email,
        subject=f"✅ {mentor_name} signed your log — {log_title}",
        html=html
    )