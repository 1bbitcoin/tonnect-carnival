import { Button } from "@/components/ui/button";
import { User, Wallet, Settings, LogOut, Shield, Bell } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import tonnectLogo from "@/assets/new-tonnect-logo.png";
import { useTelegram } from "@/contexts/TelegramContext";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const { user, profile, isLoading } = useTelegram();
  const [referralCount, setReferralCount] = useState(0);

  useEffect(() => {
    if (profile?.id) {
      fetchReferralCount();
    }
  }, [profile]);

  const fetchReferralCount = async () => {
    if (!profile?.id) return;
    
    const { count } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_id', profile.id);
    
    setReferralCount(count || 0);
  };

  const handleConnectWallet = () => {
    toast.info("TON Wallet connection coming soon!");
  };

  const handleLogout = () => {
    toast.success("Logged out successfully");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const displayName = user?.username || user?.first_name || "Telegram User";
  const joinDate = profile?.created_at 
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : "Recently";

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold glow-text">Profile</h1>
        <p className="text-muted-foreground">Manage your account</p>
      </div>

      {/* Profile Header */}
      <div className="cyber-card rounded-2xl p-6 space-y-4">
        <div className="text-center">
          <div className="inline-block relative mb-4">
            <img
              src={tonnectLogo}
              alt="Profile"
              className="w-24 h-24 rounded-full border-2 border-primary animate-glow-pulse"
            />
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-background" />
          </div>
          
          <h2 className="text-2xl font-bold mb-1">{displayName}</h2>
          <p className="text-sm text-muted-foreground">Telegram ID: {user?.id}</p>
          <p className="text-xs text-muted-foreground mt-2">Member since {joinDate}</p>
        </div>
      </div>

      {/* Wallet Connection */}
      <div className="cyber-card rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary" />
          TON Wallet
        </h2>
        
        {false ? (
          <div className="space-y-3">
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
              <p className="text-sm font-semibold text-green-400 mb-1">Connected</p>
              <p className="text-xs text-muted-foreground font-mono truncate">
                TONxxx...xxx
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full border-destructive text-destructive hover:bg-destructive hover:text-white"
            >
              Disconnect Wallet
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-4 bg-muted/50 rounded-lg border border-primary/20">
              <p className="text-sm text-muted-foreground">
                Connect your TON wallet to withdraw tokens and access Web3 features
              </p>
            </div>
            <Button
              onClick={handleConnectWallet}
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Connect TON Wallet
            </Button>
          </div>
        )}
      </div>

      {/* Account Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="cyber-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
          <p className="text-2xl font-bold text-primary">{profile?.total_balance.toFixed(2) || '0.00'}</p>
          <p className="text-xs text-muted-foreground">TONNECT</p>
        </div>

        <div className="cyber-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-1">Referrals</p>
          <p className="text-2xl font-bold text-accent">{referralCount}</p>
          <p className="text-xs text-muted-foreground">Active users</p>
        </div>
      </div>

      {/* Settings Menu */}
      <div className="cyber-card rounded-2xl p-4 space-y-2">
        <h2 className="text-lg font-bold px-2 mb-2">Settings</h2>
        
        <button className="w-full flex items-center gap-3 p-4 rounded-lg hover:bg-muted/50 transition-colors text-left">
          <User className="w-5 h-5 text-primary" />
          <span className="font-medium">Edit Profile</span>
        </button>

        <button className="w-full flex items-center gap-3 p-4 rounded-lg hover:bg-muted/50 transition-colors text-left">
          <Bell className="w-5 h-5 text-primary" />
          <span className="font-medium">Notifications</span>
        </button>

        <button className="w-full flex items-center gap-3 p-4 rounded-lg hover:bg-muted/50 transition-colors text-left">
          <Shield className="w-5 h-5 text-primary" />
          <span className="font-medium">Security</span>
        </button>

        <button className="w-full flex items-center gap-3 p-4 rounded-lg hover:bg-muted/50 transition-colors text-left">
          <Settings className="w-5 h-5 text-primary" />
          <span className="font-medium">App Settings</span>
        </button>
      </div>

      {/* Logout Button */}
      <Button
        onClick={handleLogout}
        variant="outline"
        className="w-full h-12 border-2 border-destructive text-destructive hover:bg-destructive hover:text-white"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>

      {/* Task Coming Soon */}
      <div className="cyber-card rounded-2xl p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
          <Settings className="w-8 h-8 text-muted-foreground animate-spin-slow" />
        </div>
        <h3 className="font-bold mb-2">Tasks Feature</h3>
        <p className="text-sm text-muted-foreground">
          Complete daily tasks to earn bonus TONNECT. Coming soon!
        </p>
      </div>
    </div>
  );
};

export default Profile;
