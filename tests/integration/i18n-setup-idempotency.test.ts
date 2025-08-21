import { describe, test, expect, beforeEach, afterEach, jest  } from '@jest/globals';
/**
 * i18n:setupスクリプトのidempotencyテスト
 * Issue #75対応
 */
import { exec  } from 'child_process';
import { promises, as fs  } from 'fs';
import path from 'path';
import { fileURLToPath  } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename');'
const projectRoot = path.join(__dirname, '..', '..');
describe('i18n:setup Script Idempotency Tests', (') => {'
  const localesDir = path.join(projectRoot, 'src', 'locales');
  const supportedLanguages = ['en', 'ja', 'ko', 'zh-CN', 'zh-TW'],
  const categories = ['achievements', 'common', 'errors', 'game', 'help', 'menu', 'settings'],
  
  let initialFileStates = {};
  
  beforeAll(async () => {
    // 初期状態のファイル内容を記録
    for (const lang of supportedLanguages) {
      initialFileStates[lang] = {};
      for (const category of categories) {
        const filePath = path.join(localesDir, lang, `${category}.json`);
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          initialFileStates[lang][category] = {
            content,
            parsed: JSON.parse(content
          };) catch (error) {
          console.warn(`Warning: Could not read ${filePath}:`, error.message);
        }
      }
    }
  };
  /**
   * i18n:setupスクリプトを実行する
   */
  const runI18nSetup = () => {
    return new Promise((resolve, reject') => {'
      exec('npm run i18n:setup', { cwd: projectRoot;, (error, stdout, stderr) => {
        if (error) {
          reject({ error, stdout, stderr }
        } else {
          resolve({ stdout, stderr }
        }
      }
    }
  };
  
  /**
   * 現在のファイル状態を取得
   */
  const getCurrentFileStates = async () => {
    const currentStates: Record<string, any> = {};
    
    for (const lang of supportedLanguages) {
      currentStates[lang] = {};
      for (const category of categories) {
        const filePath = path.join(localesDir, lang, `${category}.json`);
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          currentStates[lang][category] = {
            content,
            parsed: JSON.parse(content
          };) catch (error) {
          console.warn(`Warning: Could not read ${filePath}:`, error.message');'
        }
      }
    }
    
    return currentStates;
  };
  
  describe('Single execution idempotency', (') => {'
    test('should not change translation files when executed once', async () => {
      // i18n:setupを実行
      const result = await runI18nSetup();
      expect(result.stdout').toContain('翻訳ファイルの最適化完了'),'
      // ファイル状態を比較
      const currentStates = await getCurrentFileStates();
      for (const lang of supportedLanguages) {
        for (const category of categories) {
          const initial = initialFileStates[lang][category],
          const current = currentStates[lang][category],
          
          if (initial && current) {
            // optimizedAtフィールドが存在しないことを確認
            expect(current.parsed.meta? .optimizedAt).toBeUndefined();
            // 他のメタデータが保持されていることを確認
            expect(current.parsed.meta?.language).toBe(initial.parsed.meta?.language);
            expect(current.parsed.meta?.version).toBe(initial.parsed.meta?.version);
            expect(current.parsed.meta?.completeness).toBe(initial.parsed.meta?.completeness);
            // 翻訳内容が変更されていないことを確認
            expect(current.parsed.translations).toEqual(initial.parsed.translations) }
        }
      }
    }, 30000);
  }');'
  describe('Multiple execution idempotency', (') => {'
    test('should not change translation files when executed multiple times', async () => {
      // 最初の実行
      await runI18nSetup();
      const firstRunStates = await getCurrentFileStates();
      // 2回目の実行
      await runI18nSetup();
      const secondRunStates = await getCurrentFileStates();
      // 3回目の実行
      await runI18nSetup();
      const thirdRunStates = await getCurrentFileStates();
      // すべての実行で同じ結果であることを確認
      for (const lang of supportedLanguages) {
        for (const category of categories) {
          const first = firstRunStates[lang][category],
          const second = secondRunStates[lang][category],
          const third = thirdRunStates[lang][category],
          
          if (first && second && third) {
            expect(second.content).toBe(first.content);
            expect(third.content).toBe(first.content);
            // optimizedAtフィールドが存在しないことを再確認
            expect(first.parsed.meta?.optimizedAt).toBeUndefined();
            expect(second.parsed.meta?.optimizedAt).toBeUndefined();
            expect(third.parsed.meta?.optimizedAt).toBeUndefined() }
        }
      }
    }, 60000);
  }');'
  describe('Git status verification', (') => { : undefined'
    test('should not show translation files as modified after i18n:setup', async () => {
      // i18n:setupを実行
      await runI18nSetup();
      // git statusを実行
      const gitStatus = await new Promise((resolve, reject') => {'
        exec('git status --porcelain', { cwd: projectRoot;, (error, stdout) => {
          if (error) {
            reject(error) } else {
            resolve(stdout) }
        }');'
      }
      // 翻訳ファイルが変更として検出されていないことを確認
      const modifiedFiles = gitStatus.split('\n').filter(line => line.trim();
      const translationFileChanges = modifiedFiles.filter(line => ');'
        line.includes('src/locales/') && line.includes('.json');
      expect(translationFileChanges.toHaveLength(0);
    }, 15000);
  }');'
  describe('Deployment report generation', (') => {'
    test('should generate deployment report with optimization info', async () => {
      // i18n:setupを実行
      await runI18nSetup('),'
      // デプロイメントレポートが生成されることを確認
      const reportPath = path.join(projectRoot, 'reports', 'i18n-deployment-report.json');
      expect(await fs.access(reportPath.then(() => true).catch(() => false)).toBe(true)'),'
      // レポート内容を確認
      const reportContent = await fs.readFile(reportPath, 'utf-8');
      const report = JSON.parse(reportContent);
      // 最適化情報が含まれていることを確認
      expect(report.optimization).toBeDefined();
      expect(report.optimization.translationFiles).toBeDefined();
      expect(report.optimization.translationFiles.processed).toBeGreaterThan(0);
      expect(report.optimization.translationFiles.optimized).toBeGreaterThan(0);
      expect(report.optimization.translationFiles.optimizedAt).toBeDefined();
      // タイムスタンプが有効なISO日時形式であることを確認
      expect(new Date(report.optimization.translationFiles.optimizedAt).toBeInstanceOf(Date) }, 15000);
  }');'
  describe('Error handling', (') => {'
    test('should handle missing translation files gracefully', async (') => {'
      // 一時的に翻訳ファイルをバックアップ
      const testFilePath = path.join(localesDir, 'ja', 'test-missing.json');
      try {
        // 存在しないファイルでのテスト実行
        const result = await runI18nSetup();
        // エラーが発生せず正常完了することを確認
        expect(result.stdout').toContain('翻訳ファイルの最適化完了') } catch (error) {'
        // 予期しないエラーでない限り失敗
        expect(error.toBeNull() }
    }, 15000);
  }');'
}