import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // User client to verify auth
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { agenda_id, email, permissao } = await req.json();

    if (!agenda_id || !email || !permissao) {
      return new Response(JSON.stringify({ error: "Dados incompletos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Admin client to look up user by email
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the caller owns this agenda
    const { data: agenda } = await adminClient
      .from("agendas")
      .select("dono_id")
      .eq("id", agenda_id)
      .single();

    if (!agenda || agenda.dono_id !== user.id) {
      return new Response(JSON.stringify({ error: "Você não é dono desta agenda" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find target user by email
    const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers();
    const targetUser = users?.find((u: any) => u.email === email);

    if (!targetUser) {
      return new Response(JSON.stringify({ error: "Usuário não encontrado com este email" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (targetUser.id === user.id) {
      return new Response(JSON.stringify({ error: "Você não pode compartilhar consigo mesmo" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create or update the share
    const { data: share, error: shareError } = await adminClient
      .from("agenda_compartilhada")
      .upsert(
        { agenda_id, usuario_id: targetUser.id, permissao },
        { onConflict: "agenda_id,usuario_id" }
      )
      .select()
      .single();

    if (shareError) {
      return new Response(JSON.stringify({ error: "Erro ao compartilhar: " + shareError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, share, usuario_nome: targetUser.user_metadata?.nome || email }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
