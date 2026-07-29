import { useEffect, useState } from 'react'
import { mentorApi } from '../lib/api'

function daysSince(dateStr) {
  if (!dateStr) return null
  const diff = Date.now() - new Date(dateStr).getTime()
  return Math.floor(diff / 86400000)
}

export default function MenteeDashboard({ onSelectMentee }) {
  const [mentees, setMentees] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    mentorApi.myMentees()
      .then(res => setMentees(res.mentees || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="page">
      <h1 style={{ marginBottom: 28 }}>My Mentees</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {[1, 2].map(i => (
          <div key={i} className="skeleton" style={{ height: 200, borderRadius: 16 }} />
        ))}
      </div>
    </div>
  )

  return (
    <div className="page">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ marginBottom: 4 }}>My Mentees</h1>
        <p className="text-muted" style={{ fontSize: 15 }}>
          {mentees.length} active mentee{mentees.length !== 1 ? 's' : ''}
        </p>
      </div>

      {mentees.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
          <h3 style={{ marginBottom: 8 }}>No mentees yet</h3>
          <p className="text-muted" style={{ fontSize: 14 }}>
            Share your email with someone and ask them to add you as their mentor in Dôti.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 16,
        }}>
          {mentees.map(m => {
            const profile = m.profile || {}
            const stats = m.stats || {}
            const streak = m.streak || {}
            const daysSinceLog = daysSince(stats.last_log_date)
            const initials = profile.full_name
              ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
              : '?'

            const activityStatus = daysSinceLog === null
              ? { label: 'Never logged', color: 'var(--text-muted)', bg: 'var(--surface-2)' }
              : daysSinceLog === 0
              ? { label: 'Logged today', color: 'var(--success)', bg: 'var(--success-soft)' }
              : daysSinceLog === 1
              ? { label: 'Logged yesterday', color: 'var(--accent)', bg: 'var(--accent-soft)' }
              : daysSinceLog <= 3
              ? { label: `${daysSinceLog} days ago`, color: 'var(--warning)', bg: 'var(--warning-soft)' }
              : { label: `${daysSinceLog} days ago`, color: 'var(--danger)', bg: 'var(--danger-soft)' }

            return (
              <div
                key={m.mentee_id}
                className="card card-clickable"
                onClick={() => onSelectMentee(m)}
                style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4C1D95, #7C3AED)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, fontWeight: 800, color: '#fff', flexShrink: 0,
                  }}>
                    {initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>
                      {profile.full_name || 'Unknown'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {profile.field_of_study || 'No field set'}
                    </div>
                  </div>
                  <span style={{
                    padding: '4px 10px', borderRadius: 20,
                    fontSize: 11, fontWeight: 600,
                    background: activityStatus.bg, color: activityStatus.color,
                    flexShrink: 0,
                  }}>
                    {activityStatus.label}
                  </span>
                </div>

                {/* Stats row */}
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 0, background: 'var(--surface-2)',
                  borderRadius: 10, overflow: 'hidden',
                }}>
                  {[
                    { label: 'Logs', value: stats.total_logs || 0 },
                    { label: 'Signed', value: stats.signed_logs || 0 },
                    { label: 'Rate', value: `${stats.sign_rate || 0}%` },
                    { label: 'Streak', value: `${streak.current_streak || 0}🔥` },
                  ].map((stat, i) => (
                    <div key={i} style={{
                      padding: '12px 8px', textAlign: 'center',
                      borderRight: i < 3 ? '1px solid var(--border)' : 'none',
                    }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)', marginBottom: 2 }}>
                        {stat.value}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Best streak: <strong style={{ color: 'var(--text-primary)' }}>{streak.longest_streak || 0} days</strong>
                  </div>
                  <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 16 }}>→</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}