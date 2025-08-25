import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';
/**
 * DataVisualizer のテスト
 */
import { DataVisualizer } from '../../src/analytics/DataVisualizer';

// D3.js のモック
const mockD3 = {
    select: jest.fn(() => ({
        select: jest.fn(() => ({
            remove: jest.fn()
        })),
        selectAll: jest.fn(() => ({
            data: jest.fn(() => ({
                enter: jest.fn(() => ({
                    append: jest.fn(() => ({
                        attr: jest.fn(() => ({
                            attr: jest.fn(() => ({
                                style: jest.fn(() => ({
                                    text: jest.fn(),
                                    on: jest.fn(),
                                    transition: jest.fn(() => ({
                                        duration: jest.fn(() => ({
                                            attr: jest.fn(),
                                            style: jest.fn()
                                        }))
                                    }))
                                }))
                            }))
                        })),
                        style: jest.fn(() => ({
                            attr: jest.fn(),
                            style: jest.fn(),
                            text: jest.fn(),
                            on: jest.fn()
                        })),
                        text: jest.fn(),
                        call: jest.fn(),
                        datum: jest.fn(() => ({
                            attr: jest.fn(() => ({
                                style: jest.fn()
                            }))
                        }))
                    }))
                }))
            }))
        })),
        remove: jest.fn(),
        append: jest.fn(() => ({
            attr: jest.fn(() => ({
                attr: jest.fn(() => ({
                    append: jest.fn(() => ({
                        attr: jest.fn(() => ({
                            call: jest.fn(),
                            text: jest.fn(),
                            style: jest.fn()
                        })),
                        style: jest.fn(() => ({
                            text: jest.fn()
                        })),
                        text: jest.fn()
                    }))
                }))
            }))
        }))
    })),
    scaleLinear: jest.fn(() => ({
        domain: jest.fn(() => ({
            range: jest.fn(() => ({
                nice: jest.fn(() => ({
                    range: jest.fn()
                }))
            }))
        })),
        range: jest.fn()
    })),
    scaleTime: jest.fn(() => ({
        domain: jest.fn(() => ({
            range: jest.fn()
        }))
    })),
    scaleBand: jest.fn(() => ({
        domain: jest.fn(() => ({
            range: jest.fn()
        }))
    })),
    scaleSequential: jest.fn(() => ({
        domain: jest.fn()
    })),
    scaleOrdinal: jest.fn(),
    extent: jest.fn(() => [0, 100]),
    axisBottom: jest.fn(),
    axisLeft: jest.fn(),
    line: jest.fn(() => ({
        x: jest.fn(() => ({
            y: jest.fn(() => ({
                curve: jest.fn()
            }))
        }))
    })),
    area: jest.fn(() => ({
        x: jest.fn(() => ({
            y0: jest.fn(() => ({
                y1: jest.fn(() => ({
                    curve: jest.fn()
                }))
            }))
        }))
    })),
    forceSimulation: jest.fn(() => ({
        force: jest.fn(() => ({
            force: jest.fn(() => ({
                force: jest.fn()
            }))
        })),
        on: jest.fn(),
        alphaTarget: jest.fn(() => ({
            restart: jest.fn()
        })),
        stop: jest.fn()
    })),
    forceLink: jest.fn(() => ({
        id: jest.fn(() => ({
            distance: jest.fn()
        }))
    })),
    forceManyBody: jest.fn(() => ({
        strength: jest.fn()
    })),
    forceCenter: jest.fn(),
    drag: jest.fn(() => ({
        on: jest.fn(() => ({
            on: jest.fn(() => ({
                on: jest.fn()
            }))
        }))
    })),
    transition: jest.fn(() => ({
        duration: jest.fn(() => ({
            ease: jest.fn()
        }))
    })),
    timeParse: jest.fn(() => jest.fn(d => new Date(d))),
    timeFormat: jest.fn(() => jest.fn()),
    interpolateViridis: jest.fn(),
    schemeCategory10: ['#1f77b4', '#ff7f0e', '#2ca02c'],
    easeCircleOut: jest.fn(),
    curveMonotoneX: jest.fn()
};

