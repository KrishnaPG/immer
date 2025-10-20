import type {
  TElementId,
  TCoordinate,
  THierarchyLevel,
  THierarchyDepth
} from "@/types/branded.types";
import type {
  IHierarchicalNode,
  ITreeLayoutResult,
  ITreeLayoutConfig,
  IPoint2D
} from "@/types/hierarchical.interfaces";
import { hierarchicalStore } from "@/lib/state/hierarchical-store";

/**
 * Tree layout algorithm implementation
 * Based on D3.js tree layout but simplified for DOM rendering
 */
export class TreeLayout {
  private config: ITreeLayoutConfig;

  constructor(config: ITreeLayoutConfig) {
    this.config = config;
  }

  /**
   * Calculate layout for all nodes
   */
  calculate(nodes: Map<TElementId, IHierarchicalNode>): ITreeLayoutResult {
    const rootNodes = Array.from(hierarchicalStore.rootNodes);

    if (rootNodes.length === 0) {
      return {
        nodes: new Map(),
        edges: new Map(),
        dimensions: { width: 0 as TCoordinate, height: 0 as TCoordinate }
      };
    }

    const layoutNodes = new Map<TElementId, IHierarchicalNode>();
    const edges = new Map<TElementId, TElementId[]>();
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    // Process each root tree
    let xOffset = 0 as TCoordinate;
    for (const rootId of rootNodes) {
      const rootNode = nodes.get(rootId);
      if (!rootNode) continue;

      const treeResult = this.calculateTree(rootNode, nodes, xOffset);

      // Merge results
      treeResult.nodes.forEach((node, id) => {
        layoutNodes.set(id, node);

        // Update bounds
        minX = Math.min(minX, node.position.x);
        maxX = Math.max(maxX, node.position.x);
        minY = Math.min(minY, node.position.y);
        maxY = Math.max(maxY, node.position.y);
      });

      treeResult.edges.forEach((children, parentId) => {
        edges.set(parentId, children);
      });

      // Update offset for next tree
      xOffset += treeResult.dimensions.width + this.config.nodeSpacing;
    }

    const width = (maxX - minX) as TCoordinate;
    const height = (maxY - minY) as TCoordinate;

    return {
      nodes: layoutNodes,
      edges,
      dimensions: { width, height }
    };
  }

  /**
   * Calculate layout for a single tree
   */
  private calculateTree(
    root: IHierarchicalNode,
    nodes: Map<TElementId, IHierarchicalNode>,
    xOffset: TCoordinate
  ): ITreeLayoutResult {
    switch (this.config.algorithm) {
      case "tree":
        return this.calculateTreeLayout(root, nodes, xOffset);
      case "cluster":
        return this.calculateClusterLayout(root, nodes, xOffset);
      case "radial":
        return this.calculateRadialLayout(root, nodes, xOffset);
      case "force":
        return this.calculateForceLayout(root, nodes, xOffset);
      default:
        return this.calculateTreeLayout(root, nodes, xOffset);
    }
  }

