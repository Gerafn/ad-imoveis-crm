import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tfmavtkoslvmczpxntja.supabase.co'
const supabaseKey = 'sb_publishable_mtWwEFdInuCiqerqxc3hNg_LRz7goU7'

export const supabase = createClient(supabaseUrl, supabaseKey)
