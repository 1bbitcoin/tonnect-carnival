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

    const { telegram_id, bypass_cooldown } = await req.json();

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

    const now = new Date();

    // Check last spin time (24 hour cooldown) — skip if bypass_cooldown (ad-earned spin)
    if (!bypass_cooldown) {
      const { data: lastSpin } = await supabaseClient
        .from('user_spin_history')
        .select('spin_time')
        .eq('user_id', profile.id)
        .order('spin_time', { ascending: false })
        .limit(1)
        .maybeSingle();

      const SPIN_COOLDOWN = 24 * 60 * 60 * 1000;

      if (lastSpin) {
        const lastSpinTime = new Date(lastSpin.spin_time).getTime();
        const timeSinceLastSpin = now.getTime() - lastSpinTime;

        if (timeSinceLastSpin < SPIN_COOLDOWN) {
          const remaining = SPIN_COOLDOWN - timeSinceLastSpin;
          return new Response(
            JSON.stringify({
              success: false,
              message: 'Spin cooldown active',
              canSpin: false,
              timeRemaining: Math.floor(remaining / 1000)
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // Define prizes with proper weights (server-side randomization)
    const prizes = [
      { value: 5, weight: 30 },   // 30% chance
      { value: 10, weight: 25 },  // 25% chance
      { value: 15, weight: 20 },  // 20% chance
      { value: 25, weight: 15 },  // 15% chance
      { value: 50, weight: 7 },   // 7% chance
      { value: 100, weight: 2.5 }, // 2.5% chance
      { value: 200, weight: 0.5 } // 0.5% chance
    ];

    // Calculate total weight
    const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0);
    
    // Generate random number
    const random = Math.random() * totalWeight;
    
    // Select prize based on weight
    let cumulativeWeight = 0;
    let selectedPrize = prizes[0];
    
    for (const prize of prizes) {
      cumulativeWeight += prize.weight;
      if (random <= cumulativeWeight) {
        selectedPrize = prize;
        break;
      }
    }

    const prizeValue = selectedPrize.value;

    // Update balance
    const newBalance = Number(profile.total_balance || 0) + prizeValue;
    const { error: balanceError } = await supabaseClient
      .from('profiles')
      .update({ total_balance: newBalance })
      .eq('id', profile.id);

    if (balanceError) {
      console.error('Error updating balance:', balanceError);
      throw balanceError;
    }

    // Record spin
    await supabaseClient
      .from('user_spin_history')
      .insert({
        user_id: profile.id,
        prize_value: prizeValue,
        spin_time: now.toISOString()
      });

    console.log(`Spin completed: ${prizeValue} TONNECT for user ${telegram_id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        prizeValue,
        newBalance,
        message: `You won ${prizeValue} TONNECT!`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in claim-spin:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});