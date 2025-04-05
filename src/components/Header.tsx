import React from 'react';

interface HeaderProps {
  className?: string;
}

/**
 * Componente de cabeçalho utilizado em todas as páginas da aplicação
 */
const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  return (
    <header className={`w-full py-2.5 px-6 bg-slate-900 shadow-md ${className}`}>
      <div className="container mx-auto flex items-center justify-center">
        {/* Logo da empresa */}
        <img 
          src="/images/2024 - Logo Conaes.png" 
          alt="Logo Conaes" 
          className="h-8 w-auto object-contain drop-shadow-sm"
          style={{ filter: 'drop-shadow(0 1px 1px rgba(0, 0, 0, 0.15))' }}
        />
      </div>
    </header>
  );
};

export default Header; 