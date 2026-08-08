// import { useEffect, useState } from 'react'
// import { mentorApi } from '../lib/api'

// function daysSince(dateStr) {
//   if (!dateStr) return null
//   const diff = Date.now() - new Date(dateStr).getTime()
//   return Math.floor(diff / 86400000)
// }

// export default function MenteeDashboard({ onSelectMentee }) {
//   const [mentees, setMentees] = useState([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     mentorApi.myMentees()
//       .then(res => setMentees(res.mentees || []))
//       .catch(console.error)
//       .finally(() => setLoading(false))
//   }, [])

//   if (loading) return (
//     <div className="page">
//       <h1 style={{ marginBottom: 28 }}>My Mentees</h1>
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
//         {[1, 2].map(i => (
//           <div key={i} className="skeleton" style={{ height: 200, borderRadius: 16 }} />
//         ))}
//       </div>
//     </div>
//   )

//   return (
//     <div className="page">
//       <div style={{ marginBottom: 32 }}>
//         <h1 style={{ marginBottom: 4 }}>My Mentees</h1>
//         <p className="text-muted" style={{ fontSize: 15 }}>
//           {mentees.length} active mentee{mentees.length !== 1 ? 's' : ''}
//         </p>
//       </div>

//       {mentees.length === 0 ? (
//         <div style={{ textAlign: 'center', padding: '80px 20px' }}>
//           <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
//           <h3 style={{ marginBottom: 8 }}>No mentees yet</h3>
//           <p className="text-muted" style={{ fontSize: 14 }}>
//             Share your email with someone and ask them to add you as their mentor in Dôti.
//           </p>
//         </div>
//       ) : (
//         <div style={{
//           display: 'grid',
//           gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
//           gap: 16,
//         }}>
//           {mentees.map(m => {
//             const profile = m.profile || {}
//             const stats = m.stats || {}
//             const streak = m.streak || {}
//             const daysSinceLog = daysSince(stats.last_log_date)
//             const initials = profile.full_name
//               ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
//               : '?'

//             const activityStatus = daysSinceLog === null
//               ? { label: 'Never logged', color: 'var(--text-muted)', bg: 'var(--surface-2)' }
//               : daysSinceLog === 0
//               ? { label: 'Logged today', color: 'var(--success)', bg: 'var(--success-soft)' }
//               : daysSinceLog === 1
//               ? { label: 'Logged yesterday', color: 'var(--accent)', bg: 'var(--accent-soft)' }
//               : daysSinceLog <= 3
//               ? { label: `${daysSinceLog} days ago`, color: 'var(--warning)', bg: 'var(--warning-soft)' }
//               : { label: `${daysSinceLog} days ago`, color: 'var(--danger)', bg: 'var(--danger-soft)' }

//             return (
//               <div
//                 key={m.mentee_id}
//                 className="card card-clickable"
//                 onClick={() => onSelectMentee(m)}
//                 style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
//               >
//                 {/* Header */}
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
//                   <div style={{
//                     width: 52, height: 52, borderRadius: '50%',
//                     background: 'linear-gradient(135deg, #4C1D95, #7C3AED)',
//                     display: 'flex', alignItems: 'center', justifyContent: 'center',
//                     fontSize: 18, fontWeight: 800, color: '#fff', flexShrink: 0,
//                   }}>
//                     {initials}
//                   </div>
//                   <div style={{ flex: 1, minWidth: 0 }}>
//                     <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>
//                       {profile.full_name || 'Unknown'}
//                     </div>
//                     <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
//                       {profile.field_of_study || 'No field set'}
//                     </div>
//                   </div>
//                   <span style={{
//                     padding: '4px 10px', borderRadius: 20,
//                     fontSize: 11, fontWeight: 600,
//                     background: activityStatus.bg, color: activityStatus.color,
//                     flexShrink: 0,
//                   }}>
//                     {activityStatus.label}
//                   </span>
//                 </div>

