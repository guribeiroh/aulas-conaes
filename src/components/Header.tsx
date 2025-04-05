import React, { useState, useEffect } from 'react';

interface HeaderProps {
  className?: string;
}

/**
 * Componente de cabeçalho utilizado em todas as páginas da aplicação
 */
const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  // Estado para detectar se é um dispositivo móvel
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

  return (
    <header className={`w-full py-2 sm:py-2.5 px-3 sm:px-6 bg-slate-900 shadow-md ${className}`}>
      <div className="container mx-auto flex items-center justify-center">
        {/* Logo da empresa - ajuste de tamanho para mobile */}
        <img 
          src="/images/2024 - Logo Conaes.png" 
          alt="Logo Conaes" 
          className="h-7 sm:h-8 w-auto object-contain drop-shadow-sm"
          style={{ filter: 'drop-shadow(0 1px 1px rgba(0, 0, 0, 0.15))' }}
        />
      </div>
    </header>
  );
};

export default Header; 