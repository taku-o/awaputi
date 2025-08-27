/**
 * Analytics and monitoring utilities for BubblePop game
 * Handles performance tracking, error reporting, and user analytics
 */

class Analytics {
  constructor() {
    this.isEnabled = __PROD__ && __ANALYTICS_ID__;
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    
    if (this.isEnabled) {
      this.initializeAnalytics();
      this.initializeErrorTracking();
      this.initializePerformanceTracking();
    }
  }

  /**
   * Initialize Google Analytics or other analytics providers
   */
  initializeAnalytics() {
    if (__ANALYTICS_ID__ && typeof gtag !== 'undefined') {
      // Google Analytics 4
      gtag('config', __ANALYTICS_ID__, {
        page_title: 'BubblePop Game',
        page_location: window.location.href,
        custom_map: {
          custom_parameter_1: 'game_version'
        }
      });
      
      // Set custom dimensions
      gtag('config', __ANALYTICS_ID__, {
        game_version: __VERSION__,
        build_time: __BUILD_TIME__
      });
    }
  }

  /**
   * Initialize error tracking (Sentry or similar)
   */
  initializeErrorTracking() {
    if (__SENTRY_DSN__ && typeof Sentry !== 'undefined') {
      Sentry.init({
        dsn: __SENTRY_DSN__,
        environment: __PROD__ ? 'production' : 'development',
        release: __VERSION__,
        beforeSend(event) {
          // Filter out non-critical errors
          if (event.exception) {
            const error = event.exception.values[0];
            if (error && error.type === 'ChunkLoadError') {
              return null; // Don't report chunk load errors
            }
          }
          return event;
        }
      });
      
      Sentry.setTag('game.version', __VERSION__);
      Sentry.setTag('game.session', this.sessionId);
    }
  }

  /**
   * Initialize performance tracking
   */
  initializePerformanceTracking() {
    // Web Vitals tracking
    if (typeof webVitals !== 'undefined') {
      webVitals.getCLS(this.sendWebVital.bind(this));
      webVitals.getFID(this.sendWebVital.bind(this));
      webVitals.getFCP(this.sendWebVital.bind(this));
      webVitals.getLCP(this.sendWebVital.bind(this));
      webVitals.getTTFB(this.sendWebVital.bind(this));
    }

    // Custom performance metrics
    this.trackCustomMetrics();
  }

  /**
   * Track game-specific events
   */
  trackEvent(eventName, parameters = {}) {
    if (!this.isEnabled) return;

    const eventData = {
      event_category: 'game',
      event_label: eventName,
      session_id: this.sessionId,
      game_version: __VERSION__,
      ...parameters
    };

    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, eventData);
    }

    // Also log to console in development
    if (__DEV__) {
      console.log('Analytics Event:', eventName, eventData);
    }
  }

  /**
   * Track game start
   */
  trackGameStart(stageName) {
    this.trackEvent('game_start', {
      stage_name: stageName,
      timestamp: Date.now()
    });
  }

  /**
   * Track game end
   */
  trackGameEnd(stageName, score, duration, reason) {
    this.trackEvent('game_end', {
      stage_name: stageName,
      final_score: score,
      game_duration: duration,
      end_reason: reason, // 'completed', 'game_over', 'quit'
      timestamp: Date.now()
    });
  }

  /**
   * Track bubble interactions
   */
  trackBubbleInteraction(bubbleType, action, score = 0) {
    this.trackEvent('bubble_interaction', {
      bubble_type: bubbleType,
      action: action, // 'popped', 'missed', 'expired'
      score_gained: score
    });
  }

  /**
   * Track performance issues
   */
  trackPerformanceIssue(issueType, details) {
    this.trackEvent('performance_issue', {
      issue_type: issueType,
      details: JSON.stringify(details),
      user_agent: navigator.userAgent,
      timestamp: Date.now()
    });
  }

  /**
   * Track errors
   */
  trackError(error, context = '') {
    if (!this.isEnabled) return;

    const errorData = {
      error_message: error.message,
      error_stack: error.stack,
      context: context,
      session_id: this.sessionId,
      timestamp: Date.now(),
      user_agent: navigator.userAgent,
      url: window.location.href
    };

    // Send to Sentry if available
    if (typeof Sentry !== 'undefined') {
      Sentry.captureException(error, {
        tags: {
          context: context
        },
        extra: errorData
      });
    }

    // Send to Google Analytics as exception
    if (typeof gtag !== 'undefined') {
      gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        ...errorData
      });
    }
  }

  /**
   * Send Web Vitals metrics
   */
  sendWebVital(metric) {
    if (typeof gtag !== 'undefined') {
      gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        non_interaction: true
      });
    }
  }

  /**
   * Track custom performance metrics
   */
  trackCustomMetrics() {
    // Track FPS
    let frameCount = 0;
    let lastTime = performance.now();
    
    const trackFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        if (fps < 30) {
          this.trackPerformanceIssue('low_fps', { fps, timestamp: currentTime });
        }
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(trackFPS);
    };
    
    requestAnimationFrame(trackFPS);

    // Track memory usage (if available)
    if (performance.memory) {
      setInterval(() => {
        const memoryInfo = {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit
        };
        
        const usagePercent = (memoryInfo.used / memoryInfo.limit) * 100;
        
        if (usagePercent > 80) {
          this.trackPerformanceIssue('high_memory_usage', memoryInfo);
        }
      }, 30000); // Check every 30 seconds
    }
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Track page visibility changes
   */
  trackVisibilityChange() {
    document.addEventListener('visibilitychange', () => {
      this.trackEvent('visibility_change', {
        visible: !document.hidden,
        timestamp: Date.now()
      });
    });
  }

  /**
   * Track user engagement
   */
  trackEngagement() {
    let engagementTime = 0;
    let lastActiveTime = Date.now();
    let isActive = true;

    const updateEngagement = () => {
      if (isActive) {
        engagementTime += Date.now() - lastActiveTime;
      }
      lastActiveTime = Date.now();
    };

    // Track user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, () => {
        if (!isActive) {
          isActive = true;
          lastActiveTime = Date.now();
        }
      }, { passive: true });
    });

    // Track inactivity
    setInterval(() => {
      if (Date.now() - lastActiveTime > 30000) { // 30 seconds of inactivity
        isActive = false;
      }
      updateEngagement();
    }, 1000);

    // Send engagement data periodically
    setInterval(() => {
      if (engagementTime > 0) {
        this.trackEvent('user_engagement', {
          engagement_time: engagementTime,
          session_duration: Date.now() - this.startTime
        });
        engagementTime = 0;
      }
    }, 60000); // Every minute
  }
}

// Create singleton instance
const analytics = new Analytics();

export default analytics;