//                 {/* Stats row */}
//                 <div style={{
//                   display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
//                   gap: 0, background: 'var(--surface-2)',
//                   borderRadius: 10, overflow: 'hidden',
//                 }}>
//                   {[
//                     { label: 'Logs', value: stats.total_logs || 0 },
//                     { label: 'Signed', value: stats.signed_logs || 0 },
//                     { label: 'Rate', value: `${stats.sign_rate || 0}%` },
//                     { label: 'Streak', value: `${streak.current_streak || 0}🔥` },
//                   ].map((stat, i) => (
//                     <div key={i} style={{
//                       padding: '12px 8px', textAlign: 'center',
//                       borderRight: i < 3 ? '1px solid var(--border)' : 'none',
//                     }}>
//                       <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)', marginBottom: 2 }}>
//                         {stat.value}
//                       </div>
//                       <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
//                         {stat.label}
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 {/* Footer */}
//                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//                   <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
//                     Best streak: <strong style={{ color: 'var(--text-primary)' }}>{streak.longest_streak || 0} days</strong>
//                   </div>
//                   <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 16 }}>→</span>
//                 </div>
//               </div>
//             )
//           })}
//         </div>
//       )}
//     </div>
//   )
// }

import { useState, useEffect } from 'react'
import { mentorApi } from '../lib/api'
import Groups from './Groups'

function daysSince(dateStr) {
  if (!dateStr) return null
  const diff = Date.now() - new Date(dateStr).getTime()
  return Math.floor(diff / 86400000)
}

