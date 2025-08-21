/**
 * Mock Bubble Data Generator
 * バブルデータのモック生成クラス
 */

interface BubbleData { id: string,
    x: number;
    y: number;
    radius: number;
    color: string;
   , type: string, }
    velocity: { x: number;, y: number },
    timestamp: number;
}

interface GenerationOptions { count?: number;
    minRadius?: number;
    maxRadius?: number;
    colors?: string[];
    types?: string[]; }
    bounds?: { width: number;, height: number }

export class MockBubbleDataGenerator {
    private defaultColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff];''
    private defaultTypes = ['normal', 'special', 'bonus', 'power'];

    public generateBubble(options: Partial<GenerationOptions> = {): BubbleData { ,}
        const bounds = options.bounds || { width: 800, height: 600 ,}
        const colors = options.colors || this.defaultColors;
        const types = options.types || this.defaultTypes;
        const minRadius = options.minRadius || 10;
        const maxRadius = options.maxRadius || 30;

        return { id: this.generateId(),
            x: Math.random() * bounds.width;
            y: Math.random() * bounds.height;
            radius: minRadius + Math.random() * (maxRadius - minRadius);
            color: colors[Math.floor(Math.random() * colors.length)];
            type: types[Math.floor(Math.random() * types.length)];
           , velocity: {
                x: (Math.random() - 0.5) * 200, };
                y: (Math.random() - 0.5) * 200 }
            };
            timestamp: Date.now();
        }
';

    public generateBubbles(count: number, options: Partial<GenerationOptions> = { ): BubbleData[] {''
        return Array.from({ length: count ), () => this.generateBubble(options)) }
    }

    public generateBubblePattern(pattern: 'grid' | 'circle' | 'random', count: number): BubbleData[] { ''
        switch(pattern) {'

            case 'grid':'';
                return this.generateGridPattern(count);''
            case 'circle':'';
                return this.generateCirclePattern(count);''
            case 'random':;
        }
            default: return this.generateBubbles(count);

    private generateGridPattern(count: number): BubbleData[] { const cols = Math.ceil(Math.sqrt(count);
        const rows = Math.ceil(count / cols);
        const bubbles: BubbleData[] = [],

        for(let, i = 0; i < count; i++) {

            const col = i % cols;
            const row = Math.floor(i / cols);
            
            bubbles.push({)
                ...this.generateBubble(),
                x: (col + 0.5) * (800 / cols);
        ,}
                y: (row + 0.5) * (600 / rows); }
            });
        }

        return bubbles;
    }

    private generateCirclePattern(count: number): BubbleData[] { const centerX = 400;
        const centerY = 300;
        const radius = 200;
        const bubbles: BubbleData[] = [],

        for(let, i = 0; i < count; i++) {

            const angle = (i / count) * 2 * Math.PI;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            bubbles.push({)
                ...this.generateBubble(),
                x,

        }
                y }
            });
        }

        return bubbles;
    }
';

    private generateId(): string { ' }'

        return `bubble_${Date.now(})_${Math.random(}.toString(36}.substr(2, 9'})`;

    }''
}