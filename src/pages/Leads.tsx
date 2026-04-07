import { useState, useRef, useEffect } from 'react'
import { Plus, Table, LayoutGrid, Download, MessageCircle, ChevronDown } from 'lucide-react'
import { useLeadStore, useSettingsStore } from '../store'
import type { Lead, LeadFase, LeadTemperature } from '../types'
import { LeadTable } from '../components/leads/LeadTable'
import { LeadKanban } from '../components/leads/LeadKanban'
import { LeadForm } from '../components/leads/LeadForm'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { exportToCSV } from '../utils'

type View = 'table' | 'kanban'

export function Leads() {
  const { leads, addLead, updateLead, deleteLead, moveLead } = useLeadStore()
  const { customFields } = useSettingsStore()
  const [view, setView] = useState<View>('table')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Lead | null>(null)
  const [whatsappDropdownOpen, setWhatsappDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setWhatsappDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = (data: Omit<Lead, 'id' | 'createdAt'>) => {
    if (editing) {
      updateLead(editing.id, data)
    } else {
      addLead(data)
    }
    setModalOpen(false)
    setEditing(null)
  }

  const handleEdit = (lead: Lead) => {
    setEditing(lead)
    setModalOpen(true)
  }

  const handleClose = () => {
    setModalOpen(false)
    setEditing(null)
  }

  const handleExport = () => {
    exportToCSV(leads.map(l => ({
      Data: l.data,
      Nome: l.nome,
      Telefone: l.telefone,
      Tipo: l.tipo,
      Imovel: l.imovel,
      Canal: l.meio,
      Valor: l.valor,
      Fase: l.fase,
      Temperatura: l.temperatura,
      Observacoes: l.observacoes,
    })), 'leads')
  }

  const handleExportWhatsApp = (temperatura?: LeadTemperature) => {
    const filtered = temperatura ? leads.filter(l => l.temperatura === temperatura) : leads
    exportToCSV(filtered.map(l => ({
      Nome: l.nome,
      Telefone: l.telefone,
      Temperatura: l.temperatura,
      Imovel: l.imovel,
      Tipo: l.tipo,
      Fase: l.fase,
      Observacoes: l.observacoes,
    })), `whatsapp-${temperatura ? temperatura.toLowerCase() : 'todos'}`)
    setWhatsappDropdownOpen(false)
  }

  const temperatureOptions: { label: string; value?: LeadTemperature; color: string; dot: string }[] = [
    { label: 'Todos os leads', value: undefined, color: 'text-slate-700', dot: 'bg-slate-400' },
    { label: 'Quentes', value: 'Quente', color: 'text-red-700', dot: 'bg-red-500' },
    { label: 'Mornos', value: 'Morno', color: 'text-yellow-700', dot: 'bg-yellow-500' },
    { label: 'Frios', value: 'Frio', color: 'text-blue-700', dot: 'bg-blue-500' },
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Funil de Vendas</h1>
          <p className="text-slate-500 text-sm mt-1">{leads.length} leads cadastrados</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setView('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'table' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Table size={15} />Tabela
            </button>
            <button
              onClick={() => setView('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'kanban' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <LayoutGrid size={15} />Kanban
            </button>
          </div>
          <Button variant="secondary" size="sm" icon={<Download size={14} />} onClick={handleExport}>CSV</Button>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setWhatsappDropdownOpen(prev => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition-colors"
            >
              <MessageCircle size={14} />
              WhatsApp
              <ChevronDown size={13} className={`transition-transform ${whatsappDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {whatsappDropdownOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                <p className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Exportar por temperatura</p>
                {temperatureOptions.map(opt => {
                  const count = opt.value ? leads.filter(l => l.temperatura === opt.value).length : leads.length
                  return (
                    <button
                      key={opt.label}
                      onClick={() => handleExportWhatsApp(opt.value)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 transition-colors ${opt.color}`}
                    >
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${opt.dot}`} />
                      <span className="flex-1 text-left">{opt.label}</span>
                      <span className="text-xs text-slate-400">{count}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
          <Button icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>Novo Lead</Button>
        </div>
      </div>

      {view === 'table' ? (
        <LeadTable leads={leads} onEdit={handleEdit} onDelete={deleteLead} />
      ) : (
        <LeadKanban leads={leads} onMove={(id, fase) => moveLead(id, fase as LeadFase)} />
      )}

      <Modal
        open={modalOpen}
        onClose={handleClose}
        title={editing ? 'Editar Lead' : 'Novo Lead'}
        size="lg"
      >
        <LeadForm
          initial={editing || undefined}
          customFields={customFields}
          onSubmit={handleSubmit}
          onCancel={handleClose}
        />
      </Modal>
    </div>
  )
}
