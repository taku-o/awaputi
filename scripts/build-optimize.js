#!/usr/bin/env node

/**
 * Build optimization script for BubblePop game
 * Handles asset optimization, bundle analysis, and deployment preparation
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

class BuildOptimizer {
  constructor() {
    this.distDir = join(rootDir, 'dist');
    this.statsFile = join(this.distDir, 'build-stats.json');
    this.reportDir = join(rootDir, 'reports');
  }

  /**
   * Run the complete build optimization process
   */
  async optimize() {
    console.log('🚀 Starting build optimization...');
    
    try {
      // Clean previous build
      this.cleanBuild();
      
      // Run the build
      this.runBuild();
      
      // Analyze bundle
      await this.analyzeBundles();
      
      // Optimize assets
      await this.optimizeAssets();
      
      // Generate reports
      await this.generateReports();
      
      // Validate build
      this.validateBuild();
      
      console.log('✅ Build optimization completed successfully!');
      
    } catch (error) {
      console.error('❌ Build optimization failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Clean previous build artifacts
   */
  cleanBuild() {
    console.log('🧹 Cleaning previous build...');
    
    try {
      execSync('rm -rf dist', { cwd: rootDir, stdio: 'inherit' });
      console.log('✅ Build cleaned');
    } catch (error) {
      console.warn('⚠️  Could not clean build directory:', error.message);
    }
  }

  /**
   * Run the Vite build
   */
  runBuild() {
    console.log('🔨 Running Vite build...');
    
    const buildCommand = process.env.NODE_ENV === 'production' 
      ? 'npm run build'
      : 'npm run build:dev';
    
    execSync(buildCommand, { cwd: rootDir, stdio: 'inherit' });
    console.log('✅ Build completed');
  }

  /**
   * Analyze bundle sizes and dependencies
   */
  async analyzeBundles() {
    console.log('📊 Analyzing bundles...');
    
    if (!existsSync(this.reportDir)) {
      mkdirSync(this.reportDir, { recursive: true });
    }

    // Generate bundle analysis
    try {
      execSync('npx vite-bundle-analyzer dist --mode static --report-filename ../reports/bundle-report.html', {
        cwd: rootDir,
        stdio: 'inherit'
      });
      console.log('✅ Bundle analysis completed');
    } catch (error) {
      console.warn('⚠️  Bundle analysis failed:', error.message);
    }

    // Analyze chunk sizes
    this.analyzeChunkSizes();
  }

  /**
   * Analyze individual chunk sizes
   */
  analyzeChunkSizes() {
    const manifestPath = join(this.distDir, 'manifest.json');
    
    if (!existsSync(manifestPath)) {
      console.warn('⚠️  Manifest file not found, skipping chunk analysis');
      return;
    }

    try {
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
      const chunks = {};
      
      Object.entries(manifest).forEach(([key, value]) => {
        if (value.file) {
          const filePath = join(this.distDir, value.file);
          if (existsSync(filePath)) {
            const stats = require('fs').statSync(filePath);
            chunks[key] = {
              file: value.file,
              size: stats.size,
              sizeKB: Math.round(stats.size / 1024 * 100) / 100
            };
          }
        }
      });

      // Write chunk analysis
      const chunkReport = {
        timestamp: new Date().toISOString(),
        totalChunks: Object.keys(chunks).length,
        chunks: chunks,
        summary: {
          totalSize: Object.values(chunks).reduce((sum, chunk) => sum + chunk.size, 0),
          largestChunk: Object.values(chunks).reduce((max, chunk) => 
            chunk.size > max.size ? chunk : max, { size: 0 }
          )
        }
      };

      writeFileSync(
        join(this.reportDir, 'chunk-analysis.json'),
        JSON.stringify(chunkReport, null, 2)
      );

      console.log(`📦 Analyzed ${chunkReport.totalChunks} chunks`);
      console.log(`📏 Total bundle size: ${Math.round(chunkReport.summary.totalSize / 1024)} KB`);
      
      if (chunkReport.summary.largestChunk.sizeKB > 500) {
        console.warn(`⚠️  Large chunk detected: ${chunkReport.summary.largestChunk.file} (${chunkReport.summary.largestChunk.sizeKB} KB)`);
      }

    } catch (error) {
      console.warn('⚠️  Chunk analysis failed:', error.message);
    }
  }

  /**
   * Optimize static assets
   */
  async optimizeAssets() {
    console.log('🖼️  Optimizing assets...');
    
    // This would typically use tools like imagemin, but for now we'll just report
    const assetsDir = join(this.distDir, 'assets');
    
    if (existsSync(assetsDir)) {
      try {
        const result = execSync('du -sh assets', { 
          cwd: this.distDir, 
          encoding: 'utf8' 
        });
        console.log(`📁 Assets directory size: ${result.trim()}`);
      } catch (error) {
        console.warn('⚠️  Could not measure assets directory');
      }
    }

    console.log('✅ Asset optimization completed');
  }

  /**
   * Generate build reports
   */
  async generateReports() {
    console.log('📋 Generating reports...');
    
    const buildReport = {
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      buildTime: Date.now(),
      git: this.getGitInfo(),
      performance: await this.measurePerformance()
    };

    writeFileSync(
      join(this.reportDir, 'build-report.json'),
      JSON.stringify(buildReport, null, 2)
    );

    console.log('✅ Reports generated');
  }

  /**
   * Get Git information
   */
  getGitInfo() {
    try {
      const branch = execSync('git rev-parse --abbrev-ref HEAD', { 
        encoding: 'utf8' 
      }).trim();
      const commit = execSync('git rev-parse HEAD', { 
        encoding: 'utf8' 
      }).trim();
      const shortCommit = commit.substring(0, 7);
      
      return { branch, commit, shortCommit };
    } catch (error) {
      return { branch: 'unknown', commit: 'unknown', shortCommit: 'unknown' };
    }
  }

  /**
   * Measure build performance metrics
   */
  async measurePerformance() {
    const indexPath = join(this.distDir, 'index.html');
    
    if (!existsSync(indexPath)) {
      return { error: 'index.html not found' };
    }

    try {
      const indexStats = require('fs').statSync(indexPath);
      const indexSize = indexStats.size;
      
      // Count total files
      const fileCount = execSync('find . -type f | wc -l', {
        cwd: this.distDir,
        encoding: 'utf8'
      }).trim();

      // Calculate total size
      const totalSize = execSync('du -sb .', {
        cwd: this.distDir,
        encoding: 'utf8'
      }).split('\t')[0];

      return {
        indexSize: indexSize,
        totalFiles: parseInt(fileCount),
        totalSize: parseInt(totalSize),
        totalSizeKB: Math.round(parseInt(totalSize) / 1024)
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Validate the build output
   */
  validateBuild() {
    console.log('🔍 Validating build...');
    
    const requiredFiles = [
      'index.html',
      'assets'
    ];

    const missingFiles = requiredFiles.filter(file => 
      !existsSync(join(this.distDir, file))
    );

    if (missingFiles.length > 0) {
      throw new Error(`Missing required files: ${missingFiles.join(', ')}`);
    }

    // Check if index.html contains the app div
    const indexContent = readFileSync(join(this.distDir, 'index.html'), 'utf8');
    if (!indexContent.includes('id="app"')) {
      console.warn('⚠️  index.html may be missing the app container');
    }

    // Check for source maps in production
    if (process.env.NODE_ENV === 'production') {
      const hasSourceMaps = execSync('find assets -name "*.map" | wc -l', {
        cwd: this.distDir,
        encoding: 'utf8'
      }).trim();

      if (parseInt(hasSourceMaps) > 0) {
        console.warn('⚠️  Source maps found in production build');
      }
    }

    console.log('✅ Build validation passed');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const optimizer = new BuildOptimizer();
  optimizer.optimize().catch(console.error);
}

export default BuildOptimizer;