import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Zap, Clock, TrendingUp, Play } from "lucide-react";
import { toast } from "sonner";
import miningIcon from "@/assets/new-tonnect-logo.png";
import { useTelegram } from "@/contexts/TelegramContext";
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    show_10906902?: (opts?: any) => Promise<void>;
  }
}

const MAX_BOOSTS = 5;
const BOOST_PER_AD = 5;

const Mining = () => {
  const { profile, refetch } = useTelegram();
  const baseRate = 10;
  const totalSeconds = 14400; // 4 hours

  const [miningAmount, setMiningAmount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [canClaim, setCanClaim] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [boostCount, setBoostCount] = useState(0);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [sessionKey, setSessionKey] = useState<string | null>(null);

  const tokensPerHour = baseRate + boostCount * BOOST_PER_AD;
  const maxTokens = tokensPerHour * 4;

  const getBoostStorageKey = (startIso: string) => {
    if (!profile?.id) return null;
    return `mining_boost_${profile.id}_${startIso}`;
  };

  const loadBoost = (startIso: string) => {
    const key = getBoostStorageKey(startIso);
    if (!key) return 0;
    const raw = localStorage.getItem(key);
    const n = raw ? parseInt(raw, 10) : 0;
    return isNaN(n) ? 0 : Math.min(MAX_BOOSTS, Math.max(0, n));
  };

  const saveBoost = (startIso: string, count: number) => {
    const key = getBoostStorageKey(startIso);
    if (!key) return;
    localStorage.setItem(key, String(count));
  };

  useEffect(() => {
    if (!profile?.id) return;

    const fetchMiningState = async () => {
      const { data: miningState } = await supabase
        .from('user_mining_state')
        .select('*')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (!miningState) {
        setHasStarted(false);
        setMiningAmount(0);
        setTimeLeft(totalSeconds);
        setCanClaim(false);
        setBoostCount(0);
        setSessionKey(null);
        return;
      }

      setHasStarted(true);
      const now = Date.now();
      const startTime = new Date(miningState.mining_start_time).getTime();
      const elapsed = (now - startTime) / 1000;
      const startIso = new Date(miningState.mining_start_time).toISOString();
      const currentBoost = loadBoost(startIso);
      setBoostCount(currentBoost);
      setSessionKey(startIso);
      const rate = baseRate + currentBoost * BOOST_PER_AD;
      const maxT = rate * 4;

      if (elapsed >= totalSeconds) {
        setMiningAmount(maxT);
        setTimeLeft(0);
        setCanClaim(true);
      } else {
        const earnedAmount = Math.min((elapsed / 3600) * rate, maxT);
        setMiningAmount(earnedAmount);
        setTimeLeft(Math.max(0, totalSeconds - Math.floor(elapsed)));
        setCanClaim(false);
      }
    };

    fetchMiningState();
    const interval = setInterval(fetchMiningState, 1000);
    return () => clearInterval(interval);
  }, [profile]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStart = async () => {
    if (!profile?.telegram_id || isStarting) return;
    setIsStarting(true);
    try {
      const { data, error } = await supabase.functions.invoke('start-mining', {
        body: { telegram_id: profile.telegram_id },
      });
      if (error) throw error;
      if (data.success) {
        toast.success(data.message);
        setHasStarted(true);
        setMiningAmount(0);
        setTimeLeft(totalSeconds);
        setCanClaim(false);
        setBoostCount(0);
        if (data.mining_start_time) {
          const iso = new Date(data.mining_start_time).toISOString();
          setSessionKey(iso);
          saveBoost(iso, 0);
        }
      } else {
        toast.info(data.message);
      }
    } catch (e) {
      toast.error('Failed to start mining');
    } finally {
      setIsStarting(false);
    }
  };

  const handleClaim = async () => {
    if (!profile?.telegram_id || isLoading) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('claim-mining', {
        body: { telegram_id: profile.telegram_id, boost_count: boostCount },
      });
      if (error) throw error;

      if (data.success) {
        toast.success(data.message);
        if (sessionKey) {
          const key = `mining_boost_${profile.id}_${sessionKey}`;
          localStorage.removeItem(key);
        }
        setHasStarted(false);
        setMiningAmount(0);
        setTimeLeft(totalSeconds);
        setCanClaim(false);
        setBoostCount(0);
        setSessionKey(null);
        await refetch();
      } else {
        toast.info(data.message);
      }
    } catch (error) {
      toast.error('Failed to claim tokens');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBoost = async () => {
    if (isWatchingAd) return;
    if (!hasStarted) {
      toast.error("Start mining first to apply boosts");
      return;
    }
    if (boostCount >= MAX_BOOSTS) {
      toast.error(`Max boost reached (${MAX_BOOSTS}/${MAX_BOOSTS}) for this session`);
      return;
    }
    if (typeof window.show_10906902 !== "function") {
      toast.error("Ad service not loaded. Please refresh.");
      return;
    }
    setIsWatchingAd(true);
    try {
      await window.show_10906902();
      const newBoost = boostCount + 1;
      setBoostCount(newBoost);
      if (sessionKey) saveBoost(sessionKey, newBoost);
      toast.success(`Mining rate boosted! +${BOOST_PER_AD}/hr 🚀`);
    } catch (err) {
      console.error("Ad error:", err);
      toast.error("Ad was not completed. Try again.");
    } finally {
      setIsWatchingAd(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold glow-text">Mining</h1>
        <p className="text-muted-foreground">Farm TONNECT every 4 hours</p>
      </div>

      <div className="cyber-card rounded-2xl p-8 space-y-6">
        <div className="text-center">
          <div className="relative inline-block animate-float">
            <div className="w-24 h-24 rounded-full overflow-hidden shadow-[0_0_30px_rgba(0,212,255,0.6)] ring-2 ring-primary/50">
              <img src={miningIcon} alt="Mining" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Mining Progress</p>
            <p className="text-5xl font-bold glow-text">{miningAmount.toFixed(2)}</p>
            <p className="text-lg text-muted-foreground mt-1">/ {maxTokens} TONNECT</p>
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
            {!hasStarted
              ? "Press Start to begin mining"
              : canClaim
              ? "Ready to claim!"
              : `Next claim in: ${formatTime(timeLeft)}`}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="cyber-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <p className="text-sm text-muted-foreground">Balance</p>
          </div>
          <p className="text-2xl font-bold text-primary">
            {Number(profile?.total_balance || 0).toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground">TONNECT</p>
        </div>

        <div className="cyber-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-accent" />
            <p className="text-sm text-muted-foreground">Mining Rate</p>
          </div>
          <p className="text-2xl font-bold">
            {tokensPerHour}
            {boostCount > 0 && (
              <span className="text-sm text-accent ml-1">(+{boostCount * BOOST_PER_AD})</span>
            )}
          </p>
          <p className="text-xs text-muted-foreground">per hour</p>
        </div>
      </div>

      <div className="space-y-3">
        {!hasStarted ? (
          <button
            onClick={handleStart}
            disabled={isStarting}
            className="btn-3d btn-3d-warm w-full h-16 text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-6 h-6" />
            {isStarting ? "Starting..." : "Start Mining"}
          </button>
        ) : (
          <button
            onClick={handleClaim}
            disabled={!canClaim || isLoading}
            className="btn-3d w-full h-16 text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap className="w-6 h-6" />
            {isLoading ? "Claiming..." : canClaim ? "Claim Now" : "Mining in Progress..."}
          </button>
        )}

        <button
          onClick={handleBoost}
          disabled={isWatchingAd || !hasStarted || boostCount >= MAX_BOOSTS}
          className="cyber-card w-full p-4 flex items-center justify-between gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full gradient-primary flex items-center justify-center shrink-0">
              {isWatchingAd ? (
                <Zap className="w-5 h-5 text-white animate-pulse" />
              ) : (
                <Play className="w-5 h-5 text-white fill-white" />
              )}
            </div>
            <div className="text-left">
              <p className="font-black text-sm">
                {isWatchingAd
                  ? "Loading Ad..."
                  : boostCount >= MAX_BOOSTS
                  ? "Max Boost Reached"
                  : "Watch Ad to Boost Farm"}
              </p>
              <p className="text-xs text-muted-foreground">
                {!hasStarted
                  ? "Start mining first"
                  : boostCount >= MAX_BOOSTS
                  ? `+${boostCount * BOOST_PER_AD}/hr active this session`
                  : `1 ad = +${BOOST_PER_AD}/hr · ${boostCount}/${MAX_BOOSTS} used`}
              </p>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-accent/20 border border-accent/40">
            <span className="text-xs font-bold text-accent">+{BOOST_PER_AD}/HR</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Mining;
