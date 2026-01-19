import { describe, it, expect, vi, beforeEach } from "vitest";
import { TrustScoreDetector } from "./trust-score-detector";
import type { FraudDetectionContext } from "@orylo/fraud-engine";
import { FraudScoreSeverity } from "@orylo/fraud-engine";
import * as trustScore from "../trust-score";

// Mock trust score module
vi.mock("../trust-score", () => ({
  getTrustScore: vi.fn(),
  getTrustScoreLevel: vi.fn(),
}));

describe("TrustScoreDetector", () => {
  let detector: TrustScoreDetector;
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
    detector = new TrustScoreDetector();
    vi.clearAllMocks();
  });

  describe("Detector Thresholds (AC4, AC7)", () => {
    it("should return HIGH risk (+40) for score <30 (AC4)", async () => {
      // Mock low trust score
      vi.mocked(trustScore.getTrustScore).mockResolvedValue(20);
      vi.mocked(trustScore.getTrustScoreLevel).mockReturnValue("HIGH_RISK");

      const result = await detector.execute(mockContext);

      expect(result).not.toBeNull();
      expect(result!.score.value).toBe(40);
      expect(result!.score.severity).toBe(FraudScoreSeverity.HIGH);
      expect(result!.details?.trustScore).toBe(20);
      expect(result!.details?.level).toBe("HIGH_RISK");
    });

    it("should return MEDIUM risk (+20) for score 30-70 (AC4)", async () => {
      // Mock medium trust score (new customer default)
      vi.mocked(trustScore.getTrustScore).mockResolvedValue(50);
      vi.mocked(trustScore.getTrustScoreLevel).mockReturnValue("MEDIUM_RISK");

      const result = await detector.execute(mockContext);

      expect(result).not.toBeNull();
      expect(result!.score.value).toBe(20);
      expect(result!.score.severity).toBe(FraudScoreSeverity.MEDIUM);
      expect(result!.details?.trustScore).toBe(50);
      expect(result!.details?.level).toBe("MEDIUM_RISK");
    });

    it("should return LOW risk (+0) for score >70 (AC4)", async () => {
      // Mock high trust score (trusted customer)
      vi.mocked(trustScore.getTrustScore).mockResolvedValue(85);
      vi.mocked(trustScore.getTrustScoreLevel).mockReturnValue("LOW_RISK");

      const result = await detector.execute(mockContext);

      expect(result).not.toBeNull();
      expect(result!.score.value).toBe(0);
      expect(result!.score.severity).toBe(FraudScoreSeverity.LOW);
      expect(result!.details?.trustScore).toBe(85);
      expect(result!.details?.level).toBe("LOW_RISK");
    });

    it("should handle boundary conditions correctly (AC4)", async () => {
      // Test boundary: 29 (still HIGH)
      vi.mocked(trustScore.getTrustScore).mockResolvedValue(29);
      vi.mocked(trustScore.getTrustScoreLevel).mockReturnValue("HIGH_RISK");
      let result = await detector.execute(mockContext);
      expect(result!.score.value).toBe(40);

      // Test boundary: 30 (MEDIUM starts)
      vi.mocked(trustScore.getTrustScore).mockResolvedValue(30);
      vi.mocked(trustScore.getTrustScoreLevel).mockReturnValue("MEDIUM_RISK");
      result = await detector.execute(mockContext);
      expect(result!.score.value).toBe(20);

      // Test boundary: 70 (still MEDIUM)
      vi.mocked(trustScore.getTrustScore).mockResolvedValue(70);
      vi.mocked(trustScore.getTrustScoreLevel).mockReturnValue("MEDIUM_RISK");
      result = await detector.execute(mockContext);
      expect(result!.score.value).toBe(20);

      // Test boundary: 71 (LOW starts)
      vi.mocked(trustScore.getTrustScore).mockResolvedValue(71);
      vi.mocked(trustScore.getTrustScoreLevel).mockReturnValue("LOW_RISK");
      result = await detector.execute(mockContext);
      expect(result!.score.value).toBe(0);
    });
  });

  describe("New Customer (AC2)", () => {
    it("should handle new customer with score 50 (AC2)", async () => {
      // Mock new customer (default score)
      vi.mocked(trustScore.getTrustScore).mockResolvedValue(50);
      vi.mocked(trustScore.getTrustScoreLevel).mockReturnValue("MEDIUM_RISK");

      const result = await detector.execute(mockContext);

      expect(result).not.toBeNull();
      expect(result!.score.value).toBe(20); // MEDIUM risk
      expect(result!.details?.trustScore).toBe(50);
      expect(result!.details?.isNewCustomer).toBe(true);
    });
  });

  describe("Missing Customer ID", () => {
    it("should return MEDIUM risk for missing customerId", async () => {
      const contextWithoutCustomer: FraudDetectionContext = {
        ...mockContext,
        metadata: {}, // No customerId
      };

      const result = await detector.execute(contextWithoutCustomer);

      expect(result).not.toBeNull();
      expect(result!.score.value).toBe(20); // MEDIUM risk for anonymous
      expect(result!.score.severity).toBe(FraudScoreSeverity.MEDIUM);
      expect(result!.details?.trustScore).toBe(50);
      expect(result!.details?.isNewCustomer).toBe(true);
      expect(result!.details?.reason).toBe("anonymous_customer");
    });

    it("should not call getTrustScore for missing customerId", async () => {
      const contextWithoutCustomer: FraudDetectionContext = {
        ...mockContext,
        metadata: {},
      };

      await detector.execute(contextWithoutCustomer);

      // getTrustScore should not be called
      expect(trustScore.getTrustScore).not.toHaveBeenCalled();
    });
  });

  describe("Caching (AC5)", () => {
    it("should use cached trust score (via getTrustScore)", async () => {
      // Mock getTrustScore (which handles caching internally)
      vi.mocked(trustScore.getTrustScore).mockResolvedValue(65);
      vi.mocked(trustScore.getTrustScoreLevel).mockReturnValue("MEDIUM_RISK");

      await detector.execute(mockContext);

      // Verify getTrustScore was called (it handles cache internally)
      expect(trustScore.getTrustScore).toHaveBeenCalledWith(
        mockContext.organizationId,
        "cus_test123"
      );
    });
  });

  describe("Error Handling", () => {
    it("should return null on getTrustScore error (graceful degradation)", async () => {
      // Mock getTrustScore throwing error
      vi.mocked(trustScore.getTrustScore).mockRejectedValue(
        new Error("DB error")
      );

      const result = await detector.execute(mockContext);

      // Should return null to skip detector
      expect(result).toBeNull();
    });

    it("should log error when getTrustScore fails", async () => {
      const consoleSpy = vi.spyOn(console, "error");
      vi.mocked(trustScore.getTrustScore).mockRejectedValue(
        new Error("DB error")
      );

      await detector.execute(mockContext);

      expect(consoleSpy).toHaveBeenCalledWith(
        "[trust_score_detector_error]",
        expect.objectContaining({
          paymentIntentId: mockContext.paymentIntentId,
          error: "DB error",
        })
      );
    });
  });

  describe("Performance", () => {
    it("should complete execution quickly (<20ms target)", async () => {
      vi.mocked(trustScore.getTrustScore).mockResolvedValue(50);
      vi.mocked(trustScore.getTrustScoreLevel).mockReturnValue("MEDIUM_RISK");

      const startTime = Date.now();
      await detector.execute(mockContext);
      const duration = Date.now() - startTime;

      // Target <20ms (may be higher in CI, so using generous limit)
      expect(duration).toBeLessThan(100);
    });

    it("should log warning if execution is slow (>20ms)", async () => {
      // Mock slow getTrustScore (simulate 25ms delay)
      vi.mocked(trustScore.getTrustScore).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(50), 25);
          })
      );
      vi.mocked(trustScore.getTrustScoreLevel).mockReturnValue("MEDIUM_RISK");

      const consoleSpy = vi.spyOn(console, "warn");

      await detector.execute(mockContext);

      // Should log slow query warning
      expect(consoleSpy).toHaveBeenCalledWith(
        "[trust_score_detector_slow]",
        expect.objectContaining({
          paymentIntentId: mockContext.paymentIntentId,
          threshold: 20,
        })
      );
    });
  });

  describe("Detector Interface Implementation", () => {
    it("should have correct detector properties", () => {
      expect(detector.id).toBe("trust-score-detector");
      expect(detector.name).toBe("Trust Score Detector");
      expect(detector.description).toContain("trusted repeat customers");
      expect(detector.severity).toBe(40);
    });

    it("should return FraudDetectionResult with correct structure", async () => {
      vi.mocked(trustScore.getTrustScore).mockResolvedValue(50);
      vi.mocked(trustScore.getTrustScoreLevel).mockReturnValue("MEDIUM_RISK");

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

  describe("Real-world Scenarios", () => {
    it("should reward trusted repeat customer (high score)", async () => {
      // Customer with 20 successful payments, no chargebacks
      // Score: 50 + (20 * 5) = 150 → capped at 100
      vi.mocked(trustScore.getTrustScore).mockResolvedValue(100);
      vi.mocked(trustScore.getTrustScoreLevel).mockReturnValue("LOW_RISK");

      const result = await detector.execute(mockContext);

      expect(result!.score.value).toBe(0); // No penalty for trusted customer
      expect(result!.details?.level).toBe("LOW_RISK");
    });

    it("should penalize customer with chargeback history (low score)", async () => {
      // Customer with 1 chargeback
      // Score: 50 - 50 = 0
      vi.mocked(trustScore.getTrustScore).mockResolvedValue(0);
      vi.mocked(trustScore.getTrustScoreLevel).mockReturnValue("HIGH_RISK");

      const result = await detector.execute(mockContext);

      expect(result!.score.value).toBe(40); // HIGH risk
      expect(result!.details?.level).toBe("HIGH_RISK");
    });

    it("should handle whitelisted customer (score 90)", async () => {
      // Manually whitelisted customer
      vi.mocked(trustScore.getTrustScore).mockResolvedValue(90);
      vi.mocked(trustScore.getTrustScoreLevel).mockReturnValue("LOW_RISK");

      const result = await detector.execute(mockContext);

      expect(result!.score.value).toBe(0); // No penalty
      expect(result!.details?.level).toBe("LOW_RISK");
      expect(result!.details?.trustScore).toBe(90);
    });

    it("should handle first-time customer (neutral score)", async () => {
      // First transaction, score = 50 (default)
      vi.mocked(trustScore.getTrustScore).mockResolvedValue(50);
      vi.mocked(trustScore.getTrustScoreLevel).mockReturnValue("MEDIUM_RISK");

      const result = await detector.execute(mockContext);

      expect(result!.score.value).toBe(20); // MEDIUM risk (neutral)
      expect(result!.details?.isNewCustomer).toBe(true);
    });
  });
});
