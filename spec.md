# Tm11PrimeTime

## Current State
Full-stack MLM video channel app with:
- Motoko backend: user registration (pending/confirmed), 15-level referral earnings, wallet/withdrawal system, video management, admin role via claimFirstAdmin
- React frontend: LandingPage, PendingPage, DashboardPage, ReferralPage, WalletPage, AdminPage, AdminSetupPage
- Authorization component with isCallerAdmin / hasPermission checks
- UPI payment flow with deep links (PhonePe, GPay, Paytm, BHIM) to yespay.bizsbiz12758@yesbankltd
- UTR submission with name + mobile + transaction ID
- Admin: confirm/reject/remove users with payment details modal, video CRUD with YouTube channel URL, withdrawal approve/reject
- Referral: separate referral code + referral link display, WhatsApp share with "Tm11PrimeTime" branding
- Matrix level income table on Referral page showing 15 levels with earnings rates

## Requested Changes (Diff)

### Add
- Nothing new to add

### Modify
- Rebuild entire app from current state (draft expired, needs fresh deployment)
- Ensure all existing features are fully functional:
  - Admin tab visibility after claimFirstAdmin (uses isCallerAdmin only, not getCallerUserRole)
  - Dashboard shown immediately after admin confirms user payment
  - Wallet withdrawal option always visible (min Rs.500)
  - Referral code and referral link shown separately with individual copy/share buttons
  - WhatsApp share message mentions "Tm11PrimeTime"
  - UPI payment buttons use correct UPI ID: yespay.bizsbiz12758@yesbankltd
  - Payment proof form: name (pre-filled), mobile (pre-filled, 10-digit), UTR/transaction ID
  - Admin user list shows: name, mobile, UTR ID, UPI ID, referral code, status, amount, balance, joined date
  - Admin payment detail modal: UTR, name, mobile, UPI ID, amount (Rs.100), status, date, referral code, wallet balance
  - Confirm + Reject + Remove buttons for pending users in admin
  - Video upload form includes YouTube Channel URL field
  - Matrix level income on Referral page (15 levels with rates)
  - Admin setup: 2-step flow (login + claim), no token required

### Remove
- Nothing to remove

## Implementation Plan
1. Write spec.md (this file)
2. Select components (authorization already in caffeine.lock.json)
3. Backend: existing main.mo is correct, no changes needed - regenerate to ensure clean WASM
4. Frontend: rebuild all pages with working admin detection, correct UPI flows, full feature set
