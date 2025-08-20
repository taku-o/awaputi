// Particle Renderer types
export interface Particle { isActive: boolean,
    alpha: number,
    x: number,
    y: number,
    rotation: number,
    scale: number,
    size: number,
    color: string,
    type: ParticleType,
    trail: TrailPoint[],
    zIndex?: number }
}

export interface TrailPoint { x: number,
    y: number,
    alpha: number }
}

export interface Viewport { x: number,
    y: number,
    width: number,
    height: number }
}

export interface RenderingStats { supportedTypes: string[],
    colorSets: number,
    renderingFeatures: string[] }
}

export interface ColorSets { [key: string]: string[], }
}

export type ParticleType = ;
    | 'circle' '';
    | 'star' '';
    | 'diamond' '';
    | 'spike' '';
    | 'lightning' '';
    | 'cloud' '';
    | 'ripple' '';
    | 'explosion';

export type DrawFunction = (context: CanvasRenderingContext2D, particle: Particle) => void;

/**
 * ParticleRenderer
 * パーティクルの描画・レンダリング・視覚効果の表現を担当
 */
export class ParticleRenderer {
    // @ts-ignore 将来のパーティクル管理機能で使用予定
    private __particleManager: any;
    private quality?: number;
    private customDrawFunctions?: Map<string, DrawFunction>;
'';
    constructor(particleManager: any') {
        this.__particleManager = particleManager;'
        ';
    }'
    }'
        console.log('[ParticleRenderer] Renderer initialized'); }
    }

    /**
     * パーティクル全体の描画処理
     * @param {CanvasRenderingContext2D} context レンダリングコンテキスト
     * @param {Particle[]} particles パーティクル配列
     */
    public render(context: CanvasRenderingContext2D, particles: Particle[]): void { context.save();
        
        particles.forEach(particle => { );
            if (!particle.isActive) return;
            
            context.save();
            context.globalAlpha = particle.alpha;
            context.translate(particle.x, particle.y);
            
            if (particle.rotation !== 0) { }
                context.rotate(particle.rotation); }
            }
            
            if (particle.scale !== 1) { context.scale(particle.scale, particle.scale); }
            }
            
            // トレイル描画
            this.renderTrail(context, particle);
            
            // パーティクル本体描画
            this.renderParticle(context, particle);
            
            context.restore();
        });
        
        context.restore();
    }

    /**
     * 個別パーティクルの描画
     * @param {CanvasRenderingContext2D} context レンダリングコンテキスト
     * @param {Particle} particle パーティクルオブジェクト
     */
    private renderParticle(context: CanvasRenderingContext2D, particle: Particle): void { context.fillStyle = particle.color;
        context.strokeStyle = particle.color;
        '';
        switch(particle.type') {'
            '';
            case 'circle':'';
                this.drawCircle(context, particle.size');
                break;'
                '';
            case 'star':'';
                this.drawStar(context, particle.size');
                break;'
                '';
            case 'diamond':'';
                this.drawDiamond(context, particle.size');
                break;'
                '';
            case 'spike':'';
                this.drawSpike(context, particle.size');
                break;'
                '';
            case 'lightning':'';
                this.drawLightning(context, particle.size');
                break;'
                '';
            case 'cloud':'';
                this.drawCloud(context, particle.size');
                break;'
                '';
            case 'ripple':'';
                this.drawRipple(context, particle.size');
                break;'
                '';
            case 'explosion':;
                this.drawExplosion(context, particle.size);
                break;
                
            default:;
                // デフォルトは円
                this.drawCircle(context, particle.size);
        }
                break; }
        }
    }

    /**
     * トレイル描画
     * @param {CanvasRenderingContext2D} context レンダリングコンテキスト
     * @param {Particle} particle パーティクルオブジェクト
     */
    private renderTrail(context: CanvasRenderingContext2D, particle: Particle): void { ''
        if (particle.trail.length < 2') return;
        
        context.strokeStyle = particle.color;'
        context.lineWidth = particle.size * 0.5;''
        context.lineCap = 'round';
        
        context.beginPath();
        context.moveTo(;
            particle.trail[0].x - particle.x);
            particle.trail[0].y - particle.y);
        
        for(let i = 1; i < particle.trail.length; i++) {
        
            const trailPoint = particle.trail[i];
            context.globalAlpha = trailPoint.alpha * (i / particle.trail.length);
            context.lineTo(;
                trailPoint.x - particle.x);
        }
                trailPoint.y - particle.y); }
        }
        
        context.stroke();
    }

    /**
     * 円形描画
     * @param {CanvasRenderingContext2D} context レンダリングコンテキスト
     * @param {number} size サイズ
     */
    private drawCircle(context: CanvasRenderingContext2D, size: number): void { context.beginPath();
        context.arc(0, 0, size, 0, Math.PI * 2);
        context.fill(); }
    }

    /**
     * 星形描画
     * @param {CanvasRenderingContext2D} context レンダリングコンテキスト
     * @param {number} size サイズ
     */
    private drawStar(context: CanvasRenderingContext2D, size: number): void { const spikes = 5;
        const outerRadius = size;
        const innerRadius = size * 0.5;
        
        context.beginPath();
        for(let i = 0; i < spikes * 2; i++) {
            const angle = (i * Math.PI) / spikes;
            const radius = i % 2 === 0 ? outerRadius: innerRadius,
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) {
        }
                context.moveTo(x, y); }
            } else { context.lineTo(x, y); }
            }
        }
        context.closePath();
        context.fill();
    }

    /**
     * ダイヤモンド描画
     * @param {CanvasRenderingContext2D} context レンダリングコンテキスト
     * @param {number} size サイズ
     */
    private drawDiamond(context: CanvasRenderingContext2D, size: number): void { context.beginPath();
        context.moveTo(0, -size);
        context.lineTo(size * 0.7, 0);
        context.lineTo(0, size);
        context.lineTo(-size * 0.7, 0);'
        context.closePath();''
        context.fill(''';
        context.strokeStyle = '#FFFFFF';)
        context.lineWidth = 1;)
        context.stroke(); }
    }

    /**
     * スパイク描画
     * @param {CanvasRenderingContext2D} context レンダリングコンテキスト
     * @param {number} size サイズ
     */
    private drawSpike(context: CanvasRenderingContext2D, size: number): void { context.beginPath();
        context.moveTo(0, -size);
        context.lineTo(size * 0.3, size * 0.3);
        context.lineTo(-size * 0.3, size * 0.3);
        context.closePath();
        context.fill(); }
    }

    /**
     * 稲妻描画
     * @param {CanvasRenderingContext2D} context レンダリングコンテキスト
     * @param {number} size サイズ'
     */''
    private drawLightning(context: CanvasRenderingContext2D, size: number'): void { context.lineWidth = size;''
        context.lineCap = 'round';
        
        context.beginPath();
        context.moveTo(-size, -size);
        context.lineTo(size * 0.5, 0);
        context.lineTo(-size * 0.5, size);
        context.stroke(); }
    }

    /**
     * 雲描画
     * @param {CanvasRenderingContext2D} context レンダリングコンテキスト
     * @param {number} size サイズ
     */
    private drawCloud(context: CanvasRenderingContext2D, size: number): void { context.globalAlpha *= 0.6;
        
        context.beginPath();
        context.arc(-size * 0.5, 0, size * 0.5, 0, Math.PI * 2);
        context.arc(size * 0.5, 0, size * 0.5, 0, Math.PI * 2);
        context.arc(0, -size * 0.3, size * 0.4, 0, Math.PI * 2);
        context.fill(); }
    }

    /**
     * 波紋描画
     * @param {CanvasRenderingContext2D} context レンダリングコンテキスト
     * @param {number} size サイズ
     */
    private drawRipple(context: CanvasRenderingContext2D, size: number): void { context.strokeStyle = context.fillStyle;
        context.lineWidth = 2;
        context.globalAlpha *= 0.5;
        
        context.beginPath();
        context.arc(0, 0, size, 0, Math.PI * 2);
        context.stroke(); }
    }

    /**
     * 爆発描画
     * @param {CanvasRenderingContext2D} context レンダリングコンテキスト
     * @param {number} size サイズ
     */
    private drawExplosion(context: CanvasRenderingContext2D, size: number): void { // 不規則な爆発形状
        context.beginPath();
        for(let i = 0; i < 8; i++) {
            const angle = (i * Math.PI * 2) / 8;
            const radius = size * (0.8 + Math.random() * 0.4);
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) {
        }
                context.moveTo(x, y); }
            } else { context.lineTo(x, y); }
            }
        }
        context.closePath();
        context.fill();
    }

    /**
     * パーティクルタイプ別の色を取得
     * @param {string} bubbleType バブルタイプ
     * @returns {string[]} 色の配列
     */''
    public getBubbleColors(bubbleType: string'): string[] { const colorSets: ColorSets = {''
            normal: ['#4A90E2', '#7ED321', '#50E3C2'],'';
            stone: ['#8E8E93', '#C7C7CC', '#EFEFF4'],'';
            iron: ['#8B4513', '#A0522D', '#CD853F'],'';
            diamond: ['#E6E6FA', '#F8F8FF', '#FFFFFF'],'';
            rainbow: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'],'';
            pink: ['#FF69B4', '#FFB6C1', '#FFC0CB'],'';
            clock: ['#FFD700', '#FFA500', '#FF8C00'],'';
            electric: ['#FFFF00', '#00FFFF', '#FFFFFF'],'';
            poison: ['#32CD32', '#00FF00', '#98FB98'],'';
            spiky: ['#FF4500', '#FF6347', '#FF7F50'],'';
            cracked: ['#A0A0A0', '#808080', '#C0C0C0'],'';
            escaping: ['#DDA0DD', '#DA70D6', '#BA55D3'],'';
            boss: ['#8B0000', '#DC143C', '#FF0000'],'';
            score: ['#FFD700', '#FFA500', '#FF8C00'] }
        };
        
        return colorSets[bubbleType] || colorSets.normal;
    }

    /**
     * レンダリング統計の取得
     * @returns {RenderingStats} レンダリング統計'
     */''
    public getRenderingStats(''';
                'circle', 'star', 'diamond', 'spike', 'lightning','';
                'cloud', 'ripple', 'explosion';
            ]);
            colorSets: 14)';
            renderingFeatures: ['';
                'Trail rendering','';
                'Multi-shape support','';
                'Alpha blending','';
                'Transform matrices',']';
                'Color variations'];
            ];
        };
    }

    /**
     * 描画品質の設定
     * @param {number} quality 品質レベル (0.1 - 1.0)
     */
    public setRenderingQuality(quality: number): void { this.quality = Math.max(0.1, Math.min(1.0, quality); }
        console.log(`[ParticleRenderer] Rendering quality set to: ${this.quality)`});
    }

    /**
     * カスタム描画関数の登録
     * @param {string} type パーティクルタイプ
     * @param {DrawFunction} drawFunction 描画関数'
     */''
    public registerCustomDrawFunction(type: string, drawFunction: DrawFunction'): void { ''
        if(typeof drawFunction !== 'function'') {'
            ';'
        }'
            throw new Error('Draw function must be a function'); }
        }
        
        if (!this.customDrawFunctions) { this.customDrawFunctions = new Map(); }
        }
        
        this.customDrawFunctions.set(type, drawFunction);
        console.log(`[ParticleRenderer] Custom draw function registered for type: ${type}`);
    }

    /**
     * カスタム描画関数の実行
     * @param {CanvasRenderingContext2D} context レンダリングコンテキスト
     * @param {Particle} particle パーティクルオブジェクト
     * @returns {boolean} カスタム描画が実行されたか
     */
    public executeCustomDrawFunction(context: CanvasRenderingContext2D, particle: Particle): boolean { if(this.customDrawFunctions && this.customDrawFunctions.has(particle.type) {
            const drawFunction = this.customDrawFunctions.get(particle.type);
            if(drawFunction) {
                try {
                    drawFunction(context, particle);
            }
                    return true; }
                } catch (error) {
                    console.error(`[ParticleRenderer] Custom draw function error for type ${particle.type}:`, error);
                    return false;
                }
            }
        }
        return false;
    }

    /**
     * パフォーマンス最適化された描画
     * @param {CanvasRenderingContext2D} context レンダリングコンテキスト
     * @param {Particle[]} particles パーティクル配列
     * @param {Viewport | null} viewport ビューポート情報
     */
    public renderOptimized(context: CanvasRenderingContext2D, particles: Particle[], viewport: Viewport | null = null): void { context.save();
        
        // ビューポートカリング
        const visibleParticles = viewport ?   : undefined;
            particles.filter(p => this.isParticleVisible(p, viewport) : ;
            particles;
        
        // パーティクルタイプでソートして描画状態変更を最小化
        const sortedParticles = this.sortParticlesForOptimalRendering(visibleParticles);
        
        let currentType: string | null = null,
        
        sortedParticles.forEach(particle => { );
            if (!particle.isActive) return;
            
            // タイプが変わった場合のみ描画状態をリセット
            if(particle.type !== currentType) {
                
            }
                currentType = particle.type; }
                this.prepareRenderingStateForType(context, currentType); }
            }
            
            context.save();
            context.globalAlpha = particle.alpha;
            context.translate(particle.x, particle.y);
            
            if (particle.rotation !== 0) { context.rotate(particle.rotation); }
            }
            
            if (particle.scale !== 1) { context.scale(particle.scale, particle.scale); }
            }
            
            this.renderParticle(context, particle);
            context.restore();
        });
        
        context.restore();
    }

    /**
     * パーティクルがビューポート内に見えるかチェック
     * @param {Particle} particle パーティクル
     * @param {Viewport} viewport ビューポート
     * @returns {boolean} 見えるかどうか
     */
    private isParticleVisible(particle: Particle, viewport: Viewport): boolean { const margin = particle.size * 2; // マージンを考慮
        return particle.x + margin >= viewport.x &&;
               particle.x - margin <= viewport.x + viewport.width &&;
               particle.y + margin >= viewport.y &&;
               particle.y - margin <= viewport.y + viewport.height; }
    }

    /**
     * 最適なレンダリングのためのパーティクルソート
     * @param {Particle[]} particles パーティクル配列
     * @returns {Particle[]} ソートされたパーティクル配列
     */
    private sortParticlesForOptimalRendering(particles: Particle[]): Particle[] { return particles.sort((a, b) => { 
            // タイプでソート（同じタイプをまとめる）
            if (a.type !== b.type) { }
                return a.type.localeCompare(b.type); }
            }
            // 同じタイプ内では深度（z-order）でソート
            return (a.zIndex || 0) - (b.zIndex || 0);
        });
    }

    /**
     * パーティクルタイプ用の描画状態準備
     * @param {CanvasRenderingContext2D} context レンダリングコンテキスト
     * @param {string} type パーティクルタイプ
     */
    private prepareRenderingStateForType(context: CanvasRenderingContext2D, type: string): void { // タイプ別の最適化された描画状態設定
        switch(type') {'
            '';
            case 'lightning':'';
                context.lineCap = 'round';''
                context.lineJoin = 'round';'
                break;''
            case 'cloud':'';
                context.globalCompositeOperation = 'multiply';'
                break;''
            case 'ripple':'';
                context.globalCompositeOperation = 'screen';'
                break;''
            default: context.globalCompositeOperation = 'source-over' }
                break; }
        }
    }

    /**
     * クリーンアップ
     */'
    public cleanup(): void { if (this.customDrawFunctions) {''
            this.customDrawFunctions.clear()';
        console.log('[ParticleRenderer] Cleanup completed''); }'
    }''
}