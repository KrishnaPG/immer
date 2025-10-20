import * as tf from "@tensorflow/tfjs";
import { proxy } from "valtio";
import { AffineTransform } from "@/lib/geometry/transform";
import type {
	TAngle,
	TCoordinate,
	TCoordinateX,
	TCoordinateY,
	TElementId,
	TElementType,
	THierarchyDepth,
	THierarchyLevel,
	TScale,
} from "@/types/branded.types";
import type { IPoint2D, ITensorPoint2D } from "@/types/core.interfaces";
import type {
	IHierarchicalNavigation,
	IHierarchicalNode,
	ITreeLayoutConfig,
	IZoomToNodeConfig,
} from "@/types/hierarchical.interfaces";
import { store } from "./store";

/**
 * Viewport transform state
 */
export interface IViewportTransform {
	/** Current affine transform */
	transform: AffineTransform;
	/** Animation state */
	animation: {
		isAnimating: boolean;
		targetNode: TElementId | null;
		progress: number;
		startTime: number;
		duration: number;
		startTransform: AffineTransform;
		targetTransform: AffineTransform;
	};
	/** Container dimensions */
	containerSize: {
		width: number;
		height: number;
	};
}

/**
 * Hierarchical store interface
 */
export interface IHierarchicalStore {
	/** Hierarchical nodes by ID */
	nodes: Map<TElementId, IHierarchicalNode>;
	/** Root nodes of hierarchies */
	rootNodes: Set<TElementId>;
	/** Layout configuration */
	layoutConfig: ITreeLayoutConfig;
	/** Navigation state */
	navigation: IHierarchicalNavigation;
	/** Animation settings */
	animationConfig: IZoomToNodeConfig;
	/** Is hierarchical mode enabled */
	isEnabled: boolean;
	/** Viewport transform state */
	viewport: IViewportTransform;
}

/**
 * Create hierarchical store
 */
export const hierarchicalStore = proxy<IHierarchicalStore>({
	nodes: new Map(),
	rootNodes: new Set(),
	layoutConfig: {
		nodeSpacing: 100 as TCoordinate,
		levelSpacing: 150 as TCoordinate,
		algorithm: "tree",
	},
	navigation: {
		focusedNode: null,
		history: [],
		historyIndex: -1,
		breadcrumbTrail: [],
	},
	animationConfig: {
		targetZoom: 1.5 as TScale,
		duration: 300,
		easing: "ease-out",
		centerNode: true,
	},
	isEnabled: false,
	viewport: {
		transform: AffineTransform.identity(),
		animation: {
			isAnimating: false,
			targetNode: null,
			progress: 0,
			startTime: 0,
			duration: 300,
			startTransform: AffineTransform.identity(),
			targetTransform: AffineTransform.identity(),
		},
		containerSize: {
			width: 800,
			height: 600,
		},
	},
});

/**
 * Hierarchical store actions
 */
