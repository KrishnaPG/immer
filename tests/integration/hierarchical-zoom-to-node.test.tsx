import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HierarchicalViewport } from '@/lib/components/HierarchicalViewport';
import { HierarchicalNode } from '@/lib/components/HierarchicalNode';
import { hierarchicalActions } from '@/lib/state/hierarchical-store';
import { generateId } from '@/lib/utils/id-generator';
import type { TElementId } from '@/types/branded.types';

// Mock framer-motion
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    motion: {
      div: 'div',
    },
    useAnimation: () => ({
      start: vi.fn().mockResolvedValue(undefined),
    }),
  };
});

// Mock viewport hooks
vi.mock('@/lib/components/hooks/useViewport', () => ({
  useViewport: () => ({
    viewport: {
      setTransform: vi.fn(),
      zoomIn: vi.fn(),
      zoomOut: vi.fn(),
      getTransform: vi.fn(() => null),
    },
    basis: null,
  }),
}));

describe('Hierarchical Zoom-to-Node Integration', () => {
  let rootNodeId: TElementId;
  let childNodeId1: TElementId;
  let childNodeId2: TElementId;
  let grandchildNodeId: TElementId;

  beforeEach(() => {
    vi.clearAllMocks();
    hierarchicalActions.clear();

    // Create test hierarchy
    rootNodeId = generateId() as TElementId;
    childNodeId1 = generateId() as TElementId;
    childNodeId2 = generateId() as TElementId;
    grandchildNodeId = generateId() as TElementId;

    hierarchicalActions.createNode(rootNodeId, {
      data: { name: 'Root' }
    });
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

  describe('Basic Zoom-to-Node Functionality', () => {
    it('should render hierarchical viewport with nodes', () => {
      const onNodeFocus = vi.fn();
      const onZoomComplete = vi.fn();

      render(
        <HierarchicalViewport
          id="test-viewport"
          hierarchical={true}
          onNodeFocus={onNodeFocus}
          onZoomComplete={onZoomComplete}
        >
          <HierarchicalNode id={rootNodeId} />
          <HierarchicalNode id={childNodeId1} />
          <HierarchicalNode id={childNodeId2} />
          <HierarchicalNode id={grandchildNodeId} />
        </HierarchicalViewport>
      );

      // Should render all nodes
      expect(screen.getByText('Root')).toBeInTheDocument();
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(screen.getByText('Grandchild')).toBeInTheDocument();
    });

    it('should focus on node when clicked', async () => {
      const onNodeFocus = vi.fn();

      render(
        <HierarchicalViewport
          id="test-viewport"
          hierarchical={true}
          onNodeFocus={onNodeFocus}
        >
          <HierarchicalNode id={rootNodeId} />
          <HierarchicalNode id={childNodeId1} />
          <HierarchicalNode id={childNodeId2} />
          <HierarchicalNode id={grandchildNodeId} />
        </HierarchicalViewport>
      );

      // Click on child node 2
      const childNode2 = screen.getByText('Child 2');
      fireEvent.click(childNode2);

      // Should trigger focus
      await waitFor(() => {
        expect(onNodeFocus).toHaveBeenCalledWith(childNodeId2);
      });
    });

    it('should update navigation state when node is focused', async () => {
      render(
        <HierarchicalViewport
          id="test-viewport"
          hierarchical={true}
        >
          <HierarchicalNode id={rootNodeId} />
          <HierarchicalNode id={childNodeId1} />
          <HierarchicalNode id={childNodeId2} />
          <HierarchicalNode id={grandchildNodeId} />
        </HierarchicalViewport>
      );

      // Click on grandchild node
      const grandchildNode = screen.getByText('Grandchild');
      fireEvent.click(grandchildNode);

      // Should update navigation state
      await waitFor(() => {
        const navigation = hierarchicalStore.navigation;
        expect(navigation.focusedNode).toBe(grandchildNodeId);
        expect(navigation.history).toContain(grandchildNodeId);
        expect(navigation.breadcrumbTrail).toEqual([rootNodeId, childNodeId1, grandchildNodeId]);
      });
    });
  });

  describe('Navigation Controls', () => {
    it('should show navigation controls when enabled', () => {
      render(
        <HierarchicalViewport
          id="test-viewport"
          hierarchical={true}
          controls={true}
        >
          <HierarchicalNode id={rootNodeId} />
          <HierarchicalNode id={childNodeId1} />
          <HierarchicalNode id={childNodeId2} />
          <HierarchicalNode id={grandchildNodeId} />
        </HierarchicalViewport>
      );

      // Should show control buttons
      expect(screen.getByTitle('Zoom in')).toBeInTheDocument();
      expect(screen.getByTitle('Zoom out')).toBeInTheDocument();
      expect(screen.getByTitle('Reset view')).toBeInTheDocument();
    });

    it('should enable back/forward buttons after navigation', async () => {
      render(
        <HierarchicalViewport
          id="test-viewport"
          hierarchical={true}
          controls={true}
        >
          <HierarchicalNode id={rootNodeId} />
          <HierarchicalNode id={childNodeId1} />
          <HierarchicalNode id={childNodeId2} />
          <HierarchicalNode id={grandchildNodeId} />
        </HierarchicalViewport>
      );

      // Navigate to create history
      const childNode1 = screen.getByText('Child 1');
      fireEvent.click(childNode1);

      await waitFor(() => {
        expect(screen.getByTitle('Navigate back')).toBeInTheDocument();
      });

      const grandchildNode = screen.getByText('Grandchild');
      fireEvent.click(grandchildNode);

      await waitFor(() => {
        expect(screen.getByTitle('Navigate forward')).toBeInTheDocument();
      });
    });

    it('should show breadcrumb trail for deep navigation', async () => {
      render(
        <HierarchicalViewport
          id="test-viewport"
          hierarchical={true}
          controls={true}
        >
          <HierarchicalNode id={rootNodeId} />
          <HierarchicalNode id={childNodeId1} />
          <HierarchicalNode id={childNodeId2} />
          <HierarchicalNode id={grandchildNodeId} />
        </HierarchicalViewport>
      );

      // Navigate to grandchild
      const grandchildNode = screen.getByText('Grandchild');
      fireEvent.click(grandchildNode);

      await waitFor(() => {
        // Should show breadcrumb trail (3 nodes)
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
      });
    });
  });

  describe('Node Expansion/Collapse', () => {
    it('should show expansion indicator for nodes with children', () => {
      render(
        <HierarchicalViewport
          id="test-viewport"
          hierarchical={true}
        >
          <HierarchicalNode id={rootNodeId} />
          <HierarchicalNode id={childNodeId1} />
          <HierarchicalNode id={childNodeId2} />
          <HierarchicalNode id={grandchildNodeId} />
        </HierarchicalViewport>
      );

      // Root node should have expansion indicator (2 children)
      const rootNode = screen.getByText('Root');
      expect(rootNode.closest('.affine-hierarchical-node')?.querySelector('.bg-blue-500')).toBeInTheDocument();

      // Child node 1 should have expansion indicator (1 child)
      const childNode1 = screen.getByText('Child 1');
      expect(childNode1.closest('.affine-hierarchical-node')?.querySelector('.bg-blue-500')).toBeInTheDocument();

      // Child node 2 should not have expansion indicator (0 children)
      const childNode2 = screen.getByText('Child 2');
      expect(childNode2.closest('.affine-hierarchical-node')?.querySelector('.bg-blue-500')).not.toBeInTheDocument();
    });

    it('should toggle node expansion when clicking expansion button', () => {
      render(
        <HierarchicalViewport
          id="test-viewport"
          hierarchical={true}
        >
          <HierarchicalNode id={rootNodeId} />
          <HierarchicalNode id={childNodeId1} />
          <HierarchicalNode id={childNodeId2} />
          <HierarchicalNode id={grandchildNodeId} />
        </HierarchicalViewport>
      );

      // Find and click expansion button on root node
      const rootNode = screen.getByText('Root');
      const expansionButton = rootNode.closest('.affine-hierarchical-node')?.querySelector('.bg-blue-500');

      expect(expansionButton).toBeInTheDocument();
      expect(expansionButton?.textContent).toBe('−'); // Initially expanded

      fireEvent.click(expansionButton!);

      // Should now show collapsed state
      expect(expansionButton?.textContent).toBe('+');
    });
  });

  describe('Custom Node Rendering', () => {
    it('should use custom node renderer when provided', () => {
      const customRenderer = (node: any) => (
        <div className="custom-node">
          Custom: {node.data?.name}
        </div>
      );

      render(
        <HierarchicalViewport
          id="test-viewport"
          hierarchical={true}
        >
          <HierarchicalNode
            id={rootNodeId}
            renderNode={customRenderer}
          />
        </HierarchicalViewport>
      );

      expect(screen.getByText('Custom: Root')).toBeInTheDocument();
      expect(screen.queryByText('Node 0')).not.toBeInTheDocument();
    });
  });

  describe('Imperative API', () => {
    it('should expose zoomToNode method via ref', async () => {
      const ref = { current: null };
      const onZoomComplete = vi.fn();

      render(
        <HierarchicalViewport
          ref={ref}
          id="test-viewport"
          hierarchical={true}
          onZoomComplete={onZoomComplete}
        >
          <HierarchicalNode id={rootNodeId} />
          <HierarchicalNode id={childNodeId1} />
          <HierarchicalNode id={childNodeId2} />
          <HierarchicalNode id={grandchildNodeId} />
        </HierarchicalViewport>
      );

      // Call zoomToNode imperatively
      await ref.current?.zoomToNode(childNodeId2);

      expect(onZoomComplete).toHaveBeenCalledWith(childNodeId2, expect.any(Object));
    });

    it('should expose focusNode method via ref', async () => {
      const ref = { current: null };
      const onNodeFocus = vi.fn();

      render(
        <HierarchicalViewport
          ref={ref}
          id="test-viewport"
          hierarchical={true}
          onNodeFocus={onNodeFocus}
        >
          <HierarchicalNode id={rootNodeId} />
          <HierarchicalNode id={childNodeId1} />
          <HierarchicalNode id={childNodeId2} />
          <HierarchicalNode id={grandchildNodeId} />
        </HierarchicalViewport>
      );

      // Call focusNode imperatively
      ref.current?.focusNode(grandchildNodeId);

      await waitFor(() => {
        expect(onNodeFocus).toHaveBeenCalledWith(grandchildNodeId);
      });
    });

    it('should expose resetView method via ref', async () => {
      const ref = { current: null };

      render(
        <HierarchicalViewport
          ref={ref}
          id="test-viewport"
          hierarchical={true}
        >
          <HierarchicalNode id={rootNodeId} />
          <HierarchicalNode id={childNodeId1} />
          <HierarchicalNode id={childNodeId2} />
          <HierarchicalNode id={grandchildNodeId} />
        </HierarchicalViewport>
      );

      // Call resetView imperatively
      await ref.current?.resetView();

      // Should not throw and should complete successfully
      expect(ref.current).toBeTruthy();
    });
  });

  describe('Animation Configuration', () => {
    it('should use custom animation configuration when provided', async () => {
      const ref = { current: null };
      const customConfig = {
        targetZoom: 2.5 as any,
        duration: 500,
        easing: 'ease-in-out',
        centerNode: false
      };

      render(
        <HierarchicalViewport
          ref={ref}
          id="test-viewport"
          hierarchical={true}
          animationConfig={customConfig}
        >
          <HierarchicalNode id={rootNodeId} />
          <HierarchicalNode id={childNodeId1} />
          <HierarchicalNode id={childNodeId2} />
          <HierarchicalNode id={grandchildNodeId} />
        </HierarchicalViewport>
      );

      // Call zoomToNode with custom config
      await ref.current?.zoomToNode(childNodeId1, customConfig);

      // Should complete without errors
      expect(ref.current).toBeTruthy();
    });
  });
});