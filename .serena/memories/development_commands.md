# Development Commands

## Essential Commands for BubblePop (awaputi) Project

### Project Startup
```bash
# Start local development server (recommended)
python -m http.server 8000
# or
npx serve .

# Access main game
# http://localhost:8000

# Access test environment
# http://localhost:8000/test.html

# Debug mode
# http://localhost:8000?debug=true
# Keyboard shortcut: Ctrl+Shift+D
```

### Testing Commands
```bash
# Unit & Integration tests
npm test

# E2E tests
npm run test:e2e

# Performance tests
npm run test:performance

# All test suites
npm run test:all
```

### Build & Development
```bash
# Build project
npm run build

# Lint code
npm run lint

# Format code
npm run format

# Generate documentation
npm run generate:docs
```

### Utility Commands
```bash
# File size monitoring (MCP token limit compliance)
node tools/file-size-monitor.js

# Balance adjuster tool
node tools/balance-adjuster.js

# Performance assessment
node scripts/performance-impact-assessment.js

# Git operations
git status
git add .
git commit -m "message"
git push origin branch-name
```

### Darwin (macOS) Specific Commands
```bash
# System utilities
ls -la          # List files with details
find . -name "*.js"  # Find JavaScript files
grep -r "pattern" src/  # Search in source code
du -h -d 1      # Directory sizes
ps aux | grep node  # Check Node processes
```

### Task Completion Workflow
1. **Code Implementation**: Complete the requested changes
2. **Lint & Build**: Run `npm run lint` and `npm run build`
3. **Test**: Execute relevant tests (`npm test`)
4. **File Size Check**: Verify files under 2,500 words
5. **Commit**: Create descriptive commit with conventional format
6. **Documentation**: Update relevant documentation if needed