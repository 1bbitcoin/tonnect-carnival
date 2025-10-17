import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Gift, Sparkles } from "lucide-react";
import { toast } from "sonner";
import tonnectIcon from "@/assets/tonnect-icon.jpeg";
import { addBalance, addSpinWin, getBalance, getTotalSpinWon } from "@/lib/balance";

const Spin = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<number | null>(null);
  const [canSpin, setCanSpin] = useState(true);
  const [timeLeft, setTimeLeft] = useState("");
  const [currentBalance, setCurrentBalance] = useState(0);
  const [totalWon, setTotalWon] = useState(0);

  const prizes = [
    { id: 0, value: 10, label: "TONNECT 10" },
    { id: 1, value: 25, label: "TONNECT 25" },
    { id: 2, value: 50, label: "TONNECT 50" },
    { id: 3, value: 15, label: "TONNECT 15" },
    { id: 4, value: 75, label: "TONNECT 75" },
    { id: 5, value: 30, label: "TONNECT 30" },
    { id: 6, value: 60, label: "TONNECT 60" },
    { id: 7, value: 100, label: "TONNECT 100" },
  ];

  useEffect(() => {
    setCurrentBalance(getBalance());
    setTotalWon(getTotalSpinWon());
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
      
      // Add to balance and total won
      const newBalance = addBalance(winner.value);
      const newTotalWon = addSpinWin(winner.value);
      
      localStorage.setItem("lastSpinTime", new Date().toISOString());
      setCanSpin(false);
      setCurrentBalance(newBalance);
      setTotalWon(newTotalWon);
      
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
            <p className="text-sm text-muted-foreground">Balance</p>
            <p className="text-2xl font-bold text-primary">{currentBalance.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Next Draw</p>
            <p className="text-lg font-bold text-accent">
              {canSpin ? "Now!" : timeLeft}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Won</p>
            <p className="text-2xl font-bold text-secondary">{totalWon.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Prize Grid */}
      <div className="cyber-card rounded-2xl p-6">
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
          {prizes.map((prize, index) => {
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
                {/* Logo */}
                <div className="flex justify-center mb-3">
                  <div className={`rounded-full overflow-hidden w-16 h-16 ${
                    isSelected 
                      ? "ring-4 ring-primary shadow-[0_0_20px_rgba(0,212,255,0.6)]" 
                      : "ring-2 ring-primary/40"
                  }`}>
                    <img 
                      src={tonnectIcon} 
                      alt="TONNECT" 
                      className="w-full h-full object-cover"
                    />
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
          Draw once every 24 hours to win TONNECT tokens! Prizes range from 10 to 100 TONNECT.
        </p>
      </div>
    </div>
  );
};

export default Spin;
