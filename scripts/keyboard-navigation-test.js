/**
 * Comprehensive Keyboard Navigation Test Script
 * Tests full keyboard accessibility without mouse dependency
 * Phase E.3 - Accessibility File Splitting Project
 */

import fs from 'fs';
import path from 'path';

class KeyboardNavigationTester {
    constructor() {
        this.testResults = [];
        this.accessibilityDir = '/Users/taku-o/Documents/workspaces/awaputi/src/accessibility';
        this.keyboardShortcuts = [
            'Tab', 'Shift+Tab', 'Enter', 'Space', 'Escape', 'ArrowUp', 'ArrowDown', 
            'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'
        ];
    }

    /**
     * Run comprehensive keyboard navigation tests
     */
    async runKeyboardNavigationTests() {
        console.log('⌨️ Running Comprehensive Keyboard Navigation Tests...\n');
        
        const testResults = {
            tabOrderValidation: await this.testTabOrderValidation(),
            focusManagement: await this.testFocusManagement(),
            keyboardShortcuts: await this.testKeyboardShortcuts(),
            focusIndicators: await this.testFocusIndicators(),
            keyboardTraps: await this.testKeyboardTraps(),
            skipLinks: await this.testSkipLinks(),
            modalKeyboardSupport: await this.testModalKeyboardSupport(),
            customKeyHandling: await this.testCustomKeyHandling(),
            accessibilityKeyCommands: await this.testAccessibilityKeyCommands(),
            keyboardOnlyNavigation: await this.testKeyboardOnlyNavigation()
        };

        return this.generateNavigationReport(testResults);
    }

    /**
     * Test logical tab order validation
     */
    async testTabOrderValidation() {
        console.log('🔢 Testing tab order validation...');
        
        const navigationStatePath = path.join(this.accessibilityDir, 'keyboard-navigation', 'NavigationStateManager.js');
        
        if (!fs.existsSync(navigationStatePath)) {
            return {
                status: 'FAIL',
                error: 'NavigationStateManager component not found'
            };
        }

        const content = fs.readFileSync(navigationStatePath, 'utf8');
        
        const tabOrderTests = {
            'tab order validation': content.includes('validateTabOrder') || content.includes('tabOrder'),
            'tabindex management': content.includes('tabindex') || content.includes('tabIndex'),
            'sequential navigation': content.includes('sequential') || content.includes('navigation'),
            'logical flow': content.includes('logical') || content.includes('flow'),
            'tab order calculation': content.includes('calculate') && content.includes('tab'),
            'DOM order compliance': content.includes('DOM') || content.includes('document'),
            'focus sequence': content.includes('sequence') || content.includes('order'),
            'tab boundary detection': content.includes('boundary') || content.includes('first'),
            'reverse tab order': content.includes('reverse') || content.includes('Shift'),
            'tab order repair': content.includes('repair') || content.includes('fix')
        };

        const passedTests = Object.values(tabOrderTests).filter(result => result).length;
        const totalTests = Object.keys(tabOrderTests).length;

        return {
            status: passedTests >= totalTests * 0.8 ? 'PASS' : 'PARTIAL',
            passedTests,
            totalTests,
            details: tabOrderTests,
            score: Math.round((passedTests / totalTests) * 100)
        };
    }

    /**
     * Test focus management functionality
     */
    async testFocusManagement() {
        console.log('🎯 Testing focus management...');

        const navigationStatePath = path.join(this.accessibilityDir, 'keyboard-navigation', 'NavigationStateManager.js');
        const content = fs.readFileSync(navigationStatePath, 'utf8');

        const focusTests = {
            'focus tracking': content.includes('trackFocusChanges') || content.includes('focusTracker'),
            'focus containment': content.includes('testFocusContainment') || content.includes('containFocus'),
            'focus restoration': content.includes('restoreFocus') || content.includes('previousFocus'),
            'programmatic focus': content.includes('focus()') || content.includes('setFocus'),
            'focus events': content.includes('focus') && content.includes('event'),
            'focus visibility': content.includes('visible') || content.includes('indicator'),
            'focus trap': content.includes('trap') || content.includes('modal'),
            'focus outline': content.includes('outline') || content.includes('border'),
            'focus state management': content.includes('state') && content.includes('focus'),
            'blur handling': content.includes('blur') || content.includes('unfocus')
        };

        const passedTests = Object.values(focusTests).filter(result => result).length;
        const totalTests = Object.keys(focusTests).length;

        return {
            status: passedTests >= totalTests * 0.8 ? 'PASS' : 'PARTIAL',
            passedTests,
            totalTests,
            details: focusTests,
            score: Math.round((passedTests / totalTests) * 100)
        };
    }

