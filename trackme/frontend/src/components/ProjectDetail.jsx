

// import { useState } from 'react'
// import { projectsApi } from '../lib/api'
// import {
//   ArrowLeft, Calendar, FileText,
//   Package, Settings, Upload, BarChart2,
//   Crown, User, Code2, Search, Palette,
//   TrendingUp, PenLine, Folder, ExternalLink,
//   AlertTriangle, CheckCircle2, RefreshCw, XCircle
// } from 'lucide-react'

// const STATUS_CONFIG = {
//   active:    { bg: 'var(--success-soft)', color: 'var(--success)', label: 'Active' },
//   completed: { bg: 'var(--surface-2)',    color: 'var(--text-muted)', label: 'Completed' },
//   paused:    { bg: 'var(--warning-soft)', color: 'var(--warning)', label: 'Paused' },
// }

// const TYPE_CONFIG = {
//   tech:     { label: 'Tech / Software',    Icon: Code2 },
//   research: { label: 'Research',           Icon: Search },
//   design:   { label: 'Design / Creative',  Icon: Palette },
//   business: { label: 'Business / Strategy',Icon: TrendingUp },
//   writing:  { label: 'Writing / Content',  Icon: PenLine },
//   other:    { label: 'Other',              Icon: Folder },
// }

// const TABS = [
//   { id: 'brief',        label: 'Brief',        Icon: FileText },
//   { id: 'deliverables', label: 'Deliverables', Icon: Package },
//   { id: 'requirements', label: 'Requirements', Icon: Settings },
//   { id: 'submission',   label: 'Submission',   Icon: Upload },
//   { id: 'progress',     label: 'AI Progress',  Icon: BarChart2 },
// ]

// function SectionLabel({ children }) {
//   return (
//     <div style={{
//       fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
//       textTransform: 'uppercase', letterSpacing: '1.5px',
//       marginBottom: 12,
//     }}>
//       {children}
//     </div>
//   )
// }

// function Divider() {
//   return <div style={{ height: 1, background: 'var(--border)', margin: '24px 0' }} />
// }

// function EmptyField({ label }) {
//   return (
//     <div>
//       <SectionLabel>{label}</SectionLabel>
//       <p style={{ fontSize: 14, color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>
//         Not specified
//       </p>
//     </div>
//   )
// }

// function formatDeadline(dateStr) {
//   if (!dateStr) return null
//   const date = new Date(dateStr)
//   const now = new Date()
//   const daysLeft = Math.ceil((date - now) / 86400000)
//   return {
//     formatted: date.toLocaleDateString('en-US', {
//       weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
//     }),
//     daysLeft,
//     overdue: daysLeft < 0,
//   }
// }

// export default function ProjectDetail({ project: p, onBack, onEnded }) {
//   const [activeTab, setActiveTab] = useState('brief')
//   const [completion, setCompletion] = useState(null)
//   const [loadingCompletion, setLoadingCompletion] = useState(false)
//   const [ending, setEnding] = useState(false)
//   const [endError, setEndError] = useState(null)

//   const status = STATUS_CONFIG[p.status] || STATUS_CONFIG.active
//   const type = TYPE_CONFIG[p.project_type] || TYPE_CONFIG.other
//   const TypeIcon = type.Icon
//   const deadline = p.deadline ? formatDeadline(p.deadline) : null

//   const barColor = !completion ? 'var(--accent)'
//     : completion.completion_rate >= 80 ? 'var(--success)'
//     : completion.completion_rate >= 50 ? 'var(--warning)'
//     : 'var(--danger)'

//   async function loadCompletion() {
//     if (loadingCompletion) return
//     setLoadingCompletion(true)
//     try {
//       const res = await projectsApi.getCompletion(p.id)
//       setCompletion(res)
//     } catch (e) {
//       console.error(e)
//     } finally {
//       setLoadingCompletion(false)
//     }
//   }

//   function handleTabChange(id) {
//     setActiveTab(id)
//     if (id === 'progress' && !completion) loadCompletion()
//   }

//   async function handleEnd() {
//     if (!window.confirm('Mark this project as completed? It will be removed from your active list.')) return
//     setEnding(true)
//     setEndError(null)
//     try {
//       await projectsApi.endProject(p.id)
//       if (onEnded) onEnded(p.id)
//     } catch (e) {
//       setEndError(e.message || 'Failed to end project')
//       setEnding(false)
//     }
//   }

