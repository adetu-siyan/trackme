import { useState, useEffect, useRef } from 'react'
import { projectsApi } from '../../lib/api'

export default function MentorCreateProjectModal({ onClose, onCreated }) {
  // Basic fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [projectType, setProjectType] = useState('tech')
  const [submissionChannel, setSubmissionChannel] = useState('')
  const [submissionNotes, setSubmissionNotes] = useState('')
  
  // Dynamic list fields
  const [objectives, setObjectives] = useState([''])
  const [deliverables, setDeliverables] = useState([''])
  const [requirements, setRequirements] = useState([''])
  const [techStack, setTechStack] = useState([''])
  const [resources, setResources] = useState([''])
  
  // Mentee selection - SIMPLE DROPDOWN
  const [availableMentees, setAvailableMentees] = useState([])
  const [selectedMentees, setSelectedMentees] = useState([])
  const [loadingMentees, setLoadingMentees] = useState(true)
  
  // File upload
  const [files, setFiles] = useState([])
  const [creating, setCreating] = useState(false)
  const fileInputRef = useRef(null)
  
  // Toast
  const [toast, setToast] = useState(null)
  
  useEffect(() => {
    fetchMentees()
  }, [])
  
  async function fetchMentees() {
    try {
      const res = await projectsApi.getAvailableMentees()
      setAvailableMentees(res.mentees || [])
    } catch (e) {
      showToast('Failed to load mentees', 'error')
    } finally {
      setLoadingMentees(false)
    }
  }
  
  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }
  
  function handleMenteeSelect(e) {
    const options = e.target.options
    const selected = []
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value)
      }
    }
    setSelectedMentees(selected)
  }
  
  function handleListChange(index, value, list, setList) {
    const newList = [...list]
    newList[index] = value
    setList(newList)
  }
  
  function addListItem(list, setList) {
    setList([...list, ''])
  }
  
  function removeListItem(index, list, setList) {
    if (list.length > 1) {
      setList(list.filter((_, i) => i !== index))
    }
  }
  
  function handleFileSelect(e) {
    const selectedFiles = Array.from(e.target.files)
    setFiles(prev => [...prev, ...selectedFiles])
  }
  
  function removeFile(index) {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }
  
  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }
  
  async function handleSubmit(e) {
    e.preventDefault()
    
    if (!title.trim()) {
      showToast('Project title is required', 'error')
      return
    }
    
    setCreating(true)
    
    try {
      const formData = new FormData()
      
      // Add basic fields
      formData.append('title', title.trim())
      if (description.trim()) formData.append('description', description.trim())
      if (deadline) formData.append('deadline', deadline)
      formData.append('project_type', projectType)
      if (submissionChannel.trim()) formData.append('submission_channel', submissionChannel.trim())
      if (submissionNotes.trim()) formData.append('submission_notes', submissionNotes.trim())
      
      // Add arrays as JSON strings
      const filteredObjectives = objectives.filter(o => o.trim())
      const filteredDeliverables = deliverables.filter(d => d.trim())
      const filteredRequirements = requirements.filter(r => r.trim())
      const filteredTechStack = techStack.filter(t => t.trim())
      const filteredResources = resources.filter(r => r.trim())
      
      if (filteredObjectives.length > 0) formData.append('objectives', JSON.stringify(filteredObjectives))
      if (filteredDeliverables.length > 0) formData.append('deliverables', JSON.stringify(filteredDeliverables))
      if (filteredRequirements.length > 0) formData.append('requirements', JSON.stringify(filteredRequirements))
      if (filteredTechStack.length > 0) formData.append('tech_stack', JSON.stringify(filteredTechStack))
      if (filteredResources.length > 0) formData.append('resources', JSON.stringify(filteredResources))
      
      // Add mentee IDs
      if (selectedMentees.length > 0) {
        formData.append('mentee_ids', JSON.stringify(selectedMentees))
      }
      
      // Add files
      files.forEach(file => {
        formData.append('files', file)
      })
      
      const result = await projectsApi.createWithFiles(formData)
      
      showToast(
        `Project "${title}" created with ${result.assigned_mentees || 0} mentees`,
        'success'
      )
      
      if (onCreated) onCreated(result)
      
      // Close after short delay
      setTimeout(() => {
        if (onClose) onClose()
      }, 1000)
      
    } catch (e) {
      showToast(e.message || 'Failed to create project', 'error')
    } finally {
      setCreating(false)
    }
  }
  
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
        zIndex: 500, display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--surface)', borderRadius: 16,
          width: '100%', maxWidth: 640, maxHeight: '90vh',
          overflowY: 'auto', padding: '32px',
          display: 'flex', flexDirection: 'column', gap: 20,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>📋 Create New Project</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
              Assign tasks, set deadlines, and upload resources for your mentees
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', fontSize: 24,
              cursor: 'pointer', color: 'var(--text-muted)',
              lineHeight: 1, padding: 0,
            }}
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Project Title */}
          <div>
            <label style={labelStyle}>Project Title *</label>
            <input
              type="text"
              className="input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Build ML Pipeline for Fraud Detection"
              required
              autoFocus
            />
          </div>
          
          {/* Description */}
          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              className="input"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the project, goals, and expected outcomes..."
              rows={4}
              style={{ resize: 'vertical', minHeight: 100, lineHeight: 1.6 }}
            />
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              🤖 AI will restructure this into a professional format automatically
            </p>
          </div>
          
          {/* Project Type & Deadline */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Project Type</label>
              <select
                className="input"
                value={projectType}
                onChange={e => setProjectType(e.target.value)}
              >
                <option value="tech">💻 Tech / Engineering</option>
                <option value="design">🎨 Design</option>
                <option value="research">🔬 Research</option>
                <option value="writing">✍️ Writing</option>
                <option value="data">📊 Data Science</option>
                <option value="other">📦 Other</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Deadline</label>
              <input
                type="date"
                className="input"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
              />
            </div>
          </div>
          
          {/* Objectives */}
          <ListField
            label="🎯 Objectives"
            items={objectives}
            setItems={setObjectives}
            placeholder="e.g., Complete data preprocessing pipeline"
          />
          
          {/* Deliverables */}
          <ListField
            label="📦 Deliverables"
            items={deliverables}
            setItems={setDeliverables}
            placeholder="e.g., Final report with analysis"
          />
          
          {/* Requirements */}
          <ListField
            label="⚙️ Requirements"
            items={requirements}
            setItems={setRequirements}
            placeholder="e.g., Python 3.9+, TensorFlow 2.x"
          />
          
          {/* Tech Stack */}
          <ListField
            label="🛠 Tech Stack"
            items={techStack}
            setItems={setTechStack}
            placeholder="e.g., React, Node.js, PostgreSQL"
          />
          
          {/* Resources */}
          <ListField
            label="📚 Resources / References"
            items={resources}
            setItems={setResources}
            placeholder="e.g., Documentation link, tutorial"
          />
          
          {/* ── SIMPLE MENTEE DROPDOWN ── */}
          <div>
            <label style={labelStyle}>
              👥 Assign Mentees
              {selectedMentees.length > 0 && (
                <span style={{ fontWeight: 400, color: 'var(--accent)', marginLeft: 6 }}>
                  ({selectedMentees.length} selected)
                </span>
              )}
            </label>
            
            {loadingMentees ? (
              <div style={{
                padding: 12, borderRadius: 8,
                background: 'var(--surface-2)',
                color: 'var(--text-muted)', fontSize: 13,
              }}>
                Loading mentees...
              </div>
            ) : availableMentees.length === 0 ? (
              <div style={{
                padding: 16, borderRadius: 8,
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                textAlign: 'center',
                color: 'var(--text-muted)', fontSize: 13,
              }}>
                No active mentees available. Mentees need to accept your mentor request first.
              </div>
            ) : (
              <select
                multiple
                className="input"
                value={selectedMentees}
                onChange={handleMenteeSelect}
                style={{
                  minHeight: 140,
                  padding: 8,
                  lineHeight: 2,
                }}
              >
                {availableMentees.map(mentee => (
                  <option key={mentee.id} value={mentee.id}>
                    {mentee.full_name} {mentee.field_of_study ? `· ${mentee.field_of_study}` : ''}
                  </option>
                ))}
              </select>
            )}
            {availableMentees.length > 0 && (
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                Hold Ctrl/Cmd to select multiple mentees
              </p>
            )}
          </div>
          
          {/* File Upload */}
          <div>
            <label style={labelStyle}>📎 Attachments</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed var(--border)',
                borderRadius: 12, padding: '24px',
                textAlign: 'center', cursor: 'pointer',
                transition: 'all 0.15s',
                background: 'var(--surface-2)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--accent)'
                e.currentTarget.style.background = 'var(--accent-soft)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.background = 'var(--surface-2)'
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 6 }}>📁</div>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
                Click to upload files
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', opacity: 0.7, margin: '4px 0 0' }}>
                PDF, DOCX, Images, ZIP — up to 10MB each
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </div>
            
            {/* File list */}
            {files.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                {files.map((file, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 14px', borderRadius: 8,
                      background: 'var(--surface-2)', border: '1px solid var(--border)',
                    }}
                  >
                    <span style={{ fontSize: 18 }}>📄</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {file.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {formatFileSize(file.size)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      style={{
                        background: 'none', border: 'none',
                        cursor: 'pointer', color: 'var(--danger)',
                        fontSize: 18, padding: 0, lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Submission Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Submission Channel</label>
              <input
                type="text"
                className="input"
                value={submissionChannel}
                onChange={e => setSubmissionChannel(e.target.value)}
                placeholder="e.g., GitHub, Google Drive"
              />
            </div>
            <div>
              <label style={labelStyle}>Submission Notes</label>
              <input
                type="text"
                className="input"
                value={submissionNotes}
                onChange={e => setSubmissionNotes(e.target.value)}
                placeholder="e.g., Submit by Friday 5PM"
              />
            </div>
          </div>
          
          {/* Submit Buttons */}
          <div style={{
            display: 'flex', gap: 12, justifyContent: 'flex-end',
            paddingTop: 16, borderTop: '1px solid var(--border)',
          }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={creating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={creating || !title.trim()}
            >
              {creating ? (
                <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Creating...</>
              ) : (
                '🚀 Create Project'
              )}
            </button>
          </div>
        </form>
        
        {/* Toast */}
        {toast && (
          <div style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 999,
            padding: '12px 20px', borderRadius: 12,
            background: toast.type === 'error' ? 'var(--danger)' : '#059669',
            color: '#fff', fontSize: 14, fontWeight: 600,
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span>{toast.type === 'error' ? '⚠️' : '✅'}</span>
            {toast.msg}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Reusable List Field Component ──
function ListField({ label, items, setItems, placeholder }) {
  return (
    <div>
      <label style={{
        display: 'block', fontSize: 13, fontWeight: 700,
        color: 'var(--text-primary)', marginBottom: 8,
      }}>
        {label}
      </label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              className="input"
              value={item}
              onChange={e => {
                const newItems = [...items]
                newItems[i] = e.target.value
                setItems(newItems)
              }}
              placeholder={placeholder}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              onClick={() => {
                if (items.length > 1) {
                  setItems(items.filter((_, idx) => idx !== i))
                }
              }}
              style={{
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '8px 12px', cursor: 'pointer',
                color: 'var(--text-muted)', fontSize: 14,
                display: 'flex', alignItems: 'center',
                flexShrink: 0,
              }}
              disabled={items.length <= 1}
              title="Remove"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setItems([...items, ''])}
          style={{
            background: 'none', border: '1px dashed var(--border)',
            borderRadius: 8, padding: '8px', cursor: 'pointer',
            color: 'var(--accent)', fontSize: 12, fontWeight: 600,
            fontFamily: 'Urbanist, sans-serif',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--accent)'
            e.currentTarget.style.background = 'var(--accent-soft)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)'
            e.currentTarget.style.background = 'transparent'
          }}
        >
          + Add item
        </button>
      </div>
    </div>
  )
}

const labelStyle = {
  display: 'block', fontSize: 13, fontWeight: 700,
  color: 'var(--text-primary)', marginBottom: 8,
}



// import { useState } from 'react'
// import { projectsApi } from '../../lib/api'
// import {
//   X, Code2, Search, Palette, TrendingUp,
//   PenLine, Folder, ChevronRight, ChevronLeft,
//   Check
// } from 'lucide-react'

// const PROJECT_TYPES = [
//   { value: 'tech',     label: 'Tech / Software',     Icon: Code2 },
//   { value: 'research', label: 'Research',             Icon: Search },
//   { value: 'design',   label: 'Design / Creative',   Icon: Palette },
//   { value: 'business', label: 'Business / Strategy', Icon: TrendingUp },
//   { value: 'writing',  label: 'Writing / Content',   Icon: PenLine },
//   { value: 'other',    label: 'Other',               Icon: Folder },
// ]

// const SUBMISSION_CHANNELS = [
//   'GitHub / GitLab', 'Google Drive', 'Email',
//   'Notion', 'Figma', 'PDF Document',
//   'Live Presentation', 'Direct Message', 'Other',
// ]

// const STEPS = ['Basics', 'Details', 'Submission']

// function FieldLabel({ children, required }) {
//   return (
//     <label style={{
//       fontSize: 12, fontWeight: 700,
//       color: 'var(--text-muted)',
//       textTransform: 'uppercase', letterSpacing: '1px',
//       display: 'block', marginBottom: 6,
//     }}>
//       {children}
//       {required && <span style={{ color: 'var(--danger)', marginLeft: 3 }}>*</span>}
//     </label>
//   )
// }

// function FieldHint({ children }) {
//   return (
//     <p style={{
//       fontSize: 12, color: 'var(--text-muted)',
//       margin: '0 0 8px', lineHeight: 1.5,
//     }}>
//       {children}
//     </p>
//   )
// }

// export default function MentorCreateProjectModal({ onClose, onCreated }) {
//   const [step, setStep] = useState(0)
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState(null)

//   // Step 0
//   const [title, setTitle] = useState('')
//   const [projectType, setProjectType] = useState('tech')
//   const [description, setDescription] = useState('')
//   const [deadline, setDeadline] = useState('')

//   // Step 1
//   const [objectives, setObjectives] = useState('')
//   const [deliverables, setDeliverables] = useState('')
//   const [techStack, setTechStack] = useState('')
//   const [requirements, setRequirements] = useState('')
//   const [resources, setResources] = useState('')

//   // Step 2
//   const [submissionChannel, setSubmissionChannel] = useState('GitHub / GitLab')
//   const [submissionNotes, setSubmissionNotes] = useState('')
//   const [menteeIds, setMenteeIds] = useState('')

//   function handleClose() {
//     if (typeof onClose === 'function') onClose()
//   }

//   function canProceed() {
//     if (step === 0) return title.trim().length > 0 && description.trim().length > 0
//     return true
//   }

//   async function handleSubmit() {
//     setLoading(true)
//     setError(null)
//     try {
//       const menteeIdList = menteeIds
//         .split(',')
//         .map(s => s.trim())
//         .filter(Boolean)

//       await projectsApi.create({
//         title: title.trim(),
//         description: description.trim(),
//         project_type: projectType,
//         deadline: deadline || null,
//         objectives: objectives.trim() || null,
//         deliverables: deliverables.trim() || null,
//         requirements: requirements.trim() || null,
//         tech_stack: projectType === 'tech' ? techStack.trim() || null : null,
//         resources: resources.trim() || null,
//         submission_channel: submissionChannel,
//         submission_notes: submissionNotes.trim() || null,
//         mentee_ids: menteeIdList,
//       })
//       if (typeof onCreated === 'function') onCreated()
//     } catch (e) {
//       setError(e.message || 'Failed to create project. Please try again.')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="modal-overlay" onClick={handleClose}>
//       <div
//         className="modal"
//         onClick={e => e.stopPropagation()}
//         style={{
//           maxWidth: 560, padding: 0,
//           overflow: 'hidden', display: 'flex',
//           flexDirection: 'column',
//         }}
//       >
//         {/* Modal header */}
//         <div style={{
//           padding: '22px 28px',
//           borderBottom: '1px solid var(--border)',
//           display: 'flex', alignItems: 'center',
//           justifyContent: 'space-between',
//         }}>
//           <div>
//             <h2 style={{ margin: 0, marginBottom: 2, fontSize: 18 }}>New Project</h2>
//             <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
//               Step {step + 1} of {STEPS.length} — {STEPS[step]}
//             </p>
//           </div>
//           <button
//             onClick={handleClose}
//             style={{
//               background: 'var(--surface-2)', border: '1px solid var(--border)',
//               borderRadius: 8, width: 32, height: 32, cursor: 'pointer',
//               display: 'flex', alignItems: 'center', justifyContent: 'center',
//               color: 'var(--text-muted)', transition: 'all 0.15s',
//             }}
//             onMouseEnter={e => {
//               e.currentTarget.style.borderColor = 'var(--danger)'
//               e.currentTarget.style.color = 'var(--danger)'
//             }}
//             onMouseLeave={e => {
//               e.currentTarget.style.borderColor = 'var(--border)'
//               e.currentTarget.style.color = 'var(--text-muted)'
//             }}
//           >
//             <X size={15} />
//           </button>
//         </div>

//         {/* Step progress */}
//         <div style={{
//           padding: '16px 28px',
//           background: 'var(--surface-2)',
//           borderBottom: '1px solid var(--border)',
//           display: 'flex', alignItems: 'center', gap: 0,
//         }}>
//           {STEPS.map((s, i) => (
//             <div
//               key={s}
//               style={{
//                 display: 'flex', alignItems: 'center',
//                 flex: i < STEPS.length - 1 ? 1 : 'none',
//               }}
//             >
//               <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                 <div style={{
//                   width: 26, height: 26, borderRadius: '50%',
//                   display: 'flex', alignItems: 'center', justifyContent: 'center',
//                   fontSize: 11, fontWeight: 700, flexShrink: 0,
//                   background: i < step
//                     ? 'var(--success)' : i === step
//                     ? 'var(--accent)' : 'var(--surface-3)',
//                   color: i <= step ? '#fff' : 'var(--text-muted)',
//                   transition: 'all 0.2s',
//                 }}>
//                   {i < step ? <Check size={13} /> : i + 1}
//                 </div>
//                 <span style={{
//                   fontSize: 12, fontWeight: 600,
//                   color: i === step
//                     ? 'var(--accent)' : i < step
//                     ? 'var(--success)' : 'var(--text-muted)',
//                 }}>
//                   {s}
//                 </span>
//               </div>
//               {i < STEPS.length - 1 && (
//                 <div style={{
//                   flex: 1, height: 1,
//                   background: i < step ? 'var(--success)' : 'var(--border)',
//                   margin: '0 12px', transition: 'background 0.2s',
//                 }} />
//               )}
//             </div>
//           ))}
//         </div>

//         {/* Step content */}
//         <div style={{
//           padding: '24px 28px',
//           display: 'flex', flexDirection: 'column', gap: 20,
//           overflowY: 'auto', maxHeight: '52vh',
//           flex: 1,
//         }}>

//           {/* STEP 0: BASICS */}
//           {step === 0 && (
//             <>
//               <div>
//                 <FieldLabel required>Project Title</FieldLabel>
//                 <input
//                   className="input"
//                   value={title}
//                   onChange={e => setTitle(e.target.value)}
//                   placeholder="e.g. Build a REST API, Design a Brand Identity, ML Research Paper"
//                   autoFocus
//                 />
//               </div>

//               <div>
//                 <FieldLabel>Project Type</FieldLabel>
//                 <div style={{
//                   display: 'grid',
//                   gridTemplateColumns: 'repeat(3, 1fr)',
//                   gap: 8,
//                 }}>
//                   {PROJECT_TYPES.map(({ value, label, Icon }) => {
//                     const isSelected = projectType === value
//                     return (
//                       <button
//                         key={value}
//                         onClick={() => setProjectType(value)}
//                         style={{
//                           padding: '10px 8px', borderRadius: 10,
//                           border: `1.5px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
//                           background: isSelected ? 'var(--accent-soft)' : 'var(--surface-2)',
//                           color: isSelected ? 'var(--accent)' : 'var(--text-muted)',
//                           cursor: 'pointer', fontFamily: 'Urbanist, sans-serif',
//                           fontSize: 12, fontWeight: 600,
//                           display: 'flex', flexDirection: 'column',
//                           alignItems: 'center', gap: 6,
//                           transition: 'all 0.15s',
//                         }}
//                       >
//                         <Icon size={16} />
//                         <span style={{ fontSize: 11, lineHeight: 1.3, textAlign: 'center' }}>
//                           {label}
//                         </span>
//                       </button>
//                     )
//                   })}
//                 </div>
//               </div>

//               <div>
//                 <FieldLabel required>Project Brief</FieldLabel>
//                 <FieldHint>
//                   Describe the project clearly — what it is, why it matters, and
//                   what the mentee should understand or produce by the end.
//                 </FieldHint>
//                 <textarea
//                   className="input"
//                   value={description}
//                   onChange={e => setDescription(e.target.value)}
//                   placeholder="This project involves building a production-ready REST API using FastAPI and PostgreSQL..."
//                   style={{ minHeight: 110, lineHeight: 1.6, resize: 'none' }}
//                 />
//               </div>

//               <div>
//                 <FieldLabel>Deadline</FieldLabel>
//                 <input
//                   type="date"
//                   className="input"
//                   value={deadline}
//                   onChange={e => setDeadline(e.target.value)}
//                   style={{ colorScheme: 'dark' }}
//                 />
//               </div>
//             </>
//           )}

//           {/* STEP 1: DETAILS */}
//           {step === 1 && (
//             <>
//               <div style={{
//                 padding: '10px 14px', borderRadius: 10,
//                 background: 'var(--accent-soft)', border: '1px solid var(--border)',
//                 fontSize: 12, color: 'var(--accent)', lineHeight: 1.5,
//               }}>
//                 All fields on this step are optional but help the AI generate
//                 better weekly tasks and give more accurate progress analysis.
//               </div>

//               <div>
//                 <FieldLabel>Objectives</FieldLabel>
//                 <FieldHint>What should the mentee be able to do by the end? One objective per line.</FieldHint>
//                 <textarea
//                   className="input"
//                   value={objectives}
//                   onChange={e => setObjectives(e.target.value)}
//                   placeholder={`Implement JWT authentication end-to-end\nWrite unit and integration tests with >80% coverage`}
//                   style={{ minHeight: 90, lineHeight: 1.6, resize: 'none' }}
//                 />
//               </div>

//               <div>
//                 <FieldLabel>Deliverables</FieldLabel>
//                 <FieldHint>What specific things must be produced? One per line.</FieldHint>
//                 <textarea
//                   className="input"
//                   value={deliverables}
//                   onChange={e => setDeliverables(e.target.value)}
//                   placeholder={`A working API with all endpoints functional\nTest suite with coverage report`}
//                   style={{ minHeight: 80, lineHeight: 1.6, resize: 'none' }}
//                 />
//               </div>

//               {projectType === 'tech' && (
//                 <div>
//                   <FieldLabel>Tech Stack / Tools</FieldLabel>
//                   <FieldHint>Comma-separated list of tools, languages, or frameworks.</FieldHint>
//                   <input
//                     className="input"
//                     value={techStack}
//                     onChange={e => setTechStack(e.target.value)}
//                     placeholder="Python, FastAPI, PostgreSQL, Docker, pytest"
//                   />
//                 </div>
//               )}

//               <div>
//                 <FieldLabel>Requirements & Constraints</FieldLabel>
//                 <FieldHint>Any rules, prerequisites, or constraints the mentee must follow.</FieldHint>
//                 <textarea
//                   className="input"
//                   value={requirements}
//                   onChange={e => setRequirements(e.target.value)}
//                   placeholder="Must use REST not GraphQL. No external auth libraries — implement JWT manually."
//                   style={{ minHeight: 80, lineHeight: 1.6, resize: 'none' }}
//                 />
//               </div>

//               <div>
//                 <FieldLabel>Resources & References</FieldLabel>
//                 <FieldHint>Links, books, or guides the mentee should use. One per line.</FieldHint>
//                 <textarea
//                   className="input"
//                   value={resources}
//                   onChange={e => setResources(e.target.value)}
//                   placeholder={`https://fastapi.tiangolo.com/docs\nClean Code by Robert C. Martin`}
//                   style={{ minHeight: 80, lineHeight: 1.6, resize: 'none' }}
//                 />
//               </div>
//             </>
//           )}

//           {/* STEP 2: SUBMISSION */}
//           {step === 2 && (
//             <>
//               <div>
//                 <FieldLabel>Submission Channel</FieldLabel>
//                 <FieldHint>Where should the mentee submit their completed work?</FieldHint>
//                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
//                   {SUBMISSION_CHANNELS.map(ch => {
//                     const isSelected = submissionChannel === ch
//                     return (
//                       <button
//                         key={ch}
//                         onClick={() => setSubmissionChannel(ch)}
//                         style={{
//                           padding: '7px 14px', borderRadius: 20,
//                           border: `1.5px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
//                           background: isSelected ? 'var(--accent-soft)' : 'var(--surface-2)',
//                           color: isSelected ? 'var(--accent)' : 'var(--text-muted)',
//                           cursor: 'pointer', fontFamily: 'Urbanist, sans-serif',
//                           fontSize: 12, fontWeight: 600,
//                           transition: 'all 0.15s',
//                         }}
//                       >
//                         {ch}
//                       </button>
//                     )
//                   })}
//                 </div>
//               </div>

//               <div>
//                 <FieldLabel>Submission Instructions</FieldLabel>
//                 <FieldHint>Any specific steps the mentee should follow when submitting.</FieldHint>
//                 <textarea
//                   className="input"
//                   value={submissionNotes}
//                   onChange={e => setSubmissionNotes(e.target.value)}
//                   placeholder="Push to the main branch, open a pull request, and share the PR link."
//                   style={{ minHeight: 80, lineHeight: 1.6, resize: 'none' }}
//                 />
//               </div>

//               <div>
//                 <FieldLabel>Assign Mentees</FieldLabel>
//                 <FieldHint>Comma-separated mentee user IDs. You can also assign mentees later.</FieldHint>
//                 <input
//                   className="input"
//                   value={menteeIds}
//                   onChange={e => setMenteeIds(e.target.value)}
//                   placeholder="Leave blank to assign later"
//                 />
//               </div>

//               {error && (
//                 <div style={{
//                   padding: '10px 14px', borderRadius: 10,
//                   background: 'var(--danger-soft)',
//                   border: '1px solid rgba(220,38,38,0.2)',
//                   color: 'var(--danger)', fontSize: 13,
//                   display: 'flex', alignItems: 'center', gap: 8,
//                 }}>
//                   <X size={13} />
//                   {error}
//                 </div>
//               )}
//             </>
//           )}
//         </div>

//         {/* Footer */}
//         <div style={{
//           padding: '16px 28px',
//           borderTop: '1px solid var(--border)',
//           display: 'flex', justifyContent: 'space-between',
//           alignItems: 'center',
//           background: 'var(--surface)',
//         }}>
//           <button
//             className="btn btn-secondary"
//             onClick={step === 0 ? handleClose : () => setStep(s => s - 1)}
//             style={{ display: 'flex', alignItems: 'center', gap: 6 }}
//           >
//             {step === 0
//               ? <><X size={13} /> Cancel</>
//               : <><ChevronLeft size={13} /> Back</>
//             }
//           </button>

//           {step < STEPS.length - 1 ? (
//             <button
//               className="btn btn-primary"
//               onClick={() => setStep(s => s + 1)}
//               disabled={!canProceed()}
//               style={{ display: 'flex', alignItems: 'center', gap: 6 }}
//             >
//               Next <ChevronRight size={13} />
//             </button>
//           ) : (
//             <button
//               className="btn btn-primary"
//               onClick={handleSubmit}
//               disabled={loading}
//               style={{
//                 minWidth: 140,
//                 display: 'flex', alignItems: 'center',
//                 justifyContent: 'center', gap: 6,
//               }}
//             >
//               {loading
//                 ? <><span className="spinner" style={{ width: 13, height: 13, borderWidth: 2 }} /> Creating...</>
//                 : <><Check size={13} /> Create Project</>
//               }
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }