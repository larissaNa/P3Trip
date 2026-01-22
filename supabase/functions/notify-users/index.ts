import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

serve(async (req) => {
  try {
    const { record, type } = await req.json();

    // Apenas processar se for uma inserção (INSERT)
    if (type !== "INSERT") {
      return new Response(JSON.stringify({ message: "Not an INSERT event" }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    const newTravel = record;

    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar todos os tokens de notificação
    const { data: tokens, error } = await supabase
      .from("push_tokens")
      .select("token");

    if (error) {
      throw error;
    }

    if (!tokens || tokens.length === 0) {
      return new Response(JSON.stringify({ message: "No tokens found" }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Preparar mensagens para o Expo
    const messages = tokens.map((t) => ({
      to: t.token,
      sound: "default",
      title: "Nova Viagem Disponível! 🌍",
      body: `Confira agora: ${newTravel.titulo || "Nova aventura"}`,
      data: {
        type: "NEW_TRAVEL",
        travelId: newTravel.id,
      },
    }));

    // Enviar notificações em lotes (chunks) é recomendado, mas aqui faremos simples
    const response = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json();

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
