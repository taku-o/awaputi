#!/usr/bin/env node

/**
 * Deployment script for BubblePop game
 * Handles deployment to multiple platforms with environment-specific configurations
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

class Deployer {
  constructor() {
    this.platforms = ['netlify', 'vercel', 'gh-pages'];
    this.environments = ['development', 'staging', 'production'];
  }

  /**
   * Main deployment function
   */
  async deploy(platform, environment = 'production') {
    console.log(`🚀 Starting deployment to ${platform} (${environment})...`);
    
    try {
      // Validate inputs
      this.validateInputs(platform, environment);
      
      // Pre-deployment checks
      await this.preDeploymentChecks();
      
      // Build for target environment
      await this.buildForEnvironment(environment);
      
      // Deploy to platform
      await this.deployToPlatform(platform, environment);
      
      // Post-deployment verification
      await this.postDeploymentVerification(platform);
      
      console.log(`✅ Successfully deployed to ${platform}!`);
      
    } catch (error) {
      console.error(`❌ Deployment to ${platform} failed:`, error.message);
      process.exit(1);
    }
  }

  /**
   * Validate deployment inputs
   */
  validateInputs(platform, environment) {
    if (!this.platforms.includes(platform)) {
      throw new Error(`Invalid platform: ${platform}. Supported: ${this.platforms.join(', ')}`);
    }
    
    if (!this.environments.includes(environment)) {
      throw new Error(`Invalid environment: ${environment}. Supported: ${this.environments.join(', ')}`);
    }
  }

  /**
   * Pre-deployment checks
   */
  async preDeploymentChecks() {
    console.log('🔍 Running pre-deployment checks...');
    
    // Check if we're on a clean git state (for production)
    if (process.env.NODE_ENV === 'production') {
      try {
        const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
        if (gitStatus.trim()) {
          console.warn('⚠️  Warning: Working directory is not clean');
        }
      } catch (error) {
        console.warn('⚠️  Could not check git status');
      }
    }
    
    // Run tests
    console.log('🧪 Running tests...');
    execSync('npm run test', { cwd: rootDir, stdio: 'inherit' });
    
    // Check bundle size
    console.log('📦 Checking bundle size...');
    try {
      execSync('npm run size-check', { cwd: rootDir, stdio: 'inherit' });
    } catch (error) {
      console.warn('⚠️  Bundle size check failed, continuing...');
    }
    
    console.log('✅ Pre-deployment checks passed');
  }

  /**
   * Build for specific environment
   */
  async buildForEnvironment(environment) {
    console.log(`🔨 Building for ${environment}...`);
    
    const buildCommands = {
      development: 'npm run build:dev',
      staging: 'npm run build:staging',
      production: 'npm run build'
    };
    
    const buildCommand = buildCommands[environment];
    execSync(buildCommand, { cwd: rootDir, stdio: 'inherit' });
    
    console.log('✅ Build completed');
  }

  /**
   * Deploy to specific platform
   */
  async deployToPlatform(platform, environment) {
    console.log(`📤 Deploying to ${platform}...`);
    
    switch (platform) {
      case 'netlify':
        await this.deployToNetlify(environment);
        break;
      case 'vercel':
        await this.deployToVercel(environment);
        break;
      case 'gh-pages':
        await this.deployToGitHubPages(environment);
        break;
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  /**
   * Deploy to Netlify
   */
  async deployToNetlify(environment) {
    const isProduction = environment === 'production';
    const deployFlag = isProduction ? '--prod' : '';
    
    try {
      execSync(`netlify deploy ${deployFlag} --dir=dist`, {
        cwd: rootDir,
        stdio: 'inherit'
      });
    } catch (error) {
      throw new Error(`Netlify deployment failed: ${error.message}`);
    }
  }

  /**
   * Deploy to Vercel
   */
  async deployToVercel(environment) {
    const isProduction = environment === 'production';
    const deployFlag = isProduction ? '--prod' : '';
    
    try {
      execSync(`vercel ${deployFlag}`, {
        cwd: rootDir,
        stdio: 'inherit'
      });
    } catch (error) {
      throw new Error(`Vercel deployment failed: ${error.message}`);
    }
  }

  /**
   * Deploy to GitHub Pages
   */
  async deployToGitHubPages(environment) {
    // GitHub Pages only supports production-like deployments
    try {
      execSync('npm run build:gh-pages', { cwd: rootDir, stdio: 'inherit' });
      execSync('gh-pages -d dist', { cwd: rootDir, stdio: 'inherit' });
    } catch (error) {
      throw new Error(`GitHub Pages deployment failed: ${error.message}`);
    }
  }

  /**
   * Post-deployment verification
   */
  async postDeploymentVerification(platform) {
    console.log('🔍 Running post-deployment verification...');
    
    // Wait a bit for deployment to propagate
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Platform-specific verification URLs
    const verificationUrls = {
      netlify: process.env.NETLIFY_URL || 'https://bubblepop.netlify.app',
      vercel: process.env.VERCEL_URL || 'https://bubble-pop-web-game.vercel.app',
      'gh-pages': 'https://yourusername.github.io/bubble-pop-web-game'
    };
    
    const url = verificationUrls[platform];
    
    if (url) {
      console.log(`🌐 Deployment URL: ${url}`);
      
      // Basic health check
      try {
        const response = await fetch(url);
        if (response.ok) {
          console.log('✅ Deployment is accessible');
        } else {
          console.warn(`⚠️  Deployment returned status: ${response.status}`);
        }
      } catch (error) {
        console.warn('⚠️  Could not verify deployment accessibility:', error.message);
      }
    }
    
    console.log('✅ Post-deployment verification completed');
  }

  /**
   * Deploy to all platforms
   */
  async deployAll(environment = 'production') {
    console.log(`🚀 Deploying to all platforms (${environment})...`);
    
    for (const platform of this.platforms) {
      try {
        await this.deploy(platform, environment);
        console.log(`✅ ${platform} deployment completed`);
      } catch (error) {
        console.error(`❌ ${platform} deployment failed:`, error.message);
        // Continue with other platforms
      }
    }
    
    console.log('🎉 Multi-platform deployment completed!');
  }
}

// CLI interface
const args = process.argv.slice(2);
const platform = args[0];
const environment = args[1] || 'production';

if (!platform) {
  console.log(`
Usage: node scripts/deploy.js <platform> [environment]

Platforms: netlify, vercel, gh-pages, all
Environments: development, staging, production (default)

Examples:
  node scripts/deploy.js netlify production
  node scripts/deploy.js vercel staging
  node scripts/deploy.js all production
  `);
  process.exit(1);
}

const deployer = new Deployer();

if (platform === 'all') {
  deployer.deployAll(environment).catch(console.error);
} else {
  deployer.deploy(platform, environment).catch(console.error);
}

export default Deployer;