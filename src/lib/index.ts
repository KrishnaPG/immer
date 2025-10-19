/**
 * Tapspace.js - TypeScript Implementation
 *
 * A powerful library for creating interactive 2D and 3D spaces in web browsers.
 * This implementation provides a type-safe, modern alternative to the original
 * tapspace library with full TypeScript support and branded types for enhanced
 * type safety.
 *
 * @example
 * ```typescript
 * import { Space, Viewport, Point, Vector } from 'tapspace';
 *
 * // Create a new space
 * const space = new Space(document.getElementById('mySpace'));
 *
 * // Create a viewport to view the space
 * const viewport = new Viewport(document.getElementById('myViewport'));
 * viewport.setSpace(space);
 *
 * // Add content to the space
 * const item = space.createItem();
 * item.setPosition(new Point(space, { x: 100, y: 100 }));
 * item.setSize(new Size(space, { w: 200, h: 150 }));
 * ```
 */

// Component module - interactive UI components
export * from "./components";
// Effects module - animations and transitions
export * from "./effects";
// Geometry module - immutable geometric objects
export * from "./geometry";

// Interaction module - gesture and event handling
export * from "./interaction";
// Loaders module - resource loading utilities
export * from "./loaders";
// Metrics module - measurement and analysis tools
export * from "./metrics";
// Core exports - main library components
export * from "./types";

// Version information
export const version = "1.0.0";

// Library metadata
export const name = "tapspace";
export const description = "Interactive 2D and 3D spaces for web browsers";

// Utility functions for common operations
export * from "./utils";

// Global styles - CSS required for tapspace components
import "./styles/tapspace.css";

// Default export for convenience
export default {
	version,
	name,
	description,
	// Main modules
	geometry: () => import("./geometry"),
	components: () => import("./components"),
	interaction: () => import("./interaction"),
	effects: () => import("./effects"),
	loaders: () => import("./loaders"),
	metrics: () => import("./metrics"),
	// Utilities
	utils: () => import("./utils"),
};
