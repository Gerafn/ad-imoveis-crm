import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Owner, CustomField } from '../../types'
import { OWNER_TIPOS, OWNER_NEGOCIOS } from '../../types'
import { FieldWrapper, Input, Select, Textarea, Toggle } from '../ui/FormField'
import { Button } from '../ui/Button'

const schema = z.object({
  data: z.string().min(1, 'Campo obrigatório'),
  nome: z.string().min(1, 'Campo obrigatório'),
  telefone: z.string().min(1, 'Campo obrigatório'),
  tipo: z.enum(['Casa', 'Apartamento', 'Terreno', 'Sala Comercial', 'Investidor']),
  negocio: z.enum(['Venda', 'Aluguel', 'Avaliar para Venda', 'Venda e Aluguel']),
  endereco: z.string().default(''),
  captacao: z.string().default(''),
})

type FormData = z.infer<typeof schema>

interface OwnerFormProps {
  initial?: Owner
  customFields?: CustomField[]
  onSubmit: (data: Omit<Owner, 'id' | 'createdAt'>) => void
  onCancel: () => void
}

export function OwnerForm({ initial, customFields = [], onSubmit, onCancel }: OwnerFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as never,
    defaultValues: initial
      ? {
          data: initial.data,
          nome: initial.nome,
          telefone: initial.telefone,
          tipo: initial.tipo,
          negocio: initial.negocio,
          endereco: initial.endereco,
          captacao: initial.captacao,
        }
      : {
          data: new Date().toISOString().split('T')[0],
          tipo: 'Casa' as const,
          negocio: 'Venda' as const,
          endereco: '',
          captacao: '',
        },
  })

  const [escritura, setEscritura] = useState(initial?.escritura ?? false)
  const [exclusividade, setExclusividade] = useState(initial?.exclusividade ?? false)
  const [customValues, setCustomValues] = useState<Record<string, string>>(initial?.customFields || {})

  const handleFormSubmit = (data: FormData) => {
    onSubmit({ ...data, escritura, exclusividade, customFields: customValues })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit as never)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldWrapper label="Data" error={errors.data?.message} required>
          <Input type="date" {...register('data')} />
        </FieldWrapper>
        <FieldWrapper label="Nome do Proprietário" error={errors.nome?.message} required>
          <Input placeholder="Ex: Maria Oliveira" {...register('nome')} />
        </FieldWrapper>
        <FieldWrapper label="Telefone" error={errors.telefone?.message} required>
          <Input placeholder="(11) 99999-9999" {...register('telefone')} />
        </FieldWrapper>
        <FieldWrapper label="Tipo de Imóvel" required>
          <Select {...register('tipo')}>
            {OWNER_TIPOS.map(t => <option key={t}>{t}</option>)}
          </Select>
        </FieldWrapper>
        <FieldWrapper label="Negócio" required>
          <Select {...register('negocio')}>
            {OWNER_NEGOCIOS.map(n => <option key={n}>{n}</option>)}
          </Select>
        </FieldWrapper>
      </div>

      <FieldWrapper label="Endereço Completo">
        <Input placeholder="Rua, número, bairro, cidade..." {...register('endereco')} />
      </FieldWrapper>

      <div className="flex gap-6 flex-wrap">
        <Toggle checked={escritura} onChange={setEscritura} label="Possui Escritura" />
        <Toggle checked={exclusividade} onChange={setExclusividade} label="Exclusividade" />
      </div>

      <FieldWrapper label="Captação / Observações">
        <Textarea rows={3} placeholder="Detalhes sobre captação..." {...register('captacao')} />
      </FieldWrapper>

      {customFields.filter(f => f.module === 'owners').map(field => (
        <FieldWrapper key={field.id} label={field.label}>
          {field.type === 'select' ? (
            <Select value={customValues[field.id] || ''} onChange={e => setCustomValues(p => ({ ...p, [field.id]: e.target.value }))}>
              <option value="">Selecione...</option>
              {field.options?.map(o => <option key={o}>{o}</option>)}
            </Select>
          ) : (
            <Input
              type={field.type}
              value={customValues[field.id] || ''}
              onChange={e => setCustomValues(p => ({ ...p, [field.id]: e.target.value }))}
            />
          )}
        </FieldWrapper>
      ))}

      <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">{initial ? 'Salvar Alterações' : 'Criar Proprietário'}</Button>
      </div>
    </form>
  )
}
