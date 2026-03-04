import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, Info, Loader2, Shield, User } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createActorWithConfig } from "../config";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

type PageState =
  | "idle"
  | "checking"
  | "already_admin"
  | "claiming"
  | "success"
  | "admin_taken";

export default function AdminSetupPage() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const [pageState, setPageState] = useState<PageState>("idle");

  // When identity is available, check if caller is already admin
  useEffect(() => {
    if (!identity) return;

    let cancelled = false;
    const checkAdmin = async () => {
      setPageState("checking");
      try {
        const freshActor = await createActorWithConfig({
          agentOptions: { identity },
        });
        const isAdmin = await freshActor.isCallerAdmin();
        if (!cancelled) {
          if (isAdmin) {
            setPageState("already_admin");
          } else {
            setPageState("idle");
          }
        }
      } catch {
        if (!cancelled) setPageState("idle");
      }
    };

    checkAdmin();
    return () => {
      cancelled = true;
    };
  }, [identity]);

  const handleClaimAdmin = async () => {
    if (!identity) return;

    setPageState("claiming");
    try {
      const freshActor = await createActorWithConfig({
        agentOptions: { identity },
      });
      const result = await freshActor.claimFirstAdmin();
      if (result) {
        setPageState("success");
        toast.success("Admin access granted!");
      } else {
        setPageState("admin_taken");
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to claim admin role";
      toast.error(msg);
      setPageState("idle");
    }
  };

  const isClaiming = pageState === "claiming";
  const isChecking = pageState === "checking";

  return (
    <div className="min-h-screen hero-gradient pattern-bg flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-card/80 border-border card-glow backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="font-display text-xl">
                  Admin Setup
                </CardTitle>
                <CardDescription>Tm11PrimeTime — Admin Login</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Already admin state */}
            {pageState === "already_admin" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 py-4 text-center"
                data-ocid="adminsetup.already_admin_state"
              >
                <CheckCircle2 className="w-12 h-12 text-success" />
                <div>
                  <p className="font-display font-semibold text-lg">
                    You are already the admin!
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">
                    Go to the home page and use the Admin tab to manage users,
                    videos, and withdrawals.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    window.location.href = "/";
                  }}
                  data-ocid="adminsetup.goto_home.button"
                  className="bg-primary text-primary-foreground"
                >
                  Go to Home
                </Button>
              </motion.div>
            )}

            {/* Success state */}
            {pageState === "success" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 py-4 text-center"
                data-ocid="adminsetup.success_state"
              >
                <CheckCircle2 className="w-12 h-12 text-success" />
                <div>
                  <p className="font-display font-semibold text-lg">
                    You are now the admin!
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">
                    Every time you log in with this Internet Identity, you will
                    have admin access.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    window.location.href = "/";
                  }}
                  data-ocid="adminsetup.goto_home.button"
                  className="bg-primary text-primary-foreground"
                >
                  Go to Home
                </Button>
              </motion.div>
            )}

            {/* Admin already taken state */}
            {pageState === "admin_taken" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 py-4 text-center"
                data-ocid="adminsetup.admin_taken_state"
              >
                <Info className="w-12 h-12 text-warning" />
                <div>
                  <p className="font-display font-semibold text-lg">
                    Admin already claimed
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">
                    Admin access has already been claimed. Log in with the
                    original admin Internet Identity to access the Admin panel.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    window.location.href = "/";
                  }}
                  data-ocid="adminsetup.goto_home.button"
                >
                  Go Back
                </Button>
              </motion.div>
            )}

            {/* Main flow: idle / checking / claiming */}
            {(pageState === "idle" ||
              pageState === "checking" ||
              pageState === "claiming") && (
              <>
                {/* Step 1: Login */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                      identity
                        ? "bg-success/20 border-success text-success"
                        : "bg-primary/10 border-primary text-primary"
                    }`}
                  >
                    {identity ? <CheckCircle2 className="w-4 h-4" /> : "1"}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Log in with Internet Identity
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Your secure login
                    </p>
                  </div>
                </div>

                <div className="ml-4 border-l-2 border-border h-3" />

                {/* Step 2: Claim */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                      identity
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-muted/50 border-muted-foreground/30 text-muted-foreground"
                    }`}
                  >
                    2
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Claim Admin Access</p>
                    <p className="text-xs text-muted-foreground">
                      One tap to become admin
                    </p>
                  </div>
                </div>

                {/* Step 1 button: not logged in */}
                {!identity && (
                  <Button
                    className="w-full gap-2 mt-2"
                    onClick={login}
                    disabled={isLoggingIn}
                    data-ocid="adminsetup.login.button"
                  >
                    {isLoggingIn ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                    {isLoggingIn ? "Logging in..." : "Step 1: Log In"}
                  </Button>
                )}

                {/* Logged in: show identity badge + Step 2 button */}
                {identity && (
                  <div className="space-y-3">
                    <div className="rounded-lg bg-success/5 border border-success/20 px-3 py-2 text-sm text-success flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span className="break-all font-mono text-xs">
                        Logged in as:{" "}
                        {identity.getPrincipal().toString().slice(0, 20)}...
                      </span>
                    </div>

                    <Button
                      className="w-full bg-primary text-primary-foreground gap-2 shadow-gold"
                      onClick={handleClaimAdmin}
                      disabled={isClaiming || isChecking}
                      data-ocid="adminsetup.become_admin.button"
                    >
                      {isClaiming || isChecking ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Shield className="w-4 h-4" />
                      )}
                      {isChecking
                        ? "Checking..."
                        : isClaiming
                          ? "Claiming..."
                          : "Step 2: Claim Admin Access"}
                    </Button>
                  </div>
                )}

                <p className="text-xs text-muted-foreground text-center pt-1">
                  After this, you can manage users, videos, and withdrawals from
                  the Admin panel.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
