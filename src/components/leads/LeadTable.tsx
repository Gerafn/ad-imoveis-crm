import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'
import type { Lead, LeadFase, LeadTemperature, LeadTipo, LeadMeio } from '../../types'
import { LEAD_FASES, LEAD_MEIOS, LEAD_TIPOS, LEAD_TEMPERATURES } from '../../types'
import { TemperatureBadge, FaseBadge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Select, Input } from '../ui/FormField'
import { PhoneMenu } from '../ui/PhoneMenu'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { EmptyState } from '../ui/EmptyState'
import { formatCurrency, formatDate } from '../../utils'

interface LeadTableProps {
  leads: Lead[]
  onEdit: (lead: Lead) => void
  onDelete: (id: string) => void
}

const PAGE_SIZE = 15

export function LeadTable({ leads, onEdit, onDelete }: LeadTableProps) {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [filterFase, setFilterFase] = useState<LeadFase | ''>('')
  const [filterTemp, setFilterTemp] = useState<LeadTemperature | ''>((searchParams.get('temp') as LeadTemperature) || '')
  const [filterTipo, setFilterTipo] = useState<LeadTipo | ''>('')
  const [filterMeio, setFilterMeio] = useState<LeadMeio | ''>('')
  const [filterDataDe, setFilterDataDe] = useState('')
  const [filterDataAte, setFilterDataAte] = useState('')
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filtered = leads.filter(l => {
    if (search && !l.nome.toLowerCase().includes(search.toLowerCase()) && !l.telefone.includes(search)) return false
    if (filterFase && l.fase !== filterFase) return false
    if (filterTemp && l.temperatura !== filterTemp) return false
    if (filterTipo && l.tipo !== filterTipo) return false
    if (filterMeio && l.meio !== filterMeio) return false
    if (filterDataDe && l.data < filterDataDe) return false
    if (filterDataAte && l.data > filterDataAte) return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const tempRowBg: Record<LeadTemperature, string> = {
    Frio: '',
    Morno: 'bg-yellow-50/40',
    Quente: 'bg-red-50/40',
  }

  return (
    <div>
      {/* Filters */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-2">
        <Input
          placeholder="Buscar por nome..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="col-span-2 lg:col-span-1"
        />
        <Select value={filterFase} onChange={e => { setFilterFase(e.target.value as LeadFase | ''); setPage(1) }}>
          <option value="">Todas as fases</option>
          {LEAD_FASES.map(f => <option key={f}>{f}</option>)}
        </Select>
        <Select value={filterTemp} onChange={e => { setFilterTemp(e.target.value as LeadTemperature | ''); setPage(1) }}>
          <option value="">Temperatura</option>
          {LEAD_TEMPERATURES.map(t => <option key={t}>{t}</option>)}
        </Select>
        <Select value={filterTipo} onChange={e => { setFilterTipo(e.target.value as LeadTipo | ''); setPage(1) }}>
          <option value="">Tipo</option>
          {LEAD_TIPOS.map(t => <option key={t}>{t}</option>)}
        </Select>
        <Select value={filterMeio} onChange={e => { setFilterMeio(e.target.value as LeadMeio | ''); setPage(1) }}>
          <option value="">Canal</option>
          {LEAD_MEIOS.map(m => <option key={m}>{m}</option>)}
        </Select>
      </div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 whitespace-nowrap">De</span>
          <Input
            type="date"
            value={filterDataDe}
            onChange={e => { setFilterDataDe(e.target.value); setPage(1) }}
            className="w-36"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 whitespace-nowrap">Até</span>
          <Input
            type="date"
            value={filterDataAte}
            onChange={e => { setFilterDataAte(e.target.value); setPage(1) }}
            className="w-36"
          />
        </div>
        {(filterDataDe || filterDataAte) && (
          <button
            onClick={() => { setFilterDataDe(''); setFilterDataAte(''); setPage(1) }}
            className="text-xs text-slate-400 hover:text-red-500 transition-colors"
          >
            Limpar datas
          </button>
        )}
      </div>

      <p className="text-xs text-slate-400 mb-3">{filtered.length} lead{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</p>

      {paginated.length === 0 ? (
        <EmptyState
          title="Nenhum lead encontrado"
          description="Tente ajustar os filtros ou adicione um novo lead."
        />
      ) : (
        <div>
          {/* Cards — mobile */}
          <div className="flex flex-col gap-3 md:hidden">
            {paginated.map(lead => (
              <div key={lead.id} className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-4 ${tempRowBg[lead.temperatura]}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-semibold text-slate-800">{lead.nome}</p>
                    <PhoneMenu telefone={lead.telefone} />
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => onEdit(lead)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#1B4F72] transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setDeleteId(lead.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <TemperatureBadge value={lead.temperatura} />
                  <FaseBadge value={lead.fase} />
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{lead.tipo}</span>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{lead.meio}</span>
                  {lead.valor > 0 && <span className="text-xs bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded-full">{formatCurrency(lead.valor)}</span>}
                </div>
                <p className="text-xs text-slate-400 mt-2">{formatDate(lead.data)}</p>
              </div>
            ))}
          </div>

          {/* Tabela — desktop */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Data</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cliente</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tipo</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Imóvel</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Valor</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Fase</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Temp.</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Canal</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginated.map(lead => (
                    <tr key={lead.id} className={`hover:bg-slate-50 transition-colors ${tempRowBg[lead.temperatura]}`}>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatDate(lead.data)}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{lead.nome}</p>
                        <PhoneMenu telefone={lead.telefone} />
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{lead.tipo}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{lead.imovel || '-'}</td>
                      <td className="px-4 py-3 text-slate-700 font-mono whitespace-nowrap">{lead.valor > 0 ? formatCurrency(lead.valor) : '-'}</td>
                      <td className="px-4 py-3"><FaseBadge value={lead.fase} /></td>
                      <td className="px-4 py-3"><TemperatureBadge value={lead.temperatura} /></td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{lead.meio}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => onEdit(lead)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#1B4F72] transition-colors">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => setDeleteId(lead.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 mt-2 bg-white rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-400">Página {page} de {totalPages}</span>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Anterior</Button>
                <Button variant="secondary" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Próxima</Button>
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && onDelete(deleteId)}
        title="Excluir Lead"
        message="Tem certeza que deseja excluir este lead? Essa ação não pode ser desfeita."
      />
    </div>
  )
}