//   return (
//     <div className="page" style={{ fontFamily: 'Urbanist, sans-serif' }}>
//       <style>{`
//         .project-layout {
//           display: grid;
//           grid-template-columns: 188px 1fr;
//           gap: 20px;
//           align-items: start;
//         }
//         .project-tabs-sidebar {
//           display: flex;
//           flex-direction: column;
//           gap: 2px;
//           position: sticky;
//           top: 24px;
//         }
//         .project-tabs-mobile {
//           display: none;
//         }
//         @media (max-width: 640px) {
//           .project-layout {
//             grid-template-columns: 1fr !important;
//           }
//           .project-tabs-sidebar {
//             display: none !important;
//           }
//           .project-tabs-mobile {
//             display: flex !important;
//             overflow-x: auto;
//             gap: 6px;
//             padding-bottom: 4px;
//             margin-bottom: 16px;
//             scrollbar-width: none;
//           }
//           .project-tabs-mobile::-webkit-scrollbar {
//             display: none;
//           }
//         }
//       `}</style>

//       {/* Back button */}
//       <button
//         onClick={onBack}
//         style={{
//           background: 'none', border: 'none', cursor: 'pointer',
//           color: 'var(--accent)', fontFamily: 'Urbanist, sans-serif',
//           fontSize: 14, fontWeight: 600, padding: 0,
//           display: 'flex', alignItems: 'center', gap: 6,
//           marginBottom: 24,
//         }}
//       >
//         <ArrowLeft size={15} />
//         Back to Projects
//       </button>

//       {/* Project header card */}
//       <div style={{
//         background: 'linear-gradient(135deg, var(--accent-soft) 0%, var(--surface-3) 100%)',
//         border: '1px solid var(--border)',
//         borderRadius: 16, padding: '24px',
//         marginBottom: 24, position: 'relative', overflow: 'hidden',
//       }}>
//         <div style={{
//           position: 'absolute', top: -50, right: -50,
//           width: 180, height: 180,
//           background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)',
//           opacity: 0.07, borderRadius: '50%', pointerEvents: 'none',
//         }} />

//         <div style={{ position: 'relative', zIndex: 1 }}>
//           {/* Badges row */}
//           <div style={{
//             display: 'flex', gap: 6, marginBottom: 12,
//             flexWrap: 'wrap', alignItems: 'center',
//           }}>
//             <span style={{
//               padding: '4px 10px', borderRadius: 20,
//               fontSize: 11, fontWeight: 700,
//               background: status.bg, color: status.color,
//             }}>
//               {status.label}
//             </span>
//             <span style={{
//               padding: '4px 10px', borderRadius: 20,
//               fontSize: 11, fontWeight: 600,
//               background: 'var(--surface)', color: 'var(--text-secondary)',
//               display: 'flex', alignItems: 'center', gap: 4,
//               border: '1px solid var(--border)',
//             }}>
//               <TypeIcon size={11} />
//               {type.label}
//             </span>
//             <span style={{
//               padding: '4px 10px', borderRadius: 20,
//               fontSize: 11, fontWeight: 600,
//               background: p.role === 'creator' ? 'var(--accent-soft)' : 'var(--surface)',
//               color: p.role === 'creator' ? 'var(--accent)' : 'var(--text-muted)',
//               display: 'flex', alignItems: 'center', gap: 4,
//               border: '1px solid var(--border)',
//             }}>
//               {p.role === 'creator' ? <Crown size={10} /> : <User size={10} />}
//               {p.role === 'creator' ? 'Owner' : 'Member'}
//             </span>
//           </div>

//           {/* Title */}
//           <h1 style={{ marginBottom: 10, fontSize: 20, letterSpacing: '-0.3px' }}>
//             {p.title}
//           </h1>

//           {/* Deadline */}
//           {deadline && (
//             <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, flexWrap: 'wrap' }}>
//               <Calendar size={13} color={deadline.overdue ? 'var(--danger)' : 'var(--text-muted)'} />
//               <span style={{ color: deadline.overdue ? 'var(--danger)' : 'var(--text-muted)' }}>
//                 Due <strong style={{ color: deadline.overdue ? 'var(--danger)' : 'var(--text-primary)' }}>
//                   {deadline.formatted}
//                 </strong>
//                 {!deadline.overdue && deadline.daysLeft <= 14 && (
//                   <span style={{
//                     marginLeft: 6, fontSize: 11, fontWeight: 700,
//                     color: 'var(--warning)', background: 'var(--warning-soft)',
//                     padding: '2px 8px', borderRadius: 20,
//                   }}>
//                     {deadline.daysLeft}d left
//                   </span>
//                 )}
//                 {deadline.overdue && (
//                   <span style={{
//                     marginLeft: 6, fontSize: 11, fontWeight: 700,
//                     color: 'var(--danger)', background: 'var(--danger-soft)',
//                     padding: '2px 8px', borderRadius: 20,
//                   }}>
//                     {Math.abs(deadline.daysLeft)}d overdue
//                   </span>
//                 )}
//               </span>
//             </div>
//           )}

