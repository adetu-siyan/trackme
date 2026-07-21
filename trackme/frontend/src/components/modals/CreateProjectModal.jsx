import { useState, useEffect } from 'react'
import { projectsApi } from '../../lib/api'

export default function CreateProjectModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ title: '', description: '', deadline: '' })
  const [mentees, setMentees] = useState([])
  const [selectedMentees, setSelectedMentees] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    projectsApi.myMentees()
      .then(res => setMentees(res.mentees || []))
      .catch(() => {})
  }, [])

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  function toggleMentee(id) {
    setSelectedMentees(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    )
  }

  async function handleCreate() {
    if (!form.title.trim()) { setError('Project title is required'); return }
    setLoading(true)
    try {
      await projectsApi.create({
        title: form.title,
        description: form.description,
        deadline: form.deadline || null,
        mentee_ids: selectedMentees,
      })
      onCreated()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2>Create Project</h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text-muted)' }}
          >×</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Project Title *
            </label>
            <input className="input" value={form.title} onChange={update('title')} placeholder="e.g. Cloud Engineering Fundamentals" />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Description
            </label>
            <textarea
              className="input"
              value={form.description}
              onChange={update('description')}
              placeholder="What will they be learning or building?"
              style={{ minHeight: 80 }}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Deadline (optional)
            </label>
            <input className="input" type="date" value={form.deadline} onChange={update('deadline')} />
          </div>

          {mentees.length > 0 && (
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 10 }}>
                Assign Mentees
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {mentees.map(rel => {
                  const m = rel.profiles
                  const selected = selectedMentees.includes(m?.id)
                  return (
                    <div
                      key={rel.id}
                      onClick={() => toggleMentee(m?.id)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: `1.5px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                        background: selected ? 'var(--accent-soft)' : 'var(--surface-2)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        transition: 'all 0.18s',
                      }}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: selected ? 'var(--accent)' : 'var(--surface-3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700,
                        color: selected ? '#fff' : 'var(--text-muted)',
                        flexShrink: 0,
                      }}>
                        {m?.full_name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: selected ? 'var(--accent)' : 'var(--text-primary)' }}>
                          {m?.full_name}
                        </div>
                        {m?.field_of_study && (
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.field_of_study}</div>
                        )}
                      </div>
                      {selected && <span style={{ marginLeft: 'auto', color: 'var(--accent)' }}>✓</span>}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {error && (
            <div style={{ background: 'var(--danger-soft)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreate} disabled={loading}>
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
