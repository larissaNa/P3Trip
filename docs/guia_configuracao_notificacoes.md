# Guia de Configuração e Arquitetura de Notificações Push

Este documento descreve a infraestrutura implementada para o envio automático de notificações push quando uma nova viagem é cadastrada.

## 1. Visão Geral da Arquitetura

O sistema utiliza um modelo **Event-Driven** (orientado a eventos) baseado no banco de dados. O Painel Administrativo não precisa se comunicar diretamente com serviços de notificação; ele apenas insere dados.

1.  **Admin Web**: Insere uma nova linha na tabela `viagem`.
2.  **Supabase Database**: Detecta o evento `INSERT` na tabela `viagem`.
3.  **Supabase Webhook**: Dispara automaticamente a Edge Function `notify-users`.
4.  **Edge Function (`notify-users`)**:
    *   Lê os tokens dos usuários na tabela `push_tokens`.
    *   Envia a mensagem para a API da Expo.
5.  **Expo Push Service**: Entrega a notificação para os dispositivos (Android/iOS).
6.  **App Mobile**: Recebe a notificação e, ao clicar, abre os detalhes da viagem.

---

## 2. Passo a Passo de Configuração Realizada

### A. Banco de Dados (Tabelas)

Foi criada a tabela para armazenar os tokens dos dispositivos móveis.

**Script SQL Executado (`supabase/migrations/20240122143000_create_push_tokens.sql`):**

```sql
CREATE TABLE IF NOT EXISTS public.push_tokens (
    token TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Permissões (RLS)
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir inserção de tokens" ON public.push_tokens FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir leitura pública" ON public.push_tokens FOR SELECT USING (true);
CREATE POLICY "Permitir atualização" ON public.push_tokens FOR UPDATE USING (true);
```

### B. Edge Function (`notify-users`)

Foi criada uma função Serverless em Deno para processar o envio.

*   **Local:** `supabase/functions/notify-users/index.ts`
*   **Lógica:**
    *   Recebe o payload do Webhook (contendo os dados da nova viagem).
    *   Busca todos os tokens na tabela `push_tokens`.
    *   Formata a mensagem com Título e Corpo.
    *   Inclui `data: { type: "NEW_TRAVEL", travelId: "..." }` para deep linking.
    *   Envia para `https://exp.host/--/api/v2/push/send`.

**Comando de Deploy:**
```bash
supabase functions deploy notify-users
```

### C. Configuração do Webhook (Manual Necessária)

Para ligar a tabela à função, é necessário configurar um Database Webhook no painel do Supabase:

1.  Acesse **Database > Webhooks**.
2.  Clique em **Create a new webhook**.
3.  **Nome:** `notificar-nova-viagem`.
4.  **Tabela:** `viagem`.
5.  **Eventos:** Marcar `INSERT`.
6.  **Tipo:** `Supabase Edge Functions`.
7.  **Função:** Selecionar `notify-users`.
8.  **Método:** `POST`.
9.  **Timeout:** `10000` (padrão).

---

## 3. Instruções para o Painel Web Admin

Como a arquitetura mudou para **Database Triggers**, o Painel Web deve ser simplificado.

### O que DEVE ser feito:
*   **Inserção Normal:** Continuar inserindo novos registros na tabela `viagem` normalmente. Não é necessária nenhuma mudança na lógica de cadastro ("INSERT").

### O que DEVE ser REMOVIDO (Limpeza):
*   **Chamadas de API Antigas:** Se o painel fazia uma requisição `POST /api/send-push` ou chamava outra Edge Function manualmente após salvar a viagem, **remova esse código**. O disparo agora é automático pelo banco.
*   **Tabelas Antigas:** Se o painel lia ou escrevia em uma tabela de "fila de notificações" antiga, isso não é mais necessário para este fluxo.

### Prompt para Atualização do Painel Web (Para IA ou Desenvolvedor)

Se você estiver atualizando o código do Painel Web, utilize o seguinte contexto:

> "O sistema de notificações foi migrado para uma arquitetura baseada em gatilhos do banco de dados (Database Webhooks).
>
> **Alterações necessárias no Painel Web:**
> 1. Remova qualquer lógica que dispare notificações manualmente (chamadas de API, Edge Functions antigas) após o cadastro de uma viagem.
> 2. O Painel deve apenas realizar o `INSERT` na tabela `viagem`. O Supabase cuidará do resto automaticamente.
> 3. Ignore/Remova referências a tabelas antigas de push tokens; o App Mobile agora registra tokens automaticamente na tabela `push_tokens`."
