-- =========================================================================
-- SCRIPT DE CONFIGURAÇÃO DO SUPABASE PARA SISTEMA DE AULAS VIRTUAIS
-- =========================================================================
-- COMO USAR:
-- 1. Acesse seu projeto Supabase (https://supabase.com)
-- 2. Vá para a seção "SQL Editor"
-- 3. Crie uma nova consulta
-- 4. Cole este script completo
-- 5. Execute o script
-- =========================================================================

-- =========================================================================
-- PARTE 1: CONFIGURAÇÃO INICIAL E LIMPEZA (SE NECESSÁRIO)
-- =========================================================================

-- Remover tabelas existentes (caso precise executar o script novamente)
-- Comentado por segurança - descomente apenas se precisar limpar o banco
/*
DROP TABLE IF EXISTS public.authorized_emails;
DROP TABLE IF EXISTS public.meetings;
*/

-- =========================================================================
-- PARTE 2: CRIAÇÃO DAS TABELAS
-- =========================================================================

-- Tabela para armazenar as reuniões/aulas
CREATE TABLE public.meetings (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    title TEXT NOT NULL,
    date TEXT NOT NULL,        -- Formato: YYYY-MM-DD
    time TEXT NOT NULL,        -- Formato: HH:MM (24h)
    zoom_link TEXT NOT NULL,   -- Link completo para a reunião do Zoom
    access_code TEXT NOT NULL UNIQUE,
    professor TEXT NOT NULL,
    theme TEXT NOT NULL,
    duration INTEGER NOT NULL, -- Em minutos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Adicionar comentários para documentação da tabela
COMMENT ON TABLE public.meetings IS 'Tabela para armazenar as informações das aulas/reuniões virtuais';
COMMENT ON COLUMN public.meetings.id IS 'ID único da reunião';
COMMENT ON COLUMN public.meetings.title IS 'Título da aula';
COMMENT ON COLUMN public.meetings.date IS 'Data da aula (YYYY-MM-DD)';
COMMENT ON COLUMN public.meetings.time IS 'Horário da aula (HH:MM)';
COMMENT ON COLUMN public.meetings.zoom_link IS 'Link do Zoom para a aula';
COMMENT ON COLUMN public.meetings.access_code IS 'Código único de acesso para a aula';
COMMENT ON COLUMN public.meetings.professor IS 'Nome do professor';
COMMENT ON COLUMN public.meetings.theme IS 'Tema da aula';
COMMENT ON COLUMN public.meetings.duration IS 'Duração da aula em minutos';

-- Tabela para armazenar os emails autorizados para cada reunião
CREATE TABLE public.authorized_emails (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    meeting_id BIGINT NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(meeting_id, email)
);

-- Adicionar comentários para documentação da tabela
COMMENT ON TABLE public.authorized_emails IS 'Tabela para armazenar os emails autorizados para cada aula';
COMMENT ON COLUMN public.authorized_emails.id IS 'ID único do registro';
COMMENT ON COLUMN public.authorized_emails.meeting_id IS 'ID da reunião associada';
COMMENT ON COLUMN public.authorized_emails.email IS 'Email autorizado a participar da aula';

-- =========================================================================
-- PARTE 3: CRIAÇÃO DE ÍNDICES PARA MELHORAR A PERFORMANCE
-- =========================================================================

-- Índice para busca rápida por código de acesso
CREATE INDEX meetings_access_code_idx ON public.meetings (access_code);

-- Índices para busca rápida de emails autorizados por reunião
CREATE INDEX authorized_emails_meeting_id_idx ON public.authorized_emails (meeting_id);
CREATE INDEX authorized_emails_email_idx ON public.authorized_emails (email);

-- =========================================================================
-- PARTE 4: CONFIGURAÇÃO DE SEGURANÇA (RLS - Row Level Security)
-- =========================================================================

-- ===== Políticas para a tabela meetings =====

-- Habilitar RLS na tabela meetings
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- Política para permitir SELECT para todos (inclui usuários anônimos)
CREATE POLICY "Permitir acesso anônimo para leitura de reuniões" 
ON public.meetings FOR SELECT USING (true);

-- Política para permitir INSERT para todos (em produção, deve ser restrito)
CREATE POLICY "Permitir acesso anônimo para inserção de reuniões" 
ON public.meetings FOR INSERT WITH CHECK (true);

-- Política para permitir UPDATE para todos (em produção, deve ser restrito)
CREATE POLICY "Permitir acesso anônimo para atualização de reuniões" 
ON public.meetings FOR UPDATE USING (true);

-- Política para permitir DELETE para todos (em produção, deve ser restrito)
CREATE POLICY "Permitir acesso anônimo para exclusão de reuniões" 
ON public.meetings FOR DELETE USING (true);

-- ===== Políticas para a tabela authorized_emails =====

-- Habilitar RLS na tabela authorized_emails
ALTER TABLE public.authorized_emails ENABLE ROW LEVEL SECURITY;

-- Política para permitir SELECT para todos (inclui usuários anônimos)
CREATE POLICY "Permitir acesso anônimo para leitura de emails autorizados" 
ON public.authorized_emails FOR SELECT USING (true);

-- Política para permitir INSERT para todos (em produção, deve ser restrito)
CREATE POLICY "Permitir acesso anônimo para inserção de emails autorizados" 
ON public.authorized_emails FOR INSERT WITH CHECK (true);

-- Política para permitir UPDATE para todos (em produção, deve ser restrito)
CREATE POLICY "Permitir acesso anônimo para atualização de emails autorizados" 
ON public.authorized_emails FOR UPDATE USING (true);

-- Política para permitir DELETE para todos (em produção, deve ser restrito)
CREATE POLICY "Permitir acesso anônimo para exclusão de emails autorizados" 
ON public.authorized_emails FOR DELETE USING (true);

-- =========================================================================
-- PARTE 5: INSERÇÃO DE DADOS DE EXEMPLO (opcional)
-- =========================================================================

-- Inserir uma reunião de exemplo
INSERT INTO public.meetings (
    title, 
    date, 
    time, 
    zoom_link, 
    access_code, 
    professor, 
    theme, 
    duration
) VALUES (
    'Introdução à Matemática Avançada',
    '2024-05-31',
    '19:00',
    'https://zoom.us/j/123456789',
    'MATH123',
    'Prof. Carlos Silva',
    'Cálculo Diferencial e Integral',
    90
);

-- Obter o ID da reunião inserida
DO $$
DECLARE
    meeting_id BIGINT;
BEGIN
    SELECT id INTO meeting_id FROM public.meetings WHERE access_code = 'MATH123';
    
    -- Inserir emails autorizados para a reunião de exemplo
    INSERT INTO public.authorized_emails (meeting_id, email) VALUES
    (meeting_id, 'aluno1@exemplo.com'),
    (meeting_id, 'aluno2@exemplo.com'),
    (meeting_id, 'professor@exemplo.com');
END $$;

-- =========================================================================
-- PARTE 6: VERIFICAÇÕES FINAIS
-- =========================================================================

-- Verificar a estrutura das tabelas criadas
SELECT table_name, column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name IN ('meetings', 'authorized_emails')
ORDER BY table_name, ordinal_position;

-- Verificar as políticas de segurança criadas
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename IN ('meetings', 'authorized_emails')
ORDER BY tablename, policyname;

-- Verificar os índices criados
SELECT
    indexname,
    tablename,
    indexdef
FROM
    pg_indexes
WHERE
    schemaname = 'public' AND tablename IN ('meetings', 'authorized_emails')
ORDER BY
    tablename, indexname;

-- Verificar dados de exemplo (se foram inseridos na Parte 5)
SELECT m.title, m.professor, m.access_code, COUNT(ae.id) AS email_count
FROM public.meetings m
LEFT JOIN public.authorized_emails ae ON m.id = ae.meeting_id
GROUP BY m.id, m.title, m.professor, m.access_code;

-- =========================================================================
-- FIM DO SCRIPT
-- =========================================================================
-- Notas adicionais:
-- 1. As políticas de segurança atuais permitem acesso anônimo para todas as operações.
--    Isso é adequado para desenvolvimento, mas para produção, você deve restringir o acesso.
-- 2. Os dados de exemplo são opcionais e podem ser removidos comentando a Parte 5.
-- 3. As verificações finais ajudam a confirmar que tudo foi criado corretamente.
-- ========================================================================= 