import { defineConfig } from "vitest/config";
import path from "path";

// Minimal config for pure-logic unit tests only — no DB, no network,
// no live Razorpay calls (see comments in each *.test.ts for why).
export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  test: {
    environment: "node",
  },
});
