# Viewport State Consolidation Plan

## Current Issues

1. **Duplicate Viewport State Management**: 
   - `viewportActions` in `store.ts` manages viewport creation/removal/activation
   - `viewportStore.ts` manages viewport component state (panning, zooming, etc.)
   - `viewportState.ts` was created but doesn't include the main viewport actions

2. **Scattered Viewport Logic**:
   - Viewport data is stored in the main store's `viewports` Map
   - Component state is managed separately in viewport stores
   - Operations are split across multiple files

## Consolidation Strategy

### Phase 1: Consolidate Viewport Actions
Move `viewportActions` from `store.ts` to `viewportState.ts` and create a unified viewport management system.

### Phase 2: Update Dependencies
- Update `useViewport` hook to use consolidated viewport state
- Update `Viewport` component to use new unified approach
- Remove old `viewportStore.ts` file

### Phase 3: Clean Up Architecture
- Remove duplicate code
- Ensure consistent API patterns
- Update all imports

## Implementation Steps

### Step 1: Enhanced Viewport State
Create a comprehensive viewport state that includes:
- Viewport data (ID, space, camera, container)
- Component state (panning, zooming, basis)
- Viewport operations (create, remove, activate, pan, zoom, etc.)

### Step 2: Unified Viewport Management
Consolidate all viewport-related operations into a single interface:
- `createViewport`: Create new viewport with space and container
- `removeViewport`: Remove viewport and clean up
- `setActiveViewport`: Set active viewport
- `panViewport`, `zoomViewport`, `translateViewport`: Transform operations
- `resetViewport`: Reset to initial state

### Step 3: Update Hooks and Components
- Refactor `useViewport` to use unified state
- Update `Viewport` component to use consolidated approach
- Ensure backward compatibility

## Benefits

1. **Eliminated Duplicate Code**: No more scattered viewport operations
2. **Improved Organization**: All viewport state in one logical location
3. **Consistent API**: Single interface for all viewport operations
4. **Better Maintainability**: Easier to understand and modify viewport logic
5. **Reduced Complexity**: Fewer files and dependencies to manage

## Files to Modify

1. **Create**: `vite-project/src/lib/state/viewportState.ts` (enhanced)
2. **Update**: `vite-project/src/lib/state/store.ts` (remove viewportActions)
3. **Update**: `vite-project/src/lib/state/index.ts` (update exports)
4. **Update**: `vite-project/src/lib/components/hooks/useViewport.ts` (use unified state)
5. **Remove**: `vite-project/src/lib/state/viewportStore.ts` (consolidated into viewportState)
6. **Update**: `vite-project/src/lib/components/Viewport.tsx` (if needed)

## API Design

### Unified Viewport State Interface
```typescript
export interface UnifiedViewportState {
  // Viewport data
  viewports: Map<TViewportId, IViewport>;
  activeViewport: TViewportId | null;
  
  // Component state
  viewportBasis: Basis;
  isPanning: boolean;
  lastPanPoint: { x: number; y: number };
  
  // Operations
  createViewport: (id: TViewportId, spaceId: TSpaceId, container: HTMLElement) => IViewport;
  removeViewport: (id: TViewportId) => void;
  setActiveViewport: (id: TViewportId) => void;
  panViewport: (id: TViewportId, deltaX: number, deltaY: number) => void;
  zoomViewport: (id: TViewportId, zoomFactor: number) => void;
  translateViewport: (id: TViewportId, deltaX: number, deltaY: number) => void;
  resetViewport: (id: TViewportId) => void;
}
```

This consolidation will address the user's concerns about confusing scattered state management and eliminate duplicate code.