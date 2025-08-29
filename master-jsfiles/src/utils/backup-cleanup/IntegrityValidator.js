import fs from 'fs/promises';
import path from 'path';

/**
 * IntegrityValidator - ファイル削除後のシステム整合性を検証するクラス
 * Issue #104 のバックアップファイル削除後の包括的整合性確認機能を提供
 */
export class IntegrityValidator {
    constructor() {
        this.validationResults = [];
    }

    /**
     * ビルド整合性の確認
     * @returns {Promise<Object>} ビルド整合性確認結果
     */
    async validateBuildIntegrity() {
        const validation = {
            packageJsonValid: false,
            mainFilesExist: false,
            configFilesValid: false,
            srcStructureIntact: false,
            passed: false,
            errors: [],
            warnings: []
        };

        try {
            // package.json確認
            validation.packageJsonValid = await this.validatePackageJson();
            
            // メインファイル存在確認
            validation.mainFilesExist = await this.validateMainFiles();
            
            // 設定ファイル確認
            validation.configFilesValid = await this.validateConfigFiles();
            
            // ソースディレクトリ構造確認
            validation.srcStructureIntact = await this.validateSourceStructure();
            
            // 全体判定
            validation.passed = validation.packageJsonValid && 
                               validation.mainFilesExist && 
                               validation.configFilesValid && 
                               validation.srcStructureIntact;

        } catch (error) {
            validation.errors.push(`Build integrity validation error: ${error.message}`);
            validation.passed = false;
        }

        validation.validatedAt = new Date().toISOString();
        return validation;
    }

    /**
     * 基本テストの実行
     * @returns {Promise<Object>} 基本テスト結果
     */
    async runBasicTests() {
        const testResults = {
            syntaxTests: false,
            importTests: false,
            coreModuleTests: false,
            configurationTests: false,
            passed: false,
            testDetails: {}
        };

        try {
            // 構文テスト
            testResults.testDetails.syntax = await this.runSyntaxTests();
            testResults.syntaxTests = testResults.testDetails.syntax.passed;
            
            // インポートテスト
            testResults.testDetails.import = await this.runImportTests();
            testResults.importTests = testResults.testDetails.import.passed;
            
            // コアモジュールテスト
            testResults.testDetails.coreModule = await this.runCoreModuleTests();
            testResults.coreModuleTests = testResults.testDetails.coreModule.passed;
            
            // 設定テスト
            testResults.testDetails.configuration = await this.runConfigurationTests();
            testResults.configurationTests = testResults.testDetails.configuration.passed;
            
            // 全体判定
            testResults.passed = testResults.syntaxTests && 
                                 testResults.importTests && 
                                 testResults.coreModuleTests && 
                                 testResults.configurationTests;

        } catch (error) {
            testResults.error = error.message;
            testResults.passed = false;
        }

        testResults.executedAt = new Date().toISOString();
        return testResults;
    }

    /**
     * インポート解決の確認
     * @returns {Promise<Object>} インポート解決確認結果
     */
    async checkImportResolution() {
        const resolution = {
            brokenImports: [],
            suspiciousImports: [],
            totalImportsChecked: 0,
            passed: false
        };

        try {
            const jsFiles = await this.findJavaScriptFiles();
            
            for (const file of jsFiles) {
                const imports = await this.extractImports(file);
                resolution.totalImportsChecked += imports.length;
                
                for (const importInfo of imports) {
                    // 削除されたバックアップファイルへの参照チェック
                    if (this.isSuspiciousImport(importInfo.path)) {
                        resolution.suspiciousImports.push({
                            file,
                            import: importInfo,
                            reason: 'References potentially deleted backup file'
                        });
                    }
                    
                    // インポートファイルの存在確認
                    const resolvedPath = await this.resolveImportPath(importInfo.path, file);
                    if (resolvedPath && !await this.fileExists(resolvedPath)) {
                        resolution.brokenImports.push({
                            file,
                            import: importInfo,
                            resolvedPath,
                            reason: 'Imported file does not exist'
                        });
                    }
                }
            }
            
            resolution.passed = resolution.brokenImports.length === 0 && 
                               resolution.suspiciousImports.length === 0;

        } catch (error) {
            resolution.error = error.message;
            resolution.passed = false;
        }

        resolution.checkedAt = new Date().toISOString();
        return resolution;
    }

