import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Gift, Sparkles, Zap, Trophy } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import tonnectIcon from "@/assets/new-tonnect-logo.png";
import { useTelegram } from "@/contexts/TelegramContext";
import { supabase } from "@/integrations/supabase/client";

const Spin = () => {
  const { profile, refetch } = useTelegram();
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<number | null>(null);
  const [winnerLocked, setWinnerLocked] = useState(false);
  const [canSpin, setCanSpin] = useState(true);
  const [timeLeft, setTimeLeft] = useState("");

  const prizes = [
    { id: 0, value: 5,   label: "5" },
    { id: 1, value: 10,  label: "10" },
    { id: 2, value: 15,  label: "15" },
    { id: 3, value: 25,  label: "25" },
    { id: 4, value: 50,  label: "50" },
    { id: 5, value: 100, label: "100" },
    { id: 6, value: 200, label: "200" },
    { id: 7, value: 15,  label: "15" },
  ];

  useEffect(() => {
    if (!profile) return;
    checkSpinAvailability();
    const interval = setInterval(checkSpinAvailability, 1000);
    return () => clearInterval(interval);
  }, [profile]);

  const checkSpinAvailability = async () => {
    if (!profile?.id) return;

    const { data: lastSpin } = await supabase
      .from("user_spin_history")
      .select("spin_time")
      .eq("user_id", profile.id)
      .order("spin_time", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!lastSpin) {
      setCanSpin(true);
      setTimeLeft("");
      return;
    }

    const lastSpinTime = new Date(lastSpin.spin_time).getTime();
    const timeDiff = Date.now() - lastSpinTime;
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

  const fireConfetti = () => {
    const end = Date.now() + 1500;
    const colors = ["#3b82f6", "#a855f7", "#22d3ee", "#f59e0b", "#ec4899"];
    (function frame() {
      confetti({ particleCount: 6, angle: 60, spread: 70, origin: { x: 0 }, colors });
      confetti({ particleCount: 6, angle: 120, spread: 70, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
    confetti({ particleCount: 120, spread: 100, origin: { y: 0.6 }, colors, scalar: 1.2 });
  };

  const handleSpin = async () => {
    if (isSpinning || !canSpin || !profile?.telegram_id) return;

    setIsSpinning(true);
    setWinnerLocked(false);
    setSelectedPrize(null);

    let currentIndex = Math.floor(Math.random() * prizes.length);
    const animationInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % prizes.length;
      setSelectedPrize(currentIndex);
    }, 90);

    const apiCall = supabase.functions.invoke("claim-spin", {
      body: { telegram_id: profile.telegram_id },
    });
    const minDelay = new Promise((r) => setTimeout(r, 3000));

    try {
      const [{ data, error }] = await Promise.all([apiCall, minDelay]);
      clearInterval(animationInterval);

      if (error) throw error;

      if (data?.success) {
        const winnerIndex = prizes.findIndex((p) => p.value === data.prizeValue);
        setSelectedPrize(winnerIndex >= 0 ? winnerIndex : 0);
        setWinnerLocked(true);
        setIsSpinning(false);
        setCanSpin(false);
        toast.success(data.message);
        fireConfetti();
        await refetch();
      } else {
        setIsSpinning(false);
        setSelectedPrize(null);
        toast.error(data?.message || "Cannot spin right now");
        if (data?.timeRemaining) {
          const h = Math.floor(data.timeRemaining / 3600);
          const m = Math.floor((data.timeRemaining % 3600) / 60);
          const s = data.timeRemaining % 60;
          setTimeLeft(`${h}h ${m}m ${s}s`);
          setCanSpin(false);
        }
      }
    } catch (err) {
      clearInterval(animationInterval);
      setIsSpinning(false);
      setSelectedPrize(null);
      toast.error("Failed to complete spin. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 pt-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card border-2 border-border shadow-[0_3px_0_hsl(var(--border))]">
          <Sparkles className="w-4 h-4 text-secondary" />
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Daily Reward</span>
        </div>
        <h1 className="text-4xl font-black glow-text">Lucky Spin</h1>
        <p className="text-sm text-muted-foreground">Win up to 200 TONNECT every 24h</p>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="stat-pill p-3 text-center">
          <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Balance</p>
          <p className="text-xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {Number(profile?.total_balance || 0).toFixed(0)}
          </p>
        </div>
        <div className="stat-pill p-3 text-center">
          <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Next Draw</p>
          <p className="text-xl font-black text-foreground">{canSpin ? "Now!" : timeLeft.split(" ")[0]}</p>
        </div>
        <div className="stat-pill p-3 text-center">
          <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Max Prize</p>
          <p className="text-xl font-black bg-gradient-to-r from-warning to-destructive bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-warm)" }}>
            200
          </p>
        </div>
      </div>

      {/* Prize Grid */}
      <div className="cyber-card p-5 relative overflow-hidden">
        {isSpinning && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: "linear-gradient(110deg, transparent 30%, white 50%, transparent 70%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s linear infinite",
            }} />
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto relative">
          {prizes.map((prize, index) => {
            const isActive = selectedPrize === index && !winnerLocked;
            const isWinner = winnerLocked && selectedPrize === index;

            return (
              <div
                key={prize.id}
                className={`prize-tile p-3 ${isActive ? "prize-tile-active" : ""} ${isWinner ? "prize-tile-winner animate-pop-in" : ""}`}
              >
                <div className="flex justify-center mb-2">
                  <div className={`relative rounded-full overflow-hidden w-14 h-14 transition-transform ${isActive || isWinner ? "scale-110" : ""} ${isWinner ? "animate-bounce-soft" : ""}`}>
                    <img src={tonnectIcon} alt="TONNECT" className="w-full h-full object-cover" />
                    {isWinner && (
                      <div className="absolute inset-0 ring-4 ring-white/80 rounded-full" />
                    )}
                  </div>
                </div>
                <div className="text-center">
                  <p className={`text-xs font-bold uppercase tracking-wide ${isActive || isWinner ? "text-white/80" : "text-muted-foreground"}`}>
                    Tonnect
                  </p>
                  <p className={`text-2xl font-black leading-tight ${isActive || isWinner ? "text-white" : "text-foreground"}`}>
                    {prize.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Spin Button */}
      <button
        onClick={handleSpin}
        disabled={isSpinning || !canSpin}
        className="btn-3d w-full h-16 text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0"
      >
        {isSpinning ? (
          <>
            <Zap className="w-6 h-6 animate-pulse" />
            <span>Drawing Prize...</span>
          </>
        ) : canSpin ? (
          <>
            <Gift className="w-6 h-6" />
            <span>Draw Now!</span>
          </>
        ) : (
          <>
            <Trophy className="w-6 h-6" />
            <span>Wait {timeLeft}</span>
          </>
        )}
      </button>

      {/* How It Works */}
      <div className="cyber-card p-5">
        <h3 className="font-black mb-2 flex items-center gap-2 text-base">
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          How It Works
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Draw once every 24 hours to win random TONNECT rewards from 5 to 200 tokens.
          Higher prizes are rarer — the bigger the win, the louder the celebration!
        </p>
      </div>
    </div>
  );
};

export default Spin;
