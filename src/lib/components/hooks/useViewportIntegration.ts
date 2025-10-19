import { useEffect, useRef } from "react";
import type { Viewport as ViewportClass } from "../../imperative/Viewport";
import { useActiveViewport, useSpatialState } from "./useSpatialState";

/**
 * Hook to integrate a Viewport component with the Valtio store
 */
export const useViewportIntegration = (
	viewportRef: React.RefObject<ViewportClass>,
) => {
	const { activeViewport } = useActiveViewport();
	const viewportInstance = viewportRef.current;

	useEffect(() => {
		if (viewportInstance && activeViewport) {
			// Sync viewport dimensions with store
			const updateDimensions = () => {
				const rect = viewportInstance.element.getBoundingClientRect();
				// The store would need a method to update viewport dimensions
				// This is a placeholder for the actual implementation
			};

			updateDimensions();

			// Listen for viewport resize events
			const handleResize = () => updateDimensions();
			viewportInstance.element.addEventListener("resize", handleResize);

			return () => {
				viewportInstance.element.removeEventListener("resize", handleResize);
			};
		}
	}, [viewportInstance, activeViewport]);

	return {
		isConnected: !!viewportInstance && !!activeViewport,
		viewport: viewportInstance,
		storeViewport: activeViewport,
	};
};
