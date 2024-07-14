/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/react-aria-menubutton-ts/',
  test: {
    environment: 'happy-dom',
    setupFiles: ['./vitest-setup.ts'],
  },
});