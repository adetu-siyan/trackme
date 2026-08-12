


import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './context/AuthContext'
import { useTheme } from './context/ThemeContext'
import LoadingScreen from './components/LoadingScreen'
import AuthPage from './components/AuthPage'
import Sidebar from './components/Sidebar'
import Home from './components/Home'
import Chat from './components/Chat'
import Notifications from './components/Notifications'
import Profile from './components/Profile'
import History from './components/history'
import Projects from './components/projects'
import { notificationsApi } from './lib/api'
import Guide from './components/Guide'
import MyFlow from './components/MyFlow'
import Settings from './components/Settings'
import MenteeDashboard from './components/MenteeDashboard'
import MenteeDetail from './components/MenteeDetail'

export default function App() {
  const { user, loading: authLoading } = useAuth()
  const { theme } = useTheme()
  const [appLoading, setAppLoading] = useState(true)
  const [page, setPage] = useState('home')
  const [unreadCount, setUnreadCount] = useState(0)
  const [inAppAlert, setInAppAlert] = useState(null)
  const [prevCount, setPrevCount] = useState(0)
  const [selectedMentee, setSelectedMentee] = useState(null)

  const checkNotifications = useCallback(async () => {
    if (!user) return
    try {
      const res = await notificationsApi.list()
      const notifs = res.notifications || []
      const count = notifs.filter(n => !n.read).length
      setUnreadCount(count)

      if (count > prevCount && prevCount !== 0) {
        const newest = notifs.find(n => !n.read)
        if (newest) {
          setInAppAlert(newest)
          setTimeout(() => setInAppAlert(null), 5000)
        }
      }
      setPrevCount(count)
    } catch {}
  }, [user, prevCount])

  useEffect(() => {
    if (!user) return
    checkNotifications()
    const interval = setInterval(checkNotifications, 30000)
    return () => clearInterval(interval)
  }, [user, checkNotifications])

  if (appLoading) return <LoadingScreen onComplete={() => setAppLoading(false)} />

  if (authLoading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div className="spinner" />
    </div>
  )

  if (!user) return <AuthPage />

  function handleSelectMentee(mentee) {
    setSelectedMentee(mentee)
    setPage('mentee-detail')
  }

  return (
    <div className="app-shell">
      <Sidebar page={page} setPage={setPage} unreadCount={unreadCount} />

      <main className="main-content">
        {page === 'home'          && <Home setPage={setPage} />}
        {page === 'chat'          && <Chat />}
        {page === 'history'       && <History />}
        {page === 'projects'      && <Projects />}
        {page === 'notifications' && <Notifications onCountChange={setUnreadCount} />}
        {page === 'profile'       && <Profile />}
        {page === 'myflow'        && <MyFlow />}
        {page === 'guide' && <Guide />}
        {page === 'settings'      && <Settings />}
        {page === 'mentees'       && (
          <MenteeDashboard onSelectMentee={handleSelectMentee} />
        )}
        {page === 'mentee-detail' && selectedMentee && (
          <MenteeDetail
            mentee={selectedMentee}
            onBack={() => setPage('mentees')}
          />
        )}
      </main>

      {inAppAlert && (
        <div
          onClick={() => { setPage('notifications'); setInAppAlert(null) }}
          style={{
            position: 'fixed', top: 20, right: 24, zIndex: 9999,
            background: 'var(--surface)', border: '1px solid var(--accent)',
            borderRadius: 14, padding: '14px 18px',
            boxShadow: '0 8px 32px rgba(124,58,237,0.2)',
            cursor: 'pointer', maxWidth: 320,
            animation: 'fadeIn 0.3s ease',
            display: 'flex', gap: 12, alignItems: 'flex-start',
          }}
        >
          <div style={{ fontSize: 22, flexShrink: 0 }}>🔔</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3, color: 'var(--text-primary)' }}>
              {inAppAlert.title}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {inAppAlert.message}
            </div>
          </div>
          <button
            onClick={e => { e.stopPropagation(); setInAppAlert(null) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16, flexShrink: 0, padding: 0 }}
          >×</button>
        </div>
      )}
    </div>
  )
}