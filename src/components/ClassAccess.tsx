import React, { useState, useEffect, CSSProperties } from 'react';
import { Video, Users, Calendar, Clock, Mail, BookOpen, User, RefreshCw, Home, ArrowRight, AlertTriangle, CheckCircle2, Lock, Unlock, Shield } from 'lucide-react';
import { isEmailAuthorized } from '../lib/supabase';
import { theme } from '../styles/theme';

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

interface ClassAccessProps {
  accessCode: string;
  meeting?: Meeting;
}

interface ModernTimerDisplayProps {
  hours: number;
  minutes: number;
  seconds: number;
  days?: number;
}

// Função para formatar a data no padrão DD de MMMM de AAAA
const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  
  const date = new Date(dateStr + 'T00:00:00');
  
  // Verificar se a data é válida
  if (isNaN(date.getTime())) return dateStr;
  
  const day = date.getDate().toString().padStart(2, '0');
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day} de ${month} de ${year}`;
};

// Componente de cronômetro moderno com suporte melhorado para mobile
const ModernTimerDisplay: React.FC<ModernTimerDisplayProps> = ({ hours, minutes, seconds, days = 0 }) => {
  // Detectar dispositivo móvel
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    // Verificar inicialmente
    checkMobile();
    
    // Adicionar listener para quando a janela for redimensionada
    window.addEventListener('resize', checkMobile);
    
    // Limpar o listener quando o componente for desmontado
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const timerItemStyle: CSSProperties = {
    background: 'rgba(24, 61, 93, 0.85)',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 -1px 0 rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(0, 0, 0, 0.3)',
    width: isMobile ? '60px' : '70px',
    height: isMobile ? '60px' : '70px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 4px',
    position: 'relative',
    overflow: 'hidden'
  };

  const timerDigitStyle: CSSProperties = {
    fontSize: isMobile ? '2rem' : '2.5rem',
    fontWeight: 700,
    color: '#3b82f6',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
    margin: 0,
    lineHeight: 1
  };

  const timerLabelStyle: CSSProperties = {
    color: 'rgba(156, 163, 175, 0.8)',
    fontSize: '0.75rem',
    marginTop: '6px',
    textAlign: 'center',
    textTransform: 'uppercase'
  };

  const timerSectionStyle: CSSProperties = {
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center'
  };

  const containerStyle: CSSProperties = {
    background: 'rgba(15, 23, 42, 0.95)',
    padding: isMobile ? '16px' : '24px',
    borderRadius: '12px',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    marginTop: '24px',
    marginBottom: '24px'
  };

  const titleStyle: CSSProperties = {
    color: '#60a5fa',
    marginBottom: '16px',
    fontSize: isMobile ? '1.1rem' : '1.25rem',
    fontWeight: 600,
    textAlign: 'center'
  };

  const glowEffect: CSSProperties = {
    position: 'absolute',
    bottom: '-30px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '80px',
    height: '50px',
    background: 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0) 70%)',
    borderRadius: '50%',
    pointerEvents: 'none'
  };

  return (
    <div style={containerStyle}>
      <div style={titleStyle}>
        A aula iniciará em breve
      </div>
      <div style={{ fontSize: '0.9rem', color: '#a5b4fc', marginBottom: '20px', textAlign: 'center' }}>
        Aguarde o início da aula conforme o cronômetro abaixo.
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: isMobile ? '8px' : '16px', flexWrap: 'wrap' }}>
        {days > 0 && (
          <div style={timerSectionStyle}>
            <div style={timerItemStyle}>
              <div style={timerDigitStyle}>{days}</div>
              <div style={glowEffect}></div>
            </div>
            <div style={timerLabelStyle}>dias</div>
          </div>
        )}
        <div style={timerSectionStyle}>
          <div style={timerItemStyle}>
            <div style={timerDigitStyle}>{hours.toString().padStart(2, '0')}</div>
            <div style={glowEffect}></div>
          </div>
          <div style={timerLabelStyle}>horas</div>
        </div>
        <div style={timerSectionStyle}>
          <div style={timerItemStyle}>
            <div style={timerDigitStyle}>{minutes.toString().padStart(2, '0')}</div>
            <div style={glowEffect}></div>
          </div>
          <div style={timerLabelStyle}>min</div>
        </div>
        <div style={timerSectionStyle}>
          <div style={timerItemStyle}>
            <div style={timerDigitStyle}>{seconds.toString().padStart(2, '0')}</div>
            <div style={glowEffect}></div>
          </div>
          <div style={timerLabelStyle}>seg</div>
        </div>
      </div>
    </div>
  );
};

function ClassAccess({ accessCode, meeting }: ClassAccessProps) {
  const [email, setEmail] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const [classStarted, setClassStarted] = useState(false);
  const [classEnded, setClassEnded] = useState(false);
  const [timerDigits, setTimerDigits] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (meeting) {
      const updateTimer = () => {
        const now = new Date();
        const classDate = new Date(`${meeting.date}T${meeting.time}`);
        
        // Calcular o horário de término da aula
        const classEndDate = new Date(classDate.getTime() + (meeting.duration * 60 * 1000));

        // Verificar se a aula já terminou
        if (now >= classEndDate) {
          setClassEnded(true);
          setClassStarted(false);
          setTimeRemaining(null);
          return;
        }
        
        // Verificar se a aula já começou mas ainda não terminou
        if (now >= classDate && now < classEndDate) {
          setClassStarted(true);
          setClassEnded(false);
          setTimeRemaining(null);
          return;
        }
        
        // Se não começou ainda, calcular tempo restante
        setClassStarted(false);
        setClassEnded(false);
        
        // Calcular tempo restante
        const diffMs = classDate.getTime() - now.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        
        // Atualizar os dígitos para o cronômetro visual
        setTimerDigits({
          days: diffDays,
          hours: diffHours,
          minutes: diffMinutes,
          seconds: diffSeconds
        });
        
        let timeString = '';
        
        if (diffDays > 0) {
          timeString += `${diffDays}d `;
        }
        
        timeString += `${diffHours.toString().padStart(2, '0')}:${diffMinutes.toString().padStart(2, '0')}:${diffSeconds.toString().padStart(2, '0')}`;
        
        setTimeRemaining(timeString);
      };
      
      // Atualizar o timer imediatamente
      updateTimer();
      
      // Atualizar o timer a cada segundo
      const timerId = setInterval(updateTimer, 1000);
      
      return () => clearInterval(timerId);
    }
  }, [meeting]);

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationLoading(true);
    setError('');

    try {
      if (!meeting) {
        setError('Código de acesso inválido ou aula não encontrada.');
        return;
      }

      // Verificar se o email está autorizado usando o Supabase
      const isAuthorized = await isEmailAuthorized(meeting.id, email);

      if (isAuthorized) {
        setIsVerified(true);
      } else {
        setError('Email não autorizado para esta aula.');
      }
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      setError('Ocorreu um erro ao verificar o email. Tente novamente.');
    } finally {
      setVerificationLoading(false);
    }
  };

  // Aula não encontrada - tela moderna (responsiva)
  if (!meeting) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6" 
           style={{ backgroundColor: theme.colors.background.dark }}>
        <div className="max-w-md w-full bg-opacity-90 backdrop-blur-sm p-6 sm:p-8 rounded-xl shadow-lg"
             style={{ backgroundColor: theme.colors.background.DEFAULT }}>
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full" 
               style={{ backgroundColor: `${theme.colors.state.error}20` }}>
            <div className="w-10 h-10 flex items-center justify-center"
                 style={{ color: theme.colors.state.error }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 16l2-2m2-2l-2 2m-2-2l2 2"></path>
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
            </div>
          </div>
          
          <h2 className="text-xl sm:text-2xl font-semibold text-center mb-4" 
              style={{ color: theme.colors.state.error }}>
            Aula não encontrada
          </h2>
          
          <p className="text-center mb-8" style={{ color: theme.colors.text.secondary }}>
            O código de acesso fornecido é inválido ou a aula não existe.
          </p>
          
          <a 
            href="/" 
            className="block w-full py-3 px-6 text-center font-medium rounded-lg flex items-center justify-center gap-2 transition-all"
            style={{ 
              backgroundColor: theme.colors.primary.DEFAULT, 
              color: theme.colors.text.primary,
              boxShadow: theme.shadow.DEFAULT
            }}
            onMouseOver={e => {
              e.currentTarget.style.backgroundColor = theme.colors.primary.hover;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = theme.colors.primary.DEFAULT;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Home size={18} />
            <span>Voltar para a tela inicial</span>
          </a>
        </div>
      </div>
    );
  }

  // Formatar a data da aula
  const formattedDate = formatDate(meeting.date);

  // Determinar o status da aula e cores correspondentes
  let statusColor, statusIcon, statusTitle, statusText;
  if (classEnded) {
    statusColor = theme.colors.state.error;
    statusIcon = <CheckCircle2 size={32} style={{ color: statusColor }} />;
    statusTitle = "Aula encerrada";
    statusText = "Esta aula já foi concluída e não está mais disponível.";
  } else if (classStarted) {
    statusColor = theme.colors.state.success;
    statusIcon = <Video size={32} style={{ color: statusColor }} />;
    statusTitle = "Aula em andamento!";
    statusText = "Clique no botão abaixo para acessar a sala virtual.";
  } else {
    statusColor = theme.colors.state.info;
    statusIcon = <Clock size={32} style={{ color: statusColor }} />;
    statusTitle = "A aula iniciará em breve";
    statusText = "Aguarde o início da aula conforme o cronômetro abaixo.";
  }

  // Tela da aula modernizada e otimizada para mobile
  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8" style={{ backgroundColor: theme.colors.background.dark, color: theme.colors.text.primary }}>
      <div className="max-w-5xl mx-auto">
        <div className="rounded-xl shadow-xl overflow-hidden backdrop-blur-sm"
             style={{ backgroundColor: theme.colors.background.DEFAULT }}>
          
          {/* Cabeçalho otimizado para mobile */}
          <div className="p-4 sm:p-6 md:p-8 border-b border-gray-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-col">
              <h2 className="text-lg sm:text-xl font-medium mb-1" style={{ color: theme.colors.text.secondary }}>
                {meeting.title}
              </h2>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: theme.colors.primary.DEFAULT }}>
                {meeting.theme}
              </h1>
            </div>
            
            <div className="flex items-center gap-3 py-2 px-4 rounded-full self-start" 
                 style={{ backgroundColor: `${statusColor}20` }}>
              <span style={{ color: statusColor }}>
                {classEnded ? <AlertTriangle size={18} /> : classStarted ? <Video size={18} /> : <Clock size={18} />}
              </span>
              <span style={{ color: statusColor }}>
                {classEnded ? 'Encerrada' : classStarted ? 'Ao vivo' : 'Em breve'}
              </span>
            </div>
          </div>
          
          {/* Status da aula */}
          <div className="p-4 sm:p-6 md:p-8">
            {!classStarted && !classEnded && timeRemaining && (
              <ModernTimerDisplay 
                hours={timerDigits.hours} 
                minutes={timerDigits.minutes} 
                seconds={timerDigits.seconds}
                days={timerDigits.days}
              />
            )}
            
            {/* Card de status - apenas para aula em andamento ou encerrada */}
            {(classStarted || classEnded) && (
              <div className="rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-inner" 
                  style={{ backgroundColor: `${statusColor}15` }}>
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full"
                      style={{ backgroundColor: `${statusColor}25` }}>
                    {statusIcon}
                  </div>
                  <div className="text-center md:text-left">
                    <h2 className="text-xl font-bold mb-1" style={{ color: statusColor }}>
                      {statusTitle}
                    </h2>
                    <p style={{ color: theme.colors.text.secondary }}>
                      {statusText}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Verificação de email (se ainda não verificado) */}
            {!isVerified && !classEnded && (
              <div className="rounded-xl p-4 sm:p-6 mb-4 sm:mb-6" style={{ backgroundColor: theme.colors.background.light }}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full" 
                       style={{ backgroundColor: `${theme.colors.state.warning}30` }}>
                    <Shield size={18} style={{ color: theme.colors.state.warning }} />
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold" style={{ color: theme.colors.text.primary }}>
                    Verificação de Acesso
                  </h2>
                </div>
                
                <p className="mb-4 text-sm sm:text-base" style={{ color: theme.colors.text.secondary }}>
                  Para acessar esta aula, por favor informe seu email de cadastro.
                </p>
                
                <form onSubmit={handleVerifyEmail} className="space-y-4">
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 transform -translate-y-1/2" 
                         style={{ color: theme.colors.primary.DEFAULT }}>
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      required
                      className="w-full py-3 pl-11 pr-4 rounded-lg border transition-all text-sm sm:text-base"
                      placeholder="Seu email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ 
                        backgroundColor: theme.colors.background.input,
                        borderColor: `${theme.colors.text.muted}50`,
                        color: theme.colors.text.primary
                      }}
                    />
                  </div>
                  
                  {error && (
                    <div className="p-3 rounded-lg text-xs sm:text-sm" 
                         style={{ backgroundColor: `${theme.colors.state.error}20`, color: theme.colors.state.error }}>
                      {error}
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={verificationLoading}
                    className="w-full py-2.5 sm:py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ 
                      backgroundColor: theme.colors.primary.DEFAULT, 
                      color: theme.colors.text.primary,
                      boxShadow: theme.shadow.sm
                    }}
                    onMouseOver={e => !verificationLoading && (e.currentTarget.style.backgroundColor = theme.colors.primary.hover)}
                    onMouseLeave={e => !verificationLoading && (e.currentTarget.style.backgroundColor = theme.colors.primary.DEFAULT)}
                  >
                    {verificationLoading ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" />
                        <span>Verificando...</span>
                      </>
                    ) : (
                      <>
                        <Lock size={18} />
                        <span>Verificar Acesso</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
            
            {/* Informações da aula - layout melhorado para mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="rounded-xl p-4 sm:p-6" style={{ backgroundColor: theme.colors.background.light }}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full" 
                       style={{ backgroundColor: `${theme.colors.primary.DEFAULT}30` }}>
                    <BookOpen size={18} style={{ color: theme.colors.primary.DEFAULT }} />
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold" style={{ color: theme.colors.text.primary }}>
                    Detalhes da Aula
                  </h2>
                </div>
                
                <div className="space-y-4">
                  <div className="pt-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar size={16} style={{ color: theme.colors.text.accent }} />
                      <span className="text-sm sm:text-base" style={{ color: theme.colors.text.secondary }}>
                        {formattedDate} às {meeting.time}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock size={16} style={{ color: theme.colors.text.accent }} />
                      <span className="text-sm sm:text-base" style={{ color: theme.colors.text.secondary }}>
                        Duração: {meeting.duration} minutos
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="rounded-xl p-4 sm:p-6" style={{ backgroundColor: theme.colors.background.light }}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full" 
                       style={{ backgroundColor: `${theme.colors.primary.DEFAULT}30` }}>
                    <Users size={18} style={{ color: theme.colors.primary.DEFAULT }} />
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold" style={{ color: theme.colors.text.primary }}>
                    Informações Adicionais
                  </h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 style={{ color: theme.colors.text.muted, fontSize: '0.875rem' }}>Professor</h3>
                    <p className="text-base sm:text-lg font-medium break-words" style={{ color: theme.colors.text.primary }}>
                      {meeting.professor}
                    </p>
                  </div>
                  
                  <div className="pt-2">
                    <div className="flex items-center space-x-2">
                      <Users size={16} style={{ color: theme.colors.text.accent }} />
                      <span className="text-sm sm:text-base" style={{ color: theme.colors.text.secondary }}>
                        {meeting.authorizedEmails.length} pessoas inscritas
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Botão de entrada - só exibido se a aula não tiver encerrado E o email estiver verificado */}
            {!classEnded && isVerified && (
              <div className="rounded-xl p-4 sm:p-6 mb-2 flex justify-center" style={{ backgroundColor: theme.colors.background.light }}>
                <a 
                  href={meeting.zoomLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto py-3 sm:py-3.5 px-6 sm:px-8 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                  style={{ 
                    backgroundColor: classStarted ? theme.colors.state.success : theme.colors.state.info, 
                    color: theme.colors.text.primary,
                    boxShadow: theme.shadow.md
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = theme.shadow.lg;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = theme.shadow.md;
                  }}
                >
                  <Video size={20} />
                  <span>{classStarted ? 'Entrar na Aula' : 'Acessar Sala de Espera'}</span>
                </a>
              </div>
            )}
            
            {/* Mensagem para aula encerrada */}
            {classEnded && (
              <div className="rounded-xl p-4 sm:p-6 mb-2 flex flex-col items-center justify-center text-center" 
                   style={{ backgroundColor: theme.colors.background.light }}>
                <div className="mb-4 w-14 sm:w-16 h-14 sm:h-16 flex items-center justify-center rounded-full"
                     style={{ backgroundColor: `${theme.colors.state.error}25` }}>
                  <AlertTriangle size={28} style={{ color: theme.colors.state.error }} />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2" style={{ color: theme.colors.state.error }}>
                  Esta aula já foi encerrada
                </h3>
                <p className="mb-6 text-sm sm:text-base" style={{ color: theme.colors.text.secondary }}>
                  A aula foi concluída e não está mais disponível para acesso.
                </p>
                <a 
                  href="/" 
                  className="py-2.5 sm:py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                  style={{ 
                    backgroundColor: theme.colors.primary.DEFAULT, 
                    color: theme.colors.text.primary,
                    boxShadow: theme.shadow.sm
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.backgroundColor = theme.colors.primary.hover;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = theme.colors.primary.DEFAULT;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <Home size={18} />
                  <span>Voltar à página inicial</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClassAccess;