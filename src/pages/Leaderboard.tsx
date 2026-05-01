import { Trophy, Medal, Crown } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTelegram } from "@/contexts/TelegramContext";
import { Skeleton } from "@/components/ui/skeleton";

interface LeaderboardUser {
  rank: number;
  username: string;
  balance: number;
  telegram_id: number;
  photo_url?: string;
}

const Leaderboard = () => {
  const { profile } = useTelegram();
  const [topUsers, setTopUsers] = useState<LeaderboardUser[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [profile]);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      // Fetch all users ordered by balance
      const { data: users, error } = await supabase
        .from('profiles')
        .select('telegram_id, username, first_name, total_balance, photo_url')
        .order('total_balance', { ascending: false });

      if (error) throw error;

      if (users) {
        const leaderboard = users.map((user, index) => ({
          rank: index + 1,
          username: user.first_name || user.username || `User ${user.telegram_id}`,
          balance: Number(user.total_balance) || 0,
          telegram_id: user.telegram_id,
          photo_url: user.photo_url,
        }));

        setTopUsers(leaderboard);

        // Find current user's rank
        if (profile) {
          const userRank = leaderboard.findIndex(u => u.telegram_id === profile.telegram_id);
          setCurrentUserRank(userRank >= 0 ? userRank + 1 : 0);
        }
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-300" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-400" />;
    return <span className="text-lg font-bold text-muted-foreground">{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/50";
    if (rank === 2) return "bg-gradient-to-r from-gray-300/20 to-gray-400/20 border-gray-300/50";
    if (rank === 3) return "bg-gradient-to-r from-orange-400/20 to-orange-500/20 border-orange-400/50";
    return "bg-muted/50";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold glow-text">Leaderboard</h1>
          <p className="text-muted-foreground">Top TONNECT miners</p>
        </div>

        {/* Your Rank skeleton */}
        <div className="cyber-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-9 w-16" />
            </div>
            <div className="space-y-2 items-end flex flex-col">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        </div>

        {/* Top podium skeleton */}
        <div className="cyber-card rounded-2xl p-6">
          <Skeleton className="h-5 w-32 mb-4" />
          <div className="grid grid-cols-3 gap-2">
            {[16, 20, 16].map((size, i) => (
              <div key={i} className="text-center space-y-2">
                <Skeleton className={`mx-auto rounded-full`} style={{ width: size * 4, height: size * 4 }} />
                <Skeleton className="h-3 w-10 mx-auto" />
                <Skeleton className="h-4 w-16 mx-auto" />
                <Skeleton className="h-3 w-12 mx-auto" />
              </div>
            ))}
          </div>
        </div>

        {/* List skeleton */}
        <div className="cyber-card rounded-2xl p-6 space-y-2">
          <Skeleton className="h-5 w-32 mb-4" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/40">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-8 h-8 rounded" />
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="space-y-1 items-end flex flex-col">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold glow-text">Leaderboard</h1>
        <p className="text-muted-foreground">Top TONNECT miners</p>
      </div>

      {/* Your Rank Card */}
      {profile && (
        <div className="cyber-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Your Rank</p>
              <p className="text-4xl font-bold text-primary">
                {currentUserRank > 0 ? `#${currentUserRank}` : '-'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Your Balance</p>
              <p className="text-2xl font-bold">{(profile.total_balance || 0).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">TONNECT</p>
            </div>
          </div>
        </div>
      )}

      {/* Top 3 Podium or Empty State */}
      <div className="cyber-card rounded-2xl p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Top Miners
        </h2>

        {topUsers.length >= 3 ? (
          <div className="grid grid-cols-3 gap-2 mb-6">
            {/* 2nd Place */}
              <div className="text-center order-1">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gray-300/20 flex items-center justify-center border-2 border-gray-300">
                <Medal className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-xs text-muted-foreground mb-1">2nd</p>
              <p className="font-bold text-sm truncate px-1">{topUsers[1].username}</p>
              <p className="text-xs text-primary">{topUsers[1].balance.toLocaleString()}</p>
            </div>

            {/* 1st Place */}
            <div className="text-center order-2">
              <div className="w-20 h-20 mx-auto mb-2 rounded-full bg-yellow-500/20 flex items-center justify-center border-2 border-yellow-400 animate-glow-pulse">
                <Crown className="w-10 h-10 text-yellow-400" />
              </div>
              <p className="text-xs text-muted-foreground mb-1">1st</p>
              <p className="font-bold truncate px-1">{topUsers[0].username}</p>
              <p className="text-sm text-primary">{topUsers[0].balance.toLocaleString()}</p>
            </div>

            {/* 3rd Place */}
            <div className="text-center order-3">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-orange-400/20 flex items-center justify-center border-2 border-orange-400">
                <Medal className="w-8 h-8 text-orange-400" />
              </div>
              <p className="text-xs text-muted-foreground mb-1">3rd</p>
              <p className="font-bold text-sm truncate px-1">{topUsers[2].username}</p>
              <p className="text-xs text-primary">{topUsers[2].balance.toLocaleString()}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 opacity-50">🏆</div>
            <p className="text-lg font-semibold text-muted-foreground">No miners yet</p>
            <p className="text-sm text-muted-foreground mt-2">Be the first to start mining!</p>
          </div>
        )}
      </div>

      {/* Full Leaderboard */}
      {topUsers.length > 0 && (
        <div className="cyber-card rounded-2xl p-6 space-y-2">
          <h2 className="text-lg font-bold mb-4">All Rankings</h2>
          
          <div className="space-y-2">
            {topUsers.map((user) => (
              <div
                key={user.rank}
                className={`flex items-center justify-between p-4 rounded-lg border transition-all hover:scale-[1.02] ${getRankBg(
                  user.rank
                )}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 flex items-center justify-center">
                    {getRankIcon(user.rank)}
                  </div>
                  {user.photo_url && (
                    <img 
                      src={user.photo_url} 
                      alt={user.username}
                      className="w-10 h-10 rounded-full border-2 border-primary/30"
                    />
                  )}
                  <div>
                    <p className="font-bold">{user.username}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{user.balance.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">TONNECT</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
