import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

const BYPASS_EMAIL = 'adetusiyan@gmail.com'

const PRIORITY_COLORS = {
  high:   { background: 'rgba(248, 113, 113, 0.08)', border: 'rgba(248, 113, 113, 0.3)', color: '#F87171', label: 'HIGH PRIORITY' },
  medium: { background: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.3)', color: '#F59E0B', label: 'MEDIUM PRIORITY' },
  low:    { background: 'rgba(134, 239, 172, 0.08)', border: 'rgba(134, 239, 172, 0.3)', color: '#86EFAC', label: 'LOW PRIORITY' },
}

const NOTE_COLORS = [
  { bg: 'linear-gradient(135deg, #FFF8E8 0%, #FFF1D6 100%)', color: '#B45309', name: 'Warm Beige' },
  { bg: 'linear-gradient(135deg, #ECFDF3 0%, #D1FAE5 100%)', color: '#065F46', name: 'Mint' },
  { bg: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)', color: '#5B21B6', name: 'Lavender' },
  { bg: 'linear-gradient(135deg, #FFF1F2 0%, #FEE2E2 100%)', color: '#991B1B', name: 'Rose' },
  { bg: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', color: '#1E3A8A', name: 'Sky' },
  { bg: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)', color: '#9A3412', name: 'Peach' },
]

const GearIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
)

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

function ComingSoon() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.55)',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      fontFamily: 'Urbanist, sans-serif',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 20,
        padding: '48px 40px',
        maxWidth: 520,
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
        position: 'relative',
      }}>
        {/* Icon */}
        <div style={{ fontSize: 56, marginBottom: 20 }}>⚡</div>

        {/* Title */}
        <h2 style={{
          fontSize: 26, fontWeight: 800,
          color: '#111', marginBottom: 12,
          letterSpacing: '-0.5px',
        }}>
          MyFlow is coming soon
        </h2>

        {/* Subtitle */}
        <p style={{
          fontSize: 15, color: '#666',
          lineHeight: 1.7, marginBottom: 32,
          maxWidth: 400, margin: '0 auto 32px',
        }}>
          Your personal AI planning workspace is almost ready. We're building something that turns your chaos into clarity.
        </p>

        {/* Feature list — matches the HOW IT WORKS style */}
        <div style={{
          background: '#F5F3FF',
          borderRadius: 14,
          padding: '20px 24px',
          marginBottom: 32,
          textAlign: 'left',
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: 2,
            color: '#7C3AED', textTransform: 'uppercase', marginBottom: 16,
          }}>
            What's coming
          </div>

          {[
            { num: 1, text: 'Dump tasks in plain English — AI structures them instantly' },
            { num: 2, text: 'Smart time suggestions based on your learning patterns' },
            { num: 3, text: 'One-click sync to Google Calendar' },
            { num: 4, text: 'Quick notes and ideas — always autosaved' },
            { num: 5, text: 'Daily momentum tracking and progress streaks' },
          ].map(({ num, text }) => (
            <div key={num} style={{
              display: 'flex', alignItems: 'flex-start', gap: 14,
              marginBottom: num === 5 ? 0 : 14,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: '#7C3AED', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, flexShrink: 0,
              }}>
                {num}
              </div>
              <span style={{
                fontSize: 14, color: '#333',
                lineHeight: 1.6, paddingTop: 4,
              }}>
                {text}
              </span>
            </div>
          ))}
        </div>

        {/* CTA button */}
        <div style={{
          background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
          borderRadius: 12, padding: '16px 32px',
          fontSize: 15, fontWeight: 700, color: '#fff',
          cursor: 'default',
          letterSpacing: '0.2px',
        }}>
          🔔 You'll be notified the moment it drops
        </div>
      </div>
    </div>
  )
}

