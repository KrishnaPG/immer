# Library Integration Strategy

## Core Technology Stack

### React Framework
**Primary Use Cases**:
- Component lifecycle management
- State management for spatial transformations
- Event handling and propagation
- Context-based architecture for space hierarchy

**Integration Points**:
- Custom hooks for geometric operations
- Context providers for viewport and space management
- Higher-order components for interaction capabilities

### TensorFlow.js
**Primary Use Cases**:
- Advanced geometric calculations and transformations
- Matrix operations for coordinate system conversions
- Performance-critical mathematical computations
- Machine learning-enhanced interaction predictions

**Integration Strategy**:
```typescript
// Core tensor operations for geometry
import * as tf from '@tensorflow/tfjs'

// Custom tensor utilities for affine transformations
export class AffineTensor {
  static transformPoint(point: tf.Tensor2D, transform: tf.Tensor2D): tf.Tensor2D
  static composeTransforms(t1: tf.Tensor2D, t2: tf.Tensor2D): tf.Tensor2D
  static invertTransform(transform: tf.Tensor2D): tf.Tensor2D
}
```

### @dnd-kit Library Suite
**Primary Use Cases**:
- Advanced drag-and-drop functionality
- Touch and mouse gesture handling
- Collision detection for interactive elements
- Accessibility-compliant interactions

**Integration Strategy**:
```typescript
// Drag and drop context for spatial interactions
<DndContext
  sensors={sensors}
  collisionDetection={customCollisionDetection}
  onDragStart={handleDragStart}
  onDragEnd={handleDragEnd}
>
  <SpatialContainer>
    <DraggableItem id="item-1">
      <InteractiveComponent />
    </DraggableItem>
  </SpatialContainer>
</DndContext>
```

### @use-gesture Library
**Primary Use Cases**:
- Complex gesture recognition
- Multi-touch interaction handling
- Gesture state management
- Performance-optimized event handling

**Integration Strategy**:
```typescript
// Custom gesture hooks for spatial interactions
export const useSpatialGesture = () => {
  const bind = useGesture({
    onPinch: ({ offset: [scale], origin: [x, y] }) => {
      // Handle pinch-to-zoom with spatial transformations
    },
    onDrag: ({ offset: [x, y] }) => {
      // Handle drag with coordinate system conversion
    }
  })
  return bind
}
```

### Framer Motion
**Primary Use Cases**:
- Smooth animations and transitions
- Gesture-based animations
- Layout animations for dynamic content
- Performance-optimized animation pipeline

**Integration Strategy**:
```typescript
// Animated spatial transformations
<motion.div
  animate={{
    x: transform.x,
    y: transform.y,
    scale: transform.scale,
    rotate: transform.rotation
  }}
  transition={{
    type: "spring",
    stiffness: 300,
    damping: 30
  }}
>
  <SpatialComponent />
</motion.div>
```

### D3 Geometry
**Primary Use Cases**:
- Additional geometric primitives
- Path generation and manipulation
- Shape interpolation algorithms
- Mathematical utility functions

**Integration Strategy**:
```typescript
// Enhanced geometry utilities
import { path } from 'd3-geometry'

// Custom path generators for spatial elements
export const createSpatialPath = (points: Point[]) => {
  return path()
    .moveTo(points[0].x, points[0].y)
    .lineTo(...points.slice(1).map(p => [p.x, p.y]))
}
```

## Module-Specific Library Integration

### Components Module Integration

#### Item Component
```typescript
// React + @dnd-kit + Framer Motion integration
interface ItemProps {
  children: React.ReactNode
  transform?: Transform
  interactive?: boolean
}

export const Item: React.FC<ItemProps> = ({
  children,
  transform,
  interactive = true
}) => {
  const [currentTransform, setCurrentTransform] = useState(transform)

  const { attributes, listeners, setNodeRef, transform: dragTransform } = useDraggable({
    id: 'spatial-item'
  })

  return (
    <motion.div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      animate={currentTransform?.toMotionValues()}
      drag
      dragMomentum={false}
      className="affine-item"
    >
      {children}
    </motion.div>
  )
}
```

#### Space Component
```typescript
// React Context for spatial hierarchy
interface SpaceContextType {
  basis: Basis
  addChild: (component: Component) => void
  removeChild: (component: Component) => void
}

export const SpaceContext = createContext<SpaceContextType>(null)

export const Space: React.FC<SpaceProps> = ({ children, basis }) => {
  const [components, setComponents] = useState<Component[]>([])

  const addChild = useCallback((component: Component) => {
    setComponents(prev => [...prev, component])
  }, [])

  return (
    <SpaceContext.Provider value={{ basis, addChild, removeChild }}>
      <div className="affine-space">
        {children}
      </div>
    </SpaceContext.Provider>
  )
}
```

