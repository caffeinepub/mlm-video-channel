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
  PlayCircle,
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

const UPI_LOGOS: Record<string, { src: string; alt: string }> = {
  PhonePe: {
    src: "/assets/generated/logo-phonepe-transparent.dim_120x120.png",
    alt: "PhonePe",
  },
  GPay: {
    src: "/assets/generated/logo-gpay-transparent.dim_120x120.png",
    alt: "Google Pay",
  },
  Paytm: {
    src: "/assets/generated/logo-paytm-transparent.dim_120x120.png",
    alt: "Paytm",
  },
  BHIM: {
    src: "/assets/generated/logo-bhim-transparent.dim_120x120.png",
    alt: "BHIM UPI",
  },
};

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
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Cinematic Hero Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('/assets/generated/hero-cinematic-bg.dim_1200x800.jpg')",
        }}
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/55" />
      {/* Gradient overlay bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between py-5"
        >
          <div className="flex items-center gap-3">
            <img
              src="/assets/generated/mlm-logo-transparent.dim_200x200.png"
              alt="Tm11PrimeTime"
              className="w-10 h-10 rounded-xl object-cover"
            />
            <span className="font-display font-bold text-xl gold-gradient-text">
              Tm11PrimeTime
            </span>
          </div>
          {!identity && (
            <Button
              onClick={login}
              disabled={isLoggingIn}
              variant="outline"
              size="sm"
              data-ocid="landing.login.button"
              className="border-white/30 text-white hover:bg-white/10 gap-2 bg-black/30 backdrop-blur-sm"
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
            className="text-center pt-16 pb-8 min-h-[70vh] flex flex-col items-center justify-center"
          >
            {/* Premium badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-sm font-semibold mb-8">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              Premium Membership Channel
            </div>

            {/* Main heading - matching screenshot style */}
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 tracking-tight">
              <span className="gold-gradient-text">Exclusive Video</span>
              <br />
              <span className="text-white">Content</span>
              <br />
              <span className="text-white">For Members Only</span>
            </h1>

            <p className="text-white/70 text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Join our premium video channel with a one-time ₹100 registration
              fee. Earn rewards by referring friends and unlock exclusive
              content.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {identity ? (
                <Button
                  size="lg"
                  onClick={() => setShowRegForm(true)}
                  data-ocid="landing.register.primary_button"
                  className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-10 py-6 text-base gap-2 rounded-full shadow-lg"
                >
                  <PlayCircle className="w-5 h-5" />
                  Watch Videos
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={login}
                  disabled={isLoggingIn}
                  data-ocid="landing.get_started.primary_button"
                  className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-10 py-6 text-base gap-2 rounded-full shadow-lg"
                >
                  {isLoggingIn ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <PlayCircle className="w-5 h-5" />
                  )}
                  Watch Videos
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                onClick={() => setShowRegForm(true)}
                data-ocid="landing.register.secondary_button"
                className="border-white/30 text-white hover:text-white hover:border-white/60 bg-white/5 backdrop-blur-sm px-8 py-6 text-base rounded-full"
              >
                Register Now — ₹100 Only
              </Button>
            </div>

            {/* Stats bar */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-14 inline-flex items-center gap-6 px-6 py-3 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-md"
            >
              <div className="text-center">
                <div className="text-2xl font-display font-bold text-amber-400">
                  ₹10
                </div>
                <div className="text-xs text-white/50">Per L1 Referral</div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <div className="text-2xl font-display font-bold text-amber-400">
                  15
                </div>
                <div className="text-xs text-white/50">Levels Deep</div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <div className="text-2xl font-display font-bold text-amber-400">
                  ₹500
                </div>
                <div className="text-xs text-white/50">Min Withdrawal</div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm text-white/60 hidden sm:inline">
                  Unlimited Earning
                </span>
              </div>
            </motion.div>
          </motion.section>
        )}

        {/* Why Join section heading */}
        {!showRegForm && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8 mt-4"
          >
            <h2 className="font-display text-3xl font-bold text-white mb-2">
              Why Join <span className="gold-gradient-text">Tm11PrimeTime</span>
              ?
            </h2>
            <p className="text-white/50 text-sm">
              Everything you need to earn and learn
            </p>
          </motion.div>
        )}

        {/* Features Grid */}
        {!showRegForm && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16"
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
                  <Card className="bg-black/50 border-white/10 backdrop-blur-md h-full hover:border-amber-400/30 transition-colors">
                    <CardContent className="p-5">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-400/20 flex items-center justify-center mb-3">
                        <Icon className="w-5 h-5 text-amber-400" />
                      </div>
                      <h3 className="font-display font-semibold text-sm mb-1 text-white">
                        {f.title}
                      </h3>
                      <p className="text-xs text-white/50 leading-relaxed">
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
            <Card className="bg-black/50 border-white/10 backdrop-blur-md overflow-hidden">
              <CardHeader className="border-b border-white/10 pb-4">
                <CardTitle className="font-display text-xl text-white">
                  15-Level Referral Earnings
                </CardTitle>
                <CardDescription className="text-white/50">
                  Earn ₹ rewards when members you refer (directly or indirectly)
                  join the platform
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-3 sm:grid-cols-5 divide-x divide-white/10">
                  {Object.entries(REFERRAL_LEVELS).map(([level, amount]) => (
                    <div
                      key={level}
                      className={cn(
                        "p-4 text-center border-b border-white/10",
                        level === "1" ? "bg-amber-500/10" : "",
                      )}
                    >
                      <div className="text-xs text-white/40 mb-1">
                        Level {level}
                      </div>
                      <div
                        className={cn(
                          "font-display font-bold text-lg",
                          level === "1" ? "text-amber-400" : "text-white",
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
              className="max-w-lg mx-auto py-8"
            >
              {formStep === "form" ? (
                <Card className="bg-black/70 border-white/10 backdrop-blur-md">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <img
                        src="/assets/generated/mlm-logo-transparent.dim_200x200.png"
                        alt="Logo"
                        className="w-10 h-10 rounded-xl"
                      />
                      <div>
                        <CardTitle className="font-display text-xl text-white">
                          Join Tm11PrimeTime
                        </CardTitle>
                        <CardDescription className="text-white/50">
                          Pay ₹100 once to unlock everything
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="reg-name"
                        className="text-sm text-white/70"
                      >
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
                        className={cn(
                          "bg-white/5 border-white/10 text-white placeholder:text-white/30",
                          errors.name && "border-destructive",
                        )}
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
                      <Label
                        htmlFor="reg-mobile"
                        className="text-sm text-white/70"
                      >
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
                        className={cn(
                          "bg-white/5 border-white/10 text-white placeholder:text-white/30",
                          errors.mobile && "border-destructive",
                        )}
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
                      <Label
                        htmlFor="reg-upi"
                        className="text-sm text-white/70"
                      >
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
                        className={cn(
                          "bg-white/5 border-white/10 text-white placeholder:text-white/30",
                          errors.upiId && "border-destructive",
                        )}
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
                      <Label
                        htmlFor="reg-referral"
                        className="text-sm text-white/70"
                      >
                        Referral Code{" "}
                        <span className="text-white/30">(Optional)</span>
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
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                      />
                    </div>

                    {/* Login option */}
                    {!identity && (
                      <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-sm">
                        <p className="text-white/50 mb-2">Already a member?</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={login}
                          disabled={isLoggingIn}
                          data-ocid="register.login.button"
                          className="border-amber-400/30 text-amber-400 gap-2 bg-transparent"
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
                        className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-5"
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
                        className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-5"
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

                    <p className="text-xs text-white/30 text-center">
                      By registering you agree to pay ₹100 registration fee via
                      UPI
                    </p>
                  </CardContent>
                </Card>
              ) : (
                /* Payment Step */
                <Card className="bg-black/70 border-white/10 backdrop-blur-md">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      <CardTitle className="font-display text-xl text-white">
                        Registration Submitted!
                      </CardTitle>
                    </div>
                    <CardDescription className="text-white/50">
                      Complete the ₹100 payment to activate your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {newReferralCode && (
                      <div className="rounded-xl bg-amber-500/10 border border-amber-400/20 p-4">
                        <p className="text-xs text-white/50 mb-1">
                          Your Referral Code
                        </p>
                        <p className="font-mono-custom font-bold text-amber-400 text-lg">
                          {newReferralCode}
                        </p>
                        <p className="text-xs text-white/40 mt-1">
                          Save this for sharing
                        </p>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white">
                          Pay to UPI ID
                        </p>
                        <button
                          type="button"
                          onClick={copyUpiId}
                          data-ocid="payment.copy_upi.button"
                          className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300"
                        >
                          {copiedUpi ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          {copiedUpi ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <div className="font-mono-custom text-sm font-bold p-3 rounded-lg bg-white/5 border border-white/10 text-white">
                        {ADMIN_UPI_ID}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-3 text-white">
                        Pay directly via app
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(upiLinks).map(([name, link]) => (
                          <a
                            key={name}
                            href={link}
                            data-ocid={`payment.${name.toLowerCase()}.button`}
                            className="flex items-center justify-center gap-2 py-3 px-2 rounded-xl bg-white/5 border border-white/10 hover:border-amber-400/30 hover:bg-white/10 transition-all font-medium text-sm text-white"
                          >
                            <img
                              src={UPI_LOGOS[name]?.src}
                              alt={UPI_LOGOS[name]?.alt ?? name}
                              className="w-6 h-6 object-contain rounded"
                            />
                            {name}
                          </a>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl bg-amber-500/10 border border-amber-400/20 p-4 text-sm text-amber-300">
                      <p className="font-medium mb-1">Important</p>
                      <p className="text-amber-300/70">
                        Your account will be activated after admin confirms your
                        ₹100 payment. This may take a few hours.
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full border-white/10 text-white hover:bg-white/5"
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
                className="block mt-4 text-sm text-white/40 hover:text-white/70 mx-auto"
                data-ocid="register.back_to_home.button"
              >
                ← Back to home
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-6 mt-8">
        <p className="text-center text-sm text-white/30">
          © {new Date().getFullYear()} Tm11PrimeTime. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400/70 hover:text-amber-400"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
