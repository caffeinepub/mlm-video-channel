import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  ChevronRight,
  Copy,
  Loader2,
  PlaySquare,
  Shield,
  Star,
  TrendingUp,
  Users,
  Video,
  Wallet,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useRegisterUser } from "../hooks/useQueries";
import {
  ADMIN_UPI_ID,
  REFERRAL_LEVELS,
  getUpiDeepLinks,
} from "../utils/format";

interface LandingPageProps {
  showRegistration?: boolean;
}

export default function LandingPage({
  showRegistration = false,
}: LandingPageProps) {
  const { login, isLoggingIn, identity } = useInternetIdentity();
  const [showRegForm, setShowRegForm] = useState(showRegistration);
  const [formStep, setFormStep] = useState<"form" | "payment">("form");
  const [_referralCode, _setReferralCode] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    upiId: "",
    referralCode: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newReferralCode, setNewReferralCode] = useState("");

  const registerMutation = useRegisterUser();

  // Extract referral code from URL
  useState(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      setForm((f) => ({ ...f, referralCode: ref }));
      _setReferralCode(ref);
    }
  });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.mobile.match(/^[6-9]\d{9}$/))
      e.mobile = "Enter a valid 10-digit mobile number";
    if (!form.upiId.trim()) e.upiId = "UPI ID is required";
    if (!form.upiId.includes("@"))
      e.upiId = "Enter a valid UPI ID (e.g. name@upi)";
    return e;
  };

  const handleRegister = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    try {
      const code = await registerMutation.mutateAsync({
        name: form.name,
        mobile: form.mobile,
        upiId: form.upiId,
        referralCode: form.referralCode || null,
      });
      // Save profile so we can identify user on next load
      if (identity) {
        // We need the userId - but registerUser only returns referralCode
        // Save profile with name - userId will be resolved when we fetch user by referral code
        // The backend should auto-link profile on register
      }
      setNewReferralCode(code);
      setFormStep("payment");
      toast.success("Registration submitted! Complete payment to activate.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      toast.error(msg);
    }
  };

  const upiLinks = getUpiDeepLinks();

  const copyUpiId = () => {
    navigator.clipboard.writeText(ADMIN_UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const features = [
    {
      icon: Video,
      title: "Exclusive Videos",
      desc: "Access tutorials, courses & entertainment",
    },
    {
      icon: Users,
      title: "15-Level Referrals",
      desc: "Earn up to ₹10 per referral, 15 levels deep",
    },
    {
      icon: Wallet,
      title: "Earnings Wallet",
      desc: "Track and withdraw your earnings via UPI",
    },
    {
      icon: Shield,
      title: "Secure Platform",
      desc: "Internet Identity powered authentication",
    },
  ];

  return (
    <div className="min-h-screen hero-gradient pattern-bg relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-chart-3/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/3 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-20">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-16"
        >
          <div className="flex items-center gap-3">
            <img
              src="/assets/generated/mlm-logo-transparent.dim_200x200.png"
              alt="MLM Video Channel"
              className="w-10 h-10 rounded-xl object-cover"
            />
            <span className="font-display font-bold text-xl gold-gradient-text">
              MLM Video Channel
            </span>
          </div>
          {!identity && (
            <Button
              onClick={login}
              disabled={isLoggingIn}
              variant="outline"
              size="sm"
              data-ocid="landing.login.button"
              className="border-primary/30 text-primary hover:bg-primary/10 gap-2"
            >
              {isLoggingIn ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              Member Login
            </Button>
          )}
        </motion.header>

        {/* Hero Section */}
        {!showRegForm && (
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Star className="w-3.5 h-3.5" />
              Exclusive Members-Only Platform
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              <span className="text-foreground">Learn. Earn.</span>
              <br />
              <span className="gold-gradient-text">Grow Together.</span>
            </h1>

            <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Pay a one-time ₹100 registration fee. Get access to exclusive
              video content and earn through our 15-level referral network.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {identity ? (
                <Button
                  size="lg"
                  onClick={() => setShowRegForm(true)}
                  data-ocid="landing.register.primary_button"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8 py-6 text-base gap-2 shadow-gold"
                >
                  Complete Registration
                  <ChevronRight className="w-5 h-5" />
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={login}
                  disabled={isLoggingIn}
                  data-ocid="landing.get_started.primary_button"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8 py-6 text-base gap-2 shadow-gold"
                >
                  {isLoggingIn ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <PlaySquare className="w-5 h-5" />
                  )}
                  Get Started — ₹100 Only
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                onClick={() => setShowRegForm(true)}
                data-ocid="landing.register.secondary_button"
                className="border-border text-muted-foreground hover:text-foreground hover:border-primary/40 px-8 py-6 text-base"
              >
                Register Now
              </Button>
            </div>

            {/* Earnings preview */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-14 inline-flex items-center gap-6 px-6 py-3 rounded-2xl bg-card/60 border border-border gold-border backdrop-blur-sm"
            >
              <div className="text-center">
                <div className="text-2xl font-display font-bold text-primary">
                  ₹10
                </div>
                <div className="text-xs text-muted-foreground">
                  Per L1 Referral
                </div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <div className="text-2xl font-display font-bold text-primary">
                  15
                </div>
                <div className="text-xs text-muted-foreground">Levels Deep</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <div className="text-2xl font-display font-bold text-primary">
                  ₹500
                </div>
                <div className="text-xs text-muted-foreground">
                  Min Withdrawal
                </div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-success" />
                <span className="text-sm text-muted-foreground">
                  Unlimited Earning Potential
                </span>
              </div>
            </motion.div>
          </motion.section>
        )}

        {/* Features Grid */}
        {!showRegForm && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-20"
          >
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                >
                  <Card className="bg-card/60 border-border/80 card-glow card-glow-hover h-full">
                    <CardContent className="p-5">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-display font-semibold text-sm mb-1">
                        {f.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {f.desc}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.section>
        )}

        {/* Referral Earnings Table (landing) */}
        {!showRegForm && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-20"
          >
            <Card className="bg-card/60 border-border/80 card-glow overflow-hidden">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="font-display text-xl">
                  15-Level Referral Earnings
                </CardTitle>
                <CardDescription>
                  Earn ₹ rewards when members you refer (directly or indirectly)
                  join the platform
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-3 sm:grid-cols-5 divide-x divide-border">
                  {Object.entries(REFERRAL_LEVELS).map(([level, amount]) => (
                    <div
                      key={level}
                      className={cn(
                        "p-4 text-center border-b border-border",
                        level === "1" ? "bg-primary/5" : "",
                      )}
                    >
                      <div className="text-xs text-muted-foreground mb-1">
                        Level {level}
                      </div>
                      <div
                        className={cn(
                          "font-display font-bold text-lg",
                          level === "1" ? "text-primary" : "text-foreground",
                        )}
                      >
                        ₹{amount}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.section>
        )}

        {/* Registration Form / Payment */}
        <AnimatePresence mode="wait">
          {showRegForm && (
            <motion.div
              key="reg-section"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.35 }}
              className="max-w-lg mx-auto"
            >
              {formStep === "form" ? (
                <Card className="bg-card/80 border-border card-glow backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <img
                        src="/assets/generated/mlm-logo-transparent.dim_200x200.png"
                        alt="Logo"
                        className="w-10 h-10 rounded-xl"
                      />
                      <div>
                        <CardTitle className="font-display text-xl">
                          Join MLM Video Channel
                        </CardTitle>
                        <CardDescription>
                          Pay ₹100 once to unlock everything
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-name" className="text-sm">
                        Full Name
                      </Label>
                      <Input
                        id="reg-name"
                        placeholder="Rahul Kumar"
                        value={form.name}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, name: e.target.value }))
                        }
                        data-ocid="register.name.input"
                        className={cn(errors.name && "border-destructive")}
                      />
                      {errors.name && (
                        <p
                          className="text-xs text-destructive"
                          data-ocid="register.name_error"
                        >
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Mobile */}
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-mobile" className="text-sm">
                        Mobile Number
                      </Label>
                      <Input
                        id="reg-mobile"
                        placeholder="9876543210"
                        value={form.mobile}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, mobile: e.target.value }))
                        }
                        data-ocid="register.mobile.input"
                        maxLength={10}
                        className={cn(errors.mobile && "border-destructive")}
                      />
                      {errors.mobile && (
                        <p
                          className="text-xs text-destructive"
                          data-ocid="register.mobile_error"
                        >
                          {errors.mobile}
                        </p>
                      )}
                    </div>

                    {/* UPI ID */}
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-upi" className="text-sm">
                        Your UPI ID
                      </Label>
                      <Input
                        id="reg-upi"
                        placeholder="yourname@paytm"
                        value={form.upiId}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, upiId: e.target.value }))
                        }
                        data-ocid="register.upi_id.input"
                        className={cn(errors.upiId && "border-destructive")}
                      />
                      {errors.upiId && (
                        <p
                          className="text-xs text-destructive"
                          data-ocid="register.upi_error"
                        >
                          {errors.upiId}
                        </p>
                      )}
                    </div>

                    {/* Referral Code */}
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-referral" className="text-sm">
                        Referral Code{" "}
                        <span className="text-muted-foreground">
                          (Optional)
                        </span>
                      </Label>
                      <Input
                        id="reg-referral"
                        placeholder="Enter referral code"
                        value={form.referralCode}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            referralCode: e.target.value,
                          }))
                        }
                        data-ocid="register.referral_code.input"
                      />
                    </div>

                    {/* Login option */}
                    {!identity && (
                      <div className="rounded-xl bg-accent/50 border border-border p-4 text-sm">
                        <p className="text-muted-foreground mb-2">
                          Already a member?
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={login}
                          disabled={isLoggingIn}
                          data-ocid="register.login.button"
                          className="border-primary/30 text-primary gap-2"
                        >
                          {isLoggingIn ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : null}
                          Login with Internet Identity
                        </Button>
                      </div>
                    )}

                    {identity ? (
                      <Button
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-5 shadow-gold"
                        onClick={handleRegister}
                        disabled={registerMutation.isPending}
                        data-ocid="register.submit.button"
                      >
                        {registerMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
                        Register & Proceed to Payment
                      </Button>
                    ) : (
                      <Button
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-5 shadow-gold"
                        onClick={login}
                        disabled={isLoggingIn}
                        data-ocid="register.login_to_proceed.button"
                      >
                        {isLoggingIn ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
                        Login to Register
                      </Button>
                    )}

                    <p className="text-xs text-muted-foreground text-center">
                      By registering you agree to pay ₹100 registration fee via
                      UPI
                    </p>
                  </CardContent>
                </Card>
              ) : (
                /* Payment Step */
                <Card className="bg-card/80 border-border card-glow backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                      <CardTitle className="font-display text-xl">
                        Registration Submitted!
                      </CardTitle>
                    </div>
                    <CardDescription>
                      Complete the ₹100 payment to activate your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {newReferralCode && (
                      <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
                        <p className="text-xs text-muted-foreground mb-1">
                          Your Referral Code
                        </p>
                        <p className="font-mono-custom font-bold text-primary text-lg">
                          {newReferralCode}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Save this for sharing
                        </p>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Pay to UPI ID</p>
                        <button
                          type="button"
                          onClick={copyUpiId}
                          data-ocid="payment.copy_upi.button"
                          className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80"
                        >
                          {copiedUpi ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          {copiedUpi ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <div className="font-mono-custom text-lg font-bold p-3 rounded-lg bg-accent border border-border">
                        {ADMIN_UPI_ID}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-3">
                        Pay directly via app
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(upiLinks).map(([name, link]) => (
                          <a
                            key={name}
                            href={link}
                            data-ocid={`payment.${name.toLowerCase()}.button`}
                            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary border border-border hover:border-primary/30 hover:bg-accent transition-all font-medium text-sm"
                          >
                            <span className="text-base">
                              {name === "PhonePe"
                                ? "💜"
                                : name === "GPay"
                                  ? "🔵"
                                  : name === "Paytm"
                                    ? "🔷"
                                    : "🇮🇳"}
                            </span>
                            {name}
                          </a>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl bg-warning/10 border border-warning/20 p-4 text-sm text-warning">
                      <p className="font-medium mb-1">⚠️ Important</p>
                      <p className="text-warning/80">
                        Your account will be activated after admin confirms your
                        ₹100 payment. This may take a few hours.
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setFormStep("form")}
                      data-ocid="payment.back.button"
                    >
                      Back to Form
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Back to home */}
              <button
                type="button"
                onClick={() => setShowRegForm(false)}
                className="block mt-4 text-sm text-muted-foreground hover:text-foreground mx-auto"
                data-ocid="register.back_to_home.button"
              >
                ← Back to home
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 py-6">
        <p className="text-center text-sm text-muted-foreground">
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
      </footer>
    </div>
  );
}
