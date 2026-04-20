import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Zap, Gift, Users, Trophy, User } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/mining", icon: Zap, label: "Mining" },
    { path: "/spin", icon: Gift, label: "Spin" },
    { path: "/referral", icon: Users, label: "Refer" },
    { path: "/leaderboard", icon: Trophy, label: "Top" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="orb w-72 h-72 -top-20 -left-20 bg-primary/30" />
      <div className="orb w-80 h-80 top-1/3 -right-24 bg-secondary/25" />
      <div className="orb w-64 h-64 bottom-32 -left-16 bg-accent/30" />

      <main className="container mx-auto px-4 py-6 max-w-lg relative z-10">
        {children}
      </main>

      <nav className="fixed bottom-3 left-3 right-3 z-50">
        <div className="container mx-auto max-w-lg">
          <div className="bg-card/90 backdrop-blur-xl border-2 border-border rounded-2xl shadow-[0_6px_0_hsl(var(--border)),0_18px_40px_-12px_hsl(220_50%_60%/0.35)] px-2 py-2">
            <div className="grid grid-cols-6 gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
                      isActive
                        ? "gradient-primary text-primary-foreground shadow-[0_3px_0_hsl(220_95%_42%)] scale-105"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    }`}
                  >
                    <item.icon className="w-5 h-5 mb-0.5" />
                    <span className="text-[10px] font-bold tracking-wide uppercase">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
