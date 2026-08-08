// import { useState, useEffect } from 'react'
// import { useAuth } from '../context/AuthContext'
// import { useTheme } from '../context/ThemeContext'

// const HomeIcon = () => (
//   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
//   </svg>
// )
// const ChatIcon = () => (
//   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
//   </svg>
// )
// const HistoryIcon = () => (
//   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l4 2"/>
//   </svg>
// )
// const ProjectsIcon = () => (
//   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
//     <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
//   </svg>
// )
// const BellIcon = () => (
//   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
//   </svg>
// )
// const SunIcon = () => (
//   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
//   </svg>
// )
// const MoonIcon = () => (
//   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
//   </svg>
// )
// const ChevronIcon = ({ flipped }) => (
//   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
//     style={{ transform: flipped ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
//     <polyline points="9 18 15 12 9 6"/>
//   </svg>
// )
// const FlowIcon = () => (
//   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
//   </svg>
// )
// const SettingsIcon = () => (
//   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
//   </svg>
// )
// const MoreIcon = () => (
//   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
//   </svg>
// )
// const ProfileIcon = () => (
//   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
//   </svg>
// )

// export default function Sidebar({ page, setPage, unreadCount = 0 }) {
//   const { user, profile } = useAuth()
//   const { isDark, toggle } = useTheme()
//   const [expanded, setExpanded] = useState(() => {
//     return localStorage.getItem('sidebar-expanded') === 'true'
//   })
//   const [moreOpen, setMoreOpen] = useState(false)
//   const [isMobile, setIsMobile] = useState(window.innerWidth <= 640)

//   useEffect(() => {
//     localStorage.setItem('sidebar-expanded', expanded)
//   }, [expanded])

//   useEffect(() => {
//     const handler = () => setIsMobile(window.innerWidth <= 640)
//     window.addEventListener('resize', handler)
//     return () => window.removeEventListener('resize', handler)
//   }, [])

//   const initials = profile?.full_name
//     ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
//     : user?.email?.[0]?.toUpperCase() || '?'

//   const navItems = [
//     { id: 'home',          icon: HomeIcon,     label: 'Home' },
//     { id: 'chat',          icon: ChatIcon,     label: 'Log Today' },
//     { id: 'history',       icon: HistoryIcon,  label: 'History' },
//     { id: 'projects',      icon: ProjectsIcon, label: 'Projects' },
//     { id: 'myflow',        icon: FlowIcon,     label: 'MyFlow' },
//     { id: 'notifications', icon: BellIcon,     label: 'Notifications', badge: unreadCount },
//   ]

//   // Bottom nav: Home, Log, Notifications, MyFlow, More
//   const bottomNavItems = [
//     { id: 'home',          icon: HomeIcon,  label: 'Home' },
//     { id: 'chat',          icon: ChatIcon,  label: 'Log' },
//     { id: 'myflow',        icon: FlowIcon,  label: 'MyFlow' },
//     { id: 'notifications', icon: BellIcon,  label: 'Alerts', badge: unreadCount },
//   ]

//   const moreItems = [
//     { id: 'history',  icon: HistoryIcon,  label: 'History' },
//     { id: 'projects', icon: ProjectsIcon, label: 'Projects' },
//     { id: 'settings', icon: SettingsIcon, label: 'Settings' },
//     { id: 'profile',  icon: ProfileIcon,  label: 'Profile' },
//   ]

//   const sidebarWidth = expanded ? 220 : 64

//   // ── MOBILE BOTTOM NAV ─────────────────────────────────────────────────────
//   if (isMobile) {
//     const isMoreActive = moreItems.some(i => i.id === page)

//     return (
//       <>
//         {/* More drawer overlay */}
//         {moreOpen && (
//           <div
//             onClick={() => setMoreOpen(false)}
//             style={{
//               position: 'fixed', inset: 0, zIndex: 149,
//               background: 'rgba(0,0,0,0.5)',
//             }}
//           />
//         )}

