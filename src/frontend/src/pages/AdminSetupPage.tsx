import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Eye, EyeOff, Loader2, Shield, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { createActorWithConfig } from "../config";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function AdminSetupPage() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const [adminToken, setAdminToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [done, setDone] = useState(false);

  const handleBecomeAdmin = async () => {
    if (!identity) {
      login();
      return;
    }
    if (!adminToken.trim()) {
      toast.error("Please enter the admin token.");
      return;
    }

    try {
      setClaiming(true);

      // Create a FRESH actor with this identity — does NOT auto-call _initializeAccessControlWithSecret
      const freshActor = await createActorWithConfig({
        agentOptions: { identity },
      });

      // Call with admin token — if this principal is not yet registered, it will become admin
      await freshActor._initializeAccessControlWithSecret(adminToken.trim());

      // Verify it worked
      const isAdmin = await freshActor.isCallerAdmin();
      if (isAdmin) {
        setDone(true);
        toast.success("Admin access granted! You can now manage the app.");
      } else {
        toast.error(
          "Could not claim admin. The token may be wrong, or admin was already claimed by another identity. Contact Caffeine support if needed.",
        );
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to claim admin role";
      toast.error(msg);
    } finally {
      setClaiming(false);
    }
  };

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
                <CardDescription>
                  Tm11PrimeTime — First-time admin registration
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {done ? (
              <div
                className="flex flex-col items-center gap-4 py-4 text-center"
                data-ocid="adminsetup.success_state"
              >
                <CheckCircle2 className="w-12 h-12 text-success" />
                <div>
                  <p className="font-display font-semibold text-lg">
                    Admin access granted!
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">
                    You are now the admin. Go to the home page and log in -- the
                    Admin tab will appear in the menu bar.
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
              </div>
            ) : (
              <>
                {/* Step 1 */}
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
                      Your unique secure login
                    </p>
                  </div>
                </div>

                <div className="ml-4 border-l-2 border-border h-3" />

                {/* Step 2 */}
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
                    <p className="text-sm font-medium">Enter Admin Token</p>
                    <p className="text-xs text-muted-foreground">
                      Found in your Caffeine project settings
                    </p>
                  </div>
                </div>

                {!identity ? (
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
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-lg bg-success/5 border border-success/20 px-3 py-2 text-sm text-success flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span className="break-all font-mono text-xs">
                        {identity.getPrincipal().toString()}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="admin-token" className="text-sm">
                        Admin Token
                      </Label>
                      <div className="relative">
                        <Input
                          id="admin-token"
                          type={showToken ? "text" : "password"}
                          placeholder="Paste your admin token here"
                          value={adminToken}
                          onChange={(e) => setAdminToken(e.target.value)}
                          data-ocid="adminsetup.token.input"
                          className="pr-10 font-mono text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowToken((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          data-ocid="adminsetup.toggle_token_visibility.button"
                        >
                          {showToken ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Find this in your Caffeine dashboard under "Project
                        Settings" → "Admin Token"
                      </p>
                    </div>

                    <Button
                      className="w-full bg-primary text-primary-foreground gap-2 shadow-gold"
                      onClick={handleBecomeAdmin}
                      disabled={claiming || !adminToken.trim()}
                      data-ocid="adminsetup.become_admin.button"
                    >
                      {claiming ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Shield className="w-4 h-4" />
                      )}
                      {claiming ? "Claiming..." : "Step 2: Claim Admin Access"}
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
