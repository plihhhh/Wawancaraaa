const kategoriBadge = {
  'Bagus': 'badge-success',
  'Lumayan': 'badge-warning',
  'Cadangan': 'badge-danger',
  'Belum dinilai': 'badge-neutral',
}

const statusBadge = {
  'Belum Wawancara': 'badge-neutral',
  'Sedang Diproses': 'badge-warning',
  'Selesai': 'badge-success',
}

export default function HasilTable({ hasilList }) {
  if (hasilList.length === 0) {
    return <div className="empty-state"><div className="empty-state-icon">📊</div><p>Belum ada hasil wawancara.</p></div>
  }

  return (
    <div className="table-container">
      <table>
        <thead><tr><th>No</th><th>Nama</th><th>NIM</th><th>Pilihan</th><th>Rata-rata</th><th>Kategori</th><th>Status</th></tr></thead>
        <tbody>
          {hasilList.map((h, i) => (
            <tr key={h.id}>
              <td>{i + 1}</td>
              <td style={{ fontWeight: 600 }}>{h.nama}</td>
              <td>{h.nim}</td>
              <td>{h.pilihan}</td>
              <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{h.rataRata ?? '-'}</td>
              <td><span className={`badge ${kategoriBadge[h.kategori] || 'badge-neutral'}`}>{h.kategori}</span></td>
              <td><span className={`badge ${statusBadge[h.status] || 'badge-neutral'}`}>{h.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
