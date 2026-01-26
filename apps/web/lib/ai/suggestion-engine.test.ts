import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateSuggestion } from "./suggestion-engine";
import { subDays, subHours } from "date-fns";

// Mock dependencies
vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(),
  },
}));

vi.mock("@/lib/redis", () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

vi.mock("date-fns", () => ({
  subDays: vi.fn((date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
  }),
  subHours: vi.fn((date: Date, hours: number) => {
    const result = new Date(date);
    result.setHours(result.getHours() - hours);
    return result;
  }),
}));

import { db } from "@/lib/db";
import { redis } from "@/lib/redis";

// Type assertions for mocks
const mockDb = db as {
  select: ReturnType<typeof vi.fn>;
};

describe("Suggestion Engine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Whitelist suggestion logic", () => {
    it("should suggest whitelist for customer with trust score >80 and ≥3 successful transactions", async () => {
      // Mock DB queries
      const mockDbSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                trustScore: 85,
                status: "normal",
                totalChargebacks: 0,
              },
            ]),
          }),
        }),
      });

      const mockDbSelectCount = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 5 }]), // ≥3 successful
        }),
      });

      vi.mocked(mockDb.select).mockImplementation((args) => {
        if (args?.count) {
          return mockDbSelectCount();
        }
        return mockDbSelect();
      });

      // Mock cache
      vi.mocked(redis.get).mockResolvedValue(null);
      vi.mocked(redis.set).mockResolvedValue(undefined);

      const context = {
        customerId: "cus_001",
        customerEmail: "good@example.com",
        organizationId: "org_001",
        detectionId: "det_001",
      };

      const suggestion = await generateSuggestion(context);

      expect(suggestion).not.toBeNull();
      expect(suggestion?.type).toBe("whitelist");
      expect(suggestion?.confidence).toBeGreaterThan(0.5);
    });

    it("should not suggest whitelist if trust score ≤80", async () => {
      // Mock DB - low trust score
      const mockDbSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                trustScore: 75, // ≤80
                status: "normal",
                totalChargebacks: 0,
              },
            ]),
          }),
        }),
      });

      vi.mocked(mockDb.select).mockReturnValue(mockDbSelect());
      vi.mocked(redis.get).mockResolvedValue(null);

      const context = {
        customerId: "cus_001",
        customerEmail: "customer@example.com",
        organizationId: "org_001",
        detectionId: "det_001",
      };

      const suggestion = await generateSuggestion(context);

      expect(suggestion).toBeNull();
    });

    it("should not suggest whitelist if <3 successful transactions", async () => {
      // Mock DB - high trust but few transactions
      const mockDbSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                trustScore: 85,
                status: "normal",
                totalChargebacks: 0,
              },
            ]),
          }),
        }),
      });

      const mockDbSelectCount = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 2 }]), // <3
        }),
      });

      vi.mocked(mockDb.select).mockImplementation((args) => {
        if (args?.count) {
          return mockDbSelectCount();
        }
        return mockDbSelect();
      });

      vi.mocked(redis.get).mockResolvedValue(null);

      const context = {
        customerId: "cus_001",
        customerEmail: "customer@example.com",
        organizationId: "org_001",
        detectionId: "det_001",
      };

      const suggestion = await generateSuggestion(context);

      expect(suggestion).toBeNull();
    });
  });

  describe("Blacklist suggestion logic", () => {
    it("should suggest blacklist for customer with trust score <30", async () => {
      // Mock DB - low trust score
      const mockDbSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                trustScore: 20, // <30
                status: "normal",
                totalChargebacks: 0,
              },
            ]),
          }),
        }),
      });

      const mockDbSelectCount = vi.fn().mockResolvedValue([{ count: 0 }]);

      vi.mocked(mockDb.select).mockImplementation((args) => {
        if (args?.count) {
          return mockDbSelectCount();
        }
        return mockDbSelect();
      });

      vi.mocked(redis.get).mockResolvedValue(null);

      const context = {
        customerId: "cus_001",
        customerEmail: "fraud@example.com",
        organizationId: "org_001",
        detectionId: "det_001",
      };

      const suggestion = await generateSuggestion(context);

      expect(suggestion).not.toBeNull();
      expect(suggestion?.type).toBe("blacklist");
    });

    it("should suggest blacklist for customer with ≥2 chargebacks", async () => {
      // Mock DB - chargebacks
      const mockDbSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                trustScore: 50,
                status: "normal",
                totalChargebacks: 2, // ≥2
              },
            ]),
          }),
        }),
      });

      const mockDbSelectCount = vi.fn().mockResolvedValue([{ count: 0 }]);

      vi.mocked(mockDb.select).mockImplementation((args) => {
        if (args?.count) {
          return mockDbSelectCount();
        }
        return mockDbSelect();
      });

      vi.mocked(redis.get).mockResolvedValue(null);

      const context = {
        customerId: "cus_001",
        customerEmail: "fraud@example.com",
        organizationId: "org_001",
        detectionId: "det_001",
      };

      const suggestion = await generateSuggestion(context);

      expect(suggestion).not.toBeNull();
      expect(suggestion?.type).toBe("blacklist");
      expect(suggestion?.factors).toContain("2 chargebacks");
    });

    it("should suggest blacklist for card testing pattern (≥5 failed attempts in 1h)", async () => {
      // Mock DB
      const mockDbSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                trustScore: 50,
                status: "normal",
                totalChargebacks: 0,
              },
            ]),
          }),
        }),
      });

      // Mock card testing pattern (≥5 blocks in 1h)
      const mockDbSelectCount = vi.fn().mockImplementation((args) => {
        if (args?.count) {
          // First call: recent blocks (1h) - return 5
          // Second call: blocked transactions (30 days) - return 0
          return Promise.resolve([{ count: 5 }]);
        }
        return mockDbSelect();
      });

      vi.mocked(mockDb.select).mockImplementation(mockDbSelectCount);

      vi.mocked(redis.get).mockResolvedValue(null);

      const context = {
        customerId: "cus_001",
        customerEmail: "test.card@example.com",
        organizationId: "org_001",
        detectionId: "det_001",
      };

      const suggestion = await generateSuggestion(context);

      expect(suggestion).not.toBeNull();
      expect(suggestion?.type).toBe("blacklist");
      expect(suggestion?.factors.some((f) => f.includes("test de carte"))).toBe(
        true
      );
    });
  });

  describe("Priority rule (AC9)", () => {
    it("should return blacklist suggestion if both whitelist and blacklist criteria met", async () => {
      // Mock DB - conflicting patterns (high trust but also chargebacks)
      const mockDbSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                trustScore: 85, // High (whitelist candidate)
                status: "normal",
                totalChargebacks: 2, // ≥2 (blacklist candidate)
              },
            ]),
          }),
        }),
      });

      const mockDbSelectCount = vi.fn().mockResolvedValue([{ count: 5 }]); // ≥3 successful

      vi.mocked(mockDb.select).mockImplementation((args) => {
        if (args?.count) {
          return mockDbSelectCount();
        }
        return mockDbSelect();
      });

      vi.mocked(redis.get).mockResolvedValue(null);

      const context = {
        customerId: "cus_001",
        customerEmail: "customer@example.com",
        organizationId: "org_001",
        detectionId: "det_001",
      };

      const suggestion = await generateSuggestion(context);

      // AC9: Blacklist takes priority
      expect(suggestion).not.toBeNull();
      expect(suggestion?.type).toBe("blacklist");
    });
  });

  describe("Edge cases", () => {
    it("should return null for already whitelisted customer", async () => {
      const mockDbSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                trustScore: 90,
                status: "whitelisted", // Already whitelisted
                totalChargebacks: 0,
              },
            ]),
          }),
        }),
      });

      vi.mocked(mockDb.select).mockReturnValue(mockDbSelect());
      vi.mocked(redis.get).mockResolvedValue(null);

      const context = {
        customerId: "cus_001",
        customerEmail: "customer@example.com",
        organizationId: "org_001",
        detectionId: "det_001",
      };

      const suggestion = await generateSuggestion(context);

      expect(suggestion).toBeNull();
    });

    it("should return null for already blacklisted customer", async () => {
      const mockDbSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                trustScore: 0,
                status: "blacklisted", // Already blacklisted
                totalChargebacks: 2,
              },
            ]),
          }),
        }),
      });

      vi.mocked(mockDb.select).mockReturnValue(mockDbSelect());
      vi.mocked(redis.get).mockResolvedValue(null);

      const context = {
        customerId: "cus_001",
        customerEmail: "customer@example.com",
        organizationId: "org_001",
        detectionId: "det_001",
      };

      const suggestion = await generateSuggestion(context);

      expect(suggestion).toBeNull();
    });

    it("should return null for new customer with no history", async () => {
      // Mock DB - no customer record
      const mockDbSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]), // No record
          }),
        }),
      });

      const mockDbSelectCount = vi.fn().mockResolvedValue([{ count: 0 }]);

      vi.mocked(mockDb.select).mockImplementation((args) => {
        if (args?.count) {
          return mockDbSelectCount();
        }
        return mockDbSelect();
      });

      vi.mocked(redis.get).mockResolvedValue(null);

      const context = {
        customerId: null,
        customerEmail: "new@example.com",
        organizationId: "org_001",
        detectionId: "det_001",
      };

      const suggestion = await generateSuggestion(context);

      expect(suggestion).toBeNull();
    });
  });

  describe("Confidence score calculation", () => {
    it("should calculate confidence based on matching criteria", async () => {
      // Mock DB - perfect whitelist candidate (4/4 criteria)
      const mockDbSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                trustScore: 85,
                status: "normal",
                totalChargebacks: 0,
              },
            ]),
          }),
        }),
      });

      const mockDbSelectCount = vi.fn().mockResolvedValue([{ count: 10 }]); // Many successful

      vi.mocked(mockDb.select).mockImplementation((args) => {
        if (args?.count) {
          return mockDbSelectCount();
        }
        return mockDbSelect();
      });

      vi.mocked(redis.get).mockResolvedValue(null);

      const context = {
        customerId: "cus_001",
        customerEmail: "good@example.com",
        organizationId: "org_001",
        detectionId: "det_001",
      };

      const suggestion = await generateSuggestion(context);

      expect(suggestion).not.toBeNull();
      expect(suggestion?.confidence).toBeGreaterThan(0.7); // High confidence for perfect match
    });
  });
});