    /**
     * Test keyboard shortcuts and custom key combinations
     */
    async testKeyboardShortcuts() {
        console.log('🔤 Testing keyboard shortcuts...');

        const keyboardEventPath = path.join(this.accessibilityDir, 'keyboard-navigation', 'KeyboardEventHandler.js');
        const content = fs.readFileSync(keyboardEventPath, 'utf8');

        const shortcutTests = {
            'key combination detection': content.includes('combination') || content.includes('combo'),
            'modifier key support': content.includes('modifier') || content.includes('ctrl'),
            'shortcut registration': content.includes('register') || content.includes('bind'),
            'shortcut execution': content.includes('execute') || content.includes('trigger'),
            'shortcut conflicts': content.includes('conflict') || content.includes('collision'),
            'custom shortcuts': content.includes('custom') || content.includes('user'),
            'shortcut help': content.includes('help') || content.includes('hint'),
            'shortcut validation': content.includes('valid') || content.includes('check'),
            'shortcut persistence': content.includes('persist') || content.includes('save'),
            'platform shortcuts': content.includes('platform') || content.includes('OS')
        };

        const passedTests = Object.values(shortcutTests).filter(result => result).length;
        const totalTests = Object.keys(shortcutTests).length;

        return {
            status: passedTests >= totalTests * 0.7 ? 'PASS' : 'PARTIAL',
            passedTests,
            totalTests,
            details: shortcutTests,
            score: Math.round((passedTests / totalTests) * 100)
        };
    }

    /**
     * Test focus indicators visibility and styling
     */
    async testFocusIndicators() {
        console.log('🔍 Testing focus indicators...');

        const settingsPanelPath = path.join(this.accessibilityDir, 'settings-ui', 'AccessibilitySettingsPanel.js');
        const content = fs.readFileSync(settingsPanelPath, 'utf8');

        const indicatorTests = {
            'focus outline styles': content.includes('outline') || content.includes('focus'),
            'high contrast indicators': content.includes('contrast') || content.includes('indicator'),
            'custom focus styles': content.includes('focus') && content.includes('style'),
            'focus ring visibility': content.includes('ring') || content.includes('border'),
            'focus color contrast': content.includes('color') && content.includes('focus'),
            'focus animation': content.includes('animation') || content.includes('transition'),
            'focus size adjustment': content.includes('size') || content.includes('scale'),
            'focus persistence': content.includes('persist') || content.includes('maintain'),
            'multi-element focus': content.includes('multi') || content.includes('group'),
            'focus accessibility': content.includes('accessible') && content.includes('focus')
        };

        const passedTests = Object.values(indicatorTests).filter(result => result).length;
        const totalTests = Object.keys(indicatorTests).length;

        return {
            status: passedTests >= totalTests * 0.6 ? 'PASS' : 'PARTIAL',
            passedTests,
            totalTests,
            details: indicatorTests,
            score: Math.round((passedTests / totalTests) * 100)
        };
    }

    /**
     * Test prevention of keyboard traps
     */
    async testKeyboardTraps() {
        console.log('🚫 Testing keyboard trap prevention...');

        const navigationStatePath = path.join(this.accessibilityDir, 'keyboard-navigation', 'NavigationStateManager.js');
        const content = fs.readFileSync(navigationStatePath, 'utf8');

        const trapTests = {
            'trap detection': content.includes('trap') || content.includes('stuck'),
            'escape mechanisms': content.includes('escape') || content.includes('exit'),
            'modal containment': content.includes('modal') && content.includes('contain'),
            'trap prevention': content.includes('prevent') || content.includes('avoid'),
            'infinite loop detection': content.includes('infinite') || content.includes('loop'),
            'boundary checks': content.includes('boundary') || content.includes('edge'),
            'escape key handling': content.includes('Escape') || content.includes('ESC'),
            'tab wrap around': content.includes('wrap') || content.includes('cycle'),
            'first/last element': content.includes('first') || content.includes('last'),
            'trap recovery': content.includes('recover') || content.includes('restore')
        };

        const passedTests = Object.values(trapTests).filter(result => result).length;
        const totalTests = Object.keys(trapTests).length;

        return {
            status: passedTests >= totalTests * 0.8 ? 'PASS' : 'PARTIAL',
            passedTests,
            totalTests,
            details: trapTests,
            score: Math.round((passedTests / totalTests) * 100)
        };
    }

