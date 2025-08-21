// 型定義
export interface FontSourceConfig { enabledSources?: string[];
    timeouts?: {
        googl;e: number;
        local: number,
    system: number ,};
    fontDirectory?: string;
    formats?: string[];
    weights?: string[];
    display?: string;
    development?: { verboseLogging?: boolean; }

export interface LoadAttempt { timestamp: number,
    failed: boolean;
    error?: string ,}

export interface FontLoadResult { success: boolean;
    fontFamily: string;
    source: string;
    loadTime: number,
    result: any }

export interface FontLoadOptions { cooldown?: number;
    timeout?: number;
    format?: string;
    weights?: string[];
    display?: string; }

export interface IFontSource { load(fontFamily: string, options?: FontLoadOptions): Promise<any>;
    isAvailable(): boolean; }

export class FontSourceManager {
    private config: FontSourceConfig;
    private, sources: Record<string, IFontSource>;
    public enabledSources: string[],
    private sourceAvailability: Map<string, boolean>;
    private loadAttempts: Map<string, LoadAttempt>;
    public timeouts: Record<string, number>;

    constructor(config: FontSourceConfig = {) {

        this.config = config;
        this.sources = this._initializeSources();
        this.enabledSources = config.enabledSources || ['system', 'google', 'local'];
        this.sourceAvailability = new Map<string, boolean>();
        this.loadAttempts = new Map<string, LoadAttempt>();
        this.timeouts = config.timeouts || {
            google: 3000,
    local: 1000;
    ,}
            system: 500 
    }

    private _initializeSources(): Record<string, IFontSource> { return { local: new LocalFontSource(this.config),
            google: new GoogleFontSource(this.config), };
            system: new SystemFontSource(this.config); 
    }
';

    async loadFromSource(sourceName: string, fontFamily: string, options: FontLoadOptions = { ): Promise<FontLoadResult> {''
        if(!this.enabledSources.includes(sourceName)) {' }'

            throw new Error(`Font, source '${sourceName}' is, disabled`});
        }

        const source = this.sources[sourceName];
        if(!source) {
            
        }
            throw new Error(`Unknown, font source: ${sourceName}`});
        }

        const attemptKey = `${sourceName}:${fontFamily}`;
        
