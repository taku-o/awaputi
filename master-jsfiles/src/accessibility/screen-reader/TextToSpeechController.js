/**
 * TextToSpeechController - Text-to-speech synthesis and announcement management
 * Handles speech output formatting, rate control, and announcement queuing
 */
export class TextToSpeechController {
    constructor(config = {}) {
        this.config = {
            enabled: true,
            defaultVoice: null,
            defaultRate: 1.0,
            defaultPitch: 1.0,
            defaultVolume: 1.0,
            queueAnnouncements: true,
            maxQueueSize: 50,
            interruptOnNew: false,
            pauseBetweenAnnouncements: 200,
            ...config
        };

        // Speech synthesis support
        this.speechSynthesis = null;
        this.voices = [];
        this.currentVoice = null;

        // Announcement queue management
        this.announcementQueue = [];
        this.isPlaying = false;
        this.currentUtterance = null;

        // Speech settings
        this.speechSettings = {
            rate: this.config.defaultRate,
            pitch: this.config.defaultPitch,
            volume: this.config.defaultVolume,
            voice: this.config.defaultVoice
        };

        // Performance metrics
        this.performance = {
            totalAnnouncements: 0,
            queuedAnnouncements: 0,
            completedAnnouncements: 0,
            averageProcessingTime: 0,
            speechDurations: []
        };

        // Event handlers
        this.eventHandlers = {
            onStart: null,
            onEnd: null,
            onError: null,
            onPause: null,
            onResume: null
        };
    }

    /**
     * Initialize text-to-speech controller
     */
    initialize() {
        if (!this.config.enabled) {
            console.log('TextToSpeechController: Disabled');
            return false;
        }

        // Check for speech synthesis support
        if ('speechSynthesis' in window) {
            this.speechSynthesis = window.speechSynthesis;
            this.loadVoices();
            
            // Listen for voice changes
            if (speechSynthesis.onvoiceschanged !== undefined) {
                speechSynthesis.onvoiceschanged = () => {
                    this.loadVoices();
                };
            }

            console.log('TextToSpeechController: Initialized with speech synthesis support');
            return true;
        } else {
            console.warn('TextToSpeechController: Speech synthesis not supported');
            return false;
        }
    }

    /**
     * Load available voices
     */
    loadVoices() {
        if (!this.speechSynthesis) return;

        this.voices = this.speechSynthesis.getVoices();
        
        // Set default voice if not already set
        if (!this.currentVoice && this.voices.length > 0) {
            // Try to find system default or English voice
            this.currentVoice = this.voices.find(voice => voice.default) ||
                              this.voices.find(voice => voice.lang.startsWith('en')) ||
                              this.voices[0];
            
            this.speechSettings.voice = this.currentVoice;
        }

        console.log(`TextToSpeechController: Loaded ${this.voices.length} voices`);
    }

    /**
     * Announce text using text-to-speech
     */
    announce(text, options = {}) {
        if (!this.config.enabled || !this.speechSynthesis) {
            return Promise.resolve();
        }

        const announcement = {
            text: this.formatSpeechOutput(text),
            priority: options.priority || 'normal',
            interrupt: options.interrupt || this.config.interruptOnNew,
            settings: {
                ...this.speechSettings,
                ...options.speechSettings
            },
            timestamp: Date.now()
        };

        return this.queueAnnouncement(announcement);
    }

    /**
     * Queue announcement for speech
     */
    queueAnnouncement(announcement) {
        return new Promise((resolve, reject) => {
            announcement.resolve = resolve;
            announcement.reject = reject;

            // Handle interruption
            if (announcement.interrupt) {
                this.stopSpeech();
                this.clearQueue();
            }

            // Handle high priority announcements
            if (announcement.priority === 'high') {
                this.announcementQueue.unshift(announcement);
            } else {
                this.announcementQueue.push(announcement);
            }

            // Limit queue size
            if (this.announcementQueue.length > this.config.maxQueueSize) {
                const dropped = this.announcementQueue.splice(this.config.maxQueueSize);
                dropped.forEach(item => {
                    if (item.reject) {
                        item.reject(new Error('Announcement dropped - queue full'));
                    }
                });
            }

            this.performance.queuedAnnouncements++;
            this.processQueue();
        });
    }

    /**
     * Process announcement queue
     */
    async processQueue() {
        if (this.isPlaying || this.announcementQueue.length === 0) {
            return;
        }

        this.isPlaying = true;
        const announcement = this.announcementQueue.shift();

        try {
            await this.speakAnnouncement(announcement);
            
            if (announcement.resolve) {
                announcement.resolve();
            }

            this.performance.completedAnnouncements++;

            // Pause between announcements
            if (this.config.pauseBetweenAnnouncements > 0 && this.announcementQueue.length > 0) {
                await this.delay(this.config.pauseBetweenAnnouncements);
            }

        } catch (error) {
            console.error('TextToSpeechController: Speech error:', error);
            
            if (announcement.reject) {
                announcement.reject(error);
            }
        } finally {
            this.isPlaying = false;
            
            // Process next item in queue
            if (this.announcementQueue.length > 0) {
                setTimeout(() => this.processQueue(), 10);
            }
        }
    }