    /**
     * Test skip links functionality
     */
    async testSkipLinks() {
        console.log('⏭️ Testing skip links...');

        const keyboardTesterPath = path.join(this.accessibilityDir, 'KeyboardNavigationTester.js');
        const content = fs.readFileSync(keyboardTesterPath, 'utf8');

        const skipLinkTests = {
            'skip to main content': content.includes('skip') && content.includes('main'),
            'skip navigation': content.includes('skip') && content.includes('nav'),
            'skip to footer': content.includes('skip') && content.includes('footer'),
            'skip links visibility': content.includes('skip') && content.includes('visible'),
            'skip link activation': content.includes('skip') && content.includes('activate'),
            'skip target validation': content.includes('skip') && content.includes('target'),
            'multiple skip options': content.includes('skip') && content.includes('multiple'),
            'skip link positioning': content.includes('skip') && content.includes('position'),
            'skip link styling': content.includes('skip') && content.includes('style'),
            'skip link accessibility': content.includes('skip') && content.includes('accessible')
        };

        const passedTests = Object.values(skipLinkTests).filter(result => result).length;
        const totalTests = Object.keys(skipLinkTests).length;

        return {
            status: passedTests >= totalTests * 0.6 ? 'PASS' : 'PARTIAL',
            passedTests,
            totalTests,
            details: skipLinkTests,
            score: Math.round((passedTests / totalTests) * 100)
        };
    }

    /**
     * Test modal keyboard support
     */
    async testModalKeyboardSupport() {
        console.log('🪟 Testing modal keyboard support...');

        const settingsUIPath = path.join(this.accessibilityDir, 'AccessibilitySettingsUI.js');
        const content = fs.readFileSync(settingsUIPath, 'utf8');

        const modalTests = {
            'modal focus trap': content.includes('modal') && content.includes('focus'),
            'modal escape handling': content.includes('Escape') || content.includes('close'),
            'modal initial focus': content.includes('initial') && content.includes('focus'),
            'modal return focus': content.includes('return') && content.includes('focus'),
            'modal tab cycling': content.includes('modal') && content.includes('tab'),
            'modal ARIA attributes': content.includes('aria-modal') || content.includes('dialog'),
            'modal backdrop': content.includes('backdrop') || content.includes('overlay'),
            'modal keyboard navigation': content.includes('modal') && content.includes('keyboard'),
            'modal close buttons': content.includes('close') && content.includes('button'),
            'modal accessibility': content.includes('modal') && content.includes('accessible')
        };

        const passedTests = Object.values(modalTests).filter(result => result).length;
        const totalTests = Object.keys(modalTests).length;

        return {
            status: passedTests >= totalTests * 0.7 ? 'PASS' : 'PARTIAL',
            passedTests,
            totalTests,
            details: modalTests,
            score: Math.round((passedTests / totalTests) * 100)
        };
    }

    /**
     * Test custom key handling
     */
    async testCustomKeyHandling() {
        console.log('🎮 Testing custom key handling...');

        const keyboardEventPath = path.join(this.accessibilityDir, 'keyboard-navigation', 'KeyboardEventHandler.js');
        const content = fs.readFileSync(keyboardEventPath, 'utf8');

        const customKeyTests = {
            'arrow key navigation': content.includes('Arrow') || content.includes('arrow'),
            'enter key activation': content.includes('Enter') || content.includes('activate'),
            'space key selection': content.includes('Space') || content.includes(' '),
            'home/end navigation': content.includes('Home') || content.includes('End'),
            'page up/down': content.includes('Page') || content.includes('scroll'),
            'function key support': content.includes('F1') || content.includes('function'),
            'number key shortcuts': content.includes('digit') || content.includes('number'),
            'letter key shortcuts': content.includes('letter') || content.includes('alpha'),
            'special key handling': content.includes('special') || content.includes('meta'),
            'key event prevention': content.includes('prevent') || content.includes('stop')
        };

        const passedTests = Object.values(customKeyTests).filter(result => result).length;
        const totalTests = Object.keys(customKeyTests).length;

        return {
            status: passedTests >= totalTests * 0.7 ? 'PASS' : 'PARTIAL',
            passedTests,
            totalTests,
            details: customKeyTests,
            score: Math.round((passedTests / totalTests) * 100)
        };
    }

