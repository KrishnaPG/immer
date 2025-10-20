import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSnapshot } from "valtio";
import { Basis } from "@/lib/geometry/Basis";
import { useTreeLayout } from "@/lib/geometry/hierarchical-layout";
import { AffineTransform } from "@/lib/geometry/transform";
import { Vector2D } from "@/lib/geometry/vector";
import { useEntityBase } from "@/lib/hooks/useEntityBase";
import { useSpatialState } from "@/lib/hooks/useSpatialState";
import {
	hierarchicalActions,
	hierarchicalStore,
	hierarchicalStoreGetters,
} from "@/lib/state/hierarchical-store";
import type {
	TAngle,
	TCoordinateX,
	TCoordinateY,
	TElementId,
	TScale,
	TSpaceId,
	TViewportId,
} from "@/types/branded.types";
import type { ICamera, IViewport } from "@/types/core.interfaces";
import type { IZoomToNodeConfig } from "@/types/hierarchical.interfaces";

export interface UseViewportReturn {
	// Common properties
	viewport?: IViewport;
	basis: Basis;
	camera?: ICamera;

	// Basic viewport state
	isPanning: boolean;
	lastPanPoint: { x: number; y: number };

	// Hierarchical viewport state
	transform?: AffineTransform;
	isAnimating?: boolean;
	animationProgress?: number;
	containerSize?: { width: number; height: number };
	nodes?: any[];
	isEnabled?: boolean;
	navigation?: {
		focusedNode?: TElementId;
		breadcrumbTrail: TElementId[];
		canGoBack: boolean;
		canGoForward: boolean;
	};
	layout?: any;

	// Actions
	updateCamera: (updates: Partial<unknown>) => void;
	setIsPanning: (isPanning: boolean) => void;
	setLastPanPoint: (point: { x: number; y: number }) => void;
	panViewport: (deltaX: number, deltaY: number) => void;
	zoomViewport: (zoomFactor: number) => void;
	resetViewport: () => void;

	// Hierarchical actions
	zoomToNode?: (
		nodeId: TElementId,
		config?: Partial<IZoomToNodeConfig>,
	) => Promise<void>;
	focusNode?: (nodeId: TElementId) => void;
	getCurrentTransform?: () => AffineTransform | null;
	handleNodeClick?: (nodeId: TElementId) => void;
	updateContainerSize?: (width: number, height: number) => void;
	zoomBy?: (factor: number) => void;
	panBy?: (deltaX: number, deltaY: number) => void;
	navigateBack?: () => void;
	navigateForward?: () => void;

	// Store access
	viewportStore: any;
}

