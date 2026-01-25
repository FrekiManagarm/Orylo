import { defineConfig } from "vitest/config";
import path from "path";

/**
 * Vitest Integration Test Configuration
 * 
 * Story 3.6 AC1: Integration test setup with test database
 * 
 * Usage: vitest --config vitest.config.integration.ts
 */
export default defineConfig({
  test: {
    name: "integration",
    environment: "node",
    setupFiles: ["./test/setup-integration.ts"],
    include: ["**/*.integration.test.ts"],
    testTimeout: 30000, // 30s for DB operations
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["app/api/**/*.ts"],
      exclude: ["**/__tests__/**", "**/*.test.ts", "**/*.spec.ts"],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 60,
        statements: 60,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "@db": path.resolve(__dirname, "../../packages/database"),
    },
  },
});
