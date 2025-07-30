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
    fonts: {
      preload: ['ja', 'en', 'zh-CN', 'zh-TW', 'ko'],
      fallbacks: {
        ja: ['Hiragino Sans', 'Yu Gothic', 'Meiryo', 'sans-serif'],
        'zh-CN': ['PingFang SC', 'Microsoft YaHei', 'SimHei', 'sans-serif'],
        'zh-TW': ['PingFang TC', 'Microsoft JhengHei', 'PMingLiU', 'sans-serif'],
        ko: ['Apple SD Gothic Neo', 'Malgun Gothic', 'Nanum Gothic', 'sans-serif'],
        en: ['Arial', 'Helvetica', 'sans-serif']
      }
    },
    translation: {
      preload: ['ja', 'en'], // Preload most common languages
      lazy: ['zh-CN', 'zh-TW', 'ko'], // Lazy load less common languages
      compression: {
        enabled: true,
        threshold: 1024, // Only compress files larger than 1KB
        format: 'gzip'
      },
      caching: {
        maxAge: 86400, // 24 hours for translation files
        immutable: false // Translation files can be updated
      }
    },
    compression: {
      gzip: true,
      brotli: true
    }
  },

  // CDN configuration for internationalization
  cdn: {
    enabled: true,
    regions: [
      { code: 'ja', region: 'asia-northeast1', primary: true },
      { code: 'en', region: 'us-central1', primary: false },
      { code: 'zh-CN', region: 'asia-east1', primary: false },
      { code: 'zh-TW', region: 'asia-east1', primary: false },
      { code: 'ko', region: 'asia-northeast1', primary: false }
    ],
    caching: {
      translation: {
        ttl: 86400, // 24 hours
        staleWhileRevalidate: 3600 // 1 hour
      },
      fonts: {
        ttl: 2592000, // 30 days
        staleWhileRevalidate: 86400 // 24 hours
      }
    },
    preload: {
      critical: ['/src/locales/ja/common.json', '/src/locales/en/common.json'],
      prefetch: [
        '/src/locales/ja/menu.json',
        '/src/locales/en/menu.json',
        '/src/locales/config/languages.json'
      ]
    }
  },

  // Internationalization-specific settings
  internationalization: {
    defaultLanguage: 'ja',
    supportedLanguages: ['ja', 'en', 'zh-CN', 'zh-TW', 'ko'],
    fallbackChain: {
      'zh-CN': ['zh-TW', 'en', 'ja'],
      'zh-TW': ['zh-CN', 'en', 'ja'],
      'ko': ['en', 'ja'],
      'en': ['ja'],
      'ja': []
    },
    detection: {
      order: ['querystring', 'localStorage', 'navigator', 'default'],
      lookupQuerystring: 'lang',
      lookupLocalStorage: 'bubblePop_language',
      caches: ['localStorage']
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
      lighthouse: true,
      i18n: {
        languageSwitchTime: true,
        translationLoadTime: true,
        fontLoadTime: true
      }
    }
  }
};

export default deployConfig;