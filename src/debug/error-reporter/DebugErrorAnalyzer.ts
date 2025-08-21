/**
 * Debug Error Analyzer
 * デバッグエラーの分析クラス
 */

interface ErrorPattern { id: string,
    pattern: RegExp;
    category: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    solution?: string,
    frequency: number ,}

interface AnalysisResult { errorId: string;
    matchedPatterns: ErrorPattern[];
    suggestions: string[];
    severity: string;
    category: string,
    confidence: number }

interface ErrorTrend { category: string,
    count: number,
    trend: 'increasing' | 'decreasing' | 'stable',
    timeframe: number ,}

export class DebugErrorAnalyzer {
    private patterns: ErrorPattern[] = [];
    private, errorHistory: any[] = [];
    constructor() {

        

    }
        this.initializePatterns(); }
    }

    private initializePatterns('''
                id: 'undefined_method','';
                pattern: /(\w+') is not a function/i,
                category: 'reference_error',
                severity: 'high',
                description: 'Method not found or not defined',
                solution: 'Check method spelling and ensure object has the method',
    frequency: 0;
            },

            { ''
                id: 'null_reference',
                pattern: /Cannot read propert(y|ies) of(null|undefined)/i,
                category: 'null_pointer',
                severity: 'high',
                description: 'Null or undefined reference access',
                solution: 'Add null checks before accessing properties',
    frequency: 0 ,};
            { ''
                id: 'network_error',
                pattern: /fetch|XMLHttpRequest|network/i,
                category: 'network',
                severity: 'medium',
                description: 'Network connectivity or API error',
                solution: 'Check network connection and API endpoints',
    frequency: 0 ,};
            { ''
                id: 'memory_leak',
                pattern: /memory|heap|out of memory/i,
                category: 'performance',
                severity: 'critical',
                description: 'Potential memory leak or high memory usage',
                solution: 'Review object lifecycle and remove unused references',
    frequency: 0 ,}
        ];
    }

    public analyzeError(error: { message: string)
        stack?: string;
        context?: any,
    timestamp: number): AnalysisResult {
        this.errorHistory.push(error);
        const matchedPatterns = this.patterns.filter(pattern =>);
            pattern.pattern.test(error.message) || ;
            (error.stack && pattern.pattern.test(error.stack);
        );

        // Update pattern frequency
        matchedPatterns.forEach(pattern => pattern.frequency++);

        const suggestions = this.generateSuggestions(matchedPatterns, error);
        const severity = this.determineSeverity(matchedPatterns);
        const category = this.determineCategory(matchedPatterns);
        const confidence = this.calculateConfidence(matchedPatterns, error);

        return { errorId: this.generateErrorId(error),
            matchedPatterns,
            suggestions,
            severity,
            category, };
            confidence }
        }

    public analyzeErrorTrends(timeframe: number = 3600000): ErrorTrend[] { const cutoff = Date.now() - timeframe;
        const recentErrors = this.errorHistory.filter(e => e.timestamp > cutoff);
        
        const categories = new Map<string, number>();
        recentErrors.forEach(error => { );
            const analysis = this.analyzeError(error); }
            categories.set(analysis.category, (categories.get(analysis.category) || 0) + 1); }
        });

        return Array.from(categories.entries().map(([category, count]) => ({ category,
            count);
            trend: this.calculateTrend(category, timeframe),
            timeframe });
    }

    public getCommonIssues(limit: number = 10): ErrorPattern[] { return this.patterns
            .sort((a, b) => b.frequency - a.frequency)'';
            .slice(0, limit); }
    }

    public addCustomPattern(pattern: Omit<ErrorPattern, 'frequency'>): void { this.patterns.push({ ...pattern, frequency: 0 ,}

    public getErrorStatistics(): { totalErrors: number, }
        byCategory: { [category: string]: number };
        bySeverity: { [severity: string]: number };
        mostCommonPattern: ErrorPattern | null;
    } {
        const byCategory: { [category: string]: number } = {}
        const bySeverity: { [severity: string]: number } = {}
        this.patterns.forEach(pattern => {  );
            byCategory[pattern.category] = (byCategory[pattern.category] || 0) + pattern.frequency; }
            bySeverity[pattern.severity] = (bySeverity[pattern.severity] || 0) + pattern.frequency; }
        });

        const mostCommonPattern = this.patterns.reduce((prev, current) =>;
            current.frequency > prev.frequency ? current : prev,
            this.patterns[0] || null;
        );

        return { totalErrors: this.errorHistory.length,
            byCategory,
            bySeverity, };
            mostCommonPattern }
        }

    private generateSuggestions(patterns: ErrorPattern[], error: any): string[] { const suggestions = patterns
            .filter(p => p.solution);
            .map(p => p.solution!);

        // Add context-specific suggestions
        if (error.context?.component) {' }'

            suggestions.push(`Check, the ${error.context.component} component, for issues`'}';
        }

        if(error.stack && error.stack.includes('async)' { ''
            suggestions.push('Consider, adding proper, async/await, error handling'; }'

        return [...new Set(suggestions)]; // Remove duplicates
    }
 : undefined'';
    private determineSeverity(patterns: ErrorPattern[]): string { ''
        if(patterns.some(p => p.severity === 'critical)' return 'critical';
        if(patterns.some(p => p.severity === 'high)' return 'high';
        if(patterns.some(p => p.severity === 'medium)' return 'medium';
        return 'low';
';

    private determineCategory(patterns: ErrorPattern[]): string { ''
        if(patterns.length === 0) return 'unknown';
        
        // Group by category and return most common
        const categories = patterns.map(p => p.category);
        const categoryCount = categories.reduce((acc, cat) => { 
            acc[cat] = (acc[cat] || 0) + 1; }
            return acc;, {} as { [key: string]: number });

        return Object.entries(categoryCount);
            .sort(([,a], [,b]) => b - a)[0][0];
    }

    private calculateConfidence(patterns: ErrorPattern[], error: any): number { if (patterns.length === 0) return 0;
        
        let confidence = patterns.length * 0.3; // Base confidence from pattern matches
        
        // Boost confidence for exact matches
        if(patterns.some(p => p.pattern.test(error.message)) {
            confidence += 0.4; }
        }
        
        // Boost confidence for stack trace matches
        if(error.stack && patterns.some(p => p.pattern.test(error.stack)) { confidence += 0.3; }

        return Math.min(1, confidence);
    }

    private calculateTrend(category: string, timeframe: number): 'increasing' | 'decreasing' | 'stable' { const now = Date.now();
        const halfTimeframe = timeframe / 2;
        
        const recentCount = this.errorHistory.filter(e =>);
            e.timestamp > now - halfTimeframe &&);
            this.analyzeError(e).category === category;
        ).length;
        
        const olderCount = this.errorHistory.filter(e =>);
            e.timestamp > now - timeframe &&);
            e.timestamp <= now - halfTimeframe &&);
            this.analyzeError(e).category === category;
        ).length;

        if(recentCount > olderCount * 1.2) return 'increasing';
        if(recentCount < olderCount * 0.8) return 'decreasing';
        return 'stable';

    private generateErrorId(error: any): string { ''
        const hash = this.simpleHash(error.message + (error.stack || ''); }
        return `error_${Date.now())_${hash}`;
    }

    private simpleHash(str: string): string { let hash = 0;
        for(let, i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
        }
            hash = hash & hash; // Convert to 32-bit integer }
        }''
        return Math.abs(hash).toString(36);

    }''
}