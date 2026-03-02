import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  GraduationCap,
  Laugh,
  LayoutGrid,
  Loader2,
  Play,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Video } from "../backend.d";
import { useAllVideos } from "../hooks/useQueries";
import { formatDate } from "../utils/format";

const CATEGORIES = [
  { id: "all", label: "All Videos", icon: LayoutGrid },
  { id: "tutorial", label: "Tutorials", icon: BookOpen },
  { id: "entertainment", label: "Entertainment", icon: Laugh },
  { id: "course", label: "Courses", icon: GraduationCap },
];

const CATEGORY_COLORS: Record<string, string> = {
  tutorial: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  entertainment: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  course: "bg-success/15 text-success border-success/30",
};

const SAMPLE_VIDEOS: Video[] = [
  {
    id: BigInt(1),
    title: "Complete Web Development Bootcamp 2025",
    description:
      "Learn HTML, CSS, JavaScript and React from scratch. Perfect for beginners wanting to build modern web applications.",
    category: "tutorial",
    videoUrl: "https://www.youtube.com/embed/G3e-cpL7ofc",
    thumbnailUrl: "/assets/generated/thumb-tutorial-1.dim_640x360.jpg",
    uploadedAt: BigInt(1735689600000000000),
  },
  {
    id: BigInt(2),
    title: "Social Media Marketing Masterclass",
    description:
      "Grow your business with proven social media strategies. Covers Instagram, YouTube, Facebook & LinkedIn marketing.",
    category: "tutorial",
    videoUrl: "https://www.youtube.com/embed/wVnl3SXJjsM",
    thumbnailUrl: "/assets/generated/thumb-tutorial-2.dim_640x360.jpg",
    uploadedAt: BigInt(1736380800000000000),
  },
  {
    id: BigInt(3),
    title: "Entertainment Zone — Episode 12",
    description:
      "Watch exclusive comedy sketches, performances and behind-the-scenes content from top Indian creators.",
    category: "entertainment",
    videoUrl: "https://www.youtube.com/embed/h4Uu5eyN6VU",
    thumbnailUrl: "/assets/generated/thumb-entertainment-1.dim_640x360.jpg",
    uploadedAt: BigInt(1737072000000000000),
  },
  {
    id: BigInt(4),
    title: "Wellness with Priya — Yoga & Meditation",
    description:
      "Daily yoga routines, breathing exercises and mindfulness practices for a healthier lifestyle.",
    category: "entertainment",
    videoUrl: "https://www.youtube.com/embed/v7AYKMP6rOE",
    thumbnailUrl: "/assets/generated/thumb-entertainment-2.dim_640x360.jpg",
    uploadedAt: BigInt(1737244800000000000),
  },
  {
    id: BigInt(5),
    title: "Stock Market Mastery — Advanced Course",
    description:
      "Comprehensive course on technical analysis, fundamental analysis, options trading and portfolio management.",
    category: "course",
    videoUrl: "https://www.youtube.com/embed/p7HKvqRI_Bo",
    thumbnailUrl: "/assets/generated/thumb-course-1.dim_640x360.jpg",
    uploadedAt: BigInt(1737849600000000000),
  },
  {
    id: BigInt(6),
    title: "Complete GST & Taxation Course 2025",
    description:
      "Master GST filing, income tax returns, TDS, and compliance. Essential for business owners and accountants.",
    category: "course",
    videoUrl: "https://www.youtube.com/embed/PwylEfIHbDU",
    thumbnailUrl: "/assets/generated/thumb-course-2.dim_640x360.jpg",
    uploadedAt: BigInt(1738108800000000000),
  },
];

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]+)/,
  );
  return match ? match[1] : null;
}