  /**
   * Traditional tree layout (top-down)
   */
  private calculateTreeLayout(
    root: IHierarchicalNode,
    nodes: Map<TElementId, IHierarchicalNode>,
    xOffset: TCoordinate
  ): ITreeLayoutResult {
    const layoutNodes = new Map<TElementId, IHierarchicalNode>();
    const edges = new Map<TElementId, TElementId[]>();

    // First pass: calculate subtree widths
    const subtreeWidths = new Map<TElementId, number>();

    const calculateSubtreeWidth = (nodeId: TElementId): number => {
      const node = nodes.get(nodeId);
      if (!node || !node.expanded || node.children.length === 0) {
        const width = this.config.nodeSpacing;
        subtreeWidths.set(nodeId, width);
        return width;
      }

      let totalWidth = 0;
      for (const childId of node.children) {
        totalWidth += calculateSubtreeWidth(childId);
      }

      subtreeWidths.set(nodeId, totalWidth);
      return totalWidth;
    };

    // Second pass: assign positions
    const assignPositions = (
      nodeId: TElementId,
      x: TCoordinate,
      y: TCoordinate,
      level: THierarchyLevel,
      depth: THierarchyDepth
    ): void => {
      const node = nodes.get(nodeId);
      if (!node) return;

      const subtreeWidth = subtreeWidths.get(nodeId) || 0;
      const nodeX = (x + subtreeWidth / 2) as TCoordinate;

      // Create positioned node copy
      const positionedNode: IHierarchicalNode = {
        ...node,
        position: { x: nodeX + xOffset, y },
        layoutPosition: { x: nodeX, y },
        level,
        depth
      };

      layoutNodes.set(nodeId, positionedNode);
      edges.set(nodeId, node.children);

      // Position children
      if (node.expanded && node.children.length > 0) {
        let childX = x;
        const childY = (y + this.config.levelSpacing) as TCoordinate;
        const childLevel = (level + 1) as THierarchyLevel;
        const childDepth = (depth + 1) as THierarchyDepth;

        for (const childId of node.children) {
          const childWidth = subtreeWidths.get(childId) || 0;
          assignPositions(childId, childX, childY, childLevel, childDepth);
          childX += childWidth;
        }
      }
    };

    // Start positioning from root
    calculateSubtreeWidth(root.id);
    assignPositions(root.id, 0 as TCoordinate, 0 as TCoordinate, 0 as THierarchyLevel, 0 as THierarchyDepth);

    // Calculate dimensions
    let maxX = -Infinity;
    let maxY = -Infinity;

    layoutNodes.forEach(node => {
      maxX = Math.max(maxX, node.position.x - xOffset);
      maxY = Math.max(maxY, node.position.y);
    });

    const width = (maxX + this.config.nodeSpacing) as TCoordinate;
    const height = (maxY + this.config.nodeSpacing) as TCoordinate;

    return {
      nodes: layoutNodes,
      edges,
      dimensions: { width, height }
    };
  }

  /**
   * Cluster layout (more compact)
   */
  private calculateClusterLayout(
    root: IHierarchicalNode,
    nodes: Map<TElementId, IHierarchicalNode>,
    xOffset: TCoordinate
  ): ITreeLayoutResult {
    // Similar to tree layout but with different spacing logic
    const result = this.calculateTreeLayout(root, nodes, xOffset);

    // Adjust spacing for cluster effect
    const compactNodes = new Map<TElementId, IHierarchicalNode>();

    result.nodes.forEach((node, id) => {
      const compactNode: IHierarchicalNode = {
        ...node,
        position: {
          x: (node.position.x * 0.8) as TCoordinate,
          y: (node.position.y * 0.6) as TCoordinate
        },
        layoutPosition: {
          x: (node.layoutPosition.x * 0.8) as TCoordinate,
          y: (node.layoutPosition.y * 0.6) as TCoordinate
        }
      };
      compactNodes.set(id, compactNode);
    });

    return {
      ...result,
      nodes: compactNodes,
      dimensions: {
        width: (result.dimensions.width * 0.8) as TCoordinate,
        height: (result.dimensions.height * 0.6) as TCoordinate
      }
    };
  }

  /**
   * Radial layout (circular arrangement)
   */
  private calculateRadialLayout(
    root: IHierarchicalNode,
    nodes: Map<TElementId, IHierarchicalNode>,
    xOffset: TCoordinate
  ): ITreeLayoutResult {
    const layoutNodes = new Map<TElementId, IHierarchicalNode>();
    const edges = new Map<TElementId, TElementId[]>();

    const angleStep = (2 * Math.PI) / Math.max(1, root.children.length);

    // Position root at center
    const rootPosition = { x: xOffset, y: 0 as TCoordinate };
    const rootNode: IHierarchicalNode = {
      ...root,
      position: rootPosition,
      layoutPosition: { x: 0, y: 0 },
      level: 0 as THierarchyLevel,
      depth: 0 as THierarchyDepth
    };
    layoutNodes.set(root.id, rootNode);
    edges.set(root.id, root.children);

    // Position children in circle
    if (root.expanded) {
      root.children.forEach((childId, index) => {
        const angle = index * angleStep;
        const radius = this.config.levelSpacing;
        const x = (Math.cos(angle) * radius) as TCoordinate;
        const y = (Math.sin(angle) * radius) as TCoordinate;

        const childNode = nodes.get(childId);
        if (childNode) {
          const positionedChild: IHierarchicalNode = {
            ...childNode,
            position: { x: x + xOffset, y },
            layoutPosition: { x, y },
            level: 1 as THierarchyLevel,
            depth: 1 as THierarchyDepth
          };
          layoutNodes.set(childId, positionedChild);
          edges.set(childId, childNode.children);
        }
      });
    }

    const dimensions = {
      width: (this.config.levelSpacing * 2) as TCoordinate,
      height: (this.config.levelSpacing * 2) as TCoordinate
    };

    return { nodes: layoutNodes, edges, dimensions };
  }

