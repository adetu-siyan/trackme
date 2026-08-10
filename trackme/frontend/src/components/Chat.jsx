


// import { useState, useEffect } from 'react'
// import {
//   Edit3, Send, RotateCcw, CheckCircle, Mail, Tag,
//   Link2, Loader2, ChevronRight, FileText, Inbox,
//   AlertCircle, Dumbbell, Sparkles, Clock
// } from 'lucide-react'
// import { useAuth } from '../context/AuthContext'
// import { logsApi, projectsApi, weeklyFocusApi } from '../lib/api'
// import { useToast, ToastContainer } from '../hooks/useToast'

// export default function Chat() {
//   const { user, profile } = useAuth()
//   const { toasts, toast } = useToast()

//   const [stage, setStage] = useState('input')
//   const [rawText, setRawText] = useState('')
//   const [logData, setLogData] = useState(null)
//   const [editedContent, setEditedContent] = useState('')
//   const [editMode, setEditMode] = useState(false)
//   const [question, setQuestion] = useState('')
//   const [detectedDifficulty, setDetectedDifficulty] = useState('')
//   const [userAnswer, setUserAnswer] = useState('')
//   const [evaluation, setEvaluation] = useState(null)
//   const [mentorEmail, setMentorEmail] = useState('')
//   const [sentMentorEmail, setSentMentorEmail] = useState('')
//   const [recentEmails, setRecentEmails] = useState(() => {
//     try { return JSON.parse(localStorage.getItem('Dôti-recent-emails') || '[]') } catch { return [] }
//   })
//   const [loading, setLoading] = useState(false)

//   const [projects, setProjects] = useState([])
//   const [selectedProject, setSelectedProject] = useState('')
//   const [weeklyTasks, setWeeklyTasks] = useState([])
//   const [suggestedTasks, setSuggestedTasks] = useState([])
//   const [confirmedTasks, setConfirmedTasks] = useState([])
//   const [matchingTasks, setMatchingTasks] = useState(false)
//   const [completingTasks, setCompletingTasks] = useState(false)

//   const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'

//   function scoreStyle(score) {
//     if (score >= 70) return { bg: 'linear-gradient(135deg, #064E3B 0%, #059669 100%)', label: 'Passed' }
//     if (score >= 45) return { bg: 'linear-gradient(135deg, #78350F 0%, #D97706 100%)', label: 'Fair' }
//     return { bg: 'linear-gradient(135deg, #450A0A 0%, #DC2626 100%)', label: 'Needs work' }
//   }

//   useEffect(() => {
//     let cancelled = false
//     projectsApi.myProjects()
//       .then(res => {
//         if (cancelled) return
//         const all = [
//           ...(res.created || []).map(p => ({ ...p, role: 'creator' })),
//           ...(res.assigned || []).map(p => ({ ...p, role: 'member' })),
//         ]
//         setProjects(all)
//       })
//       .catch(() => {})
//     return () => { cancelled = true }
//   }, [user?.id])

//   useEffect(() => {
//     if (!selectedProject) {
//       setWeeklyTasks([])
//       setSuggestedTasks([])
//       setConfirmedTasks([])
//       return
//     }
//     let cancelled = false
//     weeklyFocusApi.myTasks()
//       .then(res => {
//         if (cancelled) return
//         setWeeklyTasks(res.tasks || [])
//       })
//       .catch(() => {})
//     return () => { cancelled = true }
//   }, [selectedProject])

//   useEffect(() => {
//     if (!selectedProject || !logData || weeklyTasks.length === 0) return
//     if (stage !== 'answered') return
//     matchLogToTasks()
//   }, [selectedProject, stage])

//   async function matchLogToTasks() {
//     if (!logData || weeklyTasks.length === 0) return
//     setMatchingTasks(true)
//     try {
//       const res = await logsApi.matchTasks({
//         log_id: logData.log_id,
//         task_ids: weeklyTasks.filter(t => !t.completed).map(t => t.id),
//         log_topics: logData.structured_topics || [],
//         log_title: logData.structured_title || '',
//         log_content: logData.structured_content || '',
//         task_titles: weeklyTasks.filter(t => !t.completed).map(t => ({
//           id: t.id, title: t.title, category: t.category,
//         })),
//       })
//       setSuggestedTasks(res.matched_task_ids || [])
//       setConfirmedTasks(res.matched_task_ids || [])
//     } catch (e) {
//       console.error('Task matching failed', e)
//     } finally {
//       setMatchingTasks(false)
//     }
//   }

//   async function handleSubmitLog() {
//     if (rawText.trim().length < 50) {
//       toast.error('Write at least 50 characters — be thorough!')
//       return
//     }
//     setLoading(true)
//     try {
//       const res = await logsApi.create({ raw_content: rawText })
//       setLogData(res)
//       setEditedContent(res.structured_content)
//       setStage('structured')
//       toast.success('AI has restructured your log!')
//     } catch (e) {
//       toast.error(e.message)
//     } finally {
//       setLoading(false)
//     }
//   }

//   async function handleGenerateQuestion() {
//     setLoading(true)
//     try {
//       const res = await logsApi.generateQuestion({ log_id: logData.log_id, difficulty: 'auto' })
//       setQuestion(res.scenario_question || res.question || '')
//       setDetectedDifficulty(res.difficulty || '')
//       setStage('question')
//     } catch (e) {
//       toast.error(e.message)
//     } finally {
//       setLoading(false)
//     }
//   }

//   async function handleVerifyAnswer() {
//     if (!userAnswer.trim()) { toast.error('Write your answer first'); return }
//     setLoading(true)
//     try {
//       const res = await logsApi.verifyAnswer({
//         log_id: logData.log_id,
//         answer: userAnswer,
//         question_type: 'scenario',
//       })
//       setEvaluation(res)
//       setStage('answered')
//     } catch (e) {
//       toast.error(e.message)
//     } finally {
//       setLoading(false)
//     }
//   }

