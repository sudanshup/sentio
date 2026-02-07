import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                    'editor': ['@tiptap/react', '@tiptap/starter-kit', '@tiptap/extension-placeholder'],
                    'charts': ['recharts'],
                    'ui': ['framer-motion', 'lucide-react']
                }
            }
        },
        chunkSizeWarningLimit: 1000,
        sourcemap: false
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
})
