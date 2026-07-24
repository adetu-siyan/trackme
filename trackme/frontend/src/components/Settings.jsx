import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const { user, profile } = useAuth()

  const [time, setTime] = useState('08:00')
  const [reminderSaved, setReminderSaved] = useState(false)
  const [reminderLoading, setReminderLoading] = useState(false)

  const [notifLogSigned, setNotifLogSigned] = useState(true)
  const [notifWeeklyReview, setNotifWeeklyReview] = useState(true)
  const [notifProjectAssigned, setNotifProjectAssigned] = useState(true)
  const [notifSaved, setNotifSaved] = useState(false)

  const [calendarConnected, setCalendarConnected] = useState(false)
  const [recentEmails, setRecentEmails] = useState([])
  const [clearConfirm, setClearConfirm] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('flow-reminder-time')
    if (stored) setTime(stored)

    setCalendarConnected(!!localStorage.getItem('gcal-token'))

    const notifs = JSON.parse(localStorage.getItem('trackme-notifs') || '{}')
    if ('logSigned' in notifs) setNotifLogSigned(notifs.logSigned)
    if ('weeklyReview' in notifs) setNotifWeeklyReview(notifs.weeklyReview)
    if ('projectAssigned' in notifs) setNotifProjectAssigned(notifs.projectAssigned)

    const emails = JSON.parse(localStorage.getItem('trackme-recent-emails') || '[]')
    setRecentEmails(emails)
  }, [])

  async function saveReminder() {
    setReminderLoading(true)
    try {
      await fetch('/api/notifications/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email, time }),
      })
    } catch {}
    localStorage.setItem('flow-reminder-time', time)
    setReminderSaved(true)
    setReminderLoading(false)
    setTimeout(() => setReminderSaved(false), 3000)
  }

  function saveNotifPrefs() {
    localStorage.setItem('trackme-notifs', JSON.stringify({
      logSigned: notifLogSigned,
      weeklyReview: notifWeeklyReview,
      projectAssigned: notifProjectAssigned,
    }))
    setNotifSaved(true)
    setTimeout(() => setNotifSaved(false), 2500)
  }

  function removeRecentEmail(email) {
    const updated = recentEmails.filter(e => e !== email)
    setRecentEmails(updated)
    localStorage.setItem('trackme-recent-emails', JSON.stringify(updated))
  }

  function connectCalendar() {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId) {
      alert('Set VITE_GOOGLE_CLIENT_ID in your .env to enable Google Calendar.')
      return
    }
    const scope = encodeURIComponent('https://www.googleapis.com/auth/calendar.events')
    const redirect = encodeURIComponent(window.location.origin)
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirect}&response_type=token&scope=${scope}`
    const popup = window.open(url, 'gcal-auth', 'width=500,height=600')
    const timer = setInterval(() => {
      try {
        const hash = popup.location.hash
        if (hash && hash.includes('access_token')) {
          const params = new URLSearchParams(hash.slice(1))
          const token = params.get('access_token')
          localStorage.setItem('gcal-token', token)
          setCalendarConnected(true)
          popup.close()
          clearInterval(timer)
        }
      } catch {}
      if (popup.closed) clearInterval(timer)
    }, 500)
  }

  function disconnectCalendar() {
    localStorage.removeItem('gcal-token')
    setCalendarConnected(false)
  }

  function clearLocalData() {
    localStorage.removeItem('myflow-cards')
    localStorage.removeItem('myflow-notes')
    localStorage.removeItem('trackme-recent-emails')
    localStorage.removeItem('trackme-notifs')
    localStorage.removeItem('gcal-token')
    setRecentEmails([])
    setCalendarConnected(false)
    setClearConfirm(false)
    alert('Local data cleared.')
  }

  const Toggle = ({ value, onChange }) => (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 40, height: 22, borderRadius: 11,
        background: value ? 'var(--accent)' : 'var(--surface-3)',
        position: 'relative', cursor: 'pointer',
        transition: 'background 0.2s', flexShrink: 0,
        border: '1px solid var(--border)',
      }}
    >
      <div style={{
        position: 'absolute', top: 3,
        left: value ? 20 : 3,
        width: 14, height: 14,
        background: '#fff', borderRadius: '50%',
        transition: 'left 0.2s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
      }} />
    </div>
  )

  const SectionTitle = ({ emoji, title, subtitle }) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: subtitle ? 4 : 0 }}>
        <span style={{ fontSize: 18 }}>{emoji}</span>
        <div style={{
          fontSize: 11, letterSpacing: 2, fontWeight: 700,
          color: 'var(--accent)', textTransform: 'uppercase',
        }}>
          {title}
        </div>
      </div>
      {subtitle && (
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0 28px', lineHeight: 1.5 }}>
          {subtitle}
        </p>
      )}
      <div style={{ height: 1, background: 'var(--border)', marginTop: 14 }} />
    </div>
  )

  const Row = ({ label, desc, right, last }) => (
    <div style={{
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: 20,
      padding: '14px 0',
      borderBottom: last ? 'none' : '1px solid var(--border)',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
          {label}
        </div>
        {desc && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</div>
        )}
      </div>
      <div style={{ flexShrink: 0 }}>{right}</div>
    </div>
  )

  return (
    <div className="page" style={{ fontFamily: 'Urbanist, sans-serif', maxWidth: 640 }}>

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ marginBottom: 4 }}>Settings</h1>
        <p className="text-muted" style={{ fontSize: 15 }}>
          App behaviour, notifications, and integrations
        </p>
      </div>

      {/* Daily Reminder */}
      <div className="card" style={{ marginBottom: 16 }}>
        <SectionTitle
          emoji="⏰"
          title="Daily Reminder"
          subtitle={`We'll email ${user?.email} every day at the time you set to start your planning session.`}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            style={{
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '12px 16px',
              color: 'var(--text-primary)', fontSize: 16,
              fontWeight: 700, fontFamily: 'Urbanist, sans-serif',
              outline: 'none', colorScheme: 'dark', flex: 1,
            }}
          />
          <button
            onClick={saveReminder}
            disabled={reminderLoading}
            className="btn btn-primary"
            style={{
              padding: '12px 28px', flexShrink: 0,
              background: reminderSaved ? '#064E3B' : undefined,
              color: reminderSaved ? '#86EFAC' : undefined,
              border: reminderSaved ? '1px solid #065F46' : undefined,
            }}
          >
            {reminderSaved ? '✓ Saved' : reminderLoading ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="card" style={{ marginBottom: 16 }}>
        <SectionTitle
          emoji="🔔"
          title="Notifications"
          subtitle="Choose which in-app notifications you want to receive."
        />

        <Row
          label="Log signed"
          desc="When your mentor signs one of your daily logs"
          right={<Toggle value={notifLogSigned} onChange={setNotifLogSigned} />}
        />
        <Row
          label="Weekly review"
          desc="When your mentor sends your weekly progress review"
          right={<Toggle value={notifWeeklyReview} onChange={setNotifWeeklyReview} />}
        />
        <Row
          label="Project assigned"
          desc="When you are added to a new project"
          right={<Toggle value={notifProjectAssigned} onChange={setNotifProjectAssigned} />}
          last
        />

        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="btn btn-primary btn-sm"
            onClick={saveNotifPrefs}
            style={{
              background: notifSaved ? '#064E3B' : undefined,
              color: notifSaved ? '#86EFAC' : undefined,
              border: notifSaved ? '1px solid #065F46' : undefined,
            }}
          >
            {notifSaved ? '✓ Saved' : 'Save Preferences'}
          </button>
        </div>
      </div>

      {/* Google Calendar */}
      <div className="card" style={{ marginBottom: 16 }}>
        <SectionTitle
          emoji="📅"
          title="Google Calendar"
          subtitle="Connect your calendar to sync MyFlow tasks directly from your planning workspace."
        />

        {calendarConnected ? (
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: '#22C55E',
                boxShadow: '0 0 8px rgba(34,197,94,0.4)',
              }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                Connected
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                — Tasks sync to your primary calendar
              </span>
            </div>
            <button
              onClick={disconnectCalendar}
              className="btn btn-secondary btn-sm"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: 'var(--text-muted)',
              }} />
              <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                Not connected
              </span>
            </div>
            <button
              onClick={connectCalendar}
              className="btn btn-primary btn-sm"
            >
              Connect Google Calendar
            </button>
          </div>
        )}
      </div>

      {/* Recent Mentor Emails */}
      {recentEmails.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <SectionTitle
            emoji="📧"
            title="Saved Mentor Emails"
            subtitle="These appear as quick-select options when sending your daily log. Remove any you no longer need."
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentEmails.map((email, i) => (
              <div
                key={email}
                style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', gap: 12,
                  padding: '10px 14px', borderRadius: 10,
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 14 }}>📧</span>
                  <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>
                    {email}
                  </span>
                </div>
                <button
                  onClick={() => removeRecentEmail(email)}
                  style={{
                    background: 'none', border: 'none',
                    color: 'var(--text-muted)', cursor: 'pointer',
                    fontSize: 18, padding: '0 4px', lineHeight: 1,
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data & Privacy */}
      <div className="card" style={{
        marginBottom: 16,
        border: '1px solid var(--danger-soft)',
      }}>
        <SectionTitle
          emoji="🗑"
          title="Data & Privacy"
          subtitle="Clear locally stored data. This does not delete your account or any server data."
        />

        <Row
          label="Clear local data"
          desc="Removes MyFlow tasks, notes, saved mentor emails, and calendar token from this device"
          last
          right={
            clearConfirm ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setClearConfirm(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={clearLocalData}
                  style={{
                    padding: '6px 14px', borderRadius: 8,
                    border: 'none', background: 'var(--danger)',
                    color: '#fff', cursor: 'pointer',
                    fontFamily: 'Urbanist, sans-serif',
                    fontWeight: 600, fontSize: 12,
                  }}
                >
                  Confirm Clear
                </button>
              </div>
            ) : (
              <button
                onClick={() => setClearConfirm(true)}
                style={{
                  padding: '6px 14px', borderRadius: 8,
                  border: '1px solid var(--danger-soft)',
                  background: 'none', color: 'var(--danger)',
                  cursor: 'pointer', fontFamily: 'Urbanist, sans-serif',
                  fontWeight: 600, fontSize: 12, transition: 'all 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-soft)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                Clear Data
              </button>
            )
          }
        />
      </div>

      {/* App Info */}
      <div className="card">
        <SectionTitle emoji="ℹ️" title="App Info" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'Version', value: '1.0.0' },
            { label: 'Stack', value: 'React + FastAPI + Supabase + Groq' },
            { label: 'Built by', value: 'S/YAN' },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: label !== 'Built by' ? '1px solid var(--border)' : 'none',
              }}
            >
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
              <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}