//   async function handleSaveEdit() {
//     setLoading(true)
//     try {
//       await logsApi.edit({
//         log_id: logData.log_id,
//         structured_content: editedContent,
//         structured_title: logData.structured_title,
//         structured_topics: logData.structured_topics,
//       })
//       setLogData(prev => ({ ...prev, structured_content: editedContent }))
//       setEditMode(false)
//       toast.success('Log updated!')
//     } catch (e) {
//       toast.error(e.message)
//     } finally {
//       setLoading(false)
//     }
//   }

//   async function handleSendToMentor() {
//     if (!mentorEmail.trim()) { toast.error("Enter your mentor's email"); return }
//     setLoading(true)
//     try {
//       await logsApi.sendToMentor({
//         log_id: logData.log_id,
//         mentor_email: mentorEmail,
//         project_id: selectedProject || null,
//       })
//     } catch (e) {
//       const alreadySent = e.message?.toLowerCase().includes("already sent")
//       const networkDrop = e.message?.toLowerCase().includes("failed to fetch")
//       if (!alreadySent && !networkDrop) {
//         toast.error(e.message)
//         setLoading(false)
//         return
//       }
//       toast.info(alreadySent ? "Already sent to mentor!" : "Sent! (connection dropped but it went through)")
//     }

//     if (confirmedTasks.length > 0) {
//       setCompletingTasks(true)
//       await Promise.allSettled(
//         confirmedTasks.map(taskId => weeklyFocusApi.updateTask(taskId, true))
//       )
//       setCompletingTasks(false)
//     }

//     setRecentEmails(prev => {
//       const updated = [mentorEmail, ...prev.filter(e => e !== mentorEmail)].slice(0, 3)
//       localStorage.setItem('Dôti-recent-emails', JSON.stringify(updated))
//       return updated
//     })

//     setSentMentorEmail(mentorEmail)
//     setStage('done')
//     setLoading(false)
//   }

//   function toggleTaskConfirm(taskId) {
//     setConfirmedTasks(prev =>
//       prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
//     )
//   }

//   function reset() {
//     setStage('input')
//     setRawText('')
//     setLogData(null)
//     setEditedContent('')
//     setEditMode(false)
//     setQuestion('')
//     setDetectedDifficulty('')
//     setUserAnswer('')
//     setEvaluation(null)
//     setMentorEmail('')
//     setSentMentorEmail('')
//     setSelectedProject('')
//     setWeeklyTasks([])
//     setSuggestedTasks([])
//     setConfirmedTasks([])
//   }

//   const stageIndex = { input: 0, structured: 1, question: 2, answered: 2, done: 3 }
//   const steps = ['Write', 'Review', 'Test', 'Send']

//   return (
//     <div className="page" style={{
//       display: 'flex', flexDirection: 'column',
//       width: '100%', boxSizing: 'border-box',
//     }}>
//       <style>{`
//         @media (max-width: 640px) {
//           .chat-send-row { flex-direction: column !important; }
//           .chat-send-row input { width: 100% !important; }
//           .chat-send-row button { width: 100% !important; min-width: unset !important; }
//           .chat-progress { gap: 4px !important; }
//           .chat-progress-step { padding: 4px 8px !important; font-size: 11px !important; }
//         }
//         @keyframes spin {
//           from { transform: rotate(0deg); }
//           to { transform: rotate(360deg); }
//         }
//       `}</style>

//       <ToastContainer toasts={toasts} />

//       {/* Header */}
//       <div style={{ marginBottom: 20 }}>
//         <h2 style={{ marginBottom: 4 }}>
//           Hello, <span style={{ color: 'var(--accent)' }}>{firstName}</span>
//         </h2>
//         <p className="text-muted" style={{ fontSize: 14 }}>
//           {stage === 'input'      && "What did you learn today? Write freely — AI handles the formatting."}
//           {stage === 'structured' && "Here's your professional log. Review it, then take a quick AI test."}
//           {stage === 'question'   && "Answer this question based on what you studied."}
//           {stage === 'answered'   && (evaluation?.passed ? "Nice work! Ready to send to your mentor?" : "Keep going — you can retry or send anyway.")}
//           {stage === 'done'       && "Log sent. Your mentor will review and sign it."}
//         </p>
//       </div>

//       {/* Progress steps */}
//       <div className="chat-progress" style={{
//         display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap',
//       }}>
//         {steps.map((step, i) => {
//           const current = stageIndex[stage]
//           const isDone = i < current
//           const isActive = i === current
//           return (
//             <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
//               <div
//                 className="chat-progress-step"
//                 style={{
//                   display: 'flex', alignItems: 'center', gap: 6,
//                   padding: '5px 12px', borderRadius: 20,
//                   fontSize: 12, fontWeight: 600,
//                   background: isDone ? 'var(--success-soft)' : isActive ? 'var(--accent-soft)' : 'var(--surface-2)',
//                   color: isDone ? 'var(--success)' : isActive ? 'var(--accent)' : 'var(--text-muted)',
//                 }}
//               >
//                 {isDone
//                   ? <CheckCircle size={12} strokeWidth={2.5} />
//                   : <span>{i + 1}</span>}
//                 <span style={{ marginLeft: 2 }}>{step}</span>
//               </div>
//               {i < steps.length - 1 && (
//                 <div style={{ width: 16, height: 1, background: 'var(--border)' }} />
//               )}
//             </div>
//           )
//         })}
//       </div>

//       {/* ── STAGE: INPUT ── */}
//       {stage === 'input' && (
//         <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
//           <div style={{ position: 'relative', flex: 1 }}>
//             <textarea
//               className="input"
//               style={{
//                 height: '100%', minHeight: 280,
//                 fontSize: 15, lineHeight: 1.7, padding: '20px',
//               }}
//               placeholder={`What did you learn today, ${firstName}?\n\nBe thorough — write about the topics you covered, what you understood, what confused you, what you want to explore more.\n\nExample: "Today I studied Docker containers. I learned that a container is an isolated environment..."`}
//               value={rawText}
//               onChange={e => setRawText(e.target.value)}
//             />
//             <div style={{
//               position: 'absolute', bottom: 12, right: 14, fontSize: 12, fontWeight: 500,
//               color: rawText.length < 50 ? 'var(--danger)' : 'var(--text-muted)',
//               display: 'flex', alignItems: 'center', gap: 4,
//             }}>
//               {rawText.length < 50
//                 ? <><AlertCircle size={12} /> {rawText.length} chars (need {50 - rawText.length} more)</>
//                 : <><CheckCircle size={12} /> {rawText.length} chars</>}
//             </div>
//           </div>

