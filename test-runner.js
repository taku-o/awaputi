#!/usr/bin/env node

/**
 * Test runner script for BubblePop game
 * Runs all test suites and generates comprehensive reports
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TestRunner {
  constructor() {
    this.results = {
      unit: null,
      integration: null,
      e2e: null,
      performance: null
    };
    this.startTime = Date.now();
  }

  async runCommand(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
      console.log(`🚀 Running: ${command} ${args.join(' ')}`);
      
      const child = spawn(command, args, {
        stdio: 'inherit',
        shell: true,
        ...options
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(code);
        } else {
          reject(new Error(`Command failed with exit code ${code}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  async runUnitTests() {
    console.log('\n📋 Running Unit Tests...');
    try {
      await this.runCommand('npm', ['run', 'test']);
      this.results.unit = { status: 'passed', error: null };
      console.log('✅ Unit tests passed');
    } catch (error) {
      this.results.unit = { status: 'failed', error: error.message };
      console.log('❌ Unit tests failed');
      throw error;
    }
  }

  async runIntegrationTests() {
    console.log('\n🔗 Running Integration Tests...');
    try {
      await this.runCommand('npx', ['jest', 'tests/integration', '--run']);
      this.results.integration = { status: 'passed', error: null };
      console.log('✅ Integration tests passed');
    } catch (error) {
      this.results.integration = { status: 'failed', error: error.message };
      console.log('❌ Integration tests failed');
      throw error;
    }
  }

  async runE2ETests() {
    console.log('\n🌐 Running E2E Tests...');
    try {
      await this.runCommand('npm', ['run', 'test:e2e']);
      this.results.e2e = { status: 'passed', error: null };
      console.log('✅ E2E tests passed');
    } catch (error) {
      this.results.e2e = { status: 'failed', error: error.message };
      console.log('❌ E2E tests failed');
      throw error;
    }
  }

  async runPerformanceTests() {
    console.log('\n⚡ Running Performance Tests...');
    try {
      await this.runCommand('npm', ['run', 'test:performance']);
      this.results.performance = { status: 'passed', error: null };
      console.log('✅ Performance tests passed');
    } catch (error) {
      this.results.performance = { status: 'failed', error: error.message };
      console.log('❌ Performance tests failed');
      throw error;
    }
  }

  async generateCoverageReport() {
    console.log('\n📊 Generating Coverage Report...');
    try {
      await this.runCommand('npm', ['run', 'test:coverage']);
      console.log('✅ Coverage report generated');
    } catch (error) {
      console.log('⚠️  Coverage report generation failed:', error.message);
    }
  }

  async generateTestReport() {
    const endTime = Date.now();
    const duration = endTime - this.startTime;

    const report = {
      timestamp: new Date().toISOString(),
      duration: duration,
      results: this.results,
      summary: {
        total: Object.keys(this.results).length,
        passed: Object.values(this.results).filter(r => r?.status === 'passed').length,
        failed: Object.values(this.results).filter(r => r?.status === 'failed').length,
        skipped: Object.values(this.results).filter(r => r === null).length
      }
    };

    // Ensure test-results directory exists
    await fs.mkdir('test-results', { recursive: true });

    // Write report
    await fs.writeFile(
      'test-results/test-report.json',
      JSON.stringify(report, null, 2)
    );

    // Generate HTML report
    const htmlReport = this.generateHTMLReport(report);
    await fs.writeFile('test-results/test-report.html', htmlReport);

    console.log('\n📄 Test report generated: test-results/test-report.html');
    return report;
  }

  generateHTMLReport(report) {
    const { summary, results, duration } = report;
    const durationMinutes = Math.round(duration / 1000 / 60 * 100) / 100;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BubblePop Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .summary-card.passed { border-left: 4px solid #28a745; }
        .summary-card.failed { border-left: 4px solid #dc3545; }
        .summary-card.total { border-left: 4px solid #007bff; }
        .test-results { margin-top: 30px; }
        .test-suite { margin-bottom: 20px; padding: 15px; border-radius: 8px; }
        .test-suite.passed { background: #d4edda; border: 1px solid #c3e6cb; }
        .test-suite.failed { background: #f8d7da; border: 1px solid #f5c6cb; }
        .test-suite.skipped { background: #fff3cd; border: 1px solid #ffeaa7; }
        .status-icon { font-size: 20px; margin-right: 10px; }
        .timestamp { color: #666; font-size: 14px; }
        .duration { color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎮 BubblePop Test Report</h1>
            <div class="timestamp">Generated: ${new Date(report.timestamp).toLocaleString()}</div>
            <div class="duration">Duration: ${durationMinutes} minutes</div>
        </div>
        
        <div class="summary">
            <div class="summary-card total">
                <h3>Total Tests</h3>
                <div style="font-size: 2em; font-weight: bold;">${summary.total}</div>
            </div>
            <div class="summary-card passed">
                <h3>Passed</h3>
                <div style="font-size: 2em; font-weight: bold; color: #28a745;">${summary.passed}</div>
            </div>
            <div class="summary-card failed">
                <h3>Failed</h3>
                <div style="font-size: 2em; font-weight: bold; color: #dc3545;">${summary.failed}</div>
            </div>
            <div class="summary-card">
                <h3>Success Rate</h3>
                <div style="font-size: 2em; font-weight: bold;">${Math.round((summary.passed / summary.total) * 100)}%</div>
            </div>
        </div>
        
        <div class="test-results">
            <h2>Test Suite Results</h2>
            
            ${Object.entries(results).map(([suite, result]) => {
              if (!result) return `
                <div class="test-suite skipped">
                    <span class="status-icon">⏭️</span>
                    <strong>${suite.toUpperCase()} Tests</strong> - Skipped
                </div>
              `;
              
              return `
                <div class="test-suite ${result.status}">
                    <span class="status-icon">${result.status === 'passed' ? '✅' : '❌'}</span>
                    <strong>${suite.toUpperCase()} Tests</strong> - ${result.status.toUpperCase()}
                    ${result.error ? `<div style="margin-top: 10px; color: #dc3545; font-size: 14px;">Error: ${result.error}</div>` : ''}
                </div>
              `;
            }).join('')}
        </div>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; color: #666;">
            <p>Generated by BubblePop Test Runner</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  async run(options = {}) {
    console.log('🎮 BubblePop Test Suite Runner');
    console.log('================================');

    const {
      skipUnit = false,
      skipIntegration = false,
      skipE2E = false,
      skipPerformance = false,
      generateCoverage = true,
      continueOnFailure = false
    } = options;

    try {
      // Run unit tests
      if (!skipUnit) {
        try {
          await this.runUnitTests();
        } catch (error) {
          if (!continueOnFailure) throw error;
        }
      }

      // Run integration tests
      if (!skipIntegration) {
        try {
          await this.runIntegrationTests();
        } catch (error) {
          if (!continueOnFailure) throw error;
        }
      }

      // Run E2E tests
      if (!skipE2E) {
        try {
          await this.runE2ETests();
        } catch (error) {
          if (!continueOnFailure) throw error;
        }
      }

      // Run performance tests
      if (!skipPerformance) {
        try {
          await this.runPerformanceTests();
        } catch (error) {
          if (!continueOnFailure) throw error;
        }
      }

      // Generate coverage report
      if (generateCoverage) {
        await this.generateCoverageReport();
      }

      // Generate test report
      const report = await this.generateTestReport();

      console.log('\n🎉 Test Suite Completed!');
      console.log(`📊 Results: ${report.summary.passed}/${report.summary.total} passed`);
      console.log(`⏱️  Duration: ${Math.round(report.duration / 1000 / 60 * 100) / 100} minutes`);

      if (report.summary.failed > 0) {
        console.log('❌ Some tests failed. Check the report for details.');
        process.exit(1);
      } else {
        console.log('✅ All tests passed!');
        process.exit(0);
      }

    } catch (error) {
      console.error('\n💥 Test suite failed:', error.message);
      await this.generateTestReport();
      process.exit(1);
    }
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  args.forEach(arg => {
    switch (arg) {
      case '--skip-unit':
        options.skipUnit = true;
        break;
      case '--skip-integration':
        options.skipIntegration = true;
        break;
      case '--skip-e2e':
        options.skipE2E = true;
        break;
      case '--skip-performance':
        options.skipPerformance = true;
        break;
      case '--no-coverage':
        options.generateCoverage = false;
        break;
      case '--continue-on-failure':
        options.continueOnFailure = true;
        break;
      case '--help':
        console.log(`
BubblePop Test Runner

Usage: node test-runner.js [options]

Options:
  --skip-unit              Skip unit tests
  --skip-integration       Skip integration tests
  --skip-e2e              Skip E2E tests
  --skip-performance      Skip performance tests
  --no-coverage           Skip coverage report generation
  --continue-on-failure   Continue running tests even if some fail
  --help                  Show this help message

Examples:
  node test-runner.js                    # Run all tests
  node test-runner.js --skip-e2e         # Run all tests except E2E
  node test-runner.js --continue-on-failure  # Run all tests, don't stop on failures
        `);
        process.exit(0);
    }
  });

  const runner = new TestRunner();
  runner.run(options);
}

export { TestRunner };