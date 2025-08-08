#!/usr/bin/env python3

import re

def fix_performance_config():
    # Read the file
    with open('src/config/PerformanceConfig.js', 'r') as f:
        content = f.read()
    
    # Original method pattern
    pattern = r'(\s+getOptimizationConfig\(\) \{\s*return \{[^}]+targetFPS:[^}]+maxTimePerFrame:[^}]+\};\s*\})'
    
    # New method content
    replacement = '''    getOptimizationConfig() {
        // Emergency null safety check
        if (!this.configManager) {
            console.warn("[PerformanceConfig] ConfigurationManager not initialized, using fallback");
            return {
                targetFPS: 60,
                adaptiveMode: true,
                optimizationInterval: 1000,
                maxHistorySize: 30,
                performanceLevel: "high",
                maxBubbles: 20,
                maxParticles: 500,
                workloadDistribution: true,
                maxTimePerFrame: 8
            };
        }
        
        try {
            return {
                targetFPS: this.configManager.get('performance', 'optimization.targetFPS', 60),
                adaptiveMode: this.configManager.get('performance', 'optimization.adaptiveMode', true),
                optimizationInterval: this.configManager.get('performance', 'optimization.optimizationInterval', 1000),
                maxHistorySize: this.configManager.get('performance', 'optimization.maxHistorySize', 30),
                performanceLevel: this.configManager.get('performance', 'optimization.performanceLevel', 'high'),
                maxBubbles: this.configManager.get('performance', 'optimization.maxBubbles', 20),
                maxParticles: this.configManager.get('performance', 'optimization.maxParticles', 500),
                workloadDistribution: this.configManager.get('performance', 'optimization.workloadDistribution', true),
                maxTimePerFrame: this.configManager.get('performance', 'optimization.maxTimePerFrame', 8)
            };
        } catch (error) {
            console.error("[PerformanceConfig] Error getting optimization config:", error);
            return {
                targetFPS: 60,
                adaptiveMode: true,
                optimizationInterval: 1000,
                maxHistorySize: 30,
                performanceLevel: "high",
                maxBubbles: 20,
                maxParticles: 500,
                workloadDistribution: true,
                maxTimePerFrame: 8
            };
        }
    }'''
    
    # Find and replace the method
    lines = content.split('\n')
    start_line = -1
    end_line = -1
    
    for i, line in enumerate(lines):
        if 'getOptimizationConfig() {' in line:
            start_line = i
        if start_line != -1 and line.strip() == '}' and 'targetFPS:' in '\n'.join(lines[start_line:i+5]):
            end_line = i
            break
    
    if start_line != -1 and end_line != -1:
        new_lines = lines[:start_line] + replacement.split('\n') + lines[end_line+1:]
        new_content = '\n'.join(new_lines)
        
        # Write back
        with open('src/config/PerformanceConfig.js', 'w') as f:
            f.write(new_content)
        
        print(f"Method replaced successfully (lines {start_line}-{end_line})")
        return True
    else:
        print("Could not find the method to replace")
        return False

if __name__ == '__main__':
    fix_performance_config()