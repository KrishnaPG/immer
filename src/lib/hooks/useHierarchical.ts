import { useSnapshot } from "valtio";
import {
	hierarchicalActions,
	hierarchicalStore,
	hierarchicalStoreGetters,
} from "@/lib/state/hierarchical-store";
import type {
	TCoordinate,
	TElementId,
	THierarchyDepth,
	THierarchyLevel,
	TScale,
} from "@/types/branded.types";
import type {
	IHierarchicalNavigation,
	IHierarchicalNode,
	ITreeLayoutConfig,
	IZoomToNodeConfig,
} from "@/types/hierarchical.interfaces";

/**
 * Hook for accessing hierarchical store state
 * Only use this when you need reactive updates to the entire store
 * WARNING: This subscribes to the entire store and should be used sparingly
 */
export const useHierarchicalStore = () => {
  return useSnapshot(hierarchicalStore);
};

/**
 * Hook for hierarchical node operations
 */
export const useHierarchicalNode = (id: TElementId) => {
	// Only subscribe to the specific node we need, not the entire nodes Map
	const node = useSnapshot(hierarchicalStore).nodes.get(id);

	return {
		node,
		exists: !!node,
		children: node?.children || [],
		parent: node?.parent,
		level: node?.level,
		depth: node?.depth,
		expanded: node?.expanded,
		position: node?.position,
		layoutPosition: node?.layoutPosition,
		data: node?.data,

		// Actions
		updatePosition: (position: { x: TCoordinate; y: TCoordinate }) => {
			hierarchicalActions.updateNodePosition(id, position as any);
		},

		updateLevel: (level: THierarchyLevel, depth: THierarchyDepth) => {
			hierarchicalActions.updateNodeLevel(id, level, depth);
		},

		toggleExpansion: () => {
			hierarchicalActions.toggleNodeExpansion(id);
		},

		focus: () => {
			hierarchicalActions.focusNode(id);
		},

		remove: () => {
			hierarchicalActions.removeNode(id);
		},
	};
};

/**
 * Hook for hierarchical navigation
 */
export const useHierarchicalNavigation = () => {
  // Only subscribe to navigation state, not the entire store
  const navigation = useSnapshot(hierarchicalStore).navigation;

  return {
    focusedNode: navigation.focusedNode,
    history: navigation.history,
    historyIndex: navigation.historyIndex,
    breadcrumbTrail: navigation.breadcrumbTrail,
    canGoBack: navigation.historyIndex > 0,
    canGoForward: navigation.historyIndex < navigation.history.length - 1,

    // Actions
    focusNode: hierarchicalActions.focusNode,
    navigateBack: hierarchicalActions.navigateBack,
    navigateForward: hierarchicalActions.navigateForward,
    getBreadcrumbTrail: (id: TElementId) => {
      return hierarchicalActions.buildBreadcrumbTrail(id);
    },
  };
};

/**
 * Hook for layout configuration
 */
export const useHierarchicalLayout = () => {
  // Only subscribe to layout config, not the entire store
  const layoutConfig = useSnapshot(hierarchicalStore).layoutConfig;

  return {
    nodeSpacing: layoutConfig.nodeSpacing,
    levelSpacing: layoutConfig.levelSpacing,
    algorithm: layoutConfig.algorithm,

    // Actions
    updateConfig: (config: Partial<ITreeLayoutConfig>) => {
      hierarchicalActions.updateLayoutConfig(config);
    },
  };
};

/**
 * Hook for animation configuration
 */
export const useHierarchicalAnimation = () => {
  // Only subscribe to animation config, not the entire store
  const animationConfig = useSnapshot(hierarchicalStore).animationConfig;

  return {
    targetZoom: animationConfig.targetZoom,
    duration: animationConfig.duration,
    easing: animationConfig.easing,
    centerNode: animationConfig.centerNode,

    // Actions
    updateConfig: (config: Partial<IZoomToNodeConfig>) => {
      hierarchicalActions.updateAnimationConfig(config);
    },
  };
};

/**
 * Hook for hierarchical store management
 */
export const useHierarchical = () => {
  // Only subscribe to the specific parts of the store we need
  const { isEnabled, nodes, rootNodes } = useSnapshot(hierarchicalStore);

  return {
    // State
    isEnabled,
    nodes: Array.from(nodes.values()), // Keep array for backward compatibility
    rootNodes: Array.from(rootNodes), // Keep array for backward compatibility
    nodeCount: nodes.size,
    rootNodeCount: rootNodes.size,

    // Optimized accessors for new code
    nodesIterator: nodes.values(),
    rootNodesSet: rootNodes,

    // Actions
    setEnabled: hierarchicalActions.setEnabled,
    createNode: hierarchicalActions.createNode,
    removeNode: hierarchicalActions.removeNode,
    updateNodePosition: hierarchicalActions.updateNodePosition,
    toggleNodeExpansion: hierarchicalActions.toggleNodeExpansion,
    focusNode: hierarchicalActions.focusNode,
    clear: hierarchicalActions.clear,

    // Composition hooks
    useNode: useHierarchicalNode,
    useNavigation: useHierarchicalNavigation,
    useLayout: useHierarchicalLayout,
    useAnimation: useHierarchicalAnimation,
  };
};
