import { useEffect, useRef, useState } from "react";

/**
 * Detection type for SSE events
 */
export type SSEDetection = {
  id: string;
  paymentIntentId: string;
  customerEmail: string | null;
  amount: number;
  currency: string;
  decision: "ALLOW" | "REVIEW" | "BLOCK";
  score: number;
  createdAt: string;
};

/**
 * useSSE Hook
 * 
 * Story 2.10 - AC5: EventSource connection with auto-reconnect
 * 
 * Features:
 * - Establishes SSE connection to /api/events
 * - Auto-reconnect on disconnect (EventSource built-in)
 * - Listens for detection.created and detection.updated events
 * - Cleans up connection on unmount
 * 
 * @param onDetectionCreated - Callback when new detection is created
 * @param onDetectionUpdated - Callback when detection is updated
 */
export function useSSE({
  onDetectionCreated,
  onDetectionUpdated,
}: {
  onDetectionCreated?: (detection: SSEDetection) => void;
  onDetectionUpdated?: (detection: SSEDetection) => void;
}) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // AC5: Create EventSource connection
    const eventSource = new EventSource("/api/events");
    eventSourceRef.current = eventSource;

    // Connection opened
    eventSource.addEventListener("connected", (event) => {
      setIsConnected(true);
      setError(null);
      console.log("[SSE] Connected:", event.data);
    });

    // AC2: Listen for detection.created events
    eventSource.addEventListener("detection.created", (event) => {
      try {
        const detection = JSON.parse(event.data);
        console.log("[SSE] Detection created:", detection);
        onDetectionCreated?.(detection);
      } catch (err) {
        console.error("[SSE] Error parsing detection.created:", err);
      }
    });

    // AC2: Listen for detection.updated events
    eventSource.addEventListener("detection.updated", (event) => {
      try {
        const detection = JSON.parse(event.data);
        console.log("[SSE] Detection updated:", detection);
        onDetectionUpdated?.(detection);
      } catch (err) {
        console.error("[SSE] Error parsing detection.updated:", err);
      }
    });

    // Handle errors (EventSource auto-reconnects)
    eventSource.onerror = (err) => {
      console.error("[SSE] Connection error:", err);
      setIsConnected(false);
      setError(err as Error);
      
      // EventSource automatically attempts to reconnect
      // No manual reconnection logic needed (AC5)
    };

    // Cleanup on unmount
    return () => {
      console.log("[SSE] Closing connection");
      eventSource.close();
      setIsConnected(false);
    };
  }, [onDetectionCreated, onDetectionUpdated]);

  return {
    isConnected,
    error,
    close: () => eventSourceRef.current?.close(),
  };
}
