import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Copy,
  IndianRupee,
  Network,
  Share2,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import type { User } from "../backend.d";
import { useReferralEarnings, useWalletDetails } from "../hooks/useQueries";
import { REFERRAL_LEVELS, paiseToRupees } from "../utils/format";

interface ReferralPageProps {
  user: User;
}

interface LevelData {
  level: number;
  rateRupees: number;
  membersConfirmed: number;
  totalEarnedPaise: bigint;
}

function parseLevel(description: string): number | null {
  const match = description.match(/level\s+(\d+)/i);
  if (match) {
    const lvl = Number.parseInt(match[1], 10);
    if (lvl >= 1 && lvl <= 15) return lvl;
  }
  return null;
}

export default function ReferralPage({ user }: ReferralPageProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const referralLink = `${window.location.origin}/?ref=${user.referralCode}`;
  const { data: totalEarnings } = useReferralEarnings(user.id);
  const { data: walletDetails, isLoading: isWalletLoading } = useWalletDetails(
    user.id,
  );

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
      `🎬 Join *Tm11PrimeTime* — Premium Video Channel!\n\nPay ₹100 once to access exclusive videos and earn through 15-level referrals.\n\n📌 My Referral Code: *${user.referralCode}*\n🔗 Join here: ${referralLink}`,
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const earningsSummary = Object.entries(REFERRAL_LEVELS).reduce(
    (total, [, amount]) => total + amount,
    0,
  );

  // Build matrix level data from wallet transactions
  const matrixLevels = useMemo<LevelData[]>(() => {
    const transactions = walletDetails?.[1] ?? [];

    // Group transactions by level
    const byLevel: Record<number, { count: number; totalPaise: bigint }> = {};
    for (const tx of transactions) {
      const lvl = parseLevel(tx.description);
      if (lvl !== null) {
        if (!byLevel[lvl]) byLevel[lvl] = { count: 0, totalPaise: BigInt(0) };
        byLevel[lvl].count += 1;
        byLevel[lvl].totalPaise += tx.amount;
      }
    }

    return Array.from({ length: 15 }, (_, i) => {
      const level = i + 1;
      const data = byLevel[level];
      return {
        level,
        rateRupees: REFERRAL_LEVELS[level] ?? 0.25,
        membersConfirmed: data?.count ?? 0,
        totalEarnedPaise: data?.totalPaise ?? BigInt(0),
      };
    });
  }, [walletDetails]);

  const totalMatrixEarnedPaise = useMemo(
    () => matrixLevels.reduce((acc, l) => acc + l.totalEarnedPaise, BigInt(0)),
    [matrixLevels],
  );

  const totalMatrixMembers = useMemo(
    () => matrixLevels.reduce((acc, l) => acc + l.membersConfirmed, 0),
    [matrixLevels],
  );

  // Pyramid visual data (first 6 levels displayed in the matrix structure)
  const pyramidLevels = [1, 2, 3, 4, 5, 6];

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

      {/* ── Matrix Level Income ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card className="bg-card/70 border-border/80 card-glow overflow-hidden">
          <CardHeader>
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <Network className="w-5 h-5 text-primary" />
              Matrix Level Income
            </CardTitle>
            <CardDescription>
              Your downline earnings across all 15 matrix levels — live data
              from confirmed commissions
            </CardDescription>
          </CardHeader>

          {/* Summary chips */}
          <CardContent className="pb-0">
            <div className="flex flex-wrap gap-3 mb-5">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/8 border border-primary/20">
                <Users className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">
                  {totalMatrixMembers} total downline members
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-chart-2/8 border border-chart-2/20">
                <IndianRupee className="w-3.5 h-3.5 text-chart-2" />
                <span className="text-xs font-medium text-chart-2">
                  ₹{paiseToRupees(totalMatrixEarnedPaise)} total matrix earned
                </span>
              </div>
            </div>
          </CardContent>

          {/* Level table */}
          <div className="overflow-x-auto">
            {isWalletLoading ? (
              <div
                className="px-6 pb-6 space-y-2"
                data-ocid="matrix.loading_state"
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows use index
                  <Skeleton key={i} className="h-10 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <Table data-ocid="matrix.table">
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wide pl-6">
                      Level
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                      Rate / Member
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wide text-center">
                      Members
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wide text-right pr-6">
                      Total Earned
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matrixLevels.map((row) => {
                    const hasMembers = row.membersConfirmed > 0;
                    const isTopTier = row.level <= 3;
                    return (
                      <TableRow
                        key={row.level}
                        data-ocid={`matrix.level.row.${row.level}`}
                        className={cn(
                          "border-border/30 transition-colors",
                          hasMembers
                            ? "hover:bg-primary/5"
                            : "hover:bg-accent/20 opacity-60",
                        )}
                      >
                        {/* Level badge */}
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border",
                                hasMembers
                                  ? "bg-primary/10 border-primary/30 text-primary"
                                  : "bg-muted/30 border-border/50 text-muted-foreground",
                              )}
                            >
                              {row.level}
                            </span>
                            <div>
                              <p
                                className={cn(
                                  "text-sm font-medium",
                                  hasMembers
                                    ? "text-foreground"
                                    : "text-muted-foreground",
                                )}
                              >
                                Level {row.level}
                              </p>
                              <p className="text-xs text-muted-foreground/70">
                                {row.level === 1
                                  ? "Direct referrals"
                                  : `${row.level} levels down`}
                              </p>
                            </div>
                            {isTopTier && (
                              <Badge
                                variant="outline"
                                className="text-xs border-primary/20 text-primary hidden sm:inline-flex"
                              >
                                Top Tier
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        {/* Rate per member */}
                        <TableCell>
                          <span
                            className={cn(
                              "font-display font-bold",
                              hasMembers
                                ? "text-primary"
                                : "text-muted-foreground",
                            )}
                          >
                            ₹{row.rateRupees}
                          </span>
                        </TableCell>

                        {/* Members confirmed */}
                        <TableCell className="text-center">
                          {hasMembers ? (
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                              {row.membersConfirmed}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              —
                            </span>
                          )}
                        </TableCell>

                        {/* Total earned */}
                        <TableCell className="text-right pr-6">
                          {hasMembers ? (
                            <span className="font-display font-bold text-primary">
                              ₹{paiseToRupees(row.totalEarnedPaise)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              ₹0.00
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Total matrix earnings footer */}
          {!isWalletLoading && (
            <div
              data-ocid="matrix.total.row"
              className="flex items-center justify-between px-6 py-4 bg-primary/5 border-t border-primary/20"
            >
              <div>
                <p className="font-semibold text-foreground">
                  Total Matrix Earnings
                </p>
                <p className="text-xs text-muted-foreground">
                  {totalMatrixMembers} confirmed members across all levels
                </p>
              </div>
              <span className="font-display font-bold text-2xl text-primary">
                ₹{paiseToRupees(totalMatrixEarnedPaise)}
              </span>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Matrix Structure visual */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-card/70 border-border/80 card-glow overflow-hidden">
          <CardHeader>
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Matrix Structure
            </CardTitle>
            <CardDescription>
              How your 15-level downline pyramid grows — each level multiplies
              your earning potential
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Pyramid visual */}
            <div className="space-y-2 mb-6">
              {pyramidLevels.map((lvl) => {
                const width = Math.round((lvl / 6) * 100);
                const rate = REFERRAL_LEVELS[lvl];
                const levelData = matrixLevels.find((l) => l.level === lvl);
                const hasMembers = (levelData?.membersConfirmed ?? 0) > 0;
                return (
                  <div key={lvl} className="flex items-center gap-3">
                    <span className="w-14 text-right text-xs font-medium text-muted-foreground flex-shrink-0">
                      L{lvl} ₹{rate}
                    </span>
                    <div className="flex-1 relative h-8 flex items-center">
                      <div
                        className={cn(
                          "h-7 rounded-md flex items-center justify-end pr-3 transition-all",
                          hasMembers
                            ? "bg-primary/20 border border-primary/30"
                            : "bg-muted/20 border border-border/30",
                        )}
                        style={{ width: `${width}%` }}
                      >
                        {hasMembers && (
                          <span className="text-xs font-bold text-primary">
                            {levelData?.membersConfirmed}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="w-10 text-xs text-muted-foreground flex-shrink-0">
                      {lvl === 1 ? "direct" : `×${lvl}`}
                    </span>
                  </div>
                );
              })}
              <div className="flex items-center gap-3">
                <span className="w-14 text-right text-xs font-medium text-muted-foreground flex-shrink-0">
                  L7–15 ₹0.25
                </span>
                <div className="flex-1 relative h-8 flex items-center">
                  <div className="h-7 rounded-md bg-muted/10 border border-border/20 w-full" />
                </div>
                <span className="w-10 text-xs text-muted-foreground flex-shrink-0">
                  deep
                </span>
              </div>
            </div>

            {/* Rate legend */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(REFERRAL_LEVELS).map(([levelStr, amount]) => {
                const level = Number.parseInt(levelStr, 10);
                // Only show levels 1-6 individually; group 7-15
                if (level > 6) return null;
                return (
                  <div
                    key={level}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-accent/40 border border-border/40"
                  >
                    <span className="text-xs text-muted-foreground">
                      Level {level}
                    </span>
                    <span className="text-xs font-bold text-primary">
                      ₹{amount}
                    </span>
                  </div>
                );
              })}
              {/* Grouped L7-15 */}
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-accent/40 border border-border/40">
                <span className="text-xs text-muted-foreground">
                  Level 7–15
                </span>
                <span className="text-xs font-bold text-muted-foreground">
                  ₹0.25 each
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* How it works */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
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
