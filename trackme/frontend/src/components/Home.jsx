// import { useEffect, useState } from 'react'
// import { useAuth } from '../context/AuthContext'
// import { logsApi, mentorApi, projectsApi } from '../lib/api'
// import MentorCreateProjectModal from './modals/MentorCreateProjectModal'
// import MenteeCreateProjectModal from './modals/MenteeCreateProjectModal'
// import AddMentorModal from './modals/AddMentorModal'
// import BecomeMentorModal from './modals/BecomeMentorModal'

// export default function Home({ setPage }) {
//   const { user, profile } = useAuth()
//   const [streak, setStreak] = useState({ current_streak: 0, longest_streak: 0 })
//   const [recentLogs, setRecentLogs] = useState([])
//   const [allLogs, setAllLogs] = useState([])
//   const [myMentor, setMyMentor] = useState(null)
//   const [projects, setProjects] = useState({ created: [], assigned: [] })
//   const [loading, setLoading] = useState(true)

//   const [showCreateProject, setShowCreateProject] = useState(false)
//   const [showAddMentor, setShowAddMentor] = useState(false)
//   const [showBecomeMentor, setShowBecomeMentor] = useState(false)

//   const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'
//   const isMentor = profile?.role === 'mentor'

//   useEffect(() => {
//     async function load() {
//       try {
//         const [streakData, logsData, projectsData] = await Promise.all([
//           logsApi.streak(),
//           logsApi.myLogs(),
//           projectsApi.myProjects(),
//         ])
//         setStreak(streakData)
//         const allLogsData = logsData.logs || []
//         setAllLogs(allLogsData)
//         setRecentLogs(allLogsData.slice(0, 3))
//         setProjects(projectsData)

//         if (!isMentor) {
//           const mentorData = await mentorApi.myMentor()
//           setMyMentor(mentorData.mentor)
//         }
//       } catch (e) {
//         console.error('Home load error:', e)
//       } finally {
//         setLoading(false)
//       }
//     }
//     load()
//   }, [isMentor])

//   const hour = new Date().getHours()
//   const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
//   const hasLoggedToday = recentLogs.some(l => l.log_date === new Date().toISOString().split('T')[0])

//   return (
//     <div className="page">
//       <style>{`
//         .home-grid-top {
//           display: grid;
//           grid-template-columns: repeat(3, 1fr);
//           gap: 16px;
//           margin-bottom: 16px;
//         }
//         .home-grid-bottom {
//           display: grid;
//           grid-template-columns: 2fr 1fr;
//           gap: 16px;
//           margin-bottom: 16px;
//         }
//         @media (max-width: 1024px) {
//           .home-grid-top { grid-template-columns: repeat(2, 1fr); }
//           .home-grid-bottom { grid-template-columns: 1fr 1fr; }
//         }
//         @media (max-width: 640px) {
//           .home-grid-top { grid-template-columns: 1fr; }
//           .home-grid-bottom { grid-template-columns: 1fr; }
//         }
//       `}</style>

//       {/* Header */}
//       <div style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
//         <div>
//           <h1 style={{ marginBottom: 4 }}>
//             {greeting}, {firstName} 👋
//           </h1>
//           <p className="text-muted" style={{ fontSize: 15 }}>
//             where do we pick up from
//           </p>
//         </div>
//         <div style={{
//           fontSize: 12, fontWeight: 600, color: 'var(--text-muted)',
//           letterSpacing: '1px', textTransform: 'uppercase',
//           paddingTop: 8, flexShrink: 0,
//         }}>
//           {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
//         </div>
//       </div>

//       {/* Top Row */}
//       <div className="home-grid-top">

//         {/* Streak Card */}
//         <div className="card" style={{
//           background: 'linear-gradient(135deg, #4C1D95 0%, #7C3AED 100%)',
//           border: 'none', color: '#fff',
//           animation: streak.current_streak > 0 ? 'streakBounce 2s ease infinite' : 'none',
//         }}>
//           <div style={{ fontSize: 11, letterSpacing: '2px', fontWeight: 600, opacity: 0.7, marginBottom: 12, textTransform: 'uppercase' }}>
//             Current Streak
//           </div>
//           <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1, marginBottom: 4 }}>
//             {loading ? '—' : streak.current_streak}
//           </div>
//           <div style={{ fontSize: 18, fontWeight: 600, opacity: 0.8 }}>
//             {streak.current_streak === 1 ? 'day' : 'days'} 🔥
//           </div>
//           <div style={{ marginTop: 16, fontSize: 12, opacity: 0.6 }}>
//             Longest: {streak.longest_streak} days
//           </div>
//         </div>

