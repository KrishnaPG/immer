import type { IElement } from './core.interfaces';
import type { TElementId, TCoordinate, TScale } from './branded.types';

/**
 * Hierarchical node interface extending base element
 */
export interface IHierarchicalNode extends IElement {
  /** Hierarchy level (0 = root) */
  level: THierarchyLevel;
  /** Depth from root */
  depth: THierarchyDepth;
  /** Whether node is expanded to show children */
  expanded: boolean;
  /** Layout position calculated by tree algorithm */
  layoutPosition: IPoint2D;
  /** Custom node data payload */
  data: unknown;
}

/**
 * Tree layout configuration
 */
export interface ITreeLayoutConfig {
  /** Horizontal spacing between nodes */
  nodeSpacing: TCoordinate;
  /** Vertical spacing between levels */
  levelSpacing: TCoordinate;
  /** Layout algorithm type */
  algorithm: "tree" | "cluster" | "radial" | "force";
}

/**
 * Zoom-to-node animation configuration
 */
export interface IZoomToNodeConfig {
  /** Target zoom level for the node */
  targetZoom: TScale;
  /** Animation duration in milliseconds */
  duration: number;
  /** Animation easing function */
  easing: string;
  /** Whether to center node in viewport */
  centerNode: boolean;
}

/**
 * Hierarchical navigation state
 */
export interface IHierarchicalNavigation {
  /** Currently focused node ID */
  focusedNode: TElementId | null;
  /** Navigation history for back/forward */
  history: TElementId[];
  /** Current history index */
  historyIndex: number;
  /** Breadcrumb trail from root to current node */
  breadcrumbTrail: TElementId[];
}

// Branded types are now in branded.types.ts

/**
 * Tree layout result interface
 */
export interface ITreeLayoutResult {
  /** Layout nodes with calculated positions */
  nodes: Map<TElementId, IHierarchicalNode>;
  /** Edge connections between nodes */
  edges: Map<TElementId, TElementId[]>;
  /** Total calculated dimensions */
  dimensions: {
    width: TCoordinate;
    height: TCoordinate;
  };
}