//           {/* End project button */}
//           {p.role === 'creator' && p.status !== 'completed' && (
//             <div style={{ marginTop: 16 }}>
//               <button
//                 onClick={handleEnd}
//                 disabled={ending}
//                 style={{
//                   background: 'none',
//                   border: '1px solid var(--danger-soft)',
//                   borderRadius: 8, padding: '8px 16px',
//                   cursor: ending ? 'not-allowed' : 'pointer',
//                   fontFamily: 'Urbanist, sans-serif',
//                   fontSize: 12, fontWeight: 600,
//                   color: 'var(--danger)',
//                   transition: 'all 0.15s',
//                   display: 'inline-flex', alignItems: 'center', gap: 6,
//                 }}
//                 onMouseEnter={e => { if (!ending) e.currentTarget.style.background = 'var(--danger-soft)' }}
//                 onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
//               >
//                 {ending
//                   ? <><span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> Ending...</>
//                   : <><XCircle size={13} /> End Project</>
//                 }
//               </button>
//               {endError && (
//                 <span style={{ fontSize: 11, color: 'var(--danger)', marginLeft: 8 }}>{endError}</span>
//               )}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Mobile horizontal tab scroll */}
//       <div className="project-tabs-mobile">
//         {TABS.map(({ id, label, Icon }) => {
//           const isActive = activeTab === id
//           return (
//             <button
//               key={id}
//               onClick={() => handleTabChange(id)}
//               style={{
//                 padding: '8px 14px', borderRadius: 20,
//                 border: isActive ? '1px solid var(--accent)' : '1px solid var(--border)',
//                 background: isActive ? 'var(--accent-soft)' : 'var(--surface-2)',
//                 color: isActive ? 'var(--accent)' : 'var(--text-muted)',
//                 cursor: 'pointer', fontFamily: 'Urbanist, sans-serif',
//                 fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
//                 display: 'flex', alignItems: 'center', gap: 6,
//                 flexShrink: 0,
//               }}
//             >
//               <Icon size={13} />
//               {label}
//             </button>
//           )
//         })}
//       </div>

//       {/* Main layout */}
//       <div className="project-layout">

//         {/* Desktop sidebar tabs */}
//         <div className="project-tabs-sidebar">
//           {TABS.map(({ id, label, Icon }) => {
//             const isActive = activeTab === id
//             return (
//               <button
//                 key={id}
//                 onClick={() => handleTabChange(id)}
//                 style={{
//                   padding: '10px 14px', borderRadius: 10,
//                   border: 'none', textAlign: 'left',
//                   cursor: 'pointer', fontFamily: 'Urbanist, sans-serif',
//                   fontSize: 13, fontWeight: 600,
//                   background: isActive ? 'var(--accent-soft)' : 'transparent',
//                   color: isActive ? 'var(--accent)' : 'var(--text-muted)',
//                   transition: 'all 0.15s',
//                   display: 'flex', alignItems: 'center', gap: 9,
//                   width: '100%',
//                 }}
//                 onMouseEnter={e => {
//                   if (!isActive) {
//                     e.currentTarget.style.background = 'var(--surface-2)'
//                     e.currentTarget.style.color = 'var(--text-primary)'
//                   }
//                 }}
//                 onMouseLeave={e => {
//                   if (!isActive) {
//                     e.currentTarget.style.background = 'transparent'
//                     e.currentTarget.style.color = 'var(--text-muted)'
//                   }
//                 }}
//               >
//                 <Icon size={14} />
//                 {label}
//               </button>
//             )
//           })}
//         </div>

//         {/* Tab content */}
//         <div className="card" style={{ minHeight: 380 }}>

//           {activeTab === 'brief' && (
//             <div>
//               {p.description ? (
//                 <div>
//                   <SectionLabel>Project Brief</SectionLabel>
//                   <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', margin: 0 }}>
//                     {p.description}
//                   </p>
//                 </div>
//               ) : (
//                 <EmptyField label="Project Brief" />
//               )}

