import { Toaster } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { UserRole } from "./backend.d";
import AppLayout from "./components/AppLayout";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  useCallerProfile,
  useCallerRole,
  useUserById,
} from "./hooks/useQueries";
import AdminPage from "./pages/AdminPage";
import DashboardPage from "./pages/DashboardPage";
import LandingPage from "./pages/LandingPage";
import PendingPage from "./pages/PendingPage";
import ReferralPage from "./pages/ReferralPage";
import WalletPage from "./pages/WalletPage";

export type AppPage = "dashboard" | "referrals" | "wallet" | "admin";

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const [currentPage, setCurrentPage] = useState<AppPage>("dashboard");
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);

  const { data: profile, isLoading: profileLoading } = useCallerProfile();
  const { data: role } = useCallerRole();

  // Check URL for admin route
  useEffect(() => {
    if (window.location.pathname === "/admin") {
      setCurrentPage("admin");
    }
  }, []);

  const userId = profile?.userId ?? null;
  const { data: user, isLoading: userLoading } = useUserById(userId);

  const rawLoading =
    isInitializing || profileLoading || (!!profile && userLoading);

  // Safety timeout: if loading takes more than 6 seconds, force past it
  useEffect(() => {
    if (!rawLoading) {
      setLoadingTimedOut(false);
      return;
    }
    const timer = setTimeout(() => setLoadingTimedOut(true), 6000);
    return () => clearTimeout(timer);
  }, [rawLoading]);

  const isLoading = rawLoading && !loadingTimedOut;

  if (isLoading) {
    return (
      <div className="min-h-screen hero-gradient pattern-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full border-2 border-gold/30 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-gold animate-spin" />
          </div>
          <p className="text-muted-foreground text-sm font-sans">
            Loading MLM Video Channel...
          </p>
        </div>
        <Toaster />
      </div>
    );
  }

  // Not logged in: show landing page
  if (!identity) {
    return (
      <>
        <LandingPage />
        <Toaster />
      </>
    );
  }

  // Logged in but no profile: show registration
  if (!profile) {
    return (
      <>
        <LandingPage showRegistration />
        <Toaster />
      </>
    );
  }

  // Has profile but no user data yet
  if (!user) {
    return (
      <div className="min-h-screen hero-gradient pattern-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
          <p className="text-muted-foreground text-sm">
            Loading your account...
          </p>
        </div>
        <Toaster />
      </div>
    );
  }

  // Registered but payment pending
  if (user.registrationStatus === "pending") {
    return (
      <>
        <PendingPage user={user} />
        <Toaster />
      </>
    );
  }

  // Admin route
  if (currentPage === "admin" && role === UserRole.admin) {
    return (
      <>
        <AppLayout
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          user={user}
          isAdmin={role === UserRole.admin}
        >
          <AdminPage />
        </AppLayout>
        <Toaster />
      </>
    );
  }

  // Confirmed member
  return (
    <>
      <AppLayout
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        user={user}
        isAdmin={role === UserRole.admin}
      >
        {currentPage === "dashboard" && <DashboardPage />}
        {currentPage === "referrals" && <ReferralPage user={user} />}
        {currentPage === "wallet" && <WalletPage user={user} />}
        {currentPage === "admin" && role === UserRole.admin && <AdminPage />}
      </AppLayout>
      <Toaster />
    </>
  );
}
