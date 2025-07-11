import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { nodePolyfills } from "vite-plugin-node-polyfills"
import { resolve as pathResolve } from "path"

export default defineConfig({
  base: "/",
  plugins: [
    react(),
    // still provides Buffer, process, etc.
    nodePolyfills(),
  ],
  resolve: {
    alias: {
      // Replace every `import "fs"` with our tiny browser-safe shim
      fs: pathResolve(__dirname, "src/shims/fs.js"),
    },
  },
})
