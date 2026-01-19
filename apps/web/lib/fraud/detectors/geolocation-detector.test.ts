import { describe, it, expect, vi, beforeEach } from "vitest";
import { GeolocationDetector } from "./geolocation-detector";
import type { FraudDetectionContext } from "@orylo/fraud-engine";
import { FraudScoreSeverity } from "@orylo/fraud-engine";
import { Reader } from "@maxmind/geoip2-node";

// Mock MaxMind Reader
vi.mock("@maxmind/geoip2-node", () => ({
  Reader: {
    open: vi.fn(),
  },
}));

describe("GeolocationDetector", () => {
  let detector: GeolocationDetector;
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
    detector = new GeolocationDetector();
    vi.clearAllMocks();
  });

  describe("Initialization", () => {
    it("should initialize successfully with valid database (AC2)", async () => {
      const mockReader = {
        country: vi.fn(),
      };
      vi.mocked(Reader.open).mockResolvedValue(mockReader as any);

      await detector.init();

      expect(Reader.open).toHaveBeenCalledWith(
        expect.stringContaining("GeoLite2-Country.mmdb")
      );
    });

    it("should handle missing database gracefully (AC6)", async () => {
      vi.mocked(Reader.open).mockRejectedValue(
        new Error("ENOENT: no such file")
      );

      await detector.init();

      // Should not throw, just log warning
      const result = await detector.execute(mockContext);
      expect(result).toBeNull(); // Detector disabled
    });
  });

  describe("Country Matching Logic (AC3, AC7)", () => {
    beforeEach(async () => {
      const mockReader = {
        country: vi.fn(),
      };
      vi.mocked(Reader.open).mockResolvedValue(mockReader as any);
      await detector.init();
    });

    it("should return LOW risk (+0) when countries match (AC3)", async () => {
      const mockReader = (detector as any).reader;
      mockReader.country.mockReturnValue({
        country: { isoCode: "FR" },
        traits: { isAnonymousProxy: false, isAnonymousVpn: false },
      });

      const result = await detector.execute({
        ...mockContext,
        customerIp: "1.2.3.4",
        cardCountry: "FR",
      });

      expect(result).not.toBeNull();
      expect(result!.score.value).toBe(0);
      expect(result!.score.severity).toBe(FraudScoreSeverity.LOW);
      expect(result!.details?.mismatch).toBe(false);
      expect(result!.details?.ipCountry).toBe("FR");
      expect(result!.details?.cardCountry).toBe("FR");
    });

    it("should return HIGH risk (+30) when countries mismatch (AC3)", async () => {
      const mockReader = (detector as any).reader;
      mockReader.country.mockReturnValue({
        country: { isoCode: "FR" },
        traits: { isAnonymousProxy: false, isAnonymousVpn: false },
      });

      const result = await detector.execute({
        ...mockContext,
        customerIp: "1.2.3.4", // France
        cardCountry: "US", // United States
      });

      expect(result).not.toBeNull();
      expect(result!.score.value).toBe(30);
      expect(result!.score.severity).toBe(FraudScoreSeverity.HIGH);
      expect(result!.details?.mismatch).toBe(true);
      expect(result!.details?.ipCountry).toBe("FR");
      expect(result!.details?.cardCountry).toBe("US");
    });
  });

  describe("VPN Detection (AC4, AC7)", () => {
    beforeEach(async () => {
      const mockReader = {
        country: vi.fn(),
      };
      vi.mocked(Reader.open).mockResolvedValue(mockReader as any);
      await detector.init();
    });

    it("should return MEDIUM risk (+15) for VPN with country mismatch (AC4)", async () => {
      const mockReader = (detector as any).reader;
      mockReader.country.mockReturnValue({
        country: { isoCode: "FR" },
        traits: {
          isAnonymousProxy: true, // VPN detected
          isAnonymousVpn: false,
        },
      });

      const result = await detector.execute({
        ...mockContext,
        customerIp: "1.2.3.4", // France (VPN)
        cardCountry: "US", // United States
      });

      expect(result).not.toBeNull();
      expect(result!.score.value).toBe(15); // Lower score for VPN
      expect(result!.score.severity).toBe(FraudScoreSeverity.MEDIUM);
      expect(result!.details?.mismatch).toBe(true);
      expect(result!.details?.vpnDetected).toBe(true);
    });

    it("should detect VPN via isAnonymousVpn flag (AC4)", async () => {
      const mockReader = (detector as any).reader;
      mockReader.country.mockReturnValue({
        country: { isoCode: "FR" },
        traits: {
          isAnonymousProxy: false,
          isAnonymousVpn: true, // VPN detected
        },
      });

      const result = await detector.execute({
        ...mockContext,
        customerIp: "1.2.3.4",
        cardCountry: "US",
      });

      expect(result).not.toBeNull();
      expect(result!.score.value).toBe(15);
      expect(result!.details?.vpnDetected).toBe(true);
    });

    it("should return LOW risk (+0) for VPN with matching countries", async () => {
      const mockReader = (detector as any).reader;
      mockReader.country.mockReturnValue({
        country: { isoCode: "FR" },
        traits: {
          isAnonymousProxy: true, // VPN detected
          isAnonymousVpn: false,
        },
      });

      const result = await detector.execute({
        ...mockContext,
        customerIp: "1.2.3.4", // France (VPN)
        cardCountry: "FR", // France
      });

      expect(result).not.toBeNull();
      expect(result!.score.value).toBe(0); // No penalty if countries match
      expect(result!.details?.mismatch).toBe(false);
      expect(result!.details?.vpnDetected).toBe(true);
    });
  });

  describe("Metadata (AC5)", () => {
    beforeEach(async () => {
      const mockReader = {
        country: vi.fn(),
      };
      vi.mocked(Reader.open).mockResolvedValue(mockReader as any);
      await detector.init();
    });

    it("should return metadata with ipCountry, cardCountry, mismatch (AC5)", async () => {
      const mockReader = (detector as any).reader;
      mockReader.country.mockReturnValue({
        country: { isoCode: "FR" },
        traits: { isAnonymousProxy: false, isAnonymousVpn: false },
      });

      const result = await detector.execute({
        ...mockContext,
        customerIp: "1.2.3.4",
        cardCountry: "US",
      });

      expect(result).not.toBeNull();
      expect(result!.details).toHaveProperty("ipCountry", "FR");
      expect(result!.details).toHaveProperty("cardCountry", "US");
      expect(result!.details).toHaveProperty("mismatch", true);
      expect(result!.details).toHaveProperty("vpnDetected", false);
    });
  });

  describe("Missing Data Handling (AC6)", () => {
    beforeEach(async () => {
      const mockReader = {
        country: vi.fn(),
      };
      vi.mocked(Reader.open).mockResolvedValue(mockReader as any);
      await detector.init();
    });

    it("should return null for missing customerIp (AC6)", async () => {
      const result = await detector.execute({
        ...mockContext,
        customerIp: null,
        cardCountry: "FR",
      });

      expect(result).toBeNull();
    });

    it("should return null for missing cardCountry (AC6)", async () => {
      const result = await detector.execute({
        ...mockContext,
        customerIp: "1.2.3.4",
        cardCountry: null,
      });

      expect(result).toBeNull();
    });

    it("should return null for IP not in database (AC6)", async () => {
      const mockReader = (detector as any).reader;
      mockReader.country.mockReturnValue({
        country: null, // IP not found
        traits: {},
      });

      const result = await detector.execute({
        ...mockContext,
        customerIp: "1.2.3.4",
        cardCountry: "FR",
      });

      expect(result).toBeNull();
    });
  });

  describe("Error Handling", () => {
    beforeEach(async () => {
      const mockReader = {
        country: vi.fn(),
      };
      vi.mocked(Reader.open).mockResolvedValue(mockReader as any);
      await detector.init();
    });

    it("should return null on MaxMind lookup error (graceful degradation)", async () => {
      const mockReader = (detector as any).reader;
      mockReader.country.mockImplementation(() => {
        throw new Error("MaxMind lookup failed");
      });

      const result = await detector.execute(mockContext);

      expect(result).toBeNull();
    });

    it("should log error when lookup fails", async () => {
      const consoleSpy = vi.spyOn(console, "error");
      const mockReader = (detector as any).reader;
      mockReader.country.mockImplementation(() => {
        throw new Error("MaxMind lookup failed");
      });

      await detector.execute(mockContext);

      expect(consoleSpy).toHaveBeenCalledWith(
        "[geolocation_detector_error]",
        expect.objectContaining({
          paymentIntentId: mockContext.paymentIntentId,
          error: "MaxMind lookup failed",
        })
      );
    });
  });

  describe("Performance (AC6)", () => {
    beforeEach(async () => {
      const mockReader = {
        country: vi.fn(),
      };
      vi.mocked(Reader.open).mockResolvedValue(mockReader as any);
      await detector.init();
    });

    it("should complete execution quickly (<5ms target)", async () => {
      const mockReader = (detector as any).reader;
      mockReader.country.mockReturnValue({
        country: { isoCode: "FR" },
        traits: { isAnonymousProxy: false, isAnonymousVpn: false },
      });

      const startTime = Date.now();
      await detector.execute(mockContext);
      const duration = Date.now() - startTime;

      // AC6: Target <5ms (may be higher in CI, so using generous limit)
      expect(duration).toBeLessThan(50);
    });

    it("should log warning if execution is slow (>5ms)", async () => {
      const mockReader = (detector as any).reader;
      // Mock slow lookup (simulate 10ms delay)
      mockReader.country.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve({
                  country: { isoCode: "FR" },
                  traits: { isAnonymousProxy: false, isAnonymousVpn: false },
                }),
              10
            );
          })
      );

      const consoleSpy = vi.spyOn(console, "warn");

      await detector.execute(mockContext);

      // Should log slow query warning
      expect(consoleSpy).toHaveBeenCalledWith(
        "[geolocation_detector_slow]",
        expect.objectContaining({
          paymentIntentId: mockContext.paymentIntentId,
          threshold: 5,
        })
      );
    });
  });

  describe("Detector Interface Implementation", () => {
    it("should have correct detector properties", () => {
      expect(detector.id).toBe("geolocation-detector");
      expect(detector.name).toBe("Geolocation Detector");
      expect(detector.description).toContain("country");
      expect(detector.severity).toBe(30);
    });

    it("should return FraudDetectionResult with correct structure", async () => {
      const mockReader = {
        country: vi.fn().mockReturnValue({
          country: { isoCode: "FR" },
          traits: { isAnonymousProxy: false, isAnonymousVpn: false },
        }),
      };
      vi.mocked(Reader.open).mockResolvedValue(mockReader as any);
      await detector.init();

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
    beforeEach(async () => {
      const mockReader = {
        country: vi.fn(),
      };
      vi.mocked(Reader.open).mockResolvedValue(mockReader as any);
      await detector.init();
    });

    it("should handle French customer with French card (legitimate)", async () => {
      const mockReader = (detector as any).reader;
      mockReader.country.mockReturnValue({
        country: { isoCode: "FR" },
        traits: { isAnonymousProxy: false, isAnonymousVpn: false },
      });

      const result = await detector.execute({
        ...mockContext,
        customerIp: "193.251.60.1", // France
        cardCountry: "FR",
      });

      expect(result!.score.value).toBe(0); // No risk
      expect(result!.details?.mismatch).toBe(false);
    });

    it("should flag US IP with Nigerian card (high risk)", async () => {
      const mockReader = (detector as any).reader;
      mockReader.country.mockReturnValue({
        country: { isoCode: "US" },
        traits: { isAnonymousProxy: false, isAnonymousVpn: false },
      });

      const result = await detector.execute({
        ...mockContext,
        customerIp: "8.8.8.8", // United States
        cardCountry: "NG", // Nigeria
      });

      expect(result!.score.value).toBe(30); // HIGH risk
      expect(result!.details?.mismatch).toBe(true);
    });

    it("should handle traveling customer with VPN (medium risk)", async () => {
      const mockReader = (detector as any).reader;
      mockReader.country.mockReturnValue({
        country: { isoCode: "JP" }, // Japan
        traits: { isAnonymousProxy: true, isAnonymousVpn: false },
      });

      const result = await detector.execute({
        ...mockContext,
        customerIp: "1.2.3.4",
        cardCountry: "FR", // French card
      });

      expect(result!.score.value).toBe(15); // MEDIUM risk (VPN exception)
      expect(result!.details?.vpnDetected).toBe(true);
      expect(result!.details?.mismatch).toBe(true);
    });
  });
});