//           <button
//             className="btn btn-primary btn-lg"
//             onClick={handleSubmitLog}
//             disabled={loading || rawText.trim().length < 50}
//             style={{ alignSelf: 'flex-end', minWidth: 200, display: 'flex', alignItems: 'center', gap: 8 }}
//           >
//             {loading
//               ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> AI is restructuring...</>
//               : <>Submit &amp; Restructure <ChevronRight size={16} /></>}
//           </button>
//         </div>
//       )}

//       {/* ── STAGE: STRUCTURED ── */}
//       {stage === 'structured' && logData && (
//         <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
//           <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
//             <div style={{
//               background: 'var(--accent-soft)',
//               padding: '20px 24px',
//               borderBottom: '1px solid var(--border)',
//             }}>
//               <div style={{
//                 fontSize: 11, letterSpacing: '2px', fontWeight: 600,
//                 color: 'var(--accent)', marginBottom: 8, textTransform: 'uppercase',
//                 display: 'flex', alignItems: 'center', gap: 6,
//               }}>
//                 <Sparkles size={12} />
//                 AI Structured Log · {new Date().toLocaleDateString('en-US', {
//                   month: 'long', day: 'numeric', year: 'numeric'
//                 })}
//               </div>
//               <h2 style={{ marginBottom: 12, fontSize: '1.2rem' }}>
//                 {logData.structured_title}
//               </h2>
//               <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
//                 {(logData.structured_topics || []).map((t, i) => (
//                   <span key={i} className="badge badge-accent">{t}</span>
//                 ))}
//               </div>
//             </div>

//             <div style={{ padding: '20px 24px' }}>
//               {editMode ? (
//                 <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
//                   <textarea
//                     className="input"
//                     style={{ minHeight: 300, lineHeight: 1.7 }}
//                     value={editedContent}
//                     onChange={e => setEditedContent(e.target.value)}
//                   />
//                   <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
//                     <button className="btn btn-secondary btn-sm" onClick={() => setEditMode(false)}>
//                       Cancel
//                     </button>
//                     <button className="btn btn-primary btn-sm" onClick={handleSaveEdit} disabled={loading}>
//                       {loading ? 'Saving...' : 'Save Changes'}
//                     </button>
//                   </div>
//                 </div>
//               ) : (
//                 <div style={{
//                   fontSize: 14, lineHeight: 1.8,
//                   color: 'var(--text-secondary)', whiteSpace: 'pre-wrap',
//                 }}>
//                   {logData.structured_content}
//                 </div>
//               )}
//             </div>
//           </div>

//           <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
//             {!editMode && (
//               <button
//                 className="btn btn-secondary"
//                 onClick={() => setEditMode(true)}
//                 style={{ display: 'flex', alignItems: 'center', gap: 6 }}
//               >
//                 <Edit3 size={14} /> Edit Log
//               </button>
//             )}
//             {!editMode && (
//               <button
//                 className="btn btn-ghost"
//                 onClick={() => setStage('answered')}
//                 disabled={loading}
//                 style={{ color: 'var(--text-muted)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
//               >
//                 Skip test <ChevronRight size={14} />
//               </button>
//             )}
//             <button
//               className="btn btn-primary"
//               onClick={handleGenerateQuestion}
//               disabled={editMode || loading}
//               style={{ display: 'flex', alignItems: 'center', gap: 6 }}
//             >
//               {loading
//                 ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Generating test...</>
//                 : <>Take AI Test <ChevronRight size={16} /></>}
//             </button>
//           </div>
//         </div>
//       )}

//       {/* ── STAGE: QUESTION ── */}
//       {stage === 'question' && (
//         <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
//           {detectedDifficulty && (
//             <div style={{
//               display: 'inline-flex', alignItems: 'center', gap: 8,
//               padding: '6px 14px', borderRadius: 20,
//               background: 'var(--accent-soft)', color: 'var(--accent)',
//               fontSize: 13, fontWeight: 600, alignSelf: 'flex-start',
//             }}>
//               <Dumbbell size={13} />
//               {detectedDifficulty.charAt(0).toUpperCase() + detectedDifficulty.slice(1)}
//             </div>
//           )}

//           <div className="card" style={{ borderLeft: '4px solid var(--accent)' }}>
//             <p style={{
//               fontSize: 15, fontWeight: 500,
//               lineHeight: 1.8, color: 'var(--text-primary)',
//               whiteSpace: 'pre-line', margin: 0,
//             }}>
//               {question}
//             </p>
//           </div>

//           <div>
//             <label style={{
//               fontSize: 13, fontWeight: 600,
//               color: 'var(--text-secondary)', display: 'block', marginBottom: 8,
//             }}>
//               Your Answer
//             </label>
//             <textarea
//               className="input"
//               style={{ minHeight: 140, lineHeight: 1.7 }}
//               placeholder="Write your answer here. Be as thorough as you can..."
//               value={userAnswer}
//               onChange={e => setUserAnswer(e.target.value)}
//             />
//           </div>

//           <button
//             className="btn btn-primary"
//             onClick={handleVerifyAnswer}
//             disabled={!userAnswer.trim() || loading}
//             style={{ alignSelf: 'flex-end', minWidth: 160, display: 'flex', alignItems: 'center', gap: 8 }}
//           >
//             {loading
//               ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Evaluating...</>
//               : <>Submit Answer <ChevronRight size={16} /></>}
//           </button>
//         </div>
//       )}

//       {/* ── STAGE: ANSWERED ── */}
//       {stage === 'answered' && (
//         <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

