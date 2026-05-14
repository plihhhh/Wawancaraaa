export default function LoadingSpinner({ text = 'Memuat...' }) {
  return (
    <div className="spinner-container">
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" />
        <p style={{ marginTop: '1rem', fontSize: '.85rem', color: 'var(--neutral-400)' }}>{text}</p>
      </div>
    </div>
  )
}
