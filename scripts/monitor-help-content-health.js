#!/usr/bin/env node

/**
 * Help Content Health Monitor
 * 
 * Monitors the health of multilingual help content:
 * - File availability checking
 * - Content freshness monitoring
 * - Error rate tracking for help system
 * - Dashboard integration preparation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Help content directory
const HELP_CONTENT_DIR = path.join(__dirname, '..', 'src', 'core', 'help', 'content', 'help');

// Supported languages
const SUPPORTED_LANGUAGES = ['en', 'ja', 'ko', 'zh-CN', 'zh-TW'];

// Required help file categories
const REQUIRED_CATEGORIES = ['bubbles', 'controls', 'settings', 'troubleshooting', 'gameplay', 'scoring'];

// Health thresholds
const HEALTH_THRESHOLDS = {
  STALE_DAYS: 180,           // Content older than 6 months is considered stale
  WARNING_DAYS: 90,          // Content older than 3 months triggers warning
  MIN_FILE_SIZE: 100,        // Minimum file size in bytes
  MAX_FILE_SIZE: 1048576,    // Maximum file size (1MB)
  MIN_TOPICS: 1,             // Minimum number of topics per file
  MIN_CONTENT_LENGTH: 50     // Minimum content length per topic
};

class HelpContentHealthMonitor {
  constructor() {
    this.healthReport = {
      timestamp: new Date().toISOString(),
      overallHealth: 'healthy',
      score: 100,
      languages: {},
      issues: {
        critical: [],
        warning: [],
        info: []
      },
      metrics: {
        totalFiles: 0,
        healthyFiles: 0,
        missingFiles: 0,
        staleFiles: 0,
        sizesIssues: 0
      }
    };
  }

  /**
   * Main health monitoring function
   */
  async monitor() {
    console.log('🏥 Help Content Health Monitor');
    console.log('================================\n');

    // Check each language
    for (const language of SUPPORTED_LANGUAGES) {
      await this.checkLanguageHealth(language);
    }

    // Calculate overall health
    this.calculateOverallHealth();

    // Generate dashboard data
    this.generateDashboardData();

    return this.generateReport();
  }

  /**
   * Check health for a specific language
   */
  async checkLanguageHealth(language) {
    console.log(`📊 Checking ${language.toUpperCase()} content health...`);
    
    this.healthReport.languages[language] = {
      health: 'healthy',
      score: 100,
      files: {},
      issues: []
    };

    const languageDir = path.join(HELP_CONTENT_DIR, language);
    
    // Check directory existence
    if (!fs.existsSync(languageDir)) {
      this.healthReport.languages[language].health = 'critical';
      this.healthReport.languages[language].score = 0;
      this.addIssue('critical', `Language directory missing: ${language}`);
      return;
    }

    // Check each required category
    for (const category of REQUIRED_CATEGORIES) {
      await this.checkFileHealth(language, category);
    }

    // Calculate language health score
    this.calculateLanguageScore(language);
  }

  /**
   * Check health of a specific file
   */
  async checkFileHealth(language, category) {
    const filePath = path.join(HELP_CONTENT_DIR, language, `${category}.json`);
    const fileHealth = {
      exists: false,
      size: 0,
      lastModified: null,
      freshness: 'unknown',
      contentHealth: 'unknown',
      issues: []
    };

    this.healthReport.metrics.totalFiles++;

    // Check file existence
    if (!fs.existsSync(filePath)) {
      fileHealth.exists = false;
      fileHealth.contentHealth = 'missing';
      this.healthReport.metrics.missingFiles++;
      this.addIssue('critical', `Missing file: ${language}/${category}.json`);
      this.healthReport.languages[language].files[category] = fileHealth;
      return;
    }

    fileHealth.exists = true;

    // Get file stats
    const stats = fs.statSync(filePath);
    fileHealth.size = stats.size;
    fileHealth.lastModified = stats.mtime;

    // Check file size
    if (fileHealth.size < HEALTH_THRESHOLDS.MIN_FILE_SIZE) {
      fileHealth.issues.push('file_too_small');
      this.addIssue('warning', `File too small: ${language}/${category}.json (${fileHealth.size} bytes)`);
      this.healthReport.metrics.sizesIssues++;
    } else if (fileHealth.size > HEALTH_THRESHOLDS.MAX_FILE_SIZE) {
      fileHealth.issues.push('file_too_large');
      this.addIssue('warning', `File too large: ${language}/${category}.json (${fileHealth.size} bytes)`);
      this.healthReport.metrics.sizesIssues++;
    }

    // Check content freshness
    const daysSinceModified = this.getDaysSince(fileHealth.lastModified);
    if (daysSinceModified > HEALTH_THRESHOLDS.STALE_DAYS) {
      fileHealth.freshness = 'stale';
      this.healthReport.metrics.staleFiles++;
      this.addIssue('warning', `Stale content: ${language}/${category}.json (${daysSinceModified} days old)`);
    } else if (daysSinceModified > HEALTH_THRESHOLDS.WARNING_DAYS) {
      fileHealth.freshness = 'aging';
      this.addIssue('info', `Aging content: ${language}/${category}.json (${daysSinceModified} days old)`);
    } else {
      fileHealth.freshness = 'fresh';
    }

    // Check content health
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      fileHealth.contentHealth = await this.analyzeContentHealth(data, language, category);
      
      if (fileHealth.contentHealth === 'healthy') {
        this.healthReport.metrics.healthyFiles++;
      }
    } catch (error) {
      fileHealth.contentHealth = 'corrupted';
      fileHealth.issues.push('parse_error');
      this.addIssue('critical', `Cannot parse file: ${language}/${category}.json - ${error.message}`);
    }

    this.healthReport.languages[language].files[category] = fileHealth;
  }

  /**
   * Analyze content health
   */
  async analyzeContentHealth(data, language, category) {
    const issues = [];

    // Check required fields
    const requiredFields = ['category', 'title', 'description', 'language', 'version', 'lastUpdated', 'topics'];
    for (const field of requiredFields) {
      if (!(field in data)) {
        issues.push(`missing_field_${field}`);
        this.addIssue('warning', `Missing field '${field}' in ${language}/${category}.json`);
      }
    }

    // Check topics
    if (data.topics) {
      if (!Array.isArray(data.topics)) {
        issues.push('topics_not_array');
        this.addIssue('warning', `Topics is not an array in ${language}/${category}.json`);
      } else if (data.topics.length < HEALTH_THRESHOLDS.MIN_TOPICS) {
        issues.push('insufficient_topics');
        this.addIssue('warning', `Insufficient topics in ${language}/${category}.json`);
      } else {
        // Check topic content
        let emptyTopics = 0;
        data.topics.forEach((topic, index) => {
          if (!topic.content || Object.keys(topic.content).length === 0) {
            emptyTopics++;
          }
          
          // Check content length
          const contentText = JSON.stringify(topic.content || {});
          if (contentText.length < HEALTH_THRESHOLDS.MIN_CONTENT_LENGTH) {
            issues.push(`topic_${index}_insufficient_content`);
          }
        });

        if (emptyTopics > 0) {
          this.addIssue('warning', `${emptyTopics} empty topics in ${language}/${category}.json`);
        }
      }
    }

    // Check language consistency
    if (data.language && data.language !== language) {
      issues.push('language_mismatch');
      this.addIssue('warning', `Language mismatch in ${language}/${category}.json`);
    }

    // Check version format
    if (data.version && !/^\d+\.\d+\.\d+$/.test(data.version)) {
      issues.push('invalid_version_format');
      this.addIssue('info', `Invalid version format in ${language}/${category}.json`);
    }

    // Determine overall content health
    if (issues.length === 0) {
      return 'healthy';
    } else if (issues.some(issue => issue.startsWith('missing_field') || issue === 'parse_error')) {
      return 'unhealthy';
    } else {
      return 'degraded';
    }
  }

  /**
   * Calculate language health score
   */
  calculateLanguageScore(language) {
    const langData = this.healthReport.languages[language];
    let score = 100;
    let criticalIssues = 0;
    let warningIssues = 0;

    // Count issues by severity
    Object.values(langData.files).forEach(file => {
      if (!file.exists) {
        criticalIssues++;
        score -= 20;
      } else {
        if (file.contentHealth === 'corrupted') {
          criticalIssues++;
          score -= 15;
        } else if (file.contentHealth === 'unhealthy') {
          warningIssues++;
          score -= 10;
        } else if (file.contentHealth === 'degraded') {
          warningIssues++;
          score -= 5;
        }

        if (file.freshness === 'stale') {
          warningIssues++;
          score -= 5;
        } else if (file.freshness === 'aging') {
          score -= 2;
        }

        if (file.issues.length > 0) {
          score -= file.issues.length * 2;
        }
      }
    });

    // Determine health status
    langData.score = Math.max(0, score);
    if (criticalIssues > 0) {
      langData.health = 'critical';
    } else if (warningIssues > 0 || langData.score < 80) {
      langData.health = 'degraded';
    } else {
      langData.health = 'healthy';
    }
  }

  /**
   * Calculate overall health
   */
  calculateOverallHealth() {
    let totalScore = 0;
    let criticalLanguages = 0;
    let degradedLanguages = 0;

    for (const language of SUPPORTED_LANGUAGES) {
      const langHealth = this.healthReport.languages[language];
      totalScore += langHealth.score;

      if (langHealth.health === 'critical') {
        criticalLanguages++;
      } else if (langHealth.health === 'degraded') {
        degradedLanguages++;
      }
    }

    this.healthReport.score = Math.round(totalScore / SUPPORTED_LANGUAGES.length);

    if (criticalLanguages > 0) {
      this.healthReport.overallHealth = 'critical';
    } else if (degradedLanguages > 1 || this.healthReport.score < 80) {
      this.healthReport.overallHealth = 'degraded';
    } else {
      this.healthReport.overallHealth = 'healthy';
    }
  }

  /**
   * Generate dashboard data
   */
  generateDashboardData() {
    this.healthReport.dashboard = {
      summary: {
        health: this.healthReport.overallHealth,
        score: this.healthReport.score,
        lastChecked: this.healthReport.timestamp
      },
      languages: {},
      trends: {
        fileAvailability: `${((this.healthReport.metrics.totalFiles - this.healthReport.metrics.missingFiles) / this.healthReport.metrics.totalFiles * 100).toFixed(1)}%`,
        contentFreshness: `${((this.healthReport.metrics.totalFiles - this.healthReport.metrics.staleFiles) / this.healthReport.metrics.totalFiles * 100).toFixed(1)}%`,
        overallQuality: `${this.healthReport.score}%`
      },
      alerts: this.healthReport.issues.critical.length + this.healthReport.issues.warning.length
    };

    // Language-specific dashboard data
    for (const [language, data] of Object.entries(this.healthReport.languages)) {
      this.healthReport.dashboard.languages[language] = {
        health: data.health,
        score: data.score,
        files: Object.keys(data.files).length,
        issues: data.issues.length
      };
    }
  }

  /**
   * Add issue to report
   */
  addIssue(severity, message) {
    this.healthReport.issues[severity].push({
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Calculate days since date
   */
  getDaysSince(date) {
    const now = new Date();
    const diff = now - date;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Generate health report
   */
  generateReport() {
    console.log('\n📋 Health Report Summary');
    console.log('=======================');
    console.log(`Overall Health: ${this.getHealthEmoji(this.healthReport.overallHealth)} ${this.healthReport.overallHealth.toUpperCase()}`);
    console.log(`Health Score: ${this.healthReport.score}/100`);
    console.log(`\nMetrics:`);
    console.log(`  • Total Files: ${this.healthReport.metrics.totalFiles}`);
    console.log(`  • Healthy Files: ${this.healthReport.metrics.healthyFiles}`);
    console.log(`  • Missing Files: ${this.healthReport.metrics.missingFiles}`);
    console.log(`  • Stale Files: ${this.healthReport.metrics.staleFiles}`);
    console.log(`  • Size Issues: ${this.healthReport.metrics.sizesIssues}`);

    // Language summary
    console.log(`\nLanguage Health:`);
    for (const [language, data] of Object.entries(this.healthReport.languages)) {
      console.log(`  • ${language.toUpperCase()}: ${this.getHealthEmoji(data.health)} ${data.health} (${data.score}/100)`);
    }

    // Issues summary
    if (this.healthReport.issues.critical.length > 0) {
      console.log(`\n❌ Critical Issues (${this.healthReport.issues.critical.length}):`);
      this.healthReport.issues.critical.slice(0, 5).forEach(issue => {
        console.log(`  • ${issue.message}`);
      });
      if (this.healthReport.issues.critical.length > 5) {
        console.log(`  ... and ${this.healthReport.issues.critical.length - 5} more`);
      }
    }

    if (this.healthReport.issues.warning.length > 0) {
      console.log(`\n⚠️  Warnings (${this.healthReport.issues.warning.length}):`);
      this.healthReport.issues.warning.slice(0, 5).forEach(issue => {
        console.log(`  • ${issue.message}`);
      });
      if (this.healthReport.issues.warning.length > 5) {
        console.log(`  ... and ${this.healthReport.issues.warning.length - 5} more`);
      }
    }

    // Dashboard preview
    console.log(`\n📊 Dashboard Data:`);
    console.log(`  • File Availability: ${this.healthReport.dashboard.trends.fileAvailability}`);
    console.log(`  • Content Freshness: ${this.healthReport.dashboard.trends.contentFreshness}`);
    console.log(`  • Overall Quality: ${this.healthReport.dashboard.trends.overallQuality}`);
    console.log(`  • Active Alerts: ${this.healthReport.dashboard.alerts}`);

    return this.healthReport;
  }

  /**
   * Get health status emoji
   */
  getHealthEmoji(status) {
    switch (status) {
      case 'healthy': return '✅';
      case 'degraded': return '⚠️';
      case 'critical': return '❌';
      default: return '❓';
    }
  }

  /**
   * Save report to file
   */
  saveReport(outputPath) {
    fs.writeFileSync(outputPath, JSON.stringify(this.healthReport, null, 2));
    console.log(`\n📄 Full report saved to: ${outputPath}`);
  }

  /**
   * Save dashboard data
   */
  saveDashboardData(outputPath) {
    fs.writeFileSync(outputPath, JSON.stringify(this.healthReport.dashboard, null, 2));
    console.log(`📊 Dashboard data saved to: ${outputPath}`);
  }
}

// Main execution
async function main() {
  const monitor = new HelpContentHealthMonitor();
  
  try {
    const results = await monitor.monitor();
    
    // Save report if requested
    const outputArg = process.argv.find(arg => arg.startsWith('--output='));
    if (outputArg) {
      const outputPath = outputArg.split('=')[1];
      monitor.saveReport(outputPath);
    }
    
    // Save dashboard data if requested
    const dashboardArg = process.argv.find(arg => arg.startsWith('--dashboard='));
    if (dashboardArg) {
      const dashboardPath = dashboardArg.split('=')[1];
      monitor.saveDashboardData(dashboardPath);
    }
    
    // Exit with error code based on health
    const exitCode = results.overallHealth === 'critical' ? 2 : 
                    results.overallHealth === 'degraded' ? 1 : 0;
    process.exit(exitCode);
    
  } catch (error) {
    console.error('❌ Health monitoring failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default HelpContentHealthMonitor;