/**
 * React components for the tapspace coordinate system
 * Provides interactive 2D spaces with affine transformations
 */

// Context and providers
export { SpatialProvider, useSpatialContext } from "../context/SpatialContext";
// Re-export hooks for convenience
export * from "./hooks";
// Valtio store integration hooks
export {
	useActiveSpace,
	useActiveViewport,
	useElements,
	useSpaces,
	useSpatialState,
	useViewports,
} from "./hooks/useSpatialState";
export { useViewportIntegration } from "./hooks/useViewportIntegration";
export { Item } from "./Item.tsx";
export { Space } from "./Space.tsx";
// Core React components
export { Viewport } from "./Viewport.tsx";
export { ViewportControls } from "./ViewportControls.tsx";
