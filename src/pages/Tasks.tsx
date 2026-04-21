import { useState, useEffect } from "react";
import { Users, CheckCircle2, Lock, Send, Twitter, Wallet, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTelegram } from "@/contexts/TelegramContext";
import { supabase } from "@/integrations/supabase/client";

interface Task {
  id: string;
  friends: number;
  reward: number;
  completed: boolean;
}

interface ActionTask {
  id: string;
  title: string;
  reward: number;
  completed: boolean;
  started: boolean;
  icon: React.ReactNode;
}

const Tasks = () => {
  const { profile, refetch } = useTelegram();
  const [referralCount, setReferralCount] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [startedTasks, setStartedTasks] = useState<Set<string>>(new Set());
  const [verifyingTasks, setVerifyingTasks] = useState<Set<string>>(new Set());
  const [claimingTasks, setClaimingTasks] = useState<Set<string>>(new Set());
  
  const [tasks] = useState<Task[]>([
    { id: "friend1", friends: 1, reward: 100, completed: false },
    { id: "friend5", friends: 5, reward: 300, completed: false },
    { id: "friend10", friends: 10, reward: 500, completed: false },
    { id: "friend50", friends: 50, reward: 1200, completed: false },
    { id: "friend100", friends: 100, reward: 2500, completed: false },
  ]);

  const [hotTasks] = useState<ActionTask[]>([
    { id: "hot_telegram", title: "Subscribe Channel", reward: 150, completed: false, started: false, icon: <Send className="w-5 h-5" /> },
    { id: "hot_twitter", title: "Follow X", reward: 150, completed: false, started: false, icon: <Twitter className="w-5 h-5" /> },
    { id: "hot_retweet", title: "Like & RT Post", reward: 200, completed: false, started: false, icon: <Twitter className="w-5 h-5" /> },
  ]);

  const [onchainTasks] = useState<ActionTask[]>([
    { id: "onchain_wallet", title: "Connect TON Wallet", reward: 250, completed: false, started: false, icon: <Wallet className="w-5 h-5" /> },
    { id: "onchain_email", title: "Bind Email", reward: 300, completed: false, started: false, icon: <Mail className="w-5 h-5" /> },
  ]);

  useEffect(() => {
    if (!profile) return;
    // Load started tasks from localStorage (per-user)
    const key = `started_tasks_${profile.id}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        setStartedTasks(new Set(JSON.parse(stored)));
      } catch {}
    }
    // Run both fetches in parallel for faster initial render
    Promise.all([fetchReferralCount(), fetchCompletedTasks()]);
  }, [profile]);

  const persistStarted = (next: Set<string>) => {
    if (!profile?.id) return;
    localStorage.setItem(`started_tasks_${profile.id}`, JSON.stringify(Array.from(next)));
  };

  const fetchReferralCount = async () => {
    if (!profile?.id) return;
    
    const { count } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_id', profile.id);
    
    setReferralCount(count || 0);
  };

  const fetchCompletedTasks = async () => {
    if (!profile?.id) return;
    
    const { data } = await supabase
      .from('user_task_completions')
      .select('task_id')
      .eq('user_id', profile.id);
    
    if (data) {
      setCompletedTasks(new Set(data.map(t => t.task_id)));
    }
  };

  const claimReward = async (taskId: string, reward: number) => {
    if (!profile?.telegram_id) return;
    if (claimingTasks.has(taskId)) return;
    setClaimingTasks((prev) => new Set([...prev, taskId]));
    try {
      const { data, error } = await supabase.functions.invoke('claim-task', {
        body: {
          telegram_id: profile.telegram_id,
          task_id: taskId,
          reward_amount: reward
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success(data.message);
        setCompletedTasks(prev => new Set([...prev, taskId]));
        await refetch();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to claim reward');
    } finally {
      setClaimingTasks((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    }
  };

  const startActionTask = (taskId: string, taskType: 'hot' | 'onchain') => {
    if (!profile) return;
    
    if (taskType === 'onchain') {
      toast.info("This feature is coming soon!");
      return;
    }

    // Open appropriate link for hot tasks
    if (taskId === 'hot_telegram') {
      window.open('https://t.me/Tonnect_Real', '_blank');
    } else if (taskId === 'hot_twitter' || taskId === 'hot_retweet') {
      window.open('https://x.com/T0NNECT', '_blank');
    }

    // Mark as verifying for a few seconds, then enable Claim
    setVerifyingTasks((prev) => new Set([...prev, taskId]));
    toast.success("Verifying... please complete the task");

    setTimeout(() => {
      setVerifyingTasks((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
      setStartedTasks((prev) => {
        const next = new Set([...prev, taskId]);
        persistStarted(next);
        return next;
      });
      toast.success("Task ready to claim!");
    }, 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold glow-text">Tasks</h1>
        <p className="text-lg text-muted-foreground">Complete tasks to earn TONNECT</p>
      </div>

      {/* Balance Card */}
      <div className="cyber-card rounded-2xl p-6 text-center">
        <p className="text-sm text-muted-foreground mb-2">Your Balance</p>
        <p className="text-4xl font-bold glow-text">{Number(profile?.total_balance || 0).toLocaleString()}</p>
        <p className="text-sm text-accent mt-1">TONNECT</p>
      </div>

      {/* Referral Stats */}
      <div className="cyber-card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold">Your Referrals</h2>
        </div>
        <div className="text-center py-4 bg-muted/50 rounded-xl">
          <p className="text-5xl font-bold text-primary">{referralCount}</p>
          <p className="text-sm text-muted-foreground mt-2">Friends Invited</p>
        </div>
      </div>

      {/* Hot Tasks */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-accent" />
          Hot Tasks
        </h3>
        
        {hotTasks.map((task) => {
          const isCompleted = completedTasks.has(task.id);
          
          return (
            <div
              key={task.id}
              className={`cyber-card rounded-xl p-4 ${
                isCompleted ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    ) : (
                      <span className="text-accent">{task.icon}</span>
                    )}
                    <h4 className="font-bold">{task.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Reward: <span className="text-primary font-bold">+{task.reward.toLocaleString()} TONNECT</span>
                  </p>
                </div>
                
                {isCompleted ? (
                  <Button disabled className="bg-primary/20">
                    Claimed
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => startActionTask(task.id, 'hot')}
                      variant="outline"
                      size="sm"
                    >
                      Start
                    </Button>
                    <Button
                      onClick={() => claimReward(task.id, task.reward)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Claim
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Onchain Tasks */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary" />
          Onchain Tasks
        </h3>
        
        {onchainTasks.map((task) => (
          <div
            key={task.id}
            className="cyber-card rounded-xl p-4 opacity-60"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-primary">{task.icon}</span>
                  <h4 className="font-bold">{task.title}</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Reward: <span className="text-primary font-bold">+{task.reward.toLocaleString()} TONNECT</span>
                </p>
              </div>
              
              <Button disabled className="bg-muted">
                Soon
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Friend Invite Tasks */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          Friend Invite Tasks
        </h3>
        
        {tasks.map((task) => {
          const isAvailable = referralCount >= task.friends;
          const isCompleted = completedTasks.has(task.id);

          return (
            <div
              key={task.id}
              className={`cyber-card rounded-xl p-4 ${
                isCompleted ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    ) : !isAvailable ? (
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <Users className="w-5 h-5 text-accent" />
                    )}
                    <h4 className="font-bold">
                      Invite {task.friends.toLocaleString()} {task.friends === 1 ? "Friend" : "Friends"}
                    </h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Reward: <span className="text-primary font-bold">+{task.reward.toLocaleString()} TONNECT</span>
                  </p>
                  {!isCompleted && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Progress: {referralCount} / {task.friends}
                    </p>
                  )}
                </div>
                
                <Button
                  onClick={() => claimReward(task.id, task.reward)}
                  disabled={!isAvailable || isCompleted}
                  className={`${
                    isCompleted
                      ? "bg-primary/20"
                      : isAvailable
                      ? "bg-primary hover:bg-primary/90"
                      : "bg-muted"
                  }`}
                >
                  {isCompleted ? "Claimed" : isAvailable ? "Claim" : "Locked"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Card */}
      <div className="cyber-card rounded-xl p-4 bg-primary/10 border-primary/20">
        <p className="text-sm text-center text-muted-foreground">
          💡 Invite friends to unlock and claim rewards!
        </p>
      </div>
    </div>
  );
};

export default Tasks;