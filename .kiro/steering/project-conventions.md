---
inclusion: always
---

# Bubble Pop Web Game - Project Conventions

## Architecture Patterns

### Module System
- Use ES6 modules with `.js` extensions
- Import/export syntax: `import { Class } from './path/file.js'`
- Always include `.js` extension in imports
- Use named exports for classes and functions

### Class Structure
- Use ES6 classes with proper constructor patterns
- Manager classes handle specific game systems (AudioManager, BubbleManager, etc.)
- Scene classes extend base Scene class for different game states
- Core classes provide fundamental game functionality

### File Organization
```
src/
├── core/           # Core game engine and systems
├── scenes/         # Game scenes (MainMenu, Game, etc.)
├── bubbles/        # Bubble types and behaviors
├── managers/       # System managers
├── utils/          # Utility functions and helpers
├── audio/          # Audio management
├── effects/        # Visual effects and particles
└── ui/             # UI components
```

## Code Style

### Language
- Primary language: Japanese for comments, documentation, and user-facing text
- Variable/function names: English (camelCase)
- Class names: PascalCase
- Constants: UPPER_SNAKE_CASE

### Error Handling
- Use centralized ErrorHandler utility
- Always provide context in error handling
- Log errors with appropriate severity levels
- Graceful degradation for non-critical features

### Async Patterns
- Use async/await for asynchronous operations
- Handle loading states with LoadingManager
- Implement proper error boundaries for async operations

## Game-Specific Conventions

### Canvas Management
- Single canvas element with ID 'gameCanvas'
- Use ResponsiveCanvasManager for responsive design
- Implement proper cleanup for canvas resources

### Performance
- Use object pooling for frequently created/destroyed objects
- Implement memory management utilities
- Monitor performance with built-in debugging tools
- Bundle size limits: JS < 500KB, CSS < 50KB (gzipped)

### Browser Compatibility
- Check compatibility using BrowserCompatibility utility
- Graceful fallbacks for unsupported features
- Support modern browsers (Chrome, Firefox, Safari, Edge)

## Testing Requirements

### Test Structure
- Unit tests in `tests/unit/`
- Integration tests in `tests/integration/`
- E2E tests in `tests/e2e/`
- Performance tests in `tests/performance/`

### Test Coverage
- Maintain test coverage for core functionality
- Use Jest for unit/integration testing
- Use Playwright for E2E testing

## Build and Deployment

### Environment Configuration
- Use Vite for build tooling
- Support multiple environments: development, staging, production
- Environment-specific builds with proper base paths

### Deployment Targets
- Netlify (primary)
- Vercel (secondary)
- GitHub Pages (with base path configuration)

## Accessibility

### Requirements
- Keyboard navigation support
- Screen reader compatibility
- High contrast support
- Responsive design for mobile devices

### Implementation
- Use semantic HTML elements
- Provide proper ARIA labels
- Implement keyboard shortcuts via KeyboardShortcutManager
- Maintain accessibility.css for styling

## Localization

### Language Support
- Primary: Japanese
- Secondary: English (README.en.md exists)
- Use LocalizationManager for text management
- Separate language files for scalability

## Development Workflow

### Debug Features
- Enable debug mode with URL parameter `?debug=true`
- Keyboard shortcut: Ctrl+Shift+D to toggle debug mode
- Performance monitoring in debug mode
- Console logging for development insights

### Code Quality
- Run linter before commits
- Execute all test suites before releases
- Use build optimization scripts
- Monitor bundle size with bundlesize tool

## Security Considerations

### Data Handling
- Use localStorage for game data persistence
- Implement proper data validation
- Handle user input sanitization
- No sensitive data in client-side code

### Error Information
- Avoid exposing internal system details in error messages
- Log detailed errors server-side only
- Provide user-friendly error messages in Japanese

## Performance Optimization

### Resource Management
- Lazy load non-critical resources
- Use efficient rendering techniques
- Implement proper cleanup in scene transitions
- Monitor memory usage in development

### Build Optimization
- Code splitting for better loading performance
- Asset optimization and compression
- Lighthouse performance targets: >90 for all metrics