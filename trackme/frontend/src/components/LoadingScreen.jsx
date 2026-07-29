import { useEffect, useState } from 'react'

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // Progress over 3 seconds (not 30 — 30s would be painful UX)
    // If you want 30s, change DURATION to 30000
    const DURATION = 3000
    const INTERVAL = 50
    const steps = DURATION / INTERVAL
    let current = 0

    const timer = setInterval(() => {
      current++
      setProgress(Math.min((current / steps) * 100, 100))

      if (current >= steps) {
        clearInterval(timer)
        setFadeOut(true)
        setTimeout(onComplete, 600)
      }
    }, INTERVAL)

    return () => clearInterval(timer)
  }, [onComplete])

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#0A0A0F',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      opacity: fadeOut ? 0 : 1,
      transition: 'opacity 0.6s ease',
    }}>
      {/* Logo */}
<div style={{
  marginBottom: 48,
  animation: 'fadeIn 0.8s ease 0.3s both',
}}>
  <img
    src="/Doti-dark.png"
    alt="Dôti"
    style={{ width: 220, objectFit: 'contain' }}
  />
</div>

      {/* Spinning ring */}
      <div style={{
        position: 'relative',
        width: 56,
        height: 56,
        marginBottom: 48,
        animation: 'fadeIn 0.5s ease 0.5s both',
      }}>
        {/* Track */}
        <svg width="56" height="56" style={{ position: 'absolute', inset: 0 }}>
          <circle cx="28" cy="28" r="24" fill="none" stroke="#222" strokeWidth="3"/>
        </svg>
        {/* Spinning arc */}
        <svg
          width="56"
          height="56"
          style={{
            position: 'absolute',
            inset: 0,
            animation: 'spin 0.9s linear infinite',
          }}
        >
          <circle
            cx="28" cy="28" r="24"
            fill="none"
            stroke="#7C3AED"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="30 120"
          />
        </svg>
      </div>

      {/* Progress bar */}
      <div style={{
        width: 200,
        height: 2,
        background: '#222',
        borderRadius: 1,
        overflow: 'hidden',
        marginBottom: 40,
        animation: 'fadeIn 0.5s ease 0.6s both',
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #7C3AED, #A78BFA)',
          transition: 'width 0.05s linear',
          borderRadius: 1,
        }}/>
      </div>

      {/* Brand name at bottom */}
      <div style={{
        position: 'absolute',
        bottom: 40,
        fontFamily: 'Urbanist, sans-serif',
        fontSize: 13,
        fontWeight: 700,
        color: '#444',
        letterSpacing: '6px',
        animation: 'fadeIn 0.5s ease 0.8s both',
      }}>
        S &nbsp;/&nbsp; Y &nbsp;A &nbsp;N
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
