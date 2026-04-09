import { useState } from 'react'
import { X, Plus, Check, Trash2, Bell, Clock } from 'lucide-react'
import type { Reminder } from '../../types'
import { Input, FieldWrapper, Select, Textarea } from '../ui/FormField'
import { Button } from '../ui/Button'
import { formatDate } from '../../utils'

interface ReminderPanelProps {
  open: boolean
  onClose: () => void
  reminders: Reminder[]
  leads: { id: string; nome: string }[]
  onAdd: (data: Omit<Reminder, 'id' | 'createdAt'>) => void
  onToggle: (id: string, concluido: boolean) => void
  onDelete: (id: string) => void
}

function ReminderForm({ onSave, onCancel, leads }: {
  onSave: (data: Omit<Reminder, 'id' | 'createdAt'>) => void
  onCancel: () => void
  leads: { id: string; nome: string }[]
}) {
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [hora, setHora] = useState('09:00')
  const [leadId, setLeadId] = useState('')

  const handleSave = () => {
    if (!titulo.trim()) return
    onSave({ titulo, descricao, data, hora, leadId: leadId || null, concluido: false })
  }

  return (
    <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
      <p className="text-sm font-semibold text-slate-700">Novo Lembrete</p>
      <FieldWrapper label="Título">
        <Input placeholder="Ex: Ligar para João" value={titulo} onChange={e => setTitulo(e.target.value)} />
      </FieldWrapper>
      <div className="grid grid-cols-2 gap-3">
        <FieldWrapper label="Data">
          <Input type="date" value={data} onChange={e => setData(e.target.value)} />
        </FieldWrapper>
        <FieldWrapper label="Hora">
          <Input type="time" value={hora} onChange={e => setHora(e.target.value)} />
        </FieldWrapper>
      </div>
      <FieldWrapper label="Lead (opcional)">
        <Select value={leadId} onChange={e => setLeadId(e.target.value)}>
          <option value="">Nenhum</option>
          {leads.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
        </Select>
      </FieldWrapper>
      <FieldWrapper label="Observação">
        <Textarea rows={2} placeholder="Detalhes..." value={descricao} onChange={e => setDescricao(e.target.value)} />
      </FieldWrapper>
      <div className="flex gap-2 justify-end">
        <Button variant="secondary" size="sm" onClick={onCancel}>Cancelar</Button>
        <Button size="sm" onClick={handleSave} disabled={!titulo.trim()}>Salvar</Button>
      </div>
    </div>
  )
}

function isVencido(data: string, hora: string) {
  try {
    return new Date(`${data}T${hora}`) < new Date()
  } catch {
    return false
  }
}

function isHoje(data: string) {
  return data === new Date().toISOString().split('T')[0]
}

function ReminderCard({ reminder, leadNome, onToggle, onDelete, concluido }: {
  reminder: Reminder
  leadNome?: string
  onToggle: () => void
  onDelete: () => void
  concluido?: boolean
}) {
  const vencido = !concluido && isVencido(reminder.data, reminder.hora)
  const hoje = isHoje(reminder.data)

  return (
    <div className={`rounded-xl border p-3 flex gap-3 ${concluido ? 'opacity-50 bg-slate-50 border-slate-100' : vencido ? 'border-red-200 bg-red-50' : hoje ? 'border-amber-200 bg-amber-50' : 'border-slate-100 bg-white'}`}>
      <button
        onClick={onToggle}
        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${concluido ? 'bg-green-500 border-green-500' : 'border-slate-300 hover:border-green-500'}`}
      >
        {concluido && <Check size={11} className="text-white" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${concluido ? 'line-through text-slate-400' : 'text-slate-800'}`}>{reminder.titulo}</p>
        {reminder.descricao && <p className="text-xs text-slate-500 mt-0.5 truncate">{reminder.descricao}</p>}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className={`text-xs flex items-center gap-1 ${vencido ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
            <Clock size={10} />
            {hoje ? 'Hoje' : formatDate(reminder.data)} às {reminder.hora}
          </span>
          {leadNome && (
            <span className="text-xs bg-[#1B4F72]/10 text-[#1B4F72] px-1.5 py-0.5 rounded-full truncate max-w-[120px]">{leadNome}</span>
          )}
        </div>
      </div>
      <button onClick={onDelete} className="flex-shrink-0 p-1 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-400 transition-colors">
        <Trash2 size={13} />
      </button>
    </div>
  )
}

export function ReminderPanel({ open, onClose, reminders, leads, onAdd, onToggle, onDelete }: ReminderPanelProps) {
  const [showForm, setShowForm] = useState(false)
  const [showConcluidos, setShowConcluidos] = useState(false)

  const pendentes = reminders.filter(r => !r.concluido)
  const concluidos = reminders.filter(r => r.concluido)
  const leadMap = Object.fromEntries(leads.map(l => [l.id, l.nome]))

  const handleSave = (data: Omit<Reminder, 'id' | 'createdAt'>) => {
    onAdd(data)
    setShowForm(false)
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />
      )}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-[#1B4F72]" />
            <span className="font-semibold text-slate-800">Lembretes</span>
            {pendentes.length > 0 && (
              <span className="bg-[#F39C12] text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendentes.length}</span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-[#1B4F72] hover:text-[#1B4F72] transition-colors text-sm font-medium"
            >
              <Plus size={16} /> Novo lembrete
            </button>
          )}

          {showForm && (
            <ReminderForm onSave={handleSave} onCancel={() => setShowForm(false)} leads={leads} />
          )}

          {pendentes.length === 0 && !showForm && (
            <div className="text-center py-10">
              <Bell size={32} className="mx-auto text-slate-200 mb-2" />
              <p className="text-sm text-slate-400">Nenhum lembrete pendente</p>
            </div>
          )}

          {pendentes.map(r => (
            <ReminderCard
              key={r.id}
              reminder={r}
              leadNome={r.leadId ? leadMap[r.leadId] : undefined}
              onToggle={() => onToggle(r.id, true)}
              onDelete={() => onDelete(r.id)}
            />
          ))}

          {concluidos.length > 0 && (
            <button
              onClick={() => setShowConcluidos(p => !p)}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors w-full text-center pt-2"
            >
              {showConcluidos ? 'Ocultar' : `Ver ${concluidos.length} concluído${concluidos.length !== 1 ? 's' : ''}`}
            </button>
          )}

          {showConcluidos && concluidos.map(r => (
            <ReminderCard
              key={r.id}
              reminder={r}
              leadNome={r.leadId ? leadMap[r.leadId] : undefined}
              onToggle={() => onToggle(r.id, false)}
              onDelete={() => onDelete(r.id)}
              concluido
            />
          ))}
        </div>
      </div>
    </>
  )
}
