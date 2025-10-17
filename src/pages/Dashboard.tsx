import { useState, useEffect } from "react";
import { Coins, TrendingUp, Zap, Gift } from "lucide-react";
import tonnectLogo from "@/assets/tonnect-logo.jpeg";

const Dashboard = () => {
  const [totalSupply] = useState(1000000000); // 1 Billion
  const [claimedTokens, setClaimedTokens] = useState(0);
  const [userBalance] = useState(0);

  const remainingSupply = totalSupply - claimedTokens;
  const claimedPercentage = ((claimedTokens / totalSupply) * 100).toFixed(2);

  useEffect(() => {
    // Simulate real-time claiming by other users
    const interval = setInterval(() => {
      setClaimedTokens((prev) => prev + Math.floor(Math.random() * 100));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
              style={{ width: `${claimedPercentage}%` }}
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
          <p className="text-5xl font-bold glow-text">{userBalance.toLocaleString()}</p>
          <p className="text-lg text-muted-foreground mt-2">TONNECT</p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center pt-4 border-t border-primary/20">
          <div>
            <p className="text-2xl font-bold text-primary">+0</p>
            <p className="text-xs text-muted-foreground">Today</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-secondary">+0</p>
            <p className="text-xs text-muted-foreground">This Week</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-accent">-</p>
            <p className="text-xs text-muted-foreground">Rank</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <a
          href="/mining"
          className="cyber-card rounded-xl p-4 text-center hover:scale-105 transition-transform"
        >
          <div className="text-5xl mb-2 animate-float">⛏️</div>
          <p className="font-bold">Start Mining</p>
        </a>
        <a
          href="/spin"
          className="cyber-card rounded-xl p-4 text-center hover:scale-105 transition-transform"
        >
          <div className="text-5xl mb-2 animate-float">🎰</div>
          <p className="font-bold">Spin Now</p>
        </a>
      </div>

      {/* Task Coming Soon */}
      <div className="cyber-card rounded-xl p-6 text-center opacity-75">
        <div className="text-6xl mb-3 animate-float">📋</div>
        <p className="font-bold text-xl mb-2">Tasks</p>
        <p className="text-sm text-muted-foreground">Coming Soon</p>
      </div>
    </div>
  );
};

export default Dashboard;
