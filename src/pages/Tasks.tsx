import { useState, useEffect } from "react";
import { Users, CheckCircle2, Lock, Send, Twitter, Wallet, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addBalance, getBalance } from "@/lib/balance";
import { toast } from "@/hooks/use-toast";

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
  const [currentBalance, setCurrentBalance] = useState(0);
  const [referralCount, setReferralCount] = useState(0);
  
  const [tasks, setTasks] = useState<Task[]>([
    { id: "task_1", friends: 1, reward: 50, completed: false },
    { id: "task_5", friends: 5, reward: 300, completed: false },
    { id: "task_10", friends: 10, reward: 500, completed: false },
    { id: "task_50", friends: 50, reward: 1200, completed: false },
    { id: "task_100", friends: 100, reward: 2500, completed: false },
    { id: "task_1000", friends: 1000, reward: 20000, completed: false },
    { id: "task_10000", friends: 10000, reward: 150000, completed: false },
  ]);

  const [hotTasks, setHotTasks] = useState<ActionTask[]>([
    { id: "hot_telegram", title: "Subscribe Channel", reward: 50, completed: false, started: false, icon: <Send className="w-5 h-5" /> },
    { id: "hot_twitter", title: "Follow X", reward: 50, completed: false, started: false, icon: <Twitter className="w-5 h-5" /> },
    { id: "hot_retweet", title: "Like & RT Post", reward: 50, completed: false, started: false, icon: <Twitter className="w-5 h-5" /> },
  ]);

  const [onchainTasks, setOnchainTasks] = useState<ActionTask[]>([
    { id: "onchain_wallet", title: "Connect TON Wallet", reward: 100, completed: false, started: false, icon: <Wallet className="w-5 h-5" /> },
    { id: "onchain_email", title: "Bind Email", reward: 100, completed: false, started: false, icon: <Mail className="w-5 h-5" /> },
  ]);

  useEffect(() => {
    // Load current balance
    setCurrentBalance(getBalance());

    // Load saved tasks and referral count from localStorage
    const savedTasks = localStorage.getItem("tasks_completed");
    const savedReferrals = localStorage.getItem("referral_count");
    const savedHotTasks = localStorage.getItem("hot_tasks_completed");
    const savedOnchainTasks = localStorage.getItem("onchain_tasks_completed");
    
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
    
    if (savedReferrals) {
      setReferralCount(parseInt(savedReferrals));
    }

    if (savedHotTasks) {
      setHotTasks(JSON.parse(savedHotTasks));
    }

    if (savedOnchainTasks) {
      setOnchainTasks(JSON.parse(savedOnchainTasks));
    }
  }, []);

  const claimReward = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.completed) return;

    if (referralCount >= task.friends) {
      // Add reward to balance
      const newBalance = addBalance(task.reward);
      setCurrentBalance(newBalance);

      // Mark task as completed
      const updatedTasks = tasks.map(t =>
        t.id === taskId ? { ...t, completed: true } : t
      );
      setTasks(updatedTasks);
      localStorage.setItem("tasks_completed", JSON.stringify(updatedTasks));

      toast({
        title: "Reward Claimed!",
        description: `+${task.reward.toLocaleString()} TONNECT added to your balance`,
      });
    }
  };

  const startActionTask = (taskId: string, taskType: 'hot' | 'onchain') => {
    const taskList = taskType === 'hot' ? hotTasks : onchainTasks;
    const task = taskList.find(t => t.id === taskId);
    if (!task || task.started) return;

    // Mark task as started
    const updatedTasks = taskList.map(t =>
      t.id === taskId ? { ...t, started: true } : t
    );
    
    if (taskType === 'hot') {
      setHotTasks(updatedTasks);
      localStorage.setItem("hot_tasks_completed", JSON.stringify(updatedTasks));
    } else {
      setOnchainTasks(updatedTasks);
      localStorage.setItem("onchain_tasks_completed", JSON.stringify(updatedTasks));
    }

    toast({
      title: "Task Started!",
      description: "Complete the task and come back to claim your reward",
    });
  };

  const claimActionTask = (taskId: string, taskType: 'hot' | 'onchain') => {
    const taskList = taskType === 'hot' ? hotTasks : onchainTasks;
    const task = taskList.find(t => t.id === taskId);
    if (!task || task.completed || !task.started) return;

    // Add reward to balance
    const newBalance = addBalance(task.reward);
    setCurrentBalance(newBalance);

    // Mark task as completed
    const updatedTasks = taskList.map(t =>
      t.id === taskId ? { ...t, completed: true } : t
    );
    
    if (taskType === 'hot') {
      setHotTasks(updatedTasks);
      localStorage.setItem("hot_tasks_completed", JSON.stringify(updatedTasks));
    } else {
      setOnchainTasks(updatedTasks);
      localStorage.setItem("onchain_tasks_completed", JSON.stringify(updatedTasks));
    }

    toast({
      title: "Reward Claimed!",
      description: `+${task.reward.toLocaleString()} TONNECT added to your balance`,
    });
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
        <p className="text-4xl font-bold glow-text">{currentBalance.toLocaleString()}</p>
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
        
        {hotTasks.map((task) => (
          <div
            key={task.id}
            className={`cyber-card rounded-xl p-4 ${
              task.completed ? "opacity-60" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {task.completed ? (
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
              
              <Button
                onClick={() => task.started ? claimActionTask(task.id, 'hot') : startActionTask(task.id, 'hot')}
                disabled={task.completed}
                className={task.completed ? "bg-primary/20" : "bg-primary hover:bg-primary/90"}
              >
                {task.completed ? "Claimed" : task.started ? "Claim" : "Start"}
              </Button>
            </div>
          </div>
        ))}
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
            className={`cyber-card rounded-xl p-4 ${
              task.completed ? "opacity-60" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  ) : (
                    <span className="text-primary">{task.icon}</span>
                  )}
                  <h4 className="font-bold">{task.title}</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Reward: <span className="text-primary font-bold">+{task.reward.toLocaleString()} TONNECT</span>
                </p>
              </div>
              
              <Button
                onClick={() => task.started ? claimActionTask(task.id, 'onchain') : startActionTask(task.id, 'onchain')}
                disabled={task.completed}
                className={task.completed ? "bg-primary/20" : "bg-primary hover:bg-primary/90"}
              >
                {task.completed ? "Claimed" : task.started ? "Claim" : "Start"}
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
          const isCompleted = task.completed;

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
                  onClick={() => claimReward(task.id)}
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
