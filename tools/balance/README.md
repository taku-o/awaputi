# Balance Adjuster Tool

**Interactive balance adjustment tool with Main Controller Pattern architecture**

## Overview

The Balance Adjuster Tool provides an interactive command-line interface for modifying game balance settings, analyzing impacts, running validation tests, and exporting changes. It follows the Main Controller Pattern, with specialized sub-components handling different aspects of balance management.

## Architecture

### Main Controller Pattern
```
balance-adjuster.js (Main Controller - 990 words)
├── BalanceDataLoader.js     - Configuration loading and parsing  
├── BalanceCalculator.js     - Impact analysis and calculations
├── BalanceValidator.js      - Testing and validation rules
└── BalanceExporter.js       - Data export and file operations
```

### Component Responsibilities

#### BalanceDataLoader
- Load current configuration files
- Parse configuration categories (scoring, bubbles, stages, performance)
- Create configuration backups  
- Configuration discovery and file management

#### BalanceCalculator
- Preview balance impact analysis
- Perform detailed mathematical impact analysis  
- Risk assessment calculations
- Statistical analysis of balance changes

#### BalanceValidator
- Execute quick validation tests
- Run comprehensive balance tests
- Perform performance impact tests
- Validation rule management and enforcement

#### BalanceExporter
- Save changes to configuration files
- Export batch changes
- Apply changes to configuration files
- Batch processing and file operations

## Usage

### Interactive Mode (Default)
```bash
node tools/balance/balance-adjuster.js
```

Launches interactive menu with options:
- 📊 View current settings
- ⚙️ Modify settings  
- 🔍 Run impact analysis
- 🧪 Execute tests
- 💾 Save changes
- ↩️ Revert changes
- 📋 Show balance guidelines
- 📊 Compare configurations

### Batch Mode
```bash
node tools/balance/balance-adjuster.js --batch changes.json
```

Apply predefined changes from JSON file:
```json
{
  "changes": {
    "scoring.bubble.normal": 15,
    "scoring.bubble.special": 25,
    "performance.targetFPS": 60
  },
  "options": {
    "createBackup": true,
    "runTests": true
  }
}
```

### Analysis Mode
```bash
node tools/balance/balance-adjuster.js --analyze-current
```

Perform detailed analysis of current configuration without making changes.

### Command Line Options
```bash
node balance-adjuster.js [options]

Options:
  -b, --batch <file>     Apply changes from batch file
  -a, --analyze-current  Analyze current configuration  
  -v, --verbose         Show detailed logging
  -h, --help           Display help information
```

## Configuration Categories

### Scoring Settings
- **bubble.normal**: Points for normal bubbles (default: 15)
- **bubble.special**: Points for special bubbles (default: 25)  
- **bubble.boss**: Points for boss bubbles (default: 50)
- **combo.multiplier**: Combo score multiplier (default: 1.5)

### Bubble Settings  
- **normal.health**: Normal bubble health (default: 1)
- **special.health**: Special bubble health (default: 2)
- **boss.health**: Boss bubble health (default: 8)
- **boss.size**: Boss bubble size (default: 90)

### Stage Settings
- **difficulty.easy**: Easy mode difficulty (default: 0.8)
- **difficulty.normal**: Normal mode difficulty (default: 1.0)
- **difficulty.hard**: Hard mode difficulty (default: 1.3)

### Performance Settings
- **targetFPS**: Target frame rate (default: 60)
- **qualityLevel**: Graphics quality level (default: "high")

## Impact Analysis

### Quick Analysis
Fast preview of immediate effects:
- Score balance impact
- Difficulty curve changes  
- Performance implications
- User experience effects

### Detailed Analysis
Comprehensive mathematical analysis:
- Statistical distribution analysis
- Difficulty progression modeling
- Performance impact simulation
- Risk assessment matrix

### Analysis Reports
Generated reports include:
- **Balance Impact Summary**: Overall effect assessment
- **Risk Analysis**: Potential negative impacts
- **Recommendations**: Suggested adjustments
- **Test Results**: Validation outcomes

## Testing Framework

### Quick Tests (~30 seconds)
- Configuration file integrity
- Basic value range validation
- Critical setting verification
- Dependency consistency checks

### Balance Tests (~2 minutes)
- Score progression analysis
- Difficulty curve validation  
- Bubble type balance verification
- Combo system testing

### Performance Tests (~5 minutes)
- Frame rate impact analysis
- Memory usage testing
- Load time measurements
- Stress testing scenarios

## Validation Rules

