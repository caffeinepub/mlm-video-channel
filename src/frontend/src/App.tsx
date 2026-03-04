import { Toaster } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { User } from "./backend.d";
import AppLayout from "./components/AppLayout";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useCallerProfile, useIsAdmin, useUserById } from "./hooks/useQueries";
import AdminPage from "./pages/AdminPage";
import AdminSetupPage from "./pages/AdminSetupPage";
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
  const { data: isAdminData, isLoading: isAdminLoading } = useIsAdmin();

  const isAdminSetupPage = window.location.pathname === "/admin-setup";

  // Use ONLY isCallerAdmin() -- getCallerUserRole() returns #guest for admin-only
  // identities so it cannot be trusted for admin detection
  const isAdmin = !isAdminLoading && isAdminData === true;

  // Check URL for admin route
  useEffect(() => {
    if (window.location.pathname === "/admin") {
      setCurrentPage("admin");
    }
  }, []);

  const userId = profile?.userId ?? null;
  const { data: user, isLoading: userLoading } = useUserById(userId);

  // Wait for identity + admin checks. For users, also wait for their profile/user data.
  const rawLoading =
    isInitializing ||
    isAdminLoading ||
    // Only wait for profile once actor is ready (not during identity init)
    (!isInitializing && profileLoading) ||
    (!!profile && userLoading);

  // Safety timeout: if loading takes more than 6 seconds, force past it
  useEffect(() => {
    if (!rawLoading) {
      setLoadingTimedOut(false);
      return;
    }
    const timer = setTimeout(() => setLoadingTimedOut(true), 10000);
    return () => clearTimeout(timer);
  }, [rawLoading]);

  // Admin setup page — accessible without any registration
  if (isAdminSetupPage) {
    return (
      <>
        <AdminSetupPage />
        <Toaster />
      </>
    );
  }

  const isLoading = rawLoading && !loadingTimedOut;

  if (isLoading) {
    return (
      <div className="min-h-screen hero-gradient pattern-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full border-2 border-gold/30 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-gold animate-spin" />
          </div>
          <p className="text-muted-foreground text-sm font-sans">
            Loading Tm11PrimeTime...
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

  // Admin identity (no user profile needed)
  if (isAdmin) {
    const adminUser: User = user ?? {
      id: BigInt(0),
      name: "Admin",
      mobile: "",
      upiId: "",
      referralCode: "",
      registrationStatus: "confirmed",
      walletBalance: BigInt(0),
      createdAt: BigInt(0),
      ancestors: [],
    };
    // Default admin to "admin" page
    const adminPage =
      currentPage === "admin" ||
      !["dashboard", "referrals", "wallet"].includes(currentPage)
        ? "admin"
        : currentPage;
    return (
      <>
        <AppLayout
          currentPage={adminPage as AppPage}
          onNavigate={setCurrentPage}
          user={adminUser}
          isAdmin={true}
        >
          {adminPage === "admin" && <AdminPage />}
          {adminPage === "dashboard" && <DashboardPage />}
          {adminPage === "referrals" && <ReferralPage user={adminUser} />}
          {adminPage === "wallet" && <WalletPage user={adminUser} />}
        </AppLayout>
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

  // Confirmed member
  return (
    <>
      <AppLayout
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        user={user}
        isAdmin={false}
      >
        {currentPage === "dashboard" && <DashboardPage />}
        {currentPage === "referrals" && <ReferralPage user={user} />}
        {currentPage === "wallet" && <WalletPage user={user} />}
      </AppLayout>
      <Toaster />
    </>
  );
}