export default function MenteeDashboard({ onSelectMentee }) {
  const [activeTab, setActiveTab] = useState('mentees')
  const [mentees, setMentees] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
// import { useEffect, useState } from 'react'
// import { mentorApi } from '../lib/api'

// function daysSince(dateStr) {
//   if (!dateStr) return null
//   const diff = Date.now() - new Date(dateStr).getTime()
//   return Math.floor(diff / 86400000)
// }

// export default function MenteeDashboard({ onSelectMentee }) {
//   const [mentees, setMentees] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [search, setSearch] = useState('')

  useEffect(() => {
    mentorApi.myMentees()
      .then(res => setMentees(res.mentees || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = mentees.filter(m => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    const profile = m.profile || {}
    return (
      (profile.full_name || '').toLowerCase().includes(q) ||
      (profile.field_of_study || '').toLowerCase().includes(q) ||
      (profile.username || '').toLowerCase().includes(q)
    )
  })

  if (loading) return (
    <div className="page">
      <style>{`
        @media (max-width: 640px) {
          .mentee-grid { grid-template-columns: 1fr !important; }
          .mentee-stats-row { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
      <h1 style={{ marginBottom: 28 }}>My Mentees</h1>
      <div
        className="mentee-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 16,
        }}
      >
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton" style={{ height: 200, borderRadius: 16 }} />
        ))}
      </div>
    </div>
  )

  
//   return (
//     <div className="page">
//       <style>{`
//         @media (max-width: 640px) {
//           .mentee-grid { grid-template-columns: 1fr !important; }
//           .mentee-stats-row { grid-template-columns: repeat(2, 1fr) !important; }
//           .mentee-header-row { flex-direction: column; align-items: flex-start !important; gap: 12px !important; }
//           .mentee-search-bar { width: 100% !important; }
//         }
//         .mentee-card-hover:hover {
//           border-color: var(--accent) !important;
//           transform: translateY(-2px);
//           box-shadow: var(--shadow-md) !important;
//         }
//       `}</style>

//       {/* Header */}
//       <div
//         className="mentee-header-row"
//         style={{
//           display: 'flex', alignItems: 'center',
//           justifyContent: 'space-between',
//           marginBottom: 24, gap: 16, flexWrap: 'wrap',
//         }}
//       >
//         <div>
//           <h1 style={{ marginBottom: 4 }}>My Mentees</h1>
//           <p className="text-muted" style={{ fontSize: 14 }}>
//             {mentees.length} active mentee{mentees.length !== 1 ? 's' : ''}
//             {search.trim() && filtered.length !== mentees.length && (
//               <span style={{ color: 'var(--accent)', marginLeft: 6 }}>
//                 · {filtered.length} result{filtered.length !== 1 ? 's' : ''}
//               </span>
//             )}
//           </p>
//         </div>

//         {/* Search */}
//         {mentees.length > 0 && (
//           <div
//             className="mentee-search-bar"
//             style={{
//               position: 'relative',
//               width: 260,
//             }}
//           >
//             <span style={{
//               position: 'absolute', left: 12, top: '50%',
//               transform: 'translateY(-50%)',
//               fontSize: 14, color: 'var(--text-muted)',
//               pointerEvents: 'none',
//             }}>
//               🔍
//             </span>
//             <input
//               type="text"
//               value={search}
//               onChange={e => setSearch(e.target.value)}
//               placeholder="Search mentees..."
//               style={{
//                 width: '100%',
//                 padding: '9px 12px 9px 36px',
//                 borderRadius: 10,
//                 border: '1.5px solid var(--border)',
//                 background: 'var(--surface-2)',
//                 color: 'var(--text-primary)',
//                 fontSize: 13,
//                 fontFamily: 'Urbanist, sans-serif',
//                 outline: 'none',
//                 transition: 'border-color 0.15s',
//                 boxSizing: 'border-box',
//               }}
//               onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
//               onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
//             />
//             {search && (
//               <button
//                 onClick={() => setSearch('')}
//                 style={{
//                   position: 'absolute', right: 10, top: '50%',
//                   transform: 'translateY(-50%)',
//                   background: 'none', border: 'none',
//                   cursor: 'pointer', color: 'var(--text-muted)',
//                   fontSize: 14, padding: 0, lineHeight: 1,
//                 }}
//               >
//                 ×
//               </button>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Empty state */}
//       {mentees.length === 0 ? (
//         <div style={{ textAlign: 'center', padding: '80px 20px' }}>
//           <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
//           <h3 style={{ marginBottom: 8 }}>No mentees yet</h3>
//           <p className="text-muted" style={{ fontSize: 14 }}>
//             Share your email with someone and ask them to add you as their mentor in Dôti.
//           </p>
//         </div>
//       ) : filtered.length === 0 ? (
//         <div style={{ textAlign: 'center', padding: '60px 20px' }}>
//           <div style={{ fontSize: 40, marginBottom: 14 }}>🔍</div>
//           <h3 style={{ marginBottom: 8 }}>No results for "{search}"</h3>
//           <p className="text-muted" style={{ fontSize: 14, marginBottom: 16 }}>
//             Try searching by name or field of study.
//           </p>
//           <button
//             onClick={() => setSearch('')}
//             className="btn btn-secondary"
//           >
//             Clear search
//           </button>
//         </div>
//       ) : (
//         <div
//           className="mentee-grid"
//           style={{
//             display: 'grid',
//             gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
//             gap: 16,
//           }}
//         >
//           {filtered.map(m => {
//             const profile = m.profile || {}
//             const stats = m.stats || {}
//             const streak = m.streak || {}
//             const daysSinceLog = daysSince(stats.last_log_date)
//             const initials = profile.full_name
//               ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
//               : '?'

//             const activityStatus = daysSinceLog === null
//               ? { label: 'Never logged', color: 'var(--text-muted)', bg: 'var(--surface-2)' }
//               : daysSinceLog === 0
//               ? { label: 'Logged today', color: 'var(--success)', bg: 'var(--success-soft)' }
//               : daysSinceLog === 1
//               ? { label: 'Yesterday', color: 'var(--accent)', bg: 'var(--accent-soft)' }
//               : daysSinceLog <= 3
//               ? { label: `${daysSinceLog}d ago`, color: 'var(--warning)', bg: 'var(--warning-soft)' }
//               : { label: `${daysSinceLog}d ago`, color: 'var(--danger)', bg: 'var(--danger-soft)' }

//             return (
//               <div
//                 key={m.mentee_id}
//                 className="card mentee-card-hover"
//                 onClick={() => onSelectMentee(m)}
//                 style={{
//                   display: 'flex', flexDirection: 'column', gap: 16,
//                   cursor: 'pointer', transition: 'all 0.18s',
//                 }}
//               >
//                 {/* Header */}
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
//                   <div style={{
//                     width: 52, height: 52, borderRadius: '50%',
//                     background: 'linear-gradient(135deg, #4C1D95, #7C3AED)',
//                     display: 'flex', alignItems: 'center', justifyContent: 'center',
//                     fontSize: 18, fontWeight: 800, color: '#fff', flexShrink: 0,
//                   }}>
//                     {initials}
//                   </div>
//                   <div style={{ flex: 1, minWidth: 0 }}>
//                     <div style={{
//                       fontWeight: 700, fontSize: 16, marginBottom: 2,
//                       overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
//                     }}>
//                       {profile.full_name || 'Unknown'}
//                     </div>
//                     <div style={{
//                       fontSize: 12, color: 'var(--text-muted)',
//                       overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
//                     }}>
//                       {profile.field_of_study || 'No field set'}
//                     </div>
//                   </div>
//                   <span style={{
//                     padding: '4px 10px', borderRadius: 20,
//                     fontSize: 11, fontWeight: 600,
//                     background: activityStatus.bg,
//                     color: activityStatus.color,
//                     flexShrink: 0, whiteSpace: 'nowrap',
//                   }}>
//                     {activityStatus.label}
//                   </span>
//                 </div>

//                 {/* Stats row */}
//                 <div
//                   className="mentee-stats-row"
//                   style={{
//                     display: 'grid',
//                     gridTemplateColumns: 'repeat(4, 1fr)',
//                     background: 'var(--surface-2)',
//                     borderRadius: 10, overflow: 'hidden',
//                   }}
//                 >
//                   {[
//                     { label: 'Logs', value: stats.total_logs || 0 },
//                     { label: 'Signed', value: stats.signed_logs || 0 },
//                     { label: 'Rate', value: `${stats.sign_rate || 0}%` },
//                     { label: 'Streak', value: `${streak.current_streak || 0}🔥` },
//                   ].map((stat, i) => (
//                     <div
//                       key={i}
//                       style={{
//                         padding: '12px 8px', textAlign: 'center',
//                         borderRight: i < 3 ? '1px solid var(--border)' : 'none',
//                       }}
//                     >
//                       <div style={{
//                         fontSize: 18, fontWeight: 800,
//                         color: 'var(--accent)', marginBottom: 2,
//                       }}>
//                         {stat.value}
//                       </div>
//                       <div style={{
//                         fontSize: 10, color: 'var(--text-muted)',
//                         fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px',
//                       }}>
//                         {stat.label}
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 {/* Footer */}
//                 <div style={{
//                   display: 'flex', alignItems: 'center',
//                   justifyContent: 'space-between',
//                 }}>
//                   <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
//                     Best streak:{' '}
//                     <strong style={{ color: 'var(--text-primary)' }}>
//                       {streak.longest_streak || 0} days
//                     </strong>
//                   </div>
//                   <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 16 }}>→</span>
//                 </div>
//               </div>
//             )
//           })}
//         </div>
//       )}
//     </div>
//   )
// }

return (
    <div className="page">
      <style>{`
        @media (max-width: 640px) {
          .mentee-grid { grid-template-columns: 1fr !important; }
          .mentee-stats-row { grid-template-columns: repeat(2, 1fr) !important; }
          .mentee-header-row { flex-direction: column; align-items: flex-start !important; gap: 12px !important; }
          .mentee-search-bar { width: 100% !important; }
        }
        .mentee-card-hover:hover {
          border-color: var(--accent) !important;
          transform: translateY(-2px);
          box-shadow: var(--shadow-md) !important;
        }
      `}</style>

      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ marginBottom: 4 }}>Mentor Dashboard</h1>
        <p className="text-muted" style={{ fontSize: 14 }}>
          Manage your mentees and cohorts
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 28,
        background: 'var(--surface-2)', borderRadius: 12, padding: 4,
        width: 'fit-content',
      }}>
        {[
          { id: 'mentees', label: '👤 My Mentees' },
          { id: 'groups',  label: '👥 Groups' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '9px 20px', borderRadius: 9, border: 'none',
              cursor: 'pointer', fontFamily: 'Urbanist, sans-serif',
              fontSize: 14, fontWeight: 600, transition: 'all 0.18s',
              background: activeTab === t.id ? 'var(--surface)' : 'transparent',
              color: activeTab === t.id ? 'var(--accent)' : 'var(--text-muted)',
              boxShadow: activeTab === t.id ? 'var(--shadow-sm)' : 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Groups tab */}
      {activeTab === 'groups' && <Groups />}

      {/* Mentees tab */}
      {activeTab === 'mentees' && (
        <div>
          {/* Header */}
          <div className="mentee-header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
            <div>
              <p className="text-muted" style={{ fontSize: 14, margin: 0 }}>
                {mentees.length} active mentee{mentees.length !== 1 ? 's' : ''}
                {search.trim() && filtered.length !== mentees.length && (
                  <span style={{ color: 'var(--accent)', marginLeft: 6 }}>
                    · {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                  </span>
                )}
              </p>
            </div>

            {mentees.length > 0 && (
              <div className="mentee-search-bar" style={{ position: 'relative', width: 260 }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: 'var(--text-muted)', pointerEvents: 'none' }}>🔍</span>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search mentees..."
                  style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'Urbanist, sans-serif', outline: 'none', transition: 'border-color 0.15s', boxSizing: 'border-box' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                />
                {search && (
                  <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14, padding: 0 }}>×</button>
                )}
              </div>
            )}
          </div>

          {/* rest of your existing mentees list — empty state + grid — paste here unchanged */}
          {loading ? (
            <div className="mentee-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 16 }} />)}
            </div>
          ) : mentees.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
              <h3 style={{ marginBottom: 8 }}>No mentees yet</h3>
              <p className="text-muted" style={{ fontSize: 14 }}>Share your email with someone and ask them to add you as their mentor in Dôti.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 40, marginBottom: 14 }}>🔍</div>
              <h3 style={{ marginBottom: 8 }}>No results for "{search}"</h3>
              <p className="text-muted" style={{ fontSize: 14, marginBottom: 16 }}>Try searching by name or field of study.</p>
              <button onClick={() => setSearch('')} className="btn btn-secondary">Clear search</button>
            </div>
          ) : (
            <div className="mentee-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {filtered.map(m => {
                const profile = m.profile || {}
                const stats = m.stats || {}
                const streak = m.streak || {}
                const daysSinceLog = daysSince(stats.last_log_date)
                const initials = profile.full_name ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?'
                const activityStatus = daysSinceLog === null
                  ? { label: 'Never logged', color: 'var(--text-muted)', bg: 'var(--surface-2)' }
                  : daysSinceLog === 0 ? { label: 'Logged today', color: 'var(--success)', bg: 'var(--success-soft)' }
                  : daysSinceLog === 1 ? { label: 'Yesterday', color: 'var(--accent)', bg: 'var(--accent-soft)' }
                  : daysSinceLog <= 3 ? { label: `${daysSinceLog}d ago`, color: 'var(--warning)', bg: 'var(--warning-soft)' }
                  : { label: `${daysSinceLog}d ago`, color: 'var(--danger)', bg: 'var(--danger-soft)' }

                return (
                  <div key={m.mentee_id} className="card mentee-card-hover" onClick={() => onSelectMentee(m)} style={{ display: 'flex', flexDirection: 'column', gap: 16, cursor: 'pointer', transition: 'all 0.18s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #4C1D95, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                        {initials}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.full_name || 'Unknown'}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.field_of_study || 'No field set'}</div>
                      </div>
                      <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: activityStatus.bg, color: activityStatus.color, flexShrink: 0, whiteSpace: 'nowrap' }}>
                        {activityStatus.label}
                      </span>
                    </div>
                    <div className="mentee-stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', background: 'var(--surface-2)', borderRadius: 10, overflow: 'hidden' }}>
                      {[
                        { label: 'Logs', value: stats.total_logs || 0 },
                        { label: 'Signed', value: stats.signed_logs || 0 },
                        { label: 'Rate', value: `${stats.sign_rate || 0}%` },
                        { label: 'Streak', value: `${streak.current_streak || 0}🔥` },
                      ].map((stat, i) => (
                        <div key={i} style={{ padding: '12px 8px', textAlign: 'center', borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}>
                          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)', marginBottom: 2 }}>{stat.value}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
                        </div>
                      ))}
                    </div>
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
      )}
    </div>
  )
}