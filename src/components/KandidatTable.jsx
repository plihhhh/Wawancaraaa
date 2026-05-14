import { useNavigate } from 'react-router-dom'

const statusBadge = {
  'Belum Wawancara': 'badge-neutral',
  'Sedang Diproses': 'badge-warning',
  'Selesai': 'badge-success',
}

export default function KandidatTable({ kandidatList, bidangId, onDelete }) {
  const navigate = useNavigate()

  if (kandidatList.length === 0) {
    return <div className="empty-state"><div className="empty-state-icon">📋</div><p>Belum ada kandidat. Tambahkan kandidat baru.</p></div>
  }

  return (
    <div className="table-container">
      <table>
        <thead><tr><th>No</th><th>Nama</th><th>NIM</th><th>Pilihan</th><th>Status</th><th>Aksi</th></tr></thead>
        <tbody>
          {kandidatList.map((k, i) => (
            <tr key={k.id}>
              <td>{i + 1}</td>
              <td style={{ fontWeight: 600 }}>{k.nama}</td>
              <td>{k.nim}</td>
              <td><span className="badge badge-info">Pilihan {k.pilihan}</span></td>
              <td><span className={`badge ${statusBadge[k.status] || 'badge-neutral'}`}>{k.status}</span></td>
              <td>
                <div className="td-actions">
                  <button className="btn btn-sm btn-primary" onClick={() => navigate(`/bidang/${bidangId}/wawancara/${k.id}`)}>
                    {k.status === 'Selesai' ? '✏️ Edit' : '🎤 Wawancara'}
                  </button>
                  {onDelete && <button className="btn btn-sm btn-danger" onClick={() => onDelete(k)}>🗑️</button>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
