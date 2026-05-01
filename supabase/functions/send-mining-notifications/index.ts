import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MINING_DURATION_MS = 4 * 60 * 60 * 1000; // 4 hours

async function sendTelegram(botToken: string, chatId: number, text: string) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
    const data = await res.json();
    if (!data.ok) {
      console.warn(`sendMessage failed for ${chatId}:`, data);
      return false;
    }
    return true;
  } catch (e) {
    console.error(`sendMessage error for ${chatId}:`, e);
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
  if (!botToken) {
    return new Response(JSON.stringify({ error: 'TELEGRAM_BOT_TOKEN not configured' }), {
      status: 503,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const cutoffIso = new Date(Date.now() - MINING_DURATION_MS).toISOString();

  // All users whose mining cycle has completed but haven't claimed yet
  const { data: states, error } = await supabase
    .from('user_mining_state')
    .select('user_id, mining_start_time, profiles:profiles!inner(telegram_id, first_name)')
    // @ts-ignore - PostgREST inner join via FK is not declared, so fetch all & filter in code
    ;

  if (error) {
    console.error('Failed to load mining states:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let sent = 0;
  let skipped = 0;

  for (const row of states ?? []) {
    const startTime = new Date(row.mining_start_time).getTime();
    if (Date.now() - startTime < MINING_DURATION_MS) {
      skipped++;
      continue;
    }

    const profile: any = (row as any).profiles;
    const telegramId = profile?.telegram_id;
    if (!telegramId) {
      skipped++;
      continue;
    }

    const refKey = row.mining_start_time; // unique per mining cycle

    // Try to record notification first (idempotent via unique constraint)
    const { error: insertErr } = await supabase
      .from('notifications_log')
      .insert({
        user_id: row.user_id,
        notif_type: 'mining_full',
        ref_key: refKey,
      });

    if (insertErr) {
      // duplicate => already sent for this cycle
      skipped++;
      continue;
    }

    const name = profile?.first_name ? `, ${profile.first_name}` : '';
    const text =
      `⛏️ <b>Mining tank is FULL${name}!</b>\n\n` +
      `Your TONNECT is ready to be claimed. Open the app and tap <b>Claim</b> before starting the next cycle.\n\n` +
      `🚀 Don't let your rewards sit idle!`;

    const ok = await sendTelegram(botToken, Number(telegramId), text);
    if (ok) {
      sent++;
    } else {
      // rollback log so we retry next run
      await supabase
        .from('notifications_log')
        .delete()
        .eq('user_id', row.user_id)
        .eq('notif_type', 'mining_full')
        .eq('ref_key', refKey);
    }
  }

  console.log(`mining notifications: sent=${sent}, skipped=${skipped}`);

  return new Response(
    JSON.stringify({ success: true, sent, skipped }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});