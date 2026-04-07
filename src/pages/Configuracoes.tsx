import { useState } from 'react'
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react'
import { useSettingsStore } from '../store'
import type { CustomField } from '../types'
import { Button } from '../components/ui/Button'
import { Input, Select, FieldWrapper } from '../components/ui/FormField'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'

type EditingField = Omit<CustomField, 'id'> & { id?: string }

const emptyField = (): EditingField => ({
  label: '',
  type: 'text',
  module: 'leads',
  options: [],
})

export function Configuracoes() {
  const { customFields, addCustomField, updateCustomField, deleteCustomField } = useSettingsStore()
  const [adding, setAdding] = useState(false)
  const [newField, setNewField] = useState<EditingField>(emptyField())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [optionInput, setOptionInput] = useState('')

  const handleSaveNew = () => {
    if (!newField.label.trim()) return
    addCustomField(newField)
    setAdding(false)
    setNewField(emptyField())
  }

  const handleSaveEdit = (id: string, field: CustomField) => {
    updateCustomField(id, field)
    setEditingId(null)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Configurações</h1>
        <p className="text-slate-500 text-sm mt-1">Gerencie campos personalizados para Leads e Proprietários</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-slate-700">Campos Personalizados</h2>
          {!adding && (
            <Button size="sm" icon={<Plus size={14} />} onClick={() => setAdding(true)}>
              Adicionar Campo
            </Button>
          )}
        </div>

        {adding && (
          <div className="border border-[#1B4F72]/20 rounded-xl p-4 mb-4 bg-blue-50/30">
            <p className="text-sm font-medium text-slate-700 mb-3">Novo campo</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <FieldWrapper label="Nome do Campo">
                <Input
                  placeholder="Ex: Bairro"
                  value={newField.label}
                  onChange={e => setNewField(f => ({ ...f, label: e.target.value }))}
                />
              </FieldWrapper>
              <FieldWrapper label="Tipo">
                <Select value={newField.type} onChange={e => setNewField(f => ({ ...f, type: e.target.value as CustomField['type'] }))}>
                  <option value="text">Texto</option>
                  <option value="number">Número</option>
                  <option value="select">Lista de opções</option>
                </Select>
              </FieldWrapper>
              <FieldWrapper label="Módulo">
                <Select value={newField.module} onChange={e => setNewField(f => ({ ...f, module: e.target.value as CustomField['module'] }))}>
                  <option value="leads">Funil de Vendas</option>
                  <option value="owners">Proprietários</option>
                </Select>
              </FieldWrapper>
            </div>

            {newField.type === 'select' && (
              <div className="mb-3">
                <label className="text-xs font-medium text-slate-600 mb-1 block">Opções</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Adicionar opção..."
                    value={optionInput}
                    onChange={e => setOptionInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && optionInput.trim()) {
                        e.preventDefault()
                        setNewField(f => ({ ...f, options: [...(f.options || []), optionInput.trim()] }))
                        setOptionInput('')
                      }
                    }}
                  />
                  <Button size="sm" type="button" onClick={() => {
                    if (optionInput.trim()) {
                      setNewField(f => ({ ...f, options: [...(f.options || []), optionInput.trim()] }))
                      setOptionInput('')
                    }
                  }}>Adicionar</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newField.options?.map((opt, i) => (
                    <span key={i} className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded-full">
                      {opt}
                      <button type="button" onClick={() => setNewField(f => ({ ...f, options: f.options?.filter((_, j) => j !== i) }))}>
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button size="sm" icon={<Check size={14} />} onClick={handleSaveNew}>Salvar</Button>
              <Button size="sm" variant="secondary" onClick={() => { setAdding(false); setNewField(emptyField()) }}>Cancelar</Button>
            </div>
          </div>
        )}

        {customFields.length === 0 && !adding ? (
          <div className="text-center py-10 text-slate-400">
            <p className="text-sm">Nenhum campo personalizado criado.</p>
            <p className="text-xs mt-1">Clique em "Adicionar Campo" para começar.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {customFields.map(field => (
              <EditableFieldRow
                key={field.id}
                field={field}
                isEditing={editingId === field.id}
                onEdit={() => setEditingId(field.id)}
                onSave={(data) => handleSaveEdit(field.id, data)}
                onCancelEdit={() => setEditingId(null)}
                onDelete={() => setDeleteId(field.id)}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteCustomField(deleteId)}
        title="Excluir Campo"
        message="Tem certeza? Os dados deste campo serão perdidos nos registros existentes."
      />
    </div>
  )
}

function EditableFieldRow({
  field, isEditing, onEdit, onSave, onCancelEdit, onDelete
}: {
  field: CustomField
  isEditing: boolean
  onEdit: () => void
  onSave: (data: CustomField) => void
  onCancelEdit: () => void
  onDelete: () => void
}) {
  const [label, setLabel] = useState(field.label)

  if (isEditing) {
    return (
      <div className="py-3 flex items-center gap-3">
        <Input value={label} onChange={e => setLabel(e.target.value)} className="max-w-xs" />
        <button onClick={() => onSave({ ...field, label })} className="p-1.5 rounded-lg bg-[#1B4F72] text-white hover:bg-[#154060]">
          <Check size={14} />
        </button>
        <button onClick={onCancelEdit} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
          <X size={14} />
        </button>
      </div>
    )
  }

  return (
    <div className="py-3 flex items-center gap-3">
      <div className="flex-1">
        <span className="text-sm font-medium text-slate-700">{field.label}</span>
        <span className="ml-2 text-xs text-slate-400">
          {field.type === 'text' ? 'Texto' : field.type === 'number' ? 'Número' : 'Lista'} · {field.module === 'leads' ? 'Funil' : 'Proprietários'}
        </span>
      </div>
      <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#1B4F72]">
        <Pencil size={14} />
      </button>
      <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500">
        <Trash2 size={14} />
      </button>
    </div>
  )
}
