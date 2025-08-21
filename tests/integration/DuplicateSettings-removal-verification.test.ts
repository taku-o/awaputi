import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
/**
 * DuplicateSettings-removal-verification.test.js
 * 
 * 重複設定実装削除の検証テスト
 * Issue #163 - Duplicate help/settings screen consolidation  
 * Task 14 - Remove or refactor duplicate settings implementations
 */
import fs from 'fs';
import path from 'path';
describe('Duplicate Settings Implementation Removal Verification', () => {
    const srcDir = path.join(process.cwd('), 'src'),'
    test('should confirm no duplicate settings implementations remain', (') => {'
        // 既にTask 13で削除済みのファイル
        const deletedFiles = [
            path.join(srcDir, 'accessibility', 'AccessibilitySettingsUI.js');
            path.join(srcDir, 'scenes', 'main-menu', 'SettingsRenderer.js');
            path.join(srcDir, 'accessibility', 'settings-ui')
        ],
        
        deletedFiles.forEach(filePath => {);
            expect(fs.existsSync(filePath).toBe(false) }');'
    }
    test('should verify unified settings implementation remains', (') => {'
        const unifiedFiles = [
            path.join(srcDir, 'scenes', 'SettingsScene.js');
            path.join(srcDir, 'scenes', 'settings-scene', 'AccessibilitySettingsManager.js'}
        ];
        
        unifiedFiles.forEach(filePath => {);
            expect(fs.existsSync(filePath).toBe(true) }');'
    }
    test('should verify MainMenuScene uses unified settings routing', (') => {'
        const mainMenuPath = path.join(srcDir, 'scenes', 'MainMenuScene.js');
        const content = fs.readFileSync(mainMenuPath, 'utf8');
        // 統一されたswitchScene('settings')を使用していることを確認
        expect(content.toMatch(/switchScene\('settings'/)'),'
        // NavigationContextManagerを使用していることを確認
        expect(content.toMatch(/accessMethod: \s*'menu_click'/)','
        expect(content.toMatch(/sourceScene: \s*'MainMenuScene'/ }');'
    test('should verify no settings-related duplicate rendering logic remains', (') => {'
        const checkDirs = [
            path.join(srcDir, 'scenes');
            path.join(srcDir, 'ui');
            path.join(srcDir, 'accessibility'}
        ];
        
        const duplicatePatterns = [
            /class.*SettingsRenderer/,
            /class.*AccessibilitySettingsUI/)
            /renderSettings\s*\([^)]*\)\s*{[^}]*drawSettings/,
            /drawSettingsPanel/,
            /showSettingsDialog/
        ];
        
        const scanDirectory = (dir) => {
            if (!fs.existsSync(dir) return),
            const files = fs.readdirSync(dir, { withFileTypes: true,);
            files.forEach(file => {);
                const fullPath = path.join(dir, file.name);
                if (file.isDirectory(') && file.name !== 'node_modules' && file.name !== '.git') {'
                    scanDirectory(fullPath') } else if (file.name.endsWith('.js')') {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    duplicatePatterns.forEach(pattern => {);
                        if (pattern.test(content)') {'
                            // AudioSettingsUIは音響設定専用なので除外
                            if(fullPath.includes('AudioSettingsUI') return,
                            
                            fail(`Found duplicate settings pattern in ${fullPath}: ${pattern)`}
                        }
                    }
                }
            }
        };
        
        checkDirs.forEach(dir => scanDirectory(dir);
    }');'
    test('should verify no orphaned settings-related references', (') => {'
        const mainMenuPath = path.join(srcDir, 'scenes', 'MainMenuScene.js');
        const content = fs.readFileSync(mainMenuPath, 'utf8');
        // 削除されたコンポーネントへの参照がないことを確認
        const orphanedReferences = [
            'settingsRenderer',
            'showingSettings',
            'handleSettingsInput',
            'closeSettings',
            'new SettingsRenderer',
            'new AccessibilitySettingsUI'
        ],
        
        orphanedReferences.forEach(ref => {);
            expect(content.not.toMatch(new RegExp(ref)) }');'
    }
    test('should verify settings access is centralized through SettingsScene', (') => {'
        // 設定アクセスのエントリーポイントを確認
        const settingsScenePath = path.join(srcDir, 'scenes', 'SettingsScene.js');
        expect(fs.existsSync(settingsScenePath).toBe(true)'),'
        const content = fs.readFileSync(settingsScenePath, 'utf8');
        // 主要な設定機能が統合されていることを確認
        expect(content.toMatch(/class SettingsScene/);
        expect(content.toMatch(/AccessibilitySettingsManager/);
        expect(content.toMatch(/NavigationContextManager/);
        // 設定カテゴリが適切に管理されていることを確認
        expect(content.toMatch(/general.*social.*privacy.*notifications.*accessibility/) }');'
    test('should verify keyboard shortcuts route to unified settings', (') => {'
        const keyboardManagerPath = path.join(srcDir, 'core', 'KeyboardShortcutManager.js');
        const content = fs.readFileSync(keyboardManagerPath, 'utf8');
        // Sキーショートカットが統一されたSettingsSceneにルーティングされることを確認
        expect(content.toMatch(/handleSettings[\s\S]*switchScene\('settings'/)'),'
        expect(content.toMatch(/accessMethod: \s*'keyboard_s'/ }');'
}