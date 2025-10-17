import { Trophy, Medal, Crown, TrendingUp } from "lucide-react";

const Leaderboard = () => {
  const currentUser = { rank: 0, username: "You", balance: 0 };

  const topUsers: { rank: number; username: string; balance: number; change: string }[] = [];

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

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold glow-text">Leaderboard</h1>
        <p className="text-muted-foreground">Top TONNECT miners</p>
      </div>

      {/* Your Rank Card */}
      <div className="cyber-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Your Rank</p>
            <p className="text-4xl font-bold text-primary">
              {currentUser.rank > 0 ? `#${currentUser.rank}` : '-'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-1">Your Balance</p>
            <p className="text-2xl font-bold">{currentUser.balance.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">TONNECT</p>
          </div>
        </div>
      </div>

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
              <p className="font-bold text-sm truncate">{topUsers[1].username}</p>
              <p className="text-xs text-primary">{topUsers[1].balance.toLocaleString()}</p>
            </div>

            {/* 1st Place */}
            <div className="text-center order-2">
              <div className="w-20 h-20 mx-auto mb-2 rounded-full bg-yellow-500/20 flex items-center justify-center border-2 border-yellow-400 animate-glow-pulse">
                <Crown className="w-10 h-10 text-yellow-400" />
              </div>
              <p className="text-xs text-muted-foreground mb-1">1st</p>
              <p className="font-bold truncate">{topUsers[0].username}</p>
              <p className="text-sm text-primary">{topUsers[0].balance.toLocaleString()}</p>
            </div>

            {/* 3rd Place */}
            <div className="text-center order-3">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-orange-400/20 flex items-center justify-center border-2 border-orange-400">
                <Medal className="w-8 h-8 text-orange-400" />
              </div>
              <p className="text-xs text-muted-foreground mb-1">3rd</p>
              <p className="font-bold text-sm truncate">{topUsers[2].username}</p>
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
                  <div>
                    <p className="font-bold">{user.username}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <TrendingUp className="w-3 h-3 text-green-400" />
                      <span className="text-green-400">{user.change}</span>
                    </div>
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
