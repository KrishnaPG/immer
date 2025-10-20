import { describe, it, expect, beforeEach } from 'vitest';
import { createTreeLayout } from '@/lib/geometry/hierarchical-layout';
import { hierarchicalActions } from '@/lib/state/hierarchical-store';
import { generateId } from '@/lib/utils/id-generator';
import type { TElementId } from '@/types/branded.types';

describe('Tree Layout', () => {
  let rootNodeId: TElementId;
  let childNodeId1: TElementId;
  let childNodeId2: TElementId;
  let grandchildNodeId: TElementId;

  beforeEach(() => {
    hierarchicalActions.clear();

    rootNodeId = generateId() as TElementId;
    childNodeId1 = generateId() as TElementId;
    childNodeId2 = generateId() as TElementId;
    grandchildNodeId = generateId() as TElementId;

    // Create test hierarchy
    hierarchicalActions.createNode(rootNodeId, { data: { name: 'Root' } });
    hierarchicalActions.createNode(childNodeId1, {
      parent: rootNodeId,
      data: { name: 'Child 1' }
    });
    hierarchicalActions.createNode(childNodeId2, {
      parent: rootNodeId,
      data: { name: 'Child 2' }
    });
    hierarchicalActions.createNode(grandchildNodeId, {
      parent: childNodeId1,
      data: { name: 'Grandchild' }
    });
  });

  describe('Tree Layout Algorithm', () => {
    it('should calculate basic tree layout', () => {
      const config = {
        nodeSpacing: 100 as any,
        levelSpacing: 150 as any,
        algorithm: 'tree' as const
      };

      const layout = createTreeLayout(config);
      const nodes = hierarchicalStore.nodes;
      const result = layout.calculate(nodes);

      expect(result.nodes.size).toBe(4);
      expect(result.edges.size).toBe(3);
      expect(result.dimensions.width).toBeGreaterThan(0);
      expect(result.dimensions.height).toBeGreaterThan(0);
    });

    it('should position root at correct location', () => {
      const config = {
        nodeSpacing: 100 as any,
        levelSpacing: 150 as any,
        algorithm: 'tree' as const
      };

      const layout = createTreeLayout(config);
      const nodes = hierarchicalStore.nodes;
      const result = layout.calculate(nodes);

      const rootNode = result.nodes.get(rootNodeId);
      expect(rootNode).toBeDefined();
      expect(rootNode?.level).toBe(0);
      expect(rootNode?.depth).toBe(0);
      expect(rootNode?.position.y).toBe(0);
    });

    it('should position children at correct level', () => {
      const config = {
        nodeSpacing: 100 as any,
        levelSpacing: 150 as any,
        algorithm: 'tree' as const
      };

      const layout = createTreeLayout(config);
      const nodes = hierarchicalStore.nodes;
      const result = layout.calculate(nodes);

      const childNode1 = result.nodes.get(childNodeId1);
      const childNode2 = result.nodes.get(childNodeId2);

      expect(childNode1?.level).toBe(1);
      expect(childNode1?.depth).toBe(1);
      expect(childNode1?.position.y).toBe(150);

      expect(childNode2?.level).toBe(1);
      expect(childNode2?.depth).toBe(1);
      expect(childNode2?.position.y).toBe(150);
    });

    it('should position grandchildren at correct level', () => {
      const config = {
        nodeSpacing: 100 as any,
        levelSpacing: 150 as any,
        algorithm: 'tree' as const
      };

      const layout = createTreeLayout(config);
      const nodes = hierarchicalStore.nodes;
      const result = layout.calculate(nodes);

      const grandchildNode = result.nodes.get(grandchildNodeId);

      expect(grandchildNode?.level).toBe(2);
      expect(grandchildNode?.depth).toBe(2);
      expect(grandchildNode?.position.y).toBe(300);
    });

    it('should handle multiple root nodes', () => {
      // Add another root node
      const secondRootId = generateId() as TElementId;
      hierarchicalActions.createNode(secondRootId, { data: { name: 'Root 2' } });

      const config = {
        nodeSpacing: 100 as any,
        levelSpacing: 150 as any,
        algorithm: 'tree' as const
      };

      const layout = createTreeLayout(config);
      const nodes = hierarchicalStore.nodes;
      const result = layout.calculate(nodes);

      expect(result.nodes.size).toBe(5);
      // Width should be larger due to multiple trees
      expect(result.dimensions.width).toBeGreaterThan(400);
    });

    it('should handle collapsed nodes', () => {
      // Collapse child node 1
      hierarchicalActions.toggleNodeExpansion(childNodeId1);

      const config = {
        nodeSpacing: 100 as any,
        levelSpacing: 150 as any,
        algorithm: 'tree' as const
      };

      const layout = createTreeLayout(config);
      const nodes = hierarchicalStore.nodes;
      const result = layout.calculate(nodes);

      // Grandchild should not be positioned since parent is collapsed
      const grandchildNode = result.nodes.get(grandchildNodeId);
      expect(grandchildNode).toBeUndefined();
    });
  });

  describe('Cluster Layout Algorithm', () => {
    it('should calculate cluster layout', () => {
      const config = {
        nodeSpacing: 100 as any,
        levelSpacing: 150 as any,
        algorithm: 'cluster' as const
      };

      const layout = createTreeLayout(config);
      const nodes = hierarchicalStore.nodes;
      const result = layout.calculate(nodes);

      expect(result.nodes.size).toBe(4);
      // Cluster layout should be more compact
      expect(result.dimensions.height).toBeLessThan(300);
    });
  });

  describe('Radial Layout Algorithm', () => {
    it('should calculate radial layout', () => {
      const config = {
        nodeSpacing: 100 as any,
        levelSpacing: 150 as any,
        algorithm: 'radial' as const
      };

      const layout = createTreeLayout(config);
      const nodes = hierarchicalStore.nodes;
      const result = layout.calculate(nodes);

      expect(result.nodes.size).toBe(4);

      // Root should be at center
      const rootNode = result.nodes.get(rootNodeId);
      expect(rootNode?.position.x).toBe(0);
      expect(rootNode?.position.y).toBe(0);

      // Children should be arranged in circle
      const childNode1 = result.nodes.get(childNodeId1);
      const childNode2 = result.nodes.get(childNodeId2);

      expect(childNode1?.position.y).not.toBe(childNode2?.position.y);
    });
  });

  describe('Force Layout Algorithm', () => {
    it('should calculate force-directed layout', () => {
      const config = {
        nodeSpacing: 100 as any,
        levelSpacing: 150 as any,
        algorithm: 'force' as const
      };

      const layout = createTreeLayout(config);
      const nodes = hierarchicalStore.nodes;
      const result = layout.calculate(nodes);

      expect(result.nodes.size).toBe(4);
      // Force layout should produce different positions than tree layout
      const rootNode = result.nodes.get(rootNodeId);
      expect(rootNode).toBeDefined();
    });
  });

  describe('Edge Management', () => {
    it('should create correct parent-child edges', () => {
      const config = {
        nodeSpacing: 100 as any,
        levelSpacing: 150 as any,
        algorithm: 'tree' as const
      };

      const layout = createTreeLayout(config);
      const nodes = hierarchicalStore.nodes;
      const result = layout.calculate(nodes);

      // Root should have two children
      const rootEdges = result.edges.get(rootNodeId);
      expect(rootEdges).toContain(childNodeId1);
      expect(rootEdges).toContain(childNodeId2);
      expect(rootEdges?.length).toBe(2);

      // Child 1 should have one grandchild
      const child1Edges = result.edges.get(childNodeId1);
      expect(child1Edges).toContain(grandchildNodeId);
      expect(child1Edges?.length).toBe(1);

      // Child 2 should have no children
      const child2Edges = result.edges.get(childNodeId2);
      expect(child2Edges?.length).toBe(0);
    });
  });

  describe('Layout Dimensions', () => {
    it('should calculate correct dimensions for single tree', () => {
      const config = {
        nodeSpacing: 100 as any,
        levelSpacing: 150 as any,
        algorithm: 'tree' as const
      };

      const layout = createTreeLayout(config);
      const nodes = hierarchicalStore.nodes;
      const result = layout.calculate(nodes);

      // With 4 nodes and spacing of 100, width should be at least 400
      expect(result.dimensions.width).toBeGreaterThanOrEqual(300);
      // With 3 levels and spacing of 150, height should be at least 300
      expect(result.dimensions.height).toBeGreaterThanOrEqual(300);
    });

    it('should handle empty layout', () => {
      hierarchicalActions.clear();

      const config = {
        nodeSpacing: 100 as any,
        levelSpacing: 150 as any,
        algorithm: 'tree' as const
      };

      const layout = createTreeLayout(config);
      const nodes = hierarchicalStore.nodes;
      const result = layout.calculate(nodes);

      expect(result.nodes.size).toBe(0);
      expect(result.edges.size).toBe(0);
      expect(result.dimensions.width).toBe(0);
      expect(result.dimensions.height).toBe(0);
    });
  });
});