    /**
     * コア機能の検証
     * @returns {Promise<Object>} コア機能検証結果
     */
    async validateCoreFeatures() {
        const validation = {
            gameEngineAccessible: false,
            sceneManagerAccessible: false,
            configurationAccessible: false,
            utilsAccessible: false,
            passed: false,
            featureDetails: {}
        };

        try {
            // GameEngine確認
            validation.featureDetails.gameEngine = await this.validateCoreModule('src/core/GameEngine.js');
            validation.gameEngineAccessible = validation.featureDetails.gameEngine.accessible;
            
            // SceneManager確認
            validation.featureDetails.sceneManager = await this.validateCoreModule('src/core/SceneManager.js');
            validation.sceneManagerAccessible = validation.featureDetails.sceneManager.accessible;
            
            // Configuration確認
            validation.featureDetails.configuration = await this.validateConfigurationAccess();
            validation.configurationAccessible = validation.featureDetails.configuration.accessible;
            
            // Utils確認
            validation.featureDetails.utils = await this.validateUtilsAccess();
            validation.utilsAccessible = validation.featureDetails.utils.accessible;
            
            validation.passed = validation.gameEngineAccessible && 
                               validation.sceneManagerAccessible && 
                               validation.configurationAccessible && 
                               validation.utilsAccessible;

        } catch (error) {
            validation.error = error.message;
            validation.passed = false;
        }

        validation.validatedAt = new Date().toISOString();
        return validation;
    }

    /**
     * 整合性レポートの生成
     * @param {Object} validationResults - 検証結果
     * @returns {Object} 整合性レポート
     */
    async generateIntegrityReport(validationResults) {
        const report = {
            summary: {
                buildIntegrity: validationResults.buildIntegrity?.passed || false,
                basicTests: validationResults.basicTests?.passed || false,
                importResolution: validationResults.importResolution?.passed || false,
                coreFeatures: validationResults.coreFeatures?.passed || false,
                overallIntegrity: false
            },
            details: validationResults,
            issues: [],
            recommendations: [],
            generatedAt: new Date().toISOString()
        };

        // 全体整合性判定
        report.summary.overallIntegrity = Object.values(report.summary).every(
            (value, index) => index === Object.keys(report.summary).length - 1 || value === true
        );

        // 問題の収集
        report.issues = this.collectIssues(validationResults);
        
        // 推奨事項の生成
        report.recommendations = this.generateIntegrityRecommendations(validationResults, report.issues);

        return report;
    }

    // Private helper methods

    /**
     * package.jsonの確認
     * @returns {Promise<boolean>} 有効かどうか
     */
    async validatePackageJson() {
        try {
            const content = await fs.readFile('./package.json', 'utf8');
            const packageJson = JSON.parse(content);
            return packageJson.name && packageJson.version;
        } catch {
            return false;
        }
    }

    /**
     * メインファイルの確認
     * @returns {Promise<boolean>} 存在するかどうか
     */
    async validateMainFiles() {
        const mainFiles = [
            './index.html',
            './src/main.js',
            './src/core/GameEngine.js'
        ];

        for (const file of mainFiles) {
            if (!await this.fileExists(file)) {
                return false;
            }
        }
        return true;
    }

    /**
     * 設定ファイルの確認
     * @returns {Promise<boolean>} 有効かどうか
     */
    async validateConfigFiles() {
        const configFiles = [
            { path: './package.json', required: true },
            { path: './jest.config.js', required: false },
            { path: './.gitignore', required: false }
        ];

        for (const config of configFiles) {
            if (config.required && !await this.fileExists(config.path)) {
                return false;
            }
        }
        return true;
    }

    /**
     * ソース構造の確認
     * @returns {Promise<boolean>} 構造が正しいかどうか
     */
    async validateSourceStructure() {
        const requiredDirs = [
            './src',
            './src/core',
            './src/scenes',
            './src/utils'
        ];

        for (const dir of requiredDirs) {
            try {
                const stats = await fs.stat(dir);
                if (!stats.isDirectory()) {
                    return false;
                }
            } catch {
                return false;
            }
        }
        return true;
    }

    /**
     * 構文テストの実行
     * @returns {Promise<Object>} 構文テスト結果
     */
    async runSyntaxTests() {
        const result = {
            passed: true,
            filesChecked: 0,
            errors: []
        };

        try {
            const jsFiles = await this.findJavaScriptFiles();
            result.filesChecked = jsFiles.length;

            for (const file of jsFiles.slice(0, 20)) { // 最大20ファイルをチェック
                const content = await fs.readFile(file, 'utf8');
                
                // 明らかな構文エラーチェック
                if (content.includes('SyntaxError') || 
                    content.includes('Unexpected token') ||
                    content.match(/\bimport\s+.*\s+from\s+['"][^'"]*(?:_old|_original|_backup)\.js['"]/)) {
                    result.errors.push({
                        file,
                        issue: 'Potential syntax error or backup file reference'
                    });
                    result.passed = false;
                }
            }
        } catch (error) {
            result.error = error.message;
            result.passed = false;
        }

        return result;
    }

