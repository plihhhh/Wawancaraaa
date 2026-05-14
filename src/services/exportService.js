import * as XLSX from 'xlsx'
import { getKandidatByBidang, getAllPertanyaanForBidang, getPenilaianByKandidat, getBidangById, hitungRataRata, getKategori } from './database'

async function buildExportData(bidangId) {
  const bidang = await getBidangById(bidangId)
  const kandidatList = await getKandidatByBidang(bidangId)
  const pertanyaanList = await getAllPertanyaanForBidang(bidangId)
  const rows = []

  for (const k of kandidatList) {
    const penilaianList = await getPenilaianByKandidat(k.id)
    const rata = hitungRataRata(penilaianList)
    const kategori = getKategori(rata)

    if (pertanyaanList.length === 0) {
      rows.push({
        'Bidang': bidang.nama,
        'Nama': k.nama,
        'NIM': k.nim,
        'Pilihan': k.pilihan,
        'Pertanyaan': '-',
        'Jenis Pertanyaan': '-',
        'Skor': '-',
        'Catatan': '-',
        'Rata-rata': rata ?? '-',
        'Kategori': kategori,
        'Status': k.status
      })
    } else {
      for (const p of pertanyaanList) {
        const penilaian = penilaianList.find(n => n.pertanyaan_id === p.id)
        rows.push({
          'Bidang': bidang.nama,
          'Nama': k.nama,
          'NIM': k.nim,
          'Pilihan': k.pilihan,
          'Pertanyaan': p.teks,
          'Jenis Pertanyaan': p.scope === 'global' ? 'Global' : 'Khusus Bidang',
          'Skor': penilaian?.skor || '-',
          'Catatan': penilaian?.catatan || '-',
          'Rata-rata': rata ?? '-',
          'Kategori': kategori,
          'Status': k.status
        })
      }
    }
  }
  return { rows, bidangNama: bidang.nama }
}

export async function exportToCSV(bidangId) {
  const { rows, bidangNama } = await buildExportData(bidangId)
  if (rows.length === 0) throw new Error('Tidak ada data untuk diekspor')

  const headers = Object.keys(rows[0])
  const csvContent = [
    headers.join(','),
    ...rows.map(r => headers.map(h => {
      let val = String(r[h] ?? '')
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        val = '"' + val.replace(/"/g, '""') + '"'
      }
      return val
    }).join(','))
  ].join('\n')

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, `Wawancara_${bidangNama}.csv`)
}

export async function exportToExcel(bidangId) {
  const { rows, bidangNama } = await buildExportData(bidangId)
  if (rows.length === 0) throw new Error('Tidak ada data untuk diekspor')

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, bidangNama.substring(0, 31))

  const colWidths = Object.keys(rows[0]).map(k => ({ wch: Math.max(k.length, ...rows.map(r => String(r[k] ?? '').length)) + 2 }))
  ws['!cols'] = colWidths

  XLSX.writeFile(wb, `Wawancara_${bidangNama}.xlsx`)
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export { buildExportData }
