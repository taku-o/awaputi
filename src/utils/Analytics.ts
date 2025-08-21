/**
 * Analytics and monitoring utilities for BubblePop game
 * Handles performance tracking, error reporting, and user analytics
 */

// 型定義
interface EventData { event_category?: string,
    event_label?: string,
    session_id?: string,
    game_version?: string,
    [key: string]: any }

interface WebVitalMetric { name: string,
    id: string,
    value: number  }

interface MemoryInfo { used: number,
    total: number,
    limit: number }

interface PerformanceDetails { fps?: number,
    timestamp?: number,
    [key: string]: any }

interface ErrorData { error_message: string,
    error_stack?: string,
    context: string,
    session_id: string,
    timestamp: number,
    user_agent: string,
    url: string  }

// グローバル変数の型定義
declare global { const __PROD__: boolean,
    const, __DEV__: boolean,
    const __ANALYTICS_ID__: string,
    const __SENTRY_DSN__: string,
    const __VERSION__: string,
    const __BUILD_TIME__: string,
    
    interface Window {
        gtag?: (command: string, targetId: string, parameters?: any) => void,
        Sentry?: {
            init: (config: any) => void,
            setTag: (key: string, value: string) => void,
            captureException: (error: Error, options?: any) => void 
    };
        webVitals?: { getCLS: (callback: (metric: WebVitalMetric) => void) => void,
            getFID: (callback: (metric: WebVitalMetric) => void) => void,
            getFCP: (callback: (metric: WebVitalMetric) => void) => void,
            getLCP: (callback: (metric: WebVitalMetric) => void) => void,
            getTTFB: (callback: (metric: WebVitalMetric) => void) => void 
    }

    interface Performance { memory?: {
            usedJSHeapSiz,e: number,
            totalJSHeapSize: number,
    jsHeapSizeLimit: number  }
}

class Analytics { private isEnabled: boolean
    private sessionId: string,
    private, startTime: number,
    constructor() {

        this.isEnabled = (typeof, __PROD__ !== 'undefined' ? __PROD__ : false') && ',
                        (typeof, __ANALYTICS_ID__ !== 'undefined' ? !!__ANALYTICS_ID__: false,
        this.sessionId = this.generateSessionId(),
        this.startTime = Date.now(),
        
        if (this.isEnabled) {
            this.initializeAnalytics(),
            this.initializeErrorTracking() }
            this.initializePerformanceTracking(); }
}

    /**
     * Initialize Google Analytics or other analytics providers'
     */''
    private initializeAnalytics('''
        const analyticsId = typeof __ANALYTICS_ID__ !== 'undefined' ? __ANALYTICS_ID__: ',
        const version = typeof __VERSION__ !== 'undefined' ? __VERSION__: ',';
        const buildTime = typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__: ')';

        if(analyticsId && typeof, window.gtag !== 'undefined') {
            // Google Analytics 4
            window.gtag('config', analyticsId, {''
                page_title: 'BubblePop Game),
                page_location: window.location.href',
    custom_map: { }

                    custom_parameter_1: 'game_version') 
    }');
            ';
            // Set custom dimensions
            window.gtag('config', analyticsId, { game_version: version)
               , build_time: buildTime 
    }

    /**
     * Initialize error tracking (Sentry, or similar)'
     */''
    private initializeErrorTracking('''
        const sentryDsn = typeof __SENTRY_DSN__ !== 'undefined' ? __SENTRY_DSN__: ',
        const isProd = typeof __PROD__ !== 'undefined' ? __PROD__: false,';
        const version = typeof __VERSION__ !== 'undefined' ? __VERSION__: ')';

        if(sentryDsn && typeof, window.Sentry !== 'undefined') {
            window.Sentry.init({'
                dsn: sentryDsn,',
                environment: isProd ? 'production' : 'development'),
                release: version),
                beforeSend(event: any) {
                    // Filter out non-critical errors
                    if(event.exception) {
                        const error = event.exception.values[0],
                        if (error && error.type === 'ChunkLoadError') {
            }

                            return null; // Dont report chunk load errors }
}
                    return event;

                }'}');

            window.Sentry.setTag('game.version', version';
            window.Sentry.setTag('game.session', this.sessionId';
        }
    }

    /**
     * Initialize performance tracking'
     */''
    private initializePerformanceTracking()';
        if(typeof, window.webVitals !== 'undefined' {'
            window.webVitals.getCLS(this.sendWebVital.bind(this),
            window.webVitals.getFID(this.sendWebVital.bind(this),
            window.webVitals.getFCP(this.sendWebVital.bind(this),
            window.webVitals.getLCP(this.sendWebVital.bind(this) }
            window.webVitals.getTTFB(this.sendWebVital.bind(this); }
        }

        // Custom performance metrics
        this.trackCustomMetrics();
    }

    /**
     * Track game-specific events
     */
    trackEvent(eventName: string, parameters: EventData = { ): void {''
        if(!this.isEnabled) return,

        const version = typeof __VERSION__ !== 'undefined' ? __VERSION__: ',
        const eventData: EventData = {''
            event_category: 'game',
            event_label: eventName,
            session_id: this.sessionId,
    game_version: version,
            ...parameters,

        if(typeof, window.gtag !== 'undefined') {', ',

         }

            window.gtag('event', eventName, eventData'; }
        }
';
        // Also log to console in development
        const isDev = typeof __DEV__ !== 'undefined' ? __DEV__: false,
        if(isDev) {', ' }

            console.log('Analytics Event:', eventName, eventData'; }
}

    /**
     * Track game start'
     */''
    trackGameStart(stageName: string): void { ''
        this.trackEvent('game_start', {
                stage_name: stageName,
    timestamp: Date.now(  }));
    }

    /**
     * Track game end'
     */''
    trackGameEnd(stageName: string, score: number, duration: number, reason: string): void { ''
        this.trackEvent('game_end', {
            stage_name: stageName),
            final_score: score',
    game_duration: duration,')',
            end_reason: reason, // 'completed', 'game_over', 'quit'),
            timestamp: Date.now(  });
    }

    /**
     * Track bubble interactions'
     */''
    trackBubbleInteraction(bubbleType: string, action: string, score: number = 0): void { ''
        this.trackEvent('bubble_interaction', {'
            bubble_type: bubbleType,',
            action: action, // 'popped', 'missed', 'expired'),
            score_gained: score  }

    /**
     * Track performance issues'
     */''
    trackPerformanceIssue(issueType: string, details: PerformanceDetails): void { ''
        this.trackEvent('performance_issue', {
                issue_type: issueType),
            details: JSON.stringify(details,
    user_agent: navigator.userAgent)',
            timestamp: Date.now(),' 
            })'

        }');
    }

    /**
     * Track errors'
     */''
    trackError(error: Error, context: string = '): void { ''
        if(!this.isEnabled) return,

        const errorData: ErrorData = {'
            error_message: error.message,
            error_stack: error.stack || ',
    context: context,
            session_id: this.sessionId,
            timestamp: Date.now()',
        if(typeof, window.Sentry !== 'undefined' {'
            window.Sentry.captureException(error, {
                tags: {
         }
                    context: context })'
                },')'
                extra: errorData');
        }
';
        // Send to Google Analytics as exception
        if(typeof, window.gtag !== 'undefined') {

            window.gtag('event', 'exception', {)
                description: error.message,
    fatal: false }
                ...errorData';
        }
    }

    /**
     * Send Web Vitals metrics'
     */''
    private sendWebVital(metric: WebVitalMetric): void { ''
        if(typeof, window.gtag !== 'undefined') {

            window.gtag('event', metric.name, {''
                event_category: 'Web Vitals',')',
                event_label: metric.id',
                value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value, non_interaction: true)  }
            });
        }
    }

    /**
     * Track custom performance metrics
     */
    private trackCustomMetrics(): void { // Track FPS
        let frameCount = 0,
        let lastTime = performance.now(),
        
        const trackFPS = (): void => { 
            frameCount++,
            const currentTime = performance.now(),
            
            if(currentTime - lastTime >= 1000) {
            
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime)),
                ' }

                if(fps < 30) { }'

                    this.trackPerformanceIssue('low_fps', { fps, timestamp: currentTime  }
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(trackFPS);
        };
        
        requestAnimationFrame(trackFPS);

        // Track memory usage (if, available);
        if(performance.memory) {
            setInterval(() => { 
                const memoryInfo: MemoryInfo = {
                    used: performance.memory!.usedJSHeapSize }
                    total: performance.memory!.totalJSHeapSize }
                    limit: performance.memory!.jsHeapSizeLimit 
    };
                const usagePercent = (memoryInfo.used / memoryInfo.limit) * 100;

                if(usagePercent > 80) {', ' }

                    this.trackPerformanceIssue('high_memory_usage', memoryInfo); }
}, 30000'; // Check every 30 seconds
        }
    }

    /**
     * Generate unique session ID
     */''
    private generateSessionId()';
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Track page visibility changes'
     */''
    trackVisibilityChange()';
        document.addEventListener('visibilitychange', () => {  ''
            this.trackEvent('visibility_change', {
                visible: !document.hidden) })
                timestamp: Date.now(); 
    });
        });
    }

    /**
     * Track user engagement
     */
    trackEngagement(): void { let engagementTime = 0,
        let lastActiveTime = Date.now(),
        let isActive = true,

        const updateEngagement = (): void => { 
            if (isActive) { }
                engagementTime += Date.now() - lastActiveTime; }

            }''
            lastActiveTime = Date.now()';
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart].forEach(event => {  ),
            document.addEventListener(event, () => {
                if(!isActive) {
    
}
                    isActive = true; }
                    lastActiveTime = Date.now(); }
}, { passive: true });
        });

        // Track inactivity
        setInterval(() => {  if (Date.now() - lastActiveTime > 30000) { // 30 seconds of inactivity }
                isActive = false; }
            }
            updateEngagement();
        }, 1000);

        // Send engagement data periodically
        setInterval(() => { ''
            if(engagementTime > 0) {

                this.trackEvent('user_engagement', { }
                    engagement_time: engagementTime) }
                    session_duration: Date.now() - this.startTime 
    });
                engagementTime = 0;
            }
        }, 60000); // Every minute
    }

    // Getters for external access
    getSessionId(): string { return this.sessionId }

    getIsEnabled(): boolean { return this.isEnabled;
;
// Create singleton instance
const analytics = new Analytics();