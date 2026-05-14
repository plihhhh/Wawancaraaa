import { getSetting } from './database'
import { buildExportData } from './exportService'

export async function syncAllToSheets(bidangId) {
  const url = await getSetting('google_sheets_url')
  if (!url) throw new Error('URL Google Sheets belum diatur. Silakan isi di halaman Pengaturan.')

  const { rows } = await buildExportData(bidangId)
  if (rows.length === 0) throw new Error('Tidak ada data untuk dikirim')

  const payload = rows.map(r => ({
    bidang: r['Bidang'] || '',
    nama: r['Nama'] || '',
    nim: String(r['NIM'] || ''),
    pilihan: String(r['Pilihan'] || ''),
    pertanyaan: r['Pertanyaan'] === '-' ? '' : (r['Pertanyaan'] || ''),
    jenis_pertanyaan: r['Jenis Pertanyaan'] === '-' ? '' : (r['Jenis Pertanyaan'] || ''),
    skor: r['Skor'] === '-' ? '' : r['Skor'],
    catatan: r['Catatan'] === '-' ? '' : (r['Catatan'] || ''),
    rata_rata: r['Rata-rata'] === '-' ? '' : r['Rata-rata'],
    kategori: r['Kategori'] || '',
    status: r['Status'] || ''
  }))

  console.log("Payload Google Sheets:", payload)

  const response = await fetch(url, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify(payload)
  })

  return true
}
