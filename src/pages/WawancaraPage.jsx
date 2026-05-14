import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getKandidatById, getBidangById, getAllPertanyaanForBidang, getPenilaianByKandidat, savePenilaian, updateKandidatStatus, hitungRataRata, getKategori } from '../services/database'
import ScoreInput from '../components/ScoreInput'
import LoadingSpinner from '../components/LoadingSpinner'

export default function WawancaraPage() {
  const { id: bidangId, kandidatId } = useParams()
  const navigate = useNavigate()
  const [kandidat, setKandidat] = useState(null)
  const [bidang, setBidang] = useState(null)
  const [pertanyaanList, setPertanyaanList] = useState([])
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [k, b, pList] = await Promise.all([
        getKandidatById(kandidatId), getBidangById(bidangId), getAllPertanyaanForBidang(bidangId)
      ])
      setKandidat(k); setBidang(b); setPertanyaanList(pList)

      const existing = await getPenilaianByKandidat(kandidatId)
      const ans = {}
      for (const p of pList) {
        const found = existing.find(e => e.pertanyaan_id === p.id)
        ans[p.id] = { skor: found?.skor || 0, catatan: found?.catatan || '' }
      }
      setAnswers(ans)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [bidangId, kandidatId])

  useEffect(() => { fetchData() }, [fetchData])

  const updateAnswer = (pId, field, value) => {
    setAnswers(prev => ({ ...prev, [pId]: { ...prev[pId], [field]: value } }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      for (const p of pertanyaanList) {
        const ans = answers[p.id]
        if (ans && ans.skor > 0) {
          await savePenilaian(kandidatId, p.id, ans.skor, ans.catatan)
        }
      }
      await updateKandidatStatus(kandidatId, 'Sedang Diproses')
      showToast('Penilaian berhasil disimpan')
    } catch (err) { showToast('Gagal menyimpan penilaian', 'error') }
    finally { setSaving(false) }
  }

  const handleFinish = async () => {
    const unanswered = pertanyaanList.filter(p => !answers[p.id]?.skor || answers[p.id].skor === 0)
    if (unanswered.length > 0) {
      showToast(`Masih ada ${unanswered.length} pertanyaan yang belum dinilai`, 'error')
      return
    }
    setSaving(true)
    try {
      for (const p of pertanyaanList) {
        const ans = answers[p.id]
        await savePenilaian(kandidatId, p.id, ans.skor, ans.catatan)
      }
      await updateKandidatStatus(kandidatId, 'Selesai')
      const penilaian = await getPenilaianByKandidat(kandidatId)
      const rata = hitungRataRata(penilaian)
      const kategori = getKategori(rata)
      showToast(`Wawancara selesai! Rata-rata: ${rata} (${kategori})`)
      setTimeout(() => navigate(`/bidang/${bidangId}`), 1500)
    } catch (err) { showToast('Gagal menyelesaikan wawancara', 'error') }
    finally { setSaving(false) }
  }

  if (loading) return <LoadingSpinner text="Memuat data wawancara..." />
  if (!kandidat || !bidang) return <div className="empty-state"><p>Data tidak ditemukan.</p></div>

  const allPenilaian = Object.values(answers).filter(a => a.skor > 0)
  const currentRata = hitungRataRata(allPenilaian.map(a => ({ skor: a.skor })))
  const currentKategori = getKategori(currentRata)

  const globalQuestions = pertanyaanList.filter(p => p.scope === 'global')
  const bidangQuestions = pertanyaanList.filter(p => p.scope === 'bidang')

  return (
    <div className="fade-in">
      <div className="breadcrumb">
        <Link to="/">Beranda</Link><span>/</span>
        <Link to={`/bidang/${bidangId}`}>{bidang.nama}</Link><span>/</span>
        <span>Wawancara</span>
      </div>

      {/* Kandidat Info */}
      <div className="kandidat-info">
        <h2>🎤 Wawancara: {kandidat.nama}</h2>
        <div className="kandidat-info-grid">
          <div className="kandidat-info-item"><label>NIM</label><span>{kandidat.nim}</span></div>
          <div className="kandidat-info-item"><label>Pilihan</label><span>Pilihan {kandidat.pilihan}</span></div>
          <div className="kandidat-info-item"><label>Status</label><span>{kandidat.status}</span></div>
          {currentRata !== null && (
            <>
              <div className="kandidat-info-item"><label>Rata-rata</label><span>{currentRata}</span></div>
              <div className="kandidat-info-item"><label>Kategori</label><span>{currentKategori}</span></div>
            </>
          )}
        </div>
      </div>

      {pertanyaanList.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">❓</div><p>Belum ada pertanyaan. Tambahkan pertanyaan terlebih dahulu di halaman bidang.</p></div>
      ) : (
        <>
          {/* Pertanyaan Global */}
          {globalQuestions.length > 0 && (
            <div className="section">
              <h3 style={{ marginBottom: '1rem' }}>📌 Pertanyaan Umum <span className="badge badge-global" style={{ marginLeft: '.5rem' }}>Global</span></h3>
              {globalQuestions.map((p, i) => (
                <div key={p.id} className="wawancara-card">
                  <div className="wawancara-card-header">
                    <div className="wawancara-card-num">Pertanyaan {i + 1}</div>
                    <div className="wawancara-card-q">{p.teks}</div>
                  </div>
                  <div style={{ marginBottom: '.75rem' }}>
                    <label className="form-label">Skor</label>
                    <ScoreInput value={answers[p.id]?.skor || 0} onChange={v => updateAnswer(p.id, 'skor', v)} />
                  </div>
                  <div>
                    <label className="form-label">Catatan</label>
                    <textarea className="form-textarea" value={answers[p.id]?.catatan || ''} onChange={e => updateAnswer(p.id, 'catatan', e.target.value)} placeholder="Tulis catatan..." />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pertanyaan Bidang */}
          {bidangQuestions.length > 0 && (
            <div className="section">
              <h3 style={{ marginBottom: '1rem' }}>📝 Pertanyaan Khusus Bidang <span className="badge badge-bidang" style={{ marginLeft: '.5rem' }}>Khusus</span></h3>
              {bidangQuestions.map((p, i) => (
                <div key={p.id} className="wawancara-card">
                  <div className="wawancara-card-header">
                    <div className="wawancara-card-num">Pertanyaan {globalQuestions.length + i + 1}</div>
                    <div className="wawancara-card-q">{p.teks}</div>
                  </div>
                  <div style={{ marginBottom: '.75rem' }}>
                    <label className="form-label">Skor</label>
                    <ScoreInput value={answers[p.id]?.skor || 0} onChange={v => updateAnswer(p.id, 'skor', v)} />
                  </div>
                  <div>
                    <label className="form-label">Catatan</label>
                    <textarea className="form-textarea" value={answers[p.id]?.catatan || ''} onChange={e => updateAnswer(p.id, 'catatan', e.target.value)} placeholder="Tulis catatan..." />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
            <button className="btn btn-lg btn-primary" onClick={handleSave} disabled={saving}>{saving ? '⏳ Menyimpan...' : '💾 Simpan'}</button>
            <button className="btn btn-lg btn-success" onClick={handleFinish} disabled={saving}>{saving ? '⏳...' : '✅ Selesai Wawancara'}</button>
            <Link to={`/bidang/${bidangId}`} className="btn btn-lg btn-outline">← Kembali</Link>
          </div>
        </>
      )}

      {toast && <div className="toast-container"><div className={`toast toast-${toast.type}`}>{toast.msg}</div></div>}
    </div>
  )
}
