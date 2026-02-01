"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DetectionCard, type Detection } from "@/components/dashboard/components/detection-card";
import { DetectionDetailsDialog } from "@/components/dashboard/components/detection-details-dialog";
import { useSSE } from "@/hooks/use-sse";
import { motion, AnimatePresence } from "framer-motion";

/**
 * API Response type
 */
type DetectionsResponse = {
  data: Detection[];
  total: number;
  offset: number;
  limit: number;
};

/**
 * FeedClient Component - Client Component for Dashboard Feed
 * 
 * Story 2.1:
 * - AC1: Vertical feed layout
 * - AC5: Initial load of 20 detections
 * - AC6: Skeleton loading state
 * - AC7: Empty state
 * - AC8: Infinite scroll pagination
 * 
 * Story 2.3:
 * - AC4: Feed refreshes on filter change
 * - AC6: Read filters from URL query params
 * 
 * Story 2.4:
 * - AC1: Open details dialog on card click
 * 
 * Story 2.10:
 * - AC5: SSE connection for real-time updates
 * - AC6: Prepend new detections with animation
 */
export function FeedClient() {
  const searchParams = useSearchParams();
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Story 2.4: Dialog state
  const [selectedDetectionId, setSelectedDetectionId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Story 2.10: Track new detections for animation
  const [newDetectionIds, setNewDetectionIds] = useState<Set<string>>(new Set());

  const LIMIT = 20;

  // Story 2.3 - AC6: Get filter values from URL
  const decision = searchParams.get("decision");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  // Fetch detections with filters (Story 2.3 - AC4)
  const fetchDetections = useCallback(async (currentOffset: number, append = false) => {
    try {
      // Build URL with filters (Story 2.3 - AC3)
      const params = new URLSearchParams({
        limit: LIMIT.toString(),
        offset: currentOffset.toString(),
      });

      if (decision && decision !== "ALL") {
        params.append("decision", decision);
      }
      if (dateFrom) {
        params.append("dateFrom", dateFrom);
      }
      if (dateTo) {
        params.append("dateTo", dateTo);
      }

      const response = await fetch(`/api/detections?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch detections");
      }

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
  }, [decision, dateFrom, dateTo]);

  // Initial load and reload on filter change (Story 2.3 - AC4)
  useEffect(() => {
    setOffset(0);
    fetchDetections(0);
  }, [decision, dateFrom, dateTo, fetchDetections]);

  // Story 2.10 - AC5, AC6: SSE real-time updates
  useSSE({
    onDetectionCreated: useCallback((detection: Detection) => {
      // AC6: Prepend new detection to feed
      setDetections((prev) => {
        // Avoid duplicates
        if (prev.some((d) => d.id === detection.id)) {
          return prev;
        }
        return [detection, ...prev];
      });

      // Mark as new for animation
      setNewDetectionIds((prev) => new Set(prev).add(detection.id));

      // Remove animation after 2s
      setTimeout(() => {
        setNewDetectionIds((prev) => {
          const next = new Set(prev);
          next.delete(detection.id);
          return next;
        });
      }, 2000);
    }, []),
    onDetectionUpdated: useCallback((detection: Detection) => {
      // Update existing detection
      setDetections((prev) =>
        prev.map((d) => (d.id === detection.id ? detection : d))
      );
    }, []),
  });

  // Infinite scroll with Intersection Observer (AC8)
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

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [offset, isLoadingMore, hasMore, isLoading, fetchDetections]);

  // AC6: Skeleton loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  // AC7: Empty state
  if (detections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <div className="flex flex-col gap-4 max-w-md">
          <h3 className="text-lg font-semibold">No detections yet</h3>
          <p className="text-sm text-muted-foreground">
            Connect your Stripe account to start monitoring fraud detections in real-time.
          </p>
          <Button className="mt-2" variant="outline">
            <Link href="/settings/stripe">Connect Stripe</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Story 2.4 - AC1: Handle card click to open dialog
  const handleCardClick = (detectionId: string) => {
    setSelectedDetectionId(detectionId);
    setIsDialogOpen(true);
  };

  // AC1: Vertical feed layout, cards stack
  return (
    <>
      <div className="flex flex-col gap-4">
        <AnimatePresence initial={false}>
          {detections.map((detection) => {
            // Story 2.10 - AC7: Animation for new detections
            const isNew = newDetectionIds.has(detection.id);

            return (
              <motion.div
                key={detection.id}
                initial={isNew ? { opacity: 0, y: -20 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <DetectionCard
                  detection={detection}
                  onClick={() => handleCardClick(detection.id)}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Infinite scroll trigger */}
        {hasMore && (
          <div ref={observerTarget} className="flex justify-center py-4">
            {isLoadingMore && <SkeletonCard />}
          </div>
        )}

        {!hasMore && detections.length > 0 && (
          <p className="text-center text-sm text-muted-foreground py-4">
            No more detections
          </p>
        )}
      </div>

      {/* Story 2.4: Detection Details Dialog */}
      <DetectionDetailsDialog
        detectionId={selectedDetectionId}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}

/**
 * SkeletonCard Component - Loading placeholder (AC6)
 */
function SkeletonCard() {
  return (
    <div className="rounded-lg border p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  );
}