//         {/* More drawer */}
//         {moreOpen && (
//           <div style={{
//             position: 'fixed', bottom: 70, left: 0, right: 0,
//             zIndex: 150,
//             background: '#0A0A0F',
//             borderTop: '1px solid #1A1A2E',
//             borderRadius: '20px 20px 0 0',
//             padding: '20px 16px 8px',
//             animation: 'slideUp 0.2s ease',
//           }}>
//             <div style={{
//               width: 36, height: 4, background: '#333',
//               borderRadius: 2, margin: '0 auto 20px',
//             }} />

//             {/* More nav items */}
//             <div style={{
//               display: 'grid', gridTemplateColumns: '1fr 1fr',
//               gap: 10, marginBottom: 16,
//             }}>
//               {moreItems.map(({ id, icon: Icon, label }) => (
//                 <button
//                   key={id}
//                   onClick={() => { setPage(id); setMoreOpen(false) }}
//                   style={{
//                     display: 'flex', alignItems: 'center', gap: 12,
//                     padding: '14px 16px', borderRadius: 12, border: 'none',
//                     background: page === id ? '#7C3AED22' : '#1A1A2E',
//                     color: page === id ? '#A78BFA' : '#888',
//                     cursor: 'pointer', fontFamily: 'Urbanist, sans-serif',
//                     fontSize: 14, fontWeight: 600,
//                     border: page === id ? '1px solid #7C3AED44' : '1px solid transparent',
//                   }}
//                 >
//                   <Icon />
//                   {label}
//                 </button>
//               ))}
//             </div>

//             {/* Theme + Profile row */}
//             <div style={{
//               display: 'flex', gap: 10, paddingBottom: 8,
//             }}>
//               <button
//                 onClick={toggle}
//                 style={{
//                   flex: 1, display: 'flex', alignItems: 'center',
//                   justifyContent: 'center', gap: 8,
//                   padding: '12px', borderRadius: 12, border: 'none',
//                   background: '#1A1A2E', color: '#888',
//                   cursor: 'pointer', fontFamily: 'Urbanist, sans-serif',
//                   fontSize: 13, fontWeight: 600,
//                 }}
//               >
//                 {isDark ? <SunIcon /> : <MoonIcon />}
//                 {isDark ? 'Light' : 'Dark'}
//               </button>

//               <button
//                 onClick={() => { setPage('profile'); setMoreOpen(false) }}
//                 style={{
//                   flex: 1, display: 'flex', alignItems: 'center',
//                   justifyContent: 'center', gap: 8,
//                   padding: '12px', borderRadius: 12, border: 'none',
//                   background: page === 'profile' ? '#7C3AED22' : '#1A1A2E',
//                   color: page === 'profile' ? '#A78BFA' : '#888',
//                   cursor: 'pointer', fontFamily: 'Urbanist, sans-serif',
//                   fontSize: 13, fontWeight: 600,
//                 }}
//               >
//                 <div style={{
//                   width: 22, height: 22, borderRadius: '50%',
//                   background: '#7C3AED',
//                   display: 'flex', alignItems: 'center', justifyContent: 'center',
//                   fontSize: 10, fontWeight: 800, color: '#fff',
//                 }}>
//                   {initials}
//                 </div>
//                 {profile?.full_name?.split(' ')[0] || 'Profile'}
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Bottom nav bar */}
//         <div style={{
//           position: 'fixed', bottom: 0, left: 0, right: 0,
//           height: 64, background: '#0A0A0F',
//           borderTop: '1px solid #1A1A2E',
//           display: 'flex', alignItems: 'center',
//           zIndex: 100, paddingBottom: 'env(safe-area-inset-bottom)',
//         }}>
//           {bottomNavItems.map(({ id, icon: Icon, label, badge }) => {
//             const active = page === id
//             return (
//               <button
//                 key={id}
//                 onClick={() => { setPage(id); setMoreOpen(false) }}
//                 style={{
//                   flex: 1, height: '100%', border: 'none',
//                   background: 'transparent',
//                   display: 'flex', flexDirection: 'column',
//                   alignItems: 'center', justifyContent: 'center',
//                   gap: 4, cursor: 'pointer', position: 'relative',
//                   color: active ? '#A78BFA' : '#555',
//                   transition: 'color 0.15s',
//                 }}
//               >
//                 <Icon />
//                 <span style={{
//                   fontSize: 10, fontWeight: 600,
//                   fontFamily: 'Urbanist, sans-serif',
//                 }}>
//                   {label}
//                 </span>
//                 {badge > 0 && (
//                   <span style={{
//                     position: 'absolute', top: 8, right: '50%',
//                     transform: 'translateX(8px)',
//                     width: 16, height: 16,
//                     background: '#EF4444', borderRadius: '50%',
//                     fontSize: 9, fontWeight: 700, color: '#fff',
//                     display: 'flex', alignItems: 'center', justifyContent: 'center',
//                     border: '2px solid #0A0A0F',
//                   }}>
//                     {badge > 9 ? '9+' : badge}
//                   </span>
//                 )}
//                 {active && (
//                   <div style={{
//                     position: 'absolute', bottom: 0,
//                     width: 32, height: 2,
//                     background: '#7C3AED', borderRadius: 2,
//                   }} />
//                 )}
//               </button>
//             )
//           })}

