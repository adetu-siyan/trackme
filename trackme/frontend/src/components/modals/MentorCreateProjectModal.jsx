// import { useState, useEffect } from 'react'
// import { projectsApi } from '../../lib/api'

// export default function CreateProjectModal({ onClose, onCreated }) {
//   const [form, setForm] = useState({ title: '', description: '', deadline: '' })
//   const [mentees, setMentees] = useState([])
//   const [selectedMentees, setSelectedMentees] = useState([])
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')

//   useEffect(() => {
//     projectsApi.myMentees()
//       .then(res => setMentees(res.mentees || []))
//       .catch(() => {})
//   }, [])

//   const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

//   function toggleMentee(id) {
//     setSelectedMentees(prev =>
//       prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
//     )
//   }

//   async function handleCreate() {
//     if (!form.title.trim()) { setError('Project title is required'); return }
//     setLoading(true)
//     try {
//       await projectsApi.create({
//         title: form.title,
//         description: form.description,
//         deadline: form.deadline || null,
//         mentee_ids: selectedMentees,
//       })
//       onCreated()
//     } catch (e) {
//       setError(e.message)
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="modal" onClick={e => e.stopPropagation()}>
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
//           <h2>Create Project</h2>
//           <button
//             onClick={onClose}
//             style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text-muted)' }}
//           >×</button>
//         </div>

//         <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
//           <div>
//             <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
//               Project Title *
//             </label>
//             <input className="input" value={form.title} onChange={update('title')} placeholder="e.g. Cloud Engineering Fundamentals" />
//           </div>

//           <div>
//             <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
//               Description
//             </label>
//             <textarea
//               className="input"
//               value={form.description}
//               onChange={update('description')}
//               placeholder="What will they be learning or building?"
//               style={{ minHeight: 80 }}
//             />
//           </div>

//           <div>
//             <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
//               Deadline (optional)
//             </label>
//             <input className="input" type="date" value={form.deadline} onChange={update('deadline')} />
//           </div>

//           {mentees.length > 0 && (
//             <div>
//               <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 10 }}>
//                 Assign Mentees
//               </label>
//               <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
//                 {mentees.map(rel => {
//                   const m = rel.profiles
//                   const selected = selectedMentees.includes(m?.id)
//                   return (
//                     <div
//                       key={rel.id}
//                       onClick={() => toggleMentee(m?.id)}
//                       style={{
//                         padding: '10px 14px',
//                         borderRadius: 10,
//                         border: `1.5px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
//                         background: selected ? 'var(--accent-soft)' : 'var(--surface-2)',
//                         cursor: 'pointer',
//                         display: 'flex',
//                         alignItems: 'center',
//                         gap: 12,
//                         transition: 'all 0.18s',
//                       }}
//                     >
//                       <div style={{
//                         width: 32, height: 32, borderRadius: '50%',
//                         background: selected ? 'var(--accent)' : 'var(--surface-3)',
//                         display: 'flex', alignItems: 'center', justifyContent: 'center',
//                         fontSize: 13, fontWeight: 700,
//                         color: selected ? '#fff' : 'var(--text-muted)',
//                         flexShrink: 0,
//                       }}>
//                         {m?.full_name?.[0]?.toUpperCase() || '?'}
//                       </div>
//                       <div>
//                         <div style={{ fontSize: 14, fontWeight: 600, color: selected ? 'var(--accent)' : 'var(--text-primary)' }}>
//                           {m?.full_name}
//                         </div>
//                         {m?.field_of_study && (
//                           <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.field_of_study}</div>
//                         )}
//                       </div>
//                       {selected && <span style={{ marginLeft: 'auto', color: 'var(--accent)' }}>✓</span>}
//                     </div>
//                   )
//                 })}
//               </div>
//             </div>
//           )}

//           {error && (
//             <div style={{ background: 'var(--danger-soft)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>
//               {error}
//             </div>
//           )}

