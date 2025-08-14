# Implementation Plan

- [ ] 1. Create core coordinate management infrastructure
  - Implement ScaledCoordinateManager class with coordinate conversion methods
  - Add integration with ResponsiveCanvasManager for scale information
  - Create unit tests for coordinate conversion accuracy
  - _Requirements: 1.1, 1.4, 5.1, 5.2_

- [x] 1.1 Implement ScaledCoordinateManager base class
  - Create src/utils/ScaledCoordinateManager.js with constructor and basic properties
  - Implement getScaledPosition() and getScaledSize() methods
  - Add getCanvasInfo() and getScaleFactor() methods for accessing scale information
  - _Requirements: 1.1, 1.4, 5.1_

- [x] 1.2 Add ResponsiveCanvasManager integration
  - Integrate ScaledCoordinateManager with existing ResponsiveCanvasManager
  - Implement onScaleChange() event handling for dynamic scale updates
  - Add updateScale() method to refresh scale calculations when canvas changes
  - _Requirements: 1.2, 1.4, 5.2_

- [ ] 1.3 Create coordinate conversion utilities
  - Implement getBasePosition() method for reverse coordinate conversion
  - Add coordinate validation and error handling for invalid inputs
  - Create debugging utilities for coordinate system troubleshooting
  - _Requirements: 5.3, 5.4_

- [ ] 2. Implement UI position calculation system
  - Create UIPositionCalculator class for consistent UI element positioning
  - Implement standard position calculations for status elements, buttons, and dialogs
  - Add responsive layout calculations based on screen size breakpoints
  - _Requirements: 2.1, 2.2, 2.3, 6.1, 6.2, 6.3_

- [ ] 2.1 Create UIPositionCalculator base structure
  - Create src/utils/UIPositionCalculator.js with constructor and dependencies
  - Implement getStatusPosition() method for score, HP, and time display positioning
  - Add getButtonPosition() method for control button positioning
  - _Requirements: 2.1, 2.2, 3.1_

- [ ] 2.2 Add layout calculation methods
  - Implement calculateLayout() method for multi-element positioning
  - Add getResponsiveMargins() method for device-appropriate spacing
  - Create alignment utilities (alignToEdge, centerElement) for flexible positioning
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 2.3 Implement responsive positioning logic
  - Add breakpoint-based positioning for mobile, tablet, and desktop
  - Implement orientation-aware positioning for landscape/portrait modes
  - Create device-specific margin and spacing calculations
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 3. Create scaled rendering context wrapper
  - Implement ScaledRenderingContext class to wrap canvas context with automatic scaling
  - Add scaled drawing methods (fillText, fillRect, strokeRect, drawImage)
  - Implement font and style scaling for consistent text rendering
  - _Requirements: 1.1, 1.3, 2.4, 2.5_

- [ ] 3.1 Implement ScaledRenderingContext base class
  - Create src/utils/ScaledRenderingContext.js with context wrapper functionality
  - Implement scaled fillText() method with automatic coordinate conversion
  - Add scaled fillRect() and strokeRect() methods for UI element backgrounds
  - _Requirements: 1.1, 2.1, 2.2, 2.3_

- [ ] 3.2 Add advanced rendering methods
  - Implement scaled drawImage() method for icons and graphics
  - Add setScaledFont() method for automatic font size scaling
  - Create setScaledLineWidth() method for consistent line thickness
  - _Requirements: 1.3, 2.5_

- [ ] 3.3 Implement context state management
  - Add save() and restore() methods that preserve scaling state
  - Implement getOriginalContext() method for direct context access when needed
  - Create context validation and error handling for missing canvas
  - _Requirements: 5.3, 5.4_

- [ ] 4. Fix GameUIManager status display positioning
  - Update renderAnimatedScore() method to use scaled coordinates
  - Fix renderTimeDisplay() method positioning with proper scaling
  - Update renderHPDisplay() and renderHPBar() methods for scaled positioning
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 4.1 Update score display rendering
  - Modify renderAnimatedScore() in GameUIManager to use ScaledRenderingContext
  - Replace hardcoded coordinates (20, 20) with UIPositionCalculator.getStatusPosition()
  - Ensure score animations respect canvas scaling factors
  - _Requirements: 2.1, 2.4, 2.5_

