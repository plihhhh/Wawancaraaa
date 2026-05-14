import { getSetting } from './database'
import { buildExportData } from './exportService'

export async function syncAllToSheets(bidangId) {
  const url = await getSetting('google_sheets_url')
  if (!url) throw new Error('URL Google Sheets belum diatur. Silakan isi di halaman Pengaturan.')

  const { rows } = await buildExportData(bidangId)
  if (rows.length === 0) throw new Error('Tidak ada data untuk dikirim')

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: rows }),
    mode: 'no-cors'
  })

  return true
}