### Automatic Validations
- **Range Checks**: Values within acceptable bounds
- **Type Validation**: Correct data types for all settings
- **Dependency Checks**: Related settings consistency
- **Performance Limits**: Settings don't exceed hardware capabilities

### Custom Validations
Define custom validation rules in `validation-rules.json`:
```json
{
  "scoring.bubble.normal": {
    "min": 1, 
    "max": 100,
    "type": "integer",
    "dependencies": ["scoring.bubble.special"]
  }
}
```

## Export and Backup

### Automatic Backups
- Created before any changes
- Timestamped backup files
- Rollback capability
- Backup history management

### Export Formats
- **JSON**: Machine-readable configuration
- **YAML**: Human-readable configuration  
- **CSV**: Spreadsheet-compatible format
- **Diff**: Change comparison format

### Batch Operations
Process multiple configurations:
```bash
# Apply same changes to multiple environments
node balance-adjuster.js --batch production.json
node balance-adjuster.js --batch staging.json  
node balance-adjuster.js --batch development.json
```

## Integration

### CI/CD Integration
```yaml
# GitHub Actions example
- name: Validate Balance Changes
  run: |
    node tools/balance/balance-adjuster.js --analyze-current
    node tools/balance/balance-adjuster.js --batch ci-validation.json
```

### API Integration
```javascript
// Programmatic usage
import { BalanceAdjuster } from './tools/balance/balance-adjuster.js';

const adjuster = new BalanceAdjuster();
const results = await adjuster.analyzer.performDetailedImpactAnalysis(changes);
```

## Configuration Files

### Main Configuration Sources
- `src/config/GameBalance.js` - Primary balance configuration
- `src/config/PerformanceConfig.js` - Performance settings
- `src/config/StageConfig.js` - Stage-specific settings

### Backup Directory Structure
```
backups/
├── 2025-01-20/
│   ├── GameBalance_20250120_143022.js
│   ├── PerformanceConfig_20250120_143022.js
│   └── backup-manifest.json
└── 2025-01-19/
    └── ...
```

## Error Handling

### Common Error Scenarios
1. **Invalid Configuration**: Malformed JSON or missing required fields
2. **Range Violations**: Values outside acceptable bounds
3. **Dependency Conflicts**: Inconsistent related settings
4. **File Access Issues**: Permission or file system problems

### Error Recovery
- Automatic rollback on critical errors
- Graceful degradation for non-critical issues
- Detailed error reporting with suggestions
- Safe mode operation when errors detected

## Best Practices

### Before Making Changes
1. Always create backups (enabled by default)
2. Run impact analysis to understand effects
3. Test changes with quick validation
4. Review balance guidelines

### Change Management
1. Make incremental changes rather than large adjustments
2. Test each change independently  
3. Document reasoning for changes
4. Monitor player feedback after deployment

### Performance Considerations
1. Avoid extreme values that may impact performance
2. Test performance impact on lower-end devices
3. Consider memory usage implications
4. Validate frame rate stability

## Troubleshooting

### Common Issues

#### Tool Won't Start
```bash
# Check Node.js version (requires 14+)
node --version

# Install dependencies
npm install

# Check file permissions
ls -la tools/balance/
```

#### Configuration Load Failures
```bash
# Validate configuration files
node -e "require('./src/config/GameBalance.js')"

# Reset to defaults if corrupted
node tools/balance/balance-adjuster.js --reset-defaults
```

#### Test Failures
```bash
# Run specific test category
node tools/balance/balance-adjuster.js --test-only quick

# Verbose test output
node tools/balance/balance-adjuster.js --test-verbose
```

### Performance Issues
- Large configuration files may slow loading
- Complex analysis calculations take time
- Network issues may affect remote configuration sources

### Getting Help
- Use `--help` flag for command reference
- Check balance guidelines in interactive menu
- Review error logs in `logs/balance-adjuster.log`
- Consult MIGRATION_GUIDE.md for architecture details

## Version History

- **v1.0.0** (Phase F.4): Main Controller Pattern implementation
- **v0.9.0**: Enhanced testing framework
- **v0.8.0**: Batch processing capabilities
- **v0.7.0**: Interactive menu system
- **v0.6.0**: Initial command-line interface

## Contributing

### Development Setup
```bash
cd tools/balance
npm install
npm run test
```

### Adding New Features
1. Follow Main Controller Pattern
2. Add appropriate sub-component
3. Update delegation methods in main controller
4. Add comprehensive tests
5. Update documentation

### Testing Changes
```bash
# Unit tests for sub-components
npm run test:unit

# Integration tests for main controller
npm run test:integration  

# End-to-end CLI testing
npm run test:e2e
```