//           {/* More button */}
//           <button
//             onClick={() => setMoreOpen(o => !o)}
//             style={{
//               flex: 1, height: '100%', border: 'none',
//               background: 'transparent',
//               display: 'flex', flexDirection: 'column',
//               alignItems: 'center', justifyContent: 'center',
//               gap: 4, cursor: 'pointer', position: 'relative',
//               color: isMoreActive || moreOpen ? '#A78BFA' : '#555',
//               transition: 'color 0.15s',
//             }}
//           >
//             {/* Show unread dot on More if notifications are in more items — not needed here */}
//             <MoreIcon />
//             <span style={{
//               fontSize: 10, fontWeight: 600,
//               fontFamily: 'Urbanist, sans-serif',
//             }}>
//               More
//             </span>
//             {(isMoreActive || moreOpen) && (
//               <div style={{
//                 position: 'absolute', bottom: 0,
//                 width: 32, height: 2,
//                 background: '#7C3AED', borderRadius: 2,
//               }} />
//             )}
//           </button>
//         </div>

//         {/* Push content up above bottom nav */}
//         <style>{`
//           .main-content {
//             margin-left: 0 !important;
//             padding-bottom: 72px !important;
//           }
//           @keyframes slideUp {
//             from { transform: translateY(20px); opacity: 0; }
//             to { transform: translateY(0); opacity: 1; }
//           }
//         `}</style>
//       </>
//     )
//   }

//   // ── DESKTOP SIDEBAR ───────────────────────────────────────────────────────
//   return (
//     <>
//       {expanded && (
//         <div
//           onClick={() => setExpanded(false)}
//           style={{
//             display: 'none',
//             position: 'fixed', inset: 0, zIndex: 99,
//             background: 'rgba(0,0,0,0.4)',
//           }}
//           className="sidebar-overlay"
//         />
//       )}

//       <div style={{
//         position: 'fixed',
//         left: 0, top: 0, bottom: 0,
//         width: sidebarWidth,
//         background: '#0A0A0F',
//         display: 'flex',
//         flexDirection: 'column',
//         padding: '16px 0',
//         zIndex: 100,
//         borderRight: '1px solid #1A1A2E',
//         transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1)',
//         overflow: 'hidden',
//       }}>

//         {/* Logo + toggle */}
//         <div style={{
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: expanded ? 'space-between' : 'center',
//           padding: expanded ? '0 16px' : '0',
//           marginBottom: 28,
//         }}>
//           <div
//             onClick={() => setPage('home')}
//             style={{
//               width: 36, height: 36,
//               background: '#7C3AED',
//               borderRadius: 10,
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               cursor: 'pointer',
//               fontSize: 16, fontWeight: 800,
//               color: '#fff',
//               fontFamily: 'Urbanist, sans-serif',
//               letterSpacing: '-1px',
//               flexShrink: 0,
//             }}
//           >
//             t
//           </div>

