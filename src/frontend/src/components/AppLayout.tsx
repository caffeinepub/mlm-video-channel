import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  PlaySquare,
  Shield,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { useState } from "react";
import type { AppPage } from "../App";
import type { User } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface AppLayoutProps {
  children: ReactNode;
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  user: User;
  isAdmin: boolean;
}

const navItems: { id: AppPage; label: string; icon: typeof LayoutDashboard }[] =
  [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "referrals", label: "Referrals", icon: Users },
    { id: "wallet", label: "Wallet", icon: Wallet },
  ];

export default function AppLayout({
  children,
  currentPage,
  onNavigate,
  user,
  isAdmin,
}: AppLayoutProps) {
  const { clear } = useInternetIdentity();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (page: AppPage) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background pattern-bg flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <button
            type="button"
            onClick={() => handleNav("dashboard")}
            className="flex items-center gap-3"
            data-ocid="nav.dashboard.link"
          >
            <img
              src="/assets/generated/mlm-logo-transparent.dim_200x200.png"
              alt="Tm11PrimeTime"
              className="w-9 h-9 rounded-lg object-cover"
            />
            <span className="font-display font-bold text-lg gold-gradient-text hidden sm:block">
              Tm11PrimeTime
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  data-ocid={`nav.${item.id}.link`}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    currentPage === item.id
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
            {isAdmin && (
              <button
                type="button"
                onClick={() => handleNav("admin")}
                data-ocid="nav.admin.link"
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  currentPage === "admin"
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent",
                )}
              >
                <Shield className="w-4 h-4" />
                Admin
              </button>
            )}
          </nav>

          {/* User + Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">
                  {user.name.slice(0, 1).toUpperCase()}
                </span>
              </div>
              <span className="text-sm text-muted-foreground hidden lg:block truncate max-w-[120px]">
                {user.name}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clear}
              data-ocid="nav.logout.button"
              className="text-muted-foreground hover:text-destructive gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
              data-ocid="nav.mobile_menu.toggle"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="md:hidden border-t border-border px-4 py-3 flex flex-col gap-1"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  data-ocid={`nav.mobile.${item.id}.link`}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                    currentPage === item.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
            {isAdmin && (
              <button
                type="button"
                onClick={() => handleNav("admin")}
                data-ocid="nav.mobile.admin.link"
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                  currentPage === "admin"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent",
                )}
              >
                <Shield className="w-4 h-4" />
                Admin Panel
              </button>
            )}
          </motion.div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </main>

      {/* Bottom nav for mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-border flex items-center justify-around px-2 py-2 safe-area-pb">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => handleNav(item.id)}
              data-ocid={`nav.bottom.${item.id}.link`}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex-1",
                currentPage === item.id
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
        {isAdmin && (
          <button
            type="button"
            onClick={() => handleNav("admin")}
            data-ocid="nav.bottom.admin.link"
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex-1",
              currentPage === "admin"
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Shield className="w-5 h-5" />
            <span>Admin</span>
          </button>
        )}
      </nav>

      {/* Footer */}
      <footer className="border-t border-border py-6 mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <PlaySquare className="w-4 h-4 text-primary" />
            <span>Tm11PrimeTime — Exclusive Members Only</span>
          </div>
          <p>
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
