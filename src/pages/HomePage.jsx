import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../contexts/AdminContext'
import { getAllBidang, createBidang, updateBidang, deleteBidang, getKandidatCount } from '../services/database'
import BidangCard from '../components/BidangCard'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import LoadingSpinner from '../components/LoadingSpinner'

export default function HomePage() {
  const { isAdmin } = useAdmin()
  const navigate = useNavigate()
  const [bidangList, setBidangList] = useState([])
  const [counts, setCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState(null)
  const [showDelete, setShowDelete] = useState(null)
  const [nama, setNama] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getAllBidang()
      setBidangList(data)
      const c = {}
      for (const b of data) { c[b.id] = await getKandidatCount(b.id) }
      setCounts(c)
    } catch (err) {
      console.error('Failed to fetch bidang:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!nama.trim()) { setError('Nama bidang wajib diisi'); return }
    setSaving(true)
    try {
      await createBidang(nama.trim())
      setNama(''); setShowAdd(false); setError('')
      fetchData()
    } catch { setError('Gagal menambahkan bidang') }
    finally { setSaving(false) }
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    if (!nama.trim()) { setError('Nama bidang wajib diisi'); return }
    setSaving(true)
    try {
      await updateBidang(showEdit.id, nama.trim())
      setNama(''); setShowEdit(null); setError('')
      fetchData()
    } catch { setError('Gagal mengubah bidang') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await deleteBidang(showDelete.id)
      setShowDelete(null)
      fetchData()
    } catch { console.error('Gagal menghapus bidang') }
    finally { setSaving(false) }
  }

  const openEdit = (b) => { setNama(b.nama); setShowEdit(b); setError('') }

  if (loading) return <LoadingSpinner text="Memuat daftar bidang..." />

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Daftar Bidang</h1>
        <p>Pilih bidang untuk melihat kandidat dan memulai wawancara.</p>
      </div>

      {isAdmin && (
        <div style={{ marginBottom: '1.25rem' }}>
          <button className="btn btn-primary" onClick={() => { setNama(''); setShowAdd(true); setError('') }}>+ Tambah Bidang</button>
        </div>
      )}

      {bidangList.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📁</div>
          <p>Belum ada bidang.{isAdmin ? ' Klik tombol di atas untuk menambah.' : ' Minta admin untuk menambah bidang.'}</p>
        </div>
      ) : (
        <div className="bidang-grid">
          {bidangList.map(b => (
            <BidangCard key={b.id} bidang={b} kandidatCount={counts[b.id] || 0}
              onClick={() => navigate(`/bidang/${b.id}`)}
              onEdit={openEdit} onDelete={setShowDelete} />
          ))}
        </div>
      )}

      {/* Modal Tambah */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Tambah Bidang Baru">
        <form onSubmit={handleAdd}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Nama Bidang</label>
              <input className="form-input" placeholder="Contoh: Bidang Acara" value={nama} onChange={e => setNama(e.target.value)} autoFocus />
              {error && <p className="form-error">{error}</p>}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={() => setShowAdd(false)}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </Modal>

      {/* Modal Edit */}
      <Modal isOpen={!!showEdit} onClose={() => setShowEdit(null)} title="Edit Bidang">
        <form onSubmit={handleEdit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Nama Bidang</label>
              <input className="form-input" value={nama} onChange={e => setNama(e.target.value)} autoFocus />
              {error && <p className="form-error">{error}</p>}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={() => setShowEdit(null)}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog isOpen={!!showDelete} onClose={() => setShowDelete(null)} onConfirm={handleDelete}
        title={`Hapus "${showDelete?.nama}"?`}
        message="Semua kandidat, pertanyaan khusus bidang, dan penilaian di bidang ini akan ikut terhapus. Pertanyaan global tidak terpengaruh."
        loading={saving} />
    </div>
  )
}
