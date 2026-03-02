import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  Loader2,
  Pencil,
  Plus,
  Search,
  Shield,
  Trash2,
  TrendingUp,
  Users,
  Video as VideoIcon,
  Wallet,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { User, Video, WithdrawalRequest } from "../backend.d";
import {
  useAllUsers,
  useAllVideos,
  useConfirmPayment,
  useDeleteVideo,
  useEditVideo,
  usePendingWithdrawals,
  useProcessWithdrawal,
  useProcessedWithdrawals,
  useUploadVideo,
} from "../hooks/useQueries";
import { formatDate, formatDateTime, paiseToRupees } from "../utils/format";

// ─── Users Tab ────────────────────────────────────────────────────────────

function UsersTab() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "confirmed"
  >("all");
  const { data: users = [], isLoading } = useAllUsers();
  const confirmMutation = useConfirmPayment();

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.mobile.includes(search) ||
      u.referralCode.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" || u.registrationStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleConfirm = async (userId: bigint, name: string) => {
    try {
      await confirmMutation.mutateAsync(userId);
      toast.success(`Payment confirmed for ${name}`);
    } catch {
      toast.error("Failed to confirm payment");
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, mobile, referral code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-ocid="admin.users.search_input"
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "pending", "confirmed"] as const).map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => setStatusFilter(s)}
              data-ocid={`admin.users.filter_${s}.tab`}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all border",
                statusFilter === s
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-secondary text-muted-foreground border-transparent hover:border-border",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-card/70 border border-border text-center">
          <p className="font-display text-xl font-bold">{users.length}</p>
          <p className="text-xs text-muted-foreground">Total Users</p>
        </div>
        <div className="p-3 rounded-xl bg-warning/5 border border-warning/20 text-center">
          <p className="font-display text-xl font-bold text-warning">
            {users.filter((u) => u.registrationStatus === "pending").length}
          </p>
          <p className="text-xs text-muted-foreground">Pending</p>
        </div>
        <div className="p-3 rounded-xl bg-success/5 border border-success/20 text-center">
          <p className="font-display text-xl font-bold text-success">
            {users.filter((u) => u.registrationStatus === "confirmed").length}
          </p>
          <p className="text-xs text-muted-foreground">Confirmed</p>
        </div>
      </div>

      {/* Table */}
      <Card className="bg-card/70 border-border/80 overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3" data-ocid="admin.users.loading_state">
            {Array.from({ length: 4 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items are stable
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="py-16 text-center"
            data-ocid="admin.users.empty_state"
          >
            <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">
                    #
                  </th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">
                    Name
                  </th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden md:table-cell">
                    Mobile
                  </th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden md:table-cell">
                    UTR / Txn ID
                  </th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden lg:table-cell">
                    UPI ID
                  </th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden sm:table-cell">
                    Ref Code
                  </th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden md:table-cell">
                    Balance
                  </th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden lg:table-cell">
                    Joined
                  </th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((u, idx) => (
                  <tr
                    key={u.id.toString()}
                    data-ocid={`admin.users.item.${idx + 1}`}
                    className="hover:bg-accent/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-muted-foreground">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell font-mono-custom text-xs">
                      {u.mobile}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {u.utrId ? (
                        <span className="font-mono-custom text-xs bg-primary/5 text-primary px-2 py-0.5 rounded border border-primary/10">
                          {u.utrId}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell font-mono-custom text-xs">
                      {u.upiId}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <code className="font-mono-custom text-xs bg-primary/5 text-primary px-2 py-0.5 rounded">
                        {u.referralCode}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "text-xs px-2.5 py-1 rounded-full font-medium",
                          u.registrationStatus === "confirmed"
                            ? "status-confirmed"
                            : "status-pending",
                        )}
                      >
                        {u.registrationStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      ₹{paiseToRupees(u.walletBalance)}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {u.registrationStatus === "pending" && (
                        <Button
                          size="sm"
                          className="bg-success/10 text-success hover:bg-success/20 border border-success/30 gap-1 text-xs"
                          onClick={() => handleConfirm(u.id, u.name)}
                          disabled={confirmMutation.isPending}
                          data-ocid={`admin.users.confirm.button.${idx + 1}`}
                        >
                          {confirmMutation.isPending ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3" />
                          )}
                          Confirm
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── Videos Tab ───────────────────────────────────────────────────────────

interface VideoFormData {
  title: string;
  description: string;
  category: string;
  videoUrl: string;
  thumbnailUrl: string;
}

const emptyVideoForm: VideoFormData = {
  title: "",
  description: "",
  category: "tutorial",
  videoUrl: "",
  thumbnailUrl: "",
};

function VideosTab() {
  const { data: videos = [], isLoading } = useAllVideos();
  const uploadMutation = useUploadVideo();
  const editMutation = useEditVideo();
  const deleteMutation = useDeleteVideo();

  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Video | null>(null);
  const [form, setForm] = useState<VideoFormData>(emptyVideoForm);
  const [formErrors, setFormErrors] = useState<Partial<VideoFormData>>({});

  const openAdd = () => {
    setEditingVideo(null);
    setForm(emptyVideoForm);
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (v: Video) => {
    setEditingVideo(v);
    setForm({
      title: v.title,
      description: v.description,
      category: v.category,
      videoUrl: v.videoUrl,
      thumbnailUrl: v.thumbnailUrl,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const validate = (): boolean => {
    const e: Partial<VideoFormData> = {};
    if (!form.title.trim()) e.title = "Required";
    if (!form.description.trim()) e.description = "Required";
    if (!form.videoUrl.trim()) e.videoUrl = "Required";
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      if (editingVideo) {
        await editMutation.mutateAsync({ videoId: editingVideo.id, ...form });
        toast.success("Video updated");
      } else {
        await uploadMutation.mutateAsync(form);
        toast.success("Video uploaded");
      }
      setShowModal(false);
    } catch {
      toast.error("Operation failed");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Video deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {videos.length} videos in library
          </p>
        </div>
        <Button
          onClick={openAdd}
          data-ocid="admin.videos.upload.button"
          className="bg-primary text-primary-foreground gap-2 shadow-gold"
        >
          <Plus className="w-4 h-4" />
          Upload Video
        </Button>
      </div>

      {isLoading ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          data-ocid="admin.videos.loading_state"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items are stable
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="py-20 text-center" data-ocid="admin.videos.empty_state">
          <VideoIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">
            No videos yet. Upload the first one!
          </p>
          <Button
            className="mt-4 gap-2"
            onClick={openAdd}
            data-ocid="admin.videos.first_upload.button"
          >
            <Plus className="w-4 h-4" />
            Upload Video
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((v, idx) => (
            <Card
              key={v.id.toString()}
              data-ocid={`admin.videos.item.${idx + 1}`}
              className="bg-card/70 border-border/80 overflow-hidden group"
            >
              {v.thumbnailUrl && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={v.thumbnailUrl}
                    alt={v.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-sm line-clamp-1">
                      {v.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground capitalize">
                        {v.category}
                      </span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(v.uploadedAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => openEdit(v)}
                      data-ocid={`admin.videos.edit_button.${idx + 1}`}
                      className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(v)}
                      data-ocid={`admin.videos.delete_button.${idx + 1}`}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent
          className="bg-card border-border max-w-lg"
          data-ocid="admin.videos.upload.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingVideo ? "Edit Video" : "Upload Video"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                data-ocid="admin.video.title.input"
                placeholder="Video title"
                className={cn(formErrors.title && "border-destructive")}
              />
              {formErrors.title && (
                <p className="text-xs text-destructive">{formErrors.title}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                data-ocid="admin.video.description.textarea"
                placeholder="Video description"
                rows={3}
                className={cn(formErrors.description && "border-destructive")}
              />
              {formErrors.description && (
                <p className="text-xs text-destructive">
                  {formErrors.description}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
              >
                <SelectTrigger data-ocid="admin.video.category.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tutorial">Tutorial</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="course">Course</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Video URL</Label>
              <Input
                value={form.videoUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, videoUrl: e.target.value }))
                }
                data-ocid="admin.video.url.input"
                placeholder="https://www.youtube.com/embed/..."
                className={cn(formErrors.videoUrl && "border-destructive")}
              />
              {formErrors.videoUrl && (
                <p className="text-xs text-destructive">
                  {formErrors.videoUrl}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>
                Thumbnail URL{" "}
                <span className="text-muted-foreground text-xs">
                  (optional)
                </span>
              </Label>
              <Input
                value={form.thumbnailUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, thumbnailUrl: e.target.value }))
                }
                data-ocid="admin.video.thumbnail.input"
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              data-ocid="admin.video.cancel.button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={uploadMutation.isPending || editMutation.isPending}
              data-ocid="admin.video.save.submit_button"
              className="bg-primary text-primary-foreground gap-2"
            >
              {uploadMutation.isPending || editMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              {editingVideo ? "Save Changes" : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent
          className="bg-card border-border"
          data-ocid="admin.video.delete.dialog"
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.title}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="admin.video.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              data-ocid="admin.video.delete.confirm_button"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Withdrawals Tab ──────────────────────────────────────────────────────

function WithdrawalsTab() {
  const { data: pending = [], isLoading: pendingLoading } =
    usePendingWithdrawals();
  const { data: processed = [], isLoading: processedLoading } =
    useProcessedWithdrawals();
  const processMutation = useProcessWithdrawal();
  const [processingId, setProcessingId] = useState<bigint | null>(null);

  const handleProcess = async (requestId: bigint, approve: boolean) => {
    setProcessingId(requestId);
    try {
      await processMutation.mutateAsync({ requestId, approve });
      toast.success(approve ? "Withdrawal approved!" : "Withdrawal rejected");
    } catch {
      toast.error("Operation failed");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Pending */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-warning" />
          <h3 className="font-display font-semibold">Pending Requests</h3>
          {pending.length > 0 && (
            <span className="text-xs bg-warning/10 text-warning border border-warning/20 px-2 py-0.5 rounded-full">
              {pending.length}
            </span>
          )}
        </div>
        <Card className="bg-card/70 border-border/80">
          {pendingLoading ? (
            <div
              className="p-4 space-y-3"
              data-ocid="admin.withdrawals.loading_state"
            >
              {Array.from({ length: 3 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items are stable
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : pending.length === 0 ? (
            <div
              className="py-12 text-center"
              data-ocid="admin.withdrawals.pending.empty_state"
            >
              <CheckCircle2 className="w-8 h-8 text-success/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No pending withdrawal requests
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {pending.map((req, idx) => (
                <div
                  key={req.id.toString()}
                  data-ocid={`admin.withdrawals.pending.item.${idx + 1}`}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        User #{req.userId.toString()}
                      </span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="font-mono-custom text-xs text-muted-foreground">
                        {req.upiId}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(req.requestedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display font-bold text-lg text-primary">
                      ₹{paiseToRupees(req.amount)}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-success/10 text-success hover:bg-success/20 border border-success/30 gap-1 text-xs"
                        onClick={() => handleProcess(req.id, true)}
                        disabled={processingId === req.id}
                        data-ocid={`admin.withdrawals.approve_button.${idx + 1}`}
                      >
                        {processingId === req.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3 h-3" />
                        )}
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-destructive/30 text-destructive hover:bg-destructive/10 gap-1 text-xs"
                        onClick={() => handleProcess(req.id, false)}
                        disabled={processingId === req.id}
                        data-ocid={`admin.withdrawals.reject_button.${idx + 1}`}
                      >
                        <XCircle className="w-3 h-3" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Processed */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-display font-semibold">Processed Requests</h3>
        </div>
        <Card className="bg-card/70 border-border/80">
          {processedLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items are stable
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : processed.length === 0 ? (
            <div
              className="py-10 text-center"
              data-ocid="admin.withdrawals.processed.empty_state"
            >
              <p className="text-sm text-muted-foreground">
                No processed requests yet
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {processed.map((req, idx) => (
                <div
                  key={req.id.toString()}
                  data-ocid={`admin.withdrawals.processed.item.${idx + 1}`}
                  className="flex items-center justify-between gap-4 px-5 py-3.5"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium">
                        User #{req.userId.toString()}
                      </span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="font-mono-custom text-xs text-muted-foreground">
                        {req.upiId}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(req.requestedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display font-bold">
                      ₹{paiseToRupees(req.amount)}
                    </span>
                    <span
                      className={cn(
                        "text-xs px-2.5 py-1 rounded-full font-medium",
                        req.status === "approved"
                          ? "status-confirmed"
                          : "status-rejected",
                      )}
                    >
                      {req.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────

export default function AdminPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground text-sm">
            Manage users, videos, and withdrawals
          </p>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList
          className="bg-card/70 border border-border p-1 h-auto gap-1"
          data-ocid="admin.tabs"
        >
          <TabsTrigger
            value="users"
            data-ocid="admin.users.tab"
            className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary gap-2 px-4 py-2.5"
          >
            <Users className="w-4 h-4" />
            Users
          </TabsTrigger>
          <TabsTrigger
            value="videos"
            data-ocid="admin.videos.tab"
            className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary gap-2 px-4 py-2.5"
          >
            <VideoIcon className="w-4 h-4" />
            Videos
          </TabsTrigger>
          <TabsTrigger
            value="withdrawals"
            data-ocid="admin.withdrawals.tab"
            className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary gap-2 px-4 py-2.5"
          >
            <Wallet className="w-4 h-4" />
            Withdrawals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <UsersTab />
          </motion.div>
        </TabsContent>

        <TabsContent value="videos">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <VideosTab />
          </motion.div>
        </TabsContent>

        <TabsContent value="withdrawals">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <WithdrawalsTab />
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
