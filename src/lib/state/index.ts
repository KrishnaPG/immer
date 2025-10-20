/**
 * Consolidated state management exports
 * This file brings together all state-related functionality in one logical location
 */

export * from "./hierarchical-store";
// Export hierarchical store proxy utilities
export { hierarchicalStoreGetters } from "./hierarchical-store";
// Re-export types for convenience
export type { ImmerStore } from "./store";
// Main store with all actions
export {
	elementActions,
	spaceActions,
	store,
	storeGetters,
	viewportActions,
} from "./store";
