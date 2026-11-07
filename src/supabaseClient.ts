import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://gigdobucdtfbtkzlpxrp.supabase.co'

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpZ2RvYnVjZHRmYnRremxweHJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM5NjI5MzUsImV4cCI6MjEwOTUzODkzNX0.j1qLMpG-W_jE9CiN0QRca1r0RgKRcYdqiBJ2PPIq4ts'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)


