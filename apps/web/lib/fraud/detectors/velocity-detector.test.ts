import { describe, it, expect, vi, beforeEach } from "vitest";
import { VelocityDetector } from "./velocity-detector";
import type { FraudDetectionContext } from "@orylo/fraud-engine";
import { FraudScoreSeverity } from "@orylo/fraud-engine";
import { redis } from "@/lib/redis";

// Mock Redis
vi.mock("@/lib/redis", () => ({
  redis: {
    incr: vi.fn(),
    expire: vi.fn(),
  },
}));

describe("VelocityDetector", () => {
  let detector: VelocityDetector;
  const mockContext: FraudDetectionContext = {
    organizationId: "org_test" as any,
    paymentIntentId: "pi_test" as any,
    amount: 5000,
    currency: "eur",
    customerEmail: "test@example.com",
    customerIp: "1.2.3.4",
    cardCountry: "FR",
    cardLast4: "4242",
    metadata: {
      customerId: "cus_test123",
    },
    timestamp: new Date(),
  };

  beforeEach(() => {
    detector = new VelocityDetector();
    vi.clearAllMocks();
  });

  describe("Threshold Logic (AC2, AC7)", () => {
    it("should return LOW risk (+0) for <5 transactions (AC2)", async () => {
      // Mock Redis returning 3 transactions
      vi.mocked(redis.incr).mockResolvedValue(3);

      const result = await detector.execute(mockContext);

      expect(result).not.toBeNull();
      expect(result!.score.value).toBe(0);
      expect(result!.score.severity).toBe(FraudScoreSeverity.LOW);
      expect(result!.details?.txCount).toBe(3);
    });

    it("should return MEDIUM risk (+20) for 5-10 transactions (AC2)", async () => {
      // Mock Redis returning 7 transactions
      vi.mocked(redis.incr).mockResolvedValue(7);

      const result = await detector.execute(mockContext);

      expect(result).not.toBeNull();
      expect(result!.score.value).toBe(20);
      expect(result!.score.severity).toBe(FraudScoreSeverity.MEDIUM);
      expect(result!.details?.txCount).toBe(7);
    });

    it("should return HIGH risk (+40) for >10 transactions (AC2)", async () => {
      // Mock Redis returning 15 transactions
      vi.mocked(redis.incr).mockResolvedValue(15);

      const result = await detector.execute(mockContext);

      expect(result).not.toBeNull();
      expect(result!.score.value).toBe(40);
      expect(result!.score.severity).toBe(FraudScoreSeverity.HIGH);
      expect(result!.details?.txCount).toBe(15);
    });

    it("should handle boundary conditions correctly", async () => {
      // Test boundary: 4 tx (still LOW)
      vi.mocked(redis.incr).mockResolvedValue(4);
      let result = await detector.execute(mockContext);
      expect(result!.score.value).toBe(0);
      expect(result!.score.severity).toBe(FraudScoreSeverity.LOW);

      // Test boundary: 5 tx (MEDIUM starts)
      vi.mocked(redis.incr).mockResolvedValue(5);
      result = await detector.execute(mockContext);
      expect(result!.score.value).toBe(20);
      expect(result!.score.severity).toBe(FraudScoreSeverity.MEDIUM);

      // Test boundary: 10 tx (still MEDIUM)
      vi.mocked(redis.incr).mockResolvedValue(10);
      result = await detector.execute(mockContext);
      expect(result!.score.value).toBe(20);
      expect(result!.score.severity).toBe(FraudScoreSeverity.MEDIUM);

      // Test boundary: 11 tx (HIGH starts)
      vi.mocked(redis.incr).mockResolvedValue(11);
      result = await detector.execute(mockContext);
      expect(result!.score.value).toBe(40);
      expect(result!.score.severity).toBe(FraudScoreSeverity.HIGH);
    });
  });

  describe("First Transaction (AC5)", () => {
    it("should return LOW risk (+0) for first transaction (AC5)", async () => {
      // Mock Redis returning 1 (first transaction)
      vi.mocked(redis.incr).mockResolvedValue(1);

      const result = await detector.execute(mockContext);

      expect(result).not.toBeNull();
      expect(result!.score.value).toBe(0);
      expect(result!.score.severity).toBe(FraudScoreSeverity.LOW);
      expect(result!.details?.txCount).toBe(1);
    });

    it("should set TTL on first transaction (AC3)", async () => {
      // Mock Redis returning 1 (first transaction)
      vi.mocked(redis.incr).mockResolvedValue(1);

      await detector.execute(mockContext);

      // Verify TTL was set (1 hour = 3600 seconds)
      expect(redis.expire).toHaveBeenCalledWith(
        expect.stringContaining("velocity:cus_test123:"),
        3600
      );
    });

    it("should not set TTL on subsequent transactions (AC3)", async () => {
      // Mock Redis returning 5 (not first transaction)
      vi.mocked(redis.incr).mockResolvedValue(5);

      await detector.execute(mockContext);

      // Verify TTL was NOT set
      expect(redis.expire).not.toHaveBeenCalled();
    });
  });

  describe("Redis Key Format (AC3)", () => {
    it("should use correct key format: velocity:{customerId}:{hour} (AC3)", async () => {
      vi.mocked(redis.incr).mockResolvedValue(1);

      await detector.execute(mockContext);

      // Verify Redis key format
      expect(redis.incr).toHaveBeenCalledWith(
        expect.stringMatching(/^velocity:cus_test123:\d{4}-\d{2}-\d{2}-\d{2}$/)
      );
    });

    it("should include UTC hour in key format", async () => {
      vi.mocked(redis.incr).mockResolvedValue(1);

      await detector.execute(mockContext);

      const callArg = vi.mocked(redis.incr).mock.calls[0][0];
      
      // Verify format: YYYY-MM-DD-HH
      expect(callArg).toMatch(/^velocity:cus_test123:\d{4}-\d{2}-\d{2}-\d{2}$/);
    });
  });

  describe("Metadata (AC4)", () => {
    it("should return metadata with txCount, timeframe, threshold (AC4)", async () => {
      vi.mocked(redis.incr).mockResolvedValue(7);

      const result = await detector.execute(mockContext);

      expect(result).not.toBeNull();
      expect(result!.details).toHaveProperty("txCount", 7);
      expect(result!.details).toHaveProperty("timeframe", "1h");
      expect(result!.details).toHaveProperty("threshold", 10);
      expect(result!.details).toHaveProperty("hour");
    });
  });

  describe("Missing Customer ID (AC5)", () => {
    it("should return LOW risk for missing customerId (AC5)", async () => {
      const contextWithoutCustomer: FraudDetectionContext = {
        ...mockContext,
        metadata: {}, // No customerId
      };

      const result = await detector.execute(contextWithoutCustomer);

      expect(result).not.toBeNull();
      expect(result!.score.value).toBe(0);
      expect(result!.score.severity).toBe(FraudScoreSeverity.LOW);
      expect(result!.details?.txCount).toBe(0);
      expect(result!.details?.reason).toBe("anonymous_customer");
    });

    it("should not call Redis for missing customerId", async () => {
      const contextWithoutCustomer: FraudDetectionContext = {
        ...mockContext,
        metadata: {},
      };

      await detector.execute(contextWithoutCustomer);

      // Redis should not be called
      expect(redis.incr).not.toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("should return null on Redis error (graceful degradation)", async () => {
      // Mock Redis throwing error
      vi.mocked(redis.incr).mockRejectedValue(new Error("Redis unavailable"));

      const result = await detector.execute(mockContext);

      // Should return null to skip detector
      expect(result).toBeNull();
    });

    it("should log error when Redis fails", async () => {
      const consoleSpy = vi.spyOn(console, "error");
      vi.mocked(redis.incr).mockRejectedValue(new Error("Redis unavailable"));

      await detector.execute(mockContext);

      expect(consoleSpy).toHaveBeenCalledWith(
        "[velocity_detector_error]",
        expect.objectContaining({
          paymentIntentId: mockContext.paymentIntentId,
          error: "Redis unavailable",
        })
      );
    });
  });

  describe("Performance (AC6)", () => {
    it("should complete execution quickly (<10ms target)", async () => {
      vi.mocked(redis.incr).mockResolvedValue(5);

      const startTime = Date.now();
      await detector.execute(mockContext);
      const duration = Date.now() - startTime;

      // AC6: Target <10ms (may be higher in CI, so using generous limit)
      expect(duration).toBeLessThan(100);
    });

    it("should log warning if execution is slow (>10ms)", async () => {
      // Mock slow Redis (simulate 15ms delay)
      vi.mocked(redis.incr).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(5), 15);
          })
      );

      const consoleSpy = vi.spyOn(console, "warn");

      await detector.execute(mockContext);

      // Should log slow query warning
      expect(consoleSpy).toHaveBeenCalledWith(
        "[velocity_detector_slow]",
        expect.objectContaining({
          paymentIntentId: mockContext.paymentIntentId,
          threshold: 10,
        })
      );
    });
  });

  describe("Detector Interface Implementation", () => {
    it("should have correct detector properties", () => {
      expect(detector.id).toBe("velocity-detector");
      expect(detector.name).toBe("Velocity Detector");
      expect(detector.description).toContain("transaction counts");
      expect(detector.severity).toBe(40);
    });

    it("should return FraudDetectionResult with correct structure", async () => {
      vi.mocked(redis.incr).mockResolvedValue(5);

      const result = await detector.execute(mockContext);

      expect(result).not.toBeNull();
      expect(result).toHaveProperty("detectorId");
      expect(result).toHaveProperty("score");
      expect(result).toHaveProperty("details");
      
      expect(result!.score).toHaveProperty("value");
      expect(result!.score).toHaveProperty("severity");
      expect(result!.score).toHaveProperty("reason");
      expect(result!.score).toHaveProperty("detectorId");
    });
  });
});
