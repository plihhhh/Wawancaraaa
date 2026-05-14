import Modal from './Modal'

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, loading }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Konfirmasi">
      <div className="modal-body">
        <div className="confirm-icon">⚠️</div>
        <div className="confirm-text">
          <h3>{title || 'Apakah Anda yakin?'}</h3>
          <p>{message || 'Tindakan ini tidak dapat dibatalkan.'}</p>
        </div>
      </div>
      <div className="modal-footer">
        <button className="btn btn-outline" onClick={onClose} disabled={loading}>Batal</button>
        <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>{loading ? 'Menghapus...' : 'Hapus'}</button>
      </div>
    </Modal>
  )
}
