import { chromium } from 'playwright'
import { readFileSync } from 'fs'

// Load seed data generated from xlsx
const seedData = JSON.parse(
  readFileSync('/Users/geraldofalk/Documents/claude/ad-imoveis-crm/public/seed-data.json', 'utf-8')
)

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()

await page.goto('http://localhost:5173')

// Write all data directly to localStorage
await page.evaluate((data) => {
  localStorage.setItem('crm_leads', JSON.stringify(data.crm_leads))
  localStorage.setItem('crm_owners', JSON.stringify(data.crm_owners))
  localStorage.setItem('crm_goals', JSON.stringify(data.crm_goals))
  localStorage.setItem('crm_seed_loaded', '1')
}, seedData)

// Verify
const result = await page.evaluate(() => ({
  leads: JSON.parse(localStorage.getItem('crm_leads') || '[]').length,
  owners: JSON.parse(localStorage.getItem('crm_owners') || '[]').length,
  goals: JSON.parse(localStorage.getItem('crm_goals') || '{}'),
}))

console.log('✅ Dados gravados no localStorage:')
console.log(`   Leads: ${result.leads}`)
console.log(`   Proprietários: ${result.owners}`)
console.log(`   Meta Venda: R$ ${result.goals.vendaMensal}`)
console.log(`   Meta Aluguel: R$ ${result.goals.aluguelMensal}`)

await browser.close()
console.log('\nAbra http://localhost:5173 no navegador — os dados já estão lá!')
