import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// As credenciais do Supabase são colocadas diretamente aqui para a hospedagem.
// A chave 'anon public' é segura para ser exposta no frontend.
const supabaseUrl = 'https://mnmwipvjjahwsihhjejq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ubXdpcHZqamFod3NpaGhqZWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNTI0MjYsImV4cCI6MjA3MTcyODQyNn0.FfUAGErhUFCt_Vh-9rYcwPOs4nkS5dEfAVmRpL8MwYw';

let supabase: SupabaseClient | null = null;
let supabaseInitializationError: string | null = null;

if (!supabaseUrl || !supabaseAnonKey) {
  // Esta verificação é mantida como uma salvaguarda, mas não deve acontecer agora.
  supabaseInitializationError = 'As credenciais do Supabase não estão definidas no arquivo supabaseClient.ts.';
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error: any) {
     supabaseInitializationError = `Ocorreu um erro ao inicializar o cliente Supabase: ${error.message}. Verifique se as credenciais estão corretas.`;
  }
}

export { supabase, supabaseInitializationError };