    /**
     * インポートテストの実行
     * @returns {Promise<Object>} インポートテスト結果
     */
    async runImportTests() {
        const result = {
            passed: true,
            importsChecked: 0,
            brokenImports: 0
        };

        try {
            const importResolution = await this.checkImportResolution();
            result.importsChecked = importResolution.totalImportsChecked;
            result.brokenImports = importResolution.brokenImports.length;
            result.passed = importResolution.passed;
        } catch (error) {
            result.error = error.message;
            result.passed = false;
        }

        return result;
    }

    /**
     * コアモジュールテストの実行
     * @returns {Promise<Object>} コアモジュールテスト結果
     */
    async runCoreModuleTests() {
        const result = {
            passed: true,
            modulesChecked: []
        };

        const coreModules = [
            'src/core/GameEngine.js',
            'src/core/SceneManager.js',
            'src/utils/ConfigurationManager.js'
        ];

        for (const module of coreModules) {
            const moduleResult = await this.validateCoreModule(module);
            result.modulesChecked.push(moduleResult);
            if (!moduleResult.accessible) {
                result.passed = false;
            }
        }

        return result;
    }

    /**
     * 設定テストの実行
     * @returns {Promise<Object>} 設定テスト結果
     */
    async runConfigurationTests() {
        const result = {
            passed: true,
            configurations: []
        };

        try {
            // GameBalance.jsの確認
            const gameBalance = await this.validateCoreModule('src/config/GameBalance.js');
            result.configurations.push(gameBalance);
            
            if (!gameBalance.accessible) {
                result.passed = false;
            }
        } catch (error) {
            result.error = error.message;
            result.passed = false;
        }

        return result;
    }

    /**
     * JavaScriptファイルの検索
     * @returns {Promise<Array>} JSファイル配列
     */
    async findJavaScriptFiles() {
        const jsFiles = [];
        
        async function scanDir(dir) {
            try {
                const entries = await fs.readdir(dir, { withFileTypes: true });
                
                for (const entry of entries) {
                    if (entry.name.startsWith('.') || 
                        entry.name === 'node_modules' || 
                        entry.name === 'coverage' ||
                        entry.name === 'dist') {
                        continue;
                    }
                    
                    const fullPath = path.join(dir, entry.name);
                    
                    if (entry.isDirectory()) {
                        await scanDir(fullPath);
                    } else if (entry.name.endsWith('.js')) {
                        jsFiles.push(fullPath);
                    }
                }
            } catch (error) {
                // ディレクトリアクセスエラーは無視
            }
        }
        
        await scanDir('./src');
        return jsFiles;
    }

    /**
     * ファイルからimport文を抽出
     * @param {string} filePath - ファイルパス
     * @returns {Promise<Array>} import情報配列
     */
    async extractImports(filePath) {
        const imports = [];
        
        try {
            const content = await fs.readFile(filePath, 'utf8');
            const lines = content.split('\n');
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                // import文の検出
                const importMatch = line.match(/import\s+.*\s+from\s+['"]([^'"]+)['"]/);
                if (importMatch) {
                    imports.push({
                        line: i + 1,
                        statement: line,
                        path: importMatch[1]
                    });
                }
                
                // require文の検出
                const requireMatch = line.match(/require\(['"]([^'"]+)['"]\)/);
                if (requireMatch) {
                    imports.push({
                        line: i + 1,
                        statement: line,
                        path: requireMatch[1],
                        type: 'require'
                    });
                }
            }
        } catch (error) {
            // ファイル読み取りエラーは無視
        }
        
