import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Zap, Clock, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import miningIcon from "@/assets/mining-icon.jpeg";
import { addBalance, getBalance, getTotalMined } from "@/lib/balance";

const Mining = () => {
  const tokensPerHour = 10;
  const maxTokens = 40; // 4 hours * 10 tokens
  const totalSeconds = 14400; // 4 hours in seconds

  const [miningAmount, setMiningAmount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [canClaim, setCanClaim] = useState(false);
  const [isMining, setIsMining] = useState(true);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [totalMined, setTotalMined] = useState(0);

  // Load mining state from localStorage on mount
  useEffect(() => {
    setCurrentBalance(getBalance());
    setTotalMined(getTotalMined());
    
    const savedState = localStorage.getItem('miningState');
    if (savedState) {
      const { startTime, lastClaimTime, totalMined } = JSON.parse(savedState);
      const now = Date.now();
      const elapsed = (now - startTime) / 1000; // seconds
      
      if (elapsed >= totalSeconds) {
        // Ready to claim
        setMiningAmount(maxTokens);
        setTimeLeft(0);
        setCanClaim(true);
      } else {
        // Still mining
        const earnedAmount = Math.min((elapsed / 3600) * tokensPerHour, maxTokens);
        setMiningAmount(earnedAmount);
        setTimeLeft(Math.max(0, totalSeconds - Math.floor(elapsed)));
        setCanClaim(false);
      }
    } else {
      // First time mining - initialize state
      const now = Date.now();
      localStorage.setItem('miningState', JSON.stringify({
        startTime: now,
        lastClaimTime: 0,
        totalMined: 0
      }));
    }
  }, []);

  // Update mining progress every second
  useEffect(() => {
    const interval = setInterval(() => {
      const savedState = localStorage.getItem('miningState');
      if (!savedState) return;

      const { startTime } = JSON.parse(savedState);
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;

      if (elapsed >= totalSeconds) {
        setMiningAmount(maxTokens);
        setTimeLeft(0);
        setCanClaim(true);
      } else {
        const earnedAmount = Math.min((elapsed / 3600) * tokensPerHour, maxTokens);
        setMiningAmount(earnedAmount);
        setTimeLeft(Math.max(0, totalSeconds - Math.floor(elapsed)));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleClaim = () => {
    const savedState = localStorage.getItem('miningState');
    let newTotalMined = 0;
    
    if (savedState) {
      const state = JSON.parse(savedState);
      newTotalMined = (state.totalMined || 0) + miningAmount;
    } else {
      newTotalMined = miningAmount;
    }
    
    // Add to balance
    const newBalance = addBalance(miningAmount);
    
    // Reset mining cycle
    const now = Date.now();
    localStorage.setItem('miningState', JSON.stringify({
      startTime: now,
      lastClaimTime: now,
      totalMined: newTotalMined
    }));
    
    toast.success(`Claimed ${miningAmount.toFixed(2)} TONNECT!`);
    setMiningAmount(0);
    setTimeLeft(totalSeconds);
    setCanClaim(false);
    setCurrentBalance(newBalance);
    setTotalMined(newTotalMined);
  };

  const handleBoost = () => {
    toast.info("Boost feature coming soon!");
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold glow-text">Mining</h1>
        <p className="text-muted-foreground">Farm TONNECT every hour</p>
      </div>

      {/* Mining Status Card */}
      <div className="cyber-card rounded-2xl p-8 space-y-6">
        <div className="text-center">
          <div className="relative inline-block animate-float">
            <div className="w-24 h-24 rounded-full overflow-hidden shadow-[0_0_30px_rgba(0,212,255,0.6)] ring-2 ring-primary/50">
              <img 
                src={miningIcon} 
                alt="Mining" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Mining Progress</p>
            <p className="text-5xl font-bold glow-text">
              {miningAmount.toFixed(2)}
            </p>
            <p className="text-lg text-muted-foreground mt-1">
              / {maxTokens} TONNECT
            </p>
          </div>

          <div className="relative h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="absolute h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 animate-glow-pulse"
              style={{ width: `${(miningAmount / maxTokens) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span className="text-sm">
            {canClaim ? "Ready to claim!" : `Next claim in: ${formatTime(timeLeft)}`}
          </span>
        </div>
      </div>

      {/* Mining Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="cyber-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <p className="text-sm text-muted-foreground">Balance</p>
          </div>
          <p className="text-2xl font-bold text-primary">{currentBalance.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">TONNECT</p>
        </div>

        <div className="cyber-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-accent" />
            <p className="text-sm text-muted-foreground">Total Mined</p>
          </div>
          <p className="text-2xl font-bold">{totalMined.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">TONNECT</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={handleClaim}
          disabled={!canClaim}
          className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,212,255,0.5)] hover:shadow-[0_0_30px_rgba(0,212,255,0.8)] transition-all"
        >
          <Zap className="w-5 h-5 mr-2" />
          {canClaim ? "Claim Now" : "Mining in Progress..."}
        </Button>

        <Button
          onClick={handleBoost}
          variant="outline"
          className="w-full h-12 text-base font-semibold border-2 border-primary hover:bg-primary/20"
        >
          <TrendingUp className="w-5 h-5 mr-2" />
          Boost Farm (Coming Soon)
        </Button>
      </div>
    </div>
  );
};

export default Mining;
