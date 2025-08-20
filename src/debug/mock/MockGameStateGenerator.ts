/**
 * Mock Game State Generator
 * ゲーム状態のモック生成クラス
 */

interface GameState { id: string,
    level: number,
    score: number,
    lives: number,
    bubbles: any[],
    player: {
        x: number,
        y: number,
        angle: number }
    },
    gameMode: string,
    timeRemaining: number,
    powerUps: string[],
    timestamp: number,
}

interface StateGenerationOptions { level?: number;
    minScore?: number;
    maxScore?: number;
    bubbleCount?: number;
    gameMode?: string; }
}

export class MockGameStateGenerator {
    private gameModes = ['classic', 'puzzle', 'arcade', 'challenge'];''
    private powerUps = ['multiball', 'precision', 'explosive', 'freeze'];

    public generateGameState(options: StateGenerationOptions = {): GameState {
        const level = options.level || Math.floor(Math.random() * 10) + 1;
        const minScore = options.minScore || 0;
        const maxScore = options.maxScore || level * 10000;
        const bubbleCount = options.bubbleCount || Math.floor(Math.random() * 50) + 10;

        return { id: this.generateId(),
            level,
            score: minScore + Math.random() * (maxScore - minScore),
            lives: Math.floor(Math.random() * 5) + 1,
            bubbles: this.generateMockBubbles(bubbleCount),
            player: {
                x: 400,
                y: 550, };
                angle: Math.random() * Math.PI - Math.PI / 2 }
            },
            gameMode: options.gameMode || this.gameModes[Math.floor(Math.random() * this.gameModes.length)],
            timeRemaining: Math.random() * 300,
            powerUps: this.generateRandomPowerUps(),
            timestamp: Date.now(),
        };
    }

    public generateProgressiveStates(count: number): GameState[] { const states: GameState[] = [],
        
        for(let i = 0; i < count; i++) {
        
            const level = Math.floor(i / 3) + 1;
            const score = i * 1000 + Math.random() * 500;
            
            states.push(this.generateGameState({)
                level);
                minScore: score,)
        }
                maxScore: score + 1000))); }
        }

        return states;
    }

    public generateEndGameState(): GameState { return { ...this.generateGameState(),
            lives: 0,
            timeRemaining: 0, };
            bubbles: [] }
        },
    }

    public generateWinState(level: number): GameState { return { ...this.generateGameState({ level ),
            bubbles: [], };
            score: level * 5000 + Math.random() * 2000 }
        },
    }

    private generateMockBubbles(count: number): any[] { return Array.from({ length: count ), (_, i) => ({ }
            id: `bubble_${i}`)
            x: Math.random() * 800,';
            y: Math.random() * 400 + 50,'';
            color: this.getRandomColor()';
            type: 'normal');
        }),
    }

    private generateRandomPowerUps(): string[] { const count = Math.floor(Math.random() * 3);
        const shuffled = [...this.powerUps].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count); }
    }'
'';
    private getRandomColor(''';
        const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];)
        return colors[Math.floor(Math.random() * colors.length)];
    }
';'
    private generateId(): string { ' }'
        return `gamestate_${Date.now(})}_${Math.random().toString(36).substr(2, 9'})}`;'
    }''
}