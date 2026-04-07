import { useMemo } from 'react'
import { Users, TrendingUp, Home, Flame } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell
} from 'recharts'
import { useLeadStore, useSettingsStore } from '../store'
import { KPICard } from '../components/dashboard/KPICard'
import { GoalProgress } from '../components/dashboard/GoalProgress'
import { formatCurrency, getCurrentMonthRange } from '../utils'
import { LEAD_FASES, LEAD_MEIOS } from '../types'

export function Dashboard() {
  const { leads } = useLeadStore()
  const { goals } = useSettingsStore()
  const { start, end } = getCurrentMonthRange()

  const thisMonthLeads = useMemo(() => leads.filter(l => {
    const d = new Date(l.data)
    return d >= start && d <= end
  }), [leads, start, end])

  const closedSales = useMemo(() =>
    leads.filter(l => l.fase === 'Contrato' && (l.tipo === 'Venda' || l.tipo === 'Venda e Aluguel')),
    [leads])

  const closedRentals = useMemo(() =>
    leads.filter(l => l.fase === 'Contrato' && (l.tipo === 'Aluguel' || l.tipo === 'Venda e Aluguel')),
    [leads])

  const totalVendas = closedSales.reduce((s, l) => s + l.valor, 0)
  const totalAlugueis = closedRentals.reduce((s, l) => s + l.valor, 0)
  const hotLeads = leads.filter(l => l.temperatura === 'Quente').length

  const funnelData = LEAD_FASES.map(fase => ({
    name: fase === 'Proposta Comercial' ? 'Proposta' : fase,
    total: leads.filter(l => l.fase === fase).length,
  }))

  const channelData = LEAD_MEIOS.map(meio => ({
    name: meio,
    total: leads.filter(l => l.meio === meio).length,
  })).filter(d => d.total > 0).sort((a, b) => b.total - a.total)

  const monthSales = thisMonthLeads.filter(l => l.fase === 'Contrato' && l.tipo !== 'Aluguel').reduce((s, l) => s + l.valor, 0)
  const monthRentals = thisMonthLeads.filter(l => l.fase === 'Contrato' && l.tipo !== 'Venda').reduce((s, l) => s + l.valor, 0)

  const faseColors = ['#94a3b8', '#60a5fa', '#818cf8', '#c084fc', '#facc15', '#fb923c', '#22c55e']

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Visão geral do CRM — AD Imóveis</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <KPICard
          title="Total Vendas Fechadas"
          value={formatCurrency(totalVendas)}
          subtitle={`${closedSales.length} contratos`}
          icon={<TrendingUp size={22} />}
          color="blue"
        />
        <KPICard
          title="Total Aluguéis"
          value={formatCurrency(totalAlugueis)}
          subtitle={`${closedRentals.length} contratos`}
          icon={<Home size={22} />}
          color="green"
        />
        <KPICard
          title="Total de Leads"
          value={leads.length.toString()}
          subtitle={`${thisMonthLeads.length} este mês`}
          icon={<Users size={22} />}
          color="orange"
        />
        <KPICard
          title="Leads Quentes"
          value={hotLeads.toString()}
          subtitle="Temperatura Quente"
          icon={<Flame size={22} />}
          color="red"
          href="/leads?temp=Quente"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Funnel chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="font-semibold text-slate-700 mb-4">Leads por Fase do Funil</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={funnelData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                formatter={(v) => [v, 'Leads']}
              />
              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                {funnelData.map((_, i) => <Cell key={i} fill={faseColors[i % faseColors.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Channel chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="font-semibold text-slate-700 mb-4">Canal de Aquisição</h2>
          {channelData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">Sem dados</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={channelData} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#94a3b8' }} width={80} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Bar dataKey="total" fill="#1B4F72" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Goals */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 className="font-semibold text-slate-700 mb-5">Performance vs. Metas do Mês</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GoalProgress
            label="Meta de Venda"
            current={monthSales}
            goal={goals.vendaMensal}
            color="#1B4F72"
          />
          <GoalProgress
            label="Meta de Aluguel"
            current={monthRentals}
            goal={goals.aluguelMensal}
            color="#F39C12"
          />
        </div>
        {goals.vendaMensal === 0 && goals.aluguelMensal === 0 && (
          <p className="text-xs text-slate-400 mt-4 text-center">
            Configure suas metas mensais em <a href="/metas" className="text-[#1B4F72] underline">Metas</a>
          </p>
        )}
      </div>
    </div>
  )
}