//           {expanded && (
//             <span style={{
//               color: '#fff',
//               fontWeight: 800,
//               fontSize: 15,
//               letterSpacing: '-0.5px',
//               fontFamily: 'Urbanist, sans-serif',
//               flex: 1,
//               marginLeft: 10,
//               whiteSpace: 'nowrap',
//             }}>
//               Dôti
//             </span>
//           )}

//           <button
//             onClick={() => setExpanded(e => !e)}
//             style={{
//               background: 'none', border: 'none',
//               color: '#555', cursor: 'pointer',
//               display: 'flex', alignItems: 'center', justifyContent: 'center',
//               padding: 6, borderRadius: 8,
//               flexShrink: 0,
//             }}
//           >
//             <ChevronIcon flipped={expanded} />
//           </button>
//         </div>

//         {/* Nav */}
//         <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, padding: '0 10px' }}>
//           {navItems.map(({ id, icon: Icon, label, badge }) => {
//             const active = page === id
//             return (
//               <button
//                 key={id}
//                 onClick={() => setPage(id)}
//                 title={!expanded ? label : undefined}
//                 style={{
//                   width: '100%', height: 44,
//                   borderRadius: 10, border: 'none',
//                   cursor: 'pointer',
//                   display: 'flex', alignItems: 'center',
//                   gap: 12,
//                   padding: expanded ? '0 12px' : '0',
//                   justifyContent: expanded ? 'flex-start' : 'center',
//                   background: active ? '#7C3AED' : 'transparent',
//                   color: active ? '#fff' : '#666',
//                   transition: 'all 0.18s',
//                   position: 'relative', flexShrink: 0,
//                 }}
//                 onMouseEnter={e => {
//                   if (!active) { e.currentTarget.style.background = '#1A1A2E'; e.currentTarget.style.color = '#fff' }
//                 }}
//                 onMouseLeave={e => {
//                   if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#666' }
//                 }}
//               >
//                 <span style={{ flexShrink: 0, display: 'flex' }}><Icon /></span>
//                 {expanded && (
//                   <span style={{
//                     fontSize: 14, fontWeight: 600,
//                     fontFamily: 'Urbanist, sans-serif',
//                     whiteSpace: 'nowrap', overflow: 'hidden',
//                   }}>
//                     {label}
//                   </span>
//                 )}
//                 {badge > 0 && (
//                   <span style={{
//                     position: expanded ? 'static' : 'absolute',
//                     top: expanded ? undefined : 6,
//                     right: expanded ? undefined : 6,
//                     marginLeft: expanded ? 'auto' : undefined,
//                     width: 18, height: 18,
//                     background: '#EF4444', borderRadius: '50%',
//                     fontSize: 10, fontWeight: 700, color: '#fff',
//                     display: 'flex', alignItems: 'center', justifyContent: 'center',
//                     border: expanded ? 'none' : '2px solid #0A0A0F',
//                     flexShrink: 0,
//                   }}>
//                     {badge > 9 ? '9+' : badge}
//                   </span>
//                 )}
//               </button>
//             )
//           })}
//         </nav>

//         {/* Bottom */}
//         <div style={{
//           display: 'flex', flexDirection: 'column', gap: 8,
//           padding: '0 10px',
//           alignItems: expanded ? 'stretch' : 'center',
//         }}>
//           <button
//             onClick={() => setPage('settings')}
//             title="Settings"
//             style={{
//               height: 40, borderRadius: 10, border: 'none',
//               background: page === 'settings' ? '#7C3AED22' : 'transparent',
//               color: page === 'settings' ? '#A78BFA' : '#555',
//               cursor: 'pointer',
//               display: 'flex', alignItems: 'center', gap: 10,
//               padding: expanded ? '0 12px' : '0',
//               justifyContent: expanded ? 'flex-start' : 'center',
//               transition: 'all 0.18s', width: '100%',
//             }}
//             onMouseEnter={e => { e.currentTarget.style.color = '#A78BFA' }}
//             onMouseLeave={e => { if (page !== 'settings') e.currentTarget.style.color = '#555' }}
//           >
//             <SettingsIcon />
//             {expanded && (
//               <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'Urbanist, sans-serif', whiteSpace: 'nowrap' }}>
//                 Settings
//               </span>
//             )}
//           </button>

