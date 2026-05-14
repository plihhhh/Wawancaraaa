const filters = [
  { key: 'semua', label: 'Semua' },
  { key: 'Belum Wawancara', label: 'Belum Wawancara' },
  { key: 'Sedang Diproses', label: 'Sedang Diproses' },
  { key: 'Selesai', label: 'Selesai' },
  { key: 'Bagus', label: '🟢 Bagus' },
  { key: 'Lumayan', label: '🟡 Lumayan' },
  { key: 'Cadangan', label: '🔴 Cadangan' },
]

export default function FilterBar({ active, onChange }) {
  return (
    <div className="filter-bar">
      {filters.map(f => (
        <button key={f.key} className={`filter-btn ${active === f.key ? 'active' : ''}`} onClick={() => onChange(f.key)}>
          {f.label}
        </button>
      ))}
    </div>
  )
}
