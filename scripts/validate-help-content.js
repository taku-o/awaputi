#!/usr/bin/env node

/**
 * Help Content Validation Script
 * 
 * Validates all multilingual help content files for:
 * - JSON schema validation
 * - Required field verification
 * - Content structure consistency
 * - Language-specific formatting
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

// JSON Schema for help content files
const HELP_CONTENT_SCHEMA = {
  required: ['category', 'title', 'description', 'language', 'version', 'lastUpdated', 'topics'],
  properties: {
    category: { type: 'string' },
    title: { type: 'string' },
    description: { type: 'string' },
    language: { type: 'string' },
    version: { type: 'string' },
    lastUpdated: { type: 'string' },
    topics: { 
      type: 'array',
      minItems: 1,
      items: {
        required: ['id', 'title', 'description', 'content', 'difficulty', 'estimatedReadTime', 'tags'],
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          content: { type: 'object' },
          difficulty: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
          estimatedReadTime: { type: 'number' },
          tags: { type: 'array', items: { type: 'string' } }
        }
      }
    }
  }
};

class HelpContentValidator {
  constructor() {
    this.results = {
      totalFiles: 0,
      validFiles: 0,
      errors: [],
      warnings: [],
      summary: {}
    };
  }

  /**
   * Main validation function
   */
  async validate() {
    console.log('🔍 Help Content Validation Started');
    console.log('=====================================\n');

    // Check if help content directory exists
    if (!fs.existsSync(HELP_CONTENT_DIR)) {
      this.addError('CRITICAL', 'Help content directory not found', HELP_CONTENT_DIR);
      return this.generateReport();
    }

    // Validate each language directory
    for (const language of SUPPORTED_LANGUAGES) {
      await this.validateLanguage(language);
    }

    // Cross-language consistency check
    this.validateCrossLanguageConsistency();

    return this.generateReport();
  }

  /**
   * Validate files for a specific language
   */
  async validateLanguage(language) {
    const languageDir = path.join(HELP_CONTENT_DIR, language);
    
    if (!fs.existsSync(languageDir)) {
      this.addError('MISSING_LANGUAGE', `Language directory missing: ${language}`, languageDir);
      return;
    }

    console.log(`📁 Validating ${language.toUpperCase()} content...`);

    // Check for required categories
    for (const category of REQUIRED_CATEGORIES) {
      const filePath = path.join(languageDir, `${category}.json`);
      await this.validateHelpFile(filePath, language, category);
    }
  }

  /**
   * Validate individual help file
   */
  async validateHelpFile(filePath, language, category) {
    this.results.totalFiles++;

    if (!fs.existsSync(filePath)) {
      this.addError('MISSING_FILE', `Missing help file: ${category}`, filePath);
      return;
    }

    try {
      // Read and parse JSON
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);

      // Validate JSON schema
      const schemaErrors = this.validateSchema(data, HELP_CONTENT_SCHEMA);
      if (schemaErrors.length > 0) {
        schemaErrors.forEach(error => {
          this.addError('SCHEMA_VALIDATION', `${category} (${language}): ${error}`, filePath);
        });
        return;
      }

      // Language-specific validation
      this.validateLanguageSpecific(data, language, category, filePath);

      // Content quality checks
      this.validateContentQuality(data, language, category, filePath);

      this.results.validFiles++;
      console.log(`  ✅ ${category}.json - Valid`);

    } catch (error) {
      this.addError('PARSE_ERROR', `Failed to parse ${category}.json (${language}): ${error.message}`, filePath);
    }
  }

  /**
   * Validate JSON schema
   */
  validateSchema(data, schema) {
    const errors = [];

    // Check required fields
    if (schema.required) {
      for (const field of schema.required) {
        if (!(field in data)) {
          errors.push(`Missing required field: ${field}`);
        }
      }
    }

    // Check field types and values
    if (schema.properties) {
      for (const [field, fieldSchema] of Object.entries(schema.properties)) {
        if (field in data) {
          const value = data[field];
          
          // Special handling for arrays
          if (fieldSchema.type === 'array') {
            if (!Array.isArray(value)) {
              errors.push(`Invalid type for ${field}: expected array, got ${typeof value}`);
              continue;
            }

            if (fieldSchema.minItems && value.length < fieldSchema.minItems) {
              errors.push(`${field} must have at least ${fieldSchema.minItems} items`);
            }

            if (fieldSchema.items) {
              value.forEach((item, index) => {
                const itemErrors = this.validateSchema(item, fieldSchema.items);
                itemErrors.forEach(error => {
                  errors.push(`${field}[${index}]: ${error}`);
                });
              });
            }
          } else if (fieldSchema.type && typeof value !== fieldSchema.type) {
            errors.push(`Invalid type for ${field}: expected ${fieldSchema.type}, got ${typeof value}`);
          }

          if (fieldSchema.enum && !fieldSchema.enum.includes(value)) {
            errors.push(`Invalid value for ${field}: must be one of [${fieldSchema.enum.join(', ')}]`);
          }
        }
      }
    }

    return errors;
  }

  /**
   * Language-specific validation
   */
  validateLanguageSpecific(data, language, category, filePath) {
    // Verify language field matches directory
    if (data.language !== language) {
      this.addError('LANGUAGE_MISMATCH', 
        `Language field mismatch: expected ${language}, got ${data.language}`, filePath);
    }

    // Verify category field matches filename
    if (data.category !== category) {
      this.addError('CATEGORY_MISMATCH', 
        `Category field mismatch: expected ${category}, got ${data.category}`, filePath);
    }

    // Check for appropriate character encoding
    const hasProperEncoding = this.validateCharacterEncoding(data, language);
    if (!hasProperEncoding) {
      this.addWarning('ENCODING_WARNING', 
        `Potential character encoding issues in ${category} (${language})`, filePath);
    }
  }

  /**
   * Validate character encoding for specific languages
   */
  validateCharacterEncoding(data, language) {
    const content = JSON.stringify(data);

    switch (language) {
      case 'ja':
        // Check for Japanese characters (Hiragana, Katakana, Kanji)
        return /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(content);
      
      case 'ko':
        // Check for Korean characters (Hangul)
        return /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/.test(content);
      
      case 'zh-CN':
      case 'zh-TW':
        // Check for Chinese characters
        return /[\u4E00-\u9FFF]/.test(content);
      
      case 'en':
        // English should primarily use ASCII characters
        return true; // Basic validation for English
      
      default:
        return true;
    }
  }

  /**
   * Content quality validation
   */
  validateContentQuality(data, language, category, filePath) {
    // Check for empty content
    if (data.topics.length === 0) {
      this.addWarning('EMPTY_CONTENT', `No topics found in ${category} (${language})`, filePath);
    }

    // Check for reasonable content length
    data.topics.forEach((topic, index) => {
      if (!topic.content || Object.keys(topic.content).length === 0) {
        this.addWarning('EMPTY_TOPIC', 
          `Empty content in topic ${index}: ${topic.id} (${category}, ${language})`, filePath);
      }

      // Check estimated reading time is reasonable
      if (topic.estimatedReadTime && (topic.estimatedReadTime < 30 || topic.estimatedReadTime > 1800)) {
        this.addWarning('UNREALISTIC_READ_TIME', 
          `Unusual reading time ${topic.estimatedReadTime}s for topic ${topic.id} (${category}, ${language})`, filePath);
      }
    });

    // Check version format
    if (!/^\d+\.\d+\.\d+$/.test(data.version)) {
      this.addWarning('VERSION_FORMAT', 
        `Version should follow semver format: ${data.version} (${category}, ${language})`, filePath);
    }

    // Check lastUpdated format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.lastUpdated)) {
      this.addWarning('DATE_FORMAT', 
        `lastUpdated should be in YYYY-MM-DD format: ${data.lastUpdated} (${category}, ${language})`, filePath);
    }
  }

  /**
   * Cross-language consistency validation
   */
  validateCrossLanguageConsistency() {
    console.log('\n🔄 Cross-language consistency check...');

    // Check that all languages have the same categories
    const languageCategories = {};
    
    for (const language of SUPPORTED_LANGUAGES) {
      const languageDir = path.join(HELP_CONTENT_DIR, language);
      if (fs.existsSync(languageDir)) {
        languageCategories[language] = fs.readdirSync(languageDir)
          .filter(file => file.endsWith('.json'))
          .map(file => file.replace('.json', ''));
      }
    }

    // Find missing categories across languages
    for (const language of SUPPORTED_LANGUAGES) {
      if (languageCategories[language]) {
        const missingCategories = REQUIRED_CATEGORIES.filter(
          category => !languageCategories[language].includes(category)
        );
        
        if (missingCategories.length > 0) {
          this.addError('MISSING_CATEGORIES', 
            `Missing categories in ${language}: ${missingCategories.join(', ')}`);
        }
      }
    }

    console.log('  ✅ Consistency check completed');
  }

  /**
   * Add error to results
   */
  addError(type, message, path = null) {
    this.results.errors.push({
      type,
      message,
      path,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Add warning to results
   */
  addWarning(type, message, path = null) {
    this.results.warnings.push({
      type,
      message,
      path,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Generate validation report
   */
  generateReport() {
    console.log('\n📊 Validation Results');
    console.log('=====================');
    console.log(`Total files checked: ${this.results.totalFiles}`);
    console.log(`Valid files: ${this.results.validFiles}`);
    console.log(`Errors: ${this.results.errors.length}`);
    console.log(`Warnings: ${this.results.warnings.length}`);

    if (this.results.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.results.errors.forEach(error => {
        console.log(`  • [${error.type}] ${error.message}`);
        if (error.path) console.log(`    Path: ${error.path}`);
      });
    }

    if (this.results.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.results.warnings.forEach(warning => {
        console.log(`  • [${warning.type}] ${warning.message}`);
        if (warning.path) console.log(`    Path: ${warning.path}`);
      });
    }

    // Summary
    this.results.summary = {
      isValid: this.results.errors.length === 0,
      successRate: this.results.totalFiles > 0 ? 
        (this.results.validFiles / this.results.totalFiles * 100).toFixed(2) : 0,
      completedAt: new Date().toISOString()
    };

    if (this.results.summary.isValid) {
      console.log('\n✅ All help content files are valid!');
    } else {
      console.log(`\n❌ Validation failed with ${this.results.errors.length} error(s)`);
    }

    return this.results;
  }

  /**
   * Save report to file
   */
  saveReport(outputPath) {
    fs.writeFileSync(outputPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Report saved to: ${outputPath}`);
  }
}

// Main execution
async function main() {
  const validator = new HelpContentValidator();
  
  try {
    const results = await validator.validate();
    
    // Save report if requested
    const outputArg = process.argv.find(arg => arg.startsWith('--output='));
    if (outputArg) {
      const outputPath = outputArg.split('=')[1];
      validator.saveReport(outputPath);
    }

    // Exit with error code if validation failed
    process.exit(results.summary.isValid ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Validation script failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default HelpContentValidator;