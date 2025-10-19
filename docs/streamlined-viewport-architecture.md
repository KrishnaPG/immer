# Streamlined Viewport Architecture Plan

## Current Issues

1. **Code Duplication**: 
   - `ImmerStore` in `store.ts` has `viewports` and `activeViewport`
   - `UnifiedViewportState` in `viewportState.ts` has the same properties plus component state
   - Both have similar viewport operations (create, remove, activate)

2. **Scattered Viewport Logic**:
   - Viewport data is duplicated across two stores
   - Operations are split between main store and viewport state
   - Component state is separated from data state

## Streamlined Strategy

### Phase 1: Enhance Main Store
Add component state properties to `ImmerStore` to eliminate duplication:
- Add `viewportBasis`, `isPanning`, `lastPanPoint` to `ImmerStore`
- Move all viewport operations to main store actions

### Phase 2: Remove Redundant Files
- Remove `viewportState.ts` (consolidated into main store)
- Remove `viewportStore.ts` (already consolidated)
- Update all imports to use main store only

### Phase 3: Simplify Hooks
- Update `useViewport` to use main store directly
- Remove `useViewportStore` (no longer needed)
- Simplify entity base hook

## Implementation Steps

### Step 1: Enhanced ImmerStore
```typescript
export interface ImmerStore {
  // Existing properties
  spaces: Map<TSpaceId, ISpace>;
  elements: Map<TElementId, IElement>;
  activeSpace: TSpaceId | null;
  isInitialized: boolean;
  
  // Viewport properties (enhanced)
  viewports: Map<TViewportId, IViewport>;
  activeViewport: TViewportId | null;
  
  // Component state (added to eliminate duplication)
  viewportBasis: Basis;
  isPanning: boolean;
  lastPanPoint: { x: number; y: number };
}
```

### Step 2: Enhanced Viewport Actions
Move all viewport operations to main store actions:
```typescript
export const viewportActions = {
  // Data operations
  createViewport: (id: TViewportId, spaceId: TSpaceId, container: HTMLElement) => IViewport;
  removeViewport: (id: TViewportId) => void;
  setActiveViewport: (id: TViewportId) => void;
  getViewport: (id: TViewportId) => IViewport | undefined;
  
  // Component state operations
  setViewportBasis: (basis: Basis) => void;
  setIsPanning: (isPanning: boolean) => void;
  setLastPanPoint: (point: { x: number; y: number }) => void;
  
  // Transform operations
  panViewport: (deltaX: number, deltaY: number) => void;
  zoomViewport: (zoomFactor: number) => void;
  translateViewport: (deltaX: number, deltaY: number) => void;
  resetViewport: () => void;
};
```

### Step 3: Simplified Store Structure
```typescript
export const store = proxy<ImmerStore>({
  spaces: new Map(),
  elements: new Map(),
  viewports: new Map(),
  activeSpace: null,
  activeViewport: null,
  isInitialized: false,
  viewportBasis: new Basis(),
  isPanning: false,
  lastPanPoint: { x: 0, y: 0 },
});
```

### Step 4: Updated Hooks
- `useViewport` hook uses main store directly
- `useEntityBase` hook uses main store viewport actions
- Remove `useViewportStore` hook

## Benefits

1. **Eliminated Duplication**: Single source of truth for viewport state
2. **Simplified Architecture**: One store instead of multiple
3. **Better Performance**: No duplicate state management
4. **Easier Maintenance**: Single place to modify viewport logic
5. **Cleaner API**: Consistent viewport operations

## Files to Modify

1. **Update**: `vite-project/src/lib/state/store.ts` (enhanced with viewport component state)
2. **Remove**: `vite-project/src/lib/state/viewportState.ts` (consolidated)
3. **Remove**: `vite-project/src/lib/state/viewportStore.ts` (consolidated)
4. **Update**: `vite-project/src/lib/state/index.ts` (simplified exports)
5. **Update**: `vite-project/src/lib/components/hooks/useViewport.ts` (simplified)
6. **Update**: `vite-project/src/lib/hooks/useEntityBase.ts` (use main store)
7. **Update**: Any other files using viewport state

## Migration Path

1. Add component state to main store
2. Move viewport operations to main store actions
3. Update all imports to use main store
4. Remove redundant files
5. Test functionality

This approach will completely eliminate the code duplication and provide a clean, streamlined viewport architecture.