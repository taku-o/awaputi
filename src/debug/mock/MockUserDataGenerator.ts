/**
 * Mock User Data Generator
 * ユーザーデータのモック生成クラス
 */

interface UserData { id: string,
    username: string,
    level: number,
    totalScore: number,
    gamesPlayed: number,
    gamesWon: number,
    averageScore: number,
    lastPlayed: number,
    achievements: string[],
    settings: {
        soundEnabled: boolean,
        difficulty: string,
        theme: string }
    },
    statistics: { totalPlayTime: number,
        bubblesPopped: number,
        perfectShots: number,
        powerUpsUsed: number }
    };
}

interface UserGenerationOptions { level?: number;
    minScore?: number;
    maxScore?: number;
    gamesPlayed?: number; }
}

export class MockUserDataGenerator {
    private usernameTemplates = ['Player', 'Gamer', 'BubbleMaster', 'PopKing', 'ArcadeHero',']';
        'SkillShot', 'Champion', 'Pro', 'Expert', 'Legend'];
    ];
    ';'
    private achievements = ['';
        'first_win', 'bubble_master', 'perfect_shot', 'speed_demon','';
        'combo_king', 'level_crusher', 'power_user', 'perfectionist',']';
        'endurance_player', 'high_scorer'];
    ];'
'';
    private difficulties = ['easy', 'medium', 'hard', 'expert'];''
    private themes = ['classic', 'neon', 'ocean', 'space', 'retro'];

    public generateUser(options: UserGenerationOptions = {): UserData {
        const level = options.level || Math.floor(Math.random() * 50) + 1;
        const gamesPlayed = options.gamesPlayed || Math.floor(Math.random() * 1000) + 10;
        const gamesWon = Math.floor(gamesPlayed * (0.3 + Math.random() * 0.4));
        const minScore = options.minScore || level * 1000;
        const maxScore = options.maxScore || level * 10000;
        const totalScore = minScore + Math.random() * (maxScore - minScore);

        return { id: this.generateId(),
            username: this.generateUsername(),
            level,
            totalScore,
            gamesPlayed,
            gamesWon,
            averageScore: totalScore / gamesPlayed,
            lastPlayed: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000, // Within last week;
            achievements: this.generateAchievements(level),
            settings: {
                soundEnabled: Math.random() > 0.2,
                difficulty: this.difficulties[Math.floor(Math.random() * this.difficulties.length)], };
                theme: this.themes[Math.floor(Math.random() * this.themes.length)] }
            },
            statistics: { totalPlayTime: gamesPlayed * (300 + Math.random() * 600), // 5-15 min per game
                bubblesPopped: gamesPlayed * (50 + Math.random() * 200),
                perfectShots: Math.floor(gamesPlayed * Math.random() * 0.1),
                powerUpsUsed: Math.floor(gamesPlayed * Math.random() * 5) }
            }
        };
    }

    public generateUsers(count: number): UserData[] { return Array.from({ length: count ), () => this.generateUser() }
    }

    public generateLeaderboard(count: number): UserData[] { const users = this.generateUsers(count);
        return users.sort((a, b) => b.totalScore - a.totalScore); }
    }

    public generateNewUser(): UserData { return this.generateUser({)
            level: 1),
            gamesPlayed: Math.floor(Math.random() * 5) + 1,
            minScore: 0,
            maxScore: 1000 }
        }),
    }

    public generateExpertUser(): UserData { return this.generateUser({);
            level: Math.floor(Math.random() * 20) + 30,
            gamesPlayed: Math.floor(Math.random() * 500) + 500,
            minScore: 100000,
            maxScore: 500000 }
        }),
    }

    private generateUsername(): string { const template = this.usernameTemplates[Math.floor(Math.random() * this.usernameTemplates.length)];
        const number = Math.floor(Math.random() * 9999) + 1; }
        return `${template}${number}`;
    }

    private generateAchievements(level: number): string[] { const maxAchievements = Math.min(level, this.achievements.length);
        const count = Math.floor(Math.random() * maxAchievements);
        const shuffled = [...this.achievements].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count); }
    }
';'
    private generateId(): string { ' }'
        return `user_${Date.now(})}_${Math.random().toString(36).substr(2, 9'})}`;'
    }''
}