//           <button
//             onClick={toggle}
//             title={isDark ? 'Light mode' : 'Dark mode'}
//             style={{
//               height: 40, borderRadius: 10, border: 'none',
//               background: '#1A1A2E', color: '#666',
//               cursor: 'pointer',
//               display: 'flex', alignItems: 'center', gap: 10,
//               padding: expanded ? '0 12px' : '0',
//               justifyContent: expanded ? 'flex-start' : 'center',
//               transition: 'all 0.18s', width: '100%',
//             }}
//             onMouseEnter={e => { e.currentTarget.style.color = '#A78BFA'; e.currentTarget.style.background = '#222240' }}
//             onMouseLeave={e => { e.currentTarget.style.color = '#666'; e.currentTarget.style.background = '#1A1A2E' }}
//           >
//             {isDark ? <SunIcon /> : <MoonIcon />}
//             {expanded && (
//               <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'Urbanist, sans-serif', whiteSpace: 'nowrap' }}>
//                 {isDark ? 'Light mode' : 'Dark mode'}
//               </span>
//             )}
//           </button>

//           <button
//             onClick={() => setPage('profile')}
//             title="Profile"
//             style={{
//               height: 40, borderRadius: 10,
//               border: page === 'profile' ? '2px solid #7C3AED' : '1px solid #333',
//               background: page === 'profile' ? '#7C3AED22' : '#1A1A2E',
//               color: '#fff', cursor: 'pointer',
//               display: 'flex', alignItems: 'center', gap: 10,
//               padding: expanded ? '0 10px' : '0',
//               justifyContent: expanded ? 'flex-start' : 'center',
//               transition: 'all 0.18s', width: '100%',
//             }}
//           >
//             <div style={{
//               width: 26, height: 26, borderRadius: '50%',
//               background: '#7C3AED',
//               display: 'flex', alignItems: 'center', justifyContent: 'center',
//               fontSize: 11, fontWeight: 800, flexShrink: 0,
//             }}>
//               {initials}
//             </div>
//             {expanded && (
//               <div style={{ textAlign: 'left', overflow: 'hidden' }}>
//                 <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'Urbanist, sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
//                   {profile?.full_name || user?.email?.split('@')[0]}
//                 </div>
//                 <div style={{ fontSize: 10, color: '#888', fontFamily: 'Urbanist, sans-serif' }}>
//                   {profile?.role || 'mentee'}
//                 </div>
//               </div>
//             )}
//           </button>
//         </div>
//       </div>

//       <style>{`
//         .main-content {
//           margin-left: ${sidebarWidth}px !important;
//           transition: margin-left 0.22s cubic-bezier(0.4,0,0.2,1);
//         }
//         @media (max-width: 640px) {
//           .sidebar-overlay { display: block !important; }
//         }
//       `}</style>
//     </>
//   )
// }

import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)
const ChatIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)
const HistoryIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l4 2"/>
  </svg>
)
const ProjectsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
)
const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
  </svg>
)
const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
  </svg>
)
const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
  </svg>
)
const ChevronIcon = ({ flipped }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: flipped ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)
const FlowIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
)
const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
)
const MoreIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
  </svg>
)
const ProfileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)

