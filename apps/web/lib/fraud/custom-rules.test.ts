import { describe, it, expect, vi, beforeEach } from "vitest";
import { applyCustomRules, invalidateRulesCache } from "./custom-rules";
import type { DetectionContext, FraudDecision } from "@orylo/fraud-engine";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { customRules } from "@orylo/database";

// Mock database and Redis
vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: vi.fn(() => Promise.resolve([])),
        })),
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

describe("Custom Rules Engine", () => {
  const mockOrgId = "org_test";
  const mockContext: DetectionContext = {
    organizationId: mockOrgId as any,
    paymentIntentId: "pi_test" as any,
    amount: 60000, // €600.00
    currency: "eur",
    customerEmail: "test@example.com",
    customerIp: "1.2.3.4",
    cardCountry: "FR",
    cardLast4: "4242",
    metadata: {},
    timestamp: new Date(),
  };

  const mockDetectorResults = {
    riskScore: 30,
    txCount: 3,
    trustScore: 50,
    ipCountry: "FR",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default: no cache, no rules
    vi.mocked(redis.get).mockResolvedValue(null);
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: vi.fn(() => Promise.resolve([])),
        })),
      })),
    } as any);
  });

  describe("Simple Operators (AC3, AC9)", () => {
    it("should match rule with > operator (AC3)", async () => {
      // Rule: amount > 50000 → BLOCK
      const mockRules = [
        {
          id: "rule_1",
          name: "Block high-value transactions",
          condition: { field: "amount", operator: ">", value: 50000 },
          action: "BLOCK",
          priority: 100,
          isActive: true,
        },
      ];

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            orderBy: vi.fn(() => Promise.resolve(mockRules)),
          })),
        })),
      } as any);

      const result = await applyCustomRules(
        mockOrgId,
        mockContext, // amount = 60000
        mockDetectorResults,
        "ALLOW" as FraudDecision,
      );

      // Rule should match (60000 > 50000) → BLOCK
      expect(result.decision).toBe("BLOCK");
      expect(result.matchedRule).toEqual({
        id: "rule_1",
        name: "Block high-value transactions",
        action: "BLOCK",
      });
    });

    it("should not match rule with > operator when condition fails", async () => {
      // Rule: amount > 100000 → BLOCK
      const mockRules = [
        {
          id: "rule_1",
          name: "Block very high-value transactions",
          condition: { field: "amount", operator: ">", value: 100000 },
          action: "BLOCK",
          priority: 100,
          isActive: true,
        },
      ];

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            orderBy: vi.fn(() => Promise.resolve(mockRules)),
          })),
        })),
      } as any);

      const result = await applyCustomRules(
        mockOrgId,
        mockContext, // amount = 60000
        mockDetectorResults,
        "ALLOW" as FraudDecision,
      );

      // Rule should NOT match (60000 NOT > 100000) → Keep ALLOW
      expect(result.decision).toBe("ALLOW");
      expect(result.matchedRule).toBeNull();
    });

    it("should match rule with < operator (AC3)", async () => {
      // Rule: trust_score < 30 → REVIEW
      const mockRules = [
        {
          id: "rule_1",
          name: "Review low trust customers",
          condition: { field: "trust_score", operator: "<", value: 30 },
          action: "REVIEW",
          priority: 100,
          isActive: true,
        },
      ];

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            orderBy: vi.fn(() => Promise.resolve(mockRules)),
          })),
        })),
      } as any);

      const result = await applyCustomRules(
        mockOrgId,
        mockContext,
        { ...mockDetectorResults, trustScore: 20 }, // Low trust
        "ALLOW" as FraudDecision,
      );

      // Rule should match (20 < 30) → REVIEW
      expect(result.decision).toBe("REVIEW");
      expect(result.matchedRule?.name).toBe("Review low trust customers");
    });

    it("should match rule with = operator (AC3)", async () => {
      // Rule: card_country = 'US' → REVIEW
      const mockRules = [
        {
          id: "rule_1",
          name: "Review US transactions",
          condition: { field: "card_country", operator: "=", value: "US" },
          action: "REVIEW",
          priority: 100,
          isActive: true,
        },
      ];

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            orderBy: vi.fn(() => Promise.resolve(mockRules)),
          })),
        })),
      } as any);

      const contextUS = { ...mockContext, cardCountry: "US" };

      const result = await applyCustomRules(
        mockOrgId,
        contextUS,
        mockDetectorResults,
        "ALLOW" as FraudDecision,
      );

      // Rule should match (US = US) → REVIEW
      expect(result.decision).toBe("REVIEW");
    });

    it("should match rule with != operator (AC3)", async () => {
      // Rule: card_country != 'FR' → REVIEW
      const mockRules = [
        {
          id: "rule_1",
          name: "Review non-French transactions",
          condition: { field: "card_country", operator: "!=", value: "FR" },
          action: "REVIEW",
          priority: 100,
          isActive: true,
        },
      ];

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            orderBy: vi.fn(() => Promise.resolve(mockRules)),
          })),
        })),
      } as any);

      const contextUS = { ...mockContext, cardCountry: "US" };

      const result = await applyCustomRules(
        mockOrgId,
        contextUS,
        mockDetectorResults,
        "ALLOW" as FraudDecision,
      );

      // Rule should match (US != FR) → REVIEW
      expect(result.decision).toBe("REVIEW");
    });

    it("should match rule with IN operator (AC3)", async () => {
      // Rule: card_country IN ['CN', 'RU', 'NG'] → BLOCK
      const mockRules = [
        {
          id: "rule_1",
          name: "Block high-risk countries",
          condition: {
            field: "card_country",
            operator: "IN",
            value: ["CN", "RU", "NG"],
          },
          action: "BLOCK",
          priority: 100,
          isActive: true,
        },
      ];

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            orderBy: vi.fn(() => Promise.resolve(mockRules)),
          })),
        })),
      } as any);

      const contextCN = { ...mockContext, cardCountry: "CN" };

      const result = await applyCustomRules(
        mockOrgId,
        contextCN,
        mockDetectorResults,
        "ALLOW" as FraudDecision,
      );

      // Rule should match (CN IN [CN, RU, NG]) → BLOCK
      expect(result.decision).toBe("BLOCK");
      expect(result.matchedRule?.name).toBe("Block high-risk countries");
    });

    it("should not match rule with IN operator when value not in list", async () => {
      // Rule: card_country IN ['CN', 'RU', 'NG'] → BLOCK
      const mockRules = [
        {
          id: "rule_1",
          name: "Block high-risk countries",
          condition: {
            field: "card_country",
            operator: "IN",
            value: ["CN", "RU", "NG"],
          },
          action: "BLOCK",
          priority: 100,
          isActive: true,
        },
      ];

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            orderBy: vi.fn(() => Promise.resolve(mockRules)),
          })),
        })),
      } as any);

      // context has cardCountry = "FR" (not in list)
      const result = await applyCustomRules(
        mockOrgId,
        mockContext,
        mockDetectorResults,
        "ALLOW" as FraudDecision,
      );

      // Rule should NOT match (FR NOT IN [CN, RU, NG]) → Keep ALLOW
      expect(result.decision).toBe("ALLOW");
      expect(result.matchedRule).toBeNull();
    });
  });

  describe("Logical Operators (AC4, AC9)", () => {
    it("should match rule with AND operator when both conditions true (AC4)", async () => {
      // Rule: amount > 50000 AND velocity > 5 → BLOCK
      const mockRules = [
        {
          id: "rule_1",
          name: "Block high-value velocity attacks",
          condition: {
            operator: "AND",
            conditions: [
              { field: "amount", operator: ">", value: 50000 },
              { field: "velocity", operator: ">", value: 5 },
            ],
          },
          action: "BLOCK",
          priority: 100,
          isActive: true,
        },
      ];

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            orderBy: vi.fn(() => Promise.resolve(mockRules)),
          })),
        })),
      } as any);

      const result = await applyCustomRules(
        mockOrgId,
        mockContext, // amount = 60000 (> 50000) ✓
        { ...mockDetectorResults, txCount: 10 }, // velocity = 10 (> 5) ✓
        "ALLOW" as FraudDecision,
      );

      // Both conditions match → BLOCK
      expect(result.decision).toBe("BLOCK");
      expect(result.matchedRule?.name).toBe(
        "Block high-value velocity attacks",
      );
    });

    it("should not match rule with AND operator when one condition fails", async () => {
      // Rule: amount > 50000 AND velocity > 5 → BLOCK
      const mockRules = [
        {
          id: "rule_1",
          name: "Block high-value velocity attacks",
          condition: {
            operator: "AND",
            conditions: [
              { field: "amount", operator: ">", value: 50000 },
              { field: "velocity", operator: ">", value: 5 },
            ],
          },
          action: "BLOCK",
          priority: 100,
          isActive: true,
        },
      ];

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            orderBy: vi.fn(() => Promise.resolve(mockRules)),
          })),
        })),
      } as any);

      const result = await applyCustomRules(
        mockOrgId,
        mockContext, // amount = 60000 (> 50000) ✓
        { ...mockDetectorResults, txCount: 3 }, // velocity = 3 (NOT > 5) ✗
        "ALLOW" as FraudDecision,
      );

      // One condition fails → Keep ALLOW
      expect(result.decision).toBe("ALLOW");
      expect(result.matchedRule).toBeNull();
    });

    it("should match rule with OR operator when one condition true (AC4)", async () => {
      // Rule: amount > 100000 OR trust_score < 30 → REVIEW
      const mockRules = [
        {
          id: "rule_1",
          name: "Review high-value or low-trust",
          condition: {
            operator: "OR",
            conditions: [
              { field: "amount", operator: ">", value: 100000 },
              { field: "trust_score", operator: "<", value: 30 },
            ],
          },
          action: "REVIEW",
          priority: 100,
          isActive: true,
        },
      ];

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            orderBy: vi.fn(() => Promise.resolve(mockRules)),
          })),
        })),
      } as any);

      const result = await applyCustomRules(
        mockOrgId,
        mockContext, // amount = 60000 (NOT > 100000) ✗
        { ...mockDetectorResults, trustScore: 20 }, // trust_score = 20 (< 30) ✓
        "ALLOW" as FraudDecision,
      );

      // One condition matches → REVIEW
      expect(result.decision).toBe("REVIEW");
      expect(result.matchedRule?.name).toBe("Review high-value or low-trust");
    });

    it("should not match rule with OR operator when both conditions fail", async () => {
      // Rule: amount > 100000 OR trust_score < 30 → REVIEW
      const mockRules = [
        {
          id: "rule_1",
          name: "Review high-value or low-trust",
          condition: {
            operator: "OR",
            conditions: [
              { field: "amount", operator: ">", value: 100000 },
              { field: "trust_score", operator: "<", value: 30 },
            ],
          },
          action: "REVIEW",
          priority: 100,
          isActive: true,
        },
      ];

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            orderBy: vi.fn(() => Promise.resolve(mockRules)),
          })),
        })),
      } as any);

      const result = await applyCustomRules(
        mockOrgId,
        mockContext, // amount = 60000 (NOT > 100000) ✗
        { ...mockDetectorResults, trustScore: 50 }, // trust_score = 50 (NOT < 30) ✗
        "ALLOW" as FraudDecision,
      );

      // Both conditions fail → Keep ALLOW
      expect(result.decision).toBe("ALLOW");
      expect(result.matchedRule).toBeNull();
    });
  });

  describe("Priority Override (AC6)", () => {
    it("should override ALLOW detector decision to BLOCK when rule matches (AC6)", async () => {
      // Detector says ALLOW, rule says BLOCK
      const mockRules = [
        {
          id: "rule_1",
          name: "Block high amounts",
          condition: { field: "amount", operator: ">", value: 50000 },
          action: "BLOCK",
          priority: 100,
          isActive: true,
        },
      ];

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            orderBy: vi.fn(() => Promise.resolve(mockRules)),
          })),
        })),
      } as any);

      const result = await applyCustomRules(
        mockOrgId,
        mockContext,
        mockDetectorResults,
        "ALLOW" as FraudDecision, // Detector decision
      );

      // Rule overrides detector → BLOCK
      expect(result.decision).toBe("BLOCK");
    });

    it("should override BLOCK detector decision to REVIEW when rule matches", async () => {
      // Detector says BLOCK, rule says REVIEW
      const mockRules = [
        {
          id: "rule_1",
          name: "Review instead of blocking",
          condition: { field: "amount", operator: ">", value: 50000 },
          action: "REVIEW",
          priority: 100,
          isActive: true,
        },
      ];

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            orderBy: vi.fn(() => Promise.resolve(mockRules)),
          })),
        })),
      } as any);

      const result = await applyCustomRules(
        mockOrgId,
        mockContext,
        mockDetectorResults,
        "BLOCK" as FraudDecision, // Detector decision
      );

      // Rule overrides detector → REVIEW
      expect(result.decision).toBe("REVIEW");
    });

    it("should keep detector decision when no rules match", async () => {
      // No matching rules
      const mockRules = [
        {
          id: "rule_1",
          name: "Block very high amounts",
          condition: { field: "amount", operator: ">", value: 200000 },
          action: "BLOCK",
          priority: 100,
          isActive: true,
        },
      ];

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            orderBy: vi.fn(() => Promise.resolve(mockRules)),
          })),
        })),
      } as any);

      const result = await applyCustomRules(
        mockOrgId,
        mockContext, // amount = 60000 (NOT > 200000)
        mockDetectorResults,
        "REVIEW" as FraudDecision,
      );

      // No rule matched → Keep detector decision
      expect(result.decision).toBe("REVIEW");
      expect(result.matchedRule).toBeNull();
    });
  });

  describe("Caching (AC8)", () => {
    it("should use cached rules when available", async () => {
      // Mock cache hit
      const cachedRules = [
        {
          id: "rule_1",
          name: "Cached rule",
          condition: { field: "amount", operator: ">", value: 50000 },
          action: "BLOCK" as const,
          priority: 100,
        },
      ];

      vi.mocked(redis.get).mockResolvedValue(cachedRules);

      await applyCustomRules(
        mockOrgId,
        mockContext,
        mockDetectorResults,
        "ALLOW" as FraudDecision,
      );

      // Should use cache, not query DB
      expect(redis.get).toHaveBeenCalledWith(`custom_rules:${mockOrgId}`);
      expect(db.select).not.toHaveBeenCalled();
    });

    it("should cache rules after DB fetch", async () => {
      // Mock cache miss, DB returns rules
      vi.mocked(redis.get).mockResolvedValue(null);

      const mockRules = [
        {
          id: "rule_1",
          name: "Test rule",
          condition: { field: "amount", operator: ">", value: 50000 },
          action: "BLOCK",
          priority: 100,
          isActive: true,
        },
      ];

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            orderBy: vi.fn(() => Promise.resolve(mockRules)),
          })),
        })),
      } as any);

      await applyCustomRules(
        mockOrgId,
        mockContext,
        mockDetectorResults,
        "ALLOW" as FraudDecision,
      );

      // Should cache rules after fetching
      expect(redis.set).toHaveBeenCalledWith(
        `custom_rules:${mockOrgId}`,
        expect.any(Array),
        { ex: 300 }, // 5 min TTL
      );
    });
  });

  describe("Performance (AC8)", () => {
    it("should evaluate rules quickly (<10ms target)", async () => {
      const mockRules = Array.from({ length: 10 }, (_, i) => ({
        id: `rule_${i}`,
        name: `Rule ${i}`,
        condition: { field: "amount", operator: ">", value: 1000000 + i },
        action: "BLOCK",
        priority: 100 - i,
        isActive: true,
      }));

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            orderBy: vi.fn(() => Promise.resolve(mockRules)),
          })),
        })),
      } as any);

      const startTime = Date.now();
      await applyCustomRules(
        mockOrgId,
        mockContext,
        mockDetectorResults,
        "ALLOW" as FraudDecision,
      );
      const duration = Date.now() - startTime;

      // Should be fast (<100ms - generous limit for tests)
      expect(duration).toBeLessThan(100);
    });

    it("should enforce max 10 rules limit", async () => {
      // Mock 20 rules in DB
      const mockRules = Array.from({ length: 20 }, (_, i) => ({
        id: `rule_${i}`,
        name: `Rule ${i}`,
        condition: { field: "amount", operator: ">", value: 50000 },
        action: "BLOCK",
        priority: 100 - i,
        isActive: true,
      }));

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            orderBy: vi.fn(() => Promise.resolve(mockRules)),
          })),
        })),
      } as any);

      await applyCustomRules(
        mockOrgId,
        mockContext,
        mockDetectorResults,
        "ALLOW" as FraudDecision,
      );

      // Should cache max 10 rules (AC8)
      expect(redis.set).toHaveBeenCalledWith(
        `custom_rules:${mockOrgId}`,
        expect.arrayContaining([expect.any(Object)]),
        { ex: 300 },
      );

      const cachedRules = vi.mocked(redis.set).mock.calls[0][1] as any[];
      expect(cachedRules.length).toBeLessThanOrEqual(10);
    });
  });

  describe("Error Handling", () => {
    it("should return detector decision on error", async () => {
      // Mock DB error
      vi.mocked(db.select).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await applyCustomRules(
        mockOrgId,
        mockContext,
        mockDetectorResults,
        "REVIEW" as FraudDecision,
      );

      // Should return detector decision on error
      expect(result.decision).toBe("REVIEW");
      expect(result.matchedRule).toBeNull();
    });

    it("should handle null/undefined field values gracefully", async () => {
      const mockRules = [
        {
          id: "rule_1",
          name: "Rule with missing field",
          condition: { field: "nonexistent_field", operator: ">", value: 10 },
          action: "BLOCK",
          priority: 100,
          isActive: true,
        },
      ];

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            orderBy: vi.fn(() => Promise.resolve(mockRules)),
          })),
        })),
      } as any);

      const result = await applyCustomRules(
        mockOrgId,
        mockContext,
        mockDetectorResults,
        "ALLOW" as FraudDecision,
      );

      // Should not match (field is null) → Keep ALLOW
      expect(result.decision).toBe("ALLOW");
      expect(result.matchedRule).toBeNull();
    });
  });

  describe("Cache Invalidation", () => {
    it("should invalidate cache when called", async () => {
      await invalidateRulesCache(mockOrgId);

      expect(redis.del).toHaveBeenCalledWith(`custom_rules:${mockOrgId}`);
    });

    it("should handle cache invalidation errors gracefully", async () => {
      vi.mocked(redis.del).mockRejectedValue(new Error("Redis error"));

      // Should not throw error
      await expect(invalidateRulesCache(mockOrgId)).resolves.not.toThrow();
    });
  });
});
