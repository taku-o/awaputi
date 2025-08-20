/**
 * Performance Chart
 * パフォーマンスメトリクス用のリアルタイムチャート
 */

interface ChartConfig { label?: string;
    color?: string;
    backgroundColor?: string;
    min?: number;
    max?: number;
    warning?: number;
    critical?: number;
    samples?: number;
    gridLines?: number;
    key?: string; }
}

interface DataPoint { value: number,
    timestamp: number; }
}

interface ChartPadding { top: number,
    right: number,
    bottom: number,
    left: number; }
}

interface ChartArea { x: number,
    y: number,
    width: number,
    height: number; }
}

interface Metrics { [key: string]: number, }
}

export class PerformanceChart {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private config: Required<ChartConfig>;
    private dataPoints: DataPoint[] = [];
    private maxDataPoints: number;
    private padding: ChartPadding;
    private chartArea: ChartArea;
    private animationId: number | null = null;
    private lastUpdate: number = 0;
    constructor(canvas: HTMLCanvasElement, config: ChartConfig = {) {

        this.canvas = canvas;
        const context = canvas.getContext('2d');''
        if (!context') {'

    }
    }'
            throw new Error('Failed to get 2D context from canvas''); }
        }
        this.ctx = context;
        ';
        this.config = { ''
            label: 'Metric','';
            color: '#00ff00','';
            backgroundColor: 'rgba(0, 255, 0, 0.1')',
            min: 0,
            max: 100,
            warning: 80,
            critical: 90,
            samples: 100,';
            gridLines: 5,'';
            key: '',
            ...config }
        };
        
        this.maxDataPoints = this.config.samples;
        
        // 描画設定
        this.padding = { top: 20, right: 20, bottom: 30, left: 50 }
        this.chartArea = { x: this.padding.left,
            y: this.padding.top,
            width: this.canvas.width - this.padding.left - this.padding.right,
            height: this.canvas.height - this.padding.top - this.padding.bottom }
        },
        
        this.setupCanvas();
        this.render();
    }'
'';
    private setupCanvas(''';
        this.ctx.lineCap = 'round';''
        this.ctx.lineJoin = 'round';
    }
);
    update(metrics: Metrics): void { const key = this.config.key || Object.keys(metrics)[0];
        const value = metrics[key];
        
        if(value !== undefined) {
        
            const now = Date.now();
            this.dataPoints.push({)
                value,);
                timestamp: now),
            
            // データポイント数の制限
            if (this.dataPoints.length > this.maxDataPoints) {
        
        }
                this.dataPoints.shift(); }
            }
            
            // 適度な頻度で再描画
            if(now - this.lastUpdate > 50) {
                // 20FPS
                this.render();
            }
                this.lastUpdate = now; }
            }
        }
    }

    private render(): void { this.clear();
        this.drawBackground();
        this.drawGrid();
        this.drawThresholdLines();
        this.drawDataLine();
        this.drawDataPoints();
        this.drawLabels();
        this.drawLegend(); }
    }

    private clear(): void { this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); }
    }'
'';
    private drawBackground('')';
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3')';
        this.ctx.fillRect(;
            this.chartArea.x, );
            this.chartArea.y);
            this.chartArea.width, )';
            this.chartArea.height)'';
        ');
        ';
        // チャート境界線''
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(;
            this.chartArea.x, );
            this.chartArea.y);
            this.chartArea.width, );
            this.chartArea.height);
    }'
'';
    private drawGrid(''';
        this.ctx.strokeStyle = '#222';
        this.ctx.lineWidth = 1;
        
        // 水平グリッド線)
        for(let i = 0; i <= this.config.gridLines; i++) {
            const y = this.chartArea.y + (this.chartArea.height / this.config.gridLines) * i;
            
            this.ctx.beginPath();
            this.ctx.moveTo(this.chartArea.x, y);
            this.ctx.lineTo(this.chartArea.x + this.chartArea.width, y);
        }
            this.ctx.stroke(); }
        }
        
        // 垂直グリッド線
        const verticalLines = 5;
        for(let i = 0; i <= verticalLines; i++) {
            const x = this.chartArea.x + (this.chartArea.width / verticalLines) * i;
            
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.chartArea.y);
            this.ctx.lineTo(x, this.chartArea.y + this.chartArea.height);
        }
            this.ctx.stroke(); }
        }
    }'
