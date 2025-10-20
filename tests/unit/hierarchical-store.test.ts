import { describe, it, expect, beforeEach } from 'vitest';
import { hierarchicalStore, hierarchicalActions } from '@/lib/state/hierarchical-store';
import { generateId } from '@/lib/utils/id-generator';
import type { TElementId } from '@/types/branded.types';

describe('Hierarchical Store', () => {
  beforeEach(() => {
    hierarchicalActions.clear();
  });

  describe('Store Initialization', () => {
    it('should initialize with empty state', () => {
      expect(hierarchicalStore.nodes.size).toBe(0);
      expect(hierarchicalStore.rootNodes.size).toBe(0);
      expect(hierarchicalStore.isEnabled).toBe(false);
      expect(hierarchicalStore.navigation.focusedNode).toBe(null);
    });

    it('should have default layout configuration', () => {
      expect(hierarchicalStore.layoutConfig.nodeSpacing).toBe(100);
      expect(hierarchicalStore.layoutConfig.levelSpacing).toBe(150);
      expect(hierarchicalStore.layoutConfig.algorithm).toBe('tree');
    });

    it('should have default animation configuration', () => {
      expect(hierarchicalStore.animationConfig.targetZoom).toBe(1.5);
      expect(hierarchicalStore.animationConfig.duration).toBe(300);
      expect(hierarchicalStore.animationConfig.easing).toBe('ease-out');
      expect(hierarchicalStore.animationConfig.centerNode).toBe(true);
    });
  });

  describe('Node Management', () => {
    let rootNodeId: TElementId;
    let childNodeId: TElementId;

    beforeEach(() => {
      rootNodeId = generateId() as TElementId;
      childNodeId = generateId() as TElementId;
    });

    it('should create a root node', () => {
      const node = hierarchicalActions.createNode(rootNodeId, {
        data: { name: 'Root Node' }
      });

      expect(node.id).toBe(rootNodeId);
      expect(node.level).toBe(0);
      expect(node.depth).toBe(0);
      expect(node.parent).toBeUndefined();
      expect(hierarchicalStore.nodes.has(rootNodeId)).toBe(true);
      expect(hierarchicalStore.rootNodes.has(rootNodeId)).toBe(true);
      expect(node.data).toEqual({ name: 'Root Node' });
    });

    it('should create a child node', () => {
      // Create root first
      hierarchicalActions.createNode(rootNodeId);

      // Create child
      const childNode = hierarchicalActions.createNode(childNodeId, {
        parent: rootNodeId,
        data: { name: 'Child Node' }
      });

      expect(childNode.id).toBe(childNodeId);
      expect(childNode.parent).toBe(rootNodeId);
      expect(hierarchicalStore.nodes.has(childNodeId)).toBe(true);
      expect(hierarchicalStore.rootNodes.has(childNodeId)).toBe(false);

      // Check parent-child relationship
      const parentNode = hierarchicalStore.nodes.get(rootNodeId);
      expect(parentNode?.children).toContain(childNodeId);
    });

    it('should update node position', () => {
      hierarchicalActions.createNode(rootNodeId);

      const newPosition = { x: 100 as any, y: 200 as any };
      hierarchicalActions.updateNodePosition(rootNodeId, newPosition);

      const node = hierarchicalStore.nodes.get(rootNodeId);
      expect(node?.position.x).toBe(100);
      expect(node?.position.y).toBe(200);
      expect(node?.layoutPosition.x).toBe(100);
      expect(node?.layoutPosition.y).toBe(200);
    });

    it('should update node level and depth', () => {
      hierarchicalActions.createNode(rootNodeId);

      hierarchicalActions.updateNodeLevel(rootNodeId, 2 as any, 3 as any);

      const node = hierarchicalStore.nodes.get(rootNodeId);
      expect(node?.level).toBe(2);
      expect(node?.depth).toBe(3);
    });

    it('should toggle node expansion', () => {
      hierarchicalActions.createNode(rootNodeId);

      // Initially expanded
      let node = hierarchicalStore.nodes.get(rootNodeId);
      expect(node?.expanded).toBe(true);

      // Toggle to collapsed
      hierarchicalActions.toggleNodeExpansion(rootNodeId);
      node = hierarchicalStore.nodes.get(rootNodeId);
      expect(node?.expanded).toBe(false);

      // Toggle back to expanded
      hierarchicalActions.toggleNodeExpansion(rootNodeId);
      node = hierarchicalStore.nodes.get(rootNodeId);
      expect(node?.expanded).toBe(true);
    });

    it('should remove node and its children', () => {
      // Create hierarchy
      hierarchicalActions.createNode(rootNodeId);
      hierarchicalActions.createNode(childNodeId, { parent: rootNodeId });
      const grandchildNodeId = generateId() as TElementId;
      hierarchicalActions.createNode(grandchildNodeId, { parent: childNodeId });

      expect(hierarchicalStore.nodes.size).toBe(3);

      // Remove root node (should remove all)
      hierarchicalActions.removeNode(rootNodeId);

      expect(hierarchicalStore.nodes.size).toBe(0);
      expect(hierarchicalStore.rootNodes.size).toBe(0);
    });
  });

  describe('Navigation', () => {
    let nodeId1: TElementId;
    let nodeId2: TElementId;
    let nodeId3: TElementId;

    beforeEach(() => {
      nodeId1 = generateId() as TElementId;
      nodeId2 = generateId() as TElementId;
      nodeId3 = generateId() as TElementId;

      hierarchicalActions.createNode(nodeId1);
      hierarchicalActions.createNode(nodeId2);
      hierarchicalActions.createNode(nodeId3);
    });

    it('should focus on a node', () => {
      hierarchicalActions.focusNode(nodeId1);

      expect(hierarchicalStore.navigation.focusedNode).toBe(nodeId1);
      expect(hierarchicalStore.navigation.history).toEqual([nodeId1]);
      expect(hierarchicalStore.navigation.historyIndex).toBe(0);
      expect(hierarchicalStore.navigation.breadcrumbTrail).toEqual([nodeId1]);
    });

    it('should build navigation history', () => {
      hierarchicalActions.focusNode(nodeId1);
      hierarchicalActions.focusNode(nodeId2);
      hierarchicalActions.focusNode(nodeId3);

      expect(hierarchicalStore.navigation.history).toEqual([nodeId1, nodeId2, nodeId3]);
      expect(hierarchicalStore.navigation.historyIndex).toBe(2);
      expect(hierarchicalStore.navigation.focusedNode).toBe(nodeId3);
    });

    it('should navigate back in history', () => {
      hierarchicalActions.focusNode(nodeId1);
      hierarchicalActions.focusNode(nodeId2);
      hierarchicalActions.focusNode(nodeId3);

      hierarchicalActions.navigateBack();

      expect(hierarchicalStore.navigation.historyIndex).toBe(1);
      expect(hierarchicalStore.navigation.focusedNode).toBe(nodeId2);
    });

    it('should navigate forward in history', () => {
      hierarchicalActions.focusNode(nodeId1);
      hierarchicalActions.focusNode(nodeId2);
      hierarchicalActions.focusNode(nodeId3);

      // Go back first
      hierarchicalActions.navigateBack();
      expect(hierarchicalStore.navigation.focusedNode).toBe(nodeId2);

      // Then forward
      hierarchicalActions.navigateForward();
      expect(hierarchicalStore.navigation.focusedNode).toBe(nodeId3);
    });

    it('should build breadcrumb trail for hierarchical nodes', () => {
      // Create hierarchy: root -> child -> grandchild
      hierarchicalActions.createNode(nodeId1);
      hierarchicalActions.createNode(nodeId2, { parent: nodeId1 });
      hierarchicalActions.createNode(nodeId3, { parent: nodeId2 });

      const trail = hierarchicalActions.buildBreadcrumbTrail(nodeId3);
      expect(trail).toEqual([nodeId1, nodeId2, nodeId3]);
    });
  });

  describe('Configuration Management', () => {
    it('should update layout configuration', () => {
      const newConfig = {
        nodeSpacing: 150 as any,
        algorithm: 'radial' as const
      };

      hierarchicalActions.updateLayoutConfig(newConfig);

      expect(hierarchicalStore.layoutConfig.nodeSpacing).toBe(150);
      expect(hierarchicalStore.layoutConfig.levelSpacing).toBe(150); // unchanged
      expect(hierarchicalStore.layoutConfig.algorithm).toBe('radial');
    });

    it('should update animation configuration', () => {
      const newConfig = {
        duration: 500,
        centerNode: false
      };

      hierarchicalActions.updateAnimationConfig(newConfig);

      expect(hierarchicalStore.animationConfig.targetZoom).toBe(1.5); // unchanged
      expect(hierarchicalStore.animationConfig.duration).toBe(500);
      expect(hierarchicalStore.animationConfig.centerNode).toBe(false);
    });
  });

  describe('Store Management', () => {
    it('should enable/disable hierarchical mode', () => {
      expect(hierarchicalStore.isEnabled).toBe(false);

      hierarchicalActions.setEnabled(true);
      expect(hierarchicalStore.isEnabled).toBe(true);

      hierarchicalActions.setEnabled(false);
      expect(hierarchicalStore.isEnabled).toBe(false);
    });

    it('should clear all data', () => {
      // Add some data
      const nodeId = generateId() as TElementId;
      hierarchicalActions.createNode(nodeId);
      hierarchicalActions.focusNode(nodeId);
      hierarchicalActions.setEnabled(true);

      expect(hierarchicalStore.nodes.size).toBe(1);
      expect(hierarchicalStore.isEnabled).toBe(true);

      // Clear
      hierarchicalActions.clear();

      expect(hierarchicalStore.nodes.size).toBe(0);
      expect(hierarchicalStore.rootNodes.size).toBe(0);
      expect(hierarchicalStore.navigation.focusedNode).toBe(null);
      expect(hierarchicalStore.navigation.history).toEqual([]);
      // isEnabled should remain unchanged
      expect(hierarchicalStore.isEnabled).toBe(true);
    });
  });
});