//           {evaluation ? (() => {
//             const s = scoreStyle(evaluation.score)
//             return (
//               <div className="card" style={{
//                 textAlign: 'center', padding: '32px 24px',
//                 background: s.bg, border: 'none', color: '#fff',
//               }}>
//                 <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.85, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '1px' }}>
//                   {s.label}
//                 </div>
//                 <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1, marginBottom: 4 }}>
//                   {evaluation.score}
//                   <span style={{ fontSize: 20, fontWeight: 600, opacity: 0.7 }}>/100</span>
//                 </div>
//                 <p style={{
//                   opacity: 0.92, lineHeight: 1.7,
//                   maxWidth: 420, margin: '16px auto 0',
//                   fontSize: 14, whiteSpace: 'pre-line',
//                 }}>
//                   {evaluation.feedback}
//                 </p>
//               </div>
//             )
//           })() : (
//             <div className="card" style={{
//               textAlign: 'center', padding: '24px',
//               background: 'var(--surface-2)', border: '1px solid var(--border)',
//             }}>
//               <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
//                 <FileText size={32} strokeWidth={1.5} color="var(--text-muted)" />
//               </div>
//               <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
//                 Test skipped. Your log is ready to send to your mentor.
//               </p>
//             </div>
//           )}

//           {/* Send to mentor card */}
//           <div className="card" style={{ padding: '24px' }}>
//             <h3 style={{ marginBottom: 16 }}>Send to Mentor</h3>

//             <div className="chat-send-row" style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
//               <input
//                 className="input"
//                 type="email"
//                 placeholder="mentor@email.com"
//                 value={mentorEmail}
//                 onChange={e => setMentorEmail(e.target.value)}
//                 style={{ flex: 1 }}
//               />
//               <button
//                 className="btn btn-primary"
//                 onClick={handleSendToMentor}
//                 disabled={loading || !mentorEmail.trim()}
//                 style={{ minWidth: 120, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}
//               >
//                 {loading
//                   ? completingTasks
//                     ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Completing...</>
//                     : <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Sending...</>
//                   : <><Send size={14} /> Send</>}
//               </button>
//             </div>

//             {recentEmails.length > 0 && (
//               <div style={{ marginBottom: 14 }}>
//                 <div style={{
//                   fontSize: 12, color: 'var(--text-muted)', fontWeight: 600,
//                   marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5,
//                 }}>
//                   <Clock size={11} /> Recent mentors
//                 </div>
//                 <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
//                   {recentEmails.map(email => (
//                     <button
//                       key={email}
//                       onClick={() => setMentorEmail(email)}
//                       style={{
//                         background: mentorEmail === email ? 'var(--accent-soft)' : 'var(--surface-2)',
//                         border: `1px solid ${mentorEmail === email ? 'var(--accent)' : 'var(--border)'}`,
//                         borderRadius: 8, padding: '8px 12px', cursor: 'pointer',
//                         fontFamily: 'Urbanist, sans-serif', fontSize: 13,
//                         color: mentorEmail === email ? 'var(--accent)' : 'var(--text-secondary)',
//                         textAlign: 'left', transition: 'all 0.15s',
//                         display: 'flex', alignItems: 'center', gap: 8,
//                       }}
//                     >
//                       <Mail size={13} /> {email}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {projects.length > 0 && (
//               <div style={{ marginBottom: 14 }}>
//                 <label style={{
//                   fontSize: 13, fontWeight: 600,
//                   color: 'var(--text-secondary)', display: 'flex',
//                   alignItems: 'center', gap: 6, marginBottom: 6,
//                 }}>
//                   <Tag size={13} /> Tag to Project (optional)
//                 </label>
//                 <select
//                   className="input"
//                   value={selectedProject}
//                   onChange={e => setSelectedProject(e.target.value)}
//                   style={{ fontSize: 14 }}
//                 >
//                   <option value="">— No project —</option>
//                   {projects.map(p => (
//                     <option key={p.id} value={p.id}>{p.title}</option>
//                   ))}
//                 </select>
//               </div>
//             )}

//             {selectedProject && weeklyTasks.length > 0 && (
//               <div style={{
//                 background: 'var(--surface-2)',
//                 borderRadius: 12, padding: '16px',
//                 marginBottom: 14, border: '1px solid var(--border)',
//               }}>
//                 <div style={{
//                   display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
//                 }}>
//                   <Link2 size={15} color="var(--text-secondary)" />
//                   <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
//                     Link to Weekly Tasks
//                   </div>
//                   {matchingTasks && (
//                     <span style={{
//                       fontSize: 11, color: 'var(--accent)', fontWeight: 600,
//                       marginLeft: 4, display: 'flex', alignItems: 'center', gap: 4,
//                     }}>
//                       <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> AI matching...
//                     </span>
//                   )}
//                   {suggestedTasks.length > 0 && !matchingTasks && (
//                     <span style={{
//                       fontSize: 11, padding: '2px 8px', borderRadius: 20,
//                       background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 600,
//                     }}>
//                       {suggestedTasks.length} suggested
//                     </span>
//                   )}
//                 </div>

//                 <p style={{
//                   fontSize: 12, color: 'var(--text-muted)',
//                   lineHeight: 1.5, marginBottom: 12,
//                 }}>
//                   Tick any tasks this log covers. They'll be marked complete when you send.
//                 </p>

