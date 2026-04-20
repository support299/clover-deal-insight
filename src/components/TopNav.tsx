import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Trophy, LogOut, Settings, Users } from "lucide-react";
import { useAuth, highestRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import logo from "@/assets/pinnacle-logo.png";

const baseItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/agents", label: "Agents", icon: Users },
  { to: "/leaderboards", label: "Leaderboards", icon: Trophy },
] as const;

export function TopNav() {
  const { profile, roles, signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const role = highestRole(roles);
  const items = roles.includes("admin")
    ? [...baseItems, { to: "/settings", label: "Settings", icon: Settings } as const]
    : baseItems;

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6">
        <Link to="/dashboard" className="flex items-center gap-3" aria-label="Pinnacle Wellness Group Dashboard">
          <img src={logo} alt="Pinnacle Wellness Group" className="h-9 w-auto" />
          <span className="hidden text-sm font-medium tracking-tight text-muted-foreground sm:inline">
            Wellness Group Dashboard
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {items.map(({ to, label, icon: Icon }) => {
            const active = location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors " +
                  (active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground")
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <div className="text-sm font-medium leading-tight">{profile?.display_name ?? user?.email}</div>
            <Badge variant="secondary" className="mt-0.5 text-[10px] uppercase tracking-wider">
              {role}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={async () => {
              await signOut();
              navigate({ to: "/login" });
            }}
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="flex items-center gap-1 overflow-x-auto border-t border-border/60 px-2 py-2 md:hidden">
        {items.map(({ to, label, icon: Icon }) => {
          const active = location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={
                "flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium " +
                (active ? "bg-secondary text-foreground" : "text-muted-foreground")
              }
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
