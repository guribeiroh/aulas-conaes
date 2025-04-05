# Sistema de Gerenciamento de Aulas Virtuais

Um sistema completo para gerenciar aulas virtuais, com integração ao Supabase para persistência de dados.

## Funcionalidades

- Painel administrativo protegido por senha
- Cadastro de aulas virtuais com professor, tema, duração, data e hora
- Gerenciamento de participantes através de emails autorizados
- Tela para verificação de acesso por email
- Contagem regressiva para início da aula
- Detecção automática de aula em andamento
- Link direto para plataforma de vídeo (Zoom)

## Tecnologias

- React
- TypeScript
- Tailwind CSS
- Vite
- Supabase (banco de dados e autenticação)

## Configuração

### Pré-requisitos

- Node.js (v14 ou superior)
- Conta no Supabase (gratuita)

### Configuração do Supabase

1. Crie uma conta no [Supabase](https://supabase.com/)
2. Crie um novo projeto
3. Execute o SQL do arquivo `supabase_schema.sql` no editor SQL do Supabase para criar as tabelas necessárias
4. Na seção "Settings > API", copie a URL e a chave anônima

### Configuração do projeto

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon_supabase
```

## Executando o projeto

1. Inicie o servidor de desenvolvimento: `npm run dev`
2. Acesse o aplicativo em http://localhost:5173
3. Faça login com a senha `@conaes` para acessar o painel administrativo

## Produção

Para criar uma build de produção:

```
npm run build
```

Os arquivos serão gerados na pasta `dist`.

## Estrutura do projeto

- `src/components/`: Componentes React
  - `AdminPanel.tsx`: Painel administrativo
  - `ClassAccess.tsx`: Tela de acesso às aulas
  - `AuthForm.tsx`: Formulário de autenticação
- `src/lib/`: Bibliotecas e utilitários
  - `supabase.ts`: Configuração e funções para interagir com o Supabase
- `supabase_schema.sql`: Schema do banco de dados

## Segurança

Esse é um projeto de demonstração. Em um ambiente de produção, você deve:

1. Implementar autenticação mais robusta (Supabase Auth)
2. Configurar políticas RLS (Row Level Security) mais restritivas
3. Usar HTTPS para comunicação segura
4. Validar todos os inputs no servidor

## Licença

MIT 