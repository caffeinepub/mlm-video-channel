/** Convert paise (bigint) to rupees string: e.g. 50000 → "500.00" */
export function paiseToRupees(paise: bigint): string {
  const rupees = Number(paise) / 100;
  return rupees.toFixed(2);
}

/** Format bigint timestamp (nanoseconds) to readable date */
export function formatDate(nanoseconds: bigint): string {
  const ms = Number(nanoseconds) / 1_000_000;
  const date = new Date(ms);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Format bigint timestamp to date + time */
export function formatDateTime(nanoseconds: bigint): string {
  const ms = Number(nanoseconds) / 1_000_000;
  const date = new Date(ms);
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Truncate long strings */
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return `${str.slice(0, maxLen - 3)}...`;
}

/** Referral level earnings map */
export const REFERRAL_LEVELS: Record<number, number> = {
  1: 10,
  2: 5,
  3: 3,
  4: 2,
  5: 1,
  6: 0.5,
  7: 0.25,
  8: 0.25,
  9: 0.25,
  10: 0.25,
  11: 0.25,
  12: 0.25,
  13: 0.25,
  14: 0.25,
  15: 0.25,
};

/** UPI Admin ID */
export const ADMIN_UPI_ID = "yespay.bizsbiz12758@yesbankltd";

/** UPI deep links */
export function getUpiDeepLinks(amount = 100): Record<string, string> {
  const base = `pa=${ADMIN_UPI_ID}&pn=BizsBiz&am=${amount}&cu=INR&tn=Registration+Fee`;
  return {
    PhonePe: `phonepe://pay?${base}`,
    GPay: `tez://upi/pay?${base}`,
    Paytm: `paytmmp://pay?${base}`,
    BHIM: `upi://pay?${base}`,
  };
}
