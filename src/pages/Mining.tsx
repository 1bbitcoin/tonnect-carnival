import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Zap, Clock, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const Mining = () => {
  const [miningAmount, setMiningAmount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(14400); // 4 hours in seconds
  const [canClaim, setCanClaim] = useState(false);
  const [isMining, setIsMining] = useState(true);

  const tokensPerHour = 10;
  const maxTokens = 40; // 4 hours * 10 tokens

  useEffect(() => {
    const miningInterval = setInterval(() => {
      if (isMining && miningAmount < maxTokens) {
        setMiningAmount((prev) => Math.min(prev + tokensPerHour / 3600, maxTokens));
      }
    }, 1000);

    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanClaim(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(miningInterval);
      clearInterval(timerInterval);
    };
  }, [isMining, miningAmount]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleClaim = () => {
    toast.success(`Claimed ${miningAmount.toFixed(2)} TONNECT!`);
    setMiningAmount(0);
    setTimeLeft(14400);
    setCanClaim(false);
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
          <div className="relative inline-block">
            <div className="absolute inset-0 animate-glow-pulse rounded-full" />
            <Zap className="w-24 h-24 text-primary relative animate-float" />
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
            <p className="text-sm text-muted-foreground">Rate</p>
          </div>
          <p className="text-2xl font-bold">{tokensPerHour}</p>
          <p className="text-xs text-muted-foreground">TONNECT/hour</p>
        </div>

        <div className="cyber-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-accent" />
            <p className="text-sm text-muted-foreground">Total Mined</p>
          </div>
          <p className="text-2xl font-bold">4,250</p>
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
