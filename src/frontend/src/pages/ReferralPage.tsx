import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  ChevronRight,
  Copy,
  IndianRupee,
  Share2,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { User } from "../backend.d";
import { useReferralEarnings } from "../hooks/useQueries";
import { REFERRAL_LEVELS, paiseToRupees } from "../utils/format";

interface ReferralPageProps {
  user: User;
}

export default function ReferralPage({ user }: ReferralPageProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const referralLink = `${window.location.origin}/?ref=${user.referralCode}`;
  const { data: totalEarnings } = useReferralEarnings(user.id);

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(user.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const shareLink = () => {
    const message = encodeURIComponent(
      `Join me on MLM Video Channel! Pay ₹100 once to access exclusive videos and earn through referrals.\n\nUse my referral link: ${referralLink}`,
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const levelColors = [
    "text-chart-1 bg-chart-1/10 border-chart-1/30",
    "text-chart-2 bg-chart-2/10 border-chart-2/30",
    "text-chart-3 bg-chart-3/10 border-chart-3/30",
    "text-chart-4 bg-chart-4/10 border-chart-4/30",
    "text-chart-5 bg-chart-5/10 border-chart-5/30",
  ];

  const earningsSummary = Object.entries(REFERRAL_LEVELS).reduce(
    (total, [, amount]) => total + amount,
    0,
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold mb-1">
          Referral Program
        </h1>
        <p className="text-muted-foreground">
          Earn ₹ rewards for every member you bring in — 15 levels deep
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card className="bg-card/70 border-border/80 card-glow">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <IndianRupee className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">
                  Total Referral Earnings
                </span>
              </div>
              <p className="font-display text-2xl font-bold text-primary">
                ₹{totalEarnings != null ? paiseToRupees(totalEarnings) : "0.00"}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-card/70 border-border/80 card-glow">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-chart-2/10 border border-chart-2/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-chart-2" />
                </div>
                <span className="text-sm text-muted-foreground">
                  Max Per Referral Chain
                </span>
              </div>
              <p className="font-display text-2xl font-bold">
                ₹{earningsSummary.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="bg-card/70 border-border/80 card-glow">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-chart-3/10 border border-chart-3/20 flex items-center justify-center">
                  <Users className="w-4 h-4 text-chart-3" />
                </div>
                <span className="text-sm text-muted-foreground">
                  Referral Levels
                </span>
              </div>
              <p className="font-display text-2xl font-bold">15</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Referral link card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-card/70 border-border/80 card-glow">
          <CardHeader>
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <Share2 className="w-5 h-5 text-primary" />
              Your Referral Link
            </CardTitle>
            <CardDescription>
              Share this link — when someone joins through it, you earn!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Referral code */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1.5">
                  Referral Code
                </p>
                <div className="flex items-center gap-2">
                  <code className="font-mono-custom font-bold text-xl text-primary tracking-widest px-4 py-2 bg-primary/5 border border-primary/20 rounded-xl">
                    {user.referralCode}
                  </code>
                  <button
                    type="button"
                    onClick={copyCode}
                    data-ocid="referral.copy_code.button"
                    className="p-2 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all"
                  >
                    {copiedCode ? (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Referral link */}
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">
                Referral Link
              </p>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={referralLink}
                  data-ocid="referral.link.input"
                  className="flex-1 text-sm font-mono-custom bg-accent border border-border rounded-xl px-4 py-2.5 text-muted-foreground min-w-0"
                />
                <button
                  type="button"
                  onClick={copyLink}
                  data-ocid="referral.copy_link.button"
                  className="p-2.5 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all"
                >
                  {copiedLink ? (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              onClick={shareLink}
              data-ocid="referral.share.button"
              className="w-full gap-2 font-semibold shadow-gold"
              style={{ backgroundColor: "#25D366", color: "#fff" }}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-label="WhatsApp"
              >
                <title>WhatsApp</title>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Share on WhatsApp
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Level earnings table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card className="bg-card/70 border-border/80 card-glow overflow-hidden">
          <CardHeader>
            <CardTitle className="font-display text-xl">
              Earnings Per Level
            </CardTitle>
            <CardDescription>
              You earn these amounts when someone registers through your
              referral network at each level
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {Object.entries(REFERRAL_LEVELS).map(
                ([levelStr, amount], idx) => {
                  const level = Number.parseInt(levelStr);
                  const colorClass = levelColors[idx % levelColors.length];
                  const isTopLevel = level <= 3;
                  return (
                    <div
                      key={level}
                      data-ocid={`referral.level.item.${level}`}
                      className={cn(
                        "flex items-center justify-between px-5 py-3.5 hover:bg-accent/30 transition-colors",
                        isTopLevel ? "bg-primary/3" : "",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border",
                            colorClass,
                          )}
                        >
                          {level}
                        </span>
                        <div>
                          <p className="text-sm font-medium">Level {level}</p>
                          <p className="text-xs text-muted-foreground">
                            {level === 1
                              ? "Direct referral"
                              : `${level} levels down`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "font-display font-bold text-lg",
                            level === 1 ? "text-primary" : "text-foreground",
                          )}
                        >
                          ₹{amount}
                        </span>
                        {isTopLevel && (
                          <Badge
                            variant="outline"
                            className="text-xs border-primary/20 text-primary"
                          >
                            Top Tier
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                },
              )}
            </div>

            {/* Total row */}
            <div className="flex items-center justify-between px-5 py-4 bg-primary/5 border-t border-primary/20">
              <span className="font-medium">
                Maximum Total Earnings Per Chain
              </span>
              <span className="font-display font-bold text-xl text-primary">
                ₹{earningsSummary.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* How it works */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-card/70 border-border/80 card-glow">
          <CardHeader>
            <CardTitle className="font-display text-xl">
              How Referrals Work
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  step: "1",
                  text: "Share your unique referral link or code with friends",
                },
                {
                  step: "2",
                  text: "Friend registers using your link and pays ₹100",
                },
                {
                  step: "3",
                  text: "You earn ₹10 once admin confirms their payment",
                },
                {
                  step: "4",
                  text: "When your friend refers others, you earn ₹5 (Level 2)",
                },
                {
                  step: "5",
                  text: "This continues up to 15 levels deep in your network",
                },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                    {item.step}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed pt-1">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
