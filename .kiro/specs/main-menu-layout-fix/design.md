# Design Document

## Overview

This design addresses the main menu layout issues by implementing a robust coordinate calculation system that ensures proper centering and scaling of all UI elements. The solution focuses on fixing the coordinate transformation logic in the MainMenuRenderer class while maintaining the existing component architecture.

## Architecture

### Current Architecture Analysis

The main menu system uses a component-based architecture:
- `MainMenuScene`: Main controller that manages state and delegates rendering
- `MainMenuRenderer`: Handles the actual drawing of menu elements
- Canvas-based rendering with coordinate transformation from base resolution (800x600) to actual canvas size

### Problem Analysis

The current issues stem from:
1. **Coordinate Transformation**: The scaling calculation `(baseWidth / 2) * scaleX` may not account for actual canvas positioning
2. **Text Rendering**: Canvas text rendering may be affected by transform state or font loading
3. **Layout Calculations**: Menu item positioning uses base coordinates without proper scaling validation

## Components and Interfaces

### MainMenuRenderer Enhancements

#### Current Interface
```javascript
class MainMenuRenderer {
    renderMainMenu(context, selectedMenuIndex, menuItems)
    renderMenuItems(context, selectedMenuIndex, menuItems)
    renderControls(context)
}
```

#### Enhanced Interface
```javascript
class MainMenuRenderer {
    // Existing methods (enhanced)
    renderMainMenu(context, selectedMenuIndex, menuItems)
    renderMenuItems(context, selectedMenuIndex, menuItems)
    renderControls(context)
    
    // New utility methods
    calculateCenterX(baseX)
    calculateCenterY(baseY)
    getScalingFactors()
    validateTextBounds(text, font, x, y)
}
```

### Coordinate System Design

#### Base Coordinate System
- Reference resolution: 800x600 (maintained for consistency)
- All layout calculations use base coordinates
- Transformation applied consistently across all elements

#### Scaling Strategy
```javascript
const scalingFactors = {
    x: canvas.width / baseWidth,
    y: canvas.height / baseHeight,
    uniform: Math.min(canvas.width / baseWidth, canvas.height / baseHeight) // For maintaining aspect ratio
};
```

#### Centering Calculations
```javascript
// Proper center calculation
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

// Base coordinate to actual coordinate
const actualX = (baseX * scaleX) + offsetX;
const actualY = (baseY * scaleY) + offsetY;
```

## Data Models

### Layout Configuration
```javascript
const layoutConfig = {
    title: {
        baseY: 150,
        fontSize: 48,
        color: '#FFFFFF'
    },
    subtitle: {
        baseY: 190,
        fontSize: 20,
        color: '#CCCCCC'
    },
    playerInfo: {
        baseY: 230,
        fontSize: 16,
        color: '#AAAAAA'
    },
    menuItems: {
        startY: 280,
        itemHeight: 50,
        itemWidth: 300,
        spacing: 20
    },
    controls: {
        bottomOffset: 40,
        fontSize: 14,
        color: '#AAAAAA'
    }
};
```

### Coordinate Calculation Model
```javascript
class CoordinateCalculator {
    constructor(canvas, baseWidth = 800, baseHeight = 600) {
        this.canvas = canvas;
        this.baseWidth = baseWidth;
        this.baseHeight = baseHeight;
    }
    
    getScaleFactors() {
        return {
            x: this.canvas.width / this.baseWidth,
            y: this.canvas.height / this.baseHeight
        };
    }
    
    getCenterX() {
        return this.canvas.width / 2;
    }
    
    getCenterY() {
        return this.canvas.height / 2;
    }
    
    transformX(baseX) {
        return baseX * this.getScaleFactors().x;
    }
    
    transformY(baseY) {
        return baseY * this.getScaleFactors().y;
    }
}
```

## Error Handling

### Text Rendering Validation
- Validate text bounds before rendering
- Fallback font handling for missing fonts
- Text overflow detection and handling

### Canvas State Management
- Proper save/restore of canvas context
- Transform state isolation for each element
- Error recovery for rendering failures

### Responsive Layout Validation
- Minimum/maximum size constraints
- Aspect ratio preservation options
- Layout validation after resize events

## Testing Strategy

### Unit Tests
1. **Coordinate Calculation Tests**
   - Test scaling factor calculations
   - Test center point calculations
   - Test coordinate transformations

2. **Layout Validation Tests**
   - Test element positioning
   - Test text bounds validation
   - Test responsive behavior

### Integration Tests
1. **Rendering Tests**
   - Test complete menu rendering
   - Test different screen sizes
   - Test font loading scenarios

2. **User Interaction Tests**
   - Test menu navigation
   - Test click detection accuracy
   - Test keyboard navigation

### Visual Regression Tests
1. **Screenshot Comparison**
   - Compare before/after layouts
   - Test multiple screen resolutions
   - Test different browser environments

### Manual Testing Scenarios
1. **Cross-browser Testing**
   - Chrome, Firefox, Safari, Edge
   - Different operating systems
   - Mobile and desktop viewports

2. **Accessibility Testing**
   - Screen reader compatibility
   - Keyboard navigation
   - High contrast mode

## Implementation Phases

### Phase 1: Coordinate System Fix
- Fix basic coordinate calculations
- Ensure title displays completely
- Center all text elements properly

### Phase 2: Menu Button Layout
- Fix menu button positioning
- Ensure consistent spacing
- Validate click detection areas

### Phase 3: Responsive Enhancements
- Improve scaling for different resolutions
- Add layout validation
- Implement fallback handling

### Phase 4: Testing and Validation
- Comprehensive testing across devices
- Performance optimization
- Documentation updates