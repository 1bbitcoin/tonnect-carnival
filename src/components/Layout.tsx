import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import navIcon from "@/assets/nav-icon.png";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/mining", label: "Mining" },
    { path: "/spin", label: "Spin" },
    { path: "/referral", label: "Referral" },
    { path: "/leaderboard", label: "Leaderboard" },
    { path: "/profile", label: "Profile" },
  ];

  return (
    <div className="min-h-screen pb-20">
      <main className="container mx-auto px-4 py-6 max-w-lg">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-primary/30 z-50">
        <div className="container mx-auto max-w-lg">
          <div className="grid grid-cols-6 gap-1 py-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <img 
                    src={navIcon} 
                    alt={item.label}
                    className="w-5 h-5 mb-1 object-contain"
                  />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
