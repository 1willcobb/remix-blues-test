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
  plugins: [
    {
      enforce: "pre",
      ...mdx({
        jsxImportSource: "react", // Ensures that React is automatically handled
        remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
      }),
    },
    react({
      include: "**/*.{jsx,js,mdx,md,tsx,ts}", // Includes all relevant file extensions
    }),
    tsconfigPaths(),
  ],
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