//               {p.objectives && (
//                 <>
//                   <Divider />
//                   <SectionLabel>Objectives</SectionLabel>
//                   <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
//                     {p.objectives.split('\n').filter(Boolean).map((obj, i) => (
//                       <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
//                         <span style={{
//                           width: 22, height: 22, borderRadius: '50%',
//                           background: 'var(--accent-soft)', color: 'var(--accent)',
//                           fontSize: 11, fontWeight: 700, flexShrink: 0,
//                           display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1,
//                         }}>
//                           {i + 1}
//                         </span>
//                         <span style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
//                           {obj}
//                         </span>
//                       </div>
//                     ))}
//                   </div>
//                 </>
//               )}

//               {p.tech_stack && (
//                 <>
//                   <Divider />
//                   <SectionLabel>Tech Stack / Tools</SectionLabel>
//                   <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
//                     {p.tech_stack.split(/[,\n]/).filter(Boolean).map((tech, i) => (
//                       <span key={i} style={{
//                         padding: '5px 12px', borderRadius: 20,
//                         background: 'var(--surface-2)', border: '1px solid var(--border)',
//                         fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
//                         display: 'flex', alignItems: 'center', gap: 5,
//                       }}>
//                         <Code2 size={11} color="var(--accent)" />
//                         {tech.trim()}
//                       </span>
//                     ))}
//                   </div>
//                 </>
//               )}
//             </div>
//           )}

//           {activeTab === 'deliverables' && (
//             <div>
//               {p.deliverables ? (
//                 <div>
//                   <SectionLabel>Deliverables</SectionLabel>
//                   <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
//                     {p.deliverables.split('\n').filter(Boolean).map((d, i) => (
//                       <div key={i} style={{
//                         display: 'flex', gap: 12, alignItems: 'flex-start',
//                         padding: '12px 16px', borderRadius: 10,
//                         background: 'var(--surface-2)', border: '1px solid var(--border)',
//                       }}>
//                         <Package size={15} color="var(--accent)" style={{ flexShrink: 0, marginTop: 1 }} />
//                         <span style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{d}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               ) : (
//                 <EmptyField label="Deliverables" />
//               )}

//               {deadline && (
//                 <>
//                   <Divider />
//                   <SectionLabel>Deadline</SectionLabel>
//                   <div style={{
//                     padding: '16px 20px', borderRadius: 12,
//                     background: deadline.overdue ? 'var(--danger-soft)' : 'var(--surface-2)',
//                     border: `1px solid ${deadline.overdue ? 'rgba(220,38,38,0.2)' : 'var(--border)'}`,
//                     display: 'flex', alignItems: 'center', gap: 14,
//                   }}>
//                     <div style={{
//                       width: 40, height: 40, borderRadius: 10, flexShrink: 0,
//                       background: deadline.overdue ? 'rgba(220,38,38,0.15)' : 'var(--accent-soft)',
//                       display: 'flex', alignItems: 'center', justifyContent: 'center',
//                     }}>
//                       <Calendar size={18} color={deadline.overdue ? 'var(--danger)' : 'var(--accent)'} />
//                     </div>
//                     <div>
//                       <div style={{ fontSize: 15, fontWeight: 700, color: deadline.overdue ? 'var(--danger)' : 'var(--text-primary)', marginBottom: 2 }}>
//                         {deadline.formatted}
//                       </div>
//                       <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
//                         {deadline.overdue ? `${Math.abs(deadline.daysLeft)} days past deadline` : `${deadline.daysLeft} days remaining`}
//                       </div>
//                     </div>
//                   </div>
//                 </>
//               )}
//             </div>
//           )}

//           {activeTab === 'requirements' && (
//             <div>
//               {p.requirements ? (
//                 <div>
//                   <SectionLabel>Requirements & Constraints</SectionLabel>
//                   <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', margin: 0 }}>
//                     {p.requirements}
//                   </p>
//                 </div>
//               ) : (
//                 <EmptyField label="Requirements & Constraints" />
//               )}

//               {p.resources && (
//                 <>
//                   <Divider />
//                   <SectionLabel>Resources & References</SectionLabel>
//                   <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
//                     {p.resources.split('\n').filter(Boolean).map((r, i) => {
//                       const isUrl = r.trim().startsWith('http')
//                       return (
//                         <div key={i} style={{
//                           display: 'flex', gap: 10, alignItems: 'center',
//                           padding: '10px 14px', borderRadius: 10,
//                           background: 'var(--surface-2)', border: '1px solid var(--border)',
//                         }}>
//                           {isUrl
//                             ? <ExternalLink size={13} color="var(--accent)" style={{ flexShrink: 0 }} />
//                             : <FileText size={13} color="var(--text-muted)" style={{ flexShrink: 0 }} />
//                           }
//                           {isUrl ? (
//                             <a href={r.trim()} target="_blank" rel="noopener noreferrer"
//                               style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
//                               {r.trim()}
//                             </a>
//                           ) : (
//                             <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{r.trim()}</span>
//                           )}
//                         </div>
//                       )
//                     })}
//                   </div>
//                 </>
//               )}
//             </div>
//           )}

