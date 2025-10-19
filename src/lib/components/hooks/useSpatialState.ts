import { useSnapshot } from "valtio";
import {
	elementActions,
	spaceActions,
	store,
	viewportActions,
} from "../../state/store";

/**
 * Hook to access the Valtio spatial state with automatic reactivity
 */
export const useSpatialState = () => {
	return useSnapshot(store);
};

/**
 * Hook to access and manage spaces
 */
export const useSpaces = () => {
	const state = useSpatialState();

	return {
		spaces: state.spaces,
		activeSpace: state.activeSpace,
		createSpace: spaceActions.createSpace,
		removeSpace: spaceActions.removeSpace,
		setActiveSpace: spaceActions.setActiveSpace,
	};
};

/**
 * Hook to access and manage viewports
 */
export const useViewports = () => {
	const state = useSpatialState();

	return {
		viewports: state.viewports,
		activeViewport: state.activeViewport,
		createViewport: viewportActions.createViewport,
		removeViewport: viewportActions.removeViewport,
		setActiveViewport: viewportActions.setActiveViewport,
	};
};

/**
 * Hook to access and manage elements
 */
export const useElements = () => {
	const state = useSpatialState();

	return {
		elements: state.elements,
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
