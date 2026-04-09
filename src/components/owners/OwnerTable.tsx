import { useState } from 'react'
import { Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react'
import type { Owner, OwnerTipo, OwnerNegocio } from '../../types'
import { OWNER_TIPOS, OWNER_NEGOCIOS } from '../../types'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Select, Input } from '../ui/FormField'
import { PhoneMenu } from '../ui/PhoneMenu'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { EmptyState } from '../ui/EmptyState'
import { formatDate } from '../../utils'

interface OwnerTableProps {
  owners: Owner[]
  onEdit: (owner: Owner) => void
  onDelete: (id: string) => void
}

const PAGE_SIZE = 15

export function OwnerTable({ owners, onEdit, onDelete }: OwnerTableProps) {
  const [search, setSearch] = useState('')
  const [filterTipo, setFilterTipo] = useState<OwnerTipo | ''>('')
  const [filterNegocio, setFilterNegocio] = useState<OwnerNegocio | ''>('')
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filtered = owners.filter(o => {
    if (search && !o.nome.toLowerCase().includes(search.toLowerCase())) return false
    if (filterTipo && o.tipo !== filterTipo) return false
    if (filterNegocio && o.negocio !== filterNegocio) return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Input
          placeholder="Buscar por nome..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="col-span-2 lg:col-span-1"
        />
        <Select value={filterTipo} onChange={e => { setFilterTipo(e.target.value as OwnerTipo | ''); setPage(1) }}>
          <option value="">Tipo de Imóvel</option>
          {OWNER_TIPOS.map(t => <option key={t}>{t}</option>)}
        </Select>
        <Select value={filterNegocio} onChange={e => { setFilterNegocio(e.target.value as OwnerNegocio | ''); setPage(1) }}>
          <option value="">Negócio</option>
          {OWNER_NEGOCIOS.map(n => <option key={n}>{n}</option>)}
        </Select>
      </div>

      <p className="text-xs text-slate-400 mb-3">{filtered.length} proprietário{filtered.length !== 1 ? 's' : ''}</p>

      {paginated.length === 0 ? (
        <EmptyState title="Nenhum proprietário encontrado" description="Adicione um novo proprietário para começar." />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Data</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Proprietário</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tipo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Negócio</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Escritura</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Exclusividade</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Documentação</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Endereço</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginated.map(owner => (
                  <tr key={owner.id} className={`hover:bg-slate-50 transition-colors ${owner.exclusividade ? 'border-l-4 border-l-green-400' : ''}`}>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatDate(owner.data)}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{owner.nome}</p>
                      <PhoneMenu telefone={owner.telefone} />
                    </td>
                    <td className="px-4 py-3"><Badge color="blue">{owner.tipo}</Badge></td>
                    <td className="px-4 py-3 text-slate-600">{owner.negocio}</td>
                    <td className="px-4 py-3">
                      {owner.escritura
                        ? <CheckCircle size={16} className="text-green-500" />
                        : <XCircle size={16} className="text-slate-300" />}
                    </td>
                    <td className="px-4 py-3">
                      {owner.exclusividade
                        ? <Badge color="green">Sim</Badge>
                        : <span className="text-slate-400 text-xs">Não</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{owner.documentacao || '-'}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{owner.endereco || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => onEdit(owner)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#1B4F72] transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setDeleteId(owner.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
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
        title="Excluir Proprietário"
        message="Tem certeza que deseja excluir este proprietário?"
      />
    </div>
  )
}
