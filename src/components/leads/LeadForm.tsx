import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Lead, CustomField } from '../../types'
import { LEAD_FASES, LEAD_MEIOS, LEAD_TIPOS, LEAD_TEMPERATURES } from '../../types'
import { FieldWrapper, Input, Select, Textarea } from '../ui/FormField'
import { Button } from '../ui/Button'

const TIPOS_PRESET = ['Venda', 'Aluguel', 'Aluguel e Venda']

const schema = z.object({
  data: z.string().min(1, 'Campo obrigatório'),
  nome: z.string().min(1, 'Campo obrigatório'),
  telefone: z.string().min(1, 'Campo obrigatório'),
  tipo: z.string().min(1, 'Campo obrigatório'),
  imovel: z.string().default(''),
  meio: z.enum(['Facebook', 'Instagram', 'Site', 'Indicação', 'Imobiliária']),
  valor: z.coerce.number().min(0).default(0),
  fase: z.enum(['Contato', 'Qualificação', 'Agendamento', 'Visita', 'Negociação', 'Proposta Comercial', 'Contrato']),
  temperatura: z.enum(['Frio', 'Morno', 'Quente']),
  observacoes: z.string().default(''),
})

type FormData = z.infer<typeof schema>

interface LeadFormProps {
  initial?: Lead
  customFields?: CustomField[]
  onSubmit: (data: Omit<Lead, 'id' | 'createdAt'>) => void
  onCancel: () => void
}

export function LeadForm({ initial, customFields = [], onSubmit, onCancel }: LeadFormProps) {
  const initialTipo = initial?.tipo ?? 'Venda'
  const isOutro = initial ? !TIPOS_PRESET.includes(initial.tipo) : false

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormData>({
    resolver: zodResolver(schema) as never,
    defaultValues: initial
      ? {
          data: initial.data,
          nome: initial.nome,
          telefone: initial.telefone,
          tipo: isOutro ? 'Outro' : initialTipo,
          imovel: initial.imovel,
          meio: initial.meio,
          valor: initial.valor,
          fase: initial.fase,
          temperatura: initial.temperatura,
          observacoes: initial.observacoes,
        }
      : {
          data: new Date().toISOString().split('T')[0],
          tipo: 'Venda',
          meio: 'Facebook' as const,
          fase: 'Contato' as const,
          temperatura: 'Frio' as const,
          valor: 0,
          imovel: '',
          observacoes: '',
        },
  })

  const [tipoSelecionado, setTipoSelecionado] = useState<string>(isOutro ? 'Outro' : initialTipo)
  const [tipoCustom, setTipoCustom] = useState(isOutro ? initialTipo : '')
  const [customValues, setCustomValues] = useState<Record<string, string>>(initial?.customFields || {})

  const handleFormSubmit = (data: FormData) => {
    const tipoFinal = data.tipo === 'Outro' ? tipoCustom : data.tipo
    onSubmit({ ...data, tipo: tipoFinal, customFields: customValues })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit as never)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldWrapper label="Data" error={errors.data?.message} required>
          <Input type="date" {...register('data')} />
        </FieldWrapper>
        <FieldWrapper label="Nome do Cliente" error={errors.nome?.message} required>
          <Input placeholder="Ex: João Silva" {...register('nome')} />
        </FieldWrapper>
        <FieldWrapper label="Telefone" error={errors.telefone?.message} required>
          <Input placeholder="(11) 99999-9999" {...register('telefone')} />
        </FieldWrapper>
        <FieldWrapper label="Tipo" error={tipoSelecionado === 'Outro' && !tipoCustom ? 'Campo obrigatório' : undefined} required>
          <Select {...register('tipo')} onChange={e => { setValue('tipo', e.target.value); setTipoSelecionado(e.target.value); if (e.target.value !== 'Outro') setTipoCustom('') }}>
            {LEAD_TIPOS.map(t => <option key={t}>{t}</option>)}
          </Select>
          {tipoSelecionado === 'Outro' && (
            <Input
              className="mt-2"
              placeholder="Descreva o tipo..."
              value={tipoCustom}
              onChange={e => setTipoCustom(e.target.value)}
            />
          )}
        </FieldWrapper>
        <FieldWrapper label="Imóvel de Interesse">
          <Input placeholder="Ex: Apartamento 2 quartos" {...register('imovel')} />
        </FieldWrapper>
        <FieldWrapper label="Meio de Contato" required>
          <Select {...register('meio')}>
            {LEAD_MEIOS.map(m => <option key={m}>{m}</option>)}
          </Select>
        </FieldWrapper>
        <FieldWrapper label="Valor (R$)">
          <Input type="number" min={0} step={1000} {...register('valor')} />
        </FieldWrapper>
        <FieldWrapper label="Fase do Funil" required>
          <Select {...register('fase')}>
            {LEAD_FASES.map(f => <option key={f}>{f}</option>)}
          </Select>
        </FieldWrapper>
        <FieldWrapper label="Temperatura" required>
          <Select {...register('temperatura')}>
            {LEAD_TEMPERATURES.map(t => <option key={t}>{t}</option>)}
          </Select>
        </FieldWrapper>
      </div>

      <FieldWrapper label="Observações">
        <Textarea rows={3} placeholder="Notas sobre o lead..." {...register('observacoes')} />
      </FieldWrapper>

      {customFields.filter(f => f.module === 'leads').map(field => (
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
        <Button type="submit">{initial ? 'Salvar Alterações' : 'Criar Lead'}</Button>
      </div>
    </form>
  )
}
