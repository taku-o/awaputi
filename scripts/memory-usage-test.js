#!/usr/bin/env node
/**
 * メモリ使用量測定テスト
 */

import { performance } from 'perf_hooks';
import fs from 'fs';
import path from 'path';

class MemoryUsageTester {
    constructor() {
        this.results = {};
    }

    /**
     * メモリ使用量測定
     */
    async measureMemoryUsage() {
        console.log('💾 メモリ使用量測定開始');
        console.log('-'.repeat(40));

        const initialMemory = process.memoryUsage();
        console.log(`初期メモリ使用量: ${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`);

        const testCases = [
            {
                name: 'AudioAccessibilitySupport (old)',
                path: '../src/audio/AudioAccessibilitySupport.js'
            },
            {
                name: 'AudioAccessibilitySupport (new)',
                path: '../src/audio/accessibility/AudioAccessibilitySupport.js'
            },
            {
                name: 'VisualFocusManager',
                path: '../src/core/VisualFocusManager.js'
            },
            {
                name: 'VisualFeedbackManager', 
                path: '../src/core/VisualFeedbackManager.js'
            }
        ];

        for (const testCase of testCases) {
            try {
                console.log(`\n測定中: ${testCase.name}`);
                
                const beforeMemory = process.memoryUsage().heapUsed;
                const beforeTime = performance.now();
                
                // 動的インポート
                const module = await import(testCase.path);
                
                const afterMemory = process.memoryUsage().heapUsed;
                const afterTime = performance.now();
                
                const memoryDelta = afterMemory - beforeMemory;
                const loadTime = afterTime - beforeTime;
                
                console.log(`  読み込み時間: ${loadTime.toFixed(2)}ms`);
                console.log(`  メモリ使用量: ${(memoryDelta / 1024).toFixed(1)}KB`);
                
                this.results[testCase.name] = {
                    memoryDelta,
                    loadTime,
                    success: true
                };
                
            } catch (error) {
                console.log(`  エラー: ${error.message}`);
                this.results[testCase.name] = {
                    error: error.message,
                    success: false
                };
            }
        }
    }

    /**
     * インスタンス化パフォーマンステスト
     */
    async measureInstantiation() {
        console.log('\n🏗️ インスタンス化パフォーマンス測定');
        console.log('-'.repeat(40));

        // Mock環境セットアップ
        this.setupMocks();

        try {
            // AudioAccessibilitySupport (新)
            const AudioAccessibilitySupport = await import('../src/audio/accessibility/AudioAccessibilitySupport.js');
            const iterations = 1000;
            const times = [];

            for (let i = 0; i < iterations; i++) {
                const start = performance.now();
                new AudioAccessibilitySupport.default();
                const end = performance.now();
                times.push(end - start);
            }

            const avg = times.reduce((a, b) => a + b, 0) / times.length;
            const min = Math.min(...times);
            const max = Math.max(...times);

            console.log(`AudioAccessibilitySupport (新版):`);
            console.log(`  平均: ${avg.toFixed(3)}ms`);
            console.log(`  最小: ${min.toFixed(3)}ms`); 
            console.log(`  最大: ${max.toFixed(3)}ms`);

        } catch (error) {
            console.log(`エラー: ${error.message}`);
        }
    }

    /**
     * Mock環境セットアップ
     */
    setupMocks() {
        // Canvas Mock
        const mockCanvas = {
            getContext: () => ({
                clearRect: () => {},
                fillRect: () => {},
                strokeRect: () => {},
                fillText: () => {},
                measureText: () => ({ width: 100 }),
                save: () => {},
                restore: () => {},
                beginPath: () => {},
                closePath: () => {},
                strokeStyle: '',
                lineWidth: 1,
                setLineDash: () => {},
                arc: () => {},
                stroke: () => {},
                globalAlpha: 1,
                fillStyle: '',
                translate: () => {},
                scale: () => {},
                rotate: () => {}
            }),
            width: 800,
            height: 600
        };

        // Global mocks
        global.document = {
            createElement: () => mockCanvas,
            getElementById: () => mockCanvas,
            addEventListener: () => {},
            removeEventListener: () => {},
            body: { 
                appendChild: () => {},
                removeChild: () => {}
            }
        };

        global.window = {
            speechSynthesis: {
                speak: () => {},
                cancel: () => {},
                getVoices: () => []
            }
        };

        global.AudioContext = function() {
            return {
                createOscillator: () => ({
                    connect: () => {},
                    start: () => {},
                    stop: () => {},
                    frequency: { value: 440 }
                }),
                createGain: () => ({
                    connect: () => {},
                    gain: { value: 0.5 }
                }),
                destination: {}
            };
        };

        global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
    }

    /**
     * 結果表示
     */
    displayResults() {
        console.log('\n📊 測定結果サマリー');
        console.log('='.repeat(40));

        Object.entries(this.results).forEach(([name, result]) => {
            console.log(`\n${name}:`);
            if (result.success) {
                console.log(`  ✅ 成功`);
                console.log(`  📈 読み込み時間: ${result.loadTime.toFixed(2)}ms`);
                console.log(`  💾 メモリ使用: ${(result.memoryDelta / 1024).toFixed(1)}KB`);
            } else {
                console.log(`  ❌ 失敗: ${result.error}`);
            }
        });
    }

    /**
     * 実行
     */
    async run() {
        try {
            await this.measureMemoryUsage();
            await this.measureInstantiation();
            this.displayResults();
            console.log('\n✅ メモリ使用量測定完了');
        } catch (error) {
            console.error('\n❌ 測定エラー:', error.message);
        }
    }
}

// 実行
const tester = new MemoryUsageTester();
tester.run();