export default function BecomeMentorModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2>Become a Mentor</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text-muted)' }}>×</button>
        </div>
        <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
          <h3 style={{ marginBottom: 12 }}>Ready to guide someone?</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
            As a mentor, mentees connect with you using your email. When they send their daily log,
            you'll get an email with a signing link — one click and they're notified instantly.
          </p>
          <div style={{
            background: 'var(--accent-soft)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '16px 20px', marginBottom: 24, textAlign: 'left',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10, letterSpacing: '1px', textTransform: 'uppercase' }}>How it works</div>
            {[
              'Share your Trackme account email with your mentee',
              'They add you as mentor using that email',
              'Their daily AI-structured logs land in your inbox',
              'One click to review and sign',
              'They get notified the moment you sign',
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 0', fontSize: 13 }}>
                <span style={{
                  width: 22, height: 22, borderRadius: '50%', background: 'var(--accent)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0,
                }}>{i + 1}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{step}</span>
              </div>
            ))}
          </div>
          <button className="btn btn-primary btn-lg" onClick={onClose} style={{ width: '100%', justifyContent: 'center' }}>
            Got It — I'm Ready!
          </button>
        </div>
      </div>
    </div>
  )
}
