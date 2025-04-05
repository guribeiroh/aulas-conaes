# Configuração do Supabase para o Sistema de Aulas Virtuais

Este documento explica como configurar o Supabase para o projeto e como usar as credenciais fornecidas no arquivo `.env`.

## Passo 1: Criar uma conta no Supabase

1. Acesse [https://supabase.com/](https://supabase.com/)
2. Clique em "Start your project" ou "Sign up"
3. Crie uma conta usando GitHub, GitLab, Google ou email

## Passo 2: Criar um novo projeto

1. No dashboard do Supabase, clique em "New project"
2. Escolha uma organização (ou crie uma nova)
3. Dê um nome ao seu projeto
4. Defina uma senha para o banco de dados (guarde-a com segurança)
5. Selecione uma região próxima a você
6. Clique em "Create new project"

## Passo 3: Executar o script SQL

1. No menu lateral do Supabase, clique em "SQL Editor"
2. Clique em "New query"
3. Cole todo o conteúdo do arquivo `script_mcp_supabase.sql` que está na raiz do projeto
4. Clique em "Run" para executar o script
5. Aguarde a conclusão da execução

## Passo 4: Obter as credenciais de API

1. No menu lateral do Supabase, clique em "Project Settings" (ícone de engrenagem)
2. Clique em "API"
3. Na seção "Project URL", copie a URL (ela deve ser semelhante a `https://xyzxyzxyzxyz.supabase.co`)
4. Na seção "Project API keys", copie a chave "anon" (public)

## Passo 5: Configurar as variáveis de ambiente

1. Na raiz do projeto, localize o arquivo `.env` (ou crie um se não existir)
2. Adicione as seguintes variáveis:

```
VITE_SUPABASE_URL=sua_url_do_projeto_copiada
VITE_SUPABASE_ANON_KEY=sua_chave_anon_copiada
```

3. Salve o arquivo

## Passo 6: Verificar a integração

1. Execute o projeto com `npm run dev`
2. Acesse http://localhost:5173
3. Faça login com a senha `@conaes`
4. Verifique se você consegue:
   - Ver a lista de reuniões (se houver alguma)
   - Criar uma nova reunião
   - Acessar uma reunião via código de acesso
   - Verificar emails autorizados

## Explicação das credenciais

- **URL do Projeto (VITE_SUPABASE_URL)**: É o endereço base da API do seu projeto Supabase.
- **Chave Anônima (VITE_SUPABASE_ANON_KEY)**: É uma chave pública que permite acesso às tabelas conforme as políticas de segurança configuradas (RLS).

## Segurança e Considerações para Produção

O sistema atual utiliza apenas a chave anônima, que é adequada para desenvolvimento e teste. Para um ambiente de produção, considere:

1. **Implementar autenticação de usuários**: Use o sistema de autenticação do Supabase para gerenciar logins.
2. **Restringir políticas RLS**: Modifique as políticas para permitir operações apenas para usuários autenticados específicos.
3. **Usar variáveis de ambiente seguras**: Em serviços de hospedagem, configure as variáveis de ambiente pelo painel de controle.
4. **Implementar validação no servidor**: Adicione funções PostgreSQL para validar dados no servidor.

## Solução de Problemas

Se você encontrar erros ao tentar se conectar ao Supabase:

1. **Erro de CORS**: Verifique se o URL da sua aplicação está na lista permitida em "Project Settings > API > CORS".
2. **Erro de conexão**: Verifique se as credenciais no arquivo `.env` estão corretas e sem espaços extras.
3. **Erro nas consultas**: Verifique se as tabelas e políticas foram criadas corretamente executando as consultas da "Parte 6" do script SQL.

## Configuração para a aula de exemplo

O script criou uma aula de exemplo com os seguintes dados:

- **Título**: Introdução à Matemática Avançada
- **Professor**: Prof. Carlos Silva
- **Código de acesso**: MATH123
- **Emails autorizados**: 
  - aluno1@exemplo.com
  - aluno2@exemplo.com
  - professor@exemplo.com

Você pode acessar esta aula usando o código `MATH123` e qualquer um dos emails autorizados. 