    /**
     * Speak individual announcement
     */
    speakAnnouncement(announcement) {
        return new Promise((resolve, reject) => {
            if (!this.speechSynthesis) {
                reject(new Error('Speech synthesis not available'));
                return;
            }

            const utterance = new SpeechSynthesisUtterance(announcement.text);
            
            // Apply speech settings
            utterance.voice = announcement.settings.voice || this.currentVoice;
            utterance.rate = announcement.settings.rate || this.speechSettings.rate;
            utterance.pitch = announcement.settings.pitch || this.speechSettings.pitch;
            utterance.volume = announcement.settings.volume || this.speechSettings.volume;

            const startTime = performance.now();

            // Set up event handlers
            utterance.onstart = () => {
                this.currentUtterance = utterance;
                
                if (this.eventHandlers.onStart) {
                    this.eventHandlers.onStart(announcement);
                }
            };

            utterance.onend = () => {
                const endTime = performance.now();
                const duration = endTime - startTime;
                
                this.performance.speechDurations.push(duration);
                this.performance.totalAnnouncements++;
                
                this.currentUtterance = null;
                
                if (this.eventHandlers.onEnd) {
                    this.eventHandlers.onEnd(announcement, duration);
                }
                
                resolve();
            };

            utterance.onerror = (event) => {
                this.currentUtterance = null;
                
                if (this.eventHandlers.onError) {
                    this.eventHandlers.onError(event, announcement);
                }
                
                reject(new Error(`Speech synthesis error: ${event.error}`));
            };

            utterance.onpause = () => {
                if (this.eventHandlers.onPause) {
                    this.eventHandlers.onPause(announcement);
                }
            };

            utterance.onresume = () => {
                if (this.eventHandlers.onResume) {
                    this.eventHandlers.onResume(announcement);
                }
            };

            // Speak the utterance
            try {
                this.speechSynthesis.speak(utterance);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Format speech output for better pronunciation
     */
    formatSpeechOutput(text) {
        if (!text) return '';

        let formatted = text.toString();

        // Handle abbreviations and acronyms
        const abbreviations = {
            'URL': 'U R L',
            'HTML': 'H T M L',
            'CSS': 'C S S',
            'JS': 'JavaScript',
            'API': 'A P I',
            'ARIA': 'Aria',
            'WCAG': 'W C A G',
            'UI': 'U I',
            'UX': 'U X'
        };

        for (const [abbr, pronunciation] of Object.entries(abbreviations)) {
            const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
            formatted = formatted.replace(regex, pronunciation);
        }

        // Handle symbols and special characters
        const symbols = {
            '&': ' and ',
            '@': ' at ',
            '#': ' hash ',
            '%': ' percent ',
            '$': ' dollar ',
            '+': ' plus ',
            '=': ' equals ',
            '<': ' less than ',
            '>': ' greater than ',
            '|': ' pipe ',
            '\\': ' backslash ',
            '/': ' slash ',
            '*': ' asterisk ',
            '^': ' caret ',
            '~': ' tilde '
        };

        for (const [symbol, pronunciation] of Object.entries(symbols)) {
            formatted = formatted.replace(new RegExp('\\' + symbol, 'g'), pronunciation);
        }

        // Handle numbers and units
        formatted = formatted.replace(/(\d+)px/g, '$1 pixels');
        formatted = formatted.replace(/(\d+)%/g, '$1 percent');
        formatted = formatted.replace(/(\d+)em/g, '$1 em');

        // Clean up extra spaces
        formatted = formatted.replace(/\s+/g, ' ').trim();

        return formatted;
    }

    /**
     * Stop current speech
     */
    stopSpeech() {
        if (this.speechSynthesis && this.speechSynthesis.speaking) {
            this.speechSynthesis.cancel();
        }
        
        this.currentUtterance = null;
        this.isPlaying = false;
    }

    /**
     * Pause speech
     */
    pauseSpeech() {
        if (this.speechSynthesis && this.speechSynthesis.speaking) {
            this.speechSynthesis.pause();
        }
    }

    /**
     * Resume speech
     */
    resumeSpeech() {
        if (this.speechSynthesis && this.speechSynthesis.paused) {
            this.speechSynthesis.resume();
        }
    }

    /**
     * Clear announcement queue
     */
    clearQueue() {
        // Reject all pending announcements
        this.announcementQueue.forEach(announcement => {
            if (announcement.reject) {
                announcement.reject(new Error('Announcement cancelled'));
            }
        });
        
        this.announcementQueue = [];
    }

    /**
     * Set speech rate
     */
    setSpeechRate(rate) {
        if (rate >= 0.1 && rate <= 10) {
            this.speechSettings.rate = rate;
            console.log(`TextToSpeechController: Speech rate set to ${rate}`);
        } else {
            console.warn('TextToSpeechController: Invalid speech rate:', rate);
        }
    }

    /**
     * Set speech pitch
     */
    setSpeechPitch(pitch) {
        if (pitch >= 0 && pitch <= 2) {
            this.speechSettings.pitch = pitch;
            console.log(`TextToSpeechController: Speech pitch set to ${pitch}`);
        } else {
            console.warn('TextToSpeechController: Invalid speech pitch:', pitch);
        }
    }

    /**
     * Set speech volume
     */
    setSpeechVolume(volume) {
        if (volume >= 0 && volume <= 1) {
            this.speechSettings.volume = volume;
            console.log(`TextToSpeechController: Speech volume set to ${volume}`);
        } else {
            console.warn('TextToSpeechController: Invalid speech volume:', volume);
        }
    }

    /**
     * Set speech voice
     */
    setSpeechVoice(voiceName) {
        const voice = this.voices.find(v => v.name === voiceName);
        
        if (voice) {
            this.currentVoice = voice;
            this.speechSettings.voice = voice;
            console.log(`TextToSpeechController: Voice set to ${voice.name}`);
            return true;
        } else {
            console.warn('TextToSpeechController: Voice not found:', voiceName);
            return false;
        }
    }

    /**
     * Get available voices
     */
    getAvailableVoices() {
        return this.voices.map(voice => ({
            name: voice.name,
            lang: voice.lang,
            gender: voice.gender || 'unknown',
            localService: voice.localService,
            default: voice.default
        }));
    }

    /**
     * Get current speech settings
     */
    getSpeechSettings() {
        return {
            ...this.speechSettings,
            voiceName: this.currentVoice?.name || 'default'
        };
    }

    /**
     * Get queue status
     */
    getQueueStatus() {
        return {
            queueLength: this.announcementQueue.length,
            isPlaying: this.isPlaying,
            currentAnnouncement: this.currentUtterance ? {
                text: this.currentUtterance.text.substring(0, 50) + '...',
                rate: this.currentUtterance.rate,
                pitch: this.currentUtterance.pitch,
                volume: this.currentUtterance.volume
            } : null
        };
    }

    /**
     * Get performance metrics
     */
    getPerformanceMetrics() {
        const avgDuration = this.performance.speechDurations.length > 0 ?
            this.performance.speechDurations.reduce((a, b) => a + b, 0) / this.performance.speechDurations.length : 0;

        return {
            totalAnnouncements: this.performance.totalAnnouncements,
            queuedAnnouncements: this.performance.queuedAnnouncements,
            completedAnnouncements: this.performance.completedAnnouncements,
            averageSpeechDuration: avgDuration,
            queueEfficiency: this.performance.queuedAnnouncements > 0 ?
                (this.performance.completedAnnouncements / this.performance.queuedAnnouncements) * 100 : 0
        };
    }

    /**
     * Set event handlers
     */
    setEventHandlers(handlers) {
        this.eventHandlers = {
            ...this.eventHandlers,
            ...handlers
        };
    }

    /**
     * Test speech synthesis
     */
    async testSpeech(text = 'Screen reader test announcement') {
        try {
            await this.announce(text, { priority: 'high' });
            console.log('TextToSpeechController: Speech test successful');
            return true;
        } catch (error) {
            console.error('TextToSpeechController: Speech test failed:', error);
            return false;
        }
    }

    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = {
            ...this.config,
            ...newConfig
        };

        // Apply immediate settings
        if (newConfig.defaultRate !== undefined) {
            this.speechSettings.rate = newConfig.defaultRate;
        }
        if (newConfig.defaultPitch !== undefined) {
            this.speechSettings.pitch = newConfig.defaultPitch;
        }
        if (newConfig.defaultVolume !== undefined) {
            this.speechSettings.volume = newConfig.defaultVolume;
        }
    }

    /**
     * Check if speech synthesis is supported
     */
    isSupported() {
        return 'speechSynthesis' in window;
    }

    /**
     * Check if currently speaking
     */
    isSpeaking() {
        return this.speechSynthesis ? this.speechSynthesis.speaking : false;
    }

    /**
     * Check if speech is paused
     */
    isPaused() {
        return this.speechSynthesis ? this.speechSynthesis.paused : false;
    }

    /**
     * Reset performance metrics
     */
    resetMetrics() {
        this.performance = {
            totalAnnouncements: 0,
            queuedAnnouncements: 0,
            completedAnnouncements: 0,
            averageProcessingTime: 0,
            speechDurations: []
        };
    }

    /**
     * Destroy and cleanup
     */
    destroy() {
        this.stopSpeech();
        this.clearQueue();
        
        // Remove event handlers
        this.eventHandlers = {
            onStart: null,
            onEnd: null,
            onError: null,
            onPause: null,
            onResume: null
        };

        console.log('TextToSpeechController: Destroyed');
    }
}