export default function Sidebar({ page, setPage, unreadCount = 0 }) {
  const { user, profile } = useAuth()
  const { isDark, toggle } = useTheme()
  const [expanded, setExpanded] = useState(() => {
    return localStorage.getItem('sidebar-expanded') === 'true'
  })
  const [moreOpen, setMoreOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640)

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', expanded)
  }, [expanded])

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 640)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || '?'

  const navItems = [
    { id: 'home',          icon: HomeIcon,     label: 'Home' },
    { id: 'chat',          icon: ChatIcon,     label: 'Log Today' },
    { id: 'history',       icon: HistoryIcon,  label: 'History' },
    { id: 'projects',      icon: ProjectsIcon, label: 'Projects' },
    { id: 'myflow',        icon: FlowIcon,     label: 'MyFlow' },
    { id: 'notifications', icon: BellIcon,     label: 'Notifications', badge: unreadCount },
  ]

  const bottomNavItems = [
    { id: 'home',          icon: HomeIcon,  label: 'Home' },
    { id: 'chat',          icon: ChatIcon,  label: 'Log' },
    { id: 'myflow',        icon: FlowIcon,  label: 'MyFlow' },
    { id: 'notifications', icon: BellIcon,  label: 'Alerts', badge: unreadCount },
  ]

  const moreItems = [
    { id: 'history',  icon: HistoryIcon,  label: 'History' },
    { id: 'projects', icon: ProjectsIcon, label: 'Projects' },
    { id: 'settings', icon: SettingsIcon, label: 'Settings' },
    { id: 'profile',  icon: ProfileIcon,  label: 'Profile' },
  ]

  const sidebarWidth = expanded ? 220 : 64

  // ── MOBILE BOTTOM NAV ─────────────────────────────────────────────────────
  if (isMobile) {
    const isMoreActive = moreItems.some(i => i.id === page)

    return (
      <>
        {moreOpen && (
          <div
            onClick={() => setMoreOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 149,
              background: 'rgba(0,0,0,0.5)',
            }}
          />
        )}

        {moreOpen && (
          <div style={{
            position: 'fixed', bottom: 70, left: 0, right: 0,
            zIndex: 150,
            background: '#0A0A0F',
            borderTop: '1px solid #1A1A2E',
            borderRadius: '20px 20px 0 0',
            padding: '20px 16px 8px',
            animation: 'slideUp 0.2s ease',
          }}>
            <div style={{
              width: 36, height: 4, background: '#333',
              borderRadius: 2, margin: '0 auto 20px',
            }} />

            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: 10, marginBottom: 16,
            }}>
              {moreItems.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => { setPage(id); setMoreOpen(false) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 16px', borderRadius: 12,
                    background: page === id ? '#7C3AED22' : '#1A1A2E',
                    color: page === id ? '#A78BFA' : '#888',
                    cursor: 'pointer', fontFamily: 'Urbanist, sans-serif',
                    fontSize: 14, fontWeight: 600,
                    border: page === id ? '1px solid #7C3AED44' : '1px solid transparent',
                  }}
                >
                  <Icon />
                  {label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, paddingBottom: 8 }}>
              <button
                onClick={toggle}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 8,
                  padding: '12px', borderRadius: 12,
                  background: '#1A1A2E', color: '#888',
                  cursor: 'pointer', fontFamily: 'Urbanist, sans-serif',
                  fontSize: 13, fontWeight: 600, border: 'none',
                }}
              >
                {isDark ? <SunIcon /> : <MoonIcon />}
                {isDark ? 'Light' : 'Dark'}
              </button>

              <button
                onClick={() => { setPage('profile'); setMoreOpen(false) }}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 8,
                  padding: '12px', borderRadius: 12,
                  background: page === 'profile' ? '#7C3AED22' : '#1A1A2E',
                  color: page === 'profile' ? '#A78BFA' : '#888',
                  cursor: 'pointer', fontFamily: 'Urbanist, sans-serif',
                  fontSize: 13, fontWeight: 600, border: 'none',
                }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: '#7C3AED',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 800, color: '#fff',
                }}>
                  {initials}
                </div>
                {profile?.full_name?.split(' ')[0] || 'Profile'}
              </button>
            </div>
          </div>
        )}

        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          height: 64, background: '#0A0A0F',
          borderTop: '1px solid #1A1A2E',
          display: 'flex', alignItems: 'center',
          zIndex: 100, paddingBottom: 'env(safe-area-inset-bottom)',
        }}>
          {bottomNavItems.map(({ id, icon: Icon, label, badge }) => {
            const active = page === id
            return (
              <button
                key={id}
                onClick={() => { setPage(id); setMoreOpen(false) }}
                style={{
                  flex: 1, height: '100%', border: 'none',
                  background: 'transparent',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: 4, cursor: 'pointer', position: 'relative',
                  color: active ? '#A78BFA' : '#555',
                  transition: 'color 0.15s',
                }}
              >
                <Icon />
                <span style={{
                  fontSize: 10, fontWeight: 600,
                  fontFamily: 'Urbanist, sans-serif',
                }}>
                  {label}
                </span>
                {badge > 0 && (
                  <span style={{
                    position: 'absolute', top: 8, right: '50%',
                    transform: 'translateX(8px)',
                    width: 16, height: 16,
                    background: '#EF4444', borderRadius: '50%',
                    fontSize: 9, fontWeight: 700, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid #0A0A0F',
                  }}>
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
                {active && (
                  <div style={{
                    position: 'absolute', bottom: 0,
                    width: 32, height: 2,
                    background: '#7C3AED', borderRadius: 2,
                  }} />
                )}
              </button>
            )
          })}

          <button
            onClick={() => setMoreOpen(o => !o)}
            style={{
              flex: 1, height: '100%', border: 'none',
              background: 'transparent',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 4, cursor: 'pointer', position: 'relative',
              color: isMoreActive || moreOpen ? '#A78BFA' : '#555',
              transition: 'color 0.15s',
            }}
          >
            <MoreIcon />
            <span style={{
              fontSize: 10, fontWeight: 600,
              fontFamily: 'Urbanist, sans-serif',
            }}>
              More
            </span>
            {(isMoreActive || moreOpen) && (
              <div style={{
                position: 'absolute', bottom: 0,
                width: 32, height: 2,
                background: '#7C3AED', borderRadius: 2,
              }} />
            )}
          </button>
        </div>

        <style>{`
          .main-content {
            margin-left: 0 !important;
            padding-bottom: 72px !important;
          }
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>
      </>
    )
  }

  // ── DESKTOP SIDEBAR ───────────────────────────────────────────────────────
  return (
    <>
      {expanded && (
        <div
          onClick={() => setExpanded(false)}
          style={{
            display: 'none',
            position: 'fixed', inset: 0, zIndex: 99,
            background: 'rgba(0,0,0,0.4)',
          }}
          className="sidebar-overlay"
        />
      )}

      <div style={{
        position: 'fixed',
        left: 0, top: 0, bottom: 0,
        width: sidebarWidth,
        background: '#0A0A0F',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 0',
        zIndex: 100,
        borderRight: '1px solid #1A1A2E',
        transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
      }}>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: expanded ? 'space-between' : 'center',
          padding: expanded ? '0 16px' : '0',
          marginBottom: 28,
        }}>
          <div
            onClick={() => setPage('home')}
            style={{
              width: 36, height: 36,
              background: '#7C3AED',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: 16, fontWeight: 800,
              color: '#fff',
              fontFamily: 'Urbanist, sans-serif',
              letterSpacing: '-1px',
              flexShrink: 0,
            }}
          >
            t
          </div>

          {expanded && (
            <span style={{
              color: '#fff',
              fontWeight: 800,
              fontSize: 15,
              letterSpacing: '-0.5px',
              fontFamily: 'Urbanist, sans-serif',
              flex: 1,
              marginLeft: 10,
              whiteSpace: 'nowrap',
            }}>
              Dôti
            </span>
          )}

          <button
            onClick={() => setExpanded(e => !e)}
            style={{
              background: 'none', border: 'none',
              color: '#555', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 6, borderRadius: 8,
              flexShrink: 0,
            }}
          >
            <ChevronIcon flipped={expanded} />
          </button>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, padding: '0 10px' }}>
          {navItems.map(({ id, icon: Icon, label, badge }) => {
            const active = page === id
            return (
              <button
                key={id}
                onClick={() => setPage(id)}
                title={!expanded ? label : undefined}
                style={{
                  width: '100%', height: 44,
                  borderRadius: 10, border: 'none',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center',
                  gap: 12,
                  padding: expanded ? '0 12px' : '0',
                  justifyContent: expanded ? 'flex-start' : 'center',
                  background: active ? '#7C3AED' : 'transparent',
                  color: active ? '#fff' : '#666',
                  transition: 'all 0.18s',
                  position: 'relative', flexShrink: 0,
                }}
                onMouseEnter={e => {
                  if (!active) { e.currentTarget.style.background = '#1A1A2E'; e.currentTarget.style.color = '#fff' }
                }}
                onMouseLeave={e => {
                  if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#666' }
                }}
              >
                <span style={{ flexShrink: 0, display: 'flex' }}><Icon /></span>
                {expanded && (
                  <span style={{
                    fontSize: 14, fontWeight: 600,
                    fontFamily: 'Urbanist, sans-serif',
                    whiteSpace: 'nowrap', overflow: 'hidden',
                  }}>
                    {label}
                  </span>
                )}
                {badge > 0 && (
                  <span style={{
                    position: expanded ? 'static' : 'absolute',
                    top: expanded ? undefined : 6,
                    right: expanded ? undefined : 6,
                    marginLeft: expanded ? 'auto' : undefined,
                    width: 18, height: 18,
                    background: '#EF4444', borderRadius: '50%',
                    fontSize: 10, fontWeight: 700, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: expanded ? 'none' : '2px solid #0A0A0F',
                    flexShrink: 0,
                  }}>
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        <div style={{
          display: 'flex', flexDirection: 'column', gap: 8,
          padding: '0 10px',
          alignItems: expanded ? 'stretch' : 'center',
        }}>
          <button
            onClick={() => setPage('settings')}
            title="Settings"
            style={{
              height: 40, borderRadius: 10, border: 'none',
              background: page === 'settings' ? '#7C3AED22' : 'transparent',
              color: page === 'settings' ? '#A78BFA' : '#555',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 10,
              padding: expanded ? '0 12px' : '0',
              justifyContent: expanded ? 'flex-start' : 'center',
              transition: 'all 0.18s', width: '100%',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#A78BFA' }}
            onMouseLeave={e => { if (page !== 'settings') e.currentTarget.style.color = '#555' }}
          >
            <SettingsIcon />
            {expanded && (
              <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'Urbanist, sans-serif', whiteSpace: 'nowrap' }}>
                Settings
              </span>
            )}
          </button>

          <button
            onClick={toggle}
            title={isDark ? 'Light mode' : 'Dark mode'}
            style={{
              height: 40, borderRadius: 10, border: 'none',
              background: '#1A1A2E', color: '#666',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 10,
              padding: expanded ? '0 12px' : '0',
              justifyContent: expanded ? 'flex-start' : 'center',
              transition: 'all 0.18s', width: '100%',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#A78BFA'; e.currentTarget.style.background = '#222240' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#666'; e.currentTarget.style.background = '#1A1A2E' }}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
            {expanded && (
              <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'Urbanist, sans-serif', whiteSpace: 'nowrap' }}>
                {isDark ? 'Light mode' : 'Dark mode'}
              </span>
            )}
          </button>

          <button
            onClick={() => setPage('profile')}
            title="Profile"
            style={{
              height: 40, borderRadius: 10,
              border: page === 'profile' ? '2px solid #7C3AED' : '1px solid #333',
              background: page === 'profile' ? '#7C3AED22' : '#1A1A2E',
              color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 10,
              padding: expanded ? '0 10px' : '0',
              justifyContent: expanded ? 'flex-start' : 'center',
              transition: 'all 0.18s', width: '100%',
            }}
          >
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: '#7C3AED',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 800, flexShrink: 0,
            }}>
              {initials}
            </div>
            {expanded && (
              <div style={{ textAlign: 'left', overflow: 'hidden' }}>
                <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'Urbanist, sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {profile?.full_name || user?.email?.split('@')[0]}
                </div>
                <div style={{ fontSize: 10, color: '#888', fontFamily: 'Urbanist, sans-serif' }}>
                  {profile?.role || 'mentee'}
                </div>
              </div>
            )}
          </button>
        </div>
      </div>

      <style>{`
        .main-content {
          margin-left: ${sidebarWidth}px !important;
          transition: margin-left 0.22s cubic-bezier(0.4,0,0.2,1);
        }
        @media (max-width: 640px) {
          .sidebar-overlay { display: block !important; }
        }
      `}</style>
    </>
  )
}