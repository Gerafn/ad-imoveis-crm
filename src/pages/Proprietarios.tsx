import { useState } from 'react'
import { Plus, Download } from 'lucide-react'
import { useOwnerStore, useSettingsStore } from '../store'
import type { Owner } from '../types'
import { OwnerTable } from '../components/owners/OwnerTable'
import { OwnerForm } from '../components/owners/OwnerForm'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { exportToCSV } from '../utils'

export function Proprietarios() {
  const { owners, addOwner, updateOwner, deleteOwner } = useOwnerStore()
  const { customFields } = useSettingsStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Owner | null>(null)

  const handleSubmit = (data: Omit<Owner, 'id' | 'createdAt'>) => {
    if (editing) {
      updateOwner(editing.id, data)
    } else {
      addOwner(data)
    }
    setModalOpen(false)
    setEditing(null)
  }

  const handleEdit = (owner: Owner) => {
    setEditing(owner)
    setModalOpen(true)
  }

  const handleClose = () => {
    setModalOpen(false)
    setEditing(null)
  }

  const handleExport = () => {
    exportToCSV(owners.map(o => ({
      Data: o.data,
      Nome: o.nome,
      Telefone: o.telefone,
      Tipo: o.tipo,
      Negocio: o.negocio,
      Escritura: o.escritura ? 'Sim' : 'Não',
      Endereco: o.endereco,
      Exclusividade: o.exclusividade ? 'Sim' : 'Não',
      Captacao: o.captacao,
    })), 'proprietarios')
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Proprietários</h1>
          <p className="text-slate-500 text-sm mt-1">{owners.length} imóveis captados</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={<Download size={14} />} onClick={handleExport}>CSV</Button>
          <Button icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>Novo Proprietário</Button>
        </div>
      </div>

      <OwnerTable owners={owners} onEdit={handleEdit} onDelete={deleteOwner} />

      <Modal
        open={modalOpen}
        onClose={handleClose}
        title={editing ? 'Editar Proprietário' : 'Novo Proprietário'}
        size="lg"
      >
        <OwnerForm
          initial={editing || undefined}
          customFields={customFields}
          onSubmit={handleSubmit}
          onCancel={handleClose}
        />
      </Modal>
    </div>
  )
}
