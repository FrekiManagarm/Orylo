import {
  IDetector,
  FraudDetectionContext,
  FraudDetectionResult,
  FraudScoreSeverity,
  DetectorIdSchema,
} from "@orylo/fraud-engine";
import { Reader } from "@maxmind/geoip2-node";
import path from "path";

/**
 * Geolocation Detector
 * 
 * Detects cross-border fraud by comparing IP country vs card country
 * 
 * AC1: Extract card country from payment intent billing details
 * AC2: Lookup IP → country via MaxMind GeoIP2 database (local, no API)
 * AC3: Mismatch → HIGH (+30), match → LOW (+0)
 * AC4: VPN detected → MEDIUM (+15) instead of HIGH (avoid false positives)
 * AC5: Return metadata: {ipCountry, cardCountry, mismatch}
 * AC6: Performance <5ms (local DB lookup)
 */
export class GeolocationDetector implements IDetector {
  readonly id = DetectorIdSchema.parse("geolocation-detector");
  readonly name = "Geolocation Detector";
  readonly description =
    "Flags mismatches between customer IP country and card billing country";
  readonly severity = 30; // Base score for HIGH risk

  private reader: Reader | null = null;
  private initError: Error | null = null;

  /**
   * Initialize detector - Load MaxMind database
   * 
   * AC2: Load GeoLite2-Country.mmdb file
   * Optional init() called by FraudDetectionEngine
   */
  async init(): Promise<void> {
    try {
      // Path to MaxMind database file
      const dbPath = path.join(
        process.cwd(),
        "apps/web/lib/fraud/data/GeoLite2-Country.mmdb"
      );

      console.info("[geolocation_detector_init]", { dbPath });

      // Load MaxMind reader (throws if file not found)
      this.reader = await Reader.open(dbPath);

      console.info("[geolocation_detector_init_success]", {
        databaseType: "GeoLite2-Country",
      });
    } catch (error) {
      // AC6: Graceful degradation if database not available
      this.initError = error as Error;
      console.warn("[geolocation_detector_init_failed]", {
        error: error instanceof Error ? error.message : "Unknown error",
        message:
          "Geolocation detector disabled. Download GeoLite2-Country.mmdb from MaxMind.",
      });
    }
  }

  /**
   * Execute geolocation detection
   * 
   * @param context - Fraud detection context with IP and card data
   * @returns Detection result or null if error/missing data
   */
  async execute(
    context: FraudDetectionContext
  ): Promise<FraudDetectionResult | null> {
    const startTime = Date.now();

    // AC2: Check if database loaded
    if (!this.reader) {
      console.warn("[geolocation_detector_disabled]", {
        paymentIntentId: context.paymentIntentId,
        reason: "MaxMind database not loaded",
      });
      return null;
    }

    // AC1: Extract card country and customer IP
    const cardCountry = context.cardCountry;
    const customerIp = context.customerIp;

    // AC6: Handle missing data gracefully
    if (!cardCountry || !customerIp) {
      console.warn("[geolocation_detector_missing_data]", {
        paymentIntentId: context.paymentIntentId,
        hasCardCountry: !!cardCountry,
        hasCustomerIp: !!customerIp,
      });
      return null;
    }

    try {
      // AC2: Lookup IP country via MaxMind
      const response = this.reader.country(customerIp);
      const ipCountry = response.country?.isoCode;

      if (!ipCountry) {
        console.warn("[geolocation_detector_ip_not_found]", {
          paymentIntentId: context.paymentIntentId,
          customerIp,
        });
        return null;
      }

      // AC4: Detect VPN/Proxy
      const isVpn =
        response.traits?.isAnonymousProxy ||
        response.traits?.isAnonymousVpn ||
        false;

      // AC3: Compare IP country vs card country
      const mismatch = ipCountry !== cardCountry;

      // Calculate risk score
      let score = 0;
      let severity = FraudScoreSeverity.LOW;
      let reason = "";

      if (mismatch) {
        if (isVpn) {
          // AC4: VPN exception - lower score to avoid false positives
          score = 15;
          severity = FraudScoreSeverity.MEDIUM;
          reason = `IP country (${ipCountry}) ≠ card country (${cardCountry}), VPN detected`;
        } else {
          // AC3: High risk - country mismatch
          score = 30;
          severity = FraudScoreSeverity.HIGH;
          reason = `IP country (${ipCountry}) ≠ card country (${cardCountry})`;
        }
      } else {
        // AC3: Low risk - countries match
        score = 0;
        severity = FraudScoreSeverity.LOW;
        reason = `IP and card countries match (${ipCountry})`;
      }

      // AC6: Log if slow (>5ms)
      const latency = Date.now() - startTime;
      if (latency > 5) {
        console.warn("[geolocation_detector_slow]", {
          paymentIntentId: context.paymentIntentId,
          latencyMs: latency,
          threshold: 5,
        });
      }

      console.info("[geolocation_detector_executed]", {
        paymentIntentId: context.paymentIntentId,
        ipCountry,
        cardCountry,
        mismatch,
        isVpn,
        score,
        latencyMs: latency,
      });

      // AC5: Return result with metadata
      return {
        detectorId: this.id,
        score: {
          value: score,
          severity,
          reason,
          detectorId: this.id,
        },
        details: {
          ipCountry,
          cardCountry,
          mismatch,
          vpnDetected: isVpn,
          latencyMs: latency,
        },
      };
    } catch (error) {
      // AC6: Graceful degradation on lookup error
      console.error("[geolocation_detector_error]", {
        paymentIntentId: context.paymentIntentId,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      // Return null to skip detector (don't block detection)
      return null;
    }
  }
}