  /**
   * Force-directed layout (simplified)
   */
  private calculateForceLayout(
    root: IHierarchicalNode,
    nodes: Map<TElementId, IHierarchicalNode>,
    xOffset: TCoordinate
  ): ITreeLayoutResult {
    const layoutNodes = new Map<TElementId, IHierarchicalNode>();
    const edges = new Map<TElementId, TElementId[]>();

    // Start with tree layout as initial positions
    const initialLayout = this.calculateTreeLayout(root, nodes, xOffset);

    // Apply simple force simulation
    const positions = new Map<TElementId, IPoint2D>();

    initialLayout.nodes.forEach((node, id) => {
      positions.set(id, { ...node.position });
    });

    // Simplified force iteration
    for (let iteration = 0; iteration < 50; iteration++) {
      const forces = new Map<TElementId, { fx: number; fy: number }>();

      // Initialize forces
      initialLayout.nodes.forEach((_, id) => {
        forces.set(id, { fx: 0, fy: 0 });
      });

      // Repulsion between all nodes
      const nodeIds = Array.from(initialLayout.nodes.keys());
      for (let i = 0; i < nodeIds.length; i++) {
        for (let j = i + 1; j < nodeIds.length; j++) {
          const id1 = nodeIds[i];
          const id2 = nodeIds[j];
          const pos1 = positions.get(id1)!;
          const pos2 = positions.get(id2)!;

          const dx = pos2.x - pos1.x;
          const dy = pos2.y - pos1.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = 1000 / (distance * distance);

          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;

          const force1 = forces.get(id1)!;
          const force2 = forces.get(id2)!;

          force1.fx -= fx;
          force1.fy -= fy;
          force2.fx += fx;
          force2.fy += fy;
        }
      }

      // Attraction along edges
      initialLayout.edges.forEach((children, parentId) => {
        const parentPos = positions.get(parentId)!;
        children.forEach(childId => {
          const childPos = positions.get(childId)!;
          const dx = childPos.x - parentPos.x;
          const dy = childPos.y - parentPos.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = distance * 0.01;

          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;

          const parentForce = forces.get(parentId)!;
          const childForce = forces.get(childId)!;

          parentForce.fx += fx;
          parentForce.fy += fy;
          childForce.fx -= fx;
          childForce.fy -= fy;
        });
      });

      // Apply forces
      forces.forEach((force, id) => {
        const pos = positions.get(id)!;
        pos.x = (pos.x + force.fx * 0.1) as TCoordinate;
        pos.y = (pos.y + force.fy * 0.1) as TCoordinate;
      });
    }

    // Create final layout
    positions.forEach((position, id) => {
      const node = initialLayout.nodes.get(id)!;
      const finalNode: IHierarchicalNode = {
        ...node,
        position: { ...position }
      };
      layoutNodes.set(id, finalNode);
    });

    return {
      nodes: layoutNodes,
      edges: initialLayout.edges,
      dimensions: initialLayout.dimensions
    };
  }
}

/**
 * Factory function to create tree layout
 */
export const createTreeLayout = (config: ITreeLayoutConfig): TreeLayout => {
  return new TreeLayout(config);
};

/**
 * Hook for using tree layout
 */
export const useTreeLayout = (config?: Partial<ITreeLayoutConfig>) => {
  const storeConfig = hierarchicalStore.layoutConfig;
  const finalConfig = { ...storeConfig, ...config };

  return {
    layout: createTreeLayout(finalConfig),
    config: finalConfig
  };
};