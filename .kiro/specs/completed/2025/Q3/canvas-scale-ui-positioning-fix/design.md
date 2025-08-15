# Design Document

## Overview

This design addresses the canvas scaling and UI positioning issues in the BubblePop game by implementing a comprehensive coordinate system that properly integrates with the existing ResponsiveCanvasManager. The solution involves creating a centralized coordinate management system, updating all UI rendering methods to use scaled coordinates, and ensuring consistent input handling across all interactive elements.

## Architecture

### Core Components

1. **ScaledCoordinateManager** - Central coordinate management system
2. **UIPositionCalculator** - Utility for calculating UI element positions
3. **ScaledRenderingContext** - Wrapper for canvas context with automatic scaling
4. **InputCoordinateConverter** - Handles input coordinate conversion
5. **ResponsiveCanvasManager Integration** - Enhanced integration with existing system

### Component Relationships

```
ResponsiveCanvasManager
    ↓ (provides scale info)
ScaledCoordinateManager
    ↓ (coordinates)
UIPositionCalculator ← ScaledRenderingContext
    ↓ (positions)        ↓ (rendering)
Game UI Components ← InputCoordinateConverter
    ↓ (events)
Input Handlers
```

## Components and Interfaces

### ScaledCoordinateManager

**Purpose:** Central management of coordinate scaling and conversion

**Interface:**
```javascript
class ScaledCoordinateManager {
    constructor(responsiveCanvasManager)
    
    // Coordinate conversion
    getScaledPosition(baseX, baseY)
    getScaledSize(baseWidth, baseHeight)
    getBasePosition(scaledX, scaledY)
    
    // Canvas information
    getCanvasInfo()
    getScaleFactor()
    
    // Event handling
    onScaleChange(callback)
    updateScale()
}
```

**Key Methods:**
- `getScaledPosition(baseX, baseY)` - Converts base coordinates to scaled coordinates
- `getScaledSize(baseWidth, baseHeight)` - Converts base dimensions to scaled dimensions
- `getBasePosition(scaledX, scaledY)` - Converts scaled coordinates back to base coordinates

### UIPositionCalculator

**Purpose:** Calculate consistent UI element positions

**Interface:**
```javascript
class UIPositionCalculator {
    constructor(scaledCoordinateManager)
    
    // Standard UI positions
    getStatusPosition(element)
    getButtonPosition(buttonType, index)
    getDialogPosition(dialogType)
    
    // Layout calculations
    calculateLayout(elements, containerBounds)
    getResponsiveMargins()
    
    // Alignment utilities
    alignToEdge(element, edge, margin)
    centerElement(element, container)
}
```

**Standard Positions:**
- Status elements: Top-left with responsive margins
- Control buttons: Top-right with proper spacing
- Dialogs: Centered with responsive sizing
- Floating elements: Relative to game area

### ScaledRenderingContext

**Purpose:** Wrapper for canvas context with automatic coordinate scaling

**Interface:**
```javascript
class ScaledRenderingContext {
    constructor(context, scaledCoordinateManager)
    
    // Scaled drawing methods
    fillText(text, baseX, baseY)
    fillRect(baseX, baseY, baseWidth, baseHeight)
    strokeRect(baseX, baseY, baseWidth, baseHeight)
    drawImage(image, baseX, baseY, baseWidth, baseHeight)
    
    // Font and style scaling
    setScaledFont(baseFontSize, fontFamily)
    setScaledLineWidth(baseWidth)
    
    // Context management
    save()
    restore()
    getOriginalContext()
}
```

### InputCoordinateConverter

**Purpose:** Handle input coordinate conversion for all interactive elements

**Interface:**
```javascript
class InputCoordinateConverter {
    constructor(scaledCoordinateManager)
    
    // Input conversion
    convertMouseEvent(event)
    convertTouchEvent(event)
    
    // Hit testing
    isPointInScaledRect(point, baseRect)
    isPointInScaledCircle(point, baseCenter, baseRadius)
    
    // Event utilities
    createScaledEvent(originalEvent)
}
```