//         {/* Mentor: Check Your Mentees | Non-mentor: Be a Mentor */}
//         {isMentor ? (
//           <div
//             className="card card-clickable"
//             onClick={() => setPage('mentees')}
//             style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
//           >
//             <div>
//               <div style={{ fontSize: 28, marginBottom: 10 }}>👥</div>
//               <h3 style={{ marginBottom: 6 }}>Your Mentees</h3>
//               <p className="text-muted" style={{ fontSize: 13 }}>
//                 See who you're guiding, review their logs, and track their progress.
//               </p>
//             </div>
//             <div style={{ marginTop: 16 }}>
//               <span className="badge badge-accent">View Dashboard →</span>
//             </div>
//           </div>
//         ) : (
//           <div
//             className="card card-clickable"
//             onClick={() => setShowBecomeMentor(true)}
//             style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
//           >
//             <div>
//               <div style={{ fontSize: 28, marginBottom: 10 }}>🎯</div>
//               <h3 style={{ marginBottom: 6 }}>Be a Mentor</h3>
//               <p className="text-muted" style={{ fontSize: 13 }}>
//                 Guide someone on their learning journey. Accept mentee requests.
//               </p>
//             </div>
//             <div style={{ marginTop: 16 }}>
//               <span className="badge badge-accent">Set Up</span>
//             </div>
//           </div>
//         )}

//         {/* Add a Mentor Card */}
//         <div
//           className="card card-clickable"
//           onClick={() => setShowAddMentor(true)}
//           style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
//         >
//           <div>
//             <div style={{ fontSize: 28, marginBottom: 10 }}>👤</div>
//             <h3 style={{ marginBottom: 6 }}>
//               {myMentor ? `Mentor: ${myMentor.profiles?.full_name}` : 'Add a Mentor'}
//             </h3>
//             <p className="text-muted" style={{ fontSize: 13 }}>
//               {myMentor
//                 ? `Connected. Your logs go to ${myMentor.profiles?.full_name}.`
//                 : 'Connect with your mentor so they can sign your daily logs.'}
//             </p>
//           </div>
//           <div style={{ marginTop: 16 }}>
//             <span className={`badge ${myMentor ? 'badge-success' : 'badge-accent'}`}>
//               {myMentor ? '✓ Connected' : 'Connect'}
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Bottom Row */}
//       <div className="home-grid-bottom">

//         {/* Create a Project Card */}
//         <div
//           className="card card-clickable"
//           onClick={() => setShowCreateProject(true)}
//           style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
//         >
//           <div>
//             <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
//               <span style={{ fontSize: 28 }}>📋</span>
//               <h3>Create a Project</h3>
//             </div>
//             <p className="text-muted" style={{ fontSize: 14, lineHeight: 1.6 }}>
//               Create tasks and assign your mentees to them. Track what they're working on and keep everyone aligned.
//             </p>
//           </div>

//           {projects.created.length > 0 && (
//             <div style={{ marginTop: 16 }}>
//               <div style={{ fontSize: 11, letterSpacing: '1.5px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>
//                 Active Projects
//               </div>
//               <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
//                 {projects.created.slice(0, 2).map(p => (
//                   <div key={p.id} style={{
//                     padding: '8px 12px', background: 'var(--surface-2)',
//                     borderRadius: 8, fontSize: 13, fontWeight: 500,
//                     display: 'flex', alignItems: 'center', gap: 8,
//                   }}>
//                     <span style={{ width: 6, height: 6, background: 'var(--accent)', borderRadius: '50%', flexShrink: 0 }} />
//                     {p.title}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           <div style={{ marginTop: 16 }}>
//             <span className="badge badge-accent">+ New Project</span>
//           </div>
//         </div>

