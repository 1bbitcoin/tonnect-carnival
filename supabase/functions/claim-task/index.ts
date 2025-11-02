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

    const { telegram_id, task_id, reward_amount } = await req.json();

    if (!telegram_id || !task_id || !reward_amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
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

    // Check if task already claimed
    const { data: existingClaim } = await supabaseClient
      .from('user_task_completions')
      .select('*')
      .eq('user_id', profile.id)
      .eq('task_id', task_id)
      .maybeSingle();

    if (existingClaim) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Task already claimed' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate reward amount (prevent client manipulation)
    const validRewards = [100, 150, 200, 250, 300, 350, 400, 500];
    if (!validRewards.includes(Number(reward_amount))) {
      return new Response(
        JSON.stringify({ error: 'Invalid reward amount' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For referral tasks, validate friend count
    if (task_id.includes('friend')) {
      const requiredFriends = parseInt(task_id.replace('friend', ''));
      
      const { count, error: countError } = await supabaseClient
        .from('referrals')
        .select('*', { count: 'exact', head: true })
        .eq('referrer_id', profile.id);

      if (countError || (count ?? 0) < requiredFriends) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: `You need ${requiredFriends} referrals to claim this task` 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Update balance
    const newBalance = Number(profile.total_balance || 0) + Number(reward_amount);
    const { error: balanceError } = await supabaseClient
      .from('profiles')
      .update({ total_balance: newBalance })
      .eq('id', profile.id);

    if (balanceError) {
      console.error('Error updating balance:', balanceError);
      throw balanceError;
    }

    // Record task completion
    await supabaseClient
      .from('user_task_completions')
      .insert({
        user_id: profile.id,
        task_id,
        reward_amount: Number(reward_amount)
      });

    console.log(`Task claimed: ${task_id} - ${reward_amount} TONNECT for user ${telegram_id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        reward: Number(reward_amount),
        newBalance,
        message: `Successfully claimed ${reward_amount} TONNECT!`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in claim-task:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});