export const useViewport = (
	id?: string,
	hierarchical = false,
): UseViewportReturn => {
	// Basic viewport setup
	const {
		entity: viewport,
		id: viewportId,
		exists,
	} = useEntityBase({
		id,
		entityType: "viewport",
	});

	// Use spatial state for accessing viewport data
	const { useViewport: getViewport } = useSpatialState();
	const viewportData = getViewport(viewportId);

	// Component state for this viewport
	const [isPanning, setIsPanning] = useState(false);
	const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

	// Create basis from camera transform
	const basis = useMemo(() => {
		if (viewportData) {
			const camera = viewportData.camera;
			const identityBasis = new Basis(AffineTransform.identity());
			const translationVector = new Vector2D(identityBasis, {
				x: -(camera.position.x as number),
				y: -(camera.position.y as number),
			});
			const translateTransform = AffineTransform.translateBy(translationVector);
			const scaleTransform = AffineTransform.scaleBy(camera.zoom as number);
			const transformMatrix = translateTransform.compose(scaleTransform);
			return new Basis(transformMatrix);
		}
		return new Basis(AffineTransform.identity());
	}, [viewportData]);

	// Camera update function
	const updateCamera = useMemo(
		() => (updates: Partial<unknown>) => {
			if (viewportData) {
				Object.assign(viewportData.camera, updates);
			}
		},
		[viewportData],
	);

	// Basic viewport interaction functions
	const panViewport = useMemo(
		() => (deltaX: number, deltaY: number) => {
			if (viewportData) {
				const translation = new Vector2D(basis, {
					x: deltaX,
					y: deltaY,
				});
				const newTransform = AffineTransform.translateBy(translation);
				// Update camera position using proper branded types
				viewportData.camera.position = {
					x: (viewportData.camera.position.x - deltaX) as TCoordinateX,
					y: (viewportData.camera.position.y - deltaY) as TCoordinateY,
					tensor: viewportData.camera.position.tensor,
				};
			}
		},
		[viewportData, basis],
	);

	const zoomViewport = useMemo(
		() => (zoomFactor: number) => {
			if (viewportData) {
				const scaleTransform = AffineTransform.scaleBy(zoomFactor);
				const newTransform = basis.transform.compose(scaleTransform);
				// Create new basis with updated transform
				const newBasis = new Basis(newTransform);
				// Update camera zoom using proper branded types
				viewportData.camera.zoom = (viewportData.camera.zoom *
					zoomFactor) as TScale;
			}
		},
		[viewportData, basis],
	);

	const resetViewport = useMemo(
		() => () => {
			if (viewportData) {
				// Reset camera using proper branded types
				viewportData.camera.position = {
					x: 0 as TCoordinateX,
					y: 0 as TCoordinateY,
					tensor: viewportData.camera.position.tensor,
				};
				viewportData.camera.rotation = 0 as TAngle;
				viewportData.camera.zoom = 1 as TScale;
				setIsPanning(false);
				setLastPanPoint({ x: 0, y: 0 });
			}
		},
		[viewportData],
	);

	// Basic viewport return object
	const basicViewportReturn = {
		viewport: viewportData,
		basis,
		camera: viewportData?.camera,
		updateCamera,
		isPanning,
		lastPanPoint,
		setIsPanning,
		setLastPanPoint,
		panViewport,
		zoomViewport,
		resetViewport,
		viewportStore: {
			store: {
				setViewportBasis: () => {},
				snapshot: { isPanning, lastPanPoint },
			},
		},
	};

	// Hierarchical viewport setup (always call hooks to avoid conditional hook errors)
	// Only subscribe to the specific parts of the store we need
	const hierarchicalSnapshot = useSnapshot(hierarchicalStore);
	const { isEnabled, navigation, viewport: hierarchicalViewport } = hierarchicalSnapshot;
	const { layout } = useTreeLayout();
	const animationFrameRef = useRef<number | undefined>(undefined);

	/**
	 * Start animation to node using direct store mutations
	 * Bypasses React render loop for performance
	 */
	const zoomToNode = useCallback(
		async (
			nodeId: TElementId,
			config?: Partial<IZoomToNodeConfig>,
		): Promise<void> => {
			// Start animation directly in store
			hierarchicalActions.viewport.startAnimationDirect(nodeId, config);

			// Use requestAnimationFrame for smooth animation
			const animate = (timestamp: number) => {
				// Use non-reactive getter to avoid unnecessary subscriptions during animation
				const animation = hierarchicalStoreGetters.getAnimationState();
				if (!animation.isAnimating) return;

				const elapsed = timestamp - animation.startTime;
				const progress = Math.min(elapsed / animation.duration, 1);

				// Apply easing
				const easedProgress = easeOutCubic(progress);

				// Update animation progress directly in store
				hierarchicalActions.viewport.updateAnimationProgress(easedProgress);

				// Continue animation if not complete
				if (progress < 1) {
					animationFrameRef.current = requestAnimationFrame(animate);
				}
			};

			// Start animation loop
			animationFrameRef.current = requestAnimationFrame(animate);
		},
		[],
	);

	/**
	 * Focus on node (simpler version)
	 */
	const focusNode = useCallback(
		(nodeId: TElementId): void => {
			hierarchicalActions.focusNode(nodeId);
			zoomToNode(nodeId);
		},
		[zoomToNode],
	);

	/**
	 * Reset view to initial state
	 */
	const resetHierarchicalView = useCallback(async (): Promise<void> => {
		// Cancel any ongoing animation
		if (animationFrameRef.current) {
			cancelAnimationFrame(animationFrameRef.current);
		}

		// Reset directly in store
		hierarchicalActions.viewport.resetViewport();
	}, []);

	/**
	 * Get current transform
	 */
	const getCurrentTransform = useCallback((): AffineTransform | null => {
		return hierarchicalStoreGetters.getViewportTransform();
	}, []);

	/**
	 * Handle node click from hierarchical interactions
	 */
	const handleNodeClick = useCallback(
		(nodeId: TElementId): void => {
			if (isEnabled) {
				zoomToNode(nodeId);
			}
		},
		[isEnabled, zoomToNode],
	);

	/**
	 * Update container size in store
	 */
	const updateContainerSize = useCallback(
		(width: number, height: number): void => {
			hierarchicalActions.viewport.updateContainerSize(width, height);
		},
		[],
	);

	/**
	 * Zoom by factor
	 */
	const zoomBy = useCallback((factor: number): void => {
		hierarchicalActions.viewport.zoomBy(factor);
	}, []);

	/**
	 * Pan by delta
	 */
	const panBy = useCallback((deltaX: number, deltaY: number): void => {
		hierarchicalActions.viewport.panBy(deltaX, deltaY);
	}, []);

	/**
	 * Auto-focus on navigation changes
	 */
	useEffect(() => {
		if (isEnabled && navigation.focusedNode) {
			zoomToNode(navigation.focusedNode);
		}
	}, [navigation.focusedNode, isEnabled, zoomToNode]);

	/**
	 * Cleanup animation on unmount
	 */
	useEffect(() => {
		return () => {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}
		};
	}, []);

	// Return consolidated state and actions for hierarchical mode
	const hierarchicalViewportReturn = {
		// Basic viewport properties
		...basicViewportReturn,

		// Hierarchical-specific state
		transform: hierarchicalViewport.transform,
		isAnimating: hierarchicalViewport.animation.isAnimating,
		animationProgress: hierarchicalViewport.animation.progress,
		containerSize: hierarchicalViewport.containerSize,
		nodes: Array.from(hierarchicalStoreGetters.getAllNodes()), // Using non-reactive getter for nodes
		isEnabled,
		navigation: {
			focusedNode: navigation.focusedNode || undefined,
			breadcrumbTrail: [...navigation.breadcrumbTrail],
			canGoBack: navigation.historyIndex > 0,
			canGoForward:
				navigation.historyIndex < navigation.history.length - 1,
		},
		layout,

		// Hierarchical actions
		zoomToNode,
		focusNode,
		resetViewport: resetHierarchicalView,
		getCurrentTransform,
		handleNodeClick,
		updateContainerSize,
		zoomBy,
		panBy,
		navigateBack: hierarchicalActions.navigateBack,
		navigateForward: hierarchicalActions.navigateForward,

		// Store access
		viewportStore: basicViewportReturn.viewportStore,
	};

	// Return appropriate viewport based on hierarchical flag
	return hierarchical ? hierarchicalViewportReturn : basicViewportReturn;
};

/**
 * Easing function for smooth animations
 */
const easeOutCubic = (t: number): number => {
	return 1 - (1 - t) ** 3;
};