export const hierarchicalActions = {
	/**
	 * Enable/disable hierarchical mode
	 */
	setEnabled: (enabled: boolean): void => {
		hierarchicalStore.isEnabled = enabled;
	},

	/**
	 * Create a new hierarchical node
	 */
	createNode: (
		id: TElementId,
		config: Partial<IHierarchicalNode> = {},
	): IHierarchicalNode => {
		const node: IHierarchicalNode = {
			id,
			type: "hierarchical-node" as TElementType,
			position: {
				x: 0 as TCoordinateX,
				y: 0 as TCoordinateY,
				tensor: tf.tensor1d([0, 0]),
			} as ITensorPoint2D,
			size: {
				width: 100 as any,
				height: 100 as any,
				tensor: tf.tensor1d([100, 100]),
			},
			scale: 1 as TScale,
			rotation: 0 as TAngle,
			transform: AffineTransform.identity().getRaw() as any,
			visible: true,
			interactive: true,
			children: [],
			level: 0 as THierarchyLevel,
			depth: 0 as THierarchyDepth,
			expanded: true,
			layoutPosition: { x: 0 as TCoordinate, y: 0 as TCoordinate },
			data: config.data || null,
			parent: config.parent,
			...config,
		};

		hierarchicalStore.nodes.set(id, node);

		// Add to main store
		store.elements.set(id, node);

		// Update parent-child relationships
		if (config.parent) {
			const parentNode = hierarchicalStore.nodes.get(config.parent);
			if (parentNode) {
				parentNode.children = [...parentNode.children, id];
			}
		} else {
			hierarchicalStore.rootNodes.add(id);
		}

		return node;
	},

	/**
	 * Update node position
	 */
	updateNodePosition: (id: TElementId, position: IPoint2D): void => {
		const node = hierarchicalStore.nodes.get(id);
		if (node) {
			node.position = {
				...position,
				tensor: tf.tensor1d([position.x as number, position.y as number]),
			} as ITensorPoint2D;
			node.layoutPosition = position;
		}
	},

	/**
	 * Update node hierarchy level
	 */
	updateNodeLevel: (
		id: TElementId,
		level: THierarchyLevel,
		depth: THierarchyDepth,
	): void => {
		const node = hierarchicalStore.nodes.get(id);
		if (node) {
			node.level = level;
			node.depth = depth;
		}
	},

	/**
	 * Toggle node expansion
	 */
	toggleNodeExpansion: (id: TElementId): void => {
		const node = hierarchicalStore.nodes.get(id);
		if (node) {
			node.expanded = !node.expanded;
		}
	},

	/**
	 * Remove a node and its children
	 */
	removeNode: (id: TElementId): void => {
		const node = hierarchicalStore.nodes.get(id);
		if (!node) return;

		// Recursively remove children
		for (const childId of node.children) {
			hierarchicalActions.removeNode(childId);
		}

		// Remove from parent
		if (node.parent) {
			const parentNode = hierarchicalStore.nodes.get(node.parent);
			if (parentNode) {
				parentNode.children = parentNode.children.filter(
					(childId) => childId !== id,
				);
			}
		} else {
			hierarchicalStore.rootNodes.delete(id);
		}

		// Remove node
		hierarchicalStore.nodes.delete(id);
		store.elements.delete(id);
	},

	/**
	 * Focus on a node (zoom to it)
	 */
	focusNode: (id: TElementId): void => {
		const node = hierarchicalStore.nodes.get(id);
		if (!node) return;

		// Update navigation state
		const newHistory = hierarchicalStore.navigation.history.slice(
			0,
			hierarchicalStore.navigation.historyIndex + 1,
		);
		newHistory.push(id);

		hierarchicalStore.navigation = {
			focusedNode: id,
			history: newHistory,
			historyIndex: newHistory.length - 1,
			breadcrumbTrail: hierarchicalActions.buildBreadcrumbTrail(id),
		};
	},

	/**
	 * Navigate back in history
	 */
	navigateBack: (): void => {
		const { history, historyIndex } = hierarchicalStore.navigation;
		if (historyIndex > 0) {
			const newIndex = historyIndex - 1;
			const targetId = history[newIndex];

			hierarchicalStore.navigation.historyIndex = newIndex;
			hierarchicalStore.navigation.focusedNode = targetId;
			hierarchicalStore.navigation.breadcrumbTrail =
				hierarchicalActions.buildBreadcrumbTrail(targetId);
		}
	},

	/**
	 * Navigate forward in history
	 */
	navigateForward: (): void => {
		const { history, historyIndex } = hierarchicalStore.navigation;
		if (historyIndex < history.length - 1) {
			const newIndex = historyIndex + 1;
			const targetId = history[newIndex];

			hierarchicalStore.navigation.historyIndex = newIndex;
			hierarchicalStore.navigation.focusedNode = targetId;
			hierarchicalStore.navigation.breadcrumbTrail =
				hierarchicalActions.buildBreadcrumbTrail(targetId);
		}
	},

	/**
	 * Build breadcrumb trail to root
	 */
	buildBreadcrumbTrail: (id: TElementId): TElementId[] => {
		const trail: TElementId[] = [];
		let currentId: TElementId | undefined = id;

		while (currentId) {
			trail.unshift(currentId);
			const node = hierarchicalStore.nodes.get(currentId);
			currentId = node?.parent;
		}

		return trail;
	},

	/**
	 * Update layout configuration
	 */
	updateLayoutConfig: (config: Partial<ITreeLayoutConfig>): void => {
		hierarchicalStore.layoutConfig = {
			...hierarchicalStore.layoutConfig,
			...config,
		};
	},

	/**
	 * Update animation configuration
	 */
	updateAnimationConfig: (config: Partial<IZoomToNodeConfig>): void => {
		hierarchicalStore.animationConfig = {
			...hierarchicalStore.animationConfig,
			...config,
		};
	},

	/**
	 * Clear all hierarchical data
	 */
	clear: (): void => {
		hierarchicalStore.nodes.clear();
		hierarchicalStore.rootNodes.clear();
		hierarchicalStore.navigation = {
			focusedNode: null,
			history: [],
			historyIndex: -1,
			breadcrumbTrail: [],
		};
	},

	/**
	 * Viewport-specific actions that bypass React render loop
	 */
	viewport: {
		/**
		 * Set viewport transform directly (bypasses React render loop)
		 */
		setTransformDirect: (transform: AffineTransform): void => {
			hierarchicalStore.viewport.transform = transform;
		},

		/**
		 * Start animation to node (bypasses React render loop)
		 */
		startAnimationDirect: (
			nodeId: TElementId,
			config: Partial<IZoomToNodeConfig> = {},
		): void => {
			const node = hierarchicalStore.nodes.get(nodeId);
			if (!node) return;

			const animConfig = { ...hierarchicalStore.animationConfig, ...config };
			const startTransform = hierarchicalStore.viewport.transform;

			// Calculate target transform
			const containerRect = hierarchicalStore.viewport.containerSize;
			const containerCenterX = containerRect.width / 2;
			const containerCenterY = containerRect.height / 2;
			const zoom = animConfig.targetZoom;
			const nodeX = node.position.x * zoom;
			const nodeY = node.position.y * zoom;
			const translateX = (containerCenterX - nodeX) as any;
			const translateY = (containerCenterY - nodeY) as any;

			const targetTransform = new AffineTransform(
				zoom, 0, translateX,
				0, zoom, translateY
			);

			// Update animation state directly
			hierarchicalStore.viewport.animation = {
				isAnimating: true,
				targetNode: nodeId,
				progress: 0,
				startTime: performance.now(),
				duration: animConfig.duration,
				startTransform,
				targetTransform,
			};

			// Update navigation
			hierarchicalActions.focusNode(nodeId);
		},

		/**
		 * Update animation progress (bypasses React render loop)
		 */
		updateAnimationProgress: (progress: number): void => {
			if (!hierarchicalStore.viewport.animation.isAnimating) return;

			hierarchicalStore.viewport.animation.progress = progress;

			// Interpolate transform
			const { startTransform, targetTransform } =
				hierarchicalStore.viewport.animation;
			const interpolated = new AffineTransform(
				startTransform.a + (targetTransform.a - startTransform.a) * progress,
				startTransform.b + (targetTransform.b - startTransform.b) * progress,
				startTransform.x + (targetTransform.x - startTransform.x) * progress,
				startTransform.c + (targetTransform.c - startTransform.c) * progress,
				startTransform.d + (targetTransform.d - startTransform.d) * progress,
				startTransform.y + (targetTransform.y - startTransform.y) * progress,
			);

			hierarchicalStore.viewport.transform = interpolated;

			// Complete animation if finished
			if (progress >= 1) {
				hierarchicalStore.viewport.animation.isAnimating = false;
				hierarchicalStore.viewport.animation.targetNode = null;
			}
		},

		/**
		 * Complete animation immediately
		 */
		completeAnimation: (): void => {
			if (!hierarchicalStore.viewport.animation.isAnimating) return;

			hierarchicalActions.viewport.updateAnimationProgress(1);
		},

		/**
		 * Reset viewport to identity transform
		 */
		resetViewport: (): void => {
			hierarchicalStore.viewport.transform = AffineTransform.identity();
			hierarchicalStore.viewport.animation.isAnimating = false;
			hierarchicalStore.viewport.animation.targetNode = null;
		},

		/**
		 * Update container size
		 */
		updateContainerSize: (width: number, height: number): void => {
			hierarchicalStore.viewport.containerSize = { width, height };
		},

		/**
		 * Zoom by factor
		 */
		zoomBy: (factor: number): void => {
			const current = hierarchicalStore.viewport.transform;
			const scaled = AffineTransform.scaleBy(factor);
			hierarchicalStore.viewport.transform = current.compose(scaled);
		},

		/**
		 * Pan by delta
		 */
		panBy: (deltaX: number, deltaY: number): void => {
			const current = hierarchicalStore.viewport.transform;
			const translated = AffineTransform.translateBy({
				x: deltaX,
				y: deltaY,
			} as any);
			hierarchicalStore.viewport.transform = current.compose(translated);
		},
	},
};

