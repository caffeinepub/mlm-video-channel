import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Video {
    id: bigint;
    title: string;
    thumbnailUrl: string;
    description: string;
    category: string;
    videoUrl: string;
    uploadedAt: bigint;
}
export interface WalletTransaction {
    id: bigint;
    userId: bigint;
    description: string;
    timestamp: bigint;
    amount: bigint;
}
export interface WithdrawalRequest {
    id: bigint;
    status: string;
    userId: bigint;
    upiId: string;
    amount: bigint;
    requestedAt: bigint;
    resolvedAt?: bigint;
}
export interface UserProfile {
    userId: bigint;
    name: string;
}
export interface User {
    id: bigint;
    referralCode: string;
    name: string;
    createdAt: bigint;
    ancestors: Array<bigint>;
    upiId: string;
    utrId?: string;
    mobile: string;
    registrationStatus: string;
    referredByCode?: string;
    walletBalance: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    confirmPayment(userId: bigint): Promise<void>;
    deleteVideo(videoId: bigint): Promise<void>;
    editVideo(videoId: bigint, title: string, description: string, category: string, videoUrl: string, thumbnailUrl: string): Promise<void>;
    getAllUsers(): Promise<Array<User>>;
    getAllVideos(): Promise<Array<Video>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getConfirmedUserWalletDetails(userId: bigint): Promise<[bigint, Array<WalletTransaction>]>;
    getPendingWithdrawalRequests(): Promise<Array<WithdrawalRequest>>;
    getProcessedWithdrawalRequests(): Promise<Array<WithdrawalRequest>>;
    getReceivedReferralEarnings(userId: bigint): Promise<bigint | null>;
    getUserById(userId: bigint): Promise<User | null>;
    getUserByReferralCode(referralCode: string): Promise<User | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVideosByCategory(category: string): Promise<Array<Video>>;
    isCallerAdmin(): Promise<boolean>;
    processWithdrawalRequest(requestId: bigint, approve: boolean): Promise<void>;
    registerUser(name: string, mobile: string, upiId: string, referralCode: string | null): Promise<string>;
    requestWithdrawal(userId: bigint, amount: bigint): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitUTR(utrId: string): Promise<void>;
    uploadVideo(title: string, description: string, category: string, videoUrl: string, thumbnailUrl: string): Promise<bigint>;
}