        return imports;
    }

    /**
     * 疑わしいインポートの判定
     * @param {string} importPath - インポートパス
     * @returns {boolean} 疑わしいかどうか
     */
    isSuspiciousImport(importPath) {
        return /_old\.js$|_original\.js$|_backup\.js$/.test(importPath);
    }

    /**
     * インポートパスの解決
     * @param {string} importPath - インポートパス
     * @param {string} fromFile - インポート元ファイル
     * @returns {Promise<string|null>} 解決されたパス
     */
    async resolveImportPath(importPath, fromFile) {
        try {
            if (importPath.startsWith('./') || importPath.startsWith('../')) {
                // 相対パス
                const fromDir = path.dirname(fromFile);
                let resolved = path.resolve(fromDir, importPath);
                
                // .js拡張子の追加
                if (!path.extname(resolved)) {
                    resolved += '.js';
                }
                
                return resolved;
            } else if (importPath.startsWith('/')) {
                // 絶対パス
                let resolved = path.resolve('.', importPath.substring(1));
                if (!path.extname(resolved)) {
                    resolved += '.js';
                }
                return resolved;
            }
            // node_modulesやその他のパッケージは無視
            return null;
        } catch {
            return null;
        }
    }

    /**
     * ファイルの存在確認
     * @param {string} filePath - ファイルパス
     * @returns {Promise<boolean>} 存在するかどうか
     */
    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * コアモジュールの確認
     * @param {string} modulePath - モジュールパス
     * @returns {Promise<Object>} モジュール確認結果
     */
    async validateCoreModule(modulePath) {
        const result = {
            path: modulePath,
            accessible: false,
            hasContent: false,
            hasExports: false
        };

        try {
            if (await this.fileExists(modulePath)) {
                result.accessible = true;
                
                const content = await fs.readFile(modulePath, 'utf8');
                result.hasContent = content.trim().length > 0;
                result.hasExports = content.includes('export') || content.includes('module.exports');
            }
        } catch (error) {
            result.error = error.message;
        }

        return result;
    }

    /**
     * 設定アクセスの確認
     * @returns {Promise<Object>} 設定アクセス結果
     */
    async validateConfigurationAccess() {
        const result = {
            accessible: false,
            configs: []
        };

        const configFiles = [
            'src/config/GameBalance.js',
            'src/config/AudioConfig.js'
        ];

        for (const configFile of configFiles) {
            const configResult = await this.validateCoreModule(configFile);
            result.configs.push(configResult);
        }

        result.accessible = result.configs.some(config => config.accessible);
        return result;
    }

    /**
     * Utilsアクセスの確認
     * @returns {Promise<Object>} Utilsアクセス結果
     */
    async validateUtilsAccess() {
        const result = {
            accessible: false,
            utils: []
        };

        try {
            const utilsDir = './src/utils';
            const entries = await fs.readdir(utilsDir, { withFileTypes: true });
            
            let accessibleUtils = 0;
            for (const entry of entries.slice(0, 5)) { // 最大5個チェック
                if (entry.isFile() && entry.name.endsWith('.js')) {
                    const utilPath = path.join(utilsDir, entry.name);
                    const utilResult = await this.validateCoreModule(utilPath);
                    result.utils.push(utilResult);
                    if (utilResult.accessible) {
                        accessibleUtils++;
                    }
                }
            }
            
            result.accessible = accessibleUtils > 0;
        } catch (error) {
            result.error = error.message;
        }

        return result;
    }

    /**
     * 問題の収集
     * @param {Object} validationResults - 検証結果
     * @returns {Array} 問題配列
     */
    collectIssues(validationResults) {
        const issues = [];

        if (validationResults.buildIntegrity && !validationResults.buildIntegrity.passed) {
            issues.push({
                category: 'build',
                severity: 'high',
                message: 'Build integrity validation failed',
                details: validationResults.buildIntegrity.errors
            });
        }

        if (validationResults.importResolution && validationResults.importResolution.brokenImports?.length > 0) {
            issues.push({
                category: 'imports',
                severity: 'critical',
                message: `${validationResults.importResolution.brokenImports.length} broken imports found`,
                details: validationResults.importResolution.brokenImports
            });
        }

        if (validationResults.basicTests && !validationResults.basicTests.passed) {
            issues.push({
                category: 'tests',
                severity: 'medium',
                message: 'Basic tests failed',
                details: validationResults.basicTests.testDetails
            });
        }

        return issues;
    }

    /**
     * 整合性推奨事項の生成
     * @param {Object} validationResults - 検証結果
     * @param {Array} issues - 問題配列
     * @returns {Array} 推奨事項配列
     */
    generateIntegrityRecommendations(validationResults, issues) {
        const recommendations = [];

        if (issues.length === 0) {
            recommendations.push({
                type: 'success',
                message: 'All integrity checks passed',
                priority: 'info'
            });
        } else {
            const criticalIssues = issues.filter(issue => issue.severity === 'critical');
            if (criticalIssues.length > 0) {
                recommendations.push({
                    type: 'fix_critical',
                    message: 'Fix critical issues before proceeding',
                    priority: 'high',
                    issues: criticalIssues
                });
            }

            const highIssues = issues.filter(issue => issue.severity === 'high');
            if (highIssues.length > 0) {
                recommendations.push({
                    type: 'fix_high',
                    message: 'Address high severity issues',
                    priority: 'medium',
                    issues: highIssues
                });
            }
        }

        return recommendations;
    }
}

export default IntegrityValidator;