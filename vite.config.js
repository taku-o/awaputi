/**
 * Vite configuration for BubblePop game
 * Optimized for production deployment with asset optimization and code splitting
 */

import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';
  
  return {
    // Base public path - configurable for different deployment environments
    base: env.VITE_BASE_PATH || './',
    
    // Build configuration
    build: {
      target: ['es2015', 'chrome58', 'firefox57', 'safari11'],
      outDir: 'dist',
      assetsDir: 'assets',
      minify: isProduction ? 'terser' : false,
      sourcemap: isProduction ? false : true,
      
      // Asset optimization
      assetsInlineLimit: 4096, // 4kb - inline small assets as base64
      chunkSizeWarningLimit: 1000, // Warn for chunks larger than 1MB
      
      // Rollup options for advanced bundling
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          // Exclude test files from production build
          ...(isProduction ? {} : {
            test: resolve(__dirname, 'test.html'),
            'test-compatibility': resolve(__dirname, 'test-compatibility.html'),
            'test-error-handler': resolve(__dirname, 'test-error-handler.html')
          })
        },
        
        output: {
          // Optimized chunk naming for better caching
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];
            if (/\.(mp3|wav|ogg)$/i.test(assetInfo.name)) {
              return `assets/audio/[name]-[hash].${ext}`;
            }
            if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(assetInfo.name)) {
              return `assets/images/[name]-[hash].${ext}`;
            }
            if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
              return `assets/fonts/[name]-[hash].${ext}`;
            }
            return `assets/[name]-[hash].${ext}`;
          },
          
          // Advanced code splitting strategy
          manualChunks: (id) => {
            // Vendor libraries
            if (id.includes('node_modules')) {
              return 'vendor';
            }
            
            // Game core systems
            if (id.includes('/src/core/')) {
              return 'game-core';
            }
            
            // Game managers
            if (id.includes('/src/managers/') || id.includes('/src/bubbles/')) {
              return 'game-managers';
            }
            
            // Effects and audio
            if (id.includes('/src/effects/') || id.includes('/src/audio/')) {
              return 'game-effects';
            }
            
            // UI components
            if (id.includes('/src/ui/') || id.includes('/src/scenes/')) {
              return 'game-ui';
            }
            
            // Utilities
            if (id.includes('/src/utils/')) {
              return 'game-utils';
            }
          }
        }
      },
      
      // Enhanced Terser options for production
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: isProduction,
          pure_funcs: isProduction ? ['console.log', 'console.info', 'console.debug'] : [],
          passes: 2
        },
        mangle: {
          safari10: true
        },
        format: {
          comments: false
        }
      },
      
      // CSS code splitting
      cssCodeSplit: true,
      
      // Report compressed file sizes
      reportCompressedSize: true,
      
      // Emit manifest for deployment tools
      manifest: true
    },
    
    // Development server configuration
    server: {
      port: parseInt(env.VITE_DEV_PORT) || 3000,
      host: env.VITE_DEV_HOST || true,
      open: !env.CI, // Don't auto-open in CI environments
      cors: true,
      // Enable HTTP/2 for better performance
      https: env.VITE_HTTPS === 'true' ? true : false,
      // Proxy configuration for API calls (if needed in future)
      proxy: {
        // '/api': {
        //   target: env.VITE_API_URL || 'http://localhost:8080',
        //   changeOrigin: true,
        //   rewrite: (path) => path.replace(/^\/api/, '')
        // }
      }
    },
    
    // Preview server configuration
    preview: {
      port: parseInt(env.VITE_PREVIEW_PORT) || 4173,
      host: env.VITE_PREVIEW_HOST || true,
      https: env.VITE_HTTPS === 'true' ? true : false
    },
    
    // Enhanced asset handling
    assetsInclude: [
      '**/*.wav', '**/*.mp3', '**/*.ogg', '**/*.webm',
      '**/*.woff', '**/*.woff2', '**/*.eot', '**/*.ttf', '**/*.otf'
    ],
    
    // Define global constants for runtime optimization
    define: {
      __DEV__: JSON.stringify(!isProduction),
      __PROD__: JSON.stringify(isProduction),
      __VERSION__: JSON.stringify(env.npm_package_version || '1.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __ANALYTICS_ID__: JSON.stringify(env.VITE_ANALYTICS_ID || ''),
      __SENTRY_DSN__: JSON.stringify(env.VITE_SENTRY_DSN || '')
    },
    
    // CSS configuration with optimization
    css: {
      devSourcemap: !isProduction,
      preprocessorOptions: {
        // Add global CSS variables if needed
        css: {
          additionalData: `
            :root {
              --build-version: "${env.npm_package_version || '1.0.0'}";
            }
          `
        }
      },
      // PostCSS plugins for production optimization
      postcss: isProduction ? {
        plugins: [
          // Add autoprefixer and cssnano for production
          // These would need to be installed separately
        ]
      } : undefined
    },
    
    // Dependency optimization
    optimizeDeps: {
      include: [
        // Pre-bundle these dependencies for faster dev server startup
      ],
      exclude: [
        // Exclude these from pre-bundling
      ]
    },
    
    // Environment variables configuration
    envPrefix: ['VITE_', 'BUBBLE_'],
    
    // Plugin configuration
    plugins: [
      // Add plugins for production optimization
      ...(isProduction ? [
        // Could add plugins like:
        // - vite-plugin-pwa for PWA support
        // - vite-plugin-windicss for CSS optimization
        // - @vitejs/plugin-legacy for legacy browser support
      ] : [])
    ],
    
    // Worker configuration for web workers
    // worker: {
    //   format: 'es',
    //   plugins: []
    // },
    
    // Test configuration (Vitest integration)
    test: {
      environment: 'jsdom',
      setupFiles: ['./tests/setup.js'],
      globals: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        exclude: [
          'node_modules/',
          'tests/',
          'dist/',
          '**/*.test.js',
          '**/*.spec.js',
          'vite.config.js',
          'jest.config.js',
          'playwright.config.js'
        ],
        thresholds: {
          global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
          }
        }
      }
    }
  };
});