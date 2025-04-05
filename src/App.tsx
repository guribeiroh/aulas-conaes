import React, { useState, useEffect } from 'react';
import { Mail, Phone, Lock, Users, Calendar, Clock, Video, LogOut, Loader } from 'lucide-react';
import AdminPanel from './components/AdminPanel';
import AuthForm from './components/AuthForm';
import ClassAccess from './components/ClassAccess';
import Header from './components/Header';
import { 
  fetchMeetings, 
  fetchMeetingByAccessCode, 
  fetchAuthorizedEmails, 
  convertDbMeetingToAppMeeting 
} from './lib/supabase';
import { theme } from './styles/theme';

// Interface para reuniões
interface Meeting {
  id: number;
  title: string;
  date: string;
  time: string;
  zoomLink: string;
  authorizedEmails: string[];
  accessCode: string;
  professor: string;
  theme: string;
  duration: number;
}

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [accessCode, setAccessCode] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState<Meeting | null>(null);
  const [connectionError, setConnectionError] = useState(false);

  // Carregar as reuniões do Supabase
  useEffect(() => {
    async function loadMeetings() {
      if (!isAuthenticated || !isAdmin) return;
      
      setLoading(true);
      setConnectionError(false);
      
      // Adicionar um timeout para evitar carregamento infinito
      const timeoutId = setTimeout(() => {
        setLoading(false);
        setConnectionError(true);
      }, 10000); // 10 segundos de timeout
      
      try {
        const meetingsData = await fetchMeetings();
        const meetingsWithEmails: Meeting[] = [];

        for (const meeting of meetingsData) {
          const authorizedEmails = await fetchAuthorizedEmails(meeting.id);
          meetingsWithEmails.push(convertDbMeetingToAppMeeting(meeting, authorizedEmails));
        }

        setMeetings(meetingsWithEmails);
        clearTimeout(timeoutId);
      } catch (error) {
        console.error('Erro ao carregar reuniões:', error);
        setConnectionError(true);
      } finally {
        setLoading(false);
        clearTimeout(timeoutId);
      }
    }

    // Carregar reuniões apenas quando estiver autenticado como admin
    if (isAuthenticated && isAdmin) {
      loadMeetings();
    }
  }, [isAuthenticated, isAdmin]);

  // Check if there's an access code in the URL
  useEffect(() => {
    async function loadMeetingByAccessCode(code: string) {
      setLoading(true);
      setConnectionError(false);
      
      // Adicionar um timeout para evitar carregamento infinito
      const timeoutId = setTimeout(() => {
        setLoading(false);
        setConnectionError(true);
      }, 10000); // 10 segundos de timeout
      
      try {
        const meetingData = await fetchMeetingByAccessCode(code);
        
        if (meetingData) {
          const authorizedEmails = await fetchAuthorizedEmails(meetingData.id);
          const meeting = convertDbMeetingToAppMeeting(meetingData, authorizedEmails);
          setCurrentMeeting(meeting);
        } else {
          setCurrentMeeting(null);
        }
        clearTimeout(timeoutId);
      } catch (error) {
        console.error('Erro ao carregar reunião pelo código de acesso:', error);
        setCurrentMeeting(null);
        setConnectionError(true);
      } finally {
        setLoading(false);
        clearTimeout(timeoutId);
      }
    }

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      setAccessCode(code);
      loadMeetingByAccessCode(code);
    } else {
      // Se não tem código, não devemos mostrar loading
      setLoading(false);
    }
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '@conaes') {
      setIsAuthenticated(true);
      setIsAdmin(true); // Automatically go to admin panel when password is correct
    } else {
      setError('Senha incorreta. Tente novamente.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    setError('');
    setMeetings([]);
  };

  const updateMeetings = (newMeetings: Meeting[]) => {
    setMeetings(newMeetings);
  };

  // Componente de loading modernizado
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" 
           style={{ backgroundColor: theme.colors.background.dark }}>
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 bg-opacity-80 backdrop-blur-sm p-8 rounded-xl">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-b-transparent" 
                   style={{ borderColor: `${theme.colors.primary.light}40`, 
                            borderTopColor: 'transparent', 
                            borderBottomColor: 'transparent' }}>
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-b-transparent animate-spin" 
                   style={{ borderColor: theme.colors.primary.DEFAULT, 
                            borderTopColor: 'transparent', 
                            borderBottomColor: 'transparent' }}>
              </div>
            </div>
            <p className="text-xl font-medium mt-2" style={{ color: theme.colors.text.primary }}>
              Carregando...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Componente de erro de conexão modernizado
  if (connectionError) {
    return (
      <div className="min-h-screen flex flex-col" 
           style={{ backgroundColor: theme.colors.background.dark }}>
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md w-full bg-opacity-90 backdrop-blur-sm p-8 rounded-xl shadow-lg"
               style={{ backgroundColor: theme.colors.background.DEFAULT }}>
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-5 rounded-full" 
                 style={{ backgroundColor: `${theme.colors.state.error}30` }}>
              <div className="w-10 h-10 text-red-500 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12"></path>
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-center mb-4" 
                style={{ color: theme.colors.state.error }}>
              Erro de Conexão
            </h2>
            <p className="text-center mb-8" style={{ color: theme.colors.text.secondary }}>
              Não foi possível conectar ao servidor do Supabase. Verifique sua conexão com a internet e se o 
              Supabase está configurado corretamente.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 px-6 font-medium transition-all rounded-lg flex items-center justify-center gap-2"
                style={{ 
                  backgroundColor: theme.colors.primary.DEFAULT, 
                  color: theme.colors.text.primary,
                  boxShadow: theme.shadow.DEFAULT
                }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = theme.colors.primary.hover}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = theme.colors.primary.DEFAULT}
              >
                <Loader size={18} />
                <span>Tentar Novamente</span>
              </button>
              
              {accessCode && (
                <button
                  onClick={() => {
                    setAccessCode(null);
                    setConnectionError(false);
                    window.history.pushState({}, '', '/');
                  }}
                  className="w-full py-3 px-6 font-medium transition-all rounded-lg flex items-center justify-center gap-2"
                  style={{ 
                    backgroundColor: theme.colors.background.light, 
                    color: theme.colors.text.primary,
                    boxShadow: theme.shadow.sm
                  }}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = theme.colors.background.input}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = theme.colors.background.light}
                >
                  <span>Voltar para Tela Inicial</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (accessCode) {
    // Usando o meeting que já foi carregado do Supabase
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: theme.colors.background.dark }}>
        <Header />
        <div className="flex-1">
          <ClassAccess accessCode={accessCode} meeting={currentMeeting || undefined} />
        </div>
      </div>
    );
  }

  // Tela de login modernizada
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col" 
           style={{ backgroundColor: theme.colors.background.dark }}>
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md w-full backdrop-blur-sm rounded-xl overflow-hidden shadow-xl" 
               style={{ backgroundColor: theme.colors.background.DEFAULT }}>
            <div className="p-8 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400 to-green-700 opacity-10 rounded-bl-full"></div>
              
              <h2 className="text-2xl font-bold mb-1.5" 
                  style={{ color: theme.colors.primary.light }}>
                Acesso ao Sistema
              </h2>
              <p className="mb-8" style={{ color: theme.colors.text.muted }}>
                Digite a senha para acessar o painel de administração
              </p>
              
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-green-500">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    className="w-full py-3 pl-11 pr-4 rounded-lg border border-gray-700 bg-gray-900 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Senha de acesso"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ 
                      backgroundColor: theme.colors.background.input,
                      borderColor: `${theme.colors.text.muted}50`
                    }}
                  />
                </div>
                
                {error && (
                  <div className="p-3 rounded-lg text-sm" 
                       style={{ backgroundColor: `${theme.colors.state.error}20`, color: theme.colors.state.error }}>
                    {error}
                  </div>
                )}
                
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center"
                  style={{ 
                    backgroundColor: theme.colors.primary.DEFAULT, 
                    color: theme.colors.text.primary,
                    boxShadow: theme.shadow.sm
                  }}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = theme.colors.primary.hover}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = theme.colors.primary.DEFAULT}
                >
                  Acessar Sistema
                </button>
              </form>
              
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-400 to-green-700 opacity-10 rounded-tr-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Painel principal com AdminPanel ou AuthForm
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: theme.colors.background.dark, color: theme.colors.text.primary }}>
      <Header />
      <div className="flex-1">
        {isAdmin ? (
          <AdminPanel meetings={meetings} updateMeetings={updateMeetings} />
        ) : (
          <AuthForm />
        )}
      </div>
      
      {/* Botão de logout modernizado */}
      <button 
        onClick={handleLogout}
        className="fixed bottom-6 right-6 p-3 rounded-full transition-all flex items-center gap-2 shadow-lg"
        style={{ 
          backgroundColor: theme.colors.primary.DEFAULT,
          boxShadow: theme.shadow.md
        }}
        onMouseOver={e => {
          e.currentTarget.style.backgroundColor = theme.colors.primary.hover;
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = theme.colors.primary.DEFAULT;
          e.currentTarget.style.transform = 'translateY(0)';
        }}
        title="Sair do sistema"
      >
        <LogOut size={20} />
      </button>
    </div>
  );
}

export default App;