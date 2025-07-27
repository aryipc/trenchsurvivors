import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // We need to polyfill Buffer and other Node.js built-ins for the Solana libraries to work in the browser.
      protocolImports: true,
    }),
  ],
})