//           <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
//             <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
//             <button className="btn btn-primary" onClick={handleCreate} disabled={loading}>
//               {loading ? 'Creating...' : 'Create Project'}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

import { useState } from 'react'
import { projectsApi } from '../../lib/api'
import {
  X, Code2, Search, Palette, TrendingUp,
  PenLine, Folder, ChevronRight, ChevronLeft,
  Check
} from 'lucide-react'

const PROJECT_TYPES = [
  { value: 'tech',     label: 'Tech / Software',     Icon: Code2 },
  { value: 'research', label: 'Research',             Icon: Search },
  { value: 'design',   label: 'Design / Creative',   Icon: Palette },
  { value: 'business', label: 'Business / Strategy', Icon: TrendingUp },
  { value: 'writing',  label: 'Writing / Content',   Icon: PenLine },
  { value: 'other',    label: 'Other',               Icon: Folder },
]

const SUBMISSION_CHANNELS = [
  'GitHub / GitLab', 'Google Drive', 'Email',
  'Notion', 'Figma', 'PDF Document',
  'Live Presentation', 'Direct Message', 'Other',
]

const STEPS = ['Basics', 'Details', 'Submission']

function FieldLabel({ children, required }) {
  return (
    <label style={{
      fontSize: 12, fontWeight: 700,
      color: 'var(--text-muted)',
      textTransform: 'uppercase', letterSpacing: '1px',
      display: 'block', marginBottom: 6,
    }}>
      {children}
      {required && <span style={{ color: 'var(--danger)', marginLeft: 3 }}>*</span>}
    </label>
  )
}

function FieldHint({ children }) {
  return (
    <p style={{
      fontSize: 12, color: 'var(--text-muted)',
      margin: '0 0 8px', lineHeight: 1.5,
    }}>
      {children}
    </p>
  )
}