function VideoCard({
  video,
  onClick,
  index,
}: { video: Video; onClick: () => void; index: number }) {
  const ytId = getYouTubeId(video.videoUrl);
  const thumbnailSrc =
    video.thumbnailUrl ||
    (ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <Card
        className="bg-card/70 border-border/80 card-glow card-glow-hover cursor-pointer overflow-hidden group"
        onClick={onClick}
        data-ocid={`video.item.${index + 1}`}
      >
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          <img
            src={thumbnailSrc}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "";
              e.currentTarget.style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-14 h-14 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-gold">
              <Play className="w-6 h-6 text-primary-foreground ml-0.5" />
            </div>
          </div>
          <div className="absolute top-3 left-3">
            <span
              className={cn(
                "text-xs font-medium px-2.5 py-1 rounded-full border capitalize",
                CATEGORY_COLORS[video.category] ||
                  "bg-muted text-muted-foreground border-border",
              )}
            >
              {video.category}
            </span>
          </div>
        </div>
        {/* Info */}
        <CardContent className="p-4">
          <h3 className="font-display font-semibold text-sm leading-snug line-clamp-2 mb-1.5 group-hover:text-primary transition-colors">
            {video.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {video.description}
          </p>
          <p className="text-xs text-muted-foreground/60">
            {formatDate(video.uploadedAt)}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function VideoSkeleton() {
  return (
    <Card className="bg-card/70 border-border/80 overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <CardContent className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/3" />
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const { data: backendVideos, isLoading, isError } = useAllVideos();

  // Use backend data if available, else sample data
  const allVideos =
    backendVideos && backendVideos.length > 0 ? backendVideos : SAMPLE_VIDEOS;

  const filteredVideos =
    activeCategory === "all"
      ? allVideos
      : allVideos.filter((v) => v.category === activeCategory);

  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com/embed") || url.includes("youtu.be")) {
      const ytId = getYouTubeId(url);
      return ytId
        ? `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`
        : url;
    }
    return url;
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="font-display text-3xl font-bold mb-1">Video Library</h1>
        <p className="text-muted-foreground">
          Exclusive content for members only
        </p>
      </div>

      {/* Category tabs */}
      <div
        className="flex items-center gap-2 flex-wrap"
        data-ocid="video.filter.tab"
      >
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              type="button"
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              data-ocid={`video.category_${cat.id}.tab`}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border",
                activeCategory === cat.id
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-secondary text-muted-foreground border-transparent hover:border-border hover:text-foreground",
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {cat.label}
              {activeCategory === cat.id && (
                <span className="ml-1 text-xs bg-primary/20 text-primary rounded-full px-1.5 py-0.5">
                  {filteredVideos.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Videos grid */}
      {isLoading ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          data-ocid="video.loading_state"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items are stable
            <VideoSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-20" data-ocid="video.error_state">
          <p className="text-muted-foreground">
            Failed to load videos. Showing demo content.
          </p>
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="text-center py-20" data-ocid="video.empty_state">
          <Play className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">
            No videos in this category yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="wait">
            {filteredVideos.map((video, i) => (
              <VideoCard
                key={video.id.toString()}
                video={video}
                onClick={() => setSelectedVideo(video)}
                index={i}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Video player dialog */}
      <Dialog
        open={!!selectedVideo}
        onOpenChange={(o) => !o && setSelectedVideo(null)}
      >
        <DialogContent
          className="max-w-3xl bg-card border-border p-0 overflow-hidden"
          data-ocid="video.player.dialog"
        >
          {selectedVideo && (
            <>
              <div className="aspect-video w-full bg-black">
                <iframe
                  src={getEmbedUrl(selectedVideo.videoUrl)}
                  title={selectedVideo.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={cn(
                          "text-xs font-medium px-2.5 py-1 rounded-full border capitalize",
                          CATEGORY_COLORS[selectedVideo.category] ||
                            "bg-muted text-muted-foreground border-border",
                        )}
                      >
                        {selectedVideo.category}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(selectedVideo.uploadedAt)}
                      </span>
                    </div>
                    <DialogHeader>
                      <DialogTitle className="font-display text-xl text-left">
                        {selectedVideo.title}
                      </DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground mt-2">
                      {selectedVideo.description}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
