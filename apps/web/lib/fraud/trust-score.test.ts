import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getTrustScore,
  updateTrustScore,
  getTrustScoreLevel,
} from "./trust-score";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { customerTrustScores } from "@orylo/database";

// Mock database and Redis
vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([])),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => Promise.resolve()),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      })),
    })),
  },
}));

vi.mock("@/lib/redis", () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  },
}));

describe("getTrustScore()", () => {
  const mockOrgId = "org_test";
  const mockCustomerId = "cus_test123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return cached score if available (AC5)", async () => {
    // Mock Redis cache hit
    vi.mocked(redis.get).mockResolvedValue({ score: 75 });

    const score = await getTrustScore(mockOrgId, mockCustomerId);

    expect(score).toBe(75);
    expect(redis.get).toHaveBeenCalledWith(`trust:${mockOrgId}:${mockCustomerId}`);
    // Should not query DB
    expect(db.select).not.toHaveBeenCalled();
  });

  it("should query DB on cache miss (AC5)", async () => {
    // Mock Redis cache miss
    vi.mocked(redis.get).mockResolvedValue(null);

    // Mock DB returning existing customer
    const mockRecord = [{ trustScore: 65 }];
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve(mockRecord)),
        })),
      })),
    } as any);

    const score = await getTrustScore(mockOrgId, mockCustomerId);

    expect(score).toBe(65);
    expect(db.select).toHaveBeenCalled();
    // Should cache result
    expect(redis.set).toHaveBeenCalledWith(
      `trust:${mockOrgId}:${mockCustomerId}`,
      expect.objectContaining({ score: 65 }),
      { ex: 3600 }
    );
  });

  it("should return 50 for new customer (AC2)", async () => {
    // Mock Redis cache miss
    vi.mocked(redis.get).mockResolvedValue(null);

    // Mock DB returning no customer
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([])), // No record
        })),
      })),
    } as any);

    const score = await getTrustScore(mockOrgId, mockCustomerId);

    expect(score).toBe(50); // AC2: Default score
    // Should create customer
    expect(db.insert).toHaveBeenCalledWith(customerTrustScores);
  });

  it("should return 50 on error (graceful degradation)", async () => {
    // Mock Redis throwing error
    vi.mocked(redis.get).mockRejectedValue(new Error("Redis down"));

    const score = await getTrustScore(mockOrgId, mockCustomerId);

    expect(score).toBe(50); // Fallback to neutral
  });
});

describe("updateTrustScore()", () => {
  const mockOrgId = "org_test";
  const mockCustomerId = "cus_test123";

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock DB to return existing customer
    const mockRecord = [
      {
        id: "score_1",
        trustScore: 50,
        totalTransactions: 5,
        fraudulentTransactions: 0,
      },
    ];
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve(mockRecord)),
        })),
      })),
    } as any);
  });

  it("should increase score for successful payment (AC3)", async () => {
    await updateTrustScore(mockOrgId, mockCustomerId, "successful_payment");

    // Should update score: 50 + 5 = 55
    expect(db.update).toHaveBeenCalledWith(customerTrustScores);
    expect(db.update().set).toHaveBeenCalledWith(
      expect.objectContaining({
        trustScore: 55,
        totalTransactions: 6, // Incremented
      })
    );

    // Should invalidate cache
    expect(redis.del).toHaveBeenCalledWith(`trust:${mockOrgId}:${mockCustomerId}`);
  });

  it("should decrease score for chargeback (AC3)", async () => {
    await updateTrustScore(mockOrgId, mockCustomerId, "chargeback");

    // Should update score: 50 - 50 = 0 (min)
    expect(db.update().set).toHaveBeenCalledWith(
      expect.objectContaining({
        trustScore: 0,
        fraudulentTransactions: 1, // Incremented
      })
    );
  });

  it("should decrease score for blocked transaction (AC3)", async () => {
    await updateTrustScore(mockOrgId, mockCustomerId, "blocked_transaction");

    // Should update score: 50 - 10 = 40
    expect(db.update().set).toHaveBeenCalledWith(
      expect.objectContaining({
        trustScore: 40,
      })
    );
  });

  it("should set score to 90 for whitelisted (AC3)", async () => {
    await updateTrustScore(mockOrgId, mockCustomerId, "whitelisted");

    // Should set score to 90 (manual override)
    expect(db.update().set).toHaveBeenCalledWith(
      expect.objectContaining({
        trustScore: 90,
        status: "whitelisted",
      })
    );
  });

  it("should not exceed 100 (max boundary)", async () => {
    // Mock high score customer
    const mockRecord = [
      {
        id: "score_1",
        trustScore: 98,
        totalTransactions: 20,
        fraudulentTransactions: 0,
      },
    ];
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve(mockRecord)),
        })),
      })),
    } as any);

    await updateTrustScore(mockOrgId, mockCustomerId, "successful_payment");

    // Should cap at 100: 98 + 5 = 103 → 100
    expect(db.update().set).toHaveBeenCalledWith(
      expect.objectContaining({
        trustScore: 100,
      })
    );
  });

  it("should not go below 0 (min boundary)", async () => {
    // Mock low score customer
    const mockRecord = [
      {
        id: "score_1",
        trustScore: 5,
        totalTransactions: 1,
        fraudulentTransactions: 0,
      },
    ];
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve(mockRecord)),
        })),
      })),
    } as any);

    await updateTrustScore(mockOrgId, mockCustomerId, "chargeback");

    // Should floor at 0: 5 - 50 = -45 → 0
    expect(db.update().set).toHaveBeenCalledWith(
      expect.objectContaining({
        trustScore: 0,
      })
    );
  });

  it("should handle errors gracefully (AC6)", async () => {
    // Mock DB error
    vi.mocked(db.update).mockImplementation(() => {
      throw new Error("DB error");
    });

    // Should not throw error (async update, fire-and-forget)
    await expect(
      updateTrustScore(mockOrgId, mockCustomerId, "successful_payment")
    ).resolves.not.toThrow();
  });
});

describe("getTrustScoreLevel()", () => {
  it("should return HIGH_RISK for score <30 (AC4)", () => {
    expect(getTrustScoreLevel(0)).toBe("HIGH_RISK");
    expect(getTrustScoreLevel(15)).toBe("HIGH_RISK");
    expect(getTrustScoreLevel(29)).toBe("HIGH_RISK");
  });

  it("should return MEDIUM_RISK for score 30-70 (AC4)", () => {
    expect(getTrustScoreLevel(30)).toBe("MEDIUM_RISK");
    expect(getTrustScoreLevel(50)).toBe("MEDIUM_RISK");
    expect(getTrustScoreLevel(70)).toBe("MEDIUM_RISK");
  });

  it("should return LOW_RISK for score >70 (AC4)", () => {
    expect(getTrustScoreLevel(71)).toBe("LOW_RISK");
    expect(getTrustScoreLevel(85)).toBe("LOW_RISK");
    expect(getTrustScoreLevel(100)).toBe("LOW_RISK");
  });
});
