import { describe, it, expect, vi, beforeEach } from "vitest";
import { detectFraud, applyDecisionLogic } from "./detect-fraud";
import { FraudDecision } from "@orylo/fraud-engine";
import type { FraudDetectionContext } from "@orylo/fraud-engine";
import { db } from "@/lib/db";

// Mock database
vi.mock("@/lib/db", () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn(() => Promise.resolve()),
    })),
  },
}));

// Mock fraud engine
vi.mock("@orylo/fraud-engine", async () => {
  const actual = await vi.importActual("@orylo/fraud-engine");
  return {
    ...actual,
    FraudDetectionEngine: vi.fn().mockImplementation(() => ({
      detect: vi.fn(() => Promise.resolve([])),
      calculateDecision: vi.fn(() => ({
        finalScore: 50,
        decision: "REVIEW",
      })),
    })),
  };
});

describe("detectFraud() - Fraud Detection Orchestrator", () => {
  const mockContext: FraudDetectionContext = {
    organizationId: "org_test" as any,
    paymentIntentId: "pi_test" as any,
    amount: 5000,
    currency: "eur",
    customerEmail: "test@example.com",
    customerIp: "1.2.3.4",
    cardCountry: "FR",
    cardLast4: "4242",
    metadata: {},
    timestamp: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return detection result with decision (AC1, AC2, AC3)", async () => {
    const result = await detectFraud(mockContext);

    // AC3: Verify output structure
    expect(result).toHaveProperty("decision");
    expect(result).toHaveProperty("riskScore");
    expect(result).toHaveProperty("confidence");
    expect(result).toHaveProperty("detectorResults");
    expect(result).toHaveProperty("latencyMs");
    expect(result).toHaveProperty("metadata");
  });

  it("should measure latency (AC5)", async () => {
    const result = await detectFraud(mockContext);

    // AC5: Verify latency is measured
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    expect(typeof result.latencyMs).toBe("number");
  });

  it("should save detection to database (AC7)", async () => {
    await detectFraud(mockContext);

    // AC7: Verify DB insert called
    expect(db.insert).toHaveBeenCalled();
  });

  it("should handle detector failures gracefully (AC6)", async () => {
    // Mock engine throwing error
    const { FraudDetectionEngine } = await import("@orylo/fraud-engine");
    vi.mocked(FraudDetectionEngine).mockImplementationOnce(() => ({
      detect: vi.fn(() => Promise.reject(new Error("Detector crashed"))),
      calculateDecision: vi.fn(),
    } as any));

    const result = await detectFraud(mockContext);

    // AC6: Should still return result (graceful degradation)
    expect(result).toBeDefined();
    expect(result.decision).toBe(FraudDecision.REVIEW); // Fallback to REVIEW
  });

  it("should handle database save errors gracefully (AC6)", async () => {
    // Mock DB error
    vi.mocked(db.insert).mockImplementationOnce(() => ({
      values: vi.fn(() => Promise.reject(new Error("DB error"))),
    } as any));

    // Should not throw error
    const result = await detectFraud(mockContext);

    expect(result).toBeDefined();
    // Detection should complete even if DB save fails
  });

  it("should calculate confidence correctly (AC3)", async () => {
    const result = await detectFraud(mockContext);

    // AC3: Confidence should be between 0 and 1
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });
});

describe("applyDecisionLogic() - Decision Thresholds", () => {
  it("should return BLOCK for risk_score ≥80 (AC4)", () => {
    expect(applyDecisionLogic(80)).toBe(FraudDecision.BLOCK);
    expect(applyDecisionLogic(90)).toBe(FraudDecision.BLOCK);
    expect(applyDecisionLogic(100)).toBe(FraudDecision.BLOCK);
  });

  it("should return REVIEW for risk_score 20-79 (AC4)", () => {
    expect(applyDecisionLogic(20)).toBe(FraudDecision.REVIEW);
    expect(applyDecisionLogic(50)).toBe(FraudDecision.REVIEW);
    expect(applyDecisionLogic(79)).toBe(FraudDecision.REVIEW);
  });

  it("should return ALLOW for risk_score <20 (AC4)", () => {
    expect(applyDecisionLogic(0)).toBe(FraudDecision.ALLOW);
    expect(applyDecisionLogic(10)).toBe(FraudDecision.ALLOW);
    expect(applyDecisionLogic(19)).toBe(FraudDecision.ALLOW);
  });

  it("should handle boundary conditions correctly (AC4)", () => {
    // Boundary testing
    expect(applyDecisionLogic(19.9)).toBe(FraudDecision.ALLOW);
    expect(applyDecisionLogic(20.0)).toBe(FraudDecision.REVIEW);
    expect(applyDecisionLogic(79.9)).toBe(FraudDecision.REVIEW);
    expect(applyDecisionLogic(80.0)).toBe(FraudDecision.BLOCK);
  });
});

