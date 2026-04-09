import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Component, type ReactNode } from 'react'
import { useSeedLoader } from './seed/useSeedLoader'
import { Layout } from './components/layout/Layout'
import { Dashboard } from './pages/Dashboard'
import { Leads } from './pages/Leads'
import { Proprietarios } from './pages/Proprietarios'
import { Metas } from './pages/Metas'
import { Configuracoes } from './pages/Configuracoes'

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null }
  static getDerivedStateFromError(error: Error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
          <div className="bg-white rounded-2xl shadow p-6 max-w-lg w-full">
            <h1 className="text-red-600 font-bold text-lg mb-2">Erro ao carregar o CRM</h1>
            <pre className="text-xs text-slate-600 bg-slate-100 rounded p-3 overflow-auto whitespace-pre-wrap">
              {(this.state.error as Error).message}
              {'\n\n'}
              {(this.state.error as Error).stack}
            </pre>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function App() {
  useSeedLoader()

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  )
}

export default App
