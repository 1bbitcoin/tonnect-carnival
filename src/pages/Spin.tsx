import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Gift, Sparkles } from "lucide-react";
import { toast } from "sonner";

const Spin = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [spinsLeft, setSpinsLeft] = useState(3);

  const prizes = [10, 25, 50, 75, 100, 15, 30, 60];

  const handleSpin = () => {
    if (isSpinning || spinsLeft <= 0) return;

    setIsSpinning(true);
    const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];
    const prizeIndex = prizes.indexOf(randomPrize);
    const segmentAngle = 360 / prizes.length;
    const extraSpins = 5;
    const newRotation = rotation + 360 * extraSpins + (360 - prizeIndex * segmentAngle);

    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setSpinsLeft((prev) => prev - 1);
      toast.success(`You won ${randomPrize} TONNECT! 🎉`);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold glow-text">Lucky Spin</h1>
        <p className="text-muted-foreground">Spin to win TONNECT tokens!</p>
      </div>

      {/* Spin Stats */}
      <div className="cyber-card rounded-2xl p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Spins Remaining</p>
            <p className="text-2xl font-bold text-primary">{spinsLeft}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Won</p>
            <p className="text-2xl font-bold text-accent">350</p>
          </div>
        </div>
      </div>

      {/* Spin Wheel */}
      <div className="cyber-card rounded-2xl p-8">
        <div className="relative w-full aspect-square max-w-sm mx-auto">
          {/* Pointer Arrow - Top Center */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 -mt-1">
            <div className="relative">
              <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[30px] border-l-transparent border-r-transparent border-t-destructive drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[16px] border-r-[16px] border-t-[24px] border-l-transparent border-r-transparent border-t-yellow-400" />
            </div>
          </div>

          {/* Wheel Container with Border */}
          <div className="relative w-full h-full rounded-full p-2 bg-gradient-to-br from-primary/20 to-secondary/20 shadow-[0_0_40px_rgba(0,212,255,0.4)]">
            {/* Wheel */}
            <div
              className="relative w-full h-full rounded-full overflow-hidden transition-transform duration-[4000ms] ease-out shadow-[inset_0_0_30px_rgba(0,0,0,0.1)]"
              style={{
                transform: `rotate(${rotation}deg)`,
                background: `conic-gradient(
                  from 0deg,
                  hsl(195 100% 50%) 0deg 45deg,
                  hsl(270 70% 55%) 45deg 90deg,
                  hsl(195 100% 55%) 90deg 135deg,
                  hsl(270 70% 60%) 135deg 180deg,
                  hsl(195 100% 50%) 180deg 225deg,
                  hsl(270 70% 55%) 225deg 270deg,
                  hsl(195 100% 55%) 270deg 315deg,
                  hsl(270 70% 60%) 315deg 360deg
                )`,
              }}
            >
              {/* Divider Lines */}
              {prizes.map((_, index) => {
                const angle = (360 / prizes.length) * index;
                return (
                  <div
                    key={`line-${index}`}
                    className="absolute top-1/2 left-1/2 origin-left h-[2px] bg-white/30"
                    style={{
                      transform: `rotate(${angle}deg)`,
                      width: '50%',
                    }}
                  />
                );
              })}

              {/* Prize Labels */}
              {prizes.map((prize, index) => {
                const angle = (360 / prizes.length) * index;
                return (
                  <div
                    key={index}
                    className="absolute top-1/2 left-1/2 origin-left"
                    style={{
                      transform: `rotate(${angle + 22.5}deg) translateX(75px)`,
                    }}
                  >
                    <div className="text-white font-bold text-xl -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                      {prize}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Center Button */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="w-20 h-20 rounded-full bg-white border-4 border-primary flex items-center justify-center shadow-[0_0_30px_rgba(0,212,255,0.6),0_4px_20px_rgba(0,0,0,0.2)]">
              <Sparkles className="w-10 h-10 text-primary animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Spin Button */}
      <Button
        onClick={handleSpin}
        disabled={isSpinning || spinsLeft <= 0}
        className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,212,255,0.5)] hover:shadow-[0_0_30px_rgba(0,212,255,0.8)] transition-all"
      >
        <Gift className="w-5 h-5 mr-2" />
        {isSpinning
          ? "Spinning..."
          : spinsLeft > 0
          ? "Spin the Wheel!"
          : "No Spins Left"}
      </Button>

      {/* Prize Info */}
      <div className="cyber-card rounded-xl p-4">
        <h3 className="font-bold mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Prize Range
        </h3>
        <p className="text-sm text-muted-foreground">
          Win between 10 to 100 TONNECT tokens per spin!
        </p>
      </div>
    </div>
  );
};

export default Spin;
