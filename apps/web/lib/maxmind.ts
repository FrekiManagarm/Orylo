/**
 * MaxMind GeoIP Utility
 * 
 * Story 3.4 AC4: Self-hosted MaxMind GeoIP (no external API calls)
 * 
 * This is a utility wrapper. The actual GeoIP lookup is done in
 * geolocation-detector.ts which already uses self-hosted database.
 * 
 * Installation: MaxMind database file required
 * Download GeoLite2-City.mmdb from MaxMind and place in:
 * apps/web/lib/fraud/data/GeoLite2-City.mmdb
 */

import { Reader } from "@maxmind/geoip2-node";
import path from "path";

let geoIPReader: Reader | null = null;

/**
 * Initialize MaxMind GeoIP database
 * 
 * AC4: Loads local database file (no external API calls)
 */
export async function initMaxMind(): Promise<void> {
  if (geoIPReader) {
    return; // Already initialized
  }

  try {
    const dbPath = path.join(
      process.cwd(),
      "apps/web/lib/fraud/data/GeoLite2-City.mmdb"
    );

    geoIPReader = await Reader.open(dbPath);
    console.log("[MaxMind] GeoIP database loaded");
  } catch (error) {
    console.error("[MaxMind] Failed to load database:", error);
    console.warn(
      "[MaxMind] Download GeoLite2-City.mmdb from MaxMind and place in apps/web/lib/fraud/data/"
    );
  }
}

/**
 * Get geo location from IP address
 * 
 * AC4: Self-hosted lookup (no external API call)
 * Target: <100ms
 */
export function getGeoLocation(ipAddress: string): {
  country: string;
  city?: string;
} | null {
  if (!geoIPReader) {
    console.error("[MaxMind] Database not initialized");
    return null;
  }

  try {
    const result = geoIPReader.city(ipAddress);
    if (!result) {
      return null;
    }

    return {
      country: result.country?.isoCode || "UNKNOWN",
      city: result.city?.names?.en,
    };
  } catch (error) {
    console.error("[MaxMind] Lookup failed:", error);
    return null;
  }
}
