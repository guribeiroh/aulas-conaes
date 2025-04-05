// Tema centralizado para consistência visual
export const theme = {
  colors: {
    // Cores principais
    primary: {
      DEFAULT: '#10B981', // Verde mais sofisticado
      light: '#34D399',
      dark: '#059669',
      hover: '#047857'
    },
    // Fundos e painéis
    background: {
      dark: '#111827',     // Fundo principal (mais escuro e sofisticado)
      DEFAULT: '#1F2937',  // Fundo de cartões
      light: '#374151',    // Fundo de cartões secundários
      input: '#111827'     // Fundo de inputs
    },
    // Texto
    text: {
      primary: '#F9FAFB',
      secondary: '#D1D5DB',
      muted: '#9CA3AF',
      accent: '#10B981'
    },
    // Estados
    state: {
      error: '#EF4444',
      warning: '#F59E0B',
      success: '#10B981',
      info: '#3B82F6'
    }
  },
  // Bordas e arredondamentos
  border: {
    radius: {
      sm: '0.375rem',
      DEFAULT: '0.5rem',
      md: '0.75rem',
      lg: '1rem'
    },
    width: {
      DEFAULT: '1px',
      medium: '2px',
      thick: '3px'
    }
  },
  // Espaçamentos
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    DEFAULT: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem'
  },
  // Sombras
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    DEFAULT: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  },
  // Fontes
  typography: {
    fontFamily: {
      DEFAULT: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, monospace'
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  }
}; 