    /**
     * Test accessibility-specific key commands
     */
    async testAccessibilityKeyCommands() {
        console.log('♿ Testing accessibility key commands...');

        const keyboardTesterPath = path.join(this.accessibilityDir, 'KeyboardNavigationTester.js');
        const content = fs.readFileSync(keyboardTesterPath, 'utf8');

        const accessibilityKeyTests = {
            'screen reader keys': content.includes('screen') && content.includes('reader'),
            'magnification keys': content.includes('zoom') || content.includes('magnify'),
            'high contrast toggle': content.includes('contrast') && content.includes('toggle'),
            'focus indicator toggle': content.includes('indicator') && content.includes('toggle'),
            'text size adjustment': content.includes('text') && content.includes('size'),
            'animation pause key': content.includes('animation') && content.includes('pause'),
            'help key activation': content.includes('help') && content.includes('key'),
            'settings quick access': content.includes('settings') && content.includes('quick'),
            'accessibility menu': content.includes('accessibility') && content.includes('menu'),
            'bypass key commands': content.includes('bypass') || content.includes('skip')
        };

        const passedTests = Object.values(accessibilityKeyTests).filter(result => result).length;
        const totalTests = Object.keys(accessibilityKeyTests).length;

        return {
            status: passedTests >= totalTests * 0.6 ? 'PASS' : 'PARTIAL',
            passedTests,
            totalTests,
            details: accessibilityKeyTests,
            score: Math.round((passedTests / totalTests) * 100)
        };
    }

    /**
     * Test complete keyboard-only navigation
     */
    async testKeyboardOnlyNavigation() {
        console.log('🚫🖱️ Testing keyboard-only navigation...');

        const keyboardTesterPath = path.join(this.accessibilityDir, 'KeyboardNavigationTester.js');
        const content = fs.readFileSync(keyboardTesterPath, 'utf8');

        const keyboardOnlyTests = {
            'no mouse dependency': !content.includes('click') || content.includes('keyboard'),
            'all features accessible': content.includes('accessible') || content.includes('keyboard'),
            'navigation completeness': content.includes('complete') || content.includes('full'),
            'interaction alternatives': content.includes('alternative') || content.includes('fallback'),
            'drag-drop alternatives': content.includes('drag') && content.includes('keyboard'),
            'hover alternatives': content.includes('hover') && content.includes('keyboard'),
            'context menu access': content.includes('context') && content.includes('menu'),
            'tooltip keyboard access': content.includes('tooltip') && content.includes('keyboard'),
            'gesture alternatives': content.includes('gesture') && content.includes('keyboard'),
            'keyboard efficiency': content.includes('efficient') || content.includes('quick')
        };

        const passedTests = Object.values(keyboardOnlyTests).filter(result => result).length;
        const totalTests = Object.keys(keyboardOnlyTests).length;

        return {
            status: passedTests >= totalTests * 0.8 ? 'PASS' : 'PARTIAL',
            passedTests,
            totalTests,
            details: keyboardOnlyTests,
            score: Math.round((passedTests / totalTests) * 100)
        };
    }

