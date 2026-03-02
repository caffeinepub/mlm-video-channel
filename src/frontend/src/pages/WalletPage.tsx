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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  IndianRupee,
  Loader2,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { User } from "../backend.d";
import { useRequestWithdrawal, useWalletDetails } from "../hooks/useQueries";
import { formatDateTime, paiseToRupees } from "../utils/format";

interface WalletPageProps {
  user: User;
}

const _MIN_WITHDRAWAL_PAISE = BigInt(50000); // Rs.500

const SAMPLE_TRANSACTIONS = [
  {
    id: BigInt(1),
    userId: BigInt(1),
    amount: BigInt(1000),
    description: "Referral commission - Level 1 (Aarav Sharma joined)",
    timestamp: BigInt(1738108800000000000),
  },
  {
    id: BigInt(2),
    userId: BigInt(1),
    amount: BigInt(500),
    description: "Referral commission - Level 2 (Priya Patel joined)",
    timestamp: BigInt(1737849600000000000),
  },
  {
    id: BigInt(3),
    userId: BigInt(1),
    amount: BigInt(300),
    description: "Referral commission - Level 3 (Rohit Verma joined)",
    timestamp: BigInt(1737244800000000000),
  },
  {
    id: BigInt(4),
    userId: BigInt(1),
    amount: BigInt(1000),
    description: "Referral commission - Level 1 (Meera Singh joined)",
    timestamp: BigInt(1736380800000000000),
  },
  {
    id: BigInt(5),
    userId: BigInt(1),
    amount: BigInt(200),
    description: "Referral commission - Level 4 (Aditya Kumar joined)",
    timestamp: BigInt(1735689600000000000),
  },
];

