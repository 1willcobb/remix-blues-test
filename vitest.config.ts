/// <reference types="vitest" />
/// <reference types="vite/client" />



import mdx from "@mdx-js/rollup";
import { installGlobals } from "@remix-run/node";
import react from "@vitejs/plugin-react";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

installGlobals();

export default defineConfig({
  plugins: [mdx({
    remarkPlugins: [
      remarkFrontmatter,
      remarkMdxFrontmatter,
    ],
  }),react(), tsconfigPaths()],
  ssr: {
    noExternal: ["remix-utils"],
  },
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./test/setup-test-env.ts"],
    include: ["./app/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    watchExclude: [
      ".*\\/node_modules\\/.*",
      ".*\\/build\\/.*",
      ".*\\/postgres-data\\/.*",
    ],
  },
});
