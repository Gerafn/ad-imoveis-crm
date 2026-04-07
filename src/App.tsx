import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useSeedLoader } from './seed/useSeedLoader'
import { Layout } from './components/layout/Layout'
import { Dashboard } from './pages/Dashboard'
import { Leads } from './pages/Leads'
import { Proprietarios } from './pages/Proprietarios'
import { Metas } from './pages/Metas'
import { Configuracoes } from './pages/Configuracoes'

function App() {
  useSeedLoader()

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/proprietarios" element={<Proprietarios />} />
          <Route path="/metas" element={<Metas />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