export default function WalletPage({ user }: WalletPageProps) {
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawUpi, setWithdrawUpi] = useState(user.upiId || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: walletData, isLoading } = useWalletDetails(user.id);
  const withdrawMutation = useRequestWithdrawal();

  // Use backend data if available, else sample
  const walletBalance = walletData ? walletData[0] : BigInt(3000); // sample: ₹30
  const transactions =
    walletData && walletData[1].length > 0
      ? walletData[1]
      : SAMPLE_TRANSACTIONS;

  const balanceRs = Number(walletBalance) / 100;

  const handleWithdraw = async () => {
    const e: Record<string, string> = {};
    const amountNum = Number.parseFloat(withdrawAmount);
    if (!withdrawAmount || Number.isNaN(amountNum))
      e.amount = "Enter a valid amount";
    else if (amountNum < 500) e.amount = "Minimum withdrawal is ₹500";
    else if (amountNum > balanceRs)
      e.amount = "Amount exceeds your wallet balance";
    if (!withdrawUpi.trim()) e.upi = "UPI ID is required";
    else if (!withdrawUpi.includes("@")) e.upi = "Enter a valid UPI ID";

    setErrors(e);
    if (Object.keys(e).length > 0) return;

    try {
      const amountPaise = BigInt(Math.round(amountNum * 100));
      await withdrawMutation.mutateAsync({
        userId: user.id,
        amount: amountPaise,
      });
      toast.success(
        "Withdrawal request submitted! Admin will process it soon.",
      );
      setWithdrawAmount("");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Withdrawal request failed";
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold mb-1">My Wallet</h1>
        <p className="text-muted-foreground">
          Track your earnings and request withdrawals
        </p>
      </div>

      {/* Balance card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-primary/20 card-glow overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5" />
                  Available Balance
                </p>
                {isLoading ? (
                  <Skeleton className="h-10 w-32" />
                ) : (
                  <p
                    className="font-display text-4xl font-bold text-primary"
                    data-ocid="wallet.balance.card"
                  >
                    ₹{paiseToRupees(walletBalance)}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Min. withdrawal: ₹500
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <IndianRupee className="w-6 h-6 text-primary" />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <TrendingUp className="w-3.5 h-3.5 text-success" />
                <span>Referral earnings accumulate automatically</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Transaction History */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3"
        >
          <Card className="bg-card/70 border-border/80 card-glow h-full">
            <CardHeader>
              <CardTitle className="font-display text-xl">
                Transaction History
              </CardTitle>
              <CardDescription>
                Your recent referral earnings and withdrawals
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div
                  className="p-5 space-y-3"
                  data-ocid="wallet.transactions.loading_state"
                >
                  {Array.from({ length: 4 }).map((_, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items are stable
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : transactions.length === 0 ? (
                <div
                  className="py-16 text-center"
                  data-ocid="wallet.transactions.empty_state"
                >
                  <Wallet className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">
                    No transactions yet
                  </p>
                  <p className="text-muted-foreground/60 text-xs mt-1">
                    Referral earnings will appear here
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[380px]">
                  <div className="divide-y divide-border">
                    {transactions.map((tx, idx) => {
                      const isCredit = tx.amount > 0;
                      return (
                        <div
                          key={tx.id.toString()}
                          data-ocid={`wallet.transaction.item.${idx + 1}`}
                          className="flex items-center gap-3 px-5 py-4 hover:bg-accent/30 transition-colors"
                        >
                          <div
                            className={cn(
                              "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                              isCredit
                                ? "bg-success/10 border border-success/20"
                                : "bg-destructive/10 border border-destructive/20",
                            )}
                          >
                            {isCredit ? (
                              <ArrowDownLeft className="w-4 h-4 text-success" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4 text-destructive" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-1">
                              {tx.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDateTime(tx.timestamp)}
                            </p>
                          </div>
                          <span
                            className={cn(
                              "font-display font-bold text-sm whitespace-nowrap",
                              isCredit ? "text-success" : "text-destructive",
                            )}
                          >
                            {isCredit ? "+" : ""}₹{paiseToRupees(tx.amount)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Withdrawal Form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-2"
        >
          <Card className="bg-card/70 border-border/80 card-glow">
            <CardHeader>
              <CardTitle className="font-display text-xl flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-primary" />
                Request Withdrawal
              </CardTitle>
              <CardDescription>Minimum withdrawal amount: ₹500</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Amount input */}
              <div className="space-y-1.5">
                <Label htmlFor="withdraw-amount" className="text-sm">
                  Amount (₹)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    ₹
                  </span>
                  <Input
                    id="withdraw-amount"
                    type="number"
                    placeholder="500.00"
                    min={500}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    data-ocid="wallet.withdraw_amount.input"
                    className={cn(
                      "pl-7",
                      errors.amount && "border-destructive",
                    )}
                  />
                </div>
                {errors.amount && (
                  <p
                    className="text-xs text-destructive flex items-center gap-1"
                    data-ocid="wallet.amount_error"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {errors.amount}
                  </p>
                )}
              </div>

              {/* UPI input */}
              <div className="space-y-1.5">
                <Label htmlFor="withdraw-upi" className="text-sm">
                  UPI ID
                </Label>
                <Input
                  id="withdraw-upi"
                  placeholder="yourname@paytm"
                  value={withdrawUpi}
                  onChange={(e) => setWithdrawUpi(e.target.value)}
                  data-ocid="wallet.withdraw_upi.input"
                  className={cn(errors.upi && "border-destructive")}
                />
                {errors.upi && (
                  <p
                    className="text-xs text-destructive flex items-center gap-1"
                    data-ocid="wallet.upi_error"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {errors.upi}
                  </p>
                )}
              </div>

              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2 shadow-gold"
                onClick={handleWithdraw}
                disabled={withdrawMutation.isPending}
                data-ocid="wallet.withdraw.submit_button"
              >
                {withdrawMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowUpRight className="w-4 h-4" />
                )}
                {withdrawMutation.isPending
                  ? "Submitting..."
                  : "Request Withdrawal"}
              </Button>

              {/* Info box */}
              <div className="rounded-xl bg-accent/50 border border-border p-4 space-y-2">
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span>
                    Withdrawals are processed within 24-48 hours after admin
                    approval
                  </span>
                </div>
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-success" />
                  <span>Funds are sent directly to your UPI ID</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
