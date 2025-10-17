import { Button } from "@/components/ui/button";
import { Gift, Lock, Calendar, Coins } from "lucide-react";
import { toast } from "sonner";
import { getBalance } from "@/lib/balance";

const Rewards = () => {
  const userBalance = getBalance();
  const tgeDate = "Coming Soon";
  const minWithdrawal = 100;

  const handleWithdraw = () => {
    toast.info("TGE (Token Generation Event) has not occurred yet. Withdrawals will be available after TGE!");
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold glow-text">Rewards</h1>
        <p className="text-muted-foreground">Manage your TONNECT earnings</p>
      </div>

      {/* Balance Card */}
      <div className="cyber-card rounded-2xl p-8 space-y-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-4 animate-glow-pulse">
            <Coins className="w-10 h-10 text-primary" />
          </div>
          
          <p className="text-sm text-muted-foreground mb-2">Available Balance</p>
          <p className="text-5xl font-bold glow-text mb-2">{userBalance.toLocaleString()}</p>
          <p className="text-lg text-muted-foreground">TONNECT</p>
        </div>
      </div>

      {/* TGE Status */}
      <div className="cyber-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-secondary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">TGE Status</p>
            <p className="text-2xl font-bold text-secondary">{tgeDate}</p>
          </div>
        </div>
        
        <div className="p-4 bg-muted/50 rounded-lg border border-primary/20">
          <p className="text-sm text-muted-foreground">
            Token Generation Event (TGE) will unlock withdrawals. Stay tuned for the announcement!
          </p>
        </div>
      </div>

      {/* Withdrawal Info */}
      <div className="cyber-card rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary" />
          Withdrawal Information
        </h2>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Minimum Withdrawal</span>
            <span className="font-bold">{minWithdrawal} TONNECT</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Network Fee</span>
            <span className="font-bold">0.5 TON</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Processing Time</span>
            <span className="font-bold">~5 minutes</span>
          </div>
        </div>
      </div>

      {/* Withdrawal Button */}
      <Button
        onClick={handleWithdraw}
        disabled={true}
        className="w-full h-14 text-lg font-bold bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Lock className="w-5 h-5 mr-2" />
        Withdraw (Available After TGE)
      </Button>

      {/* Transaction History */}
      <div className="cyber-card rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold">Transaction History</h2>
        
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <Gift className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No transactions yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Your withdrawal history will appear here after TGE
          </p>
        </div>
      </div>
    </div>
  );
};

export default Rewards;