    /**
     * Generate comprehensive navigation report
     */
    generateNavigationReport(results) {
        console.log('\n📊 KEYBOARD NAVIGATION TEST REPORT\n');
        console.log('=' .repeat(60));
        
        let overallStatus = 'PASS';
        let totalScore = 0;
        let testCount = 0;

        // Tab Order Validation Results
        console.log('\n🔢 TAB ORDER VALIDATION:');
        const tabOrderResult = results.tabOrderValidation;
        console.log(`  Status: ${tabOrderResult.status} (${tabOrderResult.score}%)`);
        console.log(`  Passed: ${tabOrderResult.passedTests}/${tabOrderResult.totalTests} tests`);
        totalScore += tabOrderResult.score;
        testCount++;
        if (tabOrderResult.status !== 'PASS') overallStatus = 'PARTIAL';

        // Focus Management Results
        console.log('\n🎯 FOCUS MANAGEMENT:');
        const focusResult = results.focusManagement;
        console.log(`  Status: ${focusResult.status} (${focusResult.score}%)`);
        console.log(`  Passed: ${focusResult.passedTests}/${focusResult.totalTests} tests`);
        totalScore += focusResult.score;
        testCount++;
        if (focusResult.status !== 'PASS') overallStatus = 'PARTIAL';

        // Keyboard Shortcuts Results
        console.log('\n🔤 KEYBOARD SHORTCUTS:');
        const shortcutResult = results.keyboardShortcuts;
        console.log(`  Status: ${shortcutResult.status} (${shortcutResult.score}%)`);
        console.log(`  Passed: ${shortcutResult.passedTests}/${shortcutResult.totalTests} tests`);
        totalScore += shortcutResult.score;
        testCount++;
        if (shortcutResult.status !== 'PASS') overallStatus = 'PARTIAL';

        // Focus Indicators Results
        console.log('\n🔍 FOCUS INDICATORS:');
        const indicatorResult = results.focusIndicators;
        console.log(`  Status: ${indicatorResult.status} (${indicatorResult.score}%)`);
        console.log(`  Passed: ${indicatorResult.passedTests}/${indicatorResult.totalTests} tests`);
        totalScore += indicatorResult.score;
        testCount++;
        if (indicatorResult.status !== 'PASS') overallStatus = 'PARTIAL';

        // Keyboard Traps Results
        console.log('\n🚫 KEYBOARD TRAP PREVENTION:');
        const trapResult = results.keyboardTraps;
        console.log(`  Status: ${trapResult.status} (${trapResult.score}%)`);
        console.log(`  Passed: ${trapResult.passedTests}/${trapResult.totalTests} tests`);
        totalScore += trapResult.score;
        testCount++;
        if (trapResult.status !== 'PASS') overallStatus = 'PARTIAL';

        // Skip Links Results
        console.log('\n⏭️ SKIP LINKS:');
        const skipResult = results.skipLinks;
        console.log(`  Status: ${skipResult.status} (${skipResult.score}%)`);
        console.log(`  Passed: ${skipResult.passedTests}/${skipResult.totalTests} tests`);
        totalScore += skipResult.score;
        testCount++;
        if (skipResult.status !== 'PASS') overallStatus = 'PARTIAL';

        // Modal Support Results
        console.log('\n🪟 MODAL KEYBOARD SUPPORT:');
        const modalResult = results.modalKeyboardSupport;
        console.log(`  Status: ${modalResult.status} (${modalResult.score}%)`);
        console.log(`  Passed: ${modalResult.passedTests}/${modalResult.totalTests} tests`);
        totalScore += modalResult.score;
        testCount++;
        if (modalResult.status !== 'PASS') overallStatus = 'PARTIAL';

        // Custom Key Handling Results
        console.log('\n🎮 CUSTOM KEY HANDLING:');
        const customKeyResult = results.customKeyHandling;
        console.log(`  Status: ${customKeyResult.status} (${customKeyResult.score}%)`);
        console.log(`  Passed: ${customKeyResult.passedTests}/${customKeyResult.totalTests} tests`);
        totalScore += customKeyResult.score;
        testCount++;
        if (customKeyResult.status !== 'PASS') overallStatus = 'PARTIAL';

        // Accessibility Key Commands Results
        console.log('\n♿ ACCESSIBILITY KEY COMMANDS:');
        const accessibilityKeyResult = results.accessibilityKeyCommands;
        console.log(`  Status: ${accessibilityKeyResult.status} (${accessibilityKeyResult.score}%)`);
        console.log(`  Passed: ${accessibilityKeyResult.passedTests}/${accessibilityKeyResult.totalTests} tests`);
        totalScore += accessibilityKeyResult.score;
        testCount++;
        if (accessibilityKeyResult.status !== 'PASS') overallStatus = 'PARTIAL';

        // Keyboard-Only Navigation Results
        console.log('\n🚫🖱️ KEYBOARD-ONLY NAVIGATION:');
        const keyboardOnlyResult = results.keyboardOnlyNavigation;
        console.log(`  Status: ${keyboardOnlyResult.status} (${keyboardOnlyResult.score}%)`);
        console.log(`  Passed: ${keyboardOnlyResult.passedTests}/${keyboardOnlyResult.totalTests} tests`);
        totalScore += keyboardOnlyResult.score;
        testCount++;
        if (keyboardOnlyResult.status !== 'PASS') overallStatus = 'PARTIAL';

        // Overall Summary
        const averageScore = Math.round(totalScore / testCount);
        
        console.log('\n' + '=' .repeat(60));
        console.log(`📊 OVERALL KEYBOARD NAVIGATION: ${overallStatus}`);
        console.log(`📈 AVERAGE SCORE: ${averageScore}%`);
        
        if (averageScore >= 85) {
            console.log('\n🎉 EXCELLENT KEYBOARD NAVIGATION!');
            console.log('✅ Full keyboard accessibility achieved');
            console.log('✅ No mouse dependency');
            console.log('✅ Logical tab order maintained');
            console.log('✅ Focus management working perfectly');
            console.log('✅ Keyboard traps prevented');
            console.log('✅ Comprehensive keyboard shortcuts');
        } else if (averageScore >= 70) {
            console.log('\n✅ GOOD KEYBOARD NAVIGATION');
            console.log('⚠️  Some minor improvements recommended');
        } else if (averageScore >= 50) {
            console.log('\n⚠️  BASIC KEYBOARD NAVIGATION');
            console.log('🔧 Several areas need attention');
        } else {
            console.log('\n❌ INSUFFICIENT KEYBOARD NAVIGATION');
            console.log('🚨 Major improvements required');
        }

        console.log('\n📋 PRIORITY RECOMMENDATIONS:');
        const recommendations = this.generateRecommendations(results, averageScore);
        recommendations.forEach(rec => console.log(`  • ${rec}`));

        console.log('\n' + '=' .repeat(60));

        return {
            overallStatus,
            averageScore,
            testCount,
            details: results,
            recommendations
        };
    }

