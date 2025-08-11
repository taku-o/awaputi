#!/usr/bin/env node

/**
 * Help Content Consistency Checker
 * 
 * Checks consistency across all language versions of help content:
 * - Compares structure between languages
 * - Identifies missing translations
 * - Validates content synchronization
 * - Reports inconsistencies
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
const REQUIRED_CATEGORIES = ['bubbles', 'controls', 'settings', 'troubleshooting', 'gameplay'];

// Reference language for structure comparison
const REFERENCE_LANGUAGE = 'en';

class HelpContentConsistencyChecker {
  constructor() {
    this.results = {
      totalChecks: 0,
      passedChecks: 0,
      inconsistencies: [],
      missingTranslations: [],
      structuralDifferences: [],
      contentSynchronization: []
    };
    this.contentCache = {};
  }

  /**
   * Main consistency check function
   */
  async check() {
    console.log('🔍 Help Content Consistency Check Started');
    console.log('=========================================\n');

    // Load all content into cache
    await this.loadAllContent();

    // Perform consistency checks
    await this.checkMissingTranslations();
    await this.checkStructuralConsistency();
    await this.checkContentSynchronization();
    await this.checkFieldConsistency();

    return this.generateReport();
  }

  /**
   * Load all content files into cache
   */
  async loadAllContent() {
    console.log('📁 Loading content files...');
    
    for (const language of SUPPORTED_LANGUAGES) {
      this.contentCache[language] = {};
      const languageDir = path.join(HELP_CONTENT_DIR, language);
      
      if (!fs.existsSync(languageDir)) {
        continue;
      }

      for (const category of REQUIRED_CATEGORIES) {
        const filePath = path.join(languageDir, `${category}.json`);
        
        if (fs.existsSync(filePath)) {
          try {
            const content = fs.readFileSync(filePath, 'utf8');
            this.contentCache[language][category] = JSON.parse(content);
          } catch (error) {
            console.error(`Failed to load ${language}/${category}.json: ${error.message}`);
          }
        }
      }
    }
    console.log('  ✅ Content loaded\n');
  }

  /**
   * Check for missing translations
   */
  async checkMissingTranslations() {
    console.log('🌐 Checking for missing translations...');
    this.results.totalChecks++;
    
    const referenceCategories = Object.keys(this.contentCache[REFERENCE_LANGUAGE] || {});
    let hasMissing = false;

    for (const language of SUPPORTED_LANGUAGES) {
      if (language === REFERENCE_LANGUAGE) continue;
      
      const missingCategories = [];
      
      for (const category of referenceCategories) {
        if (!this.contentCache[language]?.[category]) {
          missingCategories.push(category);
          hasMissing = true;
        }
      }
      
      if (missingCategories.length > 0) {
        this.results.missingTranslations.push({
          language,
          missingCategories,
          message: `Missing ${missingCategories.length} categories in ${language}`
        });
      }
    }

    if (!hasMissing) {
      this.results.passedChecks++;
      console.log('  ✅ All translations present');
    } else {
      console.log(`  ⚠️  Missing translations found`);
    }
  }

  /**
   * Check structural consistency between languages
   */
  async checkStructuralConsistency() {
    console.log('\n📐 Checking structural consistency...');
    
    for (const category of REQUIRED_CATEGORIES) {
      this.results.totalChecks++;
      const referenceContent = this.contentCache[REFERENCE_LANGUAGE]?.[category];
      
      if (!referenceContent) continue;
      
      const referenceStructure = this.extractStructure(referenceContent);
      let hasInconsistency = false;
      
      for (const language of SUPPORTED_LANGUAGES) {
        if (language === REFERENCE_LANGUAGE) continue;
        
        const content = this.contentCache[language]?.[category];
        if (!content) continue;
        
        const structure = this.extractStructure(content);
        const differences = this.compareStructures(referenceStructure, structure);
        
        if (differences.length > 0) {
          hasInconsistency = true;
          this.results.structuralDifferences.push({
            category,
            language,
            differences,
            message: `Structural differences in ${category} (${language})`
          });
        }
      }
      
      if (!hasInconsistency) {
        this.results.passedChecks++;
        console.log(`  ✅ ${category} - Consistent structure`);
      } else {
        console.log(`  ⚠️  ${category} - Structural inconsistencies found`);
      }
    }
  }

  /**
   * Extract structural information from content
   */
  extractStructure(content) {
    const structure = {
      topLevelFields: Object.keys(content).sort(),
      topics: []
    };

    if (content.topics && Array.isArray(content.topics)) {
      structure.topics = content.topics.map(topic => ({
        id: topic.id,
        fields: Object.keys(topic).sort(),
        contentFields: topic.content ? Object.keys(topic.content).sort() : []
      }));
    }

    return structure;
  }

  /**
   * Compare two structures and return differences
   */
  compareStructures(reference, target) {
    const differences = [];

    // Compare top-level fields
    const missingFields = reference.topLevelFields.filter(field => 
      !target.topLevelFields.includes(field)
    );
    const extraFields = target.topLevelFields.filter(field => 
      !reference.topLevelFields.includes(field)
    );

    if (missingFields.length > 0) {
      differences.push({
        type: 'missing_fields',
        fields: missingFields
      });
    }

    if (extraFields.length > 0) {
      differences.push({
        type: 'extra_fields',
        fields: extraFields
      });
    }

    // Compare topics
    if (reference.topics.length !== target.topics.length) {
      differences.push({
        type: 'topic_count_mismatch',
        reference: reference.topics.length,
        target: target.topics.length
      });
    }

    // Compare topic IDs
    const referenceIds = reference.topics.map(t => t.id);
    const targetIds = target.topics.map(t => t.id);
    
    const missingTopics = referenceIds.filter(id => !targetIds.includes(id));
    const extraTopics = targetIds.filter(id => !referenceIds.includes(id));

    if (missingTopics.length > 0) {
      differences.push({
        type: 'missing_topics',
        topics: missingTopics
      });
    }

    if (extraTopics.length > 0) {
      differences.push({
        type: 'extra_topics',
        topics: extraTopics
      });
    }

    return differences;
  }

  /**
   * Check content synchronization
   */
  async checkContentSynchronization() {
    console.log('\n🔄 Checking content synchronization...');
    
    for (const category of REQUIRED_CATEGORIES) {
      this.results.totalChecks++;
      let isSync = true;
      
      // Check version consistency
      const versions = [];
      const lastUpdated = [];
      
      for (const language of SUPPORTED_LANGUAGES) {
        const content = this.contentCache[language]?.[category];
        if (content) {
          versions.push({ language, version: content.version });
          lastUpdated.push({ language, date: content.lastUpdated });
        }
      }
      
      // Check if all versions match
      const uniqueVersions = [...new Set(versions.map(v => v.version))];
      if (uniqueVersions.length > 1) {
        isSync = false;
        this.results.contentSynchronization.push({
          category,
          issue: 'version_mismatch',
          versions,
          message: `Version mismatch in ${category}`
        });
      }
      
      // Check if updates are within reasonable timeframe (30 days)
      const dates = lastUpdated.map(item => new Date(item.date));
      const maxDate = new Date(Math.max(...dates));
      const minDate = new Date(Math.min(...dates));
      const daysDifference = (maxDate - minDate) / (1000 * 60 * 60 * 24);
      
      if (daysDifference > 30) {
        isSync = false;
        this.results.contentSynchronization.push({
          category,
          issue: 'update_lag',
          lastUpdated,
          daysDifference: Math.round(daysDifference),
          message: `Update lag of ${Math.round(daysDifference)} days in ${category}`
        });
      }
      
      if (isSync) {
        this.results.passedChecks++;
        console.log(`  ✅ ${category} - Properly synchronized`);
      } else {
        console.log(`  ⚠️  ${category} - Synchronization issues`);
      }
    }
  }

  /**
   * Check field consistency across languages
   */
  async checkFieldConsistency() {
    console.log('\n📋 Checking field consistency...');
    
    const fieldReports = {};
    
    for (const category of REQUIRED_CATEGORIES) {
      fieldReports[category] = {
        consistentFields: [],
        inconsistentFields: []
      };
      
      const referenceContent = this.contentCache[REFERENCE_LANGUAGE]?.[category];
      if (!referenceContent || !referenceContent.topics) continue;
      
      // Check each topic
      referenceContent.topics.forEach((refTopic, index) => {
        const topicFieldConsistency = this.checkTopicFieldConsistency(
          category, 
          refTopic, 
          index
        );
        
        if (topicFieldConsistency.isConsistent) {
          fieldReports[category].consistentFields.push(refTopic.id);
        } else {
          fieldReports[category].inconsistentFields.push({
            topicId: refTopic.id,
            issues: topicFieldConsistency.issues
          });
        }
      });
    }
    
    // Add inconsistencies to results
    for (const [category, report] of Object.entries(fieldReports)) {
      if (report.inconsistentFields.length > 0) {
        this.results.inconsistencies.push({
          category,
          inconsistentFields: report.inconsistentFields,
          message: `Field inconsistencies in ${category}`
        });
      }
    }
  }

  /**
   * Check field consistency for a specific topic
   */
  checkTopicFieldConsistency(category, referenceTopic, topicIndex) {
    const result = {
      isConsistent: true,
      issues: []
    };
    
    for (const language of SUPPORTED_LANGUAGES) {
      if (language === REFERENCE_LANGUAGE) continue;
      
      const content = this.contentCache[language]?.[category];
      if (!content || !content.topics || !content.topics[topicIndex]) continue;
      
      const targetTopic = content.topics[topicIndex];
      
      // Check if topic IDs match
      if (targetTopic.id !== referenceTopic.id) {
        result.isConsistent = false;
        result.issues.push({
          language,
          issue: 'topic_id_mismatch',
          expected: referenceTopic.id,
          found: targetTopic.id
        });
      }
      
      // Check required fields
      const requiredFields = ['id', 'title', 'description', 'content', 'difficulty', 'estimatedReadTime', 'tags'];
      for (const field of requiredFields) {
        if (!(field in targetTopic)) {
          result.isConsistent = false;
          result.issues.push({
            language,
            issue: 'missing_required_field',
            field
          });
        }
      }
    }
    
    return result;
  }

  /**
   * Generate consistency report
   */
  generateReport() {
    console.log('\n📊 Consistency Check Results');
    console.log('===========================');
    console.log(`Total checks performed: ${this.results.totalChecks}`);
    console.log(`Passed checks: ${this.results.passedChecks}`);
    console.log(`Success rate: ${(this.results.passedChecks / this.results.totalChecks * 100).toFixed(2)}%`);
    
    // Report missing translations
    if (this.results.missingTranslations.length > 0) {
      console.log('\n❌ Missing Translations:');
      this.results.missingTranslations.forEach(item => {
        console.log(`  • ${item.message}`);
        console.log(`    Missing: ${item.missingCategories.join(', ')}`);
      });
    }
    
    // Report structural differences
    if (this.results.structuralDifferences.length > 0) {
      console.log('\n⚠️  Structural Differences:');
      this.results.structuralDifferences.forEach(item => {
        console.log(`  • ${item.message}`);
        item.differences.forEach(diff => {
          console.log(`    - ${diff.type}: ${JSON.stringify(diff)}`);
        });
      });
    }
    
    // Report synchronization issues
    if (this.results.contentSynchronization.length > 0) {
      console.log('\n🔄 Synchronization Issues:');
      this.results.contentSynchronization.forEach(item => {
        console.log(`  • ${item.message}`);
        if (item.issue === 'version_mismatch') {
          item.versions.forEach(v => {
            console.log(`    - ${v.language}: ${v.version}`);
          });
        } else if (item.issue === 'update_lag') {
          console.log(`    - Gap: ${item.daysDifference} days`);
        }
      });
    }
    
    // Report field inconsistencies
    if (this.results.inconsistencies.length > 0) {
      console.log('\n📋 Field Inconsistencies:');
      this.results.inconsistencies.forEach(item => {
        console.log(`  • ${item.message}`);
        item.inconsistentFields.forEach(field => {
          console.log(`    - Topic: ${field.topicId}`);
          field.issues.forEach(issue => {
            console.log(`      ${issue.language}: ${issue.issue}`);
          });
        });
      });
    }
    
    // Summary
    const hasIssues = 
      this.results.missingTranslations.length > 0 ||
      this.results.structuralDifferences.length > 0 ||
      this.results.contentSynchronization.length > 0 ||
      this.results.inconsistencies.length > 0;
    
    if (!hasIssues) {
      console.log('\n✅ All content is consistent across languages!');
    } else {
      console.log('\n❌ Consistency issues found. Please review and fix.');
    }
    
    return this.results;
  }

  /**
   * Save report to file
   */
  saveReport(outputPath) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalChecks: this.results.totalChecks,
        passedChecks: this.results.passedChecks,
        successRate: (this.results.passedChecks / this.results.totalChecks * 100).toFixed(2) + '%'
      },
      details: this.results
    };
    
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${outputPath}`);
  }
}

// Main execution
async function main() {
  const checker = new HelpContentConsistencyChecker();
  
  try {
    const results = await checker.check();
    
    // Save report if requested
    const outputArg = process.argv.find(arg => arg.startsWith('--output='));
    if (outputArg) {
      const outputPath = outputArg.split('=')[1];
      checker.saveReport(outputPath);
    }
    
    // Exit with error code if issues found
    const hasIssues = 
      results.missingTranslations.length > 0 ||
      results.structuralDifferences.length > 0 ||
      results.contentSynchronization.length > 0 ||
      results.inconsistencies.length > 0;
    
    process.exit(hasIssues ? 1 : 0);
    
  } catch (error) {
    console.error('❌ Consistency check failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default HelpContentConsistencyChecker;