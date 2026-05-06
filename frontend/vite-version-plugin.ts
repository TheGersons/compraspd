import type { Plugin } from "vite";

export const BUILD_VERSION = String(Date.now());

export function versionPlugin(): Plugin {
  return {
    name: "version-json",
    apply: "build",
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "version.json",
        source: JSON.stringify({ version: BUILD_VERSION, builtAt: new Date().toISOString() }),
      });
    },
  };
}
