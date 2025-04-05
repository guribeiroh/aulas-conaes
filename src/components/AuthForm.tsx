import React, { useState } from 'react';
import { Mail, Phone, ArrowRight, RefreshCw } from 'lucide-react';
import { theme } from '../styles/theme';

const AuthForm = () => {
  const [contactInfo, setContactInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate authentication
    setTimeout(() => {
      window.location.href = 'https://zoom.us/j/example'; // This would be your actual Zoom URL
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" 
         style={{ backgroundColor: theme.colors.background.dark }}>
      <div className="max-w-md w-full backdrop-blur-sm rounded-xl overflow-hidden shadow-xl" 
           style={{ backgroundColor: theme.colors.background.DEFAULT }}>
        <div className="p-8 relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400 to-green-700 opacity-10 rounded-bl-full"></div>
          
          <h2 className="text-2xl font-bold mb-1.5" 
              style={{ color: theme.colors.primary.light }}>
            Acesso à Aula Virtual
          </h2>
          <p className="mb-8" style={{ color: theme.colors.text.muted }}>
            Digite seu email ou telefone para acessar a aula
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 transform -translate-y-1/2" 
                   style={{ color: theme.colors.primary.DEFAULT }}>
                {contactInfo.includes('@') ? <Mail size={18} /> : <Phone size={18} />}
              </div>
              <input
                type="text"
                required
                className="w-full py-3 pl-11 pr-4 rounded-lg border transition-all"
                placeholder="Email ou Telefone"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                style={{ 
                  backgroundColor: theme.colors.background.input,
                  borderColor: `${theme.colors.text.muted}50`,
                  color: theme.colors.text.primary
                }}
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ 
                backgroundColor: theme.colors.primary.DEFAULT, 
                color: theme.colors.text.primary,
                boxShadow: theme.shadow.sm
              }}
              onMouseOver={e => !isLoading && (e.currentTarget.style.backgroundColor = theme.colors.primary.hover)}
              onMouseLeave={e => !isLoading && (e.currentTarget.style.backgroundColor = theme.colors.primary.DEFAULT)}
            >
              {isLoading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <ArrowRight size={18} />
                  <span>Acessar Aula</span>
                </>
              )}
            </button>
          </form>
          
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-400 to-green-700 opacity-10 rounded-tr-full"></div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;