import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function notifyReferrer(
  botToken: string,
  referrerTelegramId: number,
  newUserName: string,
) {
  try {
    const text =
      `🎉 <b>New referral joined!</b>\n\n` +
      `${newUserName} just joined TONNECT using your invite link.\n\n` +
      `💎 +100 TONNECT has been added to your balance.\n` +
      `Keep inviting to unlock bigger rewards!`;
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: referrerTelegramId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
  } catch (e) {
    console.warn('notifyReferrer failed:', e);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { telegram_user, referrer_telegram_id } = await req.json();

    if (!telegram_user || !telegram_user.id) {
      return new Response(
        JSON.stringify({ error: 'Missing telegram user data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('telegram_id', telegram_user.id)
      .maybeSingle();

    if (existingProfile) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          profile: existingProfile,
          isNew: false
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create new profile
    const referralCode = `REF${telegram_user.id}`;
    // If joining via referral, award 100 TONNECT welcome bonus to the new user
    const welcomeBonus = referrer_telegram_id ? 100 : 0;
    const { data: newProfile, error: profileError } = await supabaseClient
      .from('profiles')
      .insert({
        telegram_id: telegram_user.id,
        username: telegram_user.username || null,
        first_name: telegram_user.first_name || null,
        last_name: telegram_user.last_name || null,
        referral_code: referralCode,
        total_balance: welcomeBonus,
        photo_url: telegram_user.photo_url || null
      })
      .select()
      .single();

    if (profileError) {
      console.error('Error creating profile:', profileError);
      throw profileError;
    }

    // Handle referral if provided
    if (referrer_telegram_id && newProfile) {
      try {
        // Get referrer profile
        const { data: referrerProfile } = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('telegram_id', parseInt(referrer_telegram_id))
          .maybeSingle();

        if (referrerProfile && referrerProfile.telegram_id !== telegram_user.id) {
          // Create referral record (will fail if duplicate due to unique constraint)
          const { error: referralError } = await supabaseClient
            .from('referrals')
            .insert({
              referrer_id: referrerProfile.id,
              referred_id: newProfile.id,
              bonus_awarded: 100
            });

          if (referralError) {
            console.error('Referral creation failed:', referralError);
            // Don't throw - allow profile creation to succeed
          } else {
            // Award bonus to referrer
            const currentBalance = Number(referrerProfile.total_balance) || 0;
            const newBalance = currentBalance + 100;

            await supabaseClient
              .from('profiles')
              .update({ total_balance: newBalance })
              .eq('id', referrerProfile.id);

            console.log(`Referral bonus awarded: +100 TONNECT to user ${referrer_telegram_id}`);

            // Send Telegram notification to referrer (best-effort)
            const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
            if (botToken) {
              const newUserName =
                telegram_user.first_name ||
                telegram_user.username ||
                'A new friend';
              await notifyReferrer(
                botToken,
                Number(referrerProfile.telegram_id),
                newUserName,
              );
            }
          }
        }
      } catch (referralError) {
        console.error('Error processing referral:', referralError);
        // Don't throw - allow profile creation to succeed
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        profile: newProfile,
        isNew: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-profile:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});