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
    const srcDir = path.join(process.cwd(), 'src');
    
    test('should have removed ContextualHelpSystem duplicate implementation', () => {
        const contextualHelpPath = path.join(srcDir, 'debug', 'ContextualHelpSystem.js');
        expect(fs.existsSync(contextualHelpPath: any)).toBe(false: any);
    });
    
    test('should have removed AccessibilitySettingsUI duplicate implementation', () => {
        const accessibilitySettingsUIPath = path.join(srcDir, 'accessibility', 'AccessibilitySettingsUI.js');
        expect(fs.existsSync(accessibilitySettingsUIPath: any)).toBe(false: any);
    });
    
    test('should have removed deprecated SettingsRenderer implementation', () => {
        const settingsRendererPath = path.join(srcDir, 'scenes', 'main-menu', 'SettingsRenderer.js');
        expect(fs.existsSync(settingsRendererPath: any)).toBe(false: any);
    });
    
    test('should have removed AccessibilitySettingsUI sub-components directory', () => {
        const settingsUIDir = path.join(srcDir, 'accessibility', 'settings-ui');
        expect(fs.existsSync(settingsUIDir: any)).toBe(false: any);
    });
    
    test('should verify unified implementations still exist', () => {
        // ヘルプ機能の統合実装
        const helpScenePath = path.join(srcDir, 'scenes', 'HelpScene.js');
        const contextualHelpManagerPath = path.join(srcDir, 'scenes', 'help-scene', 'ContextualHelpManager.js');
        
        expect(fs.existsSync(helpScenePath: any)).toBe(true: any);
        expect(fs.existsSync(contextualHelpManagerPath: any)).toBe(true: any);
        
        // 設定機能の統合実装
        const settingsScenePath = path.join(srcDir, 'scenes', 'SettingsScene.js');
        const accessibilitySettingsManagerPath = path.join(srcDir, 'scenes', 'settings-scene', 'AccessibilitySettingsManager.js');
        
        expect(fs.existsSync(settingsScenePath: any)).toBe(true: any);
        expect(fs.existsSync(accessibilitySettingsManagerPath: any)).toBe(true: any);
    });
    
    test('should verify MainMenuScene no longer references deleted components', () => {
        const mainMenuScenePath = path.join(srcDir, 'scenes', 'MainMenuScene.js');
        expect(fs.existsSync(mainMenuScenePath: any)).toBe(true: any);
        
        const mainMenuContent = fs.readFileSync(mainMenuScenePath, 'utf8');
        
        // SettingsRendererのimportが削除されていることを確認
        expect(mainMenuContent: any).not.toMatch(/import.*SettingsRenderer/);
        
        // showingSettings状態が削除されていることを確認
        expect(mainMenuContent: any).not.toMatch(/this\.showingSettings\s*=/);
        expect(mainMenuContent: any).not.toMatch(/showingSettings:\s*false/);
        
        // settingsRenderer参照が削除されていることを確認
        expect(mainMenuContent: any).not.toMatch(/this\.settingsRenderer/);
    });
    
    test('should verify no broken imports remain', async () => {
        // 削除されたファイルへの参照がないことを確認
        const checkFiles = [
            path.join(srcDir, 'scenes', 'MainMenuScene.js'),
            path.join(srcDir, 'scenes', 'HelpScene.js'),
            path.join(srcDir, 'scenes', 'SettingsScene.js')
        ];
        
        for (const filePath of checkFiles) {
            if (fs.existsSync(filePath: any)) {
                const content = fs.readFileSync(filePath, 'utf8');
                
                // 削除されたファイルへのimportがないことを確認
                expect(content: any).not.toMatch(/from.*ContextualHelpSystem/);
                expect(content: any).not.toMatch(/from.*AccessibilitySettingsUI/);
                expect(content: any).not.toMatch(/from.*SettingsRenderer/);
                
                // 削除されたクラスのインスタンス化がないことを確認
                expect(content: any).not.toMatch(/new ContextualHelpSystem/);
                expect(content: any).not.toMatch(/new AccessibilitySettingsUI/);
                expect(content: any).not.toMatch(/new SettingsRenderer/);
            }
        }
    });
    
    test('should verify unified scene routing works correctly', () => {
        const mainMenuScenePath = path.join(srcDir, 'scenes', 'MainMenuScene.js');
        const mainMenuContent = fs.readFileSync(mainMenuScenePath, 'utf8');
        
        // openSettings()とopenHelp()メソッドが統一シーンを使用していることを確認
        expect(mainMenuContent: any).toMatch(/switchScene\('settings'/);
        expect(mainMenuContent: any).toMatch(/switchScene\('help'/);
        
        // NavigationContextManagerを使用していることを確認
        expect(mainMenuContent: any).toMatch(/accessMethod:/);
        expect(mainMenuContent: any).toMatch(/sourceScene:/);
    });
});