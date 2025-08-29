/**
 * IntegrationTestOrchestrator - Integration test coordination and management component
 * Handles test orchestration, system integration validation, and comprehensive test execution
 */

import { getErrorHandler } from '../../core/ErrorHandler.js';

export class IntegrationTestOrchestrator {
    constructor(performanceIntegrationTesting) {
        this.performanceIntegrationTesting = performanceIntegrationTesting;
        this.errorHandler = getErrorHandler();
        
        // Test orchestration configuration
        this.orchestrationConfig = {
            defaultTimeout: 300000, // 5分
            maxParallelTests: 4,
            retryAttempts: 2,
            errorThreshold: 0.1, // 10%失敗率まで許容
            testPhaseOrdering: [
                'componentTests',
                'systemTests', 
                'e2eTests',
                'mobileTests',
                'targetValidation'
            ]
        };
        
        // Test orchestration state
        this.testSessions = new Map();
        this.activeTests = new Set();
        this.testQueue = [];
        this.orchestrationMetrics = {
            totalSessions: 0,
            successfulSessions: 0,
            failedSessions: 0,
            averageTestDuration: 0
        };
        
        // Test phase coordinators
        this.phaseCoordinators = new Map();
        this.initializePhaseCoordinators();
        
        console.log('[IntegrationTestOrchestrator] Integration test orchestration component initialized');
    }
    
    /**
     * Initialize test phase coordinators
     */
    initializePhaseCoordinators() {
        // Component integration test coordinator
        this.phaseCoordinators.set('componentTests', {
            name: 'Component Integration Tests',
            priority: 1,
            dependencies: [],
            execute: async (session, testSuiteManager) => {
                if (!session.options.includeComponentTests) return null;
                console.log('Phase 1: Running component integration tests...');
                return await testSuiteManager.runComponentIntegrationTests();
            },
            validate: (result) => this.validateComponentTestResults(result)
        });
        
        // System integration test coordinator
        this.phaseCoordinators.set('systemTests', {
            name: 'System Integration Tests',
            priority: 2,
            dependencies: ['componentTests'],
            execute: async (session, systemIntegrationTester) => {
                if (!session.options.includeSystemTests) return null;
                console.log('Phase 2: Running system integration tests...');
                return await systemIntegrationTester.runSystemTests();
            },
            validate: (result) => this.validateSystemTestResults(result)
        });
        
        // E2E performance test coordinator
        this.phaseCoordinators.set('e2eTests', {
            name: 'E2E Performance Tests',
            priority: 3,
            dependencies: ['systemTests'],
            execute: async (session, e2eValidator) => {
                if (!session.options.includeE2ETests) return null;
                console.log('Phase 3: Running E2E performance tests...');
                return await e2eValidator.runE2EValidation();
            },
            validate: (result) => this.validateE2ETestResults(result)
        });
        
        // Mobile compatibility test coordinator
        this.phaseCoordinators.set('mobileTests', {
            name: 'Mobile Compatibility Tests',
            priority: 4,
            dependencies: [],
            execute: async (session, mobileCompatibilityTester) => {
                if (!session.options.includeMobileTests) return null;
                console.log('Phase 4: Running mobile compatibility tests...');
                return await mobileCompatibilityTester.runCompatibilityTests();
            },
            validate: (result) => this.validateMobileTestResults(result)
        });
        
        // Performance target validation coordinator
        this.phaseCoordinators.set('targetValidation', {
            name: 'Performance Target Validation',
            priority: 5,
            dependencies: ['e2eTests'],
            execute: async (session, targetValidation) => {
                if (!session.options.includePerformanceTargetValidation) return null;
                console.log('Phase 5: Running performance target validation...');
                return await targetValidation.validateTargets();
            },
            validate: (result) => this.validateTargetValidationResults(result)
        });
    }
    
