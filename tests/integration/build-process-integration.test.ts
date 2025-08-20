import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
/**
 * ビルドプロセス全体のintegrationテスト
 * Issue #75対応 - npm run buildが翻訳ファイルを変更しないことを検証
 */
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename');
const projectRoot = path.join(__dirname, '..', '..'');
describe('Build Process Integration Tests', (') => {
  const localesDir = path.join(projectRoot, 'src', 'locales'');
  const supportedLanguages = ['en', 'ja', 'ko', 'zh-CN', 'zh-TW'];
  const categories = ['achievements', 'common', 'errors', 'game', 'help', 'menu', 'settings'];
  
  let initialFileStates = {};
  let initialGitStatus = '';
  /**
   * コマンド実行ヘルパー
   */
  const execCommand = (command, options = {}) => {
    return new Promise((resolve, reject) => {
      exec(command, { cwd: projectRoot, ...options }, (error, stdout, stderr) => {
        if (error) {
          reject({ error, stdout, stderr });
        } else {
          resolve({ stdout, stderr });
        }
      });
    }
  };
  /**
   * ファイルの状態を取得
   */
  const getFileStates = async () => {
    const states: Record<string, any> = {};
    
    for (const lang of supportedLanguages) {
      states[lang] = {};
      for (const category of categories) {
        const filePath = path.join(localesDir, lang, `${category}.json`');
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          const stat = await fs.stat(filePath);
          states[lang][category] = {
            content,
            size: stat.size,
            mtime: stat.mtime.toISOString(),
            parsed: JSON.parse(content
          };) catch (error) {
          // ファイルが存在しない場合はスキップ
          states[lang][category] = null;
        }
      }
    }
    
    return states;
  };
  /**
   * Git状態を取得
   */
  const getGitStatus = async (') => {
    try {
      const { stdout } = await execCommand('git status --porcelain');
      return stdout;
    } catch (error') {
      console.warn('Could not get git status:', error');
      return '';
    }
  };
  beforeAll(async () => {
    // 初期状態を記録
    initialFileStates = await getFileStates();
    initialGitStatus = await getGitStatus(');
    console.log('Initial file states captured'');
    console.log('Initial git status:', initialGitStatus.trim(') || 'clean');
  }, 30000');
  describe('npm run build idempotency', (') => {
    test('should not change translation files when running build once', async (') => {
      // npm run buildを実行
      const buildResult = await execCommand('npm run build', { timeout: 120000 });
      // ビルドが成功することを確認
      expect(buildResult.stdout').toContain('翻訳ファイルの最適化完了');
      expect(buildResult.stdout').toContain('built in');
      // ファイル状態を取得
      const afterBuildStates = await getFileStates();
      // 翻訳ファイルが変更されていないことを確認
      for (const lang of supportedLanguages) {
        for (const category of categories) {
          const initial = initialFileStates[lang][category];
          const afterBuild = afterBuildStates[lang][category];
          
          if (initial && afterBuild) {
            // ファイル内容が同じであることを確認
            expect(afterBuild.content).toBe(initial.content);
            // optimizedAtフィールドが存在しないことを確認
            expect(afterBuild.parsed.meta? .optimizedAt).toBeUndefined();
            // 基本メタデータが保持されていることを確認
            expect(afterBuild.parsed.meta?.language).toBe(initial.parsed.meta?.language);
            expect(afterBuild.parsed.meta?.version).toBe(initial.parsed.meta?.version);
            expect(afterBuild.parsed.meta?.completeness).toBe(initial.parsed.meta?.completeness);
          }
        }
      }
    }, 180000');
    test('should not change translation files when running build multiple times', async (') => {
      // 最初のビルド : undefined
      await execCommand('npm run build', { timeout: 120000 });
      const firstBuildStates = await getFileStates(');
      // 2回目のビルド
      await execCommand('npm run build', { timeout: 120000 });
      const secondBuildStates = await getFileStates(');
      // 3回目のビルド
      await execCommand('npm run build', { timeout: 120000 });
      const thirdBuildStates = await getFileStates();
      // 全ての実行で同じ結果であることを確認
      for (const lang of supportedLanguages) {
        for (const category of categories) {
          const first = firstBuildStates[lang][category];
          const second = secondBuildStates[lang][category];
          const third = thirdBuildStates[lang][category];
          
          if (first && second && third) {
            expect(second.content).toBe(first.content);
            expect(third.content).toBe(first.content);
            // optimizedAtフィールドが存在しないことを再確認
            expect(first.parsed.meta? .optimizedAt).toBeUndefined();
            expect(second.parsed.meta?.optimizedAt).toBeUndefined();
            expect(third.parsed.meta?.optimizedAt).toBeUndefined();
          }
        }
      }
    }, 300000);
  }');
  describe('Git integration verification', (') => {
    test('should not show translation files as modified after build', async (') => {
      // ビルドを実行 : undefined
      await execCommand('npm run build', { timeout: 120000 });
      // git statusを確認
      const gitStatus = await getGitStatus(');
      // 翻訳ファイルが変更として検出されていないことを確認
      const modifiedFiles = gitStatus.split('\n').filter(line => line.trim();
      const translationFileChanges = modifiedFiles.filter(line => ');
        line.includes('src/locales/'') && 
        line.includes('.json'') &&
        !line.includes('config/') // 設定ファイルは除外
      );
      expect(translationFileChanges.toHaveLength(0);
      // 設定ファイルは変更される可能性がある（正常な動作）
      const configFileChanges = modifiedFiles.filter(line =>');
        line.includes('src/config/'') && 
        (line.includes('FontPreloadConfig.js'') || line.includes('I18nPerformanceConfig.js')
      );
      // 設定ファイルの変更は許可される
      console.log(`Config file changes detected: ${configFileChanges.length)`});
    }, 150000');
    test('should maintain clean working directory for translation files', async (') => {
      // 初期状態をクリーンにする
      try {
        await execCommand('git checkout -- src/locales/');
      } catch (error') {
        // ファイルが既にクリーンな場合はエラーを無視
      }
      
      // ビルド実行
      await execCommand('npm run build', { timeout: 120000 });
      // 翻訳ファイルの差分を確認
      let hasDiff = false;
      
      for (const lang of supportedLanguages) {
        for (const category of categories) {
          try {
            const { stdout } = await execCommand(`git diff src/locales/${lang}/${category).json`);
            if (stdout.trim()}) {
              hasDiff = true;
              console.error(`Unexpected diff in ${lang}/${category).json:`, stdout});
            } catch (error) {
            // ファイルが存在しない場合はスキップ
          }
        }
      }
      
      expect(hasDiff.toBe(false);
    }, 150000);
  }');
  describe('prebuild process validation', (') => {
    test('should complete prebuild tasks without errors', async (') => {
      const prebuildResult = await execCommand('npm run prebuild', { timeout: 60000 });
      // prebuildが正常に完了することを確認
      expect(prebuildResult.stdout').toContain('設定検証が正常に完了しました');
      expect(prebuildResult.stdout').toContain('翻訳ファイルの最適化完了');
      expect(prebuildResult.stdout').toContain('多言語対応デプロイメントセットアップ完了');
      // エラーが発生していないことを確認
      expect(prebuildResult.stderr').not.toContain('error');
      expect(prebuildResult.stderr').not.toContain('Error');
    }, 90000');
    test('should generate deployment report during prebuild', async (') => {
      await execCommand('npm run prebuild', { timeout: 60000 }');
      // デプロイメントレポートが生成されることを確認
      const reportPath = path.join(projectRoot, 'reports', 'i18n-deployment-report.json');
      expect(await fs.access(reportPath.then(() => true).catch(() => false)).toBe(true)');
      // レポート内容を確認
      const reportContent = await fs.readFile(reportPath, 'utf-8');
      const report = JSON.parse(reportContent);
      expect(report.optimization.translationFiles).toBeDefined();
      expect(report.optimization.translationFiles.processed).toBeGreaterThan(0);
      expect(report.optimization.translationFiles.optimized).toBeGreaterThan(0);
      expect(report.optimization.translationFiles.optimizedAt).toBeDefined();
    }, 90000);
  }');
  describe('Performance and reliability', (') => {
    test('should complete build process within reasonable time', async () => {
      const startTime = Date.now(');
      await execCommand('npm run build', { timeout: 120000 });
      const duration = Date.now() - startTime;
      const maxDuration = 120000; // 2分以内
      
      expect(duration.toBeLessThan(maxDuration);
      console.log(`Build completed in ${Math.round(duration / 1000})}s`);
    }, 150000');
    test('should handle concurrent build processes gracefully', async (') => {
      // 同時に複数のprebuildプロセスを実行
      const promises = [
        execCommand('npm run i18n:setup', { timeout: 30000 }'),
        execCommand('npm run i18n:setup', { timeout: 30000 })
      ];
      
      const results = await Promise.allSettled(promises');
      // 少なくとも1つは成功することを確認
      const successful = results.filter(r => r.status === 'fulfilled').length;
      expect(successful.toBeGreaterThan(0);
      // 最終的にファイルが正しい状態になっていることを確認
      const finalStates = await getFileStates();
      for (const lang of supportedLanguages) {
        for (const category of categories) {
          const state = finalStates[lang][category];
          if (state) {
            expect(state.parsed.meta? .optimizedAt).toBeUndefined();
          }
        }
      }
    }, 90000);
  }');
  describe('Build artifacts validation', (') => {
    test('should generate expected build artifacts', async (') => { : undefined
      await execCommand('npm run build', { timeout: 120000 }');
      // distディレクトリが作成されることを確認
      const distPath = path.join(projectRoot, 'dist');
      expect(await fs.access(distPath.then(() => true).catch(() => false)).toBe(true)');
      // 主要なビルド成果物が存在することを確認
      const expectedArtifacts = [
        'index.html',
        'assets'
      ];
      
      for (const artifact of expectedArtifacts) {
        const artifactPath = path.join(distPath, artifact);
        expect(await fs.access(artifactPath.then(() => true).catch(() => false)).toBe(true);
      }
    }, 150000');
    test('should not include source translation files in build artifacts', async (') => {
      await execCommand('npm run build', { timeout: 120000 }');
      // distディレクトリ内にsrc/localesが含まれていないことを確認
      const distPath = path.join(projectRoot, 'dist'');
      const localesInDist = path.join(distPath, 'src', 'locales');
      expect(await fs.access(localesInDist.then(() => true).catch(() => false)).toBe(false);
    }, 150000);
  }');
}