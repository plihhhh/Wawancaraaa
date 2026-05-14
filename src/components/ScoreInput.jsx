const labels = ['', 'Sangat Kurang', 'Kurang', 'Cukup', 'Baik', 'Sangat Baik']

export default function ScoreInput({ value, onChange }) {
  return (
    <div>
      <div className="score-group">
        {[1, 2, 3, 4, 5].map(s => (
          <button key={s} type="button" className={`score-btn ${value === s ? `active-${s}` : ''}`} onClick={() => onChange(s)}>
            {s}
          </button>
        ))}
      </div>
      <div className="score-label">{value > 0 ? labels[value] : 'Pilih skor'}</div>
    </div>
  )
}
