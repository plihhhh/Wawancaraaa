import { supabase } from './supabaseClient'

// ============ BIDANG ============
export async function getAllBidang() {
  const { data, error } = await supabase.from('bidang').select('*').order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

export async function getBidangById(id) {
  const { data, error } = await supabase.from('bidang').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function createBidang(nama) {
  const { data, error } = await supabase.from('bidang').insert({ nama }).select().single()
  if (error) throw error
  return data
}

export async function updateBidang(id, nama) {
  const { data, error } = await supabase.from('bidang').update({ nama, updated_at: new Date().toISOString() }).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteBidang(id) {
  const { error } = await supabase.from('bidang').delete().eq('id', id)
  if (error) throw error
}

// ============ PERTANYAAN - GLOBAL ============
export async function getPertanyaanGlobal() {
  const { data, error } = await supabase.from('pertanyaan').select('*').eq('scope', 'global').order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

export async function createPertanyaanGlobal(teks) {
  const { data, error } = await supabase.from('pertanyaan').insert({ teks, scope: 'global', created_by_role: 'admin', bidang_id: null }).select().single()
  if (error) throw error
  return data
}

export async function updatePertanyaanGlobal(id, teks) {
  const { data, error } = await supabase.from('pertanyaan').update({ teks }).eq('id', id).eq('scope', 'global').select().single()
  if (error) throw error
  return data
}

export async function deletePertanyaanGlobal(id) {
  const { error } = await supabase.from('pertanyaan').delete().eq('id', id).eq('scope', 'global')
  if (error) throw error
}

// ============ PERTANYAAN - BIDANG ============
export async function getPertanyaanByBidang(bidangId) {
  const { data, error } = await supabase.from('pertanyaan').select('*').eq('bidang_id', bidangId).eq('scope', 'bidang').order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

export async function createPertanyaanBidang(bidangId, teks, createdByRole = 'user') {
  const { data, error } = await supabase.from('pertanyaan').insert({ bidang_id: bidangId, teks, scope: 'bidang', created_by_role: createdByRole }).select().single()
  if (error) throw error
  return data
}

export async function updatePertanyaan(id, teks) {
  const { data, error } = await supabase.from('pertanyaan').update({ teks }).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deletePertanyaan(id) {
  const { error } = await supabase.from('pertanyaan').delete().eq('id', id)
  if (error) throw error
}

// ============ PERTANYAAN - GABUNGAN ============
export async function getAllPertanyaanForBidang(bidangId) {
  const { data, error } = await supabase.from('pertanyaan').select('*').or(`scope.eq.global,bidang_id.eq.${bidangId}`).order('scope', { ascending: false }).order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

// ============ KANDIDAT ============
export async function getKandidatByBidang(bidangId) {
  const { data, error } = await supabase.from('kandidat').select('*').eq('bidang_id', bidangId).order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

export async function getKandidatById(id) {
  const { data, error } = await supabase.from('kandidat').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function createKandidat(bidangId, { nama, nim, pilihan }) {
  const { data, error } = await supabase.from('kandidat').insert({ bidang_id: bidangId, nama, nim, pilihan: parseInt(pilihan) }).select().single()
  if (error) throw error
  return data
}

export async function updateKandidatStatus(id, status) {
  const { data, error } = await supabase.from('kandidat').update({ status, updated_at: new Date().toISOString() }).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteKandidat(id) {
  const { error } = await supabase.from('kandidat').delete().eq('id', id)
  if (error) throw error
}

// ============ PENILAIAN ============
export async function getPenilaianByKandidat(kandidatId) {
  const { data, error } = await supabase.from('penilaian').select('*').eq('kandidat_id', kandidatId)
  if (error) throw error
  return data || []
}

export async function savePenilaian(kandidatId, pertanyaanId, skor, catatan) {
  const { data, error } = await supabase.from('penilaian').upsert({ kandidat_id: kandidatId, pertanyaan_id: pertanyaanId, skor, catatan, updated_at: new Date().toISOString() }, { onConflict: 'kandidat_id,pertanyaan_id' }).select().single()
  if (error) throw error
  return data
}

// ============ SETTINGS ============
export async function getSetting(key) {
  const { data, error } = await supabase.from('settings').select('value').eq('key', key).single()
  if (error) { if (error.code === 'PGRST116') return null; throw error }
  return data?.value || ''
}

export async function updateSetting(key, value) {
  const { data, error } = await supabase.from('settings').update({ value }).eq('key', key).select().single()
  if (error) throw error
  return data
}

export async function verifyAdminPin(pin) {
  try {
    const storedPin = await getSetting('admin_pin')
    if (storedPin) return storedPin === pin
  } catch (err) {
    console.error('Failed to fetch admin pin, using fallback.', err)
  }
  return pin === '1234'
}

// ============ AGREGASI ============
export function hitungRataRata(penilaianList) {
  const scored = penilaianList.filter(p => p.skor > 0)
  if (scored.length === 0) return null
  const total = scored.reduce((sum, p) => sum + p.skor, 0)
  return +(total / scored.length).toFixed(2)
}

export function getKategori(rataRata) {
  if (rataRata === null || rataRata === undefined) return 'Belum dinilai'
  if (rataRata >= 3.5) return 'Bagus'
  if (rataRata >= 3) return 'Lumayan'
  return 'Cadangan'
}

export async function getKandidatCount(bidangId) {
  const { count, error } = await supabase.from('kandidat').select('*', { count: 'exact', head: true }).eq('bidang_id', bidangId)
  if (error) return 0
  return count || 0
}
