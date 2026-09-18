import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const body = await req.json();
    const { type, data } = body as { type: 'login' | 'message'; data: Record<string, unknown> };

    // Get the Discord webhook URL from settings
    const { data: setting } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'discord_webhook_url')
      .maybeSingle();

    const webhookUrl = setting?.value;
    if (!webhookUrl) {
      return new Response(JSON.stringify({ success: false, reason: 'no_webhook' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let embed: object;

    if (type === 'login') {
      embed = {
        title: '🔔 Nové prihlásenie',
        color: 0x10b981,
        fields: [
          { name: 'Nick', value: String(data.nick ?? '—'), inline: true },
          { name: 'Meno', value: String(data.full_name ?? '—'), inline: true },
          { name: 'Email', value: String(data.email ?? '—'), inline: false },
        ],
        timestamp: new Date().toISOString(),
      };
    } else if (type === 'message') {
      const fields = [
        { name: 'Nick', value: String(data.nick ?? '—'), inline: true },
        { name: 'Meno', value: String(data.full_name ?? '—'), inline: true },
      ];
      if (data.subject) {
        fields.push({ name: 'Predmet', value: String(data.subject), inline: true });
      }
      if (data.suggested_price) {
        fields.push({ name: 'Navrhovaná cena', value: `${data.suggested_price} €`, inline: true });
      }
      fields.push({ name: 'Správa', value: String(data.content ?? '—'), inline: false });

      embed = {
        title: '📩 Nová správa z portálu',
        color: 0xf59e0b,
        fields,
        timestamp: new Date().toISOString(),
      };
    } else {
      return new Response(JSON.stringify({ error: 'invalid type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const discordResp = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    });

    if (!discordResp.ok) {
      return new Response(JSON.stringify({ success: false, reason: 'discord_error' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'unknown' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
