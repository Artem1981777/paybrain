import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    allowedHosts: ["a4296d4d632eebb0-67-220-80-242.serveousercontent.com"]
  }
})
