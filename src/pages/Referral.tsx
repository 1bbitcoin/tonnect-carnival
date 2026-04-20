import { Button } from "@/components/ui/button";
import { Copy, Users, TrendingUp, Clock, Gift } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useTelegram } from "@/contexts/TelegramContext";
import { supabase } from "@/integrations/supabase/client";

interface ReferralData {
  id: string;
  created_at: string;
  referred_profile: {
    username: string | null;
    first_name: string | null;
  };
}

const Referral = () => {
  const { profile, isLoading } = useTelegram();
  const [referralCount, setReferralCount] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [recentReferrals, setRecentReferrals] = useState<ReferralData[]>([]);

  useEffect(() => {
    if (profile?.id) {
      fetchReferralData();
    }
  }, [profile]);

  const fetchReferralData = async () => {
    if (!profile?.id) return;

    // Get referral count and total earned
    const { data: referrals, count } = await supabase
      .from('referrals')
      .select('bonus_awarded, id, created_at, referred_id', { count: 'exact' })
      .eq('referrer_id', profile.id);

    setReferralCount(count || 0);
    
    if (referrals) {
      const total = referrals.reduce((sum, ref) => sum + (ref.bonus_awarded || 0), 0);
      setTotalEarned(total);
    }

    // Get recent referrals with user info
    const { data: recentData } = await supabase
      .from('referrals')
      .select(`
        id,
        created_at,
        referred_id,
        referred_profile:profiles!referrals_referred_id_fkey (
          username,
          first_name
        )
      `)
      .eq('referrer_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentData) {
      setRecentReferrals(recentData as any);
    }
  };

  const referralLink = profile?.telegram_id 
    ? `https://t.me/tonnect_app_bot/app?startapp=${profile.telegram_id}`
    : "";

  const stats = [
    { label: "Total Referrals", value: referralCount.toString(), icon: Users },
    { label: "Active Users", value: referralCount.toString(), icon: TrendingUp },
    { label: "Total Earned", value: `${totalEarned}`, icon: TrendingUp },
    { label: "Pending Rewards", value: "0", icon: Clock },
  ];

  const copyToClipboard = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      toast.success("Referral link copied!");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold glow-text">Referral Program</h1>
        <p className="text-muted-foreground">Invite friends and earn together</p>
      </div>

      {/* Referral Benefits */}
      <div className="cyber-card rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Gift className="w-6 h-6 text-primary" />
          Referral Rewards
        </h2>
        
        <div className="grid gap-3">
          <div className="flex items-start gap-3 p-3 bg-primary/10 rounded-lg border border-primary/30">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold">1</span>
            </div>
            <div>
              <p className="font-semibold">One-Time Bonus</p>
              <p className="text-sm text-muted-foreground">Get 100 TONNECT when friend signs up</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-secondary/10 rounded-lg border border-secondary/30">
            <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold">2</span>
            </div>
            <div>
              <p className="font-semibold">Passive Income</p>
              <p className="text-sm text-muted-foreground">Earn 5% from all their mining forever</p>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Code */}
      <div className="cyber-card rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold">Your Referral Link</h2>
        
        <div className="flex gap-2">
          <div className="flex-1 p-3 bg-muted rounded-lg border border-primary/30 overflow-hidden">
            <p className="text-sm truncate text-muted-foreground">{referralLink || 'Loading...'}</p>
          </div>
          <Button
            onClick={copyToClipboard}
            className="flex-shrink-0 bg-primary hover:bg-primary/90"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>

        <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/30">
          <p className="text-xs text-muted-foreground mb-2">Your Referral Code</p>
          <p className="text-lg font-bold font-mono">{profile?.referral_code || 'Loading...'}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="cyber-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="w-5 h-5 text-primary" />
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">
              {stat.label === "Total Earned" || stat.label === "Pending Rewards" ? "TONNECT" : ""}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Referrals */}
      <div className="cyber-card rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold">Recent Referrals</h2>
        
        {recentReferrals.length > 0 ? (
          <div className="space-y-2">
            {recentReferrals.map((referral) => (
              <div
                key={referral.id}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
              >
                <div>
                  <p className="font-medium">
                    {(referral.referred_profile as any)?.username || 
                     (referral.referred_profile as any)?.first_name || 
                     'Anonymous User'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(referral.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">
                    +100 TONNECT
                  </p>
                  <p className="text-xs text-green-400">Claimed</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-5xl mb-3 opacity-50">👥</div>
            <p className="text-muted-foreground">No referrals yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Share your referral link to start earning!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Referral;
