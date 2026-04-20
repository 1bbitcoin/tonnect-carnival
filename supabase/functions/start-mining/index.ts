import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { telegram_id } = await req.json();
    if (!telegram_id) {
      return new Response(JSON.stringify({ error: 'Missing telegram_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('telegram_id', telegram_id)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const MINING_DURATION = 4 * 60 * 60 * 1000;
    const now = Date.now();

    const { data: existing } = await supabaseClient
      .from('user_mining_state')
      .select('mining_start_time')
      .eq('user_id', profile.id)
      .maybeSingle();

    if (existing) {
      const startTime = new Date(existing.mining_start_time).getTime();
      const elapsed = now - startTime;
      if (elapsed < MINING_DURATION) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Mining already in progress',
            timeRemaining: Math.floor((MINING_DURATION - elapsed) / 1000),
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      // Already completed — user must claim first
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Please claim your previous mining first',
          canClaim: true,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const startIso = new Date().toISOString();
    await supabaseClient.from('user_mining_state').insert({
      user_id: profile.id,
      mining_start_time: startIso,
      total_mined: 0,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Mining started! Come back in 4 hours.',
        mining_start_time: startIso,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in start-mining:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