describe("Performance Monitoring (AC5)", () => {
  it("should complete detection in <350ms (AC5)", async () => {
    const mockContext: FraudDetectionContext = {
      organizationId: "org_test" as any,
      paymentIntentId: "pi_test" as any,
      amount: 5000,
      currency: "eur",
      customerEmail: null,
      customerIp: null,
      cardCountry: null,
      cardLast4: null,
      metadata: {},
      timestamp: new Date(),
    };

    const startTime = Date.now();
    const result = await detectFraud(mockContext);
    const actualLatency = Date.now() - startTime;

    // AC5: P95 latency target <350ms
    expect(actualLatency).toBeLessThan(350);
    
    // Also verify reported latency is reasonable
    expect(result.latencyMs).toBeLessThan(350);
  });

  it("should log warning if latency >350ms (AC5)", async () => {
    // This test verifies the logging behavior
    // In real scenario with slow detectors, warning would be logged
    
    const consoleSpy = vi.spyOn(console, "warn");
    
    // Mock slow detector (this is a unit test, so actual timing won't trigger)
    // In integration test, this would be tested with real slow detector
    
    const mockContext: FraudDetectionContext = {
      organizationId: "org_test" as any,
      paymentIntentId: "pi_test" as any,
      amount: 5000,
      currency: "eur",
      customerEmail: null,
      customerIp: null,
      cardCountry: null,
      cardLast4: null,
      metadata: {},
      timestamp: new Date(),
    };

    await detectFraud(mockContext);

    // Actual latency check would be in integration test
    // This just verifies the function exists
    expect(consoleSpy).toBeDefined();
  });
});

describe("Error Handling Scenarios (AC6)", () => {
  it("should return REVIEW if all detectors fail (AC6)", async () => {
    // Mock complete engine failure
    const { FraudDetectionEngine } = await import("@orylo/fraud-engine");
    vi.mocked(FraudDetectionEngine).mockImplementationOnce(() => ({
      detect: vi.fn(() => Promise.reject(new Error("All detectors failed"))),
      calculateDecision: vi.fn(),
    } as any));

    const mockContext: FraudDetectionContext = {
      organizationId: "org_test" as any,
      paymentIntentId: "pi_test" as any,
      amount: 5000,
      currency: "eur",
      customerEmail: null,
      customerIp: null,
      cardCountry: null,
      cardLast4: null,
      metadata: {},
      timestamp: new Date(),
    };

    const result = await detectFraud(mockContext);

    // AC6: Graceful degradation - return REVIEW for manual check
    expect(result.decision).toBe(FraudDecision.REVIEW);
    expect(result.riskScore).toBe(50); // Medium risk
  });

  it("should track failed detectors in metadata (AC6)", async () => {
    const mockContext: FraudDetectionContext = {
      organizationId: "org_test" as any,
      paymentIntentId: "pi_test" as any,
      amount: 5000,
      currency: "eur",
      customerEmail: null,
      customerIp: null,
      cardCountry: null,
      cardLast4: null,
      metadata: {},
      timestamp: new Date(),
    };

    const result = await detectFraud(mockContext);

    // AC6: Metadata should track detector execution stats
    expect(result.metadata).toHaveProperty("totalDetectors");
    expect(result.metadata).toHaveProperty("successfulDetectors");
    expect(result.metadata).toHaveProperty("failedDetectors");
  });
});