//           {activeTab === 'submission' && (
//             <div>
//               <SectionLabel>Submission Channel</SectionLabel>
//               <div style={{
//                 padding: '16px 20px', borderRadius: 12,
//                 background: 'var(--accent-soft)', border: '1px solid var(--border)',
//                 display: 'flex', alignItems: 'center', gap: 14,
//               }}>
//                 <div style={{
//                   width: 40, height: 40, borderRadius: 10, flexShrink: 0,
//                   background: 'var(--surface)', border: '1px solid var(--border)',
//                   display: 'flex', alignItems: 'center', justifyContent: 'center',
//                 }}>
//                   <Upload size={18} color="var(--accent)" />
//                 </div>
//                 <div>
//                   <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)', marginBottom: 2 }}>
//                     {p.submission_channel || 'Not specified'}
//                   </div>
//                   <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Submit your work here</div>
//                 </div>
//               </div>

//               {p.submission_notes && (
//                 <>
//                   <Divider />
//                   <SectionLabel>Submission Instructions</SectionLabel>
//                   <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', margin: 0 }}>
//                     {p.submission_notes}
//                   </p>
//                 </>
//               )}

//               {!p.submission_channel && !p.submission_notes && (
//                 <>
//                   <Divider />
//                   <EmptyField label="Submission Instructions" />
//                 </>
//               )}
//             </div>
//           )}

//           {activeTab === 'progress' && (
//             <div>
//               <SectionLabel>AI Progress Analysis</SectionLabel>

//               {loadingCompletion ? (
//                 <div style={{ textAlign: 'center', padding: '48px 20px' }}>
//                   <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3, margin: '0 auto 16px' }} />
//                   <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>
//                     Analysing logs against project scope...
//                   </p>
//                 </div>
//               ) : !completion ? (
//                 <div style={{ textAlign: 'center', padding: '48px 20px' }}>
//                   <div style={{
//                     width: 56, height: 56, borderRadius: 16,
//                     background: 'var(--surface-2)', border: '1px solid var(--border)',
//                     display: 'flex', alignItems: 'center', justifyContent: 'center',
//                     margin: '0 auto 16px',
//                   }}>
//                     <BarChart2 size={24} color="var(--text-muted)" />
//                   </div>
//                   <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
//                     Run an AI analysis to see how your logged work maps against this project's scope.
//                   </p>
//                   <button className="btn btn-primary" onClick={loadCompletion}
//                     style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
//                     <BarChart2 size={14} />
//                     Run Analysis
//                   </button>
//                 </div>
//               ) : (
//                 <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
//                   <div style={{ padding: '20px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
//                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
//                       <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
//                         Estimated Completion
//                       </span>
//                       <span style={{ fontSize: 26, fontWeight: 900, color: barColor }}>
//                         {completion.completion_rate}%
//                       </span>
//                     </div>
//                     <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
//                       <div style={{
//                         height: '100%', width: `${completion.completion_rate}%`,
//                         background: barColor, borderRadius: 4, transition: 'width 0.6s ease',
//                       }} />
//                     </div>
//                     <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
//                       Based on {completion.log_count} log{completion.log_count !== 1 ? 's' : ''} tagged to this project
//                     </div>
//                   </div>

//                   <div style={{ padding: '14px 18px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
//                     <SectionLabel>Assessment</SectionLabel>
//                     <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
//                       {completion.assessment}
//                     </p>
//                   </div>

