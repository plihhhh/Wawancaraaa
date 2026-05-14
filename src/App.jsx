import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import BidangPage from './pages/BidangPage'
import WawancaraPage from './pages/WawancaraPage'
import PengaturanPage from './pages/PengaturanPage'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/bidang/:id" element={<BidangPage />} />
        <Route path="/bidang/:id/wawancara/:kandidatId" element={<WawancaraPage />} />
        <Route path="/pengaturan" element={<PengaturanPage />} />
      </Routes>
    </Layout>
  )
}
