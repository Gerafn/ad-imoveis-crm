import { useEffect } from 'react'

const SEED_KEY = 'crm_seed_loaded'

export function useSeedLoader() {
  useEffect(() => {
    // Only seed once and only if localStorage is completely empty
    if (localStorage.getItem(SEED_KEY)) return
    if (localStorage.getItem('crm_leads')) return

    fetch('/seed-data.json')
      .then(r => r.json())
      .then((data: Record<string, unknown>) => {
        Object.entries(data).forEach(([key, value]) => {
          localStorage.setItem(key, JSON.stringify(value))
        })
        localStorage.setItem(SEED_KEY, '1')
        // Reload to let stores pick up the data
        window.location.reload()
      })
      .catch(() => {
        // Seed not available, that's fine
      })
  }, [])
}