- [ ] 4.2 Fix time display positioning
  - Update renderTimeDisplay() method to use scaled coordinate system
  - Replace hardcoded position (20, 60) with calculated responsive position
  - Ensure time display color changes and flashing effects work with scaling
  - _Requirements: 2.3, 2.4, 2.5_

- [ ] 4.3 Update HP display and bar rendering
  - Modify renderHPDisplay() to use scaled coordinates instead of fixed (20, 100)
  - Update renderHPBar() method to use scaled dimensions and positioning
  - Ensure HP bar gradients and animations work correctly with scaling
  - _Requirements: 2.2, 2.4, 2.5_

- [ ] 5. Update combo and special effects display
  - Fix renderComboDisplay() method to use scaled coordinates
  - Update renderSpecialEffectsStatus() method for proper positioning
  - Ensure all status indicators align correctly with scaled canvas
  - _Requirements: 2.1, 2.4, 2.5_

- [ ] 5.1 Fix combo display positioning
  - Update renderComboDisplay() to use right-aligned scaled coordinates
  - Replace canvas.width - 20 with UIPositionCalculator positioning
  - Ensure combo flash animations work with scaled rendering
  - _Requirements: 2.1, 2.4, 2.5_

- [ ] 5.2 Update special effects status display
  - Modify renderSpecialEffectsStatus() to use scaled coordinate system
  - Fix bonus time and time stop display positioning
  - Ensure all status effects render at correct scaled positions
  - _Requirements: 2.1, 2.4_

- [ ] 6. Implement input coordinate conversion system
  - Create InputCoordinateConverter class for handling mouse and touch input
  - Implement coordinate conversion for all interactive elements
  - Add hit testing methods that account for canvas scaling
  - _Requirements: 3.2, 3.3, 4.1, 4.2, 4.3_

- [ ] 6.1 Create InputCoordinateConverter base class
  - Create src/utils/InputCoordinateConverter.js with coordinate conversion methods
  - Implement convertMouseEvent() method for mouse input scaling
  - Add convertTouchEvent() method for touch input on mobile devices
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 6.2 Implement hit testing utilities
  - Add isPointInScaledRect() method for rectangular hit testing
  - Implement isPointInScaledCircle() method for circular hit testing (bubbles)
  - Create createScaledEvent() utility for event object conversion
  - _Requirements: 3.2, 4.1, 4.2_

- [ ] 6.3 Add input validation and error handling
  - Implement coordinate bounds checking for input events
  - Add fallback handling for unsupported input types
  - Create debugging utilities for input coordinate troubleshooting
  - _Requirements: 4.3, 5.4_

- [ ] 7. Update GameControlButtons positioning and interaction
  - Fix button positioning in GameControlButtons class to use scaled coordinates
  - Update click detection to use InputCoordinateConverter
  - Ensure hover states work correctly with scaled coordinates
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 7.1 Fix GameControlButtons positioning
  - Update GameControlButtons.js to use UIPositionCalculator for button positions
  - Replace hardcoded button coordinates with scaled positioning system
  - Ensure button spacing and alignment work across different screen sizes
  - _Requirements: 3.1, 3.3_

- [ ] 7.2 Update button click detection
  - Modify handleClick() method to use InputCoordinateConverter
  - Update mouse position tracking to account for canvas scaling
  - Ensure button interactions work correctly on all device types
  - _Requirements: 3.2, 3.4_

- [ ] 7.3 Fix button hover and visual states
  - Update updateMousePosition() to use scaled coordinate conversion
  - Ensure button hover effects work correctly with canvas scaling
  - Fix button visual feedback for touch and mouse interactions
  - _Requirements: 3.3, 3.4_

- [ ] 8. Update bubble interaction and hit detection
  - Modify bubble click/touch detection to use scaled coordinates
  - Update BubbleManager rendering to account for canvas scaling
  - Ensure drag interactions work correctly with coordinate conversion
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 8.1 Fix bubble hit detection
  - Update bubble click detection in relevant managers to use InputCoordinateConverter
  - Ensure bubble touch interactions work correctly on mobile devices
  - Add coordinate validation for bubble interaction boundaries
  - _Requirements: 4.1, 4.2_

