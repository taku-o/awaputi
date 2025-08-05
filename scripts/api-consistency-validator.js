#!/usr/bin/env node

/**
 * API Consistency Validator
 * Validates consistency between actual API implementations and test expectations
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { glob } from 'glob';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

class APIConsistencyValidator {
    constructor() {
        this.sourceFiles = [];
        this.testFiles = [];
        this.inconsistencies = [];
        this.apiRegistry = new Map();
    }

    async findSourceFiles() {
        const patterns = [
            'src/**/*.js',
            '!src/**/*.test.js',
            '!src/**/*.spec.js'
        ];

        this.sourceFiles = await glob(patterns, { cwd: projectRoot });
        console.log(`📁 発見されたソースファイル: ${this.sourceFiles.length}件`);
    }

    async findTestFiles() {
        const patterns = [
            'tests/**/*.test.js',
            'tests/**/*.spec.js'
        ];

        this.testFiles = await glob(patterns, { cwd: projectRoot });
        console.log(`🧪 発見されたテストファイル: ${this.testFiles.length}件`);
    }

    parseSourceFile(filePath) {
        try {
            const content = readFileSync(join(projectRoot, filePath), 'utf8');
            const apis = this.extractAPIFromSource(content, filePath);
            return apis;
        } catch (error) {
            console.warn(`警告: ${filePath} の読み込みに失敗:`, error.message);
            return [];
        }
    }

    extractAPIFromSource(content, filePath) {
        const apis = [];
        const className = this.extractClassName(content);
        
        if (!className) return apis;

        // Extract public methods
        const methodRegex = /^\s*(async\s+)?([a-zA-Z_][a-zA-Z0-9_]*)\s*\([^)]*\)\s*\{/gm;
        let match;

        while ((match = methodRegex.exec(content)) !== null) {
            const methodName = match[2];
            
            // Skip private methods and constructor
            if (methodName.startsWith('_') || methodName === 'constructor') {
                continue;
            }

            apis.push({
                type: 'method',
                className,
                name: methodName,
                isAsync: !!match[1],
                file: filePath,
                signature: match[0].trim()
            });
        }

        // Extract public properties (getters/setters)
        const propertyRegex = /^\s*get\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(\)\s*\{/gm;
        while ((match = propertyRegex.exec(content)) !== null) {
            apis.push({
                type: 'getter',
                className,
                name: match[1],
                file: filePath
            });
        }

        const setterRegex = /^\s*set\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\([^)]*\)\s*\{/gm;
        while ((match = setterRegex.exec(content)) !== null) {
            apis.push({
                type: 'setter',
                className,
                name: match[1],
                file: filePath
            });
        }

        return apis;
    }

    extractClassName(content) {
        const classMatch = content.match(/export\s+class\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
        if (classMatch) return classMatch[1];

        const functionMatch = content.match(/export\s+function\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
        if (functionMatch) return functionMatch[1];

        return null;
    }

    parseTestFile(filePath) {
        try {
            const content = readFileSync(join(projectRoot, filePath), 'utf8');
            const expectations = this.extractTestExpectations(content, filePath);
            return expectations;
        } catch (error) {
            console.warn(`警告: ${filePath} の読み込みに失敗:`, error.message);
            return [];
        }
    }

    extractTestExpectations(content, filePath) {
        const expectations = [];
        const testedClassName = this.extractTestedClassName(content, filePath);
        
        if (!testedClassName) return expectations;

        // Extract method call expectations
        const methodCallRegex = /(\w+)\.([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
        let match;

        const foundMethods = new Set();
        while ((match = methodCallRegex.exec(content)) !== null) {
            const objectName = match[1];
            const methodName = match[2];

            // Skip common JavaScript methods and test utilities
            if (this.isCommonMethod(methodName) || foundMethods.has(methodName)) {
                continue;
            }

            foundMethods.add(methodName);

            expectations.push({
                type: 'method',
                className: testedClassName,
                name: methodName,
                calledOn: objectName,
                file: filePath,
                context: this.extractMethodContext(content, match.index)
            });
        }

        // Extract property access expectations
        const propertyRegex = /(\w+)\.([a-zA-Z_][a-zA-Z0-9_]*)(?!\s*\()/g;
        const foundProperties = new Set();
        while ((match = propertyRegex.exec(content)) !== null) {
            const objectName = match[1];
            const propertyName = match[2];

            if (this.isCommonProperty(propertyName) || foundProperties.has(propertyName)) {
                continue;
            }

            foundProperties.add(propertyName);

            expectations.push({
                type: 'property',
                className: testedClassName,
                name: propertyName,
                accessedOn: objectName,
                file: filePath
            });
        }

        return expectations;
    }

    extractTestedClassName(content, filePath) {
        // Try to extract from import statements
        const importMatch = content.match(/import\s+\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}/);
        if (importMatch) return importMatch[1];

        // Try to extract from file name
        const fileMatch = filePath.match(/([a-zA-Z_][a-zA-Z0-9_]*)\.test\.js$/);
        if (fileMatch) return fileMatch[1];

        return null;
    }

    extractMethodContext(content, index) {
        const lines = content.substring(0, index).split('\n');
        const currentLine = lines[lines.length - 1];
        const previousLine = lines.length > 1 ? lines[lines.length - 2] : '';
        
        return {
            line: currentLine.trim(),
            previousLine: previousLine.trim()
        };
    }

    isCommonMethod(methodName) {
        const commonMethods = [
            'expect', 'toBe', 'toEqual', 'toHaveBeenCalled', 'toThrow',
            'describe', 'test', 'it', 'beforeEach', 'afterEach',
            'console', 'log', 'error', 'warn', 'info',
            'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval',
            'addEventListener', 'removeEventListener',
            'push', 'pop', 'shift', 'unshift', 'splice', 'slice',
            'map', 'filter', 'reduce', 'forEach', 'find', 'includes',
            'toString', 'valueOf', 'hasOwnProperty'
        ];
        return commonMethods.includes(methodName);
    }

    isCommonProperty(propertyName) {
        const commonProperties = [
            'length', 'prototype', 'constructor', 'name',
            'message', 'stack', 'code', 'errno',
            'innerHTML', 'textContent', 'value', 'checked',
            'style', 'className', 'id', 'dataset'
        ];
        return commonProperties.includes(propertyName);
    }

    buildAPIRegistry() {
        console.log('🔍 APIレジストリを構築中...');
        
        for (const sourceFile of this.sourceFiles) {
            const apis = this.parseSourceFile(sourceFile);
            for (const api of apis) {
                const key = `${api.className}.${api.name}`;
                this.apiRegistry.set(key, api);
            }
        }
        
        console.log(`📋 登録されたAPI: ${this.apiRegistry.size}件`);
    }

    validateConsistency() {
        console.log('✅ 整合性を検証中...');
        this.inconsistencies = [];

        for (const testFile of this.testFiles) {
            const expectations = this.parseTestFile(testFile);
            
            for (const expectation of expectations) {
                const key = `${expectation.className}.${expectation.name}`;
                const actualAPI = this.apiRegistry.get(key);

                if (!actualAPI) {
                    this.inconsistencies.push({
                        type: 'missing_implementation',
                        expected: expectation,
                        actual: null,
                        severity: 'high',
                        description: `テストで期待されているが実装されていない: ${key}`
                    });
                } else {
                    // Check type consistency
                    if (expectation.type !== actualAPI.type) {
                        this.inconsistencies.push({
                            type: 'type_mismatch',
                            expected: expectation,
                            actual: actualAPI,
                            severity: 'medium',
                            description: `タイプ不一致: ${key} (期待: ${expectation.type}, 実際: ${actualAPI.type})`
                        });
                    }
                }
            }
        }

        // Check for unused implementations
        const usedAPIs = new Set();
        for (const testFile of this.testFiles) {
            const expectations = this.parseTestFile(testFile);
            for (const expectation of expectations) {
                usedAPIs.add(`${expectation.className}.${expectation.name}`);
            }
        }

        for (const [key, api] of this.apiRegistry) {
            if (!usedAPIs.has(key) && !api.name.startsWith('_')) {
                this.inconsistencies.push({
                    type: 'untested_implementation',
                    expected: null,
                    actual: api,
                    severity: 'low',
                    description: `テストされていない実装: ${key}`
                });
            }
        }
    }

    generateReport() {
        console.log('\n' + '='.repeat(60));
        console.log('🔍 API整合性検証レポート');
        console.log('='.repeat(60));

        const severityCounts = {
            high: this.inconsistencies.filter(i => i.severity === 'high').length,
            medium: this.inconsistencies.filter(i => i.severity === 'medium').length,
            low: this.inconsistencies.filter(i => i.severity === 'low').length
        };

        console.log(`📊 総不整合数: ${this.inconsistencies.length}`);
        console.log(`  🔴 高優先度: ${severityCounts.high}`);
        console.log(`  🟡 中優先度: ${severityCounts.medium}`);
        console.log(`  🟢 低優先度: ${severityCounts.low}`);

        if (this.inconsistencies.length === 0) {
            console.log('\n✅ 不整合は発見されませんでした！');
            return;
        }

        // Group by type
        const byType = {};
        for (const inconsistency of this.inconsistencies) {
            if (!byType[inconsistency.type]) {
                byType[inconsistency.type] = [];
            }
            byType[inconsistency.type].push(inconsistency);
        }

        for (const [type, issues] of Object.entries(byType)) {
            console.log(`\n📋 ${this.getTypeDisplayName(type)} (${issues.length}件):`);
            
            issues.slice(0, 10).forEach((issue, index) => {
                const severity = { high: '🔴', medium: '🟡', low: '🟢' }[issue.severity];
                console.log(`  ${severity} ${index + 1}. ${issue.description}`);
                
                if (issue.expected?.file) {
                    console.log(`     テストファイル: ${issue.expected.file}`);
                }
                if (issue.actual?.file) {
                    console.log(`     実装ファイル: ${issue.actual.file}`);
                }
            });

            if (issues.length > 10) {
                console.log(`     ... 他 ${issues.length - 10}件`);
            }
        }

        console.log('\n💡 推奨アクション:');
        if (severityCounts.high > 0) {
            console.log('  🔴 高優先度の不整合を最初に修正してください');
            console.log('     - 不足している実装を追加');
            console.log('     - テスト期待値を実装に合わせて修正');
        }
        if (severityCounts.medium > 0) {
            console.log('  🟡 タイプ不一致を確認してください');
        }
        if (severityCounts.low > 0) {
            console.log('  🟢 未テスト実装のテストケース追加を検討');
        }
    }

    getTypeDisplayName(type) {
        const displayNames = {
            missing_implementation: '実装不足',
            type_mismatch: 'タイプ不一致',
            untested_implementation: '未テスト実装'
        };
        return displayNames[type] || type;
    }

    saveReport(outputPath = 'test-reports/api-consistency-report.json') {
        const reportPath = join(projectRoot, outputPath);
        const reportData = {
            timestamp: new Date().toISOString(),
            summary: {
                totalInconsistencies: this.inconsistencies.length,
                highSeverity: this.inconsistencies.filter(i => i.severity === 'high').length,
                mediumSeverity: this.inconsistencies.filter(i => i.severity === 'medium').length,
                lowSeverity: this.inconsistencies.filter(i => i.severity === 'low').length
            },
            sourceFiles: this.sourceFiles.length,
            testFiles: this.testFiles.length,
            apiRegistry: this.apiRegistry.size,
            inconsistencies: this.inconsistencies
        };

        try {
            const dir = dirname(reportPath);
            if (!existsSync(dir)) {
                mkdirSync(dir, { recursive: true });
            }
            writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
            console.log(`💾 レポートを保存しました: ${outputPath}`);
        } catch (error) {
            console.error('❌ レポート保存エラー:', error.message);
        }
    }

    async validateProject() {
        console.log('🚀 API整合性検証を開始します...\n');

        try {
            await this.findSourceFiles();
            await this.findTestFiles();
            this.buildAPIRegistry();
            this.validateConsistency();
            this.generateReport();
            this.saveReport();

            const hasHighSeverity = this.inconsistencies.some(i => i.severity === 'high');
            console.log(hasHighSeverity ? '\n❌ 高優先度の不整合が発見されました' : '\n✅ 検証完了');
            
            return !hasHighSeverity;

        } catch (error) {
            console.error('❌ 検証中にエラーが発生:', error.message);
            return false;
        }
    }
}

// CLI execution
async function main() {
    const validator = new APIConsistencyValidator();
    const success = await validator.validateProject();
    process.exit(success ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export { APIConsistencyValidator };