#### Viewport Component
```typescript
// Pure CSS transform-based viewport (no Canvas)
export const Viewport: React.FC<ViewportProps> = ({
  children,
  style
}) => {
  const [viewTransform, setViewTransform] = useState<Transform>(new Transform())
  const hyperspaceRef = useRef<HTMLDivElement>(null)

  // CSS transform-based rendering (original tapspace approach)
  const updateViewTransform = useCallback((newTransform: Transform) => {
    if (hyperspaceRef.current) {
      // Apply transform to hyperspace container using CSS transforms
      const matrix3d = `matrix3d(
        ${newTransform.scale * Math.cos(newTransform.rotation)}, ${newTransform.scale * Math.sin(newTransform.rotation)}, 0, 0,
        ${-newTransform.scale * Math.sin(newTransform.rotation)}, ${newTransform.scale * Math.cos(newTransform.rotation)}, 0, 0,
        0, 0, 1, 0,
        ${newTransform.x}, ${newTransform.y}, 0, 1
      )`

      hyperspaceRef.current.style.transform = matrix3d
    }
    setViewTransform(newTransform)
  }, [])

  return (
    <div className="affine-viewport" style={style}>
      <div
        ref={hyperspaceRef}
        className="affine-hyperspace"
        style={{
          // CSS transform-based rendering (original tapspace method)
          transformOrigin: '0 0',
          // Enable hardware acceleration
          willChange: 'transform'
        }}
      >
        <div className="viewport-content">
          {children}
        </div>
      </div>
    </div>
  )
}
```

### Geometry Module Integration

#### Tensor-Based Calculations
```typescript
// TensorFlow.js integration for geometry
export class GeometryEngine {
  static transformPoint(point: Point, transform: Transform): Point {
    const pointTensor = tf.tensor2d([[point.x, point.y, 1]])
    const transformMatrix = this.transformToMatrix(transform)

    const result = tf.matMul(pointTensor, transformMatrix)
    const [x, y] = result.dataSync()

    return new Point(point.basis, { x, y, z: 0 })
  }

  static transformToMatrix(transform: Transform): tf.Tensor2D {
    return tf.tensor2d([
      [transform.scale * Math.cos(transform.rotation), -transform.scale * Math.sin(transform.rotation), transform.x],
      [transform.scale * Math.sin(transform.rotation), transform.scale * Math.cos(transform.rotation), transform.y],
      [0, 0, 1]
    ])
  }
}
```

### Interaction Module Integration

#### Gesture Recognition Pipeline
```typescript
// @use-gesture + React integration
export const useSpatialInteraction = (target: HTMLElement) => {
  const { transform, setTransform } = useTransformState()

  const gestureBind = useGesture({
    onDrag: ({ offset: [x, y], first }) => {
      if (first) {
        // Initialize drag operation
      }

      const delta = new Vector(target, { x, y, z: 0 })
      setTransform(prev => prev.translateBy(delta))
    },

    onPinch: ({ offset: [scale], origin: [ox, oy] }) => {
      const pinchOrigin = new Point(target, { x: ox, y: oy, z: 0 })
      setTransform(prev => prev.scaleBy(scale, pinchOrigin))
    },

    onWheel: ({ delta: [dx, dy] }) => {
      const zoomFactor = dy > 0 ? 0.9 : 1.1
      setTransform(prev => prev.scaleBy(zoomFactor))
    }
  })

  return { gestureBind, transform }
}
```

#### @dnd-kit Advanced Features
```typescript
// Advanced drag and drop with spatial constraints
export const SpatialDndContext: React.FC = ({ children }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    }),
    useSensor(TouchSensor)
  )

  const collisionDetection = useCallback((args: CollisionDetection) => {
    // Custom collision detection for spatial coordinates
    return customSpatialCollisionDetection(args)
  }, [])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      modifiers={[restrictToWindowEdges]}
    >
      {children}
    </DndContext>
  )
}
```

## Performance Optimization Strategy

### TensorFlow.js Performance Features
- **WebGL Acceleration**: GPU-accelerated mathematical operations
- **Memory Management**: Automatic tensor disposal
- **Batch Operations**: Vectorized geometric calculations

### React Performance Optimizations
- **Concurrent Features**: React 18 concurrent rendering
- **Memoization**: Spatial transformation caching
- **Virtualization**: Large space content management

### Animation Performance
- **Hardware Acceleration**: CSS transform-based animations
- **Frame Rate Optimization**: RequestAnimationFrame-based updates
- **Layout Thrashing Prevention**: Computed style batching

## TypeScript Integration Strategy

### Branded Types for Type Safety
```typescript
// Coordinate system type safety
export type AffineX = number & { __brand: 'AffineX' }
export type AffineY = number & { __brand: 'AffineY' }
export type AffineZ = number & { __brand: 'AffineZ' }

export interface AffinePoint {
  x: AffineX
  y: AffineY
  z: AffineZ
}
```

### Comprehensive Interface Definitions
```typescript
// Component interfaces
export interface SpatialComponent {
  transform(): Transform
  transformBy(transform: Transform): this
  getBoundingBox(): Box
}

// Geometry interfaces
export interface GeometricPrimitive {
  changeBasis(newBasis: Basis): this
  getRaw(): RawCoordinates
  transitRaw(targetBasis: Basis): RawCoordinates
}
```

This library integration strategy provides a solid foundation for implementing the tapspace functionality in a modern React/TypeScript environment with advanced mathematical capabilities and excellent user interaction support.