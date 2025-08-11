# Multilingual Help Content Maintenance Guide

This document provides comprehensive guidance for maintaining the multilingual help system implemented for GitHub Issue #112.

## System Overview

The multilingual help system supports 5 languages with complete content coverage:
- **English (en)** - Primary reference language
- **Japanese (ja)** - Complete translation with cultural adaptations  
- **Korean (ko)** - Complete translation with regional considerations
- **Chinese Simplified (zh-CN)** - Mainland China localization
- **Chinese Traditional (zh-TW)** - Taiwan/Hong Kong localization

## Directory Structure

```
src/core/help/content/help/
├── en/          # English (reference language)
├── ja/          # Japanese
├── ko/          # Korean
├── zh-CN/       # Chinese Simplified
└── zh-TW/       # Chinese Traditional

Each language directory contains:
├── bubbles.json         # Bubble types and behaviors
├── controls.json        # Game controls and shortcuts  
├── settings.json        # Game settings and options
├── troubleshooting.json # Common issues and solutions
└── gameplay.json        # Game mechanics and strategies
```

## Validation and Monitoring Tools

Three automated tools ensure content quality:

### 1. Content Validator (`validate-help-content.js`)
- **Purpose**: JSON structure and content validation
- **Usage**: `node scripts/validate-help-content.js`
- **Checks**: Schema validation, required fields, language encoding

### 2. Consistency Checker (`check-help-content-consistency.js`) 
- **Purpose**: Cross-language structure comparison
- **Usage**: `node scripts/check-help-content-consistency.js`
- **Checks**: Missing translations, structural differences, version sync

### 3. Health Monitor (`monitor-help-content-health.js`)
- **Purpose**: System health and content freshness
- **Usage**: `node scripts/monitor-help-content-health.js`
- **Monitors**: File availability, content age, quality metrics

## Content Requirements

### File Structure
Each help file requires:
- `category`: Matches filename (without .json)
- `title`: Localized section title
- `description`: Brief content description  
- `language`: Two-letter language code
- `version`: Semantic version (1.0.0)
- `lastUpdated`: YYYY-MM-DD format
- `topics`: Array of help topics

### Topic Structure
Each topic requires:
- `id`: Unique identifier within file
- `title`: Localized topic title
- `description`: Topic summary
- `content`: Structured help content
- `difficulty`: beginner/intermediate/advanced
- `estimatedReadTime`: Seconds (30-1800)
- `tags`: Relevant keywords array

## Adding New Content

### New Language Support
1. Create language directory: `mkdir src/core/help/content/help/{code}`
2. Copy English templates: `cp src/core/help/content/help/en/*.json src/core/help/content/help/{code}/`
3. Update language fields and translate content
4. Validate: `node scripts/validate-help-content.js`

### New Help Categories  
1. Create in English first with proper structure
2. Copy to all language directories
3. Translate maintaining topic IDs and structure
4. Update validation scripts with new category

## Quality Assurance

### Pre-Translation Checklist
- [ ] Source content finalized
- [ ] Technical terms documented  
- [ ] Cultural adaptations identified
- [ ] Translation brief prepared

### Post-Translation Checklist
- [ ] All required fields present
- [ ] Language field matches directory
- [ ] Content culturally appropriate
- [ ] Technical accuracy verified
- [ ] All validation scripts pass

## Troubleshooting

### Common Issues

**JSON Syntax Errors**
- Cause: Unescaped quotes, missing commas
- Solution: Use JSON linting, check quote escaping
- Prevention: JSON-aware editors, validation hooks

**Content Inconsistencies** 
- Cause: Missing topics, different structures
- Solution: Run consistency checker, compare with English
- Prevention: Maintain translation templates

**Character Encoding Issues**
- Cause: Non-UTF-8 encoding, invalid Unicode
- Solution: Save as UTF-8, validate encoding
- Prevention: Configure editors for UTF-8

## Maintenance Schedule

- **Daily**: Automated validation on changes
- **Weekly**: Health monitoring review
- **Monthly**: Full consistency check
- **Quarterly**: Translation review and updates

## Emergency Procedures

### Critical Content Failure
1. Run health monitor to assess scope
2. Identify root cause via validation tools
3. Restore from backup or regenerate content
4. Verify system functionality restored

### Missing Translation Recovery
1. Enable fallback to English content
2. Assess translation requirements  
3. Prioritize critical content restoration
4. Validate recovered translations

## Best Practices

1. **Always validate before committing changes**
2. **Maintain structural consistency across languages**  
3. **Use semantic versioning for content updates**
4. **Test fallback mechanisms regularly**
5. **Document all translation decisions**
6. **Keep cultural adaptations appropriate**
7. **Monitor system health continuously**
8. **Backup content before major changes**

## Support Resources

- **Technical Issues**: Check GitHub Issues #112
- **Translation Questions**: Consult language specialists  
- **System Problems**: Contact development team
- **Emergency**: Follow incident response procedures

---

**Created**: 2025-01-27 (GitHub Issue #112)  
**Last Updated**: 2025-01-27  
**Review Schedule**: Quarterly