function SettingsPanel({ onClose, user, calendarConnected, setCalendarConnected }) {
  const [time, setTime] = useState(() => localStorage.getItem('flow-reminder-time') || '08:00')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  async function saveReminder() {
    setLoading(true)
    try {
      await fetch(`${import.meta.env.VITE_API_URL || ''}/api/notifications/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email, time }),
      })
    } catch {}
    localStorage.setItem('flow-reminder-time', time)
    setSaved(true)
    setLoading(false)
    setTimeout(() => setSaved(false), 3000)
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

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 200,
        }}
      />
      <div style={{
        position: 'fixed',
        top: 0, right: 0, bottom: 0,
        width: 380,
        background: 'var(--surface)',
        borderLeft: '1px solid var(--border)',
        zIndex: 201,
        padding: '32px 28px',
        display: 'flex', flexDirection: 'column', gap: 24,
        overflowY: 'auto',
        fontFamily: 'Urbanist, sans-serif',
        boxShadow: '-8px 0 30px rgba(0,0,0,0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
              MyFlow
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.3px' }}>
              Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              color: 'var(--text-muted)', cursor: 'pointer',
              padding: 8, borderRadius: 10,
              display: 'flex', alignItems: 'center', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="card" style={{ gap: 0, padding: '20px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16, fontWeight: 600 }}>
            Google Calendar
          </div>
          {calendarConnected ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 10, height: 10, background: '#22C55E', borderRadius: '50%', boxShadow: '0 0 10px rgba(34,197,94,0.4)' }} />
                <span style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 }}>Connected</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
                Tasks sync automatically to your primary Google Calendar.
              </p>
              <button onClick={disconnectCalendar} className="btn" style={{ fontSize: 13, padding: '10px 18px', background: 'var(--surface-2)', color: 'var(--text-muted)', width: '100%' }}>
                Disconnect Calendar
              </button>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
                Connect Google Calendar to sync your scheduled tasks.
              </p>
              <button onClick={connectCalendar} className="btn btn-primary" style={{ fontSize: 13, padding: '10px 18px', width: '100%' }}>
                Connect Google Calendar
              </button>
            </div>
          )}
        </div>

        <div className="card" style={{ gap: 0, padding: '20px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16, fontWeight: 600 }}>
            Daily Reminder
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
            We'll email <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{user?.email}</span> to start your planning session.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              style={{
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '12px 16px',
                color: 'var(--text-primary)', fontSize: 16, fontWeight: 700,
                fontFamily: 'Urbanist, sans-serif', outline: 'none',
                colorScheme: 'dark', flex: 1,
              }}
            />
            <button
              onClick={saveReminder}
              disabled={loading}
              className="btn btn-primary"
              style={{
                fontSize: 13, padding: '12px 24px',
                background: saved ? '#064E3B' : undefined,
                color: saved ? '#86EFAC' : undefined,
                border: saved ? '1px solid #065F46' : undefined,
                flexShrink: 0, fontWeight: 600,
              }}
            >
              {saved ? '✓ Saved' : loading ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>

        <div className="card" style={{ gap: 0, padding: '20px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16, fontWeight: 600 }}>
            Account
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Email', value: user?.email },
              { label: 'User ID', value: user?.id?.slice(0, 16) + '…' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
                <span style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: 'monospace', fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

function NoteCardStack({ notes, onUpdate, onDelete }) {
  const [expandedIndex, setExpandedIndex] = useState(null)
  const visibleNotes = notes.slice(0, 3)
  const remainingCount = notes.length - 3

  if (notes.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '24px',
        color: 'var(--text-muted)', fontSize: 13, opacity: 0.6,
      }}>
        No notes yet. Capture ideas as they come.
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', minHeight: notes.length > 3 ? '180px' : 'auto' }}>
      {notes.length > 3 && (
        <>
          {[2, 1].map((offset) => {
            const noteIndex = notes.length - offset - 1
            if (noteIndex < 0) return null
            const note = notes[noteIndex]
            const colorScheme = NOTE_COLORS[note.colorIndex]
            return (
              <div
                key={`shadow-${offset}`}
                style={{
                  position: 'absolute', top: offset * 8, left: offset * 4, right: offset * -4,
                  height: '60px', background: colorScheme.bg, borderRadius: 10,
                  opacity: 0.3 - (offset * 0.1), transform: `rotate(${offset * 1.5}deg)`,
                  zIndex: 1, border: '1px solid rgba(0,0,0,0.05)',
                }}
              />
            )
          })}
        </>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, position: 'relative', zIndex: 2 }}>
        {visibleNotes.map((note) => {
          const colorScheme = NOTE_COLORS[note.colorIndex]
          const isExpanded = expandedIndex === note.id

          return (
            <div
              key={note.id}
              className="note-card"
              style={{
                background: colorScheme.bg, borderRadius: 10, padding: '14px',
                position: 'relative', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                cursor: 'pointer', transition: 'all 0.2s ease',
                border: '1px solid rgba(0,0,0,0.05)',
              }}
              onClick={() => setExpandedIndex(isExpanded ? null : note.id)}
            >
              <div style={{
                maxHeight: isExpanded ? '200px' : '60px',
                overflow: 'hidden', transition: 'max-height 0.3s ease', position: 'relative',
              }}>
                <p style={{
                  margin: 0, color: colorScheme.color, fontSize: 13,
                  fontFamily: 'Urbanist, sans-serif', lineHeight: 1.6,
                  fontWeight: 500, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                }}>
                  {note.text}
                </p>
                {!isExpanded && note.text.length > 100 && (
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: '30px',
                    background: `linear-gradient(transparent, ${colorScheme.bg.split(',')[0].replace('linear-gradient(135deg, ', '')})`,
                  }} />
                )}
              </div>

              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginTop: 8, paddingTop: 8, borderTop: `1px solid ${colorScheme.color}20`,
              }}>
                <span style={{ fontSize: 10, color: colorScheme.color, opacity: 0.5, fontWeight: 600 }}>
                  autosaved
                </span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setExpandedIndex(isExpanded ? null : note.id) }}
                    style={{
                      background: 'none', border: 'none', color: colorScheme.color,
                      opacity: 0.5, cursor: 'pointer', fontSize: 12,
                      padding: '2px 6px', borderRadius: 4, fontWeight: 600,
                    }}
                  >
                    {isExpanded ? 'collapse' : 'expand'}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(note.id) }}
                    style={{
                      background: 'none', border: 'none', color: colorScheme.color,
                      opacity: 0.4, cursor: 'pointer', fontSize: 16,
                      padding: '2px 6px', borderRadius: 4, transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.background = 'rgba(0,0,0,0.1)' }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = 0.4; e.currentTarget.style.background = 'none' }}
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {remainingCount > 0 && (
        <div style={{
          textAlign: 'center', marginTop: 12, padding: '8px',
          background: 'var(--surface-2)', borderRadius: 8,
          fontSize: 12, color: 'var(--text-muted)', fontWeight: 600,
          cursor: 'pointer', border: '1px solid var(--border)', transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          + {remainingCount} more {remainingCount === 1 ? 'note' : 'notes'}
        </div>
      )}
    </div>
  )
}

export default function MyFlow() {
  const { user, profile } = useAuth()

  // Gate: show coming soon for everyone except bypass email
  const isOwner = user?.email === BYPASS_EMAIL
  if (!isOwner) return <ComingSoon />

  const [input, setInput] = useState('')
  const [withTime, setWithTime] = useState(false)
  const [cards, setCards] = useState(() => {
    try { return JSON.parse(localStorage.getItem('myflow-cards') || '[]') } catch { return [] }
  })
  const [notes, setNotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('myflow-notes') || '[]') } catch { return [] }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [calendarConnected, setCalendarConnected] = useState(() => !!localStorage.getItem('gcal-token'))
  const [showSettings, setShowSettings] = useState(false)
  const [syncingAll, setSyncingAll] = useState(false)
  const [allSynced, setAllSynced] = useState(false)
  const [newNote, setNewNote] = useState('')

  useEffect(() => { localStorage.setItem('myflow-cards', JSON.stringify(cards)) }, [cards])
  useEffect(() => { localStorage.setItem('myflow-notes', JSON.stringify(notes)) }, [notes])

  async function structureTasks() {
    if (!input.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/myflow/structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, with_time: withTime }),
      })
      const data = await res.json()
      if (data.error || !data.tasks?.length) {
        setError('Could not parse tasks. Try rephrasing.')
        return
      }
      const newCards = data.tasks.map((c, i) => ({
        ...c,
        id: Date.now() + i,
        checklist: (c.subtasks || []).map(s => ({ text: s, done: false })),
        addedToCalendar: false,
        suggestedTime: null,
      }))
      setCards(prev => [...newCards, ...prev])
      setInput('')
      setAllSynced(false)
    } catch {
      setError('Could not reach server. Is your backend running?')
    } finally {
      setLoading(false)
    }
  }

  function toggleSubtask(cardId, idx) {
    setCards(prev => prev.map(c => c.id !== cardId ? c : {
      ...c,
      checklist: c.checklist.map((item, i) => i === idx ? { ...item, done: !item.done } : item),
    }))
  }

  function deleteCard(cardId) {
    setCards(prev => prev.filter(c => c.id !== cardId))
  }

  function suggestTime(cardId) {
    setCards(prev => prev.map((c, idx) => {
      if (c.id !== cardId) return c
      const start = 9 + idx
      return { ...c, suggestedTime: `${String(start).padStart(2,'0')}:00 – ${String(start+1).padStart(2,'0')}:00` }
    }))
  }

  async function addAllToCalendar() {
    const token = localStorage.getItem('gcal-token')
    if (!token) { setShowSettings(true); return }
    setSyncingAll(true)
    const today = new Date()
    try {
      for (const card of cards) {
        if (card.addedToCalendar || !card.suggestedTime) continue
        const [startStr, endStr] = card.suggestedTime.split('–').map(s => s.trim())
        const [sh, sm] = startStr.split(':').map(Number)
        const [eh, em] = endStr.split(':').map(Number)
        const start = new Date(today); start.setHours(sh, sm, 0, 0)
        const end = new Date(today); end.setHours(eh, em, 0, 0)
        await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            summary: card.title,
            description: card.checklist.map(c => `• ${c.text}`).join('\n'),
            start: { dateTime: start.toISOString(), timeZone: 'Africa/Lagos' },
            end: { dateTime: end.toISOString(), timeZone: 'Africa/Lagos' },
          }),
        })
        setCards(prev => prev.map(c => c.id === card.id ? { ...c, addedToCalendar: true } : c))
      }
      setAllSynced(true)
    } catch {
      alert('Calendar sync error. Try reconnecting in settings.')
    } finally {
      setSyncingAll(false)
    }
  }

  function addNote() {
    if (!newNote.trim()) return
    const noteObj = { id: Date.now(), text: newNote.trim(), colorIndex: notes.length % NOTE_COLORS.length }
    setNotes(prev => [noteObj, ...prev])
    setNewNote('')
  }

  function deleteNote(noteId) {
    setNotes(prev => prev.filter(n => n.id !== noteId))
  }

  function updateNote(noteId, newText) {
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, text: newText } : n))
  }

  const firstName = user?.email?.split('@')[0] || 'there'
  const todayStr = new Date().toLocaleDateString('en-NG', { weekday: 'long', month: 'long', day: 'numeric' })
  const completedToday = cards.reduce((acc, c) => acc + c.checklist.filter(t => t.done).length, 0)
  const totalToday = cards.reduce((acc, c) => acc + c.checklist.length, 0)
  const progressPercent = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0
  const tasksWithTimes = cards.filter(c => c.suggestedTime).length

  return (
    <div className="page" style={{ fontFamily: 'Urbanist, sans-serif' }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .task-card { animation: slideIn 0.3s ease forwards; }
        .task-card:nth-child(1) { animation-delay: 0s; }
        .task-card:nth-child(2) { animation-delay: 0.05s; }
        .task-card:nth-child(3) { animation-delay: 0.1s; }
        .task-card:nth-child(4) { animation-delay: 0.15s; }
        .task-card:nth-child(5) { animation-delay: 0.2s; }
        .note-card { transition: all 0.2s ease; }
        .note-card:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.2); }
        .checklist-item { transition: all 0.15s ease; }
        .checklist-item:hover { transform: translateX(4px); }
      `}</style>

      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, var(--accent-soft) 0%, var(--surface-3) 100%)',
        borderRadius: 16, padding: '32px', marginBottom: 24,
        border: '1px solid var(--border)', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -50, right: -50, width: 200, height: 200,
          background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)',
          opacity: 0.1, borderRadius: '50%',
        }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
              AI Planning Workspace
            </div>
            <h1 style={{
              marginBottom: 6, letterSpacing: '-0.5px',
              background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--accent) 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: 36,
            }}>
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {firstName}
            </h1>
            <p className="text-muted" style={{ fontSize: 15, maxWidth: 500 }}>
              Turn brain dumps into actionable work. AI structures your tasks, suggests timing, and syncs to your calendar.
            </p>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>{todayStr}</div>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {totalToday > 0 && (
              <div style={{ display: 'flex', gap: 16 }}>
                {[
                  { value: cards.length, label: 'Tasks' },
                  { value: totalToday, label: 'Subtasks' },
                  { value: `${progressPercent}%`, label: 'Complete', color: '#22C55E' },
                ].map(stat => (
                  <div key={stat.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: stat.color || 'var(--accent)' }}>{stat.value}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowSettings(true)}
              title="MyFlow Settings"
              style={{
                background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
                color: 'var(--text-muted)', cursor: 'pointer', padding: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'scale(1.05)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'scale(1)' }}
            >
              <GearIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Command Box */}
      <div className="card" style={{ marginBottom: 16, padding: '28px', background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-3) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 20 }}>✨</span>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
            What are we getting done today?
          </span>
        </div>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) structureTasks() }}
          placeholder="Describe what you want to accomplish — finish the landing page, call Becca about JCD, research YC timeline…"
          rows={3}
          style={{
            width: '100%', background: 'transparent', border: 'none', outline: 'none',
            resize: 'none', color: 'var(--text-primary)', fontSize: 15,
            fontFamily: 'Urbanist, sans-serif', lineHeight: 1.8, marginBottom: 20,
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none', fontWeight: 500 }}>
            <div
              onClick={() => setWithTime(t => !t)}
              style={{
                width: 40, height: 22, background: withTime ? 'var(--accent)' : 'var(--surface-2)',
                borderRadius: 11, position: 'relative', transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0,
              }}
            >
              <div style={{
                position: 'absolute', top: 3, left: withTime ? 21 : 3,
                width: 16, height: 16, background: '#fff', borderRadius: '50%',
                transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }} />
            </div>
            <span>Suggest schedule</span>
          </label>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 11, color: 'var(--text-muted)', opacity: 0.5, fontWeight: 600 }}>⌘ ↵</span>
          <button
            onClick={structureTasks}
            disabled={loading || !input.trim()}
            className="btn btn-primary"
            style={{
              fontSize: 14, padding: '12px 28px',
              opacity: loading || !input.trim() ? 0.5 : 1, fontWeight: 600,
              background: loading ? undefined : 'linear-gradient(135deg, var(--accent) 0%, #7C3AED 100%)',
            }}
          >
            {loading ? 'Structuring…' : 'Structure Tasks →'}
          </button>
        </div>
        {error && (
          <div style={{ marginTop: 12, fontSize: 12, color: '#F87171', background: 'rgba(248,113,113,0.1)', padding: '8px 12px', borderRadius: 8 }}>
            {error}
          </div>
        )}
      </div>

      {/* Add All to Calendar */}
      {cards.length > 0 && calendarConnected && (
        <div style={{ marginBottom: 16 }}>
          <button
            onClick={addAllToCalendar}
            disabled={syncingAll || allSynced}
            style={{
              width: '100%', padding: '14px 24px', fontSize: 14, fontWeight: 600,
              background: '#fff', color: allSynced ? '#065F46' : 'var(--text-primary)',
              border: allSynced ? '2px solid #22C55E' : '2px solid var(--border)',
              borderRadius: 12, cursor: allSynced ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'all 0.2s', fontFamily: 'Urbanist, sans-serif',
            }}
            onMouseEnter={e => { if (!allSynced && !syncingAll) { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'scale(1.01)' } }}
            onMouseLeave={e => { if (!allSynced && !syncingAll) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'scale(1)' } }}
          >
            <CalendarIcon />
            {syncingAll ? 'Syncing to Calendar…' : allSynced ? '✓ All Synced to Calendar' : `Add All to Google Calendar (${tasksWithTimes} tasks)`}
          </button>
        </div>
      )}

      {/* Bento Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, alignItems: 'start' }}>

        {/* Task Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {cards.length === 0 ? (
            <div className="card" style={{
              textAlign: 'center', padding: '64px 24px',
              border: '2px dashed var(--border)',
              background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-3) 100%)',
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✨</div>
              <h3 style={{ marginBottom: 8, color: 'var(--text-primary)' }}>Nothing planned yet</h3>
              <p className="text-muted" style={{ fontSize: 14, maxWidth: 400, margin: '0 auto' }}>
                Describe what you want to accomplish in the command box above, and MyFlow will organize everything for you.
              </p>
            </div>
          ) : cards.map((card) => {
            const pColor = PRIORITY_COLORS[card.priority] || PRIORITY_COLORS.medium
            const allDone = card.checklist.length > 0 && card.checklist.every(t => t.done)

            return (
              <div
                key={card.id}
                className="card task-card"
                style={{
                  border: allDone ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(139, 92, 246, 0.2)',
                  transition: 'all 0.2s',
                  background: allDone ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.03) 0%, var(--surface) 100%)' : 'var(--surface)',
                  position: 'relative', overflow: 'hidden',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)'; e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = allDone ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 16, fontWeight: 700, marginBottom: 10, lineHeight: 1.3,
                      color: allDone ? 'var(--text-muted)' : 'var(--text-primary)',
                      textDecoration: allDone ? 'line-through' : 'none',
                    }}>
                      {card.title}
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 6,
                        background: pColor.background, color: pColor.color,
                        letterSpacing: '0.5px', textTransform: 'uppercase',
                        border: `1px solid ${pColor.border}`,
                      }}>
                        {pColor.label}
                      </span>
                      {card.suggestedTime ? (
                        <span style={{
                          fontSize: 12, color: 'var(--text-muted)', fontWeight: 600,
                          background: 'var(--surface-2)', padding: '4px 10px', borderRadius: 6,
                        }}>
                          ⏱ {card.suggestedTime}
                        </span>
                      ) : (
                        <button
                          onClick={() => suggestTime(card.id)}
                          style={{
                            fontSize: 11, color: 'var(--accent)',
                            background: 'rgba(139, 92, 246, 0.1)',
                            border: '1px solid rgba(139, 92, 246, 0.2)',
                            borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
                            fontFamily: 'Urbanist, sans-serif', fontWeight: 600, transition: 'all 0.2s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)' }}
                        >
                          + suggest time
                        </button>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteCard(card.id)}
                    style={{
                      background: 'var(--surface-2)', border: '1px solid var(--border)',
                      color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16,
                      padding: '6px 10px', lineHeight: 1, borderRadius: 8, flexShrink: 0, transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#F87171'; e.currentTarget.style.borderColor = '#F87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.1)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface-2)' }}
                  >
                    ×
                  </button>
                </div>

                {card.checklist.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                    {card.checklist.map((item, idx) => (
                      <label key={idx} className="checklist-item" style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', userSelect: 'none' }}>
                        <div
                          onClick={() => toggleSubtask(card.id, idx)}
                          style={{
                            width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                            border: item.done ? 'none' : '2px solid var(--border)',
                            background: item.done ? 'linear-gradient(135deg, var(--accent) 0%, #7C3AED 100%)' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s', cursor: 'pointer',
                          }}
                          onMouseEnter={e => { if (!item.done) e.currentTarget.style.borderColor = 'var(--accent)' }}
                          onMouseLeave={e => { if (!item.done) e.currentTarget.style.borderColor = 'var(--border)' }}
                        >
                          {item.done && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          )}
                        </div>
                        <span style={{
                          fontSize: 13, lineHeight: 1.4, fontWeight: 500,
                          color: item.done ? 'var(--text-muted)' : 'var(--text-primary)',
                          textDecoration: item.done ? 'line-through' : 'none',
                        }}>
                          {item.text}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {card.addedToCalendar && (
                  <div style={{
                    padding: '8px 12px', background: 'rgba(6,78,59,0.2)', borderRadius: 8,
                    fontSize: 12, color: '#86EFAC', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <span>✓</span> Synced to Google Calendar
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Flow With Me */}
          <div className="card" style={{ background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-3) 100%)', padding: '20px' }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: 'var(--accent)', letterSpacing: 2,
              textTransform: 'uppercase', marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span>💭</span> Flow with Me
            </div>
            <div style={{ marginBottom: 16 }}>
              <textarea
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                placeholder="Quick thought or idea…"
                rows={2}
                style={{
                  width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '12px', color: 'var(--text-primary)',
                  fontSize: 13, fontFamily: 'Urbanist, sans-serif', lineHeight: 1.6,
                  resize: 'none', outline: 'none', marginBottom: 8,
                }}
              />
              <button
                onClick={addNote}
                disabled={!newNote.trim()}
                className="btn btn-primary"
                style={{ width: '100%', fontSize: 13, padding: '8px', fontWeight: 600, opacity: !newNote.trim() ? 0.5 : 1 }}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <PlusIcon /> Add Note
                </span>
              </button>
            </div>
            <NoteCardStack notes={notes} onUpdate={updateNote} onDelete={deleteNote} />
          </div>

          {/* Progress Card */}
          {totalToday > 0 && (
            <div className="card" style={{
              border: progressPercent === 100 ? '2px solid #22C55E' : '1px solid var(--border)',
              padding: '20px',
            }}>
              <div style={{
                fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16, fontWeight: 600,
                color: progressPercent === 100 ? '#065F46' : 'var(--text-muted)',
              }}>
                {progressPercent === 100 ? '🎉 Complete!' : "Today's Momentum"}
              </div>
              <div style={{ fontSize: 42, fontWeight: 900, marginBottom: 8, color: progressPercent === 100 ? '#22C55E' : 'var(--text-primary)' }}>
                {progressPercent}%
              </div>
              <div style={{ fontSize: 13, marginBottom: 12, color: progressPercent === 100 ? '#065F46' : 'var(--text-muted)' }}>
                {completedToday} of {totalToday} subtasks completed
              </div>
              <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${progressPercent}%`,
                  background: progressPercent === 100 ? '#22C55E' : 'var(--accent)',
                  borderRadius: 3, transition: 'width 0.6s ease',
                }} />
              </div>
              {progressPercent < 100 && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10, fontWeight: 600 }}>
                  Keep going! You're making progress 🔥
                </div>
              )}
            </div>
          )}

          {/* Calendar Status */}
          <div
            onClick={() => setShowSettings(true)}
            className="card"
            style={{ cursor: 'pointer', padding: '16px 20px', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 12 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              background: calendarConnected ? '#22C55E' : 'var(--surface-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CalendarIcon />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                {calendarConnected ? 'Calendar Connected' : 'Connect Calendar'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {calendarConnected ? 'Sync enabled' : 'Sync your tasks'}
              </div>
            </div>
            <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 16 }}>→</span>
          </div>
        </div>
      </div>

      {showSettings && (
        <SettingsPanel
          onClose={() => setShowSettings(false)}
          user={user}
          calendarConnected={calendarConnected}
          setCalendarConnected={setCalendarConnected}
        />
      )}
    </div>
  )
}