//                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
//                     {completion.covered_areas?.length > 0 && (
//                       <div style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--success-soft)', border: '1px solid rgba(5,150,105,0.15)' }}>
//                         <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
//                           <CheckCircle2 size={12} /> Covered
//                         </div>
//                         {completion.covered_areas.map((a, i) => (
//                           <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '4px 0', lineHeight: 1.5, borderBottom: i < completion.covered_areas.length - 1 ? '1px solid rgba(5,150,105,0.1)' : 'none' }}>
//                             · {a}
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                     {completion.missing_areas?.length > 0 && (
//                       <div style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--danger-soft)', border: '1px solid rgba(220,38,38,0.15)' }}>
//                         <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
//                           <AlertTriangle size={12} /> Still Missing
//                         </div>
//                         {completion.missing_areas.map((a, i) => (
//                           <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '4px 0', lineHeight: 1.5, borderBottom: i < completion.missing_areas.length - 1 ? '1px solid rgba(220,38,38,0.1)' : 'none' }}>
//                             · {a}
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>

//                   <button
//                     className="btn btn-secondary"
//                     onClick={() => { setCompletion(null); loadCompletion() }}
//                     style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 6 }}
//                   >
//                     <RefreshCw size={13} />
//                     Re-run Analysis
//                   </button>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }


import { useState } from 'react'
import { projectsApi } from '../lib/api'
import {
  ArrowLeft, Calendar, FileText,
  Package, Settings, Upload, BarChart2,
  Crown, User, Code2, Search, Palette,
  TrendingUp, PenLine, Folder, ExternalLink,
  AlertTriangle, CheckCircle2, RefreshCw, XCircle, Circle
} from 'lucide-react'

const STATUS_CONFIG = {
  active:    { bg: 'var(--success-soft)', color: 'var(--success)', label: 'Active' },
  completed: { bg: 'var(--surface-2)',    color: 'var(--text-muted)', label: 'Completed' },
  paused:    { bg: 'var(--warning-soft)', color: 'var(--warning)', label: 'Paused' },
}

const TYPE_CONFIG = {
  tech:     { label: 'Tech / Software',    Icon: Code2 },
  research: { label: 'Research',           Icon: Search },
  design:   { label: 'Design / Creative',  Icon: Palette },
  business: { label: 'Business / Strategy',Icon: TrendingUp },
  writing:  { label: 'Writing / Content',  Icon: PenLine },
  other:    { label: 'Other',              Icon: Folder },
}

const TABS = [
  { id: 'brief',        label: 'Brief',        Icon: FileText },
  { id: 'deliverables', label: 'Deliverables', Icon: Package },
  { id: 'requirements', label: 'Requirements', Icon: Settings },
  { id: 'submission',   label: 'Submission',   Icon: Upload },
  { id: 'progress',     label: 'AI Progress',  Icon: BarChart2 },
]

function formatDeadline(dateStr) {
  if (!dateStr) return null
  const date = new Date(dateStr)
  const now = new Date()
  const daysLeft = Math.ceil((date - now) / 86400000)
  return {
    formatted: date.toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    }),
    daysLeft,
    overdue: daysLeft < 0,
  }
}

