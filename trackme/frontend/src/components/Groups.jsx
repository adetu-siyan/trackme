import { useState, useEffect } from 'react'
import { groupsApi } from '../lib/api'
import GroupDetail from './GroupDetail'

export default function Groups() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      const res = await groupsApi.myGroups()
      setGroups(res.groups || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    setCreating(true)
    setError('')
    try {
      await groupsApi.create(form)
      setForm({ name: '', description: '' })
      setShowCreate(false)
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setCreating(false)
    }
  }

  if (selectedGroup) {
    return (
      <GroupDetail
        group={selectedGroup}
        onBack={() => { setSelectedGroup(null); load() }}
      />
    )
  }

  return (
    <div className="page">
      <style>{`
        .groups-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }
        @media (max-width: 640px) {
          .groups-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 28, flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>Groups</h1>
          <p className="text-muted" style={{ fontSize: 14 }}>
            Manage cohorts and set weekly focus for entire groups
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreate(true)}
        >
          + Create Group
        </button>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            zIndex: 200, display: 'flex', alignItems: 'center',
            justifyContent: 'center', padding: 20,
          }}
          onClick={() => setShowCreate(false)}
        >
          <div
            style={{
              background: 'var(--surface)', borderRadius: 16,
              padding: 32, width: '100%', maxWidth: 480,
              boxShadow: 'var(--shadow-lg)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: 6 }}>Create a Group</h2>
            <p className="text-muted" style={{ fontSize: 13, marginBottom: 24 }}>
              Groups let you manage multiple mentees as a cohort and set weekly focus for everyone at once.
            </p>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Group Name
                </label>
                <input
                  className="input"
                  placeholder="e.g. Cohort 4 — Backend Track"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Description (optional)
                </label>
                <textarea
                  className="input"
                  placeholder="What is this group working on?"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  style={{ minHeight: 80 }}
                />
              </div>

              {error && (
                <div style={{ background: 'var(--danger-soft)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Group →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="groups-grid">
          {[1, 2].map(i => (
            <div key={i} className="skeleton" style={{ height: 160, borderRadius: 16 }} />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
          <h3 style={{ marginBottom: 8 }}>No groups yet</h3>
          <p className="text-muted" style={{ fontSize: 14, marginBottom: 24 }}>
            Create a group to manage multiple mentees as a cohort.
          </p>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            + Create Your First Group
          </button>
        </div>
      ) : (
        <div className="groups-grid">
          {groups.map(group => (
            <div
              key={group.id}
              className="card"
              onClick={() => setSelectedGroup(group)}
              style={{ cursor: 'pointer', transition: 'all 0.18s' }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--accent)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.transform = 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'linear-gradient(135deg, #4C1D95, #7C3AED)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, flexShrink: 0,
                }}>
                  👥
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  background: 'var(--accent-soft)', color: 'var(--accent)',
                  padding: '3px 10px', borderRadius: 20,
                }}>
                  {group.member_count} member{group.member_count !== 1 ? 's' : ''}
                </span>
              </div>

              <h3 style={{ marginBottom: 6, fontSize: 16 }}>{group.name}</h3>
              {group.description && (
                <p style={{
                  fontSize: 13, color: 'var(--text-muted)',
                  lineHeight: 1.5, marginBottom: 0,
                  overflow: 'hidden', display: '-webkit-box',
                  WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                }}>
                  {group.description}
                </p>
              )}

              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Created {new Date(group.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span style={{ color: 'var(--accent)', fontWeight: 700 }}>→</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}