//         {/* Log Today Card */}
//         <div
//           className="card card-clickable"
//           onClick={() => setPage('chat')}
//           style={{
//             display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
//             background: hasLoggedToday
//               ? 'linear-gradient(135deg, #064E3B 0%, #059669 100%)'
//               : 'linear-gradient(135deg, var(--accent-soft) 0%, var(--surface-3) 100%)',
//             border: hasLoggedToday ? 'none' : '1px solid var(--border)',
//           }}
//         >
//           <div>
//             <div style={{ fontSize: 32, marginBottom: 12 }}>
//               {hasLoggedToday ? '✅' : '📝'}
//             </div>
//             <h3 style={{ color: hasLoggedToday ? '#fff' : 'var(--text-primary)', marginBottom: 8 }}>
//               {hasLoggedToday ? 'Logged Today!' : "Log Today's Activity"}
//             </h3>
//             <p style={{
//               fontSize: 13, lineHeight: 1.6,
//               color: hasLoggedToday ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)',
//             }}>
//               {hasLoggedToday
//                 ? "You're keeping the streak alive. Great work."
//                 : 'Write what you learned. AI restructures it into a professional log.'}
//             </p>
//           </div>
//           <div style={{ marginTop: 20 }}>
//             <span style={{
//               display: 'inline-block', padding: '6px 14px', borderRadius: 20,
//               fontSize: 12, fontWeight: 600,
//               background: hasLoggedToday ? 'rgba(255,255,255,0.2)' : 'var(--accent)',
//               color: '#fff',
//             }}>
//               {hasLoggedToday ? 'View Log →' : 'Start Writing →'}
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Bottom strip — History + Stats */}
//       <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>

//         <div className="card card-clickable" onClick={() => setPage('history')}>
//           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//             <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
//               <span style={{ fontSize: 28 }}>🕓</span>
//               <div>
//                 <h3 style={{ marginBottom: 3 }}>Log History</h3>
//                 <p className="text-muted" style={{ fontSize: 13 }}>
//                   View all past logs — signed, sent and drafts
//                 </p>
//               </div>
//             </div>
//             <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 20, flexShrink: 0 }}>→</span>
//           </div>
//         </div>

//         <div className="card" style={{ display: 'flex', gap: 0, padding: 0, overflow: 'hidden' }}>
//           {[
//            { label: 'Total Logs', value: allLogs.length || '—' },
//            { label: 'Signed', value: allLogs.filter(l => l.signed).length || '—' },
           
//           ].map((stat, i) => (
//             <div key={i} style={{
//               flex: 1, padding: '20px 16px', textAlign: 'center',
//               borderRight: i === 0 ? '1px solid var(--border)' : 'none',
//             }}>
//               <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--accent)', marginBottom: 4 }}>
//                 {stat.value}
//               </div>
//               <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
//                 {stat.label}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Modals */}
//       {showCreateProject && (
//         isMentor ? (
//           <MentorCreateProjectModal
//             onClose={() => setShowCreateProject(false)}
//             onCreated={() => {
//               setShowCreateProject(false)
//               projectsApi.myProjects().then(d => setProjects(d))
//             }}
//           />
//         ) : (
//           <MenteeCreateProjectModal
//             onClose={() => setShowCreateProject(false)}
//             onCreated={() => {
//               setShowCreateProject(false)
//               projectsApi.myProjects().then(d => setProjects(d))
//             }}
//           />
//         )
//       )}
//       {showAddMentor && (
//         <AddMentorModal onClose={() => setShowAddMentor(false)} />
//       )}
//       {showBecomeMentor && (
//         <BecomeMentorModal onClose={() => setShowBecomeMentor(false)} />
//       )}
//     </div>
//   )
// }

import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { logsApi, mentorApi, projectsApi } from '../lib/api'
import MentorCreateProjectModal from './modals/MentorCreateProjectModal'
import MenteeCreateProjectModal from './modals/MenteeCreateProjectModal'
import AddMentorModal from './modals/AddMentorModal'
import BecomeMentorModal from './modals/BecomeMentorModal'
import {
  Users, Target, UserCircle, ClipboardList,
  PenLine, CheckCircle, Clock, ArrowRight, ChevronRight
} from 'lucide-react'

