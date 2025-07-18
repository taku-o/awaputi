/**
 * Vite configuration for BubblePop game
 */

import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Base public path
  base: './',
  
  // Build configuration
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    sourcemap: true,
    
    // Rollup options
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        test: resolve(__dirname, 'test.html'),
        'test-compatibility': resolve(__dirname, 'test-compatibility.html'),
        'test-error-handler': resolve(__dirname, 'test-error-handler.html')
      },
      
      output: {
        // Manual chunks for better caching
        manualChunks: {
          'game-core': [
            './src/core/GameEngine.js',
            './src/core/PlayerData.js',
            './src/core/SceneManager.js'
          ],
          'game-managers': [
            './src/managers/BubbleManager.js',
            './src/managers/ScoreManager.js'
          ],
          'game-effects': [
            './src/effects/EffectManager.js',
            './src/effects/ParticleManager.js',
            './src/audio/AudioManager.js'
          ],
          'game-utils': [
            './src/utils/ObjectPool.js',
            './src/utils/PerformanceOptimizer.js',
            './src/utils/RenderOptimizer.js',
            './src/utils/MemoryManager.js'
          ]
        }
      }
    },
    
    // Terser options for minification
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  
  // Development server configuration
  server: {
    port: 3000,
    host: true,
    open: true,
    cors: true
  },
  
  // Preview server configuration
  preview: {
    port: 4173,
    host: true
  },
  
  // Asset handling
  assetsInclude: ['**/*.wav', '**/*.mp3', '**/*.ogg'],
  
  // Define global constants
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0')
  },
  
  // CSS configuration
  css: {
    devSourcemap: true
  },
  
  // Optimization
  optimizeDeps: {
    include: []
  },
  
  // Test configuration (for Vitest if we switch to it)
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'dist/',
        '**/*.test.js'
      ]
    }
  }
});