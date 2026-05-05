const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WELCOME_IMAGE_URL =
  'https://gpeqjvaclmkwfymtruwj.supabase.co/storage/v1/object/public/telegram-assets/tonnect-2026.png';
const MINI_APP_URL = 'https://tonnect-carnival.lovable.app';
const COMMUNITY_URL = 'https://t.me/Tonnect_Real';

const WELCOME_CAPTION =
  `Welcome to <b>Tonnect App</b>! Join Tonnect Mining Carnival - ` +
  `Farm tokens, spin the wheel, refer friends and climb the ` +
  `leadboard in this futuristic Web3 mining carnival`;

async function sendWelcome(botToken: string, chatId: number, startParam?: string) {
  const appUrl = startParam
    ? `${MINI_APP_URL}?startapp=${encodeURIComponent(startParam)}`
    : MINI_APP_URL;

  const reply_markup = {
    inline_keyboard: [
      [{ text: '🚀 Open App', web_app: { url: appUrl } }],
      [{ text: '👥 Join the community', url: COMMUNITY_URL }],
    ],
  };

  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      photo: WELCOME_IMAGE_URL,
      caption: WELCOME_CAPTION,
      parse_mode: 'HTML',
      reply_markup,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('sendPhoto failed:', res.status, errText);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      return new Response(JSON.stringify({ error: 'Bot token missing' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const update = await req.json();
    const message = update?.message;
    const text: string | undefined = message?.text;
    const chatId: number | undefined = message?.chat?.id;

    if (chatId && typeof text === 'string' && text.startsWith('/start')) {
      const parts = text.split(' ');
      const startParam = parts.length > 1 ? parts.slice(1).join(' ').trim() : undefined;
      await sendWelcome(botToken, chatId, startParam);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('telegram-webhook error:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'unknown' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});