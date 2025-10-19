# Tapspace Library Architecture Overview

## Core Modules

### Components Module
**Purpose**: Provides interactive HTML elements that exist in affine 3D space

**Core Components**:
- **Item**: Interactive HTML container with transformation capabilities
- **Space**: Boundless container for organizing other components hierarchically
- **Viewport**: Root component providing a view into the space

**Specialized Components**:
- **Node**: Circular HTML element for spatial representation
- **Edge**: CSS border-based line segments
- **Arc**: Curved CSS border segments

**Viewport Controls**:
- **CustomControl**: User-defined HTML control elements
- **ZoomControl**: Built-in zoom in/out button pair

### Geometry Module
**Purpose**: Immutable tensor-based geometry for affine 3D space calculations

**Core Geometric Primitives**:
- **Point**: 3D position with coordinate basis
- **Vector**: 3D displacement with magnitude and direction
- **Transform**: Helmert transformations (rotation, scaling, translation)

**Complex Shapes**:
- **Area**: 2D regions with boundary calculations
- **Box**: Axis-aligned bounding boxes
- **Circle/Sphere**: Curved geometric shapes
- **Polygon**: Multi-sided 2D shapes
- **Path**: Sequences of connected geometric elements
- **Ray**: Infinite lines from origin points

**Geometric Relationships**:
- **Distance**: Spatial separation measurements
- **Direction**: Angular orientation vectors
- **Orientation**: Rotational state representation
- **Scale**: Size transformation factors

### Interaction Module
**Purpose**: Gesture-based user interaction handling

**Basic Gestures**:
- **Tap**: Touch/click detection with optional visual feedback
- **Hold**: Sustained touch/mouse press interactions
- **Approach**: Proximity-based interaction triggers

**Movement Interactions**:
- **Slide**: Constrained movement along specified directions
- **Drag/Pan**: Free-form translation movements
- **Pinch**: Multi-touch transformation gestures

**Input Modalities**:
- **Keyboard**: Arrow key and WASD-based navigation
- **Mouse Wheel**: Rotation, zoom, and pan controls
- **Touch Gestures**: Multi-pointer interaction support

### Effects Module
**Purpose**: Visual feedback and animation effects

**Current Effects**:
- **Press**: Visual feedback for touch interactions

### Loaders Module
**Purpose**: Resource management and hierarchical content loading

**Key Features**:
- **Image Preloading**: Dimension calculation before DOM insertion
- **TreeLoader**: Recursive loading system for nested content structures

### Metrics Module
**Purpose**: Geometric measurement and analysis utilities

**Capabilities**:
- **Measurement**: Spatial relationship calculations
- **Visual Distance**: Screen-space distance computations

### Capturers Module
**Purpose**: Low-level input event capture and preprocessing

**Capture Systems**:
- **Camera**: Device orientation and motion capture
- **Gesture**: Touch and mouse gesture recognition
- **Keyboard**: Key event capture and processing
- **Resize**: Viewport dimension change detection
- **Wheel**: Mouse wheel and trackpad event handling