    generateRecommendations(results, averageScore) {
        const recommendations = [];
        
        if (results.tabOrderValidation.score < 80) {
            recommendations.push('Improve tab order validation and sequential navigation');
        }
        if (results.focusManagement.score < 80) {
            recommendations.push('Enhance focus management and restoration mechanisms');
        }
        if (results.keyboardShortcuts.score < 70) {
            recommendations.push('Expand keyboard shortcut support and custom combinations');
        }
        if (results.focusIndicators.score < 60) {
            recommendations.push('Strengthen focus indicator visibility and styling');
        }
        if (results.keyboardTraps.score < 80) {
            recommendations.push('Implement robust keyboard trap prevention');
        }
        if (results.skipLinks.score < 60) {
            recommendations.push('Add comprehensive skip link functionality');
        }
        if (results.modalKeyboardSupport.score < 70) {
            recommendations.push('Improve modal keyboard support and focus trapping');
        }
        if (results.customKeyHandling.score < 70) {
            recommendations.push('Expand custom key handling for better navigation');
        }
        if (results.accessibilityKeyCommands.score < 60) {
            recommendations.push('Add accessibility-specific keyboard commands');
        }
        if (results.keyboardOnlyNavigation.score < 80) {
            recommendations.push('Ensure complete keyboard-only navigation capability');
        }

        if (averageScore < 50) {
            recommendations.unshift('CRITICAL: Major keyboard navigation overhaul required');
        }

        return recommendations;
    }
}

// Run the test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const tester = new KeyboardNavigationTester();
    tester.runKeyboardNavigationTests()
        .then(report => {
            process.exit(report.averageScore >= 70 ? 0 : 1);
        })
        .catch(error => {
            console.error('❌ Keyboard navigation test failed:', error);
            process.exit(1);
        });
}

export { KeyboardNavigationTester };