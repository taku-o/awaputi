/**
 * Deployment configuration for BubblePop game
 * Supports multiple deployment targets and environments
 */

export const deployConfig = {
  // Environment configurations
  environments: {
    development: {
      name: 'Development',
      url: 'http://localhost:3000',
      buildCommand: 'npm run build:dev',
      outputDir: 'dist',
      analytics: false,
      sourcemap: true
    },
    staging: {
      name: 'Staging',
      url: 'https://staging-bubblepop.netlify.app',
      buildCommand: 'npm run build:staging',
      outputDir: 'dist',
      analytics: true,
      sourcemap: false
    },
    production: {
      name: 'Production',
      url: 'https://bubblepop.netlify.app',
      buildCommand: 'npm run build',
      outputDir: 'dist',
      analytics: true,
      sourcemap: false,
      optimization: {
        minify: true,
        compress: true,
        treeshake: true
      }
    }
  },

  // Deployment targets
  targets: {
    netlify: {
      name: 'Netlify',
      type: 'static',
      config: {
        build: {
          command: 'npm run build',
          publish: 'dist'
        },
        redirects: [
          {
            from: '/*',
            to: '/index.html',
            status: 200
          }
        ],
        headers: [
          {
            for: '/assets/*',
            values: {
              'Cache-Control': 'public, max-age=31536000, immutable'
            }
          },
          {
            for: '/*.js',
            values: {
              'Cache-Control': 'public, max-age=31536000, immutable'
            }
          },
          {
            for: '/*.css',
            values: {
              'Cache-Control': 'public, max-age=31536000, immutable'
            }
          },
          {
            for: '/index.html',
            values: {
              'Cache-Control': 'public, max-age=0, must-revalidate'
            }
          }
        ]
      }
    },
    vercel: {
      name: 'Vercel',
      type: 'static',
      config: {
        buildCommand: 'npm run build',
        outputDirectory: 'dist',
        framework: 'vite'
      }
    },
    githubPages: {
      name: 'GitHub Pages',
      type: 'static',
      config: {
        buildCommand: 'npm run build:gh-pages',
        outputDirectory: 'dist',
        basePath: '/bubble-pop-web-game'
      }
    }
  },

  // Asset optimization settings
  assets: {
    images: {
      formats: ['webp', 'avif', 'png', 'jpg'],
      quality: 85,
      progressive: true
    },
    audio: {
      formats: ['webm', 'ogg', 'mp3'],
      quality: 'high'
    },
    compression: {
      gzip: true,
      brotli: true
    }
  },

  // Monitoring and analytics
  monitoring: {
    sentry: {
      enabled: true,
      dsn: process.env.VITE_SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development'
    },
    analytics: {
      google: {
        enabled: true,
        trackingId: process.env.VITE_GA_TRACKING_ID
      },
      plausible: {
        enabled: false,
        domain: process.env.VITE_PLAUSIBLE_DOMAIN
      }
    },
    performance: {
      webVitals: true,
      lighthouse: true
    }
  }
};

export default deployConfig;