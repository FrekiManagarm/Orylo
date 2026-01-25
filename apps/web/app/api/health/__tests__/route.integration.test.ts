import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../route";

// Mock modules
const mockDbExecute = vi.fn();
vi.mock("@/lib/db", () => ({
  db: {
    execute: mockDbExecute,
  },
}));

const mockRedisPing = vi.fn();
vi.mock("@/lib/redis", () => ({
  redis: {
    ping: mockRedisPing,
  },
}));

describe("GET /api/health", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 200 when all services healthy", async () => {
    mockDbExecute.mockResolvedValue(undefined);
    mockRedisPing.mockResolvedValue("PONG");

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.status).toBe("healthy");
    expect(json.checks.database).toBe(true);
    expect(json.checks.redis).toBe(true);
    expect(json.timestamp).toBeDefined();
    expect(json.version).toBeDefined();
  });

  it("should return 503 when database is down", async () => {
    mockDbExecute.mockRejectedValue(new Error("Database connection failed"));
    mockRedisPing.mockResolvedValue("PONG");

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(503);
    expect(json.status).toBe("unhealthy");
    expect(json.checks.database).toBe(false);
    expect(json.checks.redis).toBe(true);
  });

  it("should return 503 when Redis is down", async () => {
    mockDbExecute.mockResolvedValue(undefined);
    mockRedisPing.mockRejectedValue(new Error("Redis connection failed"));

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(503);
    expect(json.status).toBe("unhealthy");
    expect(json.checks.database).toBe(true);
    expect(json.checks.redis).toBe(false);
  });

  it("should return 503 when both services are down", async () => {
    mockDbExecute.mockRejectedValue(new Error("Database failed"));
    mockRedisPing.mockRejectedValue(new Error("Redis failed"));

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(503);
    expect(json.status).toBe("unhealthy");
    expect(json.checks.database).toBe(false);
    expect(json.checks.redis).toBe(false);
  });
});
