import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    fileParallelism: false,
    hookTimeout: 30000,
    testTimeout: 30000,
    globalSetup: ["tests/globalSetup.ts"],
    env: {
      // Isolated test database so tests never touch dev data.
      DATABASE_URL: "file:./test.db",
    },
  },
});
