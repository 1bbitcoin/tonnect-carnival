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
      return new Response(
        JSON.stringify({ error: 'Missing telegram_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('telegram_id', telegram_id)
      .single();

    if (profileError || !profile) {
      console.error('Profile not found:', profileError);
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get or create mining state
    const { data: miningState, error: miningError } = await supabaseClient
      .from('user_mining_state')
      .select('*')
      .eq('user_id', profile.id)
      .maybeSingle();

    const now = Date.now();
    const MINING_DURATION = 4 * 60 * 60 * 1000; // 4 hours in ms
    const MINING_RATE = 10; // 10 TONNECT per hour
    const MAX_MINING = 40; // 40 TONNECT max per cycle

    // No mining session yet — user must press Start
    if (!miningState) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Press Start to begin mining',
          canClaim: false,
          notStarted: true,
          miningAmount: 0,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const miningStartTime = new Date(miningState.mining_start_time).getTime();
    const lastClaimTime = miningState.last_claim_time 
      ? new Date(miningState.last_claim_time).getTime()
      : 0;

    const timeSinceStart = now - miningStartTime;

    // Check if mining duration has completed
    if (timeSinceStart < MINING_DURATION) {
      const remaining = MINING_DURATION - timeSinceStart;
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Mining in progress',
          canClaim: false,
          timeRemaining: Math.floor(remaining / 1000),
          miningAmount: Math.min((timeSinceStart / (60 * 60 * 1000)) * MINING_RATE, MAX_MINING)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate mining reward (capped at max)
    const miningAmount = MAX_MINING;
    const newBalance = Number(profile.total_balance || 0) + miningAmount;
    const newTotalMined = Number(miningState.total_mined || 0) + miningAmount;

    // Update balance
    const { error: balanceError } = await supabaseClient
      .from('profiles')
      .update({ total_balance: newBalance })
      .eq('id', profile.id);

    if (balanceError) {
      console.error('Error updating balance:', balanceError);
      throw balanceError;
    }

    // Remove mining state — user must press Start again to mine next cycle
    await supabaseClient
      .from('user_mining_state')
      .delete()
      .eq('user_id', profile.id);

    console.log(`Mining claimed: ${miningAmount} TONNECT for user ${telegram_id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        miningAmount,
        newBalance,
        message: `Successfully claimed ${miningAmount} TONNECT!`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in claim-mining:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});