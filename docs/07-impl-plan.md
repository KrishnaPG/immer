# Tapspace React/TypeScript Implementation Plan

## Project Overview

This document provides a detailed implementation plan for creating a modern React/TypeScript version of the tapspace library using Bun + Vite, with full integration of TensorFlow.js, @dnd-kit, Framer Motion, and @use-gesture. The implementation maintains 100% API compatibility with the original tapspace while leveraging modern web technologies.

### Context & Vision

**Project Goal**: Reimplement the original tapspace library as a modern React/TypeScript library while maintaining 100% API compatibility.

**Original Source Code**: Located at `tapspace/lib/` - Contains the existing JavaScript implementation with components, geometry, interactions, and effects modules.

**New Codebase Location**: `vite-project/src/` - Modern React/TypeScript implementation using Bun + Vite build system.

**Key Technologies**:
- **Bun + TypeScript + Vite** - Modern build stack with full tree-shaking
- **TensorFlow.js** - Advanced geometric calculations and matrix operations
- **@dnd-kit** - Sophisticated drag-and-drop functionality
- **Framer Motion** - Smooth animations and transitions
- **@use-gesture** - Complex gesture recognition
- **Valtio** - Reactive state management
- **Tailwind + CSS Modules** - Component styling with theme support

**Architecture Goals**:
- ✅ **CSS transform-based rendering** (no Canvas dependency)
- ✅ **Immutable tensor-based geometry** with basis transformations
- ✅ **Dual API design** - React components + imperative API compatibility
- ✅ **Modern React patterns** with hooks and functional components
- ✅ **Full TypeScript coverage** with branded types for type safety


## 1. Project Architecture & Build Configuration

### 1.1 Build System Architecture

```
vite-project/
├── src/
│   ├── lib/                          # Core library code
│   │   ├── geometry/                # TensorFlow.js-powered geometry
│   │   ├── components/              # React components with hooks
│   │   ├── interactions/            # @use-gesture + @dnd-kit integration
│   │   ├── animations/              # Framer Motion animations
│   │   ├── state/                   # Valtio state management
│   │   └── index.ts                 # Main exports
│   ├── styles/
│   │   ├── base.css                 # Base affine styles
│   │   ├── themes/                  # Color theme variants
│   │   └── components/              # CSS modules
│   ├── types/                       # Branded types
│   └── main.tsx                     # Dev entry point
├── tests/                           # Bun test files
├── docs/                            # Documentation
└── package.json                     # Already configured
```

### 1.2 Build Configuration Strategy

These below are few guidelines to follow; More details have to be worked out based on the specific code/feature that is being implemented; 

**Vite Configuration** (`vite.config.ts`):
```typescript
import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vite"
import path from "path"

export default defineConfig({
  plugins: [react()],
  build: {
    // Full tree-shaking configuration
    rollupOptions: {
      output: {
        manualChunks: {
          'tensorflow': ['@tensorflow/tfjs'],
          'dnd-kit': ['@dnd-kit/core', '@dnd-kit/utilities'],
          'framer-motion': ['framer-motion'],
          'use-gesture': ['@use-gesture/react']
        }
      }
    },
    // Ensure CSS is properly processed
    cssCodeSplit: true,
    // Generate sourcemaps for debugging
    sourcemap: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

**TypeScript Configuration** (Update `tsconfig.app.json`):
```typescript
{
  "compilerOptions": {
    // Existing config...

    // Additional strict options for branded types
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": false,
    "noUncheckedIndexedAccess": true,

    // Path mapping for clean imports
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"],
      "@/styles/*": ["./src/styles/*"]
    }
  }
}
```

## 2. Styling Strategy

### 2.1 CSS Architecture

**Tailwind + CSS Modules Integration**:
```css
/* src/styles/base.css */
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

/* Base affine styles with CSS custom properties for theming */
.affine-viewport {
  position: relative;
  overflow: hidden;
  touch-action: none;
  perspective: none;
  min-height: 200px;
  transform-style: flat;

  /* Theme variables */
  --affine-primary: theme('colors.blue.500');
  --affine-background: theme('colors.gray.50');
  --affine-border: theme('colors.gray.200');
}

/* Dark theme support */
@media (prefers-color-scheme: dark) {
  .affine-viewport {
    --affine-primary: theme('colors.blue.400');
    --affine-background: theme('colors.gray.900');
    --affine-border: theme('colors.gray.700');
  }
}
```

**CSS Modules for Components**:
```typescript
// src/styles/components/Item.module.css
.item {
  composes: affine-item from '../base.css';
  @apply transition-transform duration-200 ease-out;
}

