import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAdmin } from '../contexts/AdminContext'
import { getBidangById, getKandidatByBidang, getPertanyaanGlobal, getPertanyaanByBidang, createKandidat, deleteKandidat, createPertanyaanBidang, deletePertanyaan, updatePertanyaan, getPenilaianByKandidat, hitungRataRata, getKategori } from '../services/database'
import { exportToCSV, exportToExcel } from '../services/exportService'
import { syncAllToSheets } from '../services/googleSheetsService'
import KandidatTable from '../components/KandidatTable'
import HasilTable from '../components/HasilTable'
import FilterBar from '../components/FilterBar'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import LoadingSpinner from '../components/LoadingSpinner'

export default function BidangPage() {
  const { id } = useParams()
  const { isAdmin } = useAdmin()
  const [bidang, setBidang] = useState(null)
  const [kandidatList, setKandidatList] = useState([])
  const [globalQ, setGlobalQ] = useState([])
  const [bidangQ, setBidangQ] = useState([])
  const [hasilList, setHasilList] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('kandidat')
  const [filter, setFilter] = useState('semua')

  // Modal states
  const [showAddKandidat, setShowAddKandidat] = useState(false)
  const [showAddPertanyaan, setShowAddPertanyaan] = useState(false)
  const [showEditPertanyaan, setShowEditPertanyaan] = useState(null)
  const [showDeleteKandidat, setShowDeleteKandidat] = useState(null)
  const [showDeletePertanyaan, setShowDeletePertanyaan] = useState(null)
  const [form, setForm] = useState({ nama: '', nim: '', pilihan: '1' })
  const [pertanyaanTeks, setPertanyaanTeks] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState('')
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [b, k, gq, bq] = await Promise.all([
        getBidangById(id), getKandidatByBidang(id), getPertanyaanGlobal(), getPertanyaanByBidang(id)
      ])
      setBidang(b); setKandidatList(k); setGlobalQ(gq); setBidangQ(bq)
      // Build hasil
      const hasil = []
      for (const kand of k) {
        const penilaian = await getPenilaianByKandidat(kand.id)
        const rata = hitungRataRata(penilaian)
        hasil.push({ ...kand, rataRata: rata, kategori: getKategori(rata) })
      }
      setHasilList(hasil)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [id])

  useEffect(() => { fetchData() }, [fetchData])

  const handleAddKandidat = async (e) => {
    e.preventDefault()
    if (!form.nama.trim() || !form.nim.trim()) { setError('Nama dan NIM wajib diisi'); return }
    setSaving(true)
    try {
      await createKandidat(id, { nama: form.nama.trim(), nim: form.nim.trim(), pilihan: form.pilihan })
      setForm({ nama: '', nim: '', pilihan: '1' }); setShowAddKandidat(false); setError('')
      fetchData(); showToast('Kandidat berhasil ditambahkan')
    } catch { setError('Gagal menambahkan kandidat') }
    finally { setSaving(false) }
  }

  const handleDeleteKandidat = async () => {
    setSaving(true)
    try { await deleteKandidat(showDeleteKandidat.id); setShowDeleteKandidat(null); fetchData(); showToast('Kandidat dihapus') }
    catch { console.error('Gagal menghapus') }
    finally { setSaving(false) }
  }

  const handleAddPertanyaan = async (e) => {
    e.preventDefault()
    if (!pertanyaanTeks.trim()) { setError('Pertanyaan wajib diisi'); return }
    setSaving(true)
    try {
      await createPertanyaanBidang(id, pertanyaanTeks.trim(), isAdmin ? 'admin' : 'user')
      setPertanyaanTeks(''); setShowAddPertanyaan(false); setError('')
      fetchData(); showToast('Pertanyaan ditambahkan')
    } catch { setError('Gagal menambahkan pertanyaan') }
    finally { setSaving(false) }
  }

  const handleEditPertanyaan = async (e) => {
    e.preventDefault()
    if (!pertanyaanTeks.trim()) { setError('Pertanyaan wajib diisi'); return }
    setSaving(true)
    try {
      await updatePertanyaan(showEditPertanyaan.id, pertanyaanTeks.trim())
      setPertanyaanTeks(''); setShowEditPertanyaan(null); setError('')
      fetchData(); showToast('Pertanyaan diperbarui')
    } catch { setError('Gagal mengubah pertanyaan') }
    finally { setSaving(false) }
  }

  const handleDeletePertanyaan = async () => {
    setSaving(true)
    try { await deletePertanyaan(showDeletePertanyaan.id); setShowDeletePertanyaan(null); fetchData(); showToast('Pertanyaan dihapus') }
    catch { console.error('Gagal menghapus') }
    finally { setSaving(false) }
  }

  const handleExport = async (type) => {
    setExporting(type)
    try {
      if (type === 'csv') await exportToCSV(id)
      else if (type === 'excel') await exportToExcel(id)
      else if (type === 'sheets') { await syncAllToSheets(id); showToast('Data berhasil dikirim ke Google Sheets') }
    } catch (err) { showToast(err.message, 'error') }
    finally { setExporting('') }
  }

  const filteredHasil = hasilList.filter(h => {
    if (filter === 'semua') return true
    if (['Belum Wawancara', 'Sedang Diproses', 'Selesai'].includes(filter)) return h.status === filter
    return h.kategori === filter
  })

  if (loading) return <LoadingSpinner text="Memuat data bidang..." />
  if (!bidang) return <div className="empty-state"><p>Bidang tidak ditemukan.</p></div>

  return (
    <div className="fade-in">
      <div className="breadcrumb"><Link to="/">Beranda</Link><span>/</span><span>{bidang.nama}</span></div>
      <div className="page-header"><h1>{bidang.nama}</h1></div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'kandidat' ? 'active' : ''}`} onClick={() => setActiveTab('kandidat')}>👥 Kandidat</button>
        <button className={`tab-btn ${activeTab === 'pertanyaan' ? 'active' : ''}`} onClick={() => setActiveTab('pertanyaan')}>❓ Pertanyaan</button>
        <button className={`tab-btn ${activeTab === 'hasil' ? 'active' : ''}`} onClick={() => setActiveTab('hasil')}>📊 Hasil</button>
      </div>

      {/* TAB: Kandidat */}
      {activeTab === 'kandidat' && (
        <div className="section">
          <div className="section-header">
            <div><h2 className="section-title">Daftar Kandidat</h2><p className="section-subtitle">{kandidatList.length} kandidat terdaftar</p></div>
            <button className="btn btn-primary" onClick={() => { setForm({ nama: '', nim: '', pilihan: '1' }); setShowAddKandidat(true); setError('') }}>+ Tambah Anak</button>
          </div>
          <KandidatTable kandidatList={kandidatList} bidangId={id} onDelete={setShowDeleteKandidat} />
        </div>
      )}

      {/* TAB: Pertanyaan */}
      {activeTab === 'pertanyaan' && (
        <>
          {/* Pertanyaan Global */}
          <div className="section">
            <div className="section-header">
              <div><h2 className="section-title">📌 Pertanyaan Umum dari Admin</h2><p className="section-subtitle">Berlaku di semua bidang</p></div>
            </div>
            {globalQ.length === 0 ? (
              <div className="empty-state" style={{ padding: '1.5rem' }}><p>Belum ada pertanyaan global.{isAdmin ? ' Tambahkan di halaman Pengaturan.' : ''}</p></div>
            ) : (
              <div className="pertanyaan-list">
                {globalQ.map((p, i) => (
                  <div key={p.id} className="pertanyaan-item">
                    <span style={{ fontWeight: 700, color: 'var(--neutral-400)', marginRight: '.5rem', fontSize: '.8rem' }}>{i + 1}.</span>
                    <span className="pertanyaan-item-text">{p.teks}</span>
                    <span className="badge badge-global">Global</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pertanyaan Khusus Bidang */}
          <div className="section">
            <div className="section-header">
              <div><h2 className="section-title">📝 Pertanyaan Khusus Bidang Ini</h2><p className="section-subtitle">Hanya berlaku di {bidang.nama}</p></div>
              <button className="btn btn-primary" onClick={() => { setPertanyaanTeks(''); setShowAddPertanyaan(true); setError('') }}>+ Tambah Pertanyaan</button>
            </div>
            {bidangQ.length === 0 ? (
              <div className="empty-state" style={{ padding: '1.5rem' }}><p>Belum ada pertanyaan khusus bidang.</p></div>
            ) : (
              <div className="pertanyaan-list">
                {bidangQ.map((p, i) => (
                  <div key={p.id} className="pertanyaan-item">
                    <span style={{ fontWeight: 700, color: 'var(--neutral-400)', marginRight: '.5rem', fontSize: '.8rem' }}>{i + 1}.</span>
                    <span className="pertanyaan-item-text">{p.teks}</span>
                    <span className="badge badge-bidang">Khusus Bidang</span>
                    <div className="pertanyaan-item-actions">
                      {(isAdmin || p.created_by_role === 'user') && (
                        <>
                          <button className="btn btn-sm btn-outline" onClick={() => { setPertanyaanTeks(p.teks); setShowEditPertanyaan(p); setError('') }}>✏️</button>
                          <button className="btn btn-sm btn-danger" onClick={() => setShowDeletePertanyaan(p)}>🗑️</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* TAB: Hasil */}
      {activeTab === 'hasil' && (
        <div className="section">
          <div className="section-header">
            <div><h2 className="section-title">Hasil Wawancara</h2></div>
            <div className="section-actions">
              <button className="btn btn-sm btn-outline" onClick={() => handleExport('csv')} disabled={!!exporting}>{exporting === 'csv' ? '⏳...' : '📄 CSV'}</button>
              <button className="btn btn-sm btn-success" onClick={() => handleExport('excel')} disabled={!!exporting}>{exporting === 'excel' ? '⏳...' : '📊 Excel'}</button>
              <button className="btn btn-sm btn-accent" onClick={() => handleExport('sheets')} disabled={!!exporting}>{exporting === 'sheets' ? '⏳...' : '📋 Google Sheets'}</button>
            </div>
          </div>
          <FilterBar active={filter} onChange={setFilter} />
          <HasilTable hasilList={filteredHasil} />
        </div>
      )}

      {/* Modal Tambah Kandidat */}
      <Modal isOpen={showAddKandidat} onClose={() => setShowAddKandidat(false)} title="Tambah Kandidat">
        <form onSubmit={handleAddKandidat}>
          <div className="modal-body">
            <div className="form-group"><label className="form-label">Nama Lengkap</label><input className="form-input" value={form.nama} onChange={e => setForm(f => ({...f, nama: e.target.value}))} autoFocus /></div>
            <div className="form-group"><label className="form-label">NIM</label><input className="form-input" value={form.nim} onChange={e => setForm(f => ({...f, nim: e.target.value}))} /></div>
            <div className="form-group">
              <label className="form-label">Pilihan</label>
              <select className="form-select" value={form.pilihan} onChange={e => setForm(f => ({...f, pilihan: e.target.value}))}>
                <option value="1">Pilihan 1</option><option value="2">Pilihan 2</option>
              </select>
            </div>
            {error && <p className="form-error">{error}</p>}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={() => setShowAddKandidat(false)}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </Modal>

      {/* Modal Tambah Pertanyaan */}
      <Modal isOpen={showAddPertanyaan} onClose={() => setShowAddPertanyaan(false)} title="Tambah Pertanyaan Khusus Bidang">
        <form onSubmit={handleAddPertanyaan}>
          <div className="modal-body">
            <div className="form-group"><label className="form-label">Pertanyaan</label><textarea className="form-textarea" value={pertanyaanTeks} onChange={e => setPertanyaanTeks(e.target.value)} placeholder="Tulis pertanyaan..." autoFocus /></div>
            {error && <p className="form-error">{error}</p>}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={() => setShowAddPertanyaan(false)}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </Modal>

      {/* Modal Edit Pertanyaan */}
      <Modal isOpen={!!showEditPertanyaan} onClose={() => setShowEditPertanyaan(null)} title="Edit Pertanyaan">
        <form onSubmit={handleEditPertanyaan}>
          <div className="modal-body">
            <div className="form-group"><label className="form-label">Pertanyaan</label><textarea className="form-textarea" value={pertanyaanTeks} onChange={e => setPertanyaanTeks(e.target.value)} autoFocus /></div>
            {error && <p className="form-error">{error}</p>}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={() => setShowEditPertanyaan(null)}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Kandidat */}
      <ConfirmDialog isOpen={!!showDeleteKandidat} onClose={() => setShowDeleteKandidat(null)} onConfirm={handleDeleteKandidat}
        title={`Hapus "${showDeleteKandidat?.nama}"?`} message="Semua penilaian kandidat ini akan ikut terhapus." loading={saving} />

      {/* Confirm Delete Pertanyaan */}
      <ConfirmDialog isOpen={!!showDeletePertanyaan} onClose={() => setShowDeletePertanyaan(null)} onConfirm={handleDeletePertanyaan}
        title="Hapus pertanyaan ini?" message="Penilaian terkait pertanyaan ini juga akan terhapus." loading={saving} />

      {/* Toast */}
      {toast && (
        <div className="toast-container"><div className={`toast toast-${toast.type}`}>{toast.msg}</div></div>
      )}
    </div>
  )
}
