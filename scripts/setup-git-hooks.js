#!/usr/bin/env node

/**
 * Git Hooks Setup Script
 * 
 * プロジェクトのGitフックを設定するスクリプト
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const HOOKS_SOURCE_DIR = path.join(PROJECT_ROOT, '.githooks');
const GIT_HOOKS_DIR = path.join(PROJECT_ROOT, '.git', 'hooks');

// ログ関数
const log = {
    info: (msg) => console.log(`[INFO] ${msg}`),
    warn: (msg) => console.warn(`[WARN] ${msg}`),
    error: (msg) => console.error(`[ERROR] ${msg}`),
    success: (msg) => console.log(`[SUCCESS] ${msg}`)
};

/**
 * Git リポジトリかどうかチェック
 */
function checkGitRepository() {
    try {
        const gitDir = path.join(PROJECT_ROOT, '.git');
        if (!fs.existsSync(gitDir)) {
            throw new Error('Git repository not found');
        }
        
        // Git コマンドでも確認
        execSync('git rev-parse --git-dir', { 
            cwd: PROJECT_ROOT, 
            stdio: 'pipe' 
        });
        
        log.info('Git repository detected');
        return true;
    } catch (error) {
        log.error('This is not a Git repository');
        return false;
    }
}

/**
 * フックディレクトリの作成
 */
function ensureHooksDirectory() {
    try {
        if (!fs.existsSync(GIT_HOOKS_DIR)) {
            fs.mkdirSync(GIT_HOOKS_DIR, { recursive: true });
            log.info(`Created hooks directory: ${GIT_HOOKS_DIR}`);
        }
        return true;
    } catch (error) {
        log.error(`Failed to create hooks directory: ${error.message}`);
        return false;
    }
}

/**
 * フックファイルをコピー
 */
function copyHookFiles() {
    try {
        if (!fs.existsSync(HOOKS_SOURCE_DIR)) {
            log.warn(`Source hooks directory not found: ${HOOKS_SOURCE_DIR}`);
            return false;
        }
        
        const hookFiles = fs.readdirSync(HOOKS_SOURCE_DIR);
        let copiedCount = 0;
        
        for (const hookFile of hookFiles) {
            const sourcePath = path.join(HOOKS_SOURCE_DIR, hookFile);
            const destPath = path.join(GIT_HOOKS_DIR, hookFile);
            
            // ファイルかどうかチェック
            const stat = fs.statSync(sourcePath);
            if (!stat.isFile()) {
                continue;
            }
            
            try {
                // 既存ファイルのバックアップ
                if (fs.existsSync(destPath)) {
                    const backupPath = `${destPath}.backup.${Date.now()}`;
                    fs.copyFileSync(destPath, backupPath);
                    log.info(`Backed up existing hook: ${hookFile} -> ${path.basename(backupPath)}`);
                }
                
                // フックファイルをコピー
                fs.copyFileSync(sourcePath, destPath);
                
                // 実行権限を設定
                fs.chmodSync(destPath, 0o755);
                
                log.success(`Installed hook: ${hookFile}`);
                copiedCount++;
                
            } catch (copyError) {
                log.error(`Failed to copy hook ${hookFile}: ${copyError.message}`);
            }
        }
        
        log.info(`Installed ${copiedCount} hook(s)`);
        return copiedCount > 0;
        
    } catch (error) {
        log.error(`Failed to copy hook files: ${error.message}`);
        return false;
    }
}

/**
 * Git設定の確認と設定
 */
function configureGitHooks() {
    try {
        // 現在のhooks pathを確認
        let currentHooksPath = '';
        try {
            currentHooksPath = execSync('git config core.hooksPath', { 
                cwd: PROJECT_ROOT, 
                encoding: 'utf8' 
            }).trim();
        } catch (error) {
            // core.hooksPath が設定されていない場合は空文字列
        }
        
        if (currentHooksPath && currentHooksPath !== '.git/hooks') {
            log.warn(`Custom hooks path is set: ${currentHooksPath}`);
            log.info('Consider using the default .git/hooks path for this project');
            
            // ユーザーに選択肢を提供
            const args = process.argv.slice(2);
            if (args.includes('--force-default-path')) {
                execSync('git config --unset core.hooksPath', { 
                    cwd: PROJECT_ROOT, 
                    stdio: 'pipe' 
                });
                log.info('Reset to default hooks path (.git/hooks)');
            } else {
                log.info('To use default hooks path, run: npm run setup:hooks -- --force-default-path');
            }
        }
        
        return true;
    } catch (error) {
        log.error(`Failed to configure Git hooks: ${error.message}`);
        return false;
    }
}

/**
 * フック動作テスト
 */
