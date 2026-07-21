import { useState } from 'react'
import { mentorApi } from '../../lib/api'

export default function AddMentorModal({ onClose }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  async function handleRequest() {
    if (!email.trim()) return
    setLoading(true)
    try {
      const res = await mentorApi.request({ mentor_email: email })
      setResult(res)
    } catch (e) {
      setResult({ success: false, message: e.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2>Add a Mentor</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text-muted)' }}>×</button>
        </div>

        {result ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>{result.success ? '🎉' : '⚠️'}</div>
            <h3 style={{ marginBottom: 8 }}>{result.success ? 'Request Sent!' : 'Could not send'}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>{result.message}</p>
            <button className="btn btn-primary" onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
              Enter your mentor's email. They'll get a request and can accept it from their account.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input
                className="input"
                type="email"
                placeholder="mentor@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRequest()}
                autoFocus
              />
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                <button className="btn btn-primary" onClick={handleRequest} disabled={loading || !email.trim()}>
                  {loading ? 'Sending...' : 'Send Request →'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
