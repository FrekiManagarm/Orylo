"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { DetectionFeedCard, type DetectionFeedItem } from "./detection-feed-card";
import { DetectionDetailsDialog } from "@/components/dashboard/components/detection-details-dialog";
import { useSSE } from "@/hooks/use-sse";
import { motion, AnimatePresence } from "framer-motion";

/**
 * DetectionFeedSection - PRD Story 2.1, 2.3, 2.4, 2.10
 * Feed of detection cards in dashboard-home style
 */
type DetectionsResponse = {
  data: DetectionFeedItem[];
  total: number;
  offset: number;
  limit: number;
};

const CARD_STYLE = "border border-white/10 bg-zinc-900/50 backdrop-blur-xl";

function SkeletonCard({ variant = "card" }: { variant?: "card" | "list" }) {
  if (variant === "list") {
    return (
      <div className="w-full border-b border-white/5 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2 flex-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-32 bg-zinc-800" />
              <Skeleton className="h-5 w-16 rounded-full bg-zinc-800" />
            </div>
            <Skeleton className="h-3 w-24 bg-zinc-800" />
          </div>
          <div className="flex flex-col items-end gap-2">
            <Skeleton className="h-4 w-20 bg-zinc-800" />
            <Skeleton className="h-3 w-12 bg-zinc-800" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl p-6 space-y-4 ${CARD_STYLE}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-48 bg-zinc-800" />
          <Skeleton className="h-3 w-32 bg-zinc-800" />
        </div>
        <Skeleton className="h-6 w-16 bg-zinc-800" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-24 bg-zinc-800" />
        <Skeleton className="h-9 w-20 bg-zinc-800" />
      </div>
    </div>
  );
}

export function DetectionFeedSection({ variant = "card" }: { variant?: "card" | "list" }) {
  const searchParams = useSearchParams();
  const [detections, setDetections] = useState<DetectionFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const observerTarget = useRef<HTMLDivElement>(null);
  const [selectedDetectionId, setSelectedDetectionId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDetectionIds, setNewDetectionIds] = useState<Set<string>>(new Set());
  const [hasStripeConnection, setHasStripeConnection] = useState<boolean | null>(null);

  const LIMIT = 20;
  const decision = searchParams.get("decision");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  useEffect(() => {
    fetch("/api/stripe/connections")
      .then((res) => (res.ok ? res.json() : []))
      .then((connections: { isActive?: boolean }[]) => {
        setHasStripeConnection(Array.isArray(connections) && connections.some((c) => c.isActive));
      })
      .catch(() => setHasStripeConnection(false));
  }, []);

  const fetchDetections = useCallback(
    async (currentOffset: number, append = false) => {
      try {
        const params = new URLSearchParams({
          limit: LIMIT.toString(),
          offset: currentOffset.toString(),
        });
        if (decision && decision !== "ALL") params.append("decision", decision);
        if (dateFrom) params.append("dateFrom", dateFrom);
        if (dateTo) params.append("dateTo", dateTo);

        const response = await fetch(`/api/detections?${params.toString()}`);
        if (!response.ok) throw new Error("Failed to fetch detections");

        const data: DetectionsResponse = await response.json();

        if (append) {
          setDetections((prev) => [...prev, ...data.data]);
        } else {
          setDetections(data.data);
        }
        setHasMore(data.data.length === LIMIT);
        setOffset(currentOffset + data.data.length);
      } catch (error) {
        console.error("Error fetching detections:", error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [decision, dateFrom, dateTo]
  );

  useEffect(() => {
    setOffset(0);
    fetchDetections(0);
  }, [decision, dateFrom, dateTo, fetchDetections]);

  useSSE({
    onDetectionCreated: useCallback((detection: DetectionFeedItem) => {
      setDetections((prev) => {
        if (prev.some((d) => d.id === detection.id)) return prev;
        return [detection, ...prev];
      });
      setNewDetectionIds((prev) => new Set(prev).add(detection.id));
      setTimeout(() => {
        setNewDetectionIds((prev) => {
          const next = new Set(prev);
          next.delete(detection.id);
          return next;
        });
      }, 2000);
    }, []),
    onDetectionUpdated: useCallback((detection: DetectionFeedItem) => {
      setDetections((prev) =>
        prev.map((d) => (d.id === detection.id ? detection : d))
      );
    }, []),
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && hasMore && !isLoading) {
          setIsLoadingMore(true);
          fetchDetections(offset, true);
        }
      },
      { threshold: 0.1 }
    );
    const target = observerTarget.current;
    if (target) observer.observe(target);
    return () => { if (target) observer.unobserve(target); };
  }, [offset, isLoadingMore, hasMore, isLoading, fetchDetections]);

  const handleCardClick = (detectionId: string) => {
    setSelectedDetectionId(detectionId);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className={variant === "card" ? "flex flex-col gap-4" : "flex flex-col"}>
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} variant={variant} />
        ))}
      </div>
    );
  }

  if (detections.length === 0) {
    return (
      <div
        className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 p-12 text-center ${CARD_STYLE}`}
      >
        <div className="flex flex-col gap-4 max-w-md">
          <h3 className="text-lg font-semibold text-white">No detections yet</h3>
          {hasStripeConnection === null ? (
            <p className="text-sm text-zinc-500 font-mono">Checking connection…</p>
          ) : hasStripeConnection ? (
            <>
              <p className="text-sm text-zinc-400">
                Your Stripe account is connected. Detections will appear here when payments are processed.
              </p>
              <p className="text-xs text-zinc-500 font-mono">
                Use <strong className="text-zinc-400">Quick Actions → Simulate Payment</strong> to test the flow.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-zinc-400">
                Connect your Stripe account to start monitoring fraud detections in real-time.
              </p>
              <Button asChild className="mt-2 border border-white/10 bg-zinc-900/50 text-zinc-300 hover:bg-white/5 hover:text-white font-mono text-xs uppercase tracking-wider">
                <Link href="/dashboard/connections">Connecter</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={variant === "card" ? "flex flex-col gap-4" : "flex flex-col"}>
        <AnimatePresence initial={false}>
          {detections.map((detection) => {
            const isNew = newDetectionIds.has(detection.id);
            return (
              <motion.div
                key={detection.id}
                initial={isNew ? { opacity: 0, y: -20 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <DetectionFeedCard
                  detection={detection}
                  onClick={() => handleCardClick(detection.id)}
                  variant={variant}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>

        {hasMore && (
          <div ref={observerTarget} className="flex justify-center py-4 w-full">
            {isLoadingMore && <SkeletonCard variant={variant} />}
          </div>
        )}

        {!hasMore && detections.length > 0 && (
          <p className="text-center text-sm text-zinc-500 font-mono py-4">
            No more detections
          </p>
        )}
      </div>

      <DetectionDetailsDialog
        detectionId={selectedDetectionId}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        contentClassName="border border-white/10 bg-zinc-900/95 backdrop-blur-xl shadow-2xl"
      />
    </>
  );
}
