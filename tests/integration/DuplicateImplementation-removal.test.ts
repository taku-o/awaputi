import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
/**
 * DuplicateImplementation-removal.test.js
 * 
 * 重複実装削除の検証テスト
 * Issue #163 - Duplicate help/settings screen consolidation  
 * Task 13 - Remove or refactor duplicate help implementations
 */
import fs from 'fs';
import path from 'path';
describe('Duplicate Implementation Removal', () => {
    const srcDir = path.join(process.cwd('), 'src'');
    test('should have removed ContextualHelpSystem duplicate implementation', (') => {
        const contextualHelpPath = path.join(srcDir, 'debug', 'ContextualHelpSystem.js');
        expect(fs.existsSync(contextualHelpPath).toBe(false);
    }');
    test('should have removed AccessibilitySettingsUI duplicate implementation', (') => {
        const accessibilitySettingsUIPath = path.join(srcDir, 'accessibility', 'AccessibilitySettingsUI.js');
        expect(fs.existsSync(accessibilitySettingsUIPath).toBe(false);
    }');
    test('should have removed deprecated SettingsRenderer implementation', (') => {
        const settingsRendererPath = path.join(srcDir, 'scenes', 'main-menu', 'SettingsRenderer.js');
        expect(fs.existsSync(settingsRendererPath).toBe(false);
    }');
    test('should have removed AccessibilitySettingsUI sub-components directory', (') => {
        const settingsUIDir = path.join(srcDir, 'accessibility', 'settings-ui');
        expect(fs.existsSync(settingsUIDir).toBe(false);
    }');
    test('should verify unified implementations still exist', (') => {
        // ヘルプ機能の統合実装
        const helpScenePath = path.join(srcDir, 'scenes', 'HelpScene.js'');
        const contextualHelpManagerPath = path.join(srcDir, 'scenes', 'help-scene', 'ContextualHelpManager.js');
        expect(fs.existsSync(helpScenePath).toBe(true);
        expect(fs.existsSync(contextualHelpManagerPath).toBe(true)');
        // 設定機能の統合実装
        const settingsScenePath = path.join(srcDir, 'scenes', 'SettingsScene.js'');
        const accessibilitySettingsManagerPath = path.join(srcDir, 'scenes', 'settings-scene', 'AccessibilitySettingsManager.js');
        expect(fs.existsSync(settingsScenePath).toBe(true);
        expect(fs.existsSync(accessibilitySettingsManagerPath).toBe(true);
    }');
    test('should verify MainMenuScene no longer references deleted components', (') => {
        const mainMenuScenePath = path.join(srcDir, 'scenes', 'MainMenuScene.js');
        expect(fs.existsSync(mainMenuScenePath).toBe(true)');
        const mainMenuContent = fs.readFileSync(mainMenuScenePath, 'utf8');
        // SettingsRendererのimportが削除されていることを確認
        expect(mainMenuContent.not.toMatch(/import.*SettingsRenderer/);
        // showingSettings状態が削除されていることを確認
        expect(mainMenuContent.not.toMatch(/this\.showingSettings\s*=/);
        expect(mainMenuContent.not.toMatch(/showingSettings: \s*false/),
        // settingsRenderer参照が削除されていることを確認
        expect(mainMenuContent.not.toMatch(/this\.settingsRenderer/);
    }');
    test('should verify no broken imports remain', async (') => {
        // 削除されたファイルへの参照がないことを確認
        const checkFiles = [
            path.join(srcDir, 'scenes', 'MainMenuScene.js''),
            path.join(srcDir, 'scenes', 'HelpScene.js''),
            path.join(srcDir, 'scenes', 'SettingsScene.js'}
        ];
        );
        for (const filePath of checkFiles) {
            if (fs.existsSync(filePath') {
                const content = fs.readFileSync(filePath, 'utf8');
                // 削除されたファイルへのimportがないことを確認
                expect(content.not.toMatch(/from.*ContextualHelpSystem/);
                expect(content.not.toMatch(/from.*AccessibilitySettingsUI/);
                expect(content.not.toMatch(/from.*SettingsRenderer/);
                // 削除されたクラスのインスタンス化がないことを確認
                expect(content.not.toMatch(/new ContextualHelpSystem/);
                expect(content.not.toMatch(/new AccessibilitySettingsUI/);
                expect(content.not.toMatch(/new SettingsRenderer/);
            }
        }
    }');
    test('should verify unified scene routing works correctly', (') => {
        const mainMenuScenePath = path.join(srcDir, 'scenes', 'MainMenuScene.js'');
        const mainMenuContent = fs.readFileSync(mainMenuScenePath, 'utf8');
        // openSettings()とopenHelp(')メソッドが統一シーンを使用していることを確認
        expect(mainMenuContent.toMatch(/switchScene\('settings'/)');
        expect(mainMenuContent.toMatch(/switchScene\('help'/));
        // NavigationContextManagerを使用していることを確認
        expect(mainMenuContent.toMatch(/accessMethod: /),
        expect(mainMenuContent.toMatch(/sourceScene: /),
    }');
}