.item--dragging {
  @apply opacity-50 scale-105;
}

.item--selected {
  @apply ring-2 ring-blue-500;
}
```

## 3. State Management Architecture

### 3.1 Valtio Integration Strategy

**Spatial State Management**:
```typescript
// src/lib/state/spatial-state.ts
import { proxy } from 'valtio'
import { subscribe } from 'valtio'

// Core spatial state
export interface SpatialState {
  viewport: {
    transform: Transform
    dimensions: { width: number; height: number }
  }
  spaces: Map<string, SpaceState>
  components: Map<string, ComponentState>
}

// Valtio proxy for reactive state
export const spatialState = proxy<SpatialState>({
  viewport: {
    transform: new Transform(),
    dimensions: { width: 0, height: 0 }
  },
  spaces: new Map(),
  components: new Map()
})

// Subscribe to state changes for CSS updates
export const subscribeToTransforms = (callback: (transforms: TransformUpdate[]) => void) => {
  return subscribe(spatialState, (ops) => {
    const transformOps = ops.filter(op =>
      op[1][0] === 'components' && op[2].includes('transform')
    )
    if (transformOps.length > 0) {
      callback(transformOps.map(op => ({
        id: op[1][1] as string,
        transform: op[1][2]
      })))
    }
  })
}
```

## 4. Component Architecture

### 4.1 Dual API Design

**React Component API**:
```typescript
// src/lib/components/react/Item.tsx
import React from 'react'
import { motion } from 'framer-motion'
import { useDraggable } from '@dnd-kit/core'
import styles from '@/styles/components/Item.module.css'

export interface ItemProps {
  children: React.ReactNode
  transform?: Transform
  interactive?: boolean
  className?: string
}

export const Item: React.FC<ItemProps> = ({
  children,
  transform = new Transform(),
  interactive = true,
  className = ''
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform: dragTransform,
    isDragging
  } = useDraggable({
    id: `item-${Math.random().toString(36).substr(2, 9)}`
  })

  return (
    <motion.div
      ref={setNodeRef}
      className={`${styles.item} ${isDragging ? styles.itemDragging : ''} ${className}`}
      style={{
        transform: `matrix(${transform.toCSSMatrix()})`,
        transformOrigin: '0 0'
      }}
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
      {...(interactive ? { ...listeners, ...attributes } : {})}
    >
      {children}
    </motion.div>
  )
}
```

**Imperative API** (Original tapspace compatibility):
```typescript
// src/lib/components/imperative/Item.ts
import { HTMLElementWrapper } from '@/lib/core/HTMLElementWrapper'

export class Item extends HTMLElementWrapper {
  constructor(element: HTMLElement) {
    super(element)
    this.addClass('affine-item')
  }

  // Original tapspace API methods
  tappable(options?: TapOptions): this {
    // Implementation using @use-gesture
    return this
  }

  draggable(options?: DragOptions): this {
    // Implementation using @dnd-kit
    return this
  }

  scalable(options?: ScaleOptions): this {
    // Implementation using @use-gesture pinch
    return this
  }

  // Transform methods
  translateBy(vector: Vector): this {
    this.transform = this.transform.translateBy(vector)
    this.updateElementTransform()
    return this
  }

  scaleBy(factor: number, origin?: Point): this {
    this.transform = this.transform.scaleBy(factor, origin)
    this.updateElementTransform()
    return this
  }

  rotateBy(angle: number, origin?: Point): this {
    this.transform = this.transform.rotateBy(angle, origin)
    this.updateElementTransform()
    return this
  }
}
```

## 5. Geometry Engine Architecture

### 5.1 TensorFlow.js Integration

**Core Geometry Classes**:
```typescript
// src/lib/geometry/core/Point.ts
import * as tf from '@tensorflow/tfjs'

export class Point implements GeometricPrimitive {
  readonly basis: Basis
  readonly coordinates: AffinePoint

  constructor(basis: Basis, coordinates: { x: number; y: number; z?: number }) {
    this.basis = basis
    this.coordinates = {
      x: coordinates.x as AffineX,
      y: coordinates.y as AffineY,
      z: (coordinates.z || 0) as AffineZ
    }
  }

  // Tensor-based transformation
  transformBy(transform: Transform): Point {
    const pointTensor = tf.tensor2d([[this.coordinates.x, this.coordinates.y, 1]])
    const transformMatrix = GeometryEngine.transformToMatrix(transform)

    const result = tf.matMul(pointTensor, transformMatrix)
    const [x, y] = result.dataSync()

    // Clean up tensors to prevent memory leaks
    pointTensor.dispose()
    transformMatrix.dispose()
    result.dispose()

    return new Point(this.basis, { x, y, z: 0 })
  }

