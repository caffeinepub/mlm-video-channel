import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2,
  Clock,
  Copy,
  Loader2,
  LogOut,
  PlaySquare,
  Send,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { User } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSubmitUTR } from "../hooks/useQueries";
import { ADMIN_UPI_ID, getUpiDeepLinks } from "../utils/format";

interface PendingPageProps {
  user: User;
}

export default function PendingPage({ user }: PendingPageProps) {
  const { clear } = useInternetIdentity();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [utrInput, setUtrInput] = useState("");
  const submitUTRMutation = useSubmitUTR();

  const handleSubmitUTR = async () => {
    if (!utrInput.trim()) return;
    try {
      await submitUTRMutation.mutateAsync(utrInput.trim());
      toast.success("UTR submitted successfully! Admin will review shortly.");
      setUtrInput("");
    } catch {
      toast.error("Failed to submit UTR. Please try again.");
    }
  };

  const referralLink = `${window.location.origin}/?ref=${user.referralCode}`;
  const upiLinks = getUpiDeepLinks();

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyUpi = () => {
    navigator.clipboard.writeText(ADMIN_UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  return (
    <div className="min-h-screen hero-gradient pattern-bg flex flex-col">
      {/* Header */}
      <header className="glass-panel border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/assets/generated/mlm-logo-transparent.dim_200x200.png"
            alt="MLM Video Channel"
            className="w-9 h-9 rounded-xl"
          />
          <span className="font-display font-bold text-lg gold-gradient-text">
            MLM Video Channel
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clear}
          data-ocid="pending.logout.button"
          className="text-muted-foreground hover:text-destructive gap-2"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg space-y-5"
        >
          {/* Status card */}
          <Card
            className="bg-card/80 border-warning/30 backdrop-blur-sm overflow-hidden"
            data-ocid="pending.status.card"
          >
            <div className="h-1 w-full bg-gradient-to-r from-warning/60 to-warning" />
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-warning/10 border border-warning/30 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <CardTitle className="font-display text-xl">
                    Payment Under Review
                  </CardTitle>
                  <CardDescription>Hello, {user.name}!</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Your payment of{" "}
                <span className="text-foreground font-semibold">₹100</span> is
                currently under review. Your account will be activated once the
                admin confirms your payment. This typically takes a few hours.
              </p>

              <div className="rounded-xl bg-warning/5 border border-warning/20 p-4">
                <p className="text-xs text-warning/80 font-medium mb-1">
                  What happens next?
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>✓ Admin reviews your payment proof</li>
                  <li>✓ Your account gets activated</li>
                  <li>✓ You get access to all exclusive videos</li>
                  <li>✓ Your referral link becomes active</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Payment reminder */}
          <Card className="bg-card/70 border-border/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base">
                Complete Your Payment
              </CardTitle>
              <CardDescription>
                If you haven't paid yet, pay now to proceed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Pay to UPI ID
                  </p>
                  <p className="font-mono-custom font-bold text-sm">
                    {ADMIN_UPI_ID}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={copyUpi}
                  data-ocid="pending.copy_upi.button"
                  className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 px-3 py-1.5 rounded-lg border border-primary/20 hover:bg-primary/5"
                >
                  {copiedUpi ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copiedUpi ? "Copied!" : "Copy"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {Object.entries(upiLinks).map(([name, link]) => (
                  <a
                    key={name}
                    href={link}
                    data-ocid={`pending.pay_${name.toLowerCase()}.button`}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-secondary border border-border hover:border-primary/30 hover:bg-accent transition-all text-sm font-medium"
                  >
                    <span>
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
            </CardContent>
          </Card>

          {/* UTR Submission */}
          <Card className="bg-card/70 border-primary/20 backdrop-blur-sm border">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Send className="w-4 h-4 text-primary" />
                Submit Payment Proof
              </CardTitle>
              <CardDescription>
                Enter your UTR / Transaction ID after completing the UPI payment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {user.utrId && (
                <div className="rounded-lg bg-success/5 border border-success/20 px-3 py-2 text-sm">
                  <span className="text-success/80 font-medium text-xs">
                    Already submitted:{" "}
                  </span>
                  <span className="font-mono-custom text-xs">{user.utrId}</span>
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="Enter UTR / Transaction ID"
                  value={utrInput}
                  onChange={(e) => setUtrInput(e.target.value)}
                  data-ocid="pending.utr.input"
                  className="flex-1 font-mono-custom text-sm"
                />
                <Button
                  onClick={handleSubmitUTR}
                  disabled={submitUTRMutation.isPending || !utrInput.trim()}
                  data-ocid="pending.utr.submit_button"
                  className="bg-primary text-primary-foreground gap-1.5 whitespace-nowrap"
                >
                  {submitUTRMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Submit
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                After submitting, admin will verify your payment and activate
                your account.
              </p>
            </CardContent>
          </Card>

          {/* Referral code (can share while pending) */}
          <Card className="bg-card/70 border-border/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <PlaySquare className="w-4 h-4 text-primary" />
                Your Referral Code
              </CardTitle>
              <CardDescription>
                Share with friends to earn when you get activated
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <code className="flex-1 font-mono-custom text-primary font-bold text-lg px-4 py-2 rounded-lg bg-primary/5 border border-primary/20">
                  {user.referralCode}
                </code>
              </div>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={referralLink}
                  className="flex-1 text-xs font-mono-custom bg-accent border border-border rounded-lg px-3 py-2 text-muted-foreground"
                  data-ocid="pending.referral_link.input"
                />
                <button
                  type="button"
                  onClick={copyLink}
                  data-ocid="pending.copy_referral.button"
                  className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 px-3 py-2 rounded-lg border border-primary/20 hover:bg-primary/5 whitespace-nowrap"
                >
                  {copiedLink ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copiedLink ? "Copied!" : "Copy Link"}
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <footer className="border-t border-border/50 py-4">
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
