import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar, Clock, Video, Users, Link as LinkIcon, Copy, Plus, Trash2, RefreshCw, X, Edit2, Upload, FileText, Search, Filter, ChevronDown } from 'lucide-react';
import { 
  createMeeting, 
  createAuthorizedEmails, 
  deleteMeeting,
  updateMeeting,
  deleteAuthorizedEmails
} from '../lib/supabase';
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

interface AdminPanelProps {
  meetings: Meeting[];
  updateMeetings: (meetings: Meeting[]) => void;
}

const AdminPanel = ({ meetings, updateMeetings }: AdminPanelProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingMeetingId, setEditingMeetingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    zoomLink: '',
    authorizedEmails: '',
    professor: '',
    theme: '',
    duration: 60,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [csvUploading, setCsvUploading] = useState(false);
  const csvFileInputRef = useRef<HTMLInputElement>(null);
  
  // Estado dos filtros
  const [filters, setFilters] = useState({
    searchTerm: '',
    professor: '',
    startDate: '',
    endDate: '',
    status: 'all', // 'all', 'upcoming', 'ongoing', 'past'
  });
  const [showFilters, setShowFilters] = useState(false);

  const generateAccessCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  // Função para carregar os dados de uma reunião existente no formulário
  const handleEditMeeting = (meeting: Meeting) => {
    setFormData({
      title: meeting.title,
      date: meeting.date,
      time: meeting.time,
      zoomLink: meeting.zoomLink,
      authorizedEmails: meeting.authorizedEmails.join('\n'),
      professor: meeting.professor,
      theme: meeting.theme,
      duration: meeting.duration,
    });
    setEditingMeetingId(meeting.id);
    setShowForm(true);
  };

  // Fechar o formulário e limpar os dados
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingMeetingId(null);
    setFormData({
      title: '',
      date: '',
      time: '',
      zoomLink: '',
      authorizedEmails: '',
      professor: '',
      theme: '',
      duration: 60,
    });
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');
    
    try {
      const emails = formData.authorizedEmails.split('\n').map(email => email.trim()).filter(email => email);
      
      if (editingMeetingId) {
        // Modo de edição - atualizar reunião existente
        const existingMeeting = meetings.find(m => m.id === editingMeetingId);
        if (!existingMeeting) {
          throw new Error('Reunião não encontrada para edição');
        }
        
        // Atualizar a reunião no Supabase
        const updatedMeetingData = await updateMeeting({
          id: editingMeetingId,
          title: formData.title,
          date: formData.date,
          time: formData.time,
          zoom_link: formData.zoomLink,
          access_code: existingMeeting.accessCode,
          professor: formData.professor,
          theme: formData.theme,
          duration: Number(formData.duration)
        });
        
        if (!updatedMeetingData) {
          throw new Error('Erro ao atualizar reunião');
        }
        
        // Atualizar os emails autorizados
        // Primeiro deletamos os emails existentes
        await deleteAuthorizedEmails(editingMeetingId);
        // Depois criamos os novos emails
        await createAuthorizedEmails(editingMeetingId, emails);
        
        // Atualizar a lista de reuniões na interface
        const updatedMeeting: Meeting = {
          id: editingMeetingId,
          title: updatedMeetingData.title,
          date: updatedMeetingData.date,
          time: updatedMeetingData.time,
          zoomLink: updatedMeetingData.zoom_link,
          accessCode: updatedMeetingData.access_code,
          professor: updatedMeetingData.professor,
          theme: updatedMeetingData.theme,
          duration: updatedMeetingData.duration,
          authorizedEmails: emails
        };
        
        const updatedMeetings = meetings.map(meeting => 
          meeting.id === editingMeetingId ? updatedMeeting : meeting
        );
        
        updateMeetings(updatedMeetings);
      } else {
        // Modo de criação - criar nova reunião
        const accessCode = generateAccessCode();
        
        // Criar a reunião no Supabase
        const newMeetingData = await createMeeting({
          title: formData.title,
          date: formData.date,
          time: formData.time,
          zoom_link: formData.zoomLink,
          access_code: accessCode,
          professor: formData.professor,
          theme: formData.theme,
          duration: Number(formData.duration)
        });
        
        if (!newMeetingData) {
          throw new Error('Erro ao criar reunião');
        }
        
        // Criar os emails autorizados
        await createAuthorizedEmails(newMeetingData.id, emails);
        
        // Atualizar a lista de reuniões na interface
        const newMeeting: Meeting = {
          id: newMeetingData.id,
          title: newMeetingData.title,
          date: newMeetingData.date,
          time: newMeetingData.time,
          zoomLink: newMeetingData.zoom_link,
          accessCode: newMeetingData.access_code,
          professor: newMeetingData.professor,
          theme: newMeetingData.theme,
          duration: newMeetingData.duration,
          authorizedEmails: emails
        };
        
        updateMeetings([...meetings, newMeeting]);
      }
      
      // Limpar o formulário
      handleCloseForm();
    } catch (error) {
      console.error('Erro ao salvar reunião:', error);
      setFormError(`Ocorreu um erro ao ${editingMeetingId ? 'atualizar' : 'criar'} a reunião. Tente novamente.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMeeting = async (id: number) => {
    try {
      const success = await deleteMeeting(id);
      
      if (success) {
        const updatedMeetings = meetings.filter(m => m.id !== id);
        updateMeetings(updatedMeetings);
      } else {
        throw new Error('Não foi possível excluir a reunião');
      }
    } catch (error) {
      console.error('Erro ao excluir reunião:', error);
      alert('Ocorreu um erro ao excluir a reunião. Tente novamente.');
    }
  };

  const copyAccessLink = (accessCode: string) => {
    const baseUrl = window.location.origin;
    const accessLink = `${baseUrl}?code=${accessCode}`;
    navigator.clipboard.writeText(accessLink);
    
    // Mostrar um elemento de feedback que desaparece após 2 segundos
    const meetingElement = document.getElementById(`meeting-${accessCode}`);
    if (meetingElement) {
      const feedbackElement = meetingElement.querySelector('.copy-feedback');
      if (feedbackElement) {
        feedbackElement.classList.remove('opacity-0');
        feedbackElement.classList.add('opacity-100');
        
        setTimeout(() => {
          feedbackElement.classList.remove('opacity-100');
          feedbackElement.classList.add('opacity-0');
        }, 2000);
      }
    }
  };

  // Função para processar o arquivo CSV
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvUploading(true);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvText = event.target?.result as string;
        // Processamento simples para extrair emails do CSV
        const lines = csvText.split(/\r\n|\n|\r/).filter(line => line.trim());
        
        let emails: string[] = [];
        
        // Processamento para diferentes formatos de CSV
        lines.forEach(line => {
          // Remove aspas se existirem e divide por vírgula ou ponto e vírgula
          const parts = line.replace(/"/g, '').split(/[,;]/);
          
          // Verifica cada parte para encontrar emails
          parts.forEach(part => {
            // Regex simples para validar email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const trimmedPart = part.trim();
            
            if (emailRegex.test(trimmedPart)) {
              emails.push(trimmedPart);
            }
          });
        });

        // Remover duplicatas
        emails = [...new Set(emails)];
        
        if (emails.length > 0) {
          // Unir os novos emails com os já existentes (se houver)
          const existingEmails = formData.authorizedEmails
            .split('\n')
            .map(e => e.trim())
            .filter(e => e);

          const allEmails = [...new Set([...existingEmails, ...emails])];
          
          setFormData({
            ...formData,
            authorizedEmails: allEmails.join('\n')
          });
        } else {
          setFormError('Nenhum email válido encontrado no arquivo CSV.');
        }
      } catch (error) {
        console.error('Erro ao processar arquivo CSV:', error);
        setFormError('Erro ao processar o arquivo CSV. Verifique o formato e tente novamente.');
      } finally {
        setCsvUploading(false);
        // Limpar o input para permitir fazer upload do mesmo arquivo novamente
        if (csvFileInputRef.current) {
          csvFileInputRef.current.value = '';
        }
      }
    };
    
    reader.onerror = () => {
      setFormError('Erro ao ler o arquivo. Tente novamente.');
      setCsvUploading(false);
      // Limpar o input
      if (csvFileInputRef.current) {
        csvFileInputRef.current.value = '';
      }
    };
    
    reader.readAsText(file);
  };

  // Função para acionar o clique no input de arquivo oculto
  const triggerFileInput = () => {
    csvFileInputRef.current?.click();
  };

  // Função para verificar o status de uma reunião (futura, em andamento ou encerrada)
  const getMeetingStatus = (meeting: Meeting) => {
    const now = new Date();
    const meetingDate = new Date(`${meeting.date}T${meeting.time}`);
    const meetingEndDate = new Date(meetingDate.getTime() + (meeting.duration * 60 * 1000));

    if (now < meetingDate) {
      return 'upcoming'; // Aula futura
    } else if (now >= meetingDate && now <= meetingEndDate) {
      return 'ongoing'; // Aula em andamento
    } else {
      return 'past'; // Aula encerrada
    }
  };

  // Função para formatar data em formato legível
  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    
    const date = new Date(dateStr + 'T00:00:00');
    if (isNaN(date.getTime())) return dateStr;
    
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  // Filtrar reuniões com base nos filtros aplicados
  const filteredMeetings = useMemo(() => {
    return meetings.filter(meeting => {
      // Filtro por termo de busca (título ou tema)
      const searchMatch = filters.searchTerm === '' || 
        meeting.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        meeting.theme.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      // Filtro por professor
      const professorMatch = filters.professor === '' ||
        meeting.professor.toLowerCase().includes(filters.professor.toLowerCase());
      
      // Filtro por data
      const meetingDate = new Date(meeting.date);
      let dateMatch = true;
      
      if (filters.startDate && filters.endDate) {
        const startDate = new Date(filters.startDate);
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59); // Ajustar para o final do dia
        dateMatch = meetingDate >= startDate && meetingDate <= endDate;
      } else if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        dateMatch = meetingDate >= startDate;
      } else if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59); // Ajustar para o final do dia
        dateMatch = meetingDate <= endDate;
      }
      
      // Filtro por status
      const status = getMeetingStatus(meeting);
      const statusMatch = filters.status === 'all' || status === filters.status;
      
      return searchMatch && professorMatch && dateMatch && statusMatch;
    });
  }, [meetings, filters]);

  // Função para limpar todos os filtros
  const clearAllFilters = () => {
    setFilters({
      searchTerm: '',
      professor: '',
      startDate: '',
      endDate: '',
      status: 'all',
    });
  };

  // Verificar se algum filtro está ativo
  const hasActiveFilters = 
    filters.searchTerm !== '' || 
    filters.professor !== '' || 
    filters.startDate !== '' || 
    filters.endDate !== '' || 
    filters.status !== 'all';

  // Função para verificar se a tela é mobile (útil para ajustes específicos)
  const isMobile = () => {
    return window.innerWidth < 768;
  };

  return (
    <div className="container mx-auto px-4 py-6" style={{ color: theme.colors.text.primary }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: theme.colors.primary.light }}>
            Painel Administrativo
          </h1>
          <button
            onClick={() => {
              setEditingMeetingId(null);
              setFormData({
                title: '',
                date: '',
                time: '',
                zoomLink: '',
                authorizedEmails: '',
                professor: '',
                theme: '',
                duration: 60,
              });
              setShowForm(true);
            }}
            className="py-2.5 px-4 rounded-lg font-medium transition-all flex items-center gap-2"
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
            <Plus size={18} />
            <span>Nova Reunião</span>
          </button>
        </div>

        {/* Barra de Pesquisa e Filtros */}
        <div className="mb-6 bg-opacity-40 backdrop-blur-sm rounded-xl p-4 shadow-sm"
             style={{ backgroundColor: theme.colors.background.DEFAULT }}>
          {/* Barra de pesquisa e botão de filtro */}
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="relative flex-grow">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: theme.colors.text.accent }}>
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Buscar por título ou tema..."
                value={filters.searchTerm}
                onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                className="w-full px-10 py-2.5 rounded-lg border transition-all"
                style={{ 
                  backgroundColor: theme.colors.background.input,
                  borderColor: `${theme.colors.text.muted}30`,
                  color: theme.colors.text.primary
                }}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all"
              style={{ 
                backgroundColor: showFilters || hasActiveFilters 
                  ? `${theme.colors.primary.DEFAULT}40` 
                  : `${theme.colors.text.muted}20`,
                color: showFilters || hasActiveFilters 
                  ? theme.colors.primary.light 
                  : theme.colors.text.secondary
              }}
              onMouseOver={e => {
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              <Filter size={18} />
              <span>Filtros</span>
              <ChevronDown 
                size={16} 
                style={{ 
                  transform: showFilters ? 'rotate(180deg)' : 'rotate(0)', 
                  transition: 'transform 0.2s ease'
                }}
              />
              {hasActiveFilters && (
                <div className="ml-1 w-2 h-2 rounded-full" style={{ backgroundColor: theme.colors.state.success }}></div>
              )}
            </button>
          </div>

          {/* Filtros avançados (expandíveis) */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: theme.colors.text.muted }}>
                  Professor
                </label>
                <input
                  type="text"
                  placeholder="Filtrar por professor..."
                  value={filters.professor}
                  onChange={(e) => setFilters({...filters, professor: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border transition-all"
                  style={{ 
                    backgroundColor: theme.colors.background.input,
                    borderColor: `${theme.colors.text.muted}30`,
                    color: theme.colors.text.primary
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: theme.colors.text.muted }}>
                  Data Inicial
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border transition-all"
                  style={{ 
                    backgroundColor: theme.colors.background.input,
                    borderColor: `${theme.colors.text.muted}30`,
                    color: theme.colors.text.primary
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: theme.colors.text.muted }}>
                  Data Final
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border transition-all"
                  style={{ 
                    backgroundColor: theme.colors.background.input,
                    borderColor: `${theme.colors.text.muted}30`,
                    color: theme.colors.text.primary
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: theme.colors.text.muted }}>
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border transition-all"
                  style={{ 
                    backgroundColor: theme.colors.background.input,
                    borderColor: `${theme.colors.text.muted}30`,
                    color: theme.colors.text.primary
                  }}
                >
                  <option value="all">Todas</option>
                  <option value="upcoming">Futuras</option>
                  <option value="ongoing">Em andamento</option>
                  <option value="past">Encerradas</option>
                </select>
              </div>
              <div className="md:col-span-2 lg:col-span-4 flex justify-end">
                <button
                  onClick={clearAllFilters}
                  className="px-3 py-1.5 rounded-lg text-sm transition-all"
                  style={{ 
                    backgroundColor: `${theme.colors.state.error}20`,
                    color: theme.colors.state.error
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.backgroundColor = `${theme.colors.state.error}30`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = `${theme.colors.state.error}20`;
                  }}
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sumário de resultados */}
        {meetings.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            <span style={{ color: theme.colors.text.secondary }}>
              Exibindo {filteredMeetings.length} de {meetings.length} reuniões
            </span>
            {hasActiveFilters && (
              <div className="text-xs py-1 px-2 rounded-full" 
                   style={{ backgroundColor: `${theme.colors.primary.DEFAULT}20`, color: theme.colors.primary.light }}>
                Filtros aplicados
              </div>
            )}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 flex flex-col justify-start md:justify-center items-center z-50 overflow-y-auto"
               style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}>
            {/* Container do formulário com scroll interno em mobile */}
            <div className="w-full max-w-2xl max-h-screen md:max-h-[90vh] rounded-xl shadow-xl backdrop-blur-sm md:overflow-hidden flex flex-col"
                 style={{ backgroundColor: theme.colors.background.DEFAULT }}>
              {/* Cabeçalho fixo */}
              <div className="sticky top-0 z-10 flex justify-between items-center p-4 md:p-6 border-b"
                   style={{ borderColor: `${theme.colors.text.muted}20`, backgroundColor: theme.colors.background.DEFAULT }}>
                <h2 className="text-xl font-bold" style={{ color: theme.colors.primary.light }}>
                  {editingMeetingId ? 'Editar Reunião' : 'Nova Reunião'}
                </h2>
                <button 
                  onClick={handleCloseForm}
                  className="p-2 rounded-full transition-all"
                  style={{ backgroundColor: `${theme.colors.text.muted}20` }}
                  onMouseOver={e => {
                    e.currentTarget.style.backgroundColor = `${theme.colors.text.muted}30`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = `${theme.colors.text.muted}20`;
                  }}
                  aria-label="Fechar"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Conteúdo do formulário com scroll */}
              <div className="flex-grow overflow-y-auto p-4 md:p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: theme.colors.text.muted }}>
                      Título da Aula
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full rounded-lg border px-4 py-2.5 transition-all text-base"
                      style={{ 
                        backgroundColor: theme.colors.background.input,
                        borderColor: `${theme.colors.text.muted}50`,
                        color: theme.colors.text.primary
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: theme.colors.text.muted }}>
                      Professor
                    </label>
                    <input
                      type="text"
                      value={formData.professor}
                      onChange={(e) => setFormData({...formData, professor: e.target.value})}
                      className="w-full rounded-lg border px-4 py-2.5 transition-all text-base"
                      style={{ 
                        backgroundColor: theme.colors.background.input,
                        borderColor: `${theme.colors.text.muted}50`,
                        color: theme.colors.text.primary
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: theme.colors.text.muted }}>
                      Tema da Aula
                    </label>
                    <input
                      type="text"
                      value={formData.theme}
                      onChange={(e) => setFormData({...formData, theme: e.target.value})}
                      className="w-full rounded-lg border px-4 py-2.5 transition-all text-base"
                      style={{ 
                        backgroundColor: theme.colors.background.input,
                        borderColor: `${theme.colors.text.muted}50`,
                        color: theme.colors.text.primary
                      }}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: theme.colors.text.muted }}>
                        Data
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        className="w-full rounded-lg border px-4 py-2.5 transition-all text-base"
                        style={{ 
                          backgroundColor: theme.colors.background.input,
                          borderColor: `${theme.colors.text.muted}50`,
                          color: theme.colors.text.primary
                        }}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: theme.colors.text.muted }}>
                        Horário
                      </label>
                      <input
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({...formData, time: e.target.value})}
                        className="w-full rounded-lg border px-4 py-2.5 transition-all text-base"
                        style={{ 
                          backgroundColor: theme.colors.background.input,
                          borderColor: `${theme.colors.text.muted}50`,
                          color: theme.colors.text.primary
                        }}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: theme.colors.text.muted }}>
                        Duração (min)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.duration}
                        onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 60})}
                        className="w-full rounded-lg border px-4 py-2.5 transition-all text-base"
                        style={{ 
                          backgroundColor: theme.colors.background.input,
                          borderColor: `${theme.colors.text.muted}50`,
                          color: theme.colors.text.primary
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: theme.colors.text.muted }}>
                      Link do Zoom
                    </label>
                    <input
                      type="url"
                      value={formData.zoomLink}
                      onChange={(e) => setFormData({...formData, zoomLink: e.target.value})}
                      className="w-full rounded-lg border px-4 py-2.5 transition-all text-base"
                      style={{ 
                        backgroundColor: theme.colors.background.input,
                        borderColor: `${theme.colors.text.muted}50`,
                        color: theme.colors.text.primary
                      }}
                      required
                    />
                  </div>

                  <div>
                    <div className="flex flex-wrap justify-between items-center gap-2 mb-1.5">
                      <label className="block text-sm font-medium" style={{ color: theme.colors.text.muted }}>
                        Emails Autorizados
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept=".csv"
                          ref={csvFileInputRef}
                          onChange={handleCSVUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={triggerFileInput}
                          disabled={csvUploading}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-all"
                          style={{ 
                            backgroundColor: `${theme.colors.primary.DEFAULT}20`,
                            color: theme.colors.primary.light
                          }}
                          onMouseOver={e => !csvUploading && (e.currentTarget.style.backgroundColor = `${theme.colors.primary.DEFAULT}30`)}
                          onMouseLeave={e => !csvUploading && (e.currentTarget.style.backgroundColor = `${theme.colors.primary.DEFAULT}20`)}
                        >
                          {csvUploading ? (
                            <>
                              <RefreshCw size={14} className="animate-spin" />
                              <span>Processando...</span>
                            </>
                          ) : (
                            <>
                              <FileText size={14} />
                              <span>Importar CSV</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={formData.authorizedEmails}
                      onChange={(e) => setFormData({...formData, authorizedEmails: e.target.value})}
                      className="w-full rounded-lg border px-4 py-2.5 transition-all text-base h-24 sm:h-32 resize-none"
                      style={{ 
                        backgroundColor: theme.colors.background.input,
                        borderColor: `${theme.colors.text.muted}50`,
                        color: theme.colors.text.primary
                      }}
                      required
                      placeholder="Digite um email por linha ou importe um arquivo CSV"
                    />
                    <p className="mt-1 text-xs" style={{ color: theme.colors.text.muted }}>
                      Digite um email por linha ou use o botão importar CSV
                    </p>
                  </div>

                  {formError && (
                    <div className="p-3 rounded-lg text-sm" 
                         style={{ backgroundColor: `${theme.colors.state.error}20`, color: theme.colors.state.error }}>
                      {formError}
                    </div>
                  )}
                </form>
              </div>
              
              {/* Rodapé fixo com botões de ação */}
              <div className="sticky bottom-0 border-t p-4 md:p-6 flex flex-col sm:flex-row justify-end items-center gap-3"
                   style={{ 
                     borderColor: `${theme.colors.text.muted}20`,
                     backgroundColor: theme.colors.background.DEFAULT,
                     boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)'
                   }}>
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-lg font-medium transition-all"
                  style={{
                    backgroundColor: `${theme.colors.text.muted}20`,
                    color: theme.colors.text.secondary,
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.backgroundColor = `${theme.colors.text.muted}30`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = `${theme.colors.text.muted}20`;
                  }}
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    // Encontrar o formulário e disparar o evento submit
                    const form = e.currentTarget.closest('div')?.previousSibling?.querySelector('form');
                    if (form) {
                      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                    }
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ 
                    backgroundColor: theme.colors.primary.DEFAULT, 
                    color: theme.colors.text.primary,
                  }}
                  onMouseOver={e => !isSubmitting && (e.currentTarget.style.backgroundColor = theme.colors.primary.hover)}
                  onMouseLeave={e => !isSubmitting && (e.currentTarget.style.backgroundColor = theme.colors.primary.DEFAULT)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <span>{editingMeetingId ? 'Atualizar' : 'Salvar'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {meetings.length === 0 ? (
          <div className="rounded-xl p-10 text-center shadow-md backdrop-blur-sm"
               style={{ backgroundColor: theme.colors.background.DEFAULT }}>
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full"
                 style={{ backgroundColor: `${theme.colors.primary.DEFAULT}15` }}>
              <Calendar size={32} style={{ color: theme.colors.primary.light }} />
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: theme.colors.text.primary }}>
              Nenhuma reunião cadastrada
            </h3>
            <p style={{ color: theme.colors.text.secondary }}>
              Clique no botão "Nova Reunião" para criar uma aula.
            </p>
          </div>
        ) : filteredMeetings.length === 0 ? (
          <div className="rounded-xl p-10 text-center shadow-md backdrop-blur-sm"
               style={{ backgroundColor: theme.colors.background.DEFAULT }}>
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full"
                 style={{ backgroundColor: `${theme.colors.state.warning}15` }}>
              <Search size={32} style={{ color: theme.colors.state.warning }} />
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: theme.colors.text.primary }}>
              Nenhuma reunião encontrada
            </h3>
            <p style={{ color: theme.colors.text.secondary }}>
              Nenhuma reunião corresponde aos filtros aplicados.
            </p>
            <button
              onClick={clearAllFilters}
              className="mt-4 px-4 py-2 rounded-lg text-sm transition-all"
              style={{ 
                backgroundColor: `${theme.colors.primary.DEFAULT}20`,
                color: theme.colors.primary.light
              }}
              onMouseOver={e => {
                e.currentTarget.style.backgroundColor = `${theme.colors.primary.DEFAULT}30`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = `${theme.colors.primary.DEFAULT}20`;
              }}
            >
              Limpar Filtros
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredMeetings.map((meeting) => {
              const status = getMeetingStatus(meeting);
              let statusColor;
              let statusText;
              
              if (status === 'upcoming') {
                statusColor = theme.colors.state.info;
                statusText = 'Futura';
              } else if (status === 'ongoing') {
                statusColor = theme.colors.state.success;
                statusText = 'Em andamento';
              } else {
                statusColor = theme.colors.state.error;
                statusText = 'Encerrada';
              }
              
              return (
                <div key={meeting.id} className="rounded-xl shadow-md overflow-hidden backdrop-blur-sm"
                     id={`meeting-${meeting.accessCode}`}
                     style={{ backgroundColor: theme.colors.background.DEFAULT }}>
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="space-y-3 w-full">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-semibold" style={{ color: theme.colors.text.primary }}>
                                {meeting.title}
                              </h3>
                              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                                   style={{ backgroundColor: `${statusColor}20`, color: statusColor }}>
                                {statusText}
                              </div>
                            </div>
                            <p className="text-sm" style={{ color: theme.colors.text.secondary }}>
                              {meeting.theme}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditMeeting(meeting)}
                              className="p-2 rounded-full transition-all flex"
                              style={{ backgroundColor: `${theme.colors.primary.DEFAULT}20` }}
                              onMouseOver={e => {
                                e.currentTarget.style.backgroundColor = `${theme.colors.primary.DEFAULT}30`;
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.backgroundColor = `${theme.colors.primary.DEFAULT}20`;
                              }}
                              title="Editar reunião"
                            >
                              <Edit2 size={16} style={{ color: theme.colors.primary.DEFAULT }} />
                            </button>
                            <button
                              onClick={() => handleDeleteMeeting(meeting.id)}
                              className="p-2 rounded-full transition-all flex"
                              style={{ backgroundColor: `${theme.colors.state.error}20` }}
                              onMouseOver={e => {
                                e.currentTarget.style.backgroundColor = `${theme.colors.state.error}30`;
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.backgroundColor = `${theme.colors.state.error}20`;
                              }}
                              title="Excluir reunião"
                            >
                              <Trash2 size={16} style={{ color: theme.colors.state.error }} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center" style={{ color: theme.colors.text.secondary }}>
                              <Users size={16} className="mr-2" style={{ color: theme.colors.text.accent }} />
                              <span>Professor: {meeting.professor}</span>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-2" style={{ color: theme.colors.text.secondary }}>
                              <div className="flex items-center">
                                <Calendar size={16} className="mr-1.5" style={{ color: theme.colors.text.accent }} />
                                <span>{formatDateForDisplay(meeting.date)}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock size={16} className="mr-1.5" style={{ color: theme.colors.text.accent }} />
                                <span>{meeting.time}</span>
                              </div>
                              <div className="flex items-center">
                                <span>({meeting.duration} min)</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center overflow-hidden" style={{ color: theme.colors.text.secondary }}>
                              <Video size={16} className="mr-2 flex-shrink-0" style={{ color: theme.colors.text.accent }} />
                              <span className="truncate" style={{ color: theme.colors.primary.light }}>
                                {meeting.zoomLink}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center" style={{ color: theme.colors.text.secondary }}>
                              <Users size={16} className="mr-2" style={{ color: theme.colors.text.accent }} />
                              <span>{meeting.authorizedEmails.length} participantes</span>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="flex items-center relative">
                                <div className="flex items-center bg-opacity-10 py-1.5 px-3 rounded-l" 
                                    style={{ backgroundColor: `${theme.colors.primary.DEFAULT}20` }}>
                                  <LinkIcon size={16} className="mr-2" style={{ color: theme.colors.text.accent }} />
                                  <span className="font-mono" style={{ color: theme.colors.primary.light }}>
                                    {meeting.accessCode}
                                  </span>
                                </div>
                                <button
                                  onClick={() => copyAccessLink(meeting.accessCode)}
                                  className="py-1.5 px-3 rounded-r flex items-center transition-all"
                                  style={{ 
                                    backgroundColor: `${theme.colors.primary.DEFAULT}40`,
                                    color: theme.colors.primary.light
                                  }}
                                  onMouseOver={e => {
                                    e.currentTarget.style.backgroundColor = `${theme.colors.primary.DEFAULT}60`;
                                  }}
                                  onMouseLeave={e => {
                                    e.currentTarget.style.backgroundColor = `${theme.colors.primary.DEFAULT}40`;
                                  }}
                                  title="Copiar link de acesso"
                                >
                                  <Copy size={14} className="mr-1" />
                                  <span className="text-sm whitespace-nowrap">Copiar Link</span>
                                </button>
                                <div 
                                  className="copy-feedback absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded shadow-lg opacity-0 transition-opacity duration-300 pointer-events-none"
                                  style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }}
                                >
                                  Link copiado!
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;