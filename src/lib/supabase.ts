import { createClient } from '@supabase/supabase-js';

// Usando as variáveis de ambiente do Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug para verificar se as variáveis de ambiente estão sendo carregadas corretamente
if (!supabaseUrl || !supabaseKey) {
  console.error(
    'Variáveis de ambiente do Supabase não encontradas. Verifique se o arquivo .env está configurado corretamente.',
    { supabaseUrl: supabaseUrl ? 'OK' : 'MISSING', supabaseKey: supabaseKey ? 'OK' : 'MISSING' }
  );
}

// Criar cliente do Supabase com opções adicionais
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
});

// Definição dos tipos correspondentes às tabelas do Supabase
export interface MeetingDB {
  id: number;
  title: string;
  date: string;
  time: string;
  zoom_link: string;
  access_code: string;
  professor: string;
  theme: string;
  duration: number;
  created_at: string;
}

export interface AuthorizedEmailDB {
  id: number;
  meeting_id: number;
  email: string;
  created_at: string;
}

// Funções para manipular reuniões
export async function fetchMeetings() {
  const { data, error } = await supabase
    .from('meetings')
    .select('*');
  
  if (error) {
    console.error('Erro ao buscar reuniões:', error);
    return [];
  }
  
  return data || [];
}

export async function fetchMeetingByAccessCode(accessCode: string) {
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('access_code', accessCode)
    .single();
  
  if (error) {
    console.error('Erro ao buscar reunião pelo código de acesso:', error);
    return null;
  }
  
  return data;
}

export async function createMeeting(meeting: Omit<MeetingDB, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('meetings')
    .insert([meeting])
    .select();
  
  if (error) {
    console.error('Erro ao criar reunião:', error);
    return null;
  }
  
  return data?.[0] || null;
}

export async function updateMeeting(meeting: Omit<MeetingDB, 'created_at'>) {
  const { data, error } = await supabase
    .from('meetings')
    .update({
      title: meeting.title,
      date: meeting.date,
      time: meeting.time,
      zoom_link: meeting.zoom_link,
      professor: meeting.professor,
      theme: meeting.theme,
      duration: meeting.duration
      // Não atualizamos o access_code para preservar os links existentes
    })
    .eq('id', meeting.id)
    .select();
  
  if (error) {
    console.error('Erro ao atualizar reunião:', error);
    return null;
  }
  
  return data?.[0] || null;
}

export async function deleteMeeting(id: number) {
  // Primeiro deletamos os emails autorizados associados à reunião
  await supabase
    .from('authorized_emails')
    .delete()
    .eq('meeting_id', id);
  
  // Depois deletamos a reunião
  const { error } = await supabase
    .from('meetings')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Erro ao deletar reunião:', error);
    return false;
  }
  
  return true;
}

export async function deleteAuthorizedEmails(meetingId: number) {
  const { error } = await supabase
    .from('authorized_emails')
    .delete()
    .eq('meeting_id', meetingId);
  
  if (error) {
    console.error('Erro ao deletar emails autorizados:', error);
    return false;
  }
  
  return true;
}

// Funções para manipular emails autorizados
export async function fetchAuthorizedEmails(meetingId: number) {
  const { data, error } = await supabase
    .from('authorized_emails')
    .select('*')
    .eq('meeting_id', meetingId);
  
  if (error) {
    console.error('Erro ao buscar emails autorizados:', error);
    return [];
  }
  
  return data || [];
}

export async function createAuthorizedEmails(meetingId: number, emails: string[]) {
  const emailsToInsert = emails.map(email => ({
    meeting_id: meetingId,
    email: email.toLowerCase().trim()
  }));
  
  const { error } = await supabase
    .from('authorized_emails')
    .insert(emailsToInsert);
  
  if (error) {
    console.error('Erro ao criar emails autorizados:', error);
    return false;
  }
  
  return true;
}

export async function isEmailAuthorized(meetingId: number, email: string) {
  const { data, error } = await supabase
    .from('authorized_emails')
    .select('*')
    .eq('meeting_id', meetingId)
    .eq('email', email.toLowerCase().trim())
    .single();
  
  if (error) {
    return false;
  }
  
  return !!data;
}

// Função para converter dados do DB para o formato da aplicação
export function convertDbMeetingToAppMeeting(
  meetingDb: MeetingDB, 
  authorizedEmails: AuthorizedEmailDB[]
) {
  return {
    id: meetingDb.id,
    title: meetingDb.title,
    date: meetingDb.date,
    time: meetingDb.time,
    zoomLink: meetingDb.zoom_link,
    accessCode: meetingDb.access_code,
    professor: meetingDb.professor,
    theme: meetingDb.theme,
    duration: meetingDb.duration,
    authorizedEmails: authorizedEmails.map(ae => ae.email)
  };
} 