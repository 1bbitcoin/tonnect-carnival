import { useState, useEffect } from "react";
import { Coins, TrendingUp } from "lucide-react";
import tonnectLogo from "@/assets/new-tonnect-logo.png";
import { useTelegram } from "@/contexts/TelegramContext";
import { supabase } from "@/integrations/supabase/client";
import TasksSection from "@/components/TasksSection";

const Dashboard = () => {
  const { profile } = useTelegram();
  const [totalSupply] = useState(10000000000); // 10 Billion
  const [claimedTokens, setClaimedTokens] = useState(0);

  useEffect(() => {
    fetchTotalClaimed();
    
    // Update claimed tokens every 5 seconds
    const interval = setInterval(() => {
      fetchTotalClaimed();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchTotalClaimed = async () => {
    // Use a DB-side aggregate so we don't hit the 1000-row query cap
    const { data, error } = await (supabase as any).rpc('get_total_claimed');
    if (!error && data !== null && data !== undefined) {
      setClaimedTokens(Number(data) || 0);
    }
  };

  const remainingSupply = totalSupply - claimedTokens;
  const rawPercentage = (claimedTokens / totalSupply) * 100;
  // Show enough precision for very small percentages (early stage)
  const claimedPercentage =
    rawPercentage === 0
      ? "0"
      : rawPercentage >= 1
      ? rawPercentage.toFixed(2)
      : rawPercentage >= 0.01
      ? rawPercentage.toFixed(4)
      : rawPercentage.toPrecision(2);
  // Ensure progress bar is visible even for tiny percentages
  const barWidth = rawPercentage > 0 ? Math.max(rawPercentage, 0.5) : 0;

  return (
    <div className="space-y-6">
      {/* Header with Logo */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <img
            src={tonnectLogo}
            alt="TONNECT Logo"
            className="w-24 h-24 rounded-full animate-glow-pulse"
          />
        </div>
        <h1 className="text-4xl font-bold glow-text">TONNECT</h1>
        <p className="text-lg text-accent">Mining Carnival</p>
      </div>

      {/* Total Supply Card */}
      <div className="cyber-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Coins className="w-6 h-6 text-primary" />
            Total Supply
          </h2>
          <span className="text-sm text-muted-foreground">Live</span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Claimed</span>
            <span className="text-primary font-bold">{claimedPercentage}%</span>
          </div>
          
          <div className="relative h-4 bg-muted rounded-full overflow-hidden">
            <div
              className="absolute h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 animate-glow-pulse"
              style={{ width: `${barWidth}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-xs text-muted-foreground">Claimed</p>
              <p className="text-lg font-bold text-primary">
                {claimedTokens.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Remaining</p>
              <p className="text-lg font-bold text-secondary">
                {remainingSupply.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User Balance Card */}
      <div className="cyber-card rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-accent" />
          Your Balance
        </h2>
        
        <div className="text-center py-4">
          <p className="text-5xl font-bold glow-text">{Number(profile?.total_balance || 0).toLocaleString()}</p>
          <p className="text-lg text-muted-foreground mt-2">TONNECT</p>
        </div>
      </div>

      {/* Store */}
      <div className="grid grid-cols-1 gap-4">
        <div className="cyber-card rounded-xl p-4 text-center opacity-75">
          <div className="text-5xl mb-2 animate-float">🏪</div>
          <p className="font-bold">Store</p>
          <p className="text-xs text-muted-foreground mt-1">Coming Soon</p>
        </div>
      </div>

      {/* Tasks Section (moved from /tasks page) */}
      <TasksSection />
    </div>
  );
};

export default Dashboard;
