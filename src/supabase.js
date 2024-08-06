import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lukiiogtnrhqfocmrkye.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1a2lpb2d0bnJocWZvY21ya3llIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI5MTIzMjEsImV4cCI6MjAzODQ4ODMyMX0.pyGg0x8N2qGaQSAQIkAmk7Un6ZOKH6YYeP2K0hyPVUw'
export const supabase = createClient(supabaseUrl, supabaseKey)
