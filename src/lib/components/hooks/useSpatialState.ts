import { useSnapshot } from "valtio";
import {
	elementActions,
	spaceActions,
	store,
	viewportActions,
} from "../../state/store";

/**
 * Hook to access the Valtio spatial state with automatic reactivity
 * WARNING: This subscribes to the entire store and should be used sparingly
 * Consider using the more specific hooks below for better performance
 */
export const useSpatialState = () => {
	return useSnapshot(store);
};

/**
 * Hook to access and manage spaces
 */
export const useSpaces = () => {
	// Only subscribe to spaces and activeSpace, not the entire store
	const { spaces, activeSpace } = useSnapshot(store);

	return {
		spaces,
		activeSpace,
		createSpace: spaceActions.createSpace,
		removeSpace: spaceActions.removeSpace,
		setActiveSpace: spaceActions.setActiveSpace,
	};
};

/**
 * Hook to access and manage viewports
 */
export const useViewports = () => {
	// Only subscribe to viewports and activeViewport, not the entire store
	const { viewports, activeViewport } = useSnapshot(store);

	return {
		viewports,
		activeViewport,
		createViewport: viewportActions.createViewport,
		removeViewport: viewportActions.removeViewport,
		setActiveViewport: viewportActions.setActiveViewport,
	};
};

/**
 * Hook to access and manage elements
 */
export const useElements = () => {
	// Only subscribe to elements, not the entire store
	const { elements } = useSnapshot(store);

	return {
		elements,
		createElement: elementActions.createElement,
		removeElement: elementActions.removeElement,
		updateElementTransform: elementActions.updateElementTransform,
	};
};

/**
 * Hook to access the active space with its elements
 */
export const useActiveSpace = () => {
	const { spaces, activeSpace } = useSpaces();
	const activeSpaceData = activeSpace ? spaces.get(activeSpace) : null;

	return {
		activeSpace: activeSpaceData,
		elements: activeSpaceData?.elements || new Map(),
	};
};

/**
 * Hook to access the active viewport
 */
export const useActiveViewport = () => {
	const { viewports, activeViewport } = useViewports();
	const activeViewportData = activeViewport
		? viewports.get(activeViewport)
		: null;

	return {
		activeViewport: activeViewportData,
	};
};
