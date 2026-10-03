import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@/": `${root}/`,
      // `server-only` throws outside the React Server environment; tests run server code directly.
      "server-only": `${root}/test/server-only-stub.ts`,
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    include: ["__tests__/**/*.test.{ts,tsx}"],
    css: false,
  },
});
