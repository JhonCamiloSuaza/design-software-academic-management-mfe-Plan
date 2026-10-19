import { federation } from '@module-federation/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'academicManagementMfe',
      filename: 'remoteEntry.js',
      dts: false,
      exposes: {
        './App': './src/App.tsx',
        './FichasPage': './src/adapter/in/pages/FichasPage.tsx',
        './ProgramsPage': './src/adapter/in/pages/ProgramsPage.tsx',
        './CurriculumSetupPage': './src/adapter/in/pages/CurriculumSetupPage.tsx',
        './ActiveFichasWidget': './src/adapter/in/components/ActiveFichasWidget.tsx',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.3.1' },
        'react-dom': { singleton: true, requiredVersion: '^18.3.1' },
        'react-router-dom': { singleton: true, requiredVersion: '^6.26.0' },
      },
    }),
  ],
  server: {
    port: 5103,
    proxy: {
      '/api/v1': {
        // Browser code always uses the relative /api/v1 path.  This target is
        // only used by Vite's development server, so Docker can point it at
        // the academic API service without leaking an internal hostname to
        // the browser.
        target: process.env.ACADEMIC_API_PROXY_TARGET ?? 'http://localhost:8003',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.{ts,tsx}'],
    setupFiles: ['./tests/setup.ts'],
  },
});
