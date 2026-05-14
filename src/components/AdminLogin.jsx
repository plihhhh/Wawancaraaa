import { useState } from 'react'
import { useAdmin } from '../contexts/AdminContext'
import Modal from './Modal'

export default function AdminLogin() {
  const { showLogin, setShowLogin, login } = useAdmin()
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!pin.trim()) { setError('Masukkan PIN'); return }
    setLoading(true)
    setError('')
    try {
      const success = await login(pin)
      if (!success) setError('Password admin salah')
      else setPin('')
    } catch {
      setError('Gagal verifikasi PIN. Periksa koneksi.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => { setShowLogin(false); setPin(''); setError('') }

  return (
    <Modal isOpen={showLogin} onClose={handleClose} title="Masuk Admin">
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">PIN Admin</label>
            <input type="password" className="form-input" placeholder="Masukkan PIN..." value={pin} onChange={e => setPin(e.target.value)} autoFocus maxLength={20} />
            {error && <p className="form-error">{error}</p>}
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={handleClose}>Batal</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Memverifikasi...' : 'Masuk'}</button>
        </div>
      </form>
    </Modal>
  )
}
