import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    // Force inline-bundling of ESM-only CSS deps pulled in by jsdom
    server: {
      deps: {
        inline: [
          '@csstools/css-calc',
          '@csstools/css-color-4',
          '@csstools/css-parser-algorithms',
          '@csstools/css-tokenizer',
          '@asamuzakjp/css-color',
        ],
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: [
        'src/context/AuthContext.tsx',
        'src/lib/api.ts',
        'src/context/DataContext.tsx',
        'src/context/ContentContext.tsx',
        'src/context/TaskContext.tsx',
      ],
      all: true,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