//                 <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
//                   {weeklyTasks.filter(t => !t.completed).map(task => {
//                     const isSuggested = suggestedTasks.includes(task.id)
//                     const isConfirmed = confirmedTasks.includes(task.id)
//                     return (
//                       <div
//                         key={task.id}
//                         onClick={() => toggleTaskConfirm(task.id)}
//                         style={{
//                           display: 'flex', alignItems: 'center', gap: 12,
//                           padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
//                           background: isConfirmed ? 'var(--accent-soft)' : 'var(--surface)',
//                           border: `1.5px solid ${isConfirmed ? 'var(--accent)' : 'var(--border)'}`,
//                           transition: 'all 0.18s',
//                         }}
//                       >
//                         <div style={{
//                           width: 20, height: 20, borderRadius: 6, flexShrink: 0,
//                           border: `2px solid ${isConfirmed ? 'var(--accent)' : 'var(--border-strong)'}`,
//                           background: isConfirmed ? 'var(--accent)' : 'transparent',
//                           display: 'flex', alignItems: 'center', justifyContent: 'center',
//                           transition: 'all 0.18s',
//                         }}>
//                           {isConfirmed && <CheckCircle size={13} color="#fff" strokeWidth={3} />}
//                         </div>
//                         <div style={{ flex: 1, minWidth: 0 }}>
//                           <div style={{
//                             fontSize: 13, fontWeight: 600, marginBottom: 2,
//                             color: isConfirmed ? 'var(--accent)' : 'var(--text-primary)',
//                           }}>
//                             {task.title}
//                           </div>
//                           <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
//                             <span style={{
//                               fontSize: 10, fontWeight: 600, padding: '2px 6px',
//                               borderRadius: 20, background: 'var(--surface-3)',
//                               color: 'var(--text-muted)',
//                             }}>
//                               {task.category}
//                             </span>
//                             {isSuggested && (
//                               <span style={{
//                                 fontSize: 10, fontWeight: 700, padding: '2px 6px',
//                                 borderRadius: 20, background: 'var(--accent-soft)',
//                                 color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 3,
//                               }}>
//                                 <Sparkles size={9} /> AI match
//                               </span>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     )
//                   })}

//                   {weeklyTasks.filter(t => !t.completed).length === 0 && (
//                     <p style={{
//                       fontSize: 13, color: 'var(--success)', fontWeight: 600,
//                       display: 'flex', alignItems: 'center', gap: 6,
//                     }}>
//                       <CheckCircle size={14} /> All tasks for this week are already complete!
//                     </p>
//                   )}
//                 </div>

//                 {confirmedTasks.length > 0 && (
//                   <div style={{
//                     marginTop: 12, padding: '8px 12px', borderRadius: 8,
//                     background: 'var(--success-soft)',
//                     fontSize: 12, color: 'var(--success)', fontWeight: 600,
//                     display: 'flex', alignItems: 'center', gap: 6,
//                   }}>
//                     <CheckCircle size={13} />
//                     {confirmedTasks.length} task{confirmedTasks.length > 1 ? 's' : ''} will be marked complete when you send
//                   </div>
//                 )}
//               </div>
//             )}

//             <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
//               <button
//                 className="btn btn-secondary btn-sm"
//                 onClick={() => { setEditMode(true); setStage('structured') }}
//                 style={{ display: 'flex', alignItems: 'center', gap: 6 }}
//               >
//                 <Edit3 size={13} /> Edit Log First
//               </button>
//               <button
//                 className="btn btn-ghost btn-sm"
//                 onClick={reset}
//                 style={{ display: 'flex', alignItems: 'center', gap: 6 }}
//               >
//                 <RotateCcw size={13} /> Start Over
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── STAGE: DONE ── */}
//       {stage === 'done' && (
//         <div style={{ textAlign: 'center', padding: '60px 20px' }}>
//           <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
//             <Inbox size={56} strokeWidth={1.2} color="var(--accent)" />
//           </div>
//           <h2 style={{ marginBottom: 12 }}>Log sent to your mentor</h2>
//           <p className="text-muted" style={{
//             fontSize: 15, lineHeight: 1.7,
//             maxWidth: 400, margin: '0 auto 16px',
//           }}>
//             They'll receive an email with your log and a button to sign it.
//             You'll be notified the moment they do.
//           </p>

//           {sentMentorEmail && (
//             <div style={{
//               display: 'inline-flex', alignItems: 'center', gap: 8,
//               padding: '8px 16px', borderRadius: 10,
//               background: 'var(--surface-2)', border: '1px solid var(--border)',
//               fontSize: 13, color: 'var(--text-secondary)', marginBottom: 28,
//             }}>
//               <Mail size={14} />
//               <span>Sent to <strong style={{ color: 'var(--text-primary)' }}>{sentMentorEmail}</strong></span>
//             </div>
//           )}

//           {confirmedTasks.length > 0 && (
//             <div style={{
//               display: 'inline-flex', alignItems: 'center', gap: 8,
//               padding: '8px 16px', borderRadius: 10,
//               background: 'var(--success-soft)', border: '1px solid var(--success)',
//               fontSize: 13, color: 'var(--success)', fontWeight: 600,
//               marginBottom: 28,
//             }}>
//               <CheckCircle size={14} />
//               {confirmedTasks.length} weekly task{confirmedTasks.length > 1 ? 's' : ''} marked complete
//             </div>
//           )}

//           <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
//             <button
//               className="btn btn-primary btn-lg"
//               onClick={reset}
//               style={{ display: 'flex', alignItems: 'center', gap: 8 }}
//             >
//               Log Another Day
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }



import { useState, useEffect, useRef } from 'react'
import {
  Send, RotateCcw, CheckCircle, Mail, Tag,
  Link2, Loader2, ChevronRight, FileText,
  AlertCircle, Dumbbell, Sparkles, Clock, Edit3, Inbox
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { logsApi, projectsApi, weeklyFocusApi } from '../lib/api'
import { useToast, ToastContainer } from '../hooks/useToast'

export default function Chat() {
  const { user, profile } = useAuth()
  const { toasts, toast } = useToast()

  const [stage, setStage] = useState('input')
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [logData, setLogData] = useState(null)
  const [evaluation, setEvaluation] = useState(null)
  const [question, setQuestion] = useState('')
  const [detectedDifficulty, setDetectedDifficulty] = useState('')
  const [editedContent, setEditedContent] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [mentorEmail, setMentorEmail] = useState('')
  const [sentMentorEmail, setSentMentorEmail] = useState('')
  const [recentEmails, setRecentEmails] = useState(() => {
    try { return JSON.parse(localStorage.getItem('Dôti-recent-emails') || '[]') } catch { return [] }
  })
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState('')
  const [weeklyTasks, setWeeklyTasks] = useState([])
  const [suggestedTasks, setSuggestedTasks] = useState([])
  const [confirmedTasks, setConfirmedTasks] = useState([])
  const [matchingTasks, setMatchingTasks] = useState(false)
  const [completingTasks, setCompletingTasks] = useState(false)

  const [messages, setMessages] = useState([])
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'

  function scoreStyle(score) {
    if (score >= 70) return { color: 'var(--success)', label: 'Passed' }
    if (score >= 45) return { color: '#D97706', label: 'Fair' }
    return { color: 'var(--danger)', label: 'Needs work' }
  }

  function placeholder() {
    if (stage === 'input') return `What did you learn today, ${firstName}? Write freely...`
    if (stage === 'question') return 'Write your answer here...'
    return ''
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    let cancelled = false
    projectsApi.myProjects()
      .then(res => {
        if (cancelled) return
        const all = [
          ...(res.created || []).map(p => ({ ...p, role: 'creator' })),
          ...(res.assigned || []).map(p => ({ ...p, role: 'member' })),
        ]
        setProjects(all)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [user?.id])

  useEffect(() => {
    if (!selectedProject) {
      setWeeklyTasks([])
      setSuggestedTasks([])
      setConfirmedTasks([])
      return
    }
    let cancelled = false
    weeklyFocusApi.myTasks()
      .then(res => {
        if (cancelled) return
        setWeeklyTasks(res.tasks || [])
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [selectedProject])

  async function matchLogToTasks() {
    if (!logData || weeklyTasks.length === 0) return
    setMatchingTasks(true)
    try {
      const res = await logsApi.matchTasks({
        log_id: logData.log_id,
        task_ids: weeklyTasks.filter(t => !t.completed).map(t => t.id),
        log_topics: logData.structured_topics || [],
        log_title: logData.structured_title || '',
        log_content: logData.structured_content || '',
        task_titles: weeklyTasks.filter(t => !t.completed).map(t => ({
          id: t.id, title: t.title, category: t.category,
        })),
      })
      setSuggestedTasks(res.matched_task_ids || [])
      setConfirmedTasks(res.matched_task_ids || [])
    } catch (e) {
      console.error('Task matching failed', e)
    } finally {
      setMatchingTasks(false)
    }
  }

  function addMessage(role, content) {
    setMessages(prev => [...prev, { role, content, id: Date.now() + Math.random() }])
  }

  async function handleSend() {
    const text = inputText.trim()
    if (!text) return

    if (stage === 'input') {
      if (text.length < 50) {
        toast.error('Write at least 50 characters — be thorough!')
        return
      }
      addMessage('user', text)
      setInputText('')
      setLoading(true)
      try {
        const res = await logsApi.create({ raw_content: text })
        setLogData(res)
        setEditedContent(res.structured_content)

        // AI response: structured log
        addMessage('ai-structured', res)

        setStage('question')
        setLoading(true)

        // Auto-generate question
        const qRes = await logsApi.generateQuestion({ log_id: res.log_id, difficulty: 'auto' })
        setQuestion(qRes.scenario_question || qRes.question || '')
        setDetectedDifficulty(qRes.difficulty || '')
        addMessage('ai-question', {
          question: qRes.scenario_question || qRes.question || '',
          difficulty: qRes.difficulty || '',
        })
      } catch (e) {
        toast.error(e.message)
      } finally {
        setLoading(false)
      }
      return
    }

    if (stage === 'question') {
      addMessage('user', text)
      setInputText('')
      setLoading(true)
      try {
        const res = await logsApi.verifyAnswer({
          log_id: logData.log_id,
          answer: text,
          question_type: 'scenario',
        })
        setEvaluation(res)
        addMessage('ai-evaluation', res)
        setStage('done-test')
      } catch (e) {
        toast.error(e.message)
      } finally {
        setLoading(false)
      }
      return
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  async function handleSendToMentor() {
    if (!mentorEmail.trim()) { toast.error("Enter your mentor's email"); return }
    setLoading(true)
    try {
      await logsApi.sendToMentor({
        log_id: logData.log_id,
        mentor_email: mentorEmail,
        project_id: selectedProject || null,
      })
    } catch (e) {
      const alreadySent = e.message?.toLowerCase().includes("already sent")
      const networkDrop = e.message?.toLowerCase().includes("failed to fetch")
      if (!alreadySent && !networkDrop) {
        toast.error(e.message)
        setLoading(false)
        return
      }
      toast.info(alreadySent ? "Already sent to mentor!" : "Sent! (connection dropped but it went through)")
    }

    if (confirmedTasks.length > 0) {
      setCompletingTasks(true)
      await Promise.allSettled(
        confirmedTasks.map(taskId => weeklyFocusApi.updateTask(taskId, true))
      )
      setCompletingTasks(false)
    }

    setRecentEmails(prev => {
      const updated = [mentorEmail, ...prev.filter(e => e !== mentorEmail)].slice(0, 3)
      localStorage.setItem('Dôti-recent-emails', JSON.stringify(updated))
      return updated
    })

    setSentMentorEmail(mentorEmail)
    setStage('sent')
    setLoading(false)
  }

  function toggleTaskConfirm(taskId) {
    setConfirmedTasks(prev =>
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    )
  }

  function reset() {
    setStage('input')
    setInputText('')
    setMessages([])
    setLogData(null)
    setEditedContent('')
    setEditMode(false)
    setQuestion('')
    setDetectedDifficulty('')
    setEvaluation(null)
    setMentorEmail('')
    setSentMentorEmail('')
    setSelectedProject('')
    setWeeklyTasks([])
    setSuggestedTasks([])
    setConfirmedTasks([])
  }

  const isEmpty = messages.length === 0 && stage === 'input'
  const showInput = stage === 'input' || stage === 'question'

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100%', width: '100%',
      position: 'relative', boxSizing: 'border-box',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .chat-msg { animation: fadeUp 0.25s ease; }
        .chat-input-wrap textarea:focus { outline: none; }
        @media (max-width: 640px) {
          .chat-inner { padding: 0 16px !important; }
          .chat-input-outer { padding: 12px 16px !important; }
        }
      `}</style>

      <ToastContainer toasts={toasts} />

      {/* ── EMPTY STATE ── */}
      {isEmpty && (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '0 24px', textAlign: 'center',
        }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 8 }}>
            Hello, <span style={{ color: 'var(--accent)' }}>{firstName}</span>
          </h2>
          <p className="text-muted" style={{ fontSize: 14, maxWidth: 360, lineHeight: 1.7 }}>
            What did you learn today? Write freely — Döti handles the structure, the test, and the sign-off.
          </p>
        </div>
      )}

      {/* ── CHAT MESSAGES ── */}
      {!isEmpty && stage !== 'sent' && (
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: '32px 0 16px',
          display: 'flex', flexDirection: 'column',
        }}>
          <div className="chat-inner" style={{
            width: '100%', maxWidth: 720,
            margin: '0 auto', padding: '0 24px',
            display: 'flex', flexDirection: 'column', gap: 28,
          }}>
            {messages.map(msg => {
              if (msg.role === 'user') {
                return (
                  <div key={msg.id} className="chat-msg" style={{
                    display: 'flex', justifyContent: 'flex-end',
                  }}>
                    <div style={{
                      background: 'var(--accent)',
                      color: '#fff',
                      borderRadius: '18px 18px 4px 18px',
                      padding: '12px 16px',
                      maxWidth: '75%',
                      fontSize: 14, lineHeight: 1.7,
                      whiteSpace: 'pre-wrap',
                    }}>
                      {msg.content}
                    </div>
                  </div>
                )
              }

              if (msg.role === 'ai-structured') {
                const data = msg.content
                return (
                  <div key={msg.id} className="chat-msg" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Sparkles size={13} color="var(--accent)" />
                      Döti restructured your log
                    </div>

                    <div style={{
                      background: 'var(--accent-soft)',
                      borderRadius: 14, padding: '20px 22px',
                      border: '1px solid var(--border)',
                    }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                        {(data.structured_topics || []).map((t, i) => (
                          <span key={i} className="badge badge-accent">{t}</span>
                        ))}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10, color: 'var(--text-primary)' }}>
                        {data.structured_title}
                      </div>

                      {editMode ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <textarea
                            className="input"
                            style={{ minHeight: 200, lineHeight: 1.7, fontSize: 13 }}
                            value={editedContent}
                            onChange={e => setEditedContent(e.target.value)}
                          />
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => setEditMode(false)}>Cancel</button>
                            <button className="btn btn-primary btn-sm" onClick={async () => {
                              try {
                                await logsApi.edit({
                                  log_id: logData.log_id,
                                  structured_content: editedContent,
                                  structured_title: logData.structured_title,
                                  structured_topics: logData.structured_topics,
                                })
                                setLogData(prev => ({ ...prev, structured_content: editedContent }))
                                setEditMode(false)
                                toast.success('Log updated!')
                              } catch (e) { toast.error(e.message) }
                            }}>
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div style={{ fontSize: 13, lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                            {logData?.structured_content || data.structured_content}
                          </div>
                          <button
                            onClick={() => setEditMode(true)}
                            style={{
                              marginTop: 12, background: 'none', border: 'none',
                              color: 'var(--accent)', fontSize: 12, fontWeight: 600,
                              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0,
                            }}
                          >
                            <Edit3 size={12} /> Edit log
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              }

              if (msg.role === 'ai-question') {
                return (
                  <div key={msg.id} className="chat-msg" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {msg.content.difficulty && (
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        fontSize: 12, fontWeight: 600,
                        color: 'var(--accent)',
                      }}>
                        <Dumbbell size={12} />
                        {msg.content.difficulty.charAt(0).toUpperCase() + msg.content.difficulty.slice(1)} level detected
                      </div>
                    )}
                    <div style={{
                      fontSize: 14, lineHeight: 1.8,
                      color: 'var(--text-primary)', whiteSpace: 'pre-line',
                    }}>
                      {msg.content.question}
                    </div>
                  </div>
                )
              }

              if (msg.role === 'ai-evaluation') {
                const s = scoreStyle(msg.content.score)
                return (
                  <div key={msg.id} className="chat-msg" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <span style={{ fontSize: 36, fontWeight: 900, color: s.color, lineHeight: 1 }}>
                        {msg.content.score}
                      </span>
                      <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 600 }}>/100 · {s.label}</span>
                    </div>
                    <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
                      {msg.content.feedback}
                    </div>

                    {/* Send to mentor inline */}
                    <div style={{
                      marginTop: 8, padding: '20px', borderRadius: 14,
                      background: 'var(--surface-2)', border: '1px solid var(--border)',
                    }}>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, color: 'var(--text-primary)' }}>
                        Ready to send to your mentor?
                      </div>

                      <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                        <input
                          className="input"
                          type="email"
                          placeholder="mentor@email.com"
                          value={mentorEmail}
                          onChange={e => setMentorEmail(e.target.value)}
                          style={{ flex: 1, minWidth: 200, fontSize: 13 }}
                        />
                        <button
                          className="btn btn-primary"
                          onClick={handleSendToMentor}
                          disabled={loading || !mentorEmail.trim()}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}
                        >
                          {loading
                            ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> {completingTasks ? 'Completing...' : 'Sending...'}</>
                            : <><Send size={14} /> Send</>}
                        </button>
                      </div>

                      {recentEmails.length > 0 && (
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={10} /> Recent mentors
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                            {recentEmails.map(email => (
                              <button key={email} onClick={() => setMentorEmail(email)} style={{
                                background: mentorEmail === email ? 'var(--accent-soft)' : 'transparent',
                                border: `1px solid ${mentorEmail === email ? 'var(--accent)' : 'var(--border)'}`,
                                borderRadius: 8, padding: '6px 10px', cursor: 'pointer',
                                fontFamily: 'Urbanist, sans-serif', fontSize: 12,
                                color: mentorEmail === email ? 'var(--accent)' : 'var(--text-secondary)',
                                textAlign: 'left', display: 'flex', alignItems: 'center', gap: 6,
                              }}>
                                <Mail size={11} /> {email}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {projects.length > 0 && (
                        <div style={{ marginBottom: 12 }}>
                          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                            <Tag size={12} /> Tag to Project (optional)
                          </label>
                          <select
                            className="input"
                            value={selectedProject}
                            onChange={e => {
                              setSelectedProject(e.target.value)
                              if (e.target.value && logData) matchLogToTasks()
                            }}
                            style={{ fontSize: 13 }}
                          >
                            <option value="">— No project —</option>
                            {projects.map(p => (
                              <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {selectedProject && weeklyTasks.length > 0 && (
                        <div style={{
                          borderRadius: 10, padding: '14px',
                          background: 'var(--surface)', border: '1px solid var(--border)',
                        }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Link2 size={13} color="var(--text-secondary)" />
                            Link to Weekly Tasks
                            {matchingTasks && <span style={{ fontSize: 11, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Loader2 size={10} style={{ animation: 'spin 1s linear infinite' }} /> matching...
                            </span>}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {weeklyTasks.filter(t => !t.completed).map(task => {
                              const isSuggested = suggestedTasks.includes(task.id)
                              const isConfirmed = confirmedTasks.includes(task.id)
                              return (
                                <div key={task.id} onClick={() => toggleTaskConfirm(task.id)} style={{
                                  display: 'flex', alignItems: 'center', gap: 10,
                                  padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                                  background: isConfirmed ? 'var(--accent-soft)' : 'var(--surface-2)',
                                  border: `1.5px solid ${isConfirmed ? 'var(--accent)' : 'var(--border)'}`,
                                }}>
                                  <div style={{
                                    width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                                    border: `2px solid ${isConfirmed ? 'var(--accent)' : 'var(--border-strong)'}`,
                                    background: isConfirmed ? 'var(--accent)' : 'transparent',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  }}>
                                    {isConfirmed && <CheckCircle size={10} color="#fff" strokeWidth={3} />}
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: isConfirmed ? 'var(--accent)' : 'var(--text-primary)' }}>{task.title}</div>
                                    <div style={{ display: 'flex', gap: 5, marginTop: 2 }}>
                                      <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 10, background: 'var(--surface-3)', color: 'var(--text-muted)', fontWeight: 600 }}>{task.category}</span>
                                      {isSuggested && <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 10, background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}><Sparkles size={8} /> AI match</span>}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                          {confirmedTasks.length > 0 && (
                            <div style={{ marginTop: 10, fontSize: 11, color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                              <CheckCircle size={11} /> {confirmedTasks.length} task{confirmedTasks.length > 1 ? 's' : ''} will be marked complete
                            </div>
                          )}
                        </div>
                      )}

                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={reset}
                        style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}
                      >
                        <RotateCcw size={11} /> Start over
                      </button>
                    </div>
                  </div>
                )
              }

              return null
            })}

            {loading && (
              <div className="chat-msg" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Loader2 size={15} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)' }} />
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  {stage === 'input' ? 'Structuring your log...' : 'Evaluating your answer...'}
                </span>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>
      )}

      {/* ── SENT STATE ── */}
      {stage === 'sent' && (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '40px 24px', textAlign: 'center',
        }}>
          <Inbox size={52} strokeWidth={1.2} color="var(--accent)" style={{ marginBottom: 20 }} />
          <h2 style={{ marginBottom: 10 }}>Log sent to your mentor</h2>
          <p className="text-muted" style={{ fontSize: 14, lineHeight: 1.7, maxWidth: 360, marginBottom: 20 }}>
            They'll receive an email with your log and a button to sign it. You'll be notified the moment they do.
          </p>
          {sentMentorEmail && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 16px', borderRadius: 10,
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12,
            }}>
              <Mail size={13} />
              Sent to <strong style={{ color: 'var(--text-primary)', marginLeft: 4 }}>{sentMentorEmail}</strong>
            </div>
          )}
          {confirmedTasks.length > 0 && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 16px', borderRadius: 10,
              background: 'var(--success-soft)', border: '1px solid var(--success)',
              fontSize: 13, color: 'var(--success)', fontWeight: 600, marginBottom: 28,
            }}>
              <CheckCircle size={13} />
              {confirmedTasks.length} task{confirmedTasks.length > 1 ? 's' : ''} marked complete
            </div>
          )}
          <button className="btn btn-primary btn-lg" onClick={reset} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            Log Another Day
          </button>
        </div>
      )}

      {/* ── INPUT BAR ── */}
      {showInput && (
        <div className="chat-input-outer" style={{
          width: '100%', padding: '16px 24px',
          boxSizing: 'border-box',
          borderTop: messages.length > 0 ? '1px solid var(--border)' : 'none',
        }}>
          <div style={{
            maxWidth: 720, margin: '0 auto',
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '12px 16px',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <textarea
              ref={textareaRef}
              style={{
                background: 'transparent', border: 'none', resize: 'none',
                fontSize: 14, lineHeight: 1.7, color: 'var(--text-primary)',
                fontFamily: 'Urbanist, sans-serif', width: '100%',
                minHeight: isEmpty ? 80 : 56, maxHeight: 200,
                outline: 'none',
              }}
              placeholder={placeholder()}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                fontSize: 11, fontWeight: 500,
                color: stage === 'input' && inputText.length < 50 && inputText.length > 0
                  ? 'var(--danger)' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                {stage === 'input' && inputText.length > 0 && inputText.length < 50
                  ? <><AlertCircle size={10} /> {50 - inputText.length} more chars needed</>
                  : stage === 'input' && inputText.length >= 50
                    ? <><CheckCircle size={10} /> {inputText.length} chars</>
                    : null}
              </span>
              <button
                onClick={handleSend}
                disabled={loading || !inputText.trim() || (stage === 'input' && inputText.trim().length < 50)}
                style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: inputText.trim().length >= (stage === 'input' ? 50 : 1)
                    ? 'var(--accent)' : 'var(--surface-3)',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.15s',
                }}
              >
                {loading
                  ? <Loader2 size={15} color="#fff" style={{ animation: 'spin 1s linear infinite' }} />
                  : <Send size={15} color={inputText.trim().length >= (stage === 'input' ? 50 : 1) ? '#fff' : 'var(--text-muted)'} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}