## Data Models

### ScaleInfo
```javascript
{
    scaleFactor: number,        // Overall scale factor
    displayWidth: number,       // Canvas display width
    displayHeight: number,      // Canvas display height
    actualWidth: number,        // Canvas actual width
    actualHeight: number,       // Canvas actual height
    pixelRatio: number,         // Device pixel ratio
    baseWidth: number,          // Base design width (800)
    baseHeight: number          // Base design height (600)
}
```

### UIElement
```javascript
{
    id: string,
    type: string,               // 'status', 'button', 'dialog', etc.
    basePosition: {x, y},       // Position in base coordinates
    baseSize: {width, height},  // Size in base coordinates
    scaledPosition: {x, y},     // Calculated scaled position
    scaledSize: {width, height}, // Calculated scaled size
    anchor: string,             // 'top-left', 'center', etc.
    responsive: boolean         // Whether to apply responsive scaling
}
```

### LayoutConfiguration
```javascript
{
    margins: {
        top: number,
        right: number,
        bottom: number,
        left: number
    },
    spacing: {
        horizontal: number,
        vertical: number
    },
    breakpoints: {
        mobile: number,
        tablet: number,
        desktop: number
    }
}
```

## Error Handling

### Coordinate Conversion Errors
- **Invalid coordinates:** Return fallback positions with warning logs
- **Scale factor issues:** Use default scale (1.0) and log error
- **Canvas not available:** Defer calculations until canvas is ready

### Rendering Errors
- **Context not available:** Skip rendering with debug log
- **Font loading failures:** Use system fallback fonts
- **Image loading failures:** Render placeholder or skip

### Input Handling Errors
- **Touch event issues:** Fall back to mouse event handling
- **Coordinate out of bounds:** Clamp to valid canvas area
- **Multiple touch points:** Handle primary touch only

## Testing Strategy

### Unit Tests
1. **ScaledCoordinateManager Tests**
   - Coordinate conversion accuracy
   - Scale factor calculations
   - Event handling

2. **UIPositionCalculator Tests**
   - Position calculations for different screen sizes
   - Layout calculations
   - Responsive margin calculations

3. **ScaledRenderingContext Tests**
   - Drawing method scaling
   - Font scaling
   - Context state management

4. **InputCoordinateConverter Tests**
   - Mouse event conversion
   - Touch event conversion
   - Hit testing accuracy

### Integration Tests
1. **Canvas Scaling Integration**
   - ResponsiveCanvasManager integration
   - Scale change handling
   - Multi-device testing

2. **UI Rendering Integration**
   - All UI elements render correctly
   - Animations work with scaling
   - Performance impact assessment

3. **Input Handling Integration**
   - Click/touch accuracy across scales
   - Hover states work correctly
   - Keyboard navigation compatibility

### Visual Regression Tests
1. **Screenshot Comparisons**
   - UI layout at different scales
   - Element positioning accuracy
   - Cross-device consistency

2. **Interactive Testing**
   - Button click accuracy
   - Bubble interaction precision
   - Dialog positioning

### Performance Tests
1. **Rendering Performance**
   - Frame rate impact of coordinate calculations
   - Memory usage of coordinate caching
   - Optimization effectiveness

2. **Input Responsiveness**
   - Input lag measurements
   - Touch response accuracy
   - High-frequency input handling

## Implementation Phases

### Phase 1: Core Infrastructure
- Implement ScaledCoordinateManager
- Create UIPositionCalculator
- Set up basic coordinate conversion

### Phase 2: Rendering System
- Implement ScaledRenderingContext
- Update GameUIManager to use scaled rendering
- Fix status display positioning

### Phase 3: Input Handling
- Implement InputCoordinateConverter
- Update all click/touch handlers
- Fix button interaction issues

### Phase 4: Integration & Testing
- Integrate with ResponsiveCanvasManager
- Comprehensive testing across devices
- Performance optimization

### Phase 5: Polish & Documentation
- Add debugging tools
- Create developer documentation
- Final testing and validation