export default function Home({ setPage }) {
  const { user, profile } = useAuth()
  const [streak, setStreak] = useState({ current_streak: 0, longest_streak: 0 })
  const [recentLogs, setRecentLogs] = useState([])
  const [allLogs, setAllLogs] = useState([])
  const [myMentor, setMyMentor] = useState(null)
  const [projects, setProjects] = useState({ created: [], assigned: [] })
  const [loading, setLoading] = useState(true)

  const [showCreateProject, setShowCreateProject] = useState(false)
  const [showAddMentor, setShowAddMentor] = useState(false)
  const [showBecomeMentor, setShowBecomeMentor] = useState(false)

  const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'
  const isMentor = profile?.role === 'mentor'

  useEffect(() => {
    async function load() {
      try {
        const [streakData, logsData, projectsData] = await Promise.all([
          logsApi.streak(),
          logsApi.myLogs(),
          projectsApi.myProjects(),
        ])
        setStreak(streakData)
        const allLogsData = logsData.logs || []
        setAllLogs(allLogsData)
        setRecentLogs(allLogsData.slice(0, 3))
        setProjects(projectsData)

        if (!isMentor) {
          const mentorData = await mentorApi.myMentor()
          setMyMentor(mentorData.mentor)
        }
      } catch (e) {
        console.error('Home load error:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [isMentor])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const hasLoggedToday = recentLogs.some(l => l.log_date === new Date().toISOString().split('T')[0])

  return (
    <div className="page">
      <style>{`
        .home-grid-top {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 16px;
        }
        .home-grid-bottom {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }
        @media (max-width: 1024px) {
          .home-grid-top { grid-template-columns: repeat(2, 1fr); }
          .home-grid-bottom { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 640px) {
          .home-grid-top { grid-template-columns: 1fr; }
          .home-grid-bottom { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>
            {greeting}, {firstName}
          </h1>
          <p className="text-muted" style={{ fontSize: 15 }}>
            where do we pick up from
          </p>
        </div>
        <div style={{
          fontSize: 12, fontWeight: 600, color: 'var(--text-muted)',
          letterSpacing: '1px', textTransform: 'uppercase',
          paddingTop: 8, flexShrink: 0,
        }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Top Row */}
      <div className="home-grid-top">

        {/* Streak Card */}
        <div className="card" style={{
          background: 'linear-gradient(135deg, #4C1D95 0%, #7C3AED 100%)',
          border: 'none', color: '#fff',
          animation: streak.current_streak > 0 ? 'streakBounce 2s ease infinite' : 'none',
        }}>
          <div style={{ fontSize: 11, letterSpacing: '2px', fontWeight: 600, opacity: 0.7, marginBottom: 12, textTransform: 'uppercase' }}>
            Current Streak
          </div>
          <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1, marginBottom: 4 }}>
            {loading ? '—' : streak.current_streak}
          </div>
          <div style={{ fontSize: 18, fontWeight: 600, opacity: 0.8 }}>
            {streak.current_streak === 1 ? 'day' : 'days'} 🔥
          </div>
          <div style={{ marginTop: 16, fontSize: 12, opacity: 0.6 }}>
            Longest: {streak.longest_streak} days
          </div>
        </div>

        {/* Mentor: Check Your Mentees | Non-mentor: Be a Mentor */}
        {isMentor ? (
          <div
            className="card card-clickable"
            onClick={() => setPage('mentees')}
            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div>
              <div style={{ marginBottom: 10 }}>
                <Users size={28} strokeWidth={1.5} color="var(--accent)" />
              </div>
              <h3 style={{ marginBottom: 6 }}>Your Mentees</h3>
              <p className="text-muted" style={{ fontSize: 13 }}>
                See who you're guiding, review their logs, and track their progress.
              </p>
            </div>
            <div style={{ marginTop: 16 }}>
              <span className="badge badge-accent">View Dashboard →</span>
            </div>
          </div>
        ) : (
          <div
            className="card card-clickable"
            onClick={() => setShowBecomeMentor(true)}
            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div>
              <div style={{ marginBottom: 10 }}>
                <Target size={28} strokeWidth={1.5} color="var(--accent)" />
              </div>
              <h3 style={{ marginBottom: 6 }}>Be a Mentor</h3>
              <p className="text-muted" style={{ fontSize: 13 }}>
                Guide someone on their learning journey. Accept mentee requests.
              </p>
            </div>
            <div style={{ marginTop: 16 }}>
              <span className="badge badge-accent">Set Up</span>
            </div>
          </div>
        )}

        {/* Add a Mentor Card */}
        <div
          className="card card-clickable"
          onClick={() => setShowAddMentor(true)}
          style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
        >
          <div>
            <div style={{ marginBottom: 10 }}>
              <UserCircle size={28} strokeWidth={1.5} color="var(--accent)" />
            </div>
            <h3 style={{ marginBottom: 6 }}>
              {myMentor ? `Mentor: ${myMentor.profiles?.full_name}` : 'Add a Mentor'}
            </h3>
            <p className="text-muted" style={{ fontSize: 13 }}>
              {myMentor
                ? `Connected. Your logs go to ${myMentor.profiles?.full_name}.`
                : 'Connect with your mentor so they can sign your daily logs.'}
            </p>
          </div>
          <div style={{ marginTop: 16 }}>
            <span className={`badge ${myMentor ? 'badge-success' : 'badge-accent'}`}>
              {myMentor
                ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><CheckCircle size={11} /> Connected</span>
                : 'Connect'
              }
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="home-grid-bottom">

        {/* Create a Project Card */}
        <div
          className="card card-clickable"
          onClick={() => setShowCreateProject(true)}
          style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <ClipboardList size={28} strokeWidth={1.5} color="var(--accent)" />
              <h3>Create a Project</h3>
            </div>
            <p className="text-muted" style={{ fontSize: 14, lineHeight: 1.6 }}>
              Create tasks and assign your mentees to them. Track what they're working on and keep everyone aligned.
            </p>
          </div>

          {projects.created.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 11, letterSpacing: '1.5px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>
                Active Projects
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {projects.created.slice(0, 2).map(p => (
                  <div key={p.id} style={{
                    padding: '8px 12px', background: 'var(--surface-2)',
                    borderRadius: 8, fontSize: 13, fontWeight: 500,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <span style={{ width: 6, height: 6, background: 'var(--accent)', borderRadius: '50%', flexShrink: 0 }} />
                    {p.title}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            <span className="badge badge-accent">+ New Project</span>
          </div>
        </div>

        {/* Log Today Card */}
        <div
          className="card card-clickable"
          onClick={() => setPage('chat')}
          style={{
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            background: hasLoggedToday
              ? 'linear-gradient(135deg, #064E3B 0%, #059669 100%)'
              : 'linear-gradient(135deg, var(--accent-soft) 0%, var(--surface-3) 100%)',
            border: hasLoggedToday ? 'none' : '1px solid var(--border)',
          }}
        >
          <div>
            <div style={{ marginBottom: 12 }}>
              {hasLoggedToday
                ? <CheckCircle size={32} strokeWidth={1.5} color="#fff" />
                : <PenLine size={32} strokeWidth={1.5} color="var(--accent)" />
              }
            </div>
            <h3 style={{ color: hasLoggedToday ? '#fff' : 'var(--text-primary)', marginBottom: 8 }}>
              {hasLoggedToday ? 'Logged Today!' : "Log Today's Activity"}
            </h3>
            <p style={{
              fontSize: 13, lineHeight: 1.6,
              color: hasLoggedToday ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)',
            }}>
              {hasLoggedToday
                ? "You're keeping the streak alive. Great work."
                : 'Write what you learned. AI restructures it into a professional log.'}
            </p>
          </div>
          <div style={{ marginTop: 20 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 20,
              fontSize: 12, fontWeight: 600,
              background: hasLoggedToday ? 'rgba(255,255,255,0.2)' : 'var(--accent)',
              color: '#fff',
            }}>
              {hasLoggedToday ? 'View Log' : 'Start Writing'}
              <ChevronRight size={13} />
            </span>
          </div>
        </div>
      </div>

      {/* Bottom strip — History + Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>

        <div className="card card-clickable" onClick={() => setPage('history')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Clock size={28} strokeWidth={1.5} color="var(--accent)" />
              <div>
                <h3 style={{ marginBottom: 3 }}>Log History</h3>
                <p className="text-muted" style={{ fontSize: 13 }}>
                  View all past logs — signed, sent and drafts
                </p>
              </div>
            </div>
            <ArrowRight size={20} color="var(--accent)" strokeWidth={2.5} style={{ flexShrink: 0 }} />
          </div>
        </div>

        <div className="card" style={{ display: 'flex', gap: 0, padding: 0, overflow: 'hidden' }}>
          {[
            { label: 'Total Logs', value: allLogs.length || '—' },
            { label: 'Signed', value: allLogs.filter(l => l.signed).length || '—' },
          ].map((stat, i) => (
            <div key={i} style={{
              flex: 1, padding: '20px 16px', textAlign: 'center',
              borderRight: i === 0 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--accent)', marginBottom: 4 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showCreateProject && (
        isMentor ? (
          <MentorCreateProjectModal
            onClose={() => setShowCreateProject(false)}
            onCreated={() => {
              setShowCreateProject(false)
              projectsApi.myProjects().then(d => setProjects(d))
            }}
          />
        ) : (
          <MenteeCreateProjectModal
            onClose={() => setShowCreateProject(false)}
            onCreated={() => {
              setShowCreateProject(false)
              projectsApi.myProjects().then(d => setProjects(d))
            }}
          />
        )
      )}
      {showAddMentor && (
        <AddMentorModal onClose={() => setShowAddMentor(false)} />
      )}
      {showBecomeMentor && (
        <BecomeMentorModal onClose={() => setShowBecomeMentor(false)} />
      )}
    </div>
  )
}