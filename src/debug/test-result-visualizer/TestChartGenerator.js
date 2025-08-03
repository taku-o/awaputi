/**
 * TestChartGenerator - Chart generation component
 * Handles chart rendering and visualization creation for test results
 */

import { getErrorHandler } from '../../core/ErrorHandler.js';

export class TestChartGenerator {
    constructor(testResultVisualizer) {
        this.testResultVisualizer = testResultVisualizer;
        this.errorHandler = getErrorHandler();
        
        // Chart configuration
        this.chartConfig = {
            defaultColors: {
                passed: '#28a745',
                failed: '#dc3545',
                warning: '#ffc107',
                skipped: '#6c757d',
                primary: '#007acc'
            },
            defaultMargin: 40,
            defaultFont: '11px monospace'
        };
        
        // Chart cache for performance
        this.chartCache = new Map();
        
        console.log('[TestChartGenerator] Chart generation component initialized');
    }
    
    /**
     * Generate pie chart for test results distribution
     * @param {object} results - Test results data
     * @param {string} canvasId - Canvas element ID
     * @returns {boolean} Success status
     */
    generateResultsPieChart(results, canvasId = 'results-pie-chart') {
        try {
            const canvas = document.getElementById(canvasId);
            if (!canvas) {
                console.warn(`[TestChartGenerator] Canvas element ${canvasId} not found`);
                return false;
            }
            
            const ctx = canvas.getContext('2d');
            const data = [
                { 
                    label: 'Passed', 
                    value: results.results?.passed || 0, 
                    color: this.chartConfig.defaultColors.passed 
                },
                { 
                    label: 'Failed', 
                    value: results.results?.failed || 0, 
                    color: this.chartConfig.defaultColors.failed 
                },
                { 
                    label: 'Skipped', 
                    value: results.results?.skipped || 0, 
                    color: this.chartConfig.defaultColors.skipped 
                }
            ];

            this.drawPieChart(ctx, data, canvas.width, canvas.height);
            return true;
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'TestChartGenerator.generateResultsPieChart',
                canvasId
            });
            return false;
        }
    }
    
    /**
     * Generate category performance bar chart
     * @param {object} results - Test results data
     * @param {string} canvasId - Canvas element ID
     * @returns {boolean} Success status
     */
    generateCategoryBarChart(results, canvasId = 'category-bar-chart') {
        try {
            const canvas = document.getElementById(canvasId);
            if (!canvas) {
                console.warn(`[TestChartGenerator] Canvas element ${canvasId} not found`);
                return false;
            }
            
            const ctx = canvas.getContext('2d');
            const categories = results.summary?.categories || {};
            const data = Object.entries(categories).map(([name, stats]) => ({
                label: name,
                passed: stats.passed || 0,
                failed: stats.failed || 0,
                warnings: stats.warnings || 0
            }));

            this.drawStackedBarChart(ctx, data, canvas.width, canvas.height);
            return true;
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'TestChartGenerator.generateCategoryBarChart',
                canvasId
            });
            return false;
        }
    }
    
    /**
     * Generate performance trend line chart
     * @param {Array} history - Test history data
     * @param {string} canvasId - Canvas element ID
     * @param {object} options - Chart options
     * @returns {boolean} Success status
     */
    generatePerformanceLineChart(history, canvasId = 'performance-line-chart', options = {}) {
        try {
            const canvas = document.getElementById(canvasId);
            if (!canvas) {
                console.warn(`[TestChartGenerator] Canvas element ${canvasId} not found`);
                return false;
            }
            
            const ctx = canvas.getContext('2d');
            
            if (!history || history.length === 0) {
                this.drawNoDataMessage(ctx, canvas.width, canvas.height, 'No performance data available');
                return false;
            }

            const data = history.map((session, index) => ({
                x: index,
                y: session.executionTime || 0,
                label: new Date(session.timestamp).toLocaleTimeString()
            }));

            const chartOptions = {
                title: 'Execution Time Trends',
                yLabel: 'Time (ms)',
                color: this.chartConfig.defaultColors.primary,
                ...options
            };

            this.drawLineChart(ctx, data, canvas.width, canvas.height, chartOptions);
            return true;
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'TestChartGenerator.generatePerformanceLineChart',
                canvasId
            });
            return false;
        }
    }
    
    /**
     * Generate trends analysis line chart
     * @param {Array} history - Test history data
     * @param {string} canvasId - Canvas element ID
     * @param {object} options - Chart options
     * @returns {boolean} Success status
     */
    generateTrendsLineChart(history, canvasId = 'trends-line-chart', options = {}) {
        try {
            const canvas = document.getElementById(canvasId);
            if (!canvas) {
                console.warn(`[TestChartGenerator] Canvas element ${canvasId} not found`);
                return false;
            }
            
            const ctx = canvas.getContext('2d');
            
            if (!history || history.length === 0) {
                this.drawNoDataMessage(ctx, canvas.width, canvas.height, 'No trends data available');
                return false;
            }

            const data = history.map((session, index) => {
                const total = (session.results?.passed || 0) + (session.results?.failed || 0);
                const successRate = total > 0 ? ((session.results?.passed || 0) / total) * 100 : 0;
                return {
                    x: index,
                    y: successRate,
                    label: new Date(session.timestamp).toLocaleDateString()
                };
            });

            const chartOptions = {
                title: 'Success Rate Trends',
                yLabel: 'Success Rate (%)',
                color: this.chartConfig.defaultColors.passed,
                yMin: 0,
                yMax: 100,
                ...options
            };

            this.drawLineChart(ctx, data, canvas.width, canvas.height, chartOptions);
            return true;
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'TestChartGenerator.generateTrendsLineChart',
                canvasId
            });
            return false;
        }
    }
    
    /**
     * Generate coverage bar chart
     * @param {Array} coverageData - Coverage data
     * @param {string} canvasId - Canvas element ID
     * @returns {boolean} Success status
     */
    generateCoverageBarChart(coverageData = null, canvasId = 'coverage-bar-chart') {
        try {
            const canvas = document.getElementById(canvasId);
            if (!canvas) {
                console.warn(`[TestChartGenerator] Canvas element ${canvasId} not found`);
                return false;
            }
            
            const ctx = canvas.getContext('2d');
            
            // Default mock coverage data if none provided
            const data = coverageData || [
                { component: 'GameEngine', coverage: 85 },
                { component: 'BubbleManager', coverage: 92 },
                { component: 'ScoreManager', coverage: 78 },
                { component: 'InputManager', coverage: 88 },
                { component: 'AudioManager', coverage: 65 },
                { component: 'EffectManager', coverage: 71 }
            ];

            this.drawHorizontalBarChart(ctx, data, canvas.width, canvas.height);
            return true;
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'TestChartGenerator.generateCoverageBarChart',
                canvasId
            });
            return false;
        }
    }
    
    /**
     * Draw pie chart on canvas context
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Array} data - Chart data
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     */
    drawPieChart(ctx, data, width, height) {
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 3;
        
        const total = data.reduce((sum, item) => sum + item.value, 0);
        if (total === 0) {
            this.drawNoDataMessage(ctx, width, height, 'No data to display');
            return;
        }

        ctx.clearRect(0, 0, width, height);
        
        let currentAngle = -Math.PI / 2;
        
        data.forEach(item => {
            if (item.value === 0) return;
            
            const sliceAngle = (item.value / total) * 2 * Math.PI;
            
            // Draw slice
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = item.color;
            ctx.fill();
            
            // Draw border
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw label
            const labelAngle = currentAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius + 25);
            const labelY = centerY + Math.sin(labelAngle) * (radius + 25);
            
            ctx.fillStyle = 'white';
            ctx.font = this.chartConfig.defaultFont;
            ctx.textAlign = 'center';
            ctx.fillText(`${item.label}: ${item.value}`, labelX, labelY);
            
            currentAngle += sliceAngle;
        });
    }
    
    /**
     * Draw stacked bar chart on canvas context
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Array} data - Chart data
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     */
    drawStackedBarChart(ctx, data, width, height) {
        if (data.length === 0) {
            this.drawNoDataMessage(ctx, width, height, 'No category data available');
            return;
        }

        ctx.clearRect(0, 0, width, height);
        
        const margin = this.chartConfig.defaultMargin;
        const chartWidth = width - margin * 2;
        const chartHeight = height - margin * 2;
        const barWidth = Math.max(20, chartWidth / data.length * 0.8);
        
        const maxValue = Math.max(...data.map(item => 
            (item.passed || 0) + (item.failed || 0) + (item.warnings || 0)
        ));
        
        if (maxValue === 0) {
            this.drawNoDataMessage(ctx, width, height, 'No test data in categories');
            return;
        }
        
        data.forEach((item, index) => {
            const x = margin + index * (chartWidth / data.length) + (chartWidth / data.length - barWidth) / 2;
            const total = (item.passed || 0) + (item.failed || 0) + (item.warnings || 0);
            
            if (total === 0) return;
            
            let y = margin + chartHeight;
            
            // Failed (bottom)
            if (item.failed > 0) {
                const failedHeight = (item.failed / maxValue) * chartHeight;
                ctx.fillStyle = this.chartConfig.defaultColors.failed;
                ctx.fillRect(x, y - failedHeight, barWidth, failedHeight);
                y -= failedHeight;
            }
            
            // Warnings (middle)
            if (item.warnings > 0) {
                const warningsHeight = (item.warnings / maxValue) * chartHeight;
                ctx.fillStyle = this.chartConfig.defaultColors.warning;
                ctx.fillRect(x, y - warningsHeight, barWidth, warningsHeight);
                y -= warningsHeight;
            }
            
            // Passed (top)
            if (item.passed > 0) {
                const passedHeight = (item.passed / maxValue) * chartHeight;
                ctx.fillStyle = this.chartConfig.defaultColors.passed;
                ctx.fillRect(x, y - passedHeight, barWidth, passedHeight);
            }
            
            // Label
            ctx.fillStyle = 'white';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(item.label, x + barWidth / 2, margin + chartHeight + 15);
        });
        
        // Draw Y-axis scale
        this.drawYAxisScale(ctx, maxValue, margin, chartHeight);
    }
    
    /**
     * Draw line chart on canvas context
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Array} data - Chart data points
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @param {object} options - Chart options
     */
    drawLineChart(ctx, data, width, height, options = {}) {
        if (data.length === 0) {
            this.drawNoDataMessage(ctx, width, height, 'No trend data available');
            return;
        }

        ctx.clearRect(0, 0, width, height);
        
        const margin = this.chartConfig.defaultMargin;
        const chartWidth = width - margin * 2;
        const chartHeight = height - margin * 2;
        
        const minY = options.yMin !== undefined ? options.yMin : Math.min(...data.map(p => p.y));
        const maxY = options.yMax !== undefined ? options.yMax : Math.max(...data.map(p => p.y));
        const rangeY = maxY - minY || 1;
        
        // Draw axes
        this.drawAxes(ctx, margin, chartWidth, chartHeight);
        
        // Draw grid lines
        this.drawGridLines(ctx, margin, chartWidth, chartHeight, 5);
        
        // Draw data line
        ctx.strokeStyle = options.color || this.chartConfig.defaultColors.primary;
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        data.forEach((point, index) => {
            const x = margin + (data.length > 1 ? (index / (data.length - 1)) * chartWidth : chartWidth / 2);
            const y = margin + chartHeight - ((point.y - minY) / rangeY) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Draw data points
        ctx.fillStyle = options.color || this.chartConfig.defaultColors.primary;
        data.forEach((point, index) => {
            const x = margin + (data.length > 1 ? (index / (data.length - 1)) * chartWidth : chartWidth / 2);
            const y = margin + chartHeight - ((point.y - minY) / rangeY) * chartHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Draw Y-axis labels
        this.drawYAxisLabels(ctx, minY, maxY, margin, chartHeight);
    }
    
    /**
     * Draw horizontal bar chart on canvas context
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Array} data - Chart data
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     */
    drawHorizontalBarChart(ctx, data, width, height) {
        if (data.length === 0) {
            this.drawNoDataMessage(ctx, width, height, 'No coverage data available');
            return;
        }

        ctx.clearRect(0, 0, width, height);
        
        const margin = 80;
        const chartWidth = width - margin * 2;
        const chartHeight = height - margin * 2;
        const barHeight = Math.max(15, chartHeight / data.length * 0.8);
        
        data.forEach((item, index) => {
            const y = margin + index * (chartHeight / data.length) + (chartHeight / data.length - barHeight) / 2;
            const barWidth = (item.coverage / 100) * chartWidth;
            
            // Determine color based on coverage percentage
            const color = item.coverage >= 80 ? this.chartConfig.defaultColors.passed : 
                         item.coverage >= 60 ? this.chartConfig.defaultColors.warning : 
                         this.chartConfig.defaultColors.failed;
            
            // Draw bar
            ctx.fillStyle = color;
            ctx.fillRect(margin, y, barWidth, barHeight);
            
            // Draw bar border
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.strokeRect(margin, y, barWidth, barHeight);
            
            // Draw component label
            ctx.fillStyle = 'white';
            ctx.font = this.chartConfig.defaultFont;
            ctx.textAlign = 'right';
            ctx.fillText(item.component, margin - 5, y + barHeight / 2 + 3);
            
            // Draw percentage label
            ctx.textAlign = 'left';
            ctx.fillText(`${item.coverage}%`, margin + barWidth + 5, y + barHeight / 2 + 3);
        });
    }
    
    /**
     * Draw no data message on canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @param {string} message - Message to display
     */
    drawNoDataMessage(ctx, width, height, message = 'No data available') {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#666';
        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(message, width / 2, height / 2);
    }
    
    /**
     * Draw chart axes
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} margin - Chart margin
     * @param {number} chartWidth - Chart width
     * @param {number} chartHeight - Chart height
     */
    drawAxes(ctx, margin, chartWidth, chartHeight) {
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(margin, margin);
        ctx.lineTo(margin, margin + chartHeight);
        ctx.lineTo(margin + chartWidth, margin + chartHeight);
        ctx.stroke();
    }
    
    /**
     * Draw grid lines
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} margin - Chart margin
     * @param {number} chartWidth - Chart width
     * @param {number} chartHeight - Chart height
     * @param {number} divisions - Number of grid divisions
     */
    drawGridLines(ctx, margin, chartWidth, chartHeight, divisions = 5) {
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 0.5;
        ctx.setLineDash([2, 2]);
        
        for (let i = 1; i < divisions; i++) {
            const y = margin + (i / divisions) * chartHeight;
            ctx.beginPath();
            ctx.moveTo(margin, y);
            ctx.lineTo(margin + chartWidth, y);
            ctx.stroke();
        }
        
        ctx.setLineDash([]);
    }
    
    /**
     * Draw Y-axis scale indicators
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} maxValue - Maximum value for scale
     * @param {number} margin - Chart margin
     * @param {number} chartHeight - Chart height
     */
    drawYAxisScale(ctx, maxValue, margin, chartHeight) {
        ctx.fillStyle = 'white';
        ctx.font = '10px monospace';
        ctx.textAlign = 'right';
        
        for (let i = 0; i <= 5; i++) {
            const value = Math.round((maxValue * i) / 5);
            const y = margin + chartHeight - (i / 5) * chartHeight;
            ctx.fillText(value.toString(), margin - 5, y + 3);
        }
    }
    
    /**
     * Draw Y-axis labels
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} minY - Minimum Y value
     * @param {number} maxY - Maximum Y value
     * @param {number} margin - Chart margin
     * @param {number} chartHeight - Chart height
     */
    drawYAxisLabels(ctx, minY, maxY, margin, chartHeight) {
        ctx.fillStyle = 'white';
        ctx.font = '10px monospace';
        ctx.textAlign = 'right';
        
        for (let i = 0; i <= 5; i++) {
            const value = minY + ((maxY - minY) * i / 5);
            const y = margin + chartHeight - (i / 5) * chartHeight;
            ctx.fillText(value.toFixed(0), margin - 5, y + 3);
        }
    }
    
    /**
     * Customize chart colors
     * @param {object} colors - Color configuration
     */
    customizeColors(colors) {
        Object.assign(this.chartConfig.defaultColors, colors);
        console.log('[TestChartGenerator] Chart colors updated');
    }
    
    /**
     * Configure chart parameters
     * @param {object} config - Configuration options
     */
    configure(config) {
        Object.assign(this.chartConfig, config);
        console.log('[TestChartGenerator] Configuration updated');
    }
    
    /**
     * Clear chart cache
     */
    clearCache() {
        this.chartCache.clear();
        console.log('[TestChartGenerator] Chart cache cleared');
    }
    
    /**
     * Cleanup chart generator resources
     */
    destroy() {
        this.chartCache.clear();
        console.log('[TestChartGenerator] Chart generator destroyed');
    }
}