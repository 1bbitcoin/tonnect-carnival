import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Gift, Sparkles, Coins, Fish, Zap } from "lucide-react";
import { toast } from "sonner";

const Spin = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<number | null>(null);
  const [canSpin, setCanSpin] = useState(true);
  const [timeLeft, setTimeLeft] = useState("");

  const prizes = [
    { id: 0, value: 10, label: "TONNECT 10", icon: Coins, multiplier: "x1" },
    { id: 1, value: 25, label: "TONNECT 25", icon: Coins, multiplier: "x2" },
    { id: 2, value: 50, label: "TONNECT 50", icon: Coins, multiplier: "x5" },
    { id: 3, value: 100, label: "FISH 100", icon: Fish, multiplier: "x10" },
    { id: 4, value: 75, label: "TONNECT 75", icon: Zap, multiplier: "x7" },
    { id: 5, value: 150, label: "TONNECT 150", icon: Coins, multiplier: "x15" },
    { id: 6, value: 200, label: "TONNECT 200", icon: Sparkles, multiplier: "x20" },
    { id: 7, value: 500, label: "TONNECT 500", icon: Gift, multiplier: "x50" },
  ];

  useEffect(() => {
    checkSpinAvailability();
    const interval = setInterval(checkSpinAvailability, 1000);
    return () => clearInterval(interval);
  }, []);

  const checkSpinAvailability = () => {
    const lastSpinTime = localStorage.getItem("lastSpinTime");
    if (!lastSpinTime) {
      setCanSpin(true);
      setTimeLeft("");
      return;
    }

    const lastSpin = new Date(lastSpinTime).getTime();
    const now = new Date().getTime();
    const timeDiff = now - lastSpin;
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (timeDiff >= twentyFourHours) {
      setCanSpin(true);
      setTimeLeft("");
    } else {
      setCanSpin(false);
      const remaining = twentyFourHours - timeDiff;
      const hours = Math.floor(remaining / (60 * 60 * 1000));
      const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
      const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }
  };

  const handleSpin = () => {
    if (isSpinning || !canSpin) return;

    setIsSpinning(true);
    setSelectedPrize(null);

    // Animate through prizes
    let currentIndex = 0;
    const animationInterval = setInterval(() => {
      setSelectedPrize(currentIndex % prizes.length);
      currentIndex++;
    }, 100);

    // Stop after 3 seconds and select winner
    setTimeout(() => {
      clearInterval(animationInterval);
      const winnerIndex = Math.floor(Math.random() * prizes.length);
      const winner = prizes[winnerIndex];
      setSelectedPrize(winnerIndex);
      setIsSpinning(false);
      
      localStorage.setItem("lastSpinTime", new Date().toISOString());
      setCanSpin(false);
      
      toast.success(`You won ${winner.value} TONNECT! 🎉`);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold glow-text">Lucky Spin</h1>
        <p className="text-muted-foreground">Draw to win TONNECT tokens!</p>
      </div>

      {/* Spin Stats */}
      <div className="cyber-card rounded-2xl p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Next Draw Available</p>
            <p className="text-xl font-bold text-primary">
              {canSpin ? "Now!" : timeLeft}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Won</p>
            <p className="text-2xl font-bold text-accent">350</p>
          </div>
        </div>
      </div>

      {/* Prize Grid */}
      <div className="cyber-card rounded-2xl p-6">
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
          {prizes.map((prize, index) => {
            const Icon = prize.icon;
            const isSelected = selectedPrize === index;
            const isWinner = !isSpinning && selectedPrize === index;
            
            return (
              <div
                key={prize.id}
                className={`relative rounded-2xl p-4 transition-all duration-300 ${
                  isSelected
                    ? "bg-gradient-to-br from-primary/30 to-secondary/30 scale-105 shadow-[0_0_30px_rgba(0,212,255,0.5)]"
                    : "bg-gradient-to-br from-card to-card/80"
                } ${
                  isWinner
                    ? "ring-4 ring-primary animate-pulse"
                    : ""
                } border-2 border-primary/20 hover:border-primary/40`}
              >
                {/* Multiplier Badge */}
                <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                  {prize.multiplier}
                </div>

                {/* Icon */}
                <div className="flex justify-center mb-2">
                  <div className={`rounded-full p-3 ${
                    isSelected 
                      ? "bg-gradient-to-br from-primary to-secondary" 
                      : "bg-gradient-to-br from-primary/80 to-secondary/80"
                  } shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Label */}
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground">
                    {prize.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Spin Button */}
      <Button
        onClick={handleSpin}
        disabled={isSpinning || !canSpin}
        className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,212,255,0.5)] hover:shadow-[0_0_30px_rgba(0,212,255,0.8)] transition-all"
      >
        <Gift className="w-5 h-5 mr-2" />
        {isSpinning
          ? "Drawing Prize..."
          : canSpin
          ? "Draw Now!"
          : `Wait ${timeLeft}`}
      </Button>

      {/* Prize Info */}
      <div className="cyber-card rounded-xl p-4">
        <h3 className="font-bold mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          How It Works
        </h3>
        <p className="text-sm text-muted-foreground">
          Draw once every 24 hours to win TONNECT tokens! Prizes range from 10 to 500 TONNECT.
        </p>
      </div>
    </div>
  );
};

export default Spin;
