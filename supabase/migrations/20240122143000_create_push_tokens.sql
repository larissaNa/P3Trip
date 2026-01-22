-- Tabela para armazenar tokens de notificação dos dispositivos
CREATE TABLE IF NOT EXISTS public.push_tokens (
    token TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

-- Política: Qualquer um pode inserir (para o app registrar)
-- Idealmente, deveria ser apenas authenticated users, mas para teste pode ser public
CREATE POLICY "Permitir inserção de tokens" ON public.push_tokens
    FOR INSERT WITH CHECK (true);

-- Política: Usuários podem ver seus próprios tokens (se houver auth)
-- ou Admin pode ver tudo. Aqui deixaremos aberto para simplificar o exemplo, mas cuidado em produção.
CREATE POLICY "Permitir leitura pública (cuidado)" ON public.push_tokens
    FOR SELECT USING (true);

-- Política: Atualização (upsert)
CREATE POLICY "Permitir atualização" ON public.push_tokens
    FOR UPDATE USING (true);
