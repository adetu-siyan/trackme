import { useState } from 'react'
import { projectsApi } from '../../lib/api'
import { X, Check } from 'lucide-react'

export default function MenteeCreateProjectModal({ onClose, onCreated }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function handleClose() {
    if (typeof onClose === 'function') onClose()
  }

  async function handleSubmit() {
    if (!title.trim()) return
    setLoading(true)
    setError(null)
    try {
      await projectsApi.create({
        title: title.trim(),
        description: description.trim() || null,
        deadline: deadline || null,
        mentee_ids: [],
      })
      if (typeof onCreated === 'function') onCreated()
    } catch (e) {
      setError(e.message || 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 480 }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 20,
        }}>
          <div>
            <h2 style={{ margin: 0, marginBottom: 2 }}>New Project</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
              Track your personal learning project
            </p>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: 8, width: 32, height: 32, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)', transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--danger)'
              e.currentTarget.style.color = 'var(--danger)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.color = 'var(--text-muted)'
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{
              fontSize: 12, fontWeight: 700, color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '1px',
              display: 'block', marginBottom: 6,
            }}>
              Title <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              className="input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Learn Docker, Build a Portfolio Site"
              autoFocus
            />
          </div>

          <div>
            <label style={{
              fontSize: 12, fontWeight: 700, color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '1px',
              display: 'block', marginBottom: 6,
            }}>
              Description
            </label>
            <textarea
              className="input"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What are you trying to build or learn?"
              style={{ minHeight: 90, lineHeight: 1.6, resize: 'none' }}
            />
          </div>

          <div>
            <label style={{
              fontSize: 12, fontWeight: 700, color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '1px',
              display: 'block', marginBottom: 6,
            }}>
              Deadline
            </label>
            <input
              type="date"
              className="input"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              style={{ colorScheme: 'dark' }}
            />
          </div>

          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: 10,
              background: 'var(--danger-soft)',
              border: '1px solid rgba(220,38,38,0.2)',
              color: 'var(--danger)', fontSize: 13,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <X size={13} />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginTop: 24,
          paddingTop: 20, borderTop: '1px solid var(--border)',
        }}>
          <button
            className="btn btn-secondary"
            onClick={handleClose}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <X size={13} /> Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading || !title.trim()}
            style={{
              minWidth: 130,
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 6,
            }}
          >
            {loading
              ? <><span className="spinner" style={{ width: 13, height: 13, borderWidth: 2 }} /> Creating...</>
              : <><Check size={13} /> Create Project</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}