import { createLogger, defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

const noisyLogPatterns = [
  /\[vite\]\s+connected/i,
  /\[vite\]\s+connecting/i,
  /\[vite\]\s+reconnecting/i,
  /\[vite\]\s+hot updated/i,
  /\[vite\]\s+page reloaded/i
]

const baseLogger = createLogger()

const filteredLogger = {
  ...baseLogger,
  info(message, options) {
    if (typeof message === 'string' && noisyLogPatterns.some((pattern) => pattern.test(message))) {
      return
    }
    baseLogger.info.call(baseLogger, message, options)
  },
  warn(message, options) {
    if (typeof message === 'string' && noisyLogPatterns.some((pattern) => pattern.test(message))) {
      return
    }
    baseLogger.warn.call(baseLogger, message, options)
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  define: {
    'process.env': {}
  },
  customLogger: filteredLogger
})
