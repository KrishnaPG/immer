import { useSnapshot } from "valtio";
import type { TElementId, TSpaceId, TViewportId } from "@/types/branded.types";
import { store, storeGetters } from "../state";

/**
 * Hook for accessing spatial state data
 * Provides access to spaces, elements, and viewports from the global store
 */
export function useSpatialState() {
	// Only subscribe to the specific parts of the store we need
	const { spaces, elements, viewports, activeSpace, activeViewport } = useSnapshot(store);

	return {
		// Spaces
		spaces,
		useSpace: (id: string) => spaces.get(id as TSpaceId),
		hasSpace: (id: string) => spaces.has(id as TSpaceId),

		// Elements
		elements,
		useElement: (id: string) => elements.get(id as TElementId),
		hasElement: (id: string) => elements.has(id as TElementId),

		// Viewports
		viewports,
		useViewport: (id: string) => viewports.get(id as TViewportId),
		hasViewport: (id: string) => viewports.has(id as TViewportId),

		// Active entities
		activeSpace,
		activeViewport,
	};
}

/**
 * Hook for accessing active space
 */
export function useActiveSpace() {
	// Only subscribe to activeSpace, not the entire store
	const activeSpace = useSnapshot(store).activeSpace;
	// Use non-reactive getter for the space data since we only need it once
	const space = activeSpace ? storeGetters.getSpace(activeSpace) : null;
	return activeSpace ? space : null;
}

/**
 * Hook for accessing active viewport
 */
export function useActiveViewport() {
	// Only subscribe to activeViewport, not the entire store
	const activeViewport = useSnapshot(store).activeViewport;
	// Use non-reactive getter for the viewport data since we only need it once
	const viewport = activeViewport ? storeGetters.getViewport(activeViewport) : null;
	return activeViewport ? viewport : null;
}

/**
 * Hook for accessing all spaces
 */
export function useSpaces() {
	// Only subscribe to spaces, not the entire store
	return useSnapshot(store).spaces;
}

/**
 * Hook for accessing all elements
 */
export function useElements() {
	// Only subscribe to elements, not the entire store
	return useSnapshot(store).elements;
}

/**
 * Hook for accessing all viewports
 */
export function useViewports() {
	// Only subscribe to viewports, not the entire store
	return useSnapshot(store).viewports;
}