function testHooks() {
    try {
        log.info('Testing installed hooks...');
        
        // pre-commit フックのテスト
        const preCommitPath = path.join(GIT_HOOKS_DIR, 'pre-commit');
        if (fs.existsSync(preCommitPath)) {
            try {
                // dry-run モードで実行（実際にはコミットしない）
                log.info('Testing pre-commit hook...');
                
                // フックの基本チェック（シンタックスなど）
                const testResult = execSync(`bash -n "${preCommitPath}"`, {
                    cwd: PROJECT_ROOT,
                    encoding: 'utf8'
                });
                
                log.success('pre-commit hook syntax is valid');
            } catch (testError) {
                log.error(`pre-commit hook test failed: ${testError.message}`);
                return false;
            }
        }
        
        return true;
    } catch (error) {
        log.error(`Hook testing failed: ${error.message}`);
        return false;
    }
}

/**
 * package.json にスクリプトを追加
 */
function updatePackageJson() {
    try {
        const packageJsonPath = path.join(PROJECT_ROOT, 'package.json');
        if (!fs.existsSync(packageJsonPath)) {
            log.warn('package.json not found, skipping script addition');
            return true;
        }
        
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        if (!packageJson.scripts) {
            packageJson.scripts = {};
        }
        
        // Git hooks関連のスクリプトを追加
        const scriptsToAdd = {
            'setup:hooks': 'node scripts/setup-git-hooks.js',
            'setup:hooks:force': 'node scripts/setup-git-hooks.js --force-default-path'
        };
        
        let modified = false;
        for (const [scriptName, scriptCommand] of Object.entries(scriptsToAdd)) {
            if (!packageJson.scripts[scriptName]) {
                packageJson.scripts[scriptName] = scriptCommand;
                modified = true;
                log.info(`Added script: ${scriptName}`);
            }
        }
        
        if (modified) {
            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
            log.success('Updated package.json with hook setup scripts');
        }
        
        return true;
    } catch (error) {
        log.error(`Failed to update package.json: ${error.message}`);
        return false;
    }
}

/**
 * 使用方法を表示
 */
function showUsage() {
    console.log(`
Git Hooks Setup Script

Usage:
  node scripts/setup-git-hooks.js [options]

Options:
  --help                    Show this help message
  --force-default-path      Reset to default Git hooks path (.git/hooks)
  --test-only              Only test existing hooks, don't install new ones

Examples:
  node scripts/setup-git-hooks.js
  npm run setup:hooks
  npm run setup:hooks:force

Installed Hooks:
  pre-commit               Validates game balance configuration before commit

Hook Files Location:
  Source: .githooks/
  Target: .git/hooks/
    `);
}

/**
 * メイン実行関数
 */
async function main() {
    try {
        const args = process.argv.slice(2);
        
        if (args.includes('--help') || args.includes('-h')) {
            showUsage();
            process.exit(0);
        }
        
        log.info('Setting up Git hooks for game balance configuration validation...');
        
        // Git リポジトリチェック
        if (!checkGitRepository()) {
            process.exit(1);
        }
        
        // test-onlyモードの場合
        if (args.includes('--test-only')) {
            log.info('Running in test-only mode...');
            const testSuccess = testHooks();
            process.exit(testSuccess ? 0 : 1);
        }
        
        // フックディレクトリの確保
        if (!ensureHooksDirectory()) {
            process.exit(1);
        }
        
        // Git設定の確認
        if (!configureGitHooks()) {
            log.warn('Git configuration check failed, but continuing...');
        }
        
        // フックファイルのコピー
        if (!copyHookFiles()) {
            log.error('Failed to install hook files');
            process.exit(1);
        }
        
        // フックのテスト
        if (!testHooks()) {
            log.warn('Hook testing failed, but installation completed');
        }
        
        // package.json の更新
        if (!updatePackageJson()) {
            log.warn('Failed to update package.json, but hooks are installed');
        }
        
        log.success('✅ Git hooks setup completed successfully!');
        
        console.log(`
Next steps:
1. The pre-commit hook will automatically validate configuration changes
2. To manually run validation: npm run validate:config
3. To test the pre-commit hook: make a config change and try to commit
4. To bypass validation (if needed): git commit --no-verify

Configuration files monitored:
- src/config/GameBalance.js
- src/config/GameConfig.js
- src/bubbles/Bubble.js
- tests/unit/Bubble.test.js
        `);
        
    } catch (error) {
        log.error(`Setup failed: ${error.message}`);
        console.error(error.stack);
        process.exit(1);
    }
}

// メイン実行
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export {
    checkGitRepository,
    ensureHooksDirectory,
    copyHookFiles,
    configureGitHooks,
    testHooks,
    updatePackageJson
};