import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/constants/index.ts",
    "src/models/index.ts",
    "src/module/index.ts",
    "src/schema/index.ts",
    "src/service/index.ts",
  ],
  format: ["esm"],
  target: "node24",
  platform: "node",
  tsconfig: "tsconfig.build.json",
  splitting: false,
  bundle: true,
  shims: true,
  clean: true,
  outDir: "dist",
  outExtension: () => ({ js: ".mjs" }),
  esbuildOptions(options) {
    options.platform = "node";
    options.external = [
      "node:*",
      "net",
      "http",
      "https",
      "tls",
      "crypto",
      "path",
      "fs",
      "os",
      "url",
      "child_process",
      "@nestjs/common",
      "@nestjs/swagger",
      "joi",
      "socket.io",
    ];
  },
  treeshake: true,
  dts: true,
});