(global as any).d3 = mockD3;

// DOM のモック
Object.defineProperty(global, 'document', {
    value: {
        getElementById: jest.fn(),
        createElement: jest.fn(() => ({
            id: '',
            width: 500,
            height: 400
        })),
        head: {
            appendChild: jest.fn()
        }
    }
});

// ブラウザ API のモック
Object.defineProperty(global, 'window', {
    value: {
        d3: mockD3
    }
});

describe('DataVisualizer', () => {
    let dataVisualizer: any;
    let mockContainer: any;

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockContainer = {
            id: 'test-container',
            appendChild: jest.fn()
        };

        (document.getElementById as jest.Mock).mockReturnValue(mockContainer);
        
        dataVisualizer = new DataVisualizer({
            animationDuration: 100, // テスト用に短縮
            defaultWidth: 400,
            defaultHeight: 300
        });

        // D3.jsが読み込まれたとして設定
        dataVisualizer.d3 = mockD3;
        dataVisualizer.colorScale = jest.fn(i => `color-${i}`);
        dataVisualizer.transition = {
            duration: jest.fn(() => ({
                ease: jest.fn()
            }))
        };
    });

    afterEach(() => {
        if (dataVisualizer) {
            dataVisualizer.destroy();
        }
    });

    describe('初期化', () => {
        test('正しく初期化される', () => {
            expect(dataVisualizer).toBeDefined();
            expect(dataVisualizer.visualizations).toBeInstanceOf(Map);
            expect(dataVisualizer.svgElements).toBeInstanceOf(Map);
            expect(dataVisualizer.scales).toBeInstanceOf(Map);
        });

        test('オプションが正しく設定される', () => {
            const customVisualizer = new DataVisualizer({
                defaultWidth: 600,
                defaultHeight: 500,
                enableInteractivity: false,
                colorScheme: 'viridis'
            });
            
            expect(customVisualizer.options.defaultWidth).toBe(600);
            expect(customVisualizer.options.defaultHeight).toBe(500);
            expect(customVisualizer.options.enableInteractivity).toBe(false);
            expect(customVisualizer.options.colorScheme).toBe('viridis');
            
            customVisualizer.destroy();
        });
    });

    describe('D3.js セットアップ', () => {
        test('D3.jsデフォルト設定が適用される', () => {
            dataVisualizer.setupD3Defaults();
            expect(dataVisualizer.colorScale).toBeDefined();
            expect(dataVisualizer.transition).toBeDefined();
        });

        test('D3.jsが利用できない場合はフォールバック', () => {
            const fallbackVisualizer = new DataVisualizer();
            fallbackVisualizer.fallbackToCanvasRenderer();
            expect(fallbackVisualizer.useCanvasFallback).toBe(true);
        });
    });

    describe('散布図作成', () => {
        test('散布図を作成できる', () => {
            const testData = [
                { x: 10, y: 20, category: 'A' },
                { x: 15, y: 25, category: 'B' },
                { x: 20, y: 30, category: 'A' }
            ];
            
            const config = {
                xAxisLabel: 'X軸テスト',
                yAxisLabel: 'Y軸テスト',
                pointRadius: 5
            };
            
            const visualization = dataVisualizer.createScatterPlot('test-scatter', testData, config);
            expect(visualization).toBeDefined();
            expect(visualization.type).toBe('scatter');
            expect(dataVisualizer.visualizations.has('test-scatter')).toBe(true);
            expect(mockD3.scaleLinear).toHaveBeenCalled();
            expect(mockD3.axisBottom).toHaveBeenCalled();
            expect(mockD3.axisLeft).toHaveBeenCalled();
        });

        test('データが空の場合はnullを返す', () => {
            const result = dataVisualizer.createScatterPlot('empty-scatter', []);
            expect(result).toBe(null);
        });

        test('コンテナが存在しない場合はnullを返す', () => {
            (document.getElementById as jest.Mock).mockReturnValue(null);
            const result = dataVisualizer.createScatterPlot('missing-container', [{ x: 1, y: 2 }]);
            expect(result).toBe(null);
        });
    });

    describe('ヒートマップ作成', () => {
        test('ヒートマップを作成できる', () => {
            const testData = [
                { x: 'A', y: '1', value: 10 },
                { x: 'B', y: '1', value: 20 },
                { x: 'A', y: '2', value: 15 },
                { x: 'B', y: '2', value: 25 }
            ];
            
            const visualization = dataVisualizer.createHeatmap('test-heatmap', testData, {});
            expect(visualization).toBeDefined();
            expect(visualization.type).toBe('heatmap');
            expect(dataVisualizer.visualizations.has('test-heatmap')).toBe(true);
            expect(mockD3.scaleBand).toHaveBeenCalled();
            expect(mockD3.scaleSequential).toHaveBeenCalled();
        });

        test('カラースケールが正しく設定される', () => {
            const testData = [{ x: 'A', y: '1', value: 10 }];
            
            dataVisualizer.createHeatmap('heatmap-color', testData);
            expect(dataVisualizer.scales.has('heatmap-color-color')).toBe(true);
        });
    });

    describe('ネットワーク図作成', () => {
        test('ネットワーク図を作成できる', () => {
            const testData = {
                nodes: [
                    { id: 'A', group: 1, value: 10 },
                    { id: 'B', group: 2, value: 20 }
                ],
                links: [
                    { source: 'A', target: 'B', value: 1 }
                ]
            };
            
            const config = {
                linkDistance: 50,
                charge: -200
            };
            
            const visualization = dataVisualizer.createNetworkDiagram('test-network', testData, config);
            expect(visualization).toBeDefined();
            expect(visualization.type).toBe('network');
            expect(dataVisualizer.visualizations.has('test-network')).toBe(true);
            expect(mockD3.forceSimulation).toHaveBeenCalledWith(testData.nodes);
        });

        test('ノードとリンクが欠如している場合はnullを返す', () => {
            const invalidData = { nodes: [] }; // linksがない
            const result = dataVisualizer.createNetworkDiagram('invalid-network', invalidData);
            expect(result).toBe(null);
        });
    });

    describe('時系列チャート作成', () => {
        test('時系列チャートを作成できる', () => {
            const testData = [
                { date: '2023-01-01', value: 10 },
                { date: '2023-01-02', value: 15 },
                { date: '2023-01-03', value: 12 }
            ];
            
            const config = {
                timeFormat: '%Y-%m-%d',
                tickFormat: '%m/%d',
                showArea: true,
                showPoints: true
            };
            
            const visualization = dataVisualizer.createTimeSeriesChart('test-timeseries', testData, config);
            expect(visualization).toBeDefined();
            expect(visualization.type).toBe('timeseries');
            expect(dataVisualizer.visualizations.has('test-timeseries')).toBe(true);
            expect(mockD3.scaleTime).toHaveBeenCalled();
            expect(mockD3.line).toHaveBeenCalled();
            expect(mockD3.area).toHaveBeenCalled(); // showArea: true
        });

        test('データの前処理が正しく行われる', () => {
            const testData = [
                { date: '2023-01-01', value: '10' }, // 文字列の値
                { date: '2023-01-02', value: '15' }
            ];
            
            dataVisualizer.createTimeSeriesChart('preprocessing-test', testData);
            
            // 数値変換が行われることを確認
            testData.forEach((d: any) => {
                expect(typeof d.value).toBe('number');
                expect(d.date).toBeInstanceOf(Date);
            });
        });
    });

    describe('SVG作成', () => {
        test('SVG要素を作成できる', () => {
            const svg = dataVisualizer.createSVG('test-svg', { width: 300, height: 200 });
            expect(svg).toBeDefined();
            expect(dataVisualizer.svgElements.has('test-svg')).toBe(true);
            expect(mockD3.select).toHaveBeenCalledWith(mockContainer);
        });

        test('既存のSVGを削除してから作成する', () => {
            const mockSelectChain = {
                select: jest.fn(() => ({
                    remove: jest.fn()
                })),
                append: jest.fn(() => ({
                    attr: jest.fn(() => ({
                        attr: jest.fn(() => ({
                            append: jest.fn(() => ({
                                attr: jest.fn()
                            }))
                        }))
                    }))
                }))
            };
            
            mockD3.select.mockReturnValue(mockSelectChain);
            dataVisualizer.createSVG('cleanup-test', {});
            expect(mockSelectChain.select).toHaveBeenCalledWith('svg');
        });
    });

    describe('インタラクティブ機能', () => {
        test('インタラクティブ機能が有効な場合、イベントリスナーが追加される', () => {
            dataVisualizer.options.enableInteractivity = true;
            
            const mockSelection = {
                on: jest.fn(() => mockSelection)
            };
            
            dataVisualizer.addInteractivity(mockSelection, {});
            expect(mockSelection.on).toHaveBeenCalledWith('mouseover', expect.any(Function));
            expect(mockSelection.on).toHaveBeenCalledWith('mouseout', expect.any(Function));
            expect(mockSelection.on).toHaveBeenCalledWith('click', expect.any(Function));
        });

        test('インタラクティブ機能が無効な場合、何も追加されない', () => {
            dataVisualizer.options.enableInteractivity = false;
            
            const mockSelection = {
                on: jest.fn()
            };
            
            dataVisualizer.addInteractivity(mockSelection, {});
            expect(mockSelection.on).not.toHaveBeenCalled();
        });

        test('カスタムツールチップフォーマッターが使用される', () => {
            dataVisualizer.options.enableInteractivity = true;
            
            const mockSelection = {
                on: jest.fn((event: string, callback: any) => {
                    if (event === 'mouseover') {
                        // mouseoverイベントをシミュレート
                        const mockEvent = { pageX: 100, pageY: 200, currentTarget: {} };
                        const mockData = { value: 42 };
                        callback(mockEvent, mockData);
                    }
                    return mockSelection;
                })
            };
            
            const config = {
                tooltipFormatter: (d: any) => `カスタム: ${d.value}`
            };
            
            // ツールチップのモック
            const mockTooltip = {
                transition: jest.fn(() => ({
                    duration: jest.fn(() => ({
                        style: jest.fn()
                    }))
                })),
                html: jest.fn(() => mockTooltip),
                style: jest.fn(() => mockTooltip)
            };
            
            mockD3.select.mockReturnValue({
                append: jest.fn(() => ({
                    attr: jest.fn(() => ({
                        style: jest.fn(() => mockTooltip)
                    }))
                }))
            });
            
            dataVisualizer.addInteractivity(mockSelection, config);
            expect(mockSelection.on).toHaveBeenCalledWith('mouseover', expect.any(Function));
        });
    });

    describe('可視化更新', () => {
        test('散布図を更新できる', () => {
            // 散布図を作成
            const initialData = [{ x: 1, y: 2 }];
            dataVisualizer.createScatterPlot('update-test', initialData);
            
            // updateScatterPlotメソッドをモック
            dataVisualizer.updateScatterPlot = jest.fn(() => true);
            
            const newData = [{ x: 2, y: 3 }, { x: 4, y: 5 }];
            const result = dataVisualizer.updateVisualization('update-test', newData);
            
            expect(result).toBe(true);
            expect(dataVisualizer.updateScatterPlot).toHaveBeenCalledWith('update-test', newData, {});
        });

        test('存在しない可視化の更新は失敗する', () => {
            const result = dataVisualizer.updateVisualization('non-existent', []);
            expect(result).toBe(false);
        });

        test('サポートされていない可視化タイプの警告', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
            
            // 未サポートのタイプを設定
            dataVisualizer.visualizations.set('unsupported-test', { type: 'unknown' });
            
            const result = dataVisualizer.updateVisualization('unsupported-test', []);
            expect(result).toBe(false);
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Update not implemented for visualization type: unknown')
            );
            
            consoleSpy.mockRestore();
        });
    });

    describe('寸法とコンテナ管理', () => {
        test('デフォルト寸法を取得できる', () => {
            const dimensions = dataVisualizer.getDimensions();
            expect(dimensions.width).toBe(400);
            expect(dimensions.height).toBe(300);
        });

        test('カスタム寸法を取得できる', () => {
            const dimensions = dataVisualizer.getDimensions({ width: 600, height: 500 });
            expect(dimensions.width).toBe(600);
            expect(dimensions.height).toBe(500);
        });

        test('コンテナ要素を取得できる', () => {
            const container = dataVisualizer.getContainer('test-container');
            expect(document.getElementById).toHaveBeenCalledWith('test-container');
            expect(container).toBe(mockContainer);
        });
    });

    describe('統計機能', () => {
        test('可視化統計を取得できる', () => {
            dataVisualizer.createScatterPlot('stats-scatter', [{ x: 1, y: 2 }]);
            dataVisualizer.createHeatmap('stats-heatmap', [{ x: 'A', y: '1', value: 10 }]);
            
            const stats = dataVisualizer.getVisualizationStatistics();
            expect(stats.totalVisualizations).toBe(2);
            expect(stats.visualizationTypes).toEqual({ scatter: 1, heatmap: 1 });
            expect(stats.d3Available).toBe(true);
            expect(stats.memoryEstimate).toBeDefined();
        });

        test('メモリ使用量を推定できる', () => {
            dataVisualizer.createScatterPlot('memory-test', [{ x: 1, y: 2 }]);
            
            const memoryUsage = dataVisualizer.estimateMemoryUsage();
            expect(memoryUsage.visualizationCount).toBe(1);
            expect(memoryUsage.svgElementCount).toBe(1);
            expect(memoryUsage.estimatedMemoryKB).toBeGreaterThan(0);
        });
    });

    describe('リソース管理', () => {
        test('個別の可視化を削除できる', () => {
            dataVisualizer.createScatterPlot('destroy-test', [{ x: 1, y: 2 }]);
            expect(dataVisualizer.visualizations.has('destroy-test')).toBe(true);
            
            dataVisualizer.destroyVisualization('destroy-test');
            expect(dataVisualizer.visualizations.has('destroy-test')).toBe(false);
        });

        test('ネットワーク図のシミュレーションを停止する', () => {
            const testData = {
                nodes: [{ id: 'A' }],
                links: []
            };
            
            const visualization = dataVisualizer.createNetworkDiagram('network-destroy', testData);
            expect(visualization.simulation.stop).toBeDefined();
            
            dataVisualizer.destroyVisualization('network-destroy');
            expect(visualization.simulation.stop).toHaveBeenCalled();
        });

        test('destroy()で全リソースを解放する', () => {
            dataVisualizer.createScatterPlot('test1', [{ x: 1, y: 2 }]);
            dataVisualizer.createHeatmap('test2', [{ x: 'A', y: '1', value: 10 }]);
            
            expect(dataVisualizer.visualizations.size).toBe(2);
            expect(dataVisualizer.svgElements.size).toBe(2);
            
            dataVisualizer.destroy();
            
            expect(dataVisualizer.visualizations.size).toBe(0);
            expect(dataVisualizer.svgElements.size).toBe(0);
            expect(dataVisualizer.scales.size).toBe(0);
        });

        test('ツールチップを削除する', () => {
            const mockSelectAll = jest.fn(() => ({
                remove: jest.fn()
            }));
            
            mockD3.selectAll = mockSelectAll;
            dataVisualizer.d3 = mockD3;
            
            dataVisualizer.destroy();
            
            expect(mockSelectAll).toHaveBeenCalledWith('.tooltip, .heatmap-tooltip');
        });
    });

    describe('エラーハンドリング', () => {
        test('可視化更新中のエラーを適切に処理する', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            
            // エラーを投げるupdateScatterPlotをモック
            dataVisualizer.updateScatterPlot = jest.fn(() => {
                throw new Error('Update failed');
            });
            
            dataVisualizer.visualizations.set('error-test', { type: 'scatter' });
            
            const result = dataVisualizer.updateVisualization('error-test', []);
            expect(result).toBe(false);
            expect(consoleSpy).toHaveBeenCalledWith('Visualization update failed:', expect.any(Error));
            
            consoleSpy.mockRestore();
        });
    });
});