    /**
     * Execute comprehensive integration test phases
     * @param {object} testSession - Test session configuration
     * @param {object} testComponents - Test component instances
     * @returns {object} Test execution results
     */
    async executeTestPhases(testSession, testComponents) {
        const {
            testSuiteManager,
            systemIntegrationTester,
            e2eValidator,
            mobileCompatibilityTester,
            targetValidation
        } = testComponents;
        
        const results = {};
        const executionPlan = this.createExecutionPlan(testSession.options);
        
        try {
            // Store session
            this.testSessions.set(testSession.id, testSession);
            this.orchestrationMetrics.totalSessions++;
            
            console.log('[IntegrationTestOrchestrator] Executing test phases...');
            console.log(`Execution plan: ${executionPlan.map(p => p.name).join(' → ')}`);
            
            // Execute phases according to plan
            for (const phase of executionPlan) {
                const phaseStart = performance.now();
                
                try {
                    console.log(`[IntegrationTestOrchestrator] Starting phase: ${phase.name}`);
                    
                    // Check dependencies
                    if (!this.checkPhaseDependencies(phase, results)) {
                        console.warn(`[IntegrationTestOrchestrator] Skipping ${phase.name} due to failed dependencies`);
                        continue;
                    }
                    
                    // Execute phase
                    let phaseResult = null;
                    switch (phase.id) {
                        case 'componentTests':
                            phaseResult = await phase.execute(testSession, testSuiteManager);
                            break;
                        case 'systemTests':
                            phaseResult = await phase.execute(testSession, systemIntegrationTester);
                            break;
                        case 'e2eTests':
                            phaseResult = await phase.execute(testSession, e2eValidator);
                            break;
                        case 'mobileTests':
                            phaseResult = await phase.execute(testSession, mobileCompatibilityTester);
                            break;
                        case 'targetValidation':
                            phaseResult = await phase.execute(testSession, targetValidation);
                            break;
                    }
                    
                    const phaseDuration = performance.now() - phaseStart;
                    
                    if (phaseResult) {
                        // Validate phase results
                        const validationResult = phase.validate(phaseResult);
                        
                        results[phase.id] = {
                            ...phaseResult,
                            phaseDuration,
                            validation: validationResult
                        };
                        
                        console.log(`[IntegrationTestOrchestrator] Phase ${phase.name} completed in ${phaseDuration.toFixed(0)}ms`);
                        
                        // Check for critical failures
                        if (!phaseResult.passed && this.isCriticalPhase(phase.id)) {
                            console.warn(`[IntegrationTestOrchestrator] Critical phase ${phase.name} failed, aborting remaining phases`);
                            break;
                        }
                    } else {
                        console.log(`[IntegrationTestOrchestrator] Phase ${phase.name} skipped (disabled in options)`);
                    }
                    
                } catch (error) {
                    console.error(`[IntegrationTestOrchestrator] Phase ${phase.name} failed:`, error);
                    
                    results[phase.id] = {
                        passed: false,
                        error: error.message,
                        phaseDuration: performance.now() - phaseStart,
                        issues: [{
                            severity: 'critical',
                            message: `Phase execution failed: ${error.message}`
                        }]
                    };
                    
                    // Check if we should continue after this failure
                    if (this.isCriticalPhase(phase.id)) {
                        console.error(`[IntegrationTestOrchestrator] Critical phase failed, aborting test execution`);
                        break;
                    }
                }
            }
            
            // Update orchestration metrics
            this.updateOrchestrationMetrics(testSession, results);
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'IntegrationTestOrchestrator.executeTestPhases',
                sessionId: testSession.id
            });
            throw error;
        } finally {
            // Clean up session from active tracking
            this.testSessions.delete(testSession.id);
        }
        
        return results;
    }
    
    /**
     * Create execution plan based on options
     * @param {object} options - Test execution options
     * @returns {Array} Ordered execution plan
     */
    createExecutionPlan(options) {
        const enabledPhases = [];
        
        for (const [phaseId, coordinator] of this.phaseCoordinators) {
            // Check if phase is enabled in options
            const phaseEnabled = this.isPhaseEnabled(phaseId, options);
            
            if (phaseEnabled) {
                enabledPhases.push({
                    id: phaseId,
                    ...coordinator
                });
            }
        }
        
        // Sort by priority
        enabledPhases.sort((a, b) => a.priority - b.priority);
        
        return enabledPhases;
    }
    
    /**
     * Check if a phase is enabled in options
     * @param {string} phaseId - Phase identifier
     * @param {object} options - Test options
     * @returns {boolean} True if phase is enabled
     */
    isPhaseEnabled(phaseId, options) {
        const phaseOptionMap = {
            'componentTests': 'includeComponentTests',
            'systemTests': 'includeSystemTests',
            'e2eTests': 'includeE2ETests',
            'mobileTests': 'includeMobileTests',
            'targetValidation': 'includePerformanceTargetValidation'
        };
        
        const optionKey = phaseOptionMap[phaseId];
        return optionKey ? options[optionKey] !== false : true;
    }
    
    /**
     * Check if phase dependencies are satisfied
     * @param {object} phase - Phase configuration
     * @param {object} results - Current test results
     * @returns {boolean} True if dependencies are satisfied
     */
    checkPhaseDependencies(phase, results) {
        if (!phase.dependencies || phase.dependencies.length === 0) {
            return true;
        }
        
        for (const dependency of phase.dependencies) {
            const dependencyResult = results[dependency];
            
            // If dependency was executed and failed, check if it's critical
            if (dependencyResult && !dependencyResult.passed && this.isCriticalPhase(dependency)) {
                console.warn(`[IntegrationTestOrchestrator] Critical dependency ${dependency} failed`);
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Check if a phase is critical for overall test success
     * @param {string} phaseId - Phase identifier
     * @returns {boolean} True if phase is critical
     */
    isCriticalPhase(phaseId) {
        const criticalPhases = ['componentTests', 'systemTests'];
        return criticalPhases.includes(phaseId);
    }
    
    /**
     * Validate component test results
     * @param {object} result - Test results
     * @returns {object} Validation result
     */
    validateComponentTestResults(result) {
        const validation = {
            isValid: true,
            issues: [],
            recommendations: []
        };
        
        if (!result || typeof result.passed !== 'boolean') {
            validation.isValid = false;
            validation.issues.push({
                severity: 'critical',
                message: 'Invalid component test result format'
            });
        }
        
        if (result && result.tests && Array.isArray(result.tests)) {
            const failedTests = result.tests.filter(t => !t.passed);
            const failureRate = failedTests.length / result.tests.length;
            
            if (failureRate > this.orchestrationConfig.errorThreshold) {
                validation.recommendations.push({
                    type: 'high_component_failure_rate',
                    message: `High component test failure rate: ${(failureRate * 100).toFixed(1)}%`,
                    suggestion: 'Review component integration points and dependencies'
                });
            }
        }
        
        return validation;
    }
    
    /**
     * Validate system test results
     * @param {object} result - Test results
     * @returns {object} Validation result
     */
    validateSystemTestResults(result) {
        const validation = {
            isValid: true,
            issues: [],
            recommendations: []
        };
        
        if (!result || typeof result.passed !== 'boolean') {
            validation.isValid = false;
            validation.issues.push({
                severity: 'critical',
                message: 'Invalid system test result format'
            });
        }
        
        if (result && !result.passed) {
            validation.recommendations.push({
                type: 'system_integration_failure',
                message: 'System integration tests failed',
                suggestion: 'Check system-level configuration and component interactions'
            });
        }
        
        return validation;
    }
    
    /**
     * Validate E2E test results
     * @param {object} result - Test results
     * @returns {object} Validation result
     */
    validateE2ETestResults(result) {
        const validation = {
            isValid: true,
            issues: [],
            recommendations: []
        };
        
        if (!result || typeof result.passed !== 'boolean') {
            validation.isValid = false;
            validation.issues.push({
                severity: 'critical',
                message: 'Invalid E2E test result format'
            });
        }
        
        if (result && result.performanceMetrics) {
            // Check for performance regression indicators
            if (result.performanceMetrics.startup_time > 5000) {
                validation.recommendations.push({
                    type: 'startup_performance',
                    message: 'Startup time exceeds recommended threshold',
                    suggestion: 'Optimize initialization sequence and resource loading'
                });
            }
            
            if (result.performanceMetrics.average_frame_rate < 45) {
                validation.recommendations.push({
                    type: 'runtime_performance',
                    message: 'Average frame rate below optimal threshold',
                    suggestion: 'Review rendering optimization and performance bottlenecks'
                });
            }
        }
        
        return validation;
    }
    
    /**
     * Validate mobile test results
     * @param {object} result - Test results
     * @returns {object} Validation result
     */
    validateMobileTestResults(result) {
        const validation = {
            isValid: true,
            issues: [],
            recommendations: []
        };
        
        if (!result || typeof result.passed !== 'boolean') {
            validation.isValid = false;
            validation.issues.push({
                severity: 'critical',
                message: 'Invalid mobile test result format'
            });
        }
        
        if (result && !result.passed) {
            validation.recommendations.push({
                type: 'mobile_compatibility',
                message: 'Mobile compatibility issues detected',
                suggestion: 'Review mobile-specific optimizations and responsive design'
            });
        }
        
        return validation;
    }
    
    /**
     * Validate target validation results
     * @param {object} result - Test results
     * @returns {object} Validation result
     */
    validateTargetValidationResults(result) {
        const validation = {
            isValid: true,
            issues: [],
            recommendations: []
        };
        
        if (!result || typeof result.passed !== 'boolean') {
            validation.isValid = false;
            validation.issues.push({
                severity: 'critical',
                message: 'Invalid target validation result format'
            });
        }
        
        if (result && !result.passed) {
            validation.recommendations.push({
                type: 'performance_targets',
                message: 'Performance targets not met',
                suggestion: 'Review performance optimization strategies and target thresholds'
            });
        }
        
        return validation;
    }
    
    /**
     * Update orchestration metrics
     * @param {object} testSession - Test session
     * @param {object} results - Test results
     */
    updateOrchestrationMetrics(testSession, results) {
        const sessionSuccess = Object.values(results).every(result => 
            result && (result.passed !== false)
        );
        
        if (sessionSuccess) {
            this.orchestrationMetrics.successfulSessions++;
        } else {
            this.orchestrationMetrics.failedSessions++;
        }
        
        // Update average test duration
        if (testSession.duration) {
            const totalSessions = this.orchestrationMetrics.totalSessions;
            const currentAverage = this.orchestrationMetrics.averageTestDuration;
            this.orchestrationMetrics.averageTestDuration = 
                (currentAverage * (totalSessions - 1) + testSession.duration) / totalSessions;
        }
    }
    
    /**
     * Get orchestration statistics
     * @returns {object} Orchestration statistics
     */
    getOrchestrationStats() {
        const totalSessions = this.orchestrationMetrics.totalSessions;
        const successRate = totalSessions > 0 ? 
            (this.orchestrationMetrics.successfulSessions / totalSessions * 100).toFixed(1) : 0;
        
        return {
            ...this.orchestrationMetrics,
            successRate: `${successRate}%`,
            activeSessions: this.testSessions.size,
            availablePhases: Array.from(this.phaseCoordinators.keys()),
            orchestrationConfig: this.orchestrationConfig
        };
    }
    
    /**
     * Get test execution recommendations
     * @param {object} testResults - Test results to analyze
     * @returns {Array} Execution recommendations
     */
    generateExecutionRecommendations(testResults) {
        const recommendations = [];
        
        // Analyze overall test patterns
        const phases = Object.keys(testResults);
        const failedPhases = phases.filter(phase => 
            testResults[phase] && !testResults[phase].passed
        );
        
        if (failedPhases.length > phases.length * 0.5) {
            recommendations.push({
                type: 'systematic_failure',
                priority: 'critical',
                message: 'Multiple test phases failing indicates systematic issues',
                actions: [
                    'Check test environment configuration',
                    'Verify system dependencies and setup',
                    'Review recent changes that might affect integration'
                ]
            });
        }
        
        // Phase-specific recommendations
        for (const [phaseId, result] of Object.entries(testResults)) {
            if (result && result.validation && result.validation.recommendations) {
                recommendations.push(...result.validation.recommendations.map(rec => ({
                    ...rec,
                    phase: phaseId
                })));
            }
        }
        
        return recommendations;
    }
    
    /**
     * Configure orchestration settings
     * @param {object} config - Configuration options
     */
    configure(config) {
        Object.assign(this.orchestrationConfig, config);
        console.log('[IntegrationTestOrchestrator] Configuration updated');
    }
    
    /**
     * Cleanup orchestrator resources
     */
    destroy() {
        this.testSessions.clear();
        this.activeTests.clear();
        this.testQueue = [];
        this.phaseCoordinators.clear();
        
        console.log('[IntegrationTestOrchestrator] Orchestrator destroyed');
    }
}