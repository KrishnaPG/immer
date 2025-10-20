import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HierarchicalNetworkExample } from '@/examples/hierarchical';
import { hierarchicalActions } from '@/lib/state/hierarchical-store';

// Mock framer-motion for E2E tests
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

describe('Hierarchical Network E2E Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hierarchicalActions.clear();
  });

  describe('Complete User Workflow', () => {
    it('should load hierarchical network and allow complete navigation workflow', async () => {
      const user = userEvent.setup();

      render(<HierarchicalNetworkExample />);

      // Wait for initialization
      await waitFor(() => {
        expect(screen.getByText(/nodes loaded/)).toBeInTheDocument();
      });

      // Should display initial network
      expect(screen.getByText('Hierarchical Network with Zoom-to-Node')).toBeInTheDocument();

      // Should show statistics
      await waitFor(() => {
        expect(screen.getByText(/Total Nodes:/)).toBeInTheDocument();
        expect(screen.getByText(/Root Nodes:/)).toBeInTheDocument();
      });

      // Test layout algorithm switching
      const layoutSelect = screen.getByDisplayValue('Tree');
      await user.selectOptions(layoutSelect, 'radial');
      expect(screen.getByDisplayValue('Radial')).toBeInTheDocument();

      await user.selectOptions(layoutSelect, 'force');
      expect(screen.getByDisplayValue('Force')).toBeInTheDocument();

      // Test random focus
      const randomFocusButton = screen.getByText('Random Focus');
      await user.click(randomFocusButton);

      // Test expand/collapse functionality
      const expandAllButton = screen.getByText('Expand All');
      await user.click(expandAllButton);

      const collapseAllButton = screen.getByText('Collapse All');
      await user.click(collapseAllButton);

      // Test reset view
      const resetViewButton = screen.getByText('Reset View');
      await user.click(resetViewButton);

      // All actions should complete without errors
      expect(screen.getByText('Hierarchical Network with Zoom-to-Node')).toBeInTheDocument();
    });

    it('should handle breadcrumb navigation', async () => {
      const user = userEvent.setup();

      render(<HierarchicalNetworkExample />);

      // Wait for initialization
      await waitFor(() => {
        expect(screen.getByText(/nodes loaded/)).toBeInTheDocument();
      });

      // Initially no breadcrumb (only root)
      expect(screen.queryByText(/Path:/)).not.toBeInTheDocument();

      // Click on a node to create navigation history
      const randomFocusButton = screen.getByText('Random Focus');
      await user.click(randomFocusButton);

      // Should show breadcrumb after navigation
      await waitFor(() => {
        expect(screen.getByText(/Path:/)).toBeInTheDocument();
      });

      // Should be able to click on breadcrumb items
      const breadcrumbItems = screen.getAllByText(/Root|Node \d+/);
      if (breadcrumbItems.length > 1) {
        await user.click(breadcrumbItems[1]);
      }
    });

    it('should handle quick actions in sidebar', async () => {
      const user = userEvent.setup();

      render(<HierarchicalNetworkExample />);

      // Wait for initialization
      await waitFor(() => {
        expect(screen.getByText(/nodes loaded/)).toBeInTheDocument();
      });

      // Test focus root button
      const focusRootButton = screen.getByText('Focus Root');
      await user.click(focusRootButton);

      // Test focus first node button
      const focusFirstNodeButton = screen.getByText('Focus First Node');
      await user.click(focusFirstNodeButton);

      // Should complete without errors
      expect(screen.getByText('Hierarchical Network with Zoom-to-Node')).toBeInTheDocument();
    });

    it('should display correct network statistics', async () => {
      render(<HierarchicalNetworkExample />);

      // Wait for initialization
      await waitFor(() => {
        expect(screen.getByText(/nodes loaded/)).toBeInTheDocument();
      });

      // Check statistics panel
      await waitFor(() => {
        expect(screen.getByText('Network Statistics')).toBeInTheDocument();
        expect(screen.getByText(/Total Nodes:/)).toBeInTheDocument();
        expect(screen.getByText(/Root Nodes:/)).toBeInTheDocument();
        expect(screen.getByText(/Focused:/)).toBeInTheDocument();
        expect(screen.getByText(/History:/)).toBeInTheDocument();
      });

      // Should have realistic node count (should be around 121 for 3^4)
      const nodeCountText = screen.getByText(/Total Nodes:/).textContent || '';
      const nodeCount = parseInt(nodeCountText.match(/\d+/)?.[0] || '0');
      expect(nodeCount).toBeGreaterThan(100);
      expect(nodeCount).toBeLessThan(200);
    });

    it('should handle layout algorithm changes smoothly', async () => {
      const user = userEvent.setup();

      render(<HierarchicalNetworkExample />);

      // Wait for initialization
      await waitFor(() => {
        expect(screen.getByText(/nodes loaded/)).toBeInTheDocument();
      });

      const layoutSelect = screen.getByDisplayValue('Tree');

      // Test all layout algorithms
      const algorithms = ['cluster', 'radial', 'force', 'tree'];

      for (const algorithm of algorithms) {
        await user.selectOptions(layoutSelect, algorithm.charAt(0).toUpperCase() + algorithm.slice(1));

        await waitFor(() => {
          expect(screen.getByDisplayValue(algorithm.charAt(0).toUpperCase() + algorithm.slice(1))).toBeInTheDocument();
        });

        // Should maintain network integrity
        expect(screen.getByText(/nodes loaded/)).toBeInTheDocument();
      }
    });

    it('should handle large network performance', async () => {
      render(<HierarchicalNetworkExample />);

      // Wait for initialization
      await waitFor(() => {
        expect(screen.getByText(/nodes loaded/)).toBeInTheDocument();
      }, { timeout: 10000 }); // Allow more time for large network

      // Should load substantial number of nodes
      const nodeCountText = screen.getByText(/nodes loaded/).textContent || '';
      const nodeCount = parseInt(nodeCountText.match(/\d+/)?.[0] || '0');
      expect(nodeCount).toBeGreaterThan(80); // At least 80 nodes should be loaded

      // UI should remain responsive
      expect(screen.getByText('Random Focus')).toBeEnabled();
      expect(screen.getByText('Expand All')).toBeEnabled();
      expect(screen.getByText('Collapse All')).toBeEnabled();
      expect(screen.getByText('Reset View')).toBeEnabled();
    });

    it('should handle error states gracefully', async () => {
      const user = userEvent.setup();

      render(<HierarchicalNetworkExample />);

      // Wait for initialization
      await waitFor(() => {
        expect(screen.getByText(/nodes loaded/)).toBeInTheDocument();
      });

      // Rapid successive actions should not break the UI
      const randomFocusButton = screen.getByText('Random Focus');

      for (let i = 0; i < 5; i++) {
        await user.click(randomFocusButton);
      }

      // UI should still be functional
      expect(screen.getByText('Hierarchical Network with Zoom-to-Node')).toBeInTheDocument();
      expect(screen.getByText(/nodes loaded/)).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should render correctly on different screen sizes', async () => {
      // Test mobile size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      });

      render(<HierarchicalNetworkExample />);

      await waitFor(() => {
        expect(screen.getByText(/nodes loaded/)).toBeInTheDocument();
      });

      // Should still show main content
      expect(screen.getByText('Hierarchical Network with Zoom-to-Node')).toBeInTheDocument();

      // Test desktop size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1080,
      });

      await waitFor(() => {
        expect(screen.getByText(/nodes loaded/)).toBeInTheDocument();
      });

      // Should adapt to larger screen
      expect(screen.getByText('Hierarchical Network with Zoom-to-Node')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and keyboard navigation', async () => {
      render(<HierarchicalNetworkExample />);

      await waitFor(() => {
        expect(screen.getByText(/nodes loaded/)).toBeInTheDocument();
      });

      // Check for proper headings
      expect(screen.getByRole('heading', { name: 'Hierarchical Network with Zoom-to-Node' })).toBeInTheDocument();

      // Check for button accessibility
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);

      // Important buttons should have accessible names
      expect(screen.getByRole('button', { name: /Random Focus/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Expand All/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Collapse All/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Reset View/ })).toBeInTheDocument();
    });
  });
});