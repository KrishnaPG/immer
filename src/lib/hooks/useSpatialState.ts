import { useSnapshot } from "valtio";
import type { TElementId, TSpaceId, TViewportId } from "@/types/branded.types";
import { store } from "../state";

/**
 * Hook for accessing spatial state data
 * Provides access to spaces, elements, and viewports from the global store
 */
export function useSpatialState() {
	const snapshot = useSnapshot(store);

	return {
		// Spaces
		spaces: snapshot.spaces,
		useSpace: (id: string) => snapshot.spaces.get(id as TSpaceId),
		hasSpace: (id: string) => snapshot.spaces.has(id as TSpaceId),
		spaceIds: Array.from(snapshot.spaces.keys()),

		// Elements
		elements: snapshot.elements,
		useElement: (id: string) => snapshot.elements.get(id as TElementId),
		hasElement: (id: string) => snapshot.elements.has(id as TElementId),
		elementIds: Array.from(snapshot.elements.keys()),

		// Viewports
		viewports: snapshot.viewports,
		useViewport: (id: string) => snapshot.viewports.get(id as TViewportId),
		hasViewport: (id: string) => snapshot.viewports.has(id as TViewportId),
		viewportIds: Array.from(snapshot.viewports.keys()),

		// Active entities
		activeSpace: snapshot.activeSpace,
		activeViewport: snapshot.activeViewport,
	};
}

/**
 * Hook for accessing active space
 */
export function useActiveSpace() {
	const { activeSpace, useSpace } = useSpatialState();
	const space = useSpace(activeSpace || "");
	return activeSpace ? space : null;
}

/**
 * Hook for accessing active viewport
 */
export function useActiveViewport() {
	const { activeViewport, useViewport } = useSpatialState();
	const viewport = useViewport(activeViewport || "");
	return activeViewport ? viewport : null;
}

/**
 * Hook for accessing all spaces
 */
export function useSpaces() {
	const { spaces } = useSpatialState();
	return spaces;
}

/**
 * Hook for accessing all elements
 */
export function useElements() {
	const { elements } = useSpatialState();
	return elements;
}

/**
 * Hook for accessing all viewports
 */
export function useViewports() {
	const { viewports } = useSpatialState();
	return viewports;
}
