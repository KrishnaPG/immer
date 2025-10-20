/**
 * Tapspace React/TypeScript Library
 * Modern 2D coordinate system with affine transformations
 */

// Hierarchical example
export { default as HierarchicalNetworkExample } from "./examples/hierarchical";
// Legacy exports
export * from "./lib/components";
// Hierarchical components
export * from "./lib/components/HierarchicalViewport";
// React Components API
export { Item, Space, Viewport } from "./lib/components/react";
export { Arc } from "./lib/components/react/Arc";
export { CustomControl } from "./lib/components/react/CustomControl";
export { Edge } from "./lib/components/react/Edge";
export * from "./lib/components/react/HierarchicalNode";
export { Node } from "./lib/components/react/Node";
export { ZoomControl } from "./lib/components/react/ZoomControl";
export * from "./lib/geometry/aabb";
export { Basis } from "./lib/geometry/Basis";
// Geometry API
export { Box } from "./lib/geometry/Box";
export { Circle } from "./lib/geometry/Circle";
// Hierarchical geometry
export * from "./lib/geometry/hierarchical-layout";
export * from "./lib/geometry/matrix";
export * from "./lib/geometry/transform";
export * from "./lib/geometry/utils";
// Geometry engine (TensorFlow.js powered)
export * from "./lib/geometry/vector";
// Hierarchical hooks
export * from "./lib/hooks/useHierarchical";
// State management (Valtio)
export * from "./lib/state/";
// Styles
export * from "./styles/base.css";
// Core types and interfaces
export * from "./types/branded.types";
export * from "./types/core.interfaces";
// Hierarchical types
export type {
	IHierarchicalNavigation,
	IHierarchicalNode,
	ITreeLayoutConfig,
	ITreeLayoutResult,
	IZoomToNodeConfig,
} from "./types/hierarchical.interfaces";

// Factory functions for imperative API (original tapspace compatibility)
import {
	elementActions,
	spaceActions,
	viewportActions,
} from "./lib/state/store";
import type { TElementId, TSpaceId, TViewportId } from "./types/branded.types";

/**
 * Create a new space (imperative API)
 */
export function createSpace(id?: TSpaceId): ISpace {
	const spaceId =
		id ||
		(`space_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as TSpaceId);
	return spaceActions.createSpace(spaceId);
}

/**
 * Create a new viewport (imperative API)
 */
export function createViewport(
	space: ISpace,
	container: HTMLElement,
	id?: TViewportId,
): IViewport {
	const viewportId =
		id ||
		(`viewport_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as TViewportId);
	return viewportActions.createViewport(viewportId, space.id, container);
}

/**
 * Create a new element (imperative API)
 */
export function createElement(space: ISpace, id?: TElementId): IElement {
	const elementId =
		id ||
		(`element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as TElementId);
	return elementActions.createElement(elementId, space.id);
}

// Re-export commonly used types for convenience
export type {
	TAffineTransform,
	TAngle,
	TCoordinate,
	TDistance,
	TElementId,
	THeight,
	TScale,
	TSpaceId,
	TViewportId,
	TWidth,
} from "./types/branded.types";

export type {
	IAABB,
	IElement,
	IPoint2D,
	ISize2D,
	ISpace,
	ITapspaceConfig,
	ITapspaceInstance,
	IVector2D,
	IViewport,
} from "./types/core.interfaces";

// Import types for use in factory functions
import type { IElement, ISpace, IViewport } from "./types/core.interfaces";