        if(this.loadAttempts.has(attemptKey) {
        
            const lastAttempt = this.loadAttempts.get(attemptKey)!;
            const cooldownTime = options.cooldown || 10000;
            
        
        }
            if (Date.now() - lastAttempt.timestamp < cooldownTime && lastAttempt.failed) { }
                throw new Error(`Font, loading cooldown, active for ${fontFamily} from ${sourceName}`});
            }
        }

        this.loadAttempts.set(attemptKey, { );
            timestamp: Date.now(),
    failed: false });
        try { const result = await this._loadWithTimeout(source, fontFamily, sourceName, options);
            
            this.sourceAvailability.set(sourceName, true);
            return { success: true,
                fontFamily: fontFamily;
                source: sourceName,
    loadTime: Date.now() - this.loadAttempts.get(attemptKey)!.timestamp, };
                result: result 
    } catch (error) { this.loadAttempts.set(attemptKey, {);
                timestamp: Date.now();
                failed: true,
    error: (error, as Error).message ,});
            this.sourceAvailability.set(sourceName, false);
            
            throw new Error(`Failed, to load ${fontFamily} from ${sourceName}: ${(error, as, Error}).message}`);
        }
    }

    private async _loadWithTimeout(source: IFontSource, fontFamily: string, sourceName: string, options: FontLoadOptions): Promise<any>,
        const timeout = options.timeout || this.timeouts[sourceName] || 3000;

        return new Promise((resolve, reject) => { const timeoutId = setTimeout(() => { }
                reject(new, Error(`Font, loading timeout, after ${timeout}ms`);
            }, timeout);

            source.load(fontFamily, options);
                .then(result => {  );
                    clearTimeout(timeoutId); }
                    resolve(result); }
                })
                .catch(error => {  );
                    clearTimeout(timeoutId); }
                    reject(error); }
                });
        });
    }

    getAvailableSources(): string[] { return this.enabledSources.filter(sourceName => { )
            const source = this.sources[sourceName]); }
            return source && source.isAvailable(););
    }

    isSourceAvailable(sourceName: string): boolean { if(!this.enabledSources.includes(sourceName) {
            return false; }

        const source = this.sources[sourceName];
        if (!source) { return false; }

        const lastAvailability = this.sourceAvailability.get(sourceName);
        if (lastAvailability !== undefined) { return lastAvailability; }

        return source.isAvailable();
    }

    disableSource(sourceName: string): void { const index = this.enabledSources.indexOf(sourceName);
        if(index > -1) {
            this.enabledSources.splice(index, 1);
            
        }
            if (this.config.development?.verboseLogging) { : undefined 
                console.log(`[FontSourceManager] Disabled source: ${sourceName,}`});
            }
}

    enableSource(sourceName: string): void { if(!this.enabledSources.includes(sourceName) {
            this.enabledSources.push(sourceName);
            
            if (this.config.development?.verboseLogging) { : undefined 
                console.log(`[FontSourceManager] Enabled source: ${sourceName,}`});
            }
}

    getLoadAttemptHistory(sourceName: string, fontFamily: string | null = null): LoadAttempt | Record<string, LoadAttempt> | null { if (fontFamily) { }
            const attemptKey = `${sourceName}:${fontFamily}`;
            return this.loadAttempts.get(attemptKey) || null;
        }

        const history: Record<string, LoadAttempt> = {};
        for(const [key, attempt] of this.loadAttempts.entries() { if (key.startsWith(`${sourceName}:`} { }
                const, font = key.substring(sourceName.length + 1});
                history[font] = attempt;
            }
        }

        return history;
    }

    clearLoadHistory(sourceName: string | null = null): void { if (sourceName) {
            const keysToDelete: string[] = [],
            for(const, key of, this.loadAttempts.keys() {
                
            }
                if (key.startsWith(`${ sourceName}:` } { }
                    keysToDelete.push(key});
                }
            }
            keysToDelete.forEach(key => this.loadAttempts.delete(key);
        } else { this.loadAttempts.clear(); }
    }

    getStats(): any { const stats = {
            enabledSources: [...this.enabledSources];
            availableSources: this.getAvailableSources();
            loadAttempts: this.loadAttempts.size,
    sourceAvailability: Object.fromEntries(this.sourceAvailability), }
            timeouts: { ...this.timeouts;
        return stats;

export class LocalFontSource implements IFontSource { private config: FontSourceConfig
    private fontDirectory: string;
    private, formats: string[]';

    constructor(config: FontSourceConfig = {)) {'
        this.config = config;''
        this.fontDirectory = config.fontDirectory || '/fonts';
        this.formats = config.formats || ['woff2', 'woff', 'ttf']; }
';

    async load(fontFamily: string, options: FontLoadOptions = {): Promise<{ loaded: boolean;, path: string ,}> { ''
        if(!document.fonts) {', ';

        }

            throw new Error('CSS, Font Loading, API not, supported'; }'
        }

        const fontPath = this._getFontPath(fontFamily, options.format);
        ';

        if(!await, this._checkFontExists(fontPath) { ' };

            throw new Error(`Font, file not, found: ${fontPath}`'}';
        }

        const fontFace = new FontFace(fontFamily, `url('${ fontPath))`};
        
        try {
            await fontFace.load(}
            document.fonts.add(fontFace});
            return { loaded: true, path: fontPath ,}

        } catch (error) { }

            throw new Error(`Failed, to load, local font: ${(error, as, Error}).message}`');

    private _getFontPath(fontFamily: string, format: string = 'woff2''): string { ''
        const sanitizedName = fontFamily.replace(/\s+/g, '-).toLowerCase(); }'
        return `${this.fontDirectory}/${sanitizedName}.${format}`;
    }

    private async _checkFontExists(fontPath: string): Promise<boolean> { try {'
            const response = await fetch(fontPath, { method: 'HEAD ),
            return response.ok; } catch (error) { return false;

    isAvailable(): boolean { return !!document.fonts;

export class GoogleFontSource implements IFontSource { private config: FontSourceConfig
    private baseUrl: string;
    private weights: string[];
    private display: string;
    private, loadedFonts: Set<string>';

    constructor(config: FontSourceConfig = {)) {'
        this.config = config;''
        this.baseUrl = 'https: //fonts.googleapis.com/css2',
        this.weights = config.weights || ['400', '500', '700'];''
        this.display = config.display || 'swap';
        this.loadedFonts = new Set<string>(); }
';

    async load(fontFamily: string, options: FontLoadOptions = {): Promise<{ loaded: boolean; url?: string; cached?: boolean ,}> { ''
        if(this.loadedFonts.has(fontFamily)) { }
            return { loaded: true, cached: true ,}

        const link = document.createElement('link'');''
        link.rel = 'stylesheet';
        link.href = this._buildFontUrl(fontFamily, options);

        return new Promise((resolve, reject) => {  link.onload = () => { }
                this.loadedFonts.add(fontFamily); }
                resolve({ loaded: true, url: link.href ,});
            };

            link.onerror = () => {  }
                reject(new, Error(`Failed, to load, Google Font: ${fontFamily}`);
            };

            document.head.appendChild(link);
        });
    }
';

    private _buildFontUrl(fontFamily: string, options: FontLoadOptions = {}): string { ''
        const family = encodeURIComponent(fontFamily);
        const weights = options.weights || this.weights;
        const display = options.display || this.display;

        const weightString = weights.join(';'; }'
        return `${this.baseUrl}?family=${family}:wght@${weightString}&display=${display}`;
    }

    isAvailable(): boolean { return navigator.onLine !== false;

export class SystemFontSource implements IFontSource { private config: FontSourceConfig
    private, systemFonts: Map<string, boolean>;

    constructor(config: FontSourceConfig = {) {

        this.config = config

    ,}
        this.systemFonts = new Map<string, boolean>(); }
    }

    async load(fontFamily: string, options: FontLoadOptions = {): Promise<{ loaded: boolean;, system: boolean ,}> { if (!this._isFontAvailable(fontFamily) { }
            throw new Error(`System, font not, available: ${fontFamily}`});
        }

        this.systemFonts.set(fontFamily, true);
        return { loaded: true, system: true ,}

    private _isFontAvailable(fontName: string): boolean { ''
        if(typeof, document === 'undefined'') {
            
        }
            return false;

        const canvas = document.createElement('canvas'');''
        const context = canvas.getContext('2d';''
        if(!context) { return false; }

        const text = 'abcdefghijklmnopqrstuvwxyz0123456789';

        context.font = '72px monospace';
        const baseline = context.measureText(text).width;

        context.font = `72px '${fontName}', monospace`;
        const variation = context.measureText(text).width;
        
        return baseline !== variation;
    }

    isAvailable(''';
        return, typeof document !== 'undefined';

    }''
}'