/**
	* Direct proxy access utilities for non-reactive operations
	* These functions provide access to the store proxy without triggering subscriptions
	*/
export const hierarchicalStoreGetters = {
	/**
	 * Get direct access to the store proxy (non-reactive)
	 * Use this for operations that don't need to trigger re-renders
	 */
	getStore: () => hierarchicalStore,
	
	/**
	 * Get a node directly from the proxy (non-reactive)
	 */
	getNode: (id: TElementId) => hierarchicalStore.nodes.get(id),
	
	/**
	 * Check if a node exists directly (non-reactive)
	 */
	hasNode: (id: TElementId) => hierarchicalStore.nodes.has(id),
	
	/**
	 * Get all nodes as array directly (non-reactive)
	 */
	getAllNodes: () => hierarchicalStore.nodes.values(),
	
	/**
	 * Get root nodes directly (non-reactive)
	 */
	getRootNodes: () => hierarchicalStore.rootNodes,
	
	/**
	 * Get navigation state directly (non-reactive)
	 */
	getNavigation: () => hierarchicalStore.navigation,
	
	/**
	 * Get viewport transform directly (non-reactive)
	 */
	getViewportTransform: () => hierarchicalStore.viewport.transform,
	
	/**
	 * Get animation state directly (non-reactive)
	 */
	getAnimationState: () => hierarchicalStore.viewport.animation,
	
	/**
	 * Get specific node properties directly (non-reactive)
	 * Use this when you only need specific properties to avoid object creation overhead
	 */
	getNodePosition: (id: TElementId) => {
		const node = hierarchicalStore.nodes.get(id);
		return node ? node.position : undefined;
	},
	
	getNodeChildren: (id: TElementId) => {
		const node = hierarchicalStore.nodes.get(id);
		return node ? node.children : [];
	},
	
	getNodeExpanded: (id: TElementId) => {
		const node = hierarchicalStore.nodes.get(id);
		return node ? node.expanded : false;
	},
};
