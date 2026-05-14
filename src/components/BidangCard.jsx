import { useAdmin } from '../contexts/AdminContext'

export default function BidangCard({ bidang, kandidatCount, onClick, onEdit, onDelete }) {
  const { isAdmin } = useAdmin()

  return (
    <div className="bidang-card slide-up" onClick={onClick} id={`bidang-card-${bidang.id}`}>
      <div className="bidang-card-title">{bidang.nama}</div>
      <div className="bidang-card-meta">
        <span>👥</span> {kandidatCount} kandidat
      </div>
      {isAdmin && (
        <div className="bidang-card-actions" onClick={e => e.stopPropagation()}>
          <button className="btn btn-sm btn-outline" onClick={() => onEdit(bidang)}>✏️ Edit</button>
          <button className="btn btn-sm btn-danger" onClick={() => onDelete(bidang)}>🗑️ Hapus</button>
        </div>
      )}
    </div>
  )
}
