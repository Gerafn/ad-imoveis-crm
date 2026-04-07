import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSettingsStore } from '../store'
import { FieldWrapper, Input } from '../components/ui/FormField'
import { Button } from '../components/ui/Button'
import { formatCurrency } from '../utils'
import { CheckCircle } from 'lucide-react'

const schema = z.object({
  vendaMensal: z.coerce.number().min(0),
  aluguelMensal: z.coerce.number().min(0),
})

type FormData = z.infer<typeof schema>

export function Metas() {
  const { goals, saveGoals } = useSettingsStore()
  const [saved, setSaved] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as never,
    defaultValues: {
      vendaMensal: goals.vendaMensal,
      aluguelMensal: goals.aluguelMensal,
    },
  })

  const onSubmit = (data: FormData) => {
    saveGoals({ vendaMensal: Number(data.vendaMensal), aluguelMensal: Number(data.aluguelMensal) })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Configurar Metas</h1>
        <p className="text-slate-500 text-sm mt-1">Defina as metas mensais de venda e aluguel</p>
      </div>

      <div className="max-w-md bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <form onSubmit={handleSubmit(onSubmit as never)} className="space-y-5">
          <FieldWrapper label="Meta de Venda Mensal (R$)" error={errors.vendaMensal?.message}>
            <Input type="number" min={0} step={10000} placeholder="Ex: 500000" {...register('vendaMensal')} />
          </FieldWrapper>
          <FieldWrapper label="Meta de Aluguel Mensal (R$)" error={errors.aluguelMensal?.message}>
            <Input type="number" min={0} step={1000} placeholder="Ex: 50000" {...register('aluguelMensal')} />
          </FieldWrapper>

          <div className="pt-2 border-t border-slate-100">
            {(goals.vendaMensal > 0 || goals.aluguelMensal > 0) && (
              <div className="mb-4 bg-slate-50 rounded-xl p-4 text-sm text-slate-600">
                <p className="font-medium text-slate-700 mb-2">Metas atuais:</p>
                <p>Venda: <span className="font-semibold text-[#1B4F72]">{formatCurrency(goals.vendaMensal)}</span></p>
                <p>Aluguel: <span className="font-semibold text-[#F39C12]">{formatCurrency(goals.aluguelMensal)}</span></p>
              </div>
            )}

            <Button type="submit" className="w-full justify-center">
              {saved ? (
                <><CheckCircle size={16} /> Salvo com sucesso!</>
              ) : 'Salvar Metas'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
