import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  User,
  UserProfile,
  Video,
  WalletTransaction,
  WithdrawalRequest,
} from "../backend.d";
import { UserRole } from "../backend.d";
import { useActor } from "./useActor";

// ─── Auth / Profile ──────────────────────────────────────────────────────

export function useCallerRole() {
  const { actor, isFetching } = useActor();
  return useQuery<UserRole>({
    queryKey: ["callerRole"],
    queryFn: async () => {
      if (!actor) return UserRole.guest;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
  });
}

export function useCallerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getCallerUserProfile();
      } catch {
        // Admin-only identities may not have a user profile - return null gracefully
        return null;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
  });
}

// ─── User ────────────────────────────────────────────────────────────────

export function useUserById(userId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<User | null>({
    queryKey: ["user", userId?.toString()],
    queryFn: async () => {
      if (!actor || userId == null) return null;
      return actor.getUserById(userId);
    },
    enabled: !!actor && !isFetching && userId != null,
    staleTime: 15_000,
  });
}

export function useAllUsers() {
  const { actor, isFetching } = useActor();
  return useQuery<User[]>({
    queryKey: ["allUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRegisterUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<
    string,
    Error,
    { name: string; mobile: string; upiId: string; referralCode: string | null }
  >({
    mutationFn: async ({ name, mobile, upiId, referralCode }) => {
      if (!actor) throw new Error("Not connected");
      return actor.registerUser(name, mobile, upiId, referralCode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
    },
  });
}

export function useConfirmPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, bigint>({
    mutationFn: async (userId) => {
      if (!actor) throw new Error("Not connected");
      return actor.confirmPayment(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
}

// ─── Videos ──────────────────────────────────────────────────────────────

export function useAllVideos() {
  const { actor, isFetching } = useActor();
  return useQuery<Video[]>({
    queryKey: ["allVideos"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllVideos();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useVideosByCategory(category: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Video[]>({
    queryKey: ["videosByCategory", category],
    queryFn: async () => {
      if (!actor) return [];
      if (category === "all") return actor.getAllVideos();
      return actor.getVideosByCategory(category);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUploadVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<
    bigint,
    Error,
    {
      title: string;
      description: string;
      category: string;
      videoUrl: string;
      thumbnailUrl: string;
    }
  >({
    mutationFn: async ({
      title,
      description,
      category,
      videoUrl,
      thumbnailUrl,
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.uploadVideo(
        title,
        description,
        category,
        videoUrl,
        thumbnailUrl,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allVideos"] });
    },
  });
}

export function useEditVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<
    void,
    Error,
    {
      videoId: bigint;
      title: string;
      description: string;
      category: string;
      videoUrl: string;
      thumbnailUrl: string;
    }
  >({
    mutationFn: async ({
      videoId,
      title,
      description,
      category,
      videoUrl,
      thumbnailUrl,
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.editVideo(
        videoId,
        title,
        description,
        category,
        videoUrl,
        thumbnailUrl,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allVideos"] });
    },
  });
}

export function useDeleteVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, bigint>({
    mutationFn: async (videoId) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteVideo(videoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allVideos"] });
    },
  });
}

// ─── Wallet ───────────────────────────────────────────────────────────────

export function useWalletDetails(userId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<[bigint, WalletTransaction[]]>({
    queryKey: ["wallet", userId?.toString()],
    queryFn: async () => {
      if (!actor || userId == null) return [BigInt(0), []];
      return actor.getConfirmedUserWalletDetails(userId);
    },
    enabled: !!actor && !isFetching && userId != null,
    staleTime: 15_000,
  });
}

export function useReferralEarnings(userId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<bigint | null>({
    queryKey: ["referralEarnings", userId?.toString()],
    queryFn: async () => {
      if (!actor || userId == null) return null;
      return actor.getReceivedReferralEarnings(userId);
    },
    enabled: !!actor && !isFetching && userId != null,
    staleTime: 15_000,
  });
}

export function useRequestWithdrawal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<bigint, Error, { userId: bigint; amount: bigint }>({
    mutationFn: async ({ userId, amount }) => {
      if (!actor) throw new Error("Not connected");
      return actor.requestWithdrawal(userId, amount);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["wallet", variables.userId.toString()],
      });
    },
  });
}

// ─── Admin Withdrawals ───────────────────────────────────────────────────

export function usePendingWithdrawals() {
  const { actor, isFetching } = useActor();
  return useQuery<WithdrawalRequest[]>({
    queryKey: ["pendingWithdrawals"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPendingWithdrawalRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProcessedWithdrawals() {
  const { actor, isFetching } = useActor();
  return useQuery<WithdrawalRequest[]>({
    queryKey: ["processedWithdrawals"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProcessedWithdrawalRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProcessWithdrawal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { requestId: bigint; approve: boolean }>({
    mutationFn: async ({ requestId, approve }) => {
      if (!actor) throw new Error("Not connected");
      return actor.processWithdrawalRequest(requestId, approve);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingWithdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["processedWithdrawals"] });
    },
  });
}

// ─── Assign Role ─────────────────────────────────────────────────────────

export function useAssignRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { user: Principal; role: UserRole }>({
    mutationFn: async ({ user, role }) => {
      if (!actor) throw new Error("Not connected");
      return actor.assignCallerUserRole(user, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerRole"] });
      queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
    },
  });
}

// ─── Save Profile ─────────────────────────────────────────────────────────

export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, UserProfile>({
    mutationFn: async (profile) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
    },
  });
}

// ─── Remove User ──────────────────────────────────────────────────────────

export function useRemoveUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, bigint>({
    mutationFn: async (userId) => {
      if (!actor) throw new Error("Not connected");
      return actor.removeUser(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
}

// ─── Submit UTR ───────────────────────────────────────────────────────────

export function useSubmitUTR() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<
    void,
    Error,
    { utrId: string; name: string; mobile: string }
  >({
    mutationFn: async ({ utrId, name, mobile }) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitUTR(utrId, name, mobile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
}