export default function ProjectDetail({ project: p, onBack, onEnded }) {
  const [activeTab, setActiveTab] = useState('brief')
  const [completion, setCompletion] = useState(null)
  const [loadingCompletion, setLoadingCompletion] = useState(false)
  const [ending, setEnding] = useState(false)
  const [endError, setEndError] = useState(null)

  const status = STATUS_CONFIG[p.status] || STATUS_CONFIG.active
  const type = TYPE_CONFIG[p.project_type] || TYPE_CONFIG.other
  const TypeIcon = type.Icon
  const deadline = p.deadline ? formatDeadline(p.deadline) : null

  const barColor = !completion ? 'var(--accent)'
    : completion.completion_rate >= 80 ? 'var(--success)'
    : completion.completion_rate >= 50 ? 'var(--warning)'
    : 'var(--danger)'

  async function loadCompletion() {
    if (loadingCompletion) return
    setLoadingCompletion(true)
    try {
      const res = await projectsApi.getCompletion(p.id)
      setCompletion(res)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingCompletion(false)
    }
  }

  function handleTabChange(id) {
    setActiveTab(id)
    if (id === 'progress' && !completion) loadCompletion()
  }

  async function handleEnd() {
    if (!window.confirm('Mark this project as completed? It will be removed from your active list.')) return
    setEnding(true)
    setEndError(null)
    try {
      await projectsApi.endProject(p.id)
      if (onEnded) onEnded(p.id)
    } catch (e) {
      setEndError(e.message || 'Failed to end project')
      setEnding(false)
    }
  }

  // ── Global styles for gradient ──
  const globalStyles = `
    .project-detail-page {
      background: linear-gradient(150deg, #ffffff 0%, #f4f0ff 60%, #e8deff 100%);
    }
    html[data-theme="dark"] .project-detail-page {
      background: linear-gradient(150deg, #0d0a14 0%, #150f24 60%, #1e1535 100%);
    }
    @media (max-width: 640px) {
      .detail-container { padding: 0 16px !important; }
    }
  `

  return (
    <div className="project-detail-page" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      padding: '40px 0 80px 0',
      width: '100%',
      overflowY: 'auto'
    }}>
      <style>{globalStyles}</style>

      <div className="detail-container" style={{ width: '100%', maxWidth: 780, padding: '0 24px' }}>
        
        {/* ── Header Bar ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <button
            onClick={onBack}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', padding: 0,
              display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: 'Urbanist, sans-serif', fontSize: 14, fontWeight: 600,
            }}
          >
            <ArrowLeft size={15} /> Back
          </button>

          {p.role === 'creator' && p.status !== 'completed' && (
            <button
              onClick={handleEnd}
              disabled={ending}
              style={{
                background: 'none', border: '1px solid var(--danger-soft)',
                borderRadius: 8, padding: '6px 14px',
                cursor: ending ? 'not-allowed' : 'pointer',
                fontFamily: 'Urbanist, sans-serif',
                fontSize: 12, fontWeight: 600, color: 'var(--danger)',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}
            >
              {ending
                ? <><span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> Ending...</>
                : <><XCircle size={13} /> End Project</>
              }
            </button>
          )}
          {endError && <span style={{ fontSize: 11, color: 'var(--danger)' }}>{endError}</span>}
        </div>

        {/* ── Hero Card ── */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 16, padding: '24px',
          marginBottom: 24,
        }}>
          {/* Badges */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: status.bg, color: status.color }}>
              {status.label}
            </span>
            <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'var(--surface-2)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <TypeIcon size={11} /> {type.label}
            </span>
            <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: p.role === 'creator' ? 'var(--accent-soft)' : 'var(--surface-2)', color: p.role === 'creator' ? 'var(--accent)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              {p.role === 'creator' ? <Crown size={10} /> : <User size={10} />}
              {p.role === 'creator' ? 'Owner' : 'Member'}
            </span>
          </div>

          <h1 style={{ marginBottom: 10, fontSize: 22, letterSpacing: '-0.3px', fontWeight: 800 }}>{p.title}</h1>

          {deadline && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, flexWrap: 'wrap' }}>
              <Calendar size={14} color={deadline.overdue ? 'var(--danger)' : 'var(--text-muted)'} />
              <span style={{ color: deadline.overdue ? 'var(--danger)' : 'var(--text-muted)' }}>
                Due <strong style={{ color: deadline.overdue ? 'var(--danger)' : 'var(--text-primary)' }}>{deadline.formatted}</strong>
                {!deadline.overdue && deadline.daysLeft <= 14 && (
                  <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700, color: 'var(--warning)', background: 'var(--warning-soft)', padding: '2px 8px', borderRadius: 20 }}>{deadline.daysLeft}d left</span>
                )}
                {deadline.overdue && (
                  <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700, color: 'var(--danger)', background: 'var(--danger-soft)', padding: '2px 8px', borderRadius: 20 }}>{Math.abs(deadline.daysLeft)}d overdue</span>
                )}
              </span>
            </div>
          )}
        </div>

        {/* ── Tabs Strip ── */}
        <div style={{
          display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 4, marginBottom: 24,
          scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
          background: 'var(--surface-2)', borderRadius: 12, padding: 4, width: 'fit-content', maxWidth: '100%',
        }}>
          {TABS.map(({ id, label, Icon }) => {
            const isActive = activeTab === id
            return (
              <button
                key={id}
                onClick={() => handleTabChange(id)}
                style={{
                  padding: '8px 16px', borderRadius: 9, border: 'none',
                  cursor: 'pointer', fontFamily: 'Urbanist, sans-serif',
                  fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: isActive ? 'var(--surface)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                  boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.18s',
                }}
              >
                <Icon size={14} />
                {label}
              </button>
            )
          })}
        </div>

        {/* ── Main Content Card ── */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px', minHeight: 300
        }}>
          {activeTab === 'brief' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {p.description && (
                <div>
                  <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>Brief</h4>
                  <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', margin: 0 }}>{p.description}</p>
                </div>
              )}
              {p.objectives && (
                <div>
                  <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>Objectives</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {p.objectives.split('\n').filter(Boolean).map((obj, i) => (
                      <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent)', fontSize: 10, fontWeight: 700, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>{i + 1}</span>
                        <span style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{obj}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {p.tech_stack && (
                <div>
                  <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>Tech Stack</h4>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {p.tech_stack.split(/[,\n]/).filter(Boolean).map((tech, i) => (
                      <span key={i} style={{ padding: '4px 10px', borderRadius: 20, background: 'var(--surface-2)', border: '1px solid var(--border)', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'deliverables' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {p.deliverables && (
                <div>
                  <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>Deliverables</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {p.deliverables.split('\n').filter(Boolean).map((d, i) => (
                      <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 14px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                        <Package size={15} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} />
                        <span style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {deadline && (
                <div>
                  <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>Deadline</h4>
                  <div style={{ padding: '14px 18px', borderRadius: 12, background: deadline.overdue ? 'var(--danger-soft)' : 'var(--surface-2)', border: `1px solid ${deadline.overdue ? 'rgba(220,38,38,0.2)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', gap: 14 }}>
                    <Calendar size={18} color={deadline.overdue ? 'var(--danger)' : 'var(--accent)'} />
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: deadline.overdue ? 'var(--danger)' : 'var(--text-primary)' }}>{deadline.formatted}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{deadline.overdue ? `${Math.abs(deadline.daysLeft)} days past deadline` : `${deadline.daysLeft} days remaining`}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'requirements' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {p.requirements && (
                <div>
                  <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>Requirements</h4>
                  <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', margin: 0 }}>{p.requirements}</p>
                </div>
              )}
              {p.resources && (
                <div>
                  <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>Resources</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {p.resources.split('\n').filter(Boolean).map((r, i) => {
                      const isUrl = r.trim().startsWith('http')
                      return (
                        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 12px', borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                          {isUrl ? <ExternalLink size={13} color="var(--accent)" /> : <FileText size={13} color="var(--text-muted)" />}
                          {isUrl ? (
                            <a href={r.trim()} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>{r.trim()}</a>
                          ) : (
                            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{r.trim()}</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'submission' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {p.submission_channel && (
                <div>
                  <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>Channel</h4>
                  <div style={{ padding: '14px 18px', borderRadius: 12, background: 'var(--accent-soft)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14 }}>
                    <Upload size={18} color="var(--accent)" />
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)' }}>{p.submission_channel}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Submit your work here</div>
                    </div>
                  </div>
                </div>
              )}
              {p.submission_notes && (
                <div>
                  <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>Instructions</h4>
                  <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', margin: 0 }}>{p.submission_notes}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'progress' && (
            <div>
              <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>AI Progress</h4>
              
              {loadingCompletion ? (
                <div style={{ textAlign: 'center', padding: '32px 20px' }}>
                  <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3, margin: '0 auto 12px' }} />
                  <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>Analysing logs...</p>
                </div>
              ) : !completion ? (
                <div style={{ textAlign: 'center', padding: '32px 20px', background: 'var(--surface-2)', borderRadius: 12, border: '1px solid var(--border)' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                    <BarChart2 size={22} color="var(--text-muted)" />
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16, lineHeight: 1.6 }}>
                    Logs haven't been analysed against this project yet.
                  </p>
                  <button className="btn btn-primary" onClick={loadCompletion} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <BarChart2 size={14} /> Run Analysis
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  
                  <div style={{ padding: '20px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Completion</span>
                      <span style={{ fontSize: 26, fontWeight: 900, color: barColor }}>{completion.completion_rate}%</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${completion.completion_rate}%`, background: barColor, borderRadius: 3, transition: 'width 0.6s ease' }} />
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>Based on {completion.log_count} log{completion.log_count !== 1 ? 's' : ''}</div>
                  </div>

                  <div style={{ padding: '14px 18px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                    <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>Assessment</h4>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{completion.assessment}</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    {completion.covered_areas?.length > 0 && (
                      <div style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--success-soft)', border: '1px solid rgba(5,150,105,0.15)' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}><CheckCircle2 size={12} /> Covered</div>
                        {completion.covered_areas.map((a, i) => <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '4px 0', lineHeight: 1.5, borderBottom: i < completion.covered_areas.length - 1 ? '1px solid rgba(5,150,105,0.1)' : 'none' }}>· {a}</div>)}
                      </div>
                    )}
                    {completion.missing_areas?.length > 0 && (
                      <div style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--danger-soft)', border: '1px solid rgba(220,38,38,0.15)' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}><AlertTriangle size={12} /> Missing</div>
                        {completion.missing_areas.map((a, i) => <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '4px 0', lineHeight: 1.5, borderBottom: i < completion.missing_areas.length - 1 ? '1px solid rgba(220,38,38,0.1)' : 'none' }}>· {a}</div>)}
                      </div>
                    )}
                  </div>

                  <button className="btn btn-secondary" onClick={() => { setCompletion(null); loadCompletion() }} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <RefreshCw size={13} /> Re-run
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}