- [ ] 8.2 Update bubble rendering positions
  - Modify BubbleManager to use ScaledRenderingContext for bubble positioning
  - Ensure bubble animations and effects respect canvas scaling
  - Fix bubble spawn positions to use scaled coordinate system
  - _Requirements: 4.1, 4.3_

- [ ] 9. Integrate coordinate system with ResponsiveCanvasManager
  - Update ResponsiveCanvasManager to work seamlessly with new coordinate system
  - Add scale change event propagation to all coordinate-dependent components
  - Ensure canvas resize events trigger coordinate system updates
  - _Requirements: 1.2, 1.4, 5.2, 5.5_

- [ ] 9.1 Enhance ResponsiveCanvasManager integration
  - Add ScaledCoordinateManager initialization to ResponsiveCanvasManager
  - Implement scale change event broadcasting to dependent systems
  - Ensure coordinate system updates when canvas size or scale changes
  - _Requirements: 1.2, 1.4, 5.2_

- [ ] 9.2 Add canvas resize handling
  - Update onCanvasResize callback to trigger coordinate system refresh
  - Ensure all UI elements reposition correctly during resize events
  - Add debouncing for rapid resize events to improve performance
  - _Requirements: 1.2, 5.5_

- [ ] 10. Create comprehensive test suite
  - Write unit tests for all coordinate conversion methods
  - Create integration tests for UI positioning across different screen sizes
  - Add visual regression tests to ensure consistent rendering
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 10.1 Write unit tests for coordinate system
  - Create tests for ScaledCoordinateManager coordinate conversion accuracy
  - Add tests for UIPositionCalculator layout calculations
  - Write tests for InputCoordinateConverter event handling
  - _Requirements: 1.1, 1.4, 4.1, 4.2_

- [ ] 10.2 Create integration tests
  - Write tests for ResponsiveCanvasManager integration
  - Add tests for UI element positioning across different device types
  - Create tests for input handling accuracy with scaling
  - _Requirements: 1.2, 6.1, 6.2, 6.3_

- [ ] 10.3 Add visual and performance tests
  - Create screenshot comparison tests for UI layout consistency
  - Add performance tests for coordinate calculation overhead
  - Write tests for canvas resize and orientation change handling
  - _Requirements: 6.4, 6.5_

- [ ] 11. Add debugging and developer tools
  - Create coordinate system debugging utilities
  - Add visual debugging overlays for coordinate system troubleshooting
  - Implement logging for coordinate conversion issues
  - _Requirements: 5.4_

- [ ] 11.1 Implement debugging utilities
  - Create coordinate system debug panel showing scale factors and positions
  - Add visual overlays to show UI element boundaries and positions
  - Implement console logging for coordinate conversion debugging
  - _Requirements: 5.4_

- [ ] 11.2 Add developer documentation
  - Create documentation for using the scaled coordinate system
  - Add examples for implementing new UI elements with proper scaling
  - Document best practices for coordinate system usage
  - _Requirements: 5.3, 5.4_

- [ ] 12. Performance optimization and final testing
  - Optimize coordinate calculation performance for smooth gameplay
  - Conduct comprehensive testing across multiple devices and screen sizes
  - Validate that all requirements are met and issue #177 is resolved
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 12.1 Performance optimization
  - Profile coordinate calculation performance and optimize bottlenecks
  - Implement coordinate caching for frequently accessed positions
  - Optimize rendering performance with scaled coordinate system
  - _Requirements: All performance-related requirements_

- [ ] 12.2 Final comprehensive testing
  - Test game functionality across desktop, tablet, and mobile devices
  - Validate UI positioning accuracy at different screen sizes and orientations
  - Confirm that all interactive elements work correctly with scaled coordinates
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 12.3 Issue validation and documentation
  - Verify that GitHub issue #177 symptoms are completely resolved
  - Document the solution and provide migration guide for future UI elements
  - Create final test report confirming all requirements are satisfied
  - _Requirements: All requirements_