  // Basis transformation
  changeBasis(newBasis: Basis): Point {
    const transform = Basis.getTransformBetween(this.basis, newBasis)
    return this.transformBy(transform)
  }
}
```

**Geometry Engine with Memory Management**:
```typescript
// src/lib/geometry/GeometryEngine.ts
import * as tf from '@tensorflow/tfjs'

export class GeometryEngine {
  private static tensorPool: Map<number, tf.Tensor[]> = new Map()

  static transformPoint(point: Point, transform: Transform): Point {
    const tensor = this.getTensorFromPool([3, 3])
    // ... transformation logic
    this.returnTensorToPool(tensor)
    return result
  }

  private static getTensorFromPool(shape: number[]): tf.Tensor {
    const key = shape.join(',')
    const pool = this.tensorPool.get(key) || []
    return pool.pop() || tf.zeros(shape)
  }

  private static returnTensorToPool(tensor: tf.Tensor): void {
    // Cleanup and return to pool for reuse
    tensor.dispose()
  }
}
```

## 6. Interaction System Architecture

### 6.1 @use-gesture Integration

**Custom Spatial Gesture Hook**:
```typescript
// src/lib/interactions/hooks/useSpatialGesture.ts
import { useGesture } from '@use-gesture/react'
import { useCallback } from 'react'

export const useSpatialGesture = (
  elementRef: React.RefObject<HTMLElement>,
  options: SpatialGestureOptions = {}
) => {
  const { transform, setTransform } = useTransformState()

  const gestureHandler = useCallback(({ event, ...gestureData }) => {
    const spatialTransform = screenToSpatialTransform(gestureData)
    setTransform(prev => prev.compose(spatialTransform))
  }, [setTransform])

  const bind = useGesture({
    onDrag: ({ delta: [dx, dy], first }) => {
      if (first) {
        // Initialize drag operation
      }

      const delta = new Vector(elementRef.current?.basis || new Basis(), { x: dx, y: dy })
      gestureHandler({ event: 'drag', delta })
    },

    onPinch: ({ offset: [scale], origin: [ox, oy] }) => {
      const origin = new Point(elementRef.current?.basis || new Basis(), { x: ox, y: oy })
      const scaleTransform = new Transform().scaleBy(scale, origin)
      gestureHandler({ event: 'pinch', transform: scaleTransform })
    },

    onWheel: ({ delta: [dx, dy] }) => {
      const zoomFactor = dy > 0 ? 0.9 : 1.1
      const zoomTransform = new Transform().scaleBy(zoomFactor)
      gestureHandler({ event: 'wheel', transform: zoomTransform })
    }
  }, {
    drag: {
      filterTaps: true,
      axisThreshold: 5
    },
    pinch: {
      scaleBounds: { min: 0.1, max: 10 },
      modifierKey: null
    }
  })

  return { bind, transform }
}
```

### 6.2 @dnd-kit Integration

**Spatial Drag and Drop Context**:
```typescript
// src/lib/interactions/SpatialDndContext.tsx
import React, { createContext, useContext } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'

interface SpatialDndContextType {
  activeId: string | null
  screenToSpatial: (screenPoint: { x: number; y: number }) => Point
  spatialToScreen: (spatialPoint: Point) => { x: number; y: number }
}

const SpatialDndContext = createContext<SpatialDndContextType | null>(null)

export const useSpatialDnd = () => {
  const context = useContext(SpatialDndContext)
  if (!context) {
    throw new Error('useSpatialDnd must be used within SpatialDndProvider')
  }
  return context
}

export const SpatialDndProvider: React.FC<SpatialDndProviderProps> = ({
  children,
  onDragEnd,
  onDragStart
}) => {
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id)
    onDragStart?.(event)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event

    // Convert screen delta to spatial coordinates
    const spatialDelta = screenToSpatialCoordinates(delta)

    onDragEnd?.(active.id, spatialDelta)
    setActiveId(null)
  }

  const contextValue: SpatialDndContextType = {
    activeId,
    screenToSpatial,
    spatialToScreen
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SpatialDndContext.Provider value={contextValue}>
        {children}
      </SpatialDndContext.Provider>
    </DndContext>
  )
}
```

## 7. Animation System Architecture

### 7.1 Framer Motion Integration

**Spatial Animation Hook**:
```typescript
// src/lib/animations/useSpatialAnimation.ts
import { useAnimation } from 'framer-motion'
import { useEffect } from 'react'

export const useSpatialAnimation = (transform: Transform) => {
  const controls = useAnimation()

  useEffect(() => {
    controls.start({
      x: transform.x,
      y: transform.y,
      scale: transform.scale,
      rotate: transform.rotation,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.8
      }
    })
  }, [transform, controls])

  return controls
}

// Animated spatial component
export const AnimatedItem: React.FC<AnimatedItemProps> = ({
  children,
  transform,
  ...props
}) => {
  const controls = useSpatialAnimation(transform)

  return (
    <motion.div
      animate={controls}
      className="affine-item"
      style={{
        transformOrigin: '0 0',
        backfaceVisibility: 'hidden'
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
```

## 8. Testing Strategy

### 8.1 Bun Test Framework Integration

**Test Structure**:
```typescript
// tests/unit/geometry/Point.test.ts
import { describe, test, expect } from 'bun:test'
import { Point } from '@/lib/geometry/Point'
import { Transform } from '@/lib/geometry/Transform'

describe('Point', () => {
  test('should transform correctly', () => {
    const basis = new Basis()
    const point = new Point(basis, { x: 10, y: 20 })
    const transform = new Transform().translateBy({ x: 5, y: 10 })

    const result = point.transformBy(transform)

    expect(result.coordinates.x).toBe(15)
    expect(result.coordinates.y).toBe(30)
  })

  test('should handle basis transformations', () => {
    const originalBasis = new Basis()
    const newBasis = new Basis().translateBy({ x: 100, y: 100 })
    const point = new Point(originalBasis, { x: 10, y: 20 })

    const result = point.changeBasis(newBasis)

    expect(result.coordinates.x).toBe(110)
    expect(result.coordinates.y).toBe(120)
  })
})
```

**Integration Tests**:
```typescript
// tests/integration/components/Item.integration.test.tsx
import { describe, test, expect } from 'bun:test'
import { render, screen } from 'bun:test'
import { Item } from '@/lib/components/react/Item'

describe('Item Component', () => {
  test('should render with correct transform', () => {
    const transform = new Transform().translateBy({ x: 100, y: 50 })

    render(
      <Item transform={transform}>
        <div>Test Content</div>
      </Item>
    )

    const item = screen.getByText('Test Content').parentElement
    expect(item).toHaveStyle({
      transform: 'matrix(1, 0, 0, 1, 100, 50)'
    })
  })

  test('should handle drag interactions', async () => {
    render(
      <SpatialDndProvider>
        <Item interactive={true}>Draggable Item</Item>
      </SpatialDndProvider>
    )

    // Test drag simulation would go here
  })
})
```

## 9. Implementation Phases

### Notes:
 - All interfaces should be prefixed with `I` (e.g. `interface ISpace`), and types should be prefixed with `T` (e.g. `type TPoint2D`);
 - base type-casting should be avoided as much as possible (e.g. do not do: `Number(a.x) > Number(a.y)`; instead just do `a.x > a.y` since the branded types can be directly operated as their base classes)
 - Use CSS Modules + Tailwind for component styling
 - **State Management**: create `useXYZ` hooks using valtio with `useSnapshot` on the store proxy; updating the store through proxy triggers reactive updates to the snapshot readers;
 - **Animation Preferences**: Animations should be dynamically on/off (default: ON) for better performance;
 - **Documentation**: Should be able to generate API documentation using TypeDoc
 - Start with the basic foundation and make sure to create "testable" code at each level/phase incrementally;

### Phase 1: Foundation (Week 1-2)

**Week 1: Type System and Core Types**
1. **Branded Types Implementation**
   ```typescript
   // src/types/affine.types.ts
   export type TAffineX = Branded<number, 'AffineX'>
   export type TAffineY = Branded<number, 'AffineY'>
   export type TAffineZ = Branded<number, 'AffineZ'>

   export interface IAffinePoint {
     x: TAffineX
     y: TAffineY
     z: TAffineZ
   }
   ```

2. **Core Interfaces**
   ```typescript
   // src/types/core.ts
   export interface ISpatialComponent {
     transform(): Transform
     transformBy(transform: Transform): this
     getBoundingBox(): Box
   }

   export interface IGeometricPrimitive {
     changeBasis(newBasis: Basis): this
     getRaw(): RawCoordinates
   }
   ```

**Week 2: Geometry Engine**
1. **Point and Vector Classes**
2. **Transform Class with TensorFlow.js**
3. **Basis Transformation System**

### Phase 2: React Components (Week 3-4)

**Week 3: Context Architecture**
1. **ViewportContext Implementation**
2. **SpaceContext Implementation**
3. **Transform State Management**

**Week 4: Core Components**
1. **Viewport React Component**
2. **Space React Component**
3. **Item React Component**

### Phase 3: Interaction System (Week 5-6)

**Week 5: Gesture System**
1. **@use-gesture Integration**
2. **Custom Spatial Gesture Hooks**
3. **Event Normalization**

**Week 6: Drag and Drop**
1. **@dnd-kit Integration**
2. **SpatialDndContext**
3. **Collision Detection**

### Phase 4: Animation and Polish (Week 7-8)

**Week 7: Animation System**
1. **Framer Motion Integration**
2. **Press Effects**
3. **Animation Queuing**

**Week 8: Styling and Themes**
1. **Tailwind Integration**
2. **CSS Modules Setup**
3. **Color Theme System**

## 10. Success Criteria

### 10.1 Functional Requirements

- ✅ **100% API compatibility** with original tapspace
- ✅ **React component API** for modern React applications
- ✅ **Imperative API** for vanilla JavaScript integration
- ✅ **CSS transform-based rendering** (no Canvas dependency)
- ✅ **Full tree-shaking support** for optimal bundle size

### 10.2 Performance Requirements

- ✅ **60fps animations** for complex interactions
- ✅ **Memory leak prevention** with proper tensor cleanup
- ✅ **Bundle size under 50KB** gzipped for core functionality
- ✅ **Sub-16ms component creation** time

### 10.3 Quality Requirements

- ✅ **Zero TypeScript errors** with strict mode enabled
- ✅ **90%+ test coverage** using Bun Test framework
- ✅ **Cross-browser compatibility** (Chrome, Firefox, Safari, Edge)
- ✅ **WCAG 2.1 AA accessibility** compliance

## 11. Export Strategy

**Dual Export Pattern**:
```typescript
// src/index.ts
// React Components API
export { Item, Space, Viewport } from './lib/components/react'

// Imperative API (Original tapspace compatibility)
export { Item as ItemClass, Space as SpaceClass, Viewport as ViewportClass } from './lib/components/imperative'

// Factory methods (Original API)
export const createItem = (element: HTMLElement) => new ItemClass(element)
export const createSpace = () => new SpaceClass()
export const createViewport = (element: HTMLElement) => new ViewportClass(element)

// Geometry API
export * from './lib/geometry'

// Utilities
export * from './lib/utils'
```

## 12. Development Workflow

### 12.1 Build Commands

```json
{
  "scripts": {
    "dev": "vite",
    "build": "bun run type-check && bun run lint && vite build",
    "type-check": "tsc --noEmit",
    "lint": "biome lint .",
    "format": "biome format --write .",
    "test": "bun test",
    "test:watch": "bun test --watch",
    "preview": "vite preview"
  }
}
```

### 12.2 Development Tools Setup

**VSCode Configuration** (`.vscode/settings.json`):
```json
{
  "typescript.preferences.importModuleSpecifier": "shortest",
  "typescript.suggest.autoImports": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "biomejs.biome",
  "files.associations": {
    "*.css": "css",
    "*.module.css": "css"
  }
}
```

## 13. Deployment Strategy

### 13.1 NPM Package Structure

**Package Exports**:
```typescript
// package.json exports field
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./geometry": {
      "types": "./dist/lib/geometry/index.d.ts",
      "import": "./dist/lib/geometry/index.js"
    },
    "./components": {
      "types": "./dist/lib/components/index.d.ts",
      "import": "./dist/lib/components/index.js"
    },
    "./styles": "./dist/styles/tapspace.css"
  }
}
```

### 13.2 Distribution Files

- **ES Modules** (`dist/index.js`) - Modern bundler support
- **TypeScript Definitions** (`dist/index.d.ts`) - Full type support
- **CSS Styles** (`dist/styles/tapspace.css`) - Affine transform styles
- **Source Maps** - Debugging support

## 14. Migration Guide

### 14.1 From Original Tapspace

```typescript
// Original tapspace
const viewport = tapspace.createViewport(container)
const space = tapspace.createSpace()
const item = tapspace.createItem(element)

item.draggable().tappable()

// New React/TypeScript version
import { createViewport, createSpace, createItem } from 'tapspace'

const viewport = createViewport(container)
const space = createSpace()
const item = createItem(element)

item.draggable().tappable()
```

### 14.2 React Component Usage

```typescript
// React component API
import { Viewport, Space, Item } from 'tapspace'

function MyComponent() {
  return (
    <Viewport style={{ width: '100%', height: '400px' }}>
      <Space>
        <Item interactive>
          <div>Interactive Content</div>
        </Item>
      </Space>
    </Viewport>
  )
}
```