'';
    private drawThresholdLines('')';
        this.drawThresholdLine(this.config.warning, '#ffaa00', 'Warning'');
        ';
        // 危険ライン''
        this.drawThresholdLine(this.config.critical, '#ff3333', 'Critical');
    }

    private drawThresholdLine(value: number, color: string, label: string): void { const y = this.valueToY(value);
        
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]);
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.chartArea.x, y);'
        this.ctx.lineTo(this.chartArea.x + this.chartArea.width, y);''
        this.ctx.stroke('')';
        this.ctx.font = '10px monospace';)
        this.ctx.fillText() }
            `${label}: ${ value)`,
            this.chartArea.x + this.chartArea.width - 80,
            y - 5;
        );
        
        // 線のダッシュをリセット }
        this.ctx.setLineDash([]});
    }

    private drawDataLine(): void { if (this.dataPoints.length < 2) return;
        
        this.ctx.strokeStyle = this.config.color;
        this.ctx.lineWidth = 2;
        
        this.ctx.beginPath();
        
        for(let i = 0; i < this.dataPoints.length; i++) {
        
            const x = this.indexToX(i);
            const y = this.valueToY(this.dataPoints[i].value);
            
            if (i === 0) {
        
        }
                this.ctx.moveTo(x, y); }
            } else { this.ctx.lineTo(x, y); }
            }
        }
        
        this.ctx.stroke();
        
        // エリア塗りつぶし
        if(this.config.backgroundColor) {
            this.ctx.fillStyle = this.config.backgroundColor;
            
            // 下側を閉じる
            const lastX = this.indexToX(this.dataPoints.length - 1);
            const firstX = this.indexToX(0);
            const bottomY = this.chartArea.y + this.chartArea.height;
            
            this.ctx.lineTo(lastX, bottomY);
            this.ctx.lineTo(firstX, bottomY);
            this.ctx.closePath();
        }
            this.ctx.fill(); }
        }
    }

    private drawDataPoints(): void { this.ctx.fillStyle = this.config.color;
        
        for(let i = 0; i < this.dataPoints.length; i++) {
        
            const x = this.indexToX(i);
            const y = this.valueToY(this.dataPoints[i].value);
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 2, 0, Math.PI * 2);
        
        }
            this.ctx.fill(); }
        }
    }'
'';
    private drawLabels(''';
        this.ctx.fillStyle = '#ccc';''
        this.ctx.font = '11px monospace';
        
        // Y軸ラベル)
        for(let i = 0; i <= this.config.gridLines; i++) {
            const value = this.config.max - (this.config.max - this.config.min) * (i / this.config.gridLines);
            const y = this.chartArea.y + (this.chartArea.height / this.config.gridLines) * i;
            
            this.ctx.fillText();
                value.toFixed(1),
                this.padding.left - 40,
                y + 4;
        }
            ); }
        }
        
        // X軸ラベル（時間）
        const timeLabels = 3;
        for(let i = 0; i <= timeLabels; i++) {
            const x = this.chartArea.x + (this.chartArea.width / timeLabels) * i;
            const pointIndex = Math.floor((this.dataPoints.length - 1) * (i / timeLabels));
            
            if (this.dataPoints[pointIndex]) {
                const time = new Date(this.dataPoints[pointIndex].timestamp);
                const timeStr = time.toLocaleTimeString().substr(-8, 5); // HH:MM
                
                this.ctx.fillText(;
                    timeStr);
                    x - 15,);
        }
                    this.chartArea.y + this.chartArea.height + 20); }
            }
        }
    }'
'';
    private drawLegend(''';
        this.ctx.fillStyle = '#fff';''
        this.ctx.font = 'bold 12px monospace';)
        this.ctx.fillText(this.config.label, this.chartArea.x, 15);
        
        // 現在値
        if(this.dataPoints.length > 0) {
            const currentValue = this.dataPoints[this.dataPoints.length - 1].value;
            this.ctx.fillStyle = this.config.color;
        }
            this.ctx.fillText() }
                `Current: ${currentValue.toFixed(1})}`,
                this.chartArea.x + this.chartArea.width - 100,
                15;
            );
        }
        
        // 統計値
        if(this.dataPoints.length > 0) {
            const values = this.dataPoints.map(p => p.value);
            const min = Math.min(...values);'
            const max = Math.max(...values);''
            const avg = values.reduce((a, b) => a + b, 0') / values.length;'
            '';
            this.ctx.fillStyle = '#aaa';''
            this.ctx.font = '10px monospace';
            
        }
            const statsY = this.chartArea.y + this.chartArea.height + 45; }
            this.ctx.fillText(`Min: ${min.toFixed(1})}`, this.chartArea.x, statsY);
            this.ctx.fillText(`Max: ${max.toFixed(1})}`, this.chartArea.x + 80, statsY);
            this.ctx.fillText(`Avg: ${avg.toFixed(1})}`, this.chartArea.x + 160, statsY);
        }
    }

    private valueToY(value: number): number { const normalizedValue = (value - this.config.min) / (this.config.max - this.config.min);
        const clampedValue = Math.max(0, Math.min(1, normalizedValue);
        return this.chartArea.y + this.chartArea.height * (1 - clampedValue); }
    }

    private indexToX(index: number): number { if (this.dataPoints.length <= 1) {
            return this.chartArea.x + this.chartArea.width / 2; }
        }
        
        const ratio = index / (this.dataPoints.length - 1);
        return this.chartArea.x + this.chartArea.width * ratio;
    }

    // Public methods for external control

    updateThresholds(warning: number, critical: number): void { this.config.warning = warning;
        this.config.critical = critical;
        this.render(); }
    }

    setMinMax(min: number, max: number): void { this.config.min = min;
        this.config.max = max;
        this.render(); }
    }

    clear(): void { this.dataPoints = [];
        this.render(); }
    }

    resize(width: number, height: number): void { this.canvas.width = width;
        this.canvas.height = height;
        
        // チャートエリアを再計算
        this.chartArea = {
            x: this.padding.left,
            y: this.padding.top,
            width: this.canvas.width - this.padding.left - this.padding.right,
            height: this.canvas.height - this.padding.top - this.padding.bottom }
        },
        
        this.setupCanvas();
        this.render();
    }

    getDataPoints(): DataPoint[] { return [...this.dataPoints]; }
    }

    getConfig(): Required<ChartConfig> {
        return { ...this.config };
    }
';
    destroy(): void { if (this.animationId) {''
            cancelAnimationFrame(this.animationId');
            this.animationId = null; }
        }
        this.dataPoints = [];'
    }''
}