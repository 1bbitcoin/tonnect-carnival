import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Users, Copy, Gift, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const Referral = () => {
  const [referralCode] = useState("TONNECT-XYZ123");
  const referralLink = `https://tonnect.app/ref/${referralCode}`;
  
  const stats = {
    totalReferrals: 0,
    activeReferrals: 0,
    totalEarned: 0,
    pendingRewards: 0,
  };

  const recentReferrals: { username: string; earned: number; status: string }[] = [];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied!");
  };

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
            <p className="text-sm truncate text-muted-foreground">{referralLink}</p>
          </div>
          <Button
            onClick={copyToClipboard}
            className="flex-shrink-0 bg-primary hover:bg-primary/90"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>

        <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/30">
          <p className="text-xs text-muted-foreground mb-1">Your Code</p>
          <p className="text-2xl font-bold text-primary">{referralCode}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="cyber-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-primary" />
            <p className="text-sm text-muted-foreground">Total</p>
          </div>
          <p className="text-2xl font-bold">{stats.totalReferrals}</p>
          <p className="text-xs text-muted-foreground">Referrals</p>
        </div>

        <div className="cyber-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            <p className="text-sm text-muted-foreground">Active</p>
          </div>
          <p className="text-2xl font-bold text-accent">{stats.activeReferrals}</p>
          <p className="text-xs text-muted-foreground">Users</p>
        </div>

        <div className="cyber-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-5 h-5 text-primary" />
            <p className="text-sm text-muted-foreground">Earned</p>
          </div>
          <p className="text-2xl font-bold text-primary">{stats.totalEarned}</p>
          <p className="text-xs text-muted-foreground">TONNECT</p>
        </div>

        <div className="cyber-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-secondary" />
            <p className="text-sm text-muted-foreground">Pending</p>
          </div>
          <p className="text-2xl font-bold text-secondary">{stats.pendingRewards}</p>
          <p className="text-xs text-muted-foreground">TONNECT</p>
        </div>
      </div>

      {/* Recent Referrals */}
      <div className="cyber-card rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold">Recent Referrals</h2>
        
        {recentReferrals.length > 0 ? (
          <div className="space-y-2">
            {recentReferrals.map((ref, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <div>
                  <p className="font-semibold">{ref.username}</p>
                  <p className="text-xs text-muted-foreground">+{ref.earned} TONNECT earned</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    ref.status === "Active"
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {ref.status}
                </span>
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
