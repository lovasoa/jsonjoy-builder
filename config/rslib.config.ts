import { pluginReact } from "@rsbuild/plugin-react";
import { defineConfig } from "@rslib/core";

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: {
      index: ["./src/**"],
    },
    tsconfigPath: "./src/tsconfig.json",
  },
  server: {
    publicDir: false,
  },
  lib: [
    {
      bundle: false,
      dts: {
        build: false,
        bundle: {
          bundledPackages: [],
        },
      },
      format: "esm",
    },
  ],
  output: {
    target: "web",
  },
});
