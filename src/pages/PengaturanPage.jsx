import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAdmin } from '../contexts/AdminContext'
import { getSetting, updateSetting, getPertanyaanGlobal, createPertanyaanGlobal, updatePertanyaanGlobal, deletePertanyaanGlobal } from '../services/database'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import LoadingSpinner from '../components/LoadingSpinner'

export default function PengaturanPage() {
  const { isAdmin } = useAdmin()
  const navigate = useNavigate()
  const [sheetsUrl, setSheetsUrl] = useState('')
  const [pin, setPin] = useState('')
  const [globalQ, setGlobalQ] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [showAddQ, setShowAddQ] = useState(false)
  const [showEditQ, setShowEditQ] = useState(null)
  const [showDeleteQ, setShowDeleteQ] = useState(null)
  const [qTeks, setQTeks] = useState('')
  const [error, setError] = useState('')

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }

  useEffect(() => { if (!isAdmin) navigate('/') }, [isAdmin, navigate])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [url, pinVal, questions] = await Promise.all([
        getSetting('google_sheets_url'), getSetting('admin_pin'), getPertanyaanGlobal()
      ])
      setSheetsUrl(url || ''); setPin(pinVal || ''); setGlobalQ(questions)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSaveUrl = async () => {
    setSaving(true)
    try { await updateSetting('google_sheets_url', sheetsUrl); showToast('URL Google Sheets berhasil disimpan') }
    catch { showToast('Gagal menyimpan URL', 'error') }
    finally { setSaving(false) }
  }

  const handleSavePin = async () => {
    if (!pin.trim()) { showToast('PIN tidak boleh kosong', 'error'); return }
    setSaving(true)
    try { await updateSetting('admin_pin', pin); showToast('PIN admin berhasil diubah') }
    catch { showToast('Gagal mengubah PIN', 'error') }
    finally { setSaving(false) }
  }

  const handleAddQ = async (e) => {
    e.preventDefault()
    if (!qTeks.trim()) { setError('Pertanyaan wajib diisi'); return }
    setSaving(true)
    try {
      await createPertanyaanGlobal(qTeks.trim())
      setQTeks(''); setShowAddQ(false); setError(''); fetchData()
      showToast('Pertanyaan global berhasil ditambahkan')
    } catch { setError('Gagal menambahkan pertanyaan') }
    finally { setSaving(false) }
  }

  const handleEditQ = async (e) => {
    e.preventDefault()
    if (!qTeks.trim()) { setError('Pertanyaan wajib diisi'); return }
    setSaving(true)
    try {
      await updatePertanyaanGlobal(showEditQ.id, qTeks.trim())
      setQTeks(''); setShowEditQ(null); setError(''); fetchData()
      showToast('Pertanyaan global berhasil diperbarui')
    } catch { setError('Gagal mengubah pertanyaan') }
    finally { setSaving(false) }
  }

  const handleDeleteQ = async () => {
    setSaving(true)
    try {
      await deletePertanyaanGlobal(showDeleteQ.id)
      setShowDeleteQ(null); fetchData()
      showToast('Pertanyaan global berhasil dihapus')
    } catch { showToast('Gagal menghapus pertanyaan', 'error') }
    finally { setSaving(false) }
  }

  if (!isAdmin) return null
  if (loading) return <LoadingSpinner text="Memuat pengaturan..." />

  return (
    <div className="fade-in">
      <div className="breadcrumb"><Link to="/">Beranda</Link><span>/</span><span>Pengaturan</span></div>
      <div className="page-header"><h1>⚙️ Pengaturan</h1><p>Kelola konfigurasi sistem wawancara</p></div>

      {/* Google Sheets */}
      <div className="settings-card">
        <h3>📋 Integrasi Google Sheets</h3>
        <div className="form-group">
          <label className="form-label">URL Google Apps Script</label>
          <input className="form-input" placeholder="https://script.google.com/macros/s/..." value={sheetsUrl} onChange={e => setSheetsUrl(e.target.value)} />
          <p className="form-hint">Kosongkan jika belum memiliki URL. Fitur export CSV dan Excel tetap bisa digunakan.</p>
        </div>
        <button className="btn btn-primary" onClick={handleSaveUrl} disabled={saving}>💾 Simpan URL</button>
      </div>

      {/* PIN Admin */}
      <div className="settings-card">
        <h3>🔒 Ubah PIN Admin</h3>
        <div className="form-group">
          <label className="form-label">PIN Baru</label>
          <input className="form-input" type="password" value={pin} onChange={e => setPin(e.target.value)} maxLength={20} />
        </div>
        <button className="btn btn-primary" onClick={handleSavePin} disabled={saving}>💾 Simpan PIN</button>
      </div>

      {/* Pertanyaan Global */}
      <div className="settings-card">
        <div className="section-header">
          <div><h3>📌 Kelola Pertanyaan Global</h3><p className="section-subtitle">Pertanyaan ini muncul di semua bidang secara otomatis</p></div>
          <button className="btn btn-primary" onClick={() => { setQTeks(''); setShowAddQ(true); setError('') }}>+ Tambah Pertanyaan Global</button>
        </div>

        {globalQ.length === 0 ? (
          <div className="empty-state" style={{ padding: '1.5rem' }}><p>Belum ada pertanyaan global.</p></div>
        ) : (
          <div className="pertanyaan-list" style={{ marginTop: '1rem' }}>
            {globalQ.map((p, i) => (
              <div key={p.id} className="pertanyaan-item">
                <span style={{ fontWeight: 700, color: 'var(--neutral-400)', marginRight: '.5rem', fontSize: '.8rem' }}>{i + 1}.</span>
                <span className="pertanyaan-item-text">{p.teks}</span>
                <span className="badge badge-global">Global</span>
                <div className="pertanyaan-item-actions">
                  <button className="btn btn-sm btn-outline" onClick={() => { setQTeks(p.teks); setShowEditQ(p); setError('') }}>✏️</button>
                  <button className="btn btn-sm btn-danger" onClick={() => setShowDeleteQ(p)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Tambah */}
      <Modal isOpen={showAddQ} onClose={() => setShowAddQ(false)} title="Tambah Pertanyaan Global">
        <form onSubmit={handleAddQ}>
          <div className="modal-body">
            <div className="form-group"><label className="form-label">Pertanyaan</label><textarea className="form-textarea" value={qTeks} onChange={e => setQTeks(e.target.value)} placeholder="Tulis pertanyaan global..." autoFocus /></div>
            <p className="form-hint">Pertanyaan ini akan otomatis muncul di semua bidang.</p>
            {error && <p className="form-error">{error}</p>}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={() => setShowAddQ(false)}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </Modal>

      {/* Modal Edit */}
      <Modal isOpen={!!showEditQ} onClose={() => setShowEditQ(null)} title="Edit Pertanyaan Global">
        <form onSubmit={handleEditQ}>
          <div className="modal-body">
            <div className="form-group"><label className="form-label">Pertanyaan</label><textarea className="form-textarea" value={qTeks} onChange={e => setQTeks(e.target.value)} autoFocus /></div>
            {error && <p className="form-error">{error}</p>}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={() => setShowEditQ(null)}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog isOpen={!!showDeleteQ} onClose={() => setShowDeleteQ(null)} onConfirm={handleDeleteQ}
        title="Hapus pertanyaan global ini?" message="Pertanyaan ini akan dihapus dari SEMUA bidang. Penilaian terkait juga akan terhapus." loading={saving} />

      {toast && <div className="toast-container"><div className={`toast toast-${toast.type}`}>{toast.msg}</div></div>}
    </div>
  )
}
