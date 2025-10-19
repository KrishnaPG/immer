/**
 * Tapspace React/TypeScript Library
 * Modern 2D coordinate system with affine transformations
 */

// React components and hooks
export * from "./lib/components";
export * from "./lib/geometry/aabb";
export * from "./lib/geometry/matrix";
export * from "./lib/geometry/transform";
export * from "./lib/geometry/utils";
// Geometry engine (TensorFlow.js powered)
export * from "./lib/geometry/vector";
// State management (Valtio)
export * from "./lib/state/store";
// Styles
export * from "./styles/base.css";
// Core types and interfaces
export * from "./types/branded.types";
export * from "./types/core.interfaces";

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