export default function MentorCreateProjectModal({ onClose, onCreated }) {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Step 0
  const [title, setTitle] = useState('')
  const [projectType, setProjectType] = useState('tech')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')

  // Step 1
  const [objectives, setObjectives] = useState('')
  const [deliverables, setDeliverables] = useState('')
  const [techStack, setTechStack] = useState('')
  const [requirements, setRequirements] = useState('')
  const [resources, setResources] = useState('')

  // Step 2
  const [submissionChannel, setSubmissionChannel] = useState('GitHub / GitLab')
  const [submissionNotes, setSubmissionNotes] = useState('')
  const [menteeIds, setMenteeIds] = useState('')

  function handleClose() {
    if (typeof onClose === 'function') onClose()
  }

  function canProceed() {
    if (step === 0) return title.trim().length > 0 && description.trim().length > 0
    return true
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    try {
      const menteeIdList = menteeIds
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)

      await projectsApi.create({
        title: title.trim(),
        description: description.trim(),
        project_type: projectType,
        deadline: deadline || null,
        objectives: objectives.trim() || null,
        deliverables: deliverables.trim() || null,
        requirements: requirements.trim() || null,
        tech_stack: projectType === 'tech' ? techStack.trim() || null : null,
        resources: resources.trim() || null,
        submission_channel: submissionChannel,
        submission_notes: submissionNotes.trim() || null,
        mentee_ids: menteeIdList,
      })
      if (typeof onCreated === 'function') onCreated()
    } catch (e) {
      setError(e.message || 'Failed to create project. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: 560, padding: 0,
          overflow: 'hidden', display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Modal header */}
        <div style={{
          padding: '22px 28px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ margin: 0, marginBottom: 2, fontSize: 18 }}>New Project</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
              Step {step + 1} of {STEPS.length} — {STEPS[step]}
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

        {/* Step progress */}
        <div style={{
          padding: '16px 28px',
          background: 'var(--surface-2)',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 0,
        }}>
          {STEPS.map((s, i) => (
            <div
              key={s}
              style={{
                display: 'flex', alignItems: 'center',
                flex: i < STEPS.length - 1 ? 1 : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, flexShrink: 0,
                  background: i < step
                    ? 'var(--success)' : i === step
                    ? 'var(--accent)' : 'var(--surface-3)',
                  color: i <= step ? '#fff' : 'var(--text-muted)',
                  transition: 'all 0.2s',
                }}>
                  {i < step ? <Check size={13} /> : i + 1}
                </div>
                <span style={{
                  fontSize: 12, fontWeight: 600,
                  color: i === step
                    ? 'var(--accent)' : i < step
                    ? 'var(--success)' : 'var(--text-muted)',
                }}>
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  flex: 1, height: 1,
                  background: i < step ? 'var(--success)' : 'var(--border)',
                  margin: '0 12px', transition: 'background 0.2s',
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div style={{
          padding: '24px 28px',
          display: 'flex', flexDirection: 'column', gap: 20,
          overflowY: 'auto', maxHeight: '52vh',
          flex: 1,
        }}>

          {/* STEP 0: BASICS */}
          {step === 0 && (
            <>
              <div>
                <FieldLabel required>Project Title</FieldLabel>
                <input
                  className="input"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Build a REST API, Design a Brand Identity, ML Research Paper"
                  autoFocus
                />
              </div>

              <div>
                <FieldLabel>Project Type</FieldLabel>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 8,
                }}>
                  {PROJECT_TYPES.map(({ value, label, Icon }) => {
                    const isSelected = projectType === value
                    return (
                      <button
                        key={value}
                        onClick={() => setProjectType(value)}
                        style={{
                          padding: '10px 8px', borderRadius: 10,
                          border: `1.5px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                          background: isSelected ? 'var(--accent-soft)' : 'var(--surface-2)',
                          color: isSelected ? 'var(--accent)' : 'var(--text-muted)',
                          cursor: 'pointer', fontFamily: 'Urbanist, sans-serif',
                          fontSize: 12, fontWeight: 600,
                          display: 'flex', flexDirection: 'column',
                          alignItems: 'center', gap: 6,
                          transition: 'all 0.15s',
                        }}
                      >
                        <Icon size={16} />
                        <span style={{ fontSize: 11, lineHeight: 1.3, textAlign: 'center' }}>
                          {label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <FieldLabel required>Project Brief</FieldLabel>
                <FieldHint>
                  Describe the project clearly — what it is, why it matters, and
                  what the mentee should understand or produce by the end.
                </FieldHint>
                <textarea
                  className="input"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="This project involves building a production-ready REST API using FastAPI and PostgreSQL..."
                  style={{ minHeight: 110, lineHeight: 1.6, resize: 'none' }}
                />
              </div>

              <div>
                <FieldLabel>Deadline</FieldLabel>
                <input
                  type="date"
                  className="input"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            </>
          )}

          {/* STEP 1: DETAILS */}
          {step === 1 && (
            <>
              <div style={{
                padding: '10px 14px', borderRadius: 10,
                background: 'var(--accent-soft)', border: '1px solid var(--border)',
                fontSize: 12, color: 'var(--accent)', lineHeight: 1.5,
              }}>
                All fields on this step are optional but help the AI generate
                better weekly tasks and give more accurate progress analysis.
              </div>

              <div>
                <FieldLabel>Objectives</FieldLabel>
                <FieldHint>What should the mentee be able to do by the end? One objective per line.</FieldHint>
                <textarea
                  className="input"
                  value={objectives}
                  onChange={e => setObjectives(e.target.value)}
                  placeholder={`Implement JWT authentication end-to-end\nWrite unit and integration tests with >80% coverage`}
                  style={{ minHeight: 90, lineHeight: 1.6, resize: 'none' }}
                />
              </div>

              <div>
                <FieldLabel>Deliverables</FieldLabel>
                <FieldHint>What specific things must be produced? One per line.</FieldHint>
                <textarea
                  className="input"
                  value={deliverables}
                  onChange={e => setDeliverables(e.target.value)}
                  placeholder={`A working API with all endpoints functional\nTest suite with coverage report`}
                  style={{ minHeight: 80, lineHeight: 1.6, resize: 'none' }}
                />
              </div>

              {projectType === 'tech' && (
                <div>
                  <FieldLabel>Tech Stack / Tools</FieldLabel>
                  <FieldHint>Comma-separated list of tools, languages, or frameworks.</FieldHint>
                  <input
                    className="input"
                    value={techStack}
                    onChange={e => setTechStack(e.target.value)}
                    placeholder="Python, FastAPI, PostgreSQL, Docker, pytest"
                  />
                </div>
              )}

              <div>
                <FieldLabel>Requirements & Constraints</FieldLabel>
                <FieldHint>Any rules, prerequisites, or constraints the mentee must follow.</FieldHint>
                <textarea
                  className="input"
                  value={requirements}
                  onChange={e => setRequirements(e.target.value)}
                  placeholder="Must use REST not GraphQL. No external auth libraries — implement JWT manually."
                  style={{ minHeight: 80, lineHeight: 1.6, resize: 'none' }}
                />
              </div>

              <div>
                <FieldLabel>Resources & References</FieldLabel>
                <FieldHint>Links, books, or guides the mentee should use. One per line.</FieldHint>
                <textarea
                  className="input"
                  value={resources}
                  onChange={e => setResources(e.target.value)}
                  placeholder={`https://fastapi.tiangolo.com/docs\nClean Code by Robert C. Martin`}
                  style={{ minHeight: 80, lineHeight: 1.6, resize: 'none' }}
                />
              </div>
            </>
          )}

          {/* STEP 2: SUBMISSION */}
          {step === 2 && (
            <>
              <div>
                <FieldLabel>Submission Channel</FieldLabel>
                <FieldHint>Where should the mentee submit their completed work?</FieldHint>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {SUBMISSION_CHANNELS.map(ch => {
                    const isSelected = submissionChannel === ch
                    return (
                      <button
                        key={ch}
                        onClick={() => setSubmissionChannel(ch)}
                        style={{
                          padding: '7px 14px', borderRadius: 20,
                          border: `1.5px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                          background: isSelected ? 'var(--accent-soft)' : 'var(--surface-2)',
                          color: isSelected ? 'var(--accent)' : 'var(--text-muted)',
                          cursor: 'pointer', fontFamily: 'Urbanist, sans-serif',
                          fontSize: 12, fontWeight: 600,
                          transition: 'all 0.15s',
                        }}
                      >
                        {ch}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <FieldLabel>Submission Instructions</FieldLabel>
                <FieldHint>Any specific steps the mentee should follow when submitting.</FieldHint>
                <textarea
                  className="input"
                  value={submissionNotes}
                  onChange={e => setSubmissionNotes(e.target.value)}
                  placeholder="Push to the main branch, open a pull request, and share the PR link."
                  style={{ minHeight: 80, lineHeight: 1.6, resize: 'none' }}
                />
              </div>

              <div>
                <FieldLabel>Assign Mentees</FieldLabel>
                <FieldHint>Comma-separated mentee user IDs. You can also assign mentees later.</FieldHint>
                <input
                  className="input"
                  value={menteeIds}
                  onChange={e => setMenteeIds(e.target.value)}
                  placeholder="Leave blank to assign later"
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
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 28px',
          borderTop: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--surface)',
        }}>
          <button
            className="btn btn-secondary"
            onClick={step === 0 ? handleClose : () => setStep(s => s - 1)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {step === 0
              ? <><X size={13} /> Cancel</>
              : <><ChevronLeft size={13} /> Back</>
            }
          </button>

          {step < STEPS.length - 1 ? (
            <button
              className="btn btn-primary"
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              Next <ChevronRight size={13} />
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading}
              style={{
                minWidth: 140,
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 6,
              }}
            >
              {loading
                ? <><span className="spinner" style={{ width: 13, height: 13, borderWidth: 2 }} /> Creating...</>
                : <><Check size={13} /> Create Project</>
              }
            </button>
          )}
        </div>
      </div>
    </div>
  )
}