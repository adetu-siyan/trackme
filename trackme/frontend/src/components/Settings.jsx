import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const { user } = useAuth()
  const [time, setTime] = useState('08:00')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('flow-reminder-time')
    if (stored) setTime(stored)
  }, [])

  async function saveReminder() {
    setLoading(true)
    try {
      // Call your existing notification endpoint
      await fetch('/api/notifications/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email, time }),
      })
      localStorage.setItem('flow-reminder-time', time)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      // Even if backend isn't ready, store locally
      localStorage.setItem('flow-reminder-time', time)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0D0D0D',
      padding: '32px 28px',
      fontFamily: 'Urbanist, sans-serif',
    }}>
      <div style={{ maxWidth: 480 }}>
        <div style={{ fontSize: 12, color: '#444', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>
          Configuration
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#F5F0E8', margin: '0 0 32px', letterSpacing: '-0.5px' }}>
          Settings
        </h1>

        {/* Reminder time */}
        <div style={{
          background: '#141414',
          border: '1px solid #1E1E1E',
          borderRadius: 16,
          padding: '24px',
          marginBottom: 16,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#E8E0D0', marginBottom: 4 }}>
            Daily flow reminder
          </div>
          <div style={{ fontSize: 13, color: '#555', marginBottom: 20, lineHeight: 1.5 }}>
            We'll send an email to <span style={{ color: '#D4A853' }}>{user?.email}</span> to prompt your daily planning session.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              style={{
                background: '#1A1A1A',
                border: '1px solid #2A2A2A',
                borderRadius: 10,
                padding: '10px 14px',
                color: '#E8E0D0',
                fontSize: 18,
                fontWeight: 700,
                fontFamily: 'Urbanist, sans-serif',
                outline: 'none',
                cursor: 'pointer',
                colorScheme: 'dark',
              }}
            />
            <span style={{ fontSize: 13, color: '#444' }}>every day</span>
            <button
              onClick={saveReminder}
              disabled={loading}
              style={{
                marginLeft: 'auto',
                background: saved ? '#1A2A1E' : '#D4A853',
                color: saved ? '#22C55E' : '#0D0D0D',
                border: 'none',
                borderRadius: 10,
                padding: '10px 20px',
                fontSize: 13,
                fontWeight: 700,
                fontFamily: 'Urbanist, sans-serif',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {saved ? '✓ Saved' : loading ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>

        {/* Account info — read only */}
        <div style={{
          background: '#141414',
          border: '1px solid #1E1E1E',
          borderRadius: 16,
          padding: '24px',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#E8E0D0', marginBottom: 16 }}>
            Account
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Email', value: user?.email },
              { label: 'User ID', value: user?.id?.slice(0, 16) + '…' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#555' }}>{label}</span>
                <span style={{ fontSize: 13, color: '#888', fontFamily: 'monospace' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}