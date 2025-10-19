/**
 * Consolidated state management exports
 * This file brings together all state-related functionality in one logical location
 */

// Re-export types for convenience
export type { ImmerStore } from "./store";
// Main store with all actions
export {
	elementActions,
	spaceActions,
	store,
	viewportActions,
} from "./store";
