import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { read, utils } from 'xlsx'
import { randomUUID } from 'crypto'

const filePath = `${process.env.HOME}/Downloads/CRM AD IMOVEIS 3.2.xlsx`
const wb = read(readFileSync(filePath), { type: 'buffer', cellDates: true, raw: false })

// ─── Normalizers ────────────────────────────────────────────────────────────

function normalizeDate(raw) {
  if (!raw) return new Date().toISOString().split('T')[0]
  // Already ISO string from cellDates
  if (typeof raw === 'string' && raw.includes('T')) {
    return raw.split('T')[0]
  }
  // Year-only value like "2024"
  if (String(raw).match(/^\d{4}$/)) {
    return `${raw}-01-01`
  }
  // Try parsing
  const d = new Date(raw)
  if (!isNaN(d)) return d.toISOString().split('T')[0]
  return new Date().toISOString().split('T')[0]
}

function normalizeTipo(v) {
  if (!v) return 'Venda'
  const s = v.toString().trim().toLowerCase()
  if (s.includes('venda') && s.includes('aluguel')) return 'Venda e Aluguel'
  if (s.includes('aluguel') && s.includes('venda')) return 'Venda e Aluguel'
  if (s.includes('aluguel')) return 'Aluguel'
  if (s.includes('venda')) return 'Venda'
  if (s.includes('investidor')) return 'Venda'
  return 'Venda'
}

function normalizeMeio(v) {
  if (!v) return 'Indicação'
  const s = v.toString().trim().toLowerCase()
  if (s.includes('facebook')) return 'Facebook'
  if (s.includes('instagram')) return 'Instagram'
  if (s.includes('site')) return 'Site'
  if (s.includes('indicação') || s.includes('indicacao')) return 'Indicação'
  if (s.includes('imobiliária') || s.includes('imobiliaria')) return 'Imobiliária'
  // Other values → Indicação as catch-all
  return 'Indicação'
}

function normalizeFase(v) {
  const valid = ['Contato', 'Qualificação', 'Agendamento', 'Visita', 'Negociação', 'Proposta Comercial', 'Contrato']
  if (!v) return 'Contato'
  const s = v.toString().trim()
  const match = valid.find(f => f.toLowerCase() === s.toLowerCase())
  return match || 'Contato'
}

function normalizeTemp(v) {
  const valid = ['Frio', 'Morno', 'Quente']
  if (!v) return 'Frio'
  const s = v.toString().trim()
  const match = valid.find(t => t.toLowerCase() === s.toLowerCase())
  return match || 'Frio'
}

function normalizeBool(v) {
  if (!v) return false
  return v.toString().trim().toLowerCase() === 'sim'
}

function normalizeOwnerTipo(v) {
  const valid = ['Casa', 'Apartamento', 'Terreno', 'Sala Comercial', 'Investidor']
  if (!v) return 'Casa'
  const s = v.toString().trim()
  const match = valid.find(t => t.toLowerCase() === s.toLowerCase())
  return match || 'Casa'
}

function normalizeOwnerNegocio(v) {
  if (!v) return 'Venda'
  const s = v.toString().trim().toLowerCase()
  if (s.includes('venda') && s.includes('aluguel')) return 'Venda e Aluguel'
  if (s.includes('avaliar')) return 'Avaliar para Venda'
  if (s.includes('aluguel')) return 'Aluguel'
  if (s.includes('venda')) return 'Venda'
  return 'Venda'
}

// ─── Parse Leads ─────────────────────────────────────────────────────────────

const leadWs = wb.Sheets['Funil de Vendas']
const leadRows = utils.sheet_to_json(leadWs, { header: 1, defval: '', raw: false })
const leadData = leadRows
  .filter((r, i) => i > 0 && r[1] && r[1].toString().trim() !== '' && r[1] !== 'Nome do Cliente')
  .map(r => ({
    id: randomUUID(),
    data: normalizeDate(r[0]),
    nome: r[1].toString().trim(),
    telefone: (r[2] || '').toString().trim(),
    tipo: normalizeTipo(r[3]),
    imovel: (r[4] || '').toString().trim(),
    meio: normalizeMeio(r[5]),
    valor: parseFloat((r[6] || '0').toString().replace(/[^\d.,]/g, '').replace(',', '.')) || 0,
    fase: normalizeFase(r[7]),
    temperatura: normalizeTemp(r[8]),
    observacoes: '',
    customFields: {},
    createdAt: new Date().toISOString(),
  }))

console.log(`✅ Leads processados: ${leadData.length}`)

// ─── Parse Proprietários ─────────────────────────────────────────────────────

const ownerWs = wb.Sheets['Proprietários']
const ownerRows = utils.sheet_to_json(ownerWs, { header: 1, defval: '', raw: false })
const ownerData = ownerRows
  .filter((r, i) => i > 0 && r[1] && r[1].toString().trim() !== '' && r[1] !== 'Nome Proprietário')
  .map(r => ({
    id: randomUUID(),
    data: normalizeDate(r[0]),
    nome: r[1].toString().trim(),
    telefone: (r[2] || '').toString().trim(),
    tipo: normalizeOwnerTipo(r[3]),
    negocio: normalizeOwnerNegocio(r[4]),
    escritura: normalizeBool(r[5]),
    endereco: (r[6] || '').toString().trim(),
    exclusividade: normalizeBool(r[7]),
    captacao: (r[8] || '').toString().trim(),
    customFields: {},
    createdAt: new Date().toISOString(),
  }))

console.log(`✅ Proprietários processados: ${ownerData.length}`)

// ─── Parse Metas ─────────────────────────────────────────────────────────────

const metaWs = wb.Sheets['Config Metas']
const metaRows = utils.sheet_to_json(metaWs, { header: 1, defval: '', raw: false })
const vendaRow = metaRows.find(r => r[0] && r[0].toString().includes('VENDA'))
const aluguelRow = metaRows.find(r => r[0] && r[0].toString().includes('ALUGUEL'))
const goals = {
  vendaMensal: parseFloat((vendaRow?.[1] || '0').toString()) || 0,
  aluguelMensal: parseFloat((aluguelRow?.[1] || '0').toString()) || 0,
}
console.log(`✅ Metas: Venda R$ ${goals.vendaMensal}, Aluguel R$ ${goals.aluguelMensal}`)

// ─── Write to public/seed-data.json ──────────────────────────────────────────

mkdirSync('/Users/geraldofalk/Documents/claude/ad-imoveis-crm/public', { recursive: true })
const seedData = {
  crm_leads: leadData,
  crm_owners: ownerData,
  crm_goals: goals,
}
writeFileSync(
  '/Users/geraldofalk/Documents/claude/ad-imoveis-crm/public/seed-data.json',
  JSON.stringify(seedData, null, 2)
)
console.log('\n✅ Arquivo gerado: public/seed-data.json')
console.log(`   Total leads: ${leadData.length}`)
console.log(`   Total proprietários: ${ownerData.length}`)
