/**
 * Hierarchical Network Zoom-to-Node Example
 * Demonstrates large hierarchical networks with smooth zoom-to-node functionality
 */

import clsx from "clsx";
import React, { useRef, useState } from "react";
import {
	HierarchicalNode,
	HierarchicalNodeContainer,
} from "@/lib/components/react/HierarchicalNode";
import { Viewport, type ViewportRef } from "@/lib/components/Viewport";
import {
	useHierarchical,
	useHierarchicalNavigation,
} from "@/lib/hooks/useHierarchical";
import { hierarchicalActions, hierarchicalStore } from "@/lib/state/hierarchical-store";
import { generateId } from "@/lib/utils/id-generator";
import type { TElementId } from "@/types/branded.types";
import type { IHierarchicalNode } from "@/types/hierarchical.interfaces";

/**
 * Generate large hierarchical dataset
 */
const generateHierarchicalData = (branchingFactor: number, depth: number) => {
	const nodes: Array<{
		id: TElementId;
		parentId?: TElementId;
		name: string;
		level: number;
	}> = [];

	const createNode = (
		level: number,
		parentId?: TElementId,
		path = "root",
	): TElementId => {
		const nodeId = generateId() as TElementId;
		const name =
			level === 0 ? "Root" : `${path.split("-").pop()}-${nodes.length}`;

		nodes.push({ id: nodeId, parentId, name, level });

		if (level < depth) {
			for (let i = 0; i < branchingFactor; i++) {
				createNode(level + 1, nodeId, `${path}-${i}`);
			}
		}

		return nodeId;
	};

	const rootNodeId = createNode(0);
	return { rootNodeId, nodes };
};

/**
 * Custom node renderer for large networks
 */
const NetworkNodeRenderer: React.FC<{
	node: IHierarchicalNode;
	onClick: () => void;
}> = ({ node, onClick }) => {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<div
			className={clsx(
				"relative flex flex-col items-center justify-center",
				"min-w-[80px] min-h-[60px] px-3 py-2",
				"bg-white border-2 rounded-lg shadow-md",
				"cursor-pointer select-none transition-all",
				"hover:shadow-lg hover:scale-105",
				{
					"border-purple-400 bg-purple-50": node.level === 0,
					"border-blue-400 bg-blue-50": node.level === 1,
					"border-green-400 bg-green-50": node.level === 2,
					"border-gray-400 bg-gray-50": node.level >= 3,
					"ring-2 ring-blue-300": isHovered,
				},
			)}
			onClick={onClick}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<div className="text-xs font-semibold text-gray-700 mb-1">
				{(node.data as any)?.name as string}
			</div>

			<div className="flex items-center gap-2 text-xs text-gray-500">
				<span>L{node.level}</span>
				{node.children.length > 0 && (
					<span className="bg-blue-100 text-blue-700 px-1 rounded">
						{node.children.length}
					</span>
				)}
			</div>

			{/* Status indicator */}
			<div
				className={clsx("absolute -top-1 -right-1 w-3 h-3 rounded-full", {
					"bg-green-500": node.expanded,
					"bg-orange-500": !node.expanded,
				})}
			/>
		</div>
	);
};

/**
 * Breadcrumb navigation component
 */
const BreadcrumbNavigation: React.FC<{ navigation: any; getNode: (id: any) => any }> = ({
	navigation,
	getNode
}) => {
	if (navigation.breadcrumbTrail.length <= 1) return null;

	return (
		<div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm">
			<span className="text-sm text-gray-500">Path:</span>
			{navigation.breadcrumbTrail.map((nodeId: any, index: number) => {
				const { node } = getNode(nodeId);
				return (
					<React.Fragment key={nodeId}>
						{index > 0 && <span className="text-gray-400">→</span>}
						<button
							type="button"
							onClick={() => navigation.focusNode(nodeId)}
							className="text-sm font-medium text-blue-600 hover:text-blue-800"
						>
							{(node?.data as any)?.name as string}
						</button>
					</React.Fragment>
				);
			})}
		</div>
	);
};

/**
 * Statistics panel
 */
const StatisticsPanel: React.FC = () => {
	const hierarchical = useHierarchical();
	const navigation = useHierarchicalNavigation();

	return (
		<div className="bg-white rounded-lg shadow-sm p-4">
			<h3 className="text-sm font-semibold text-gray-700 mb-2">
				Network Statistics
			</h3>
			<div className="grid grid-cols-2 gap-2 text-xs">
				<div>
					<span className="text-gray-500">Total Nodes:</span>
					<span className="ml-2 font-medium">{hierarchical.nodeCount}</span>
				</div>
				<div>
					<span className="text-gray-500">Root Nodes:</span>
					<span className="ml-2 font-medium">{hierarchical.rootNodeCount}</span>
				</div>
				<div>
					<span className="text-gray-500">Focused:</span>
					<span className="ml-2 font-medium">
						{navigation.focusedNode
							? `Node ${navigation.focusedNode.slice(-6)}`
							: "None"}
					</span>
				</div>
				<div>
					<span className="text-gray-500">History:</span>
					<span className="ml-2 font-medium">{navigation.history.length}</span>
				</div>
			</div>
		</div>
	);
};

/**
 * Main hierarchical network example
 */
export const HierarchicalNetworkExample: React.FC = () => {
	const viewportRef = useRef<ViewportRef>(null);
	const [layoutAlgorithm, setLayoutAlgorithm] = useState<
		"tree" | "cluster" | "radial" | "force"
	>("tree");
	const [isInitialized, setIsInitialized] = useState(false);
	
	// Call hooks at top level - single instance of useHierarchical
	const hierarchical = useHierarchical();
	const navigation = useHierarchicalNavigation();
	const { useNode } = hierarchical; // Get useNode from the same hierarchical instance

	// Generate sample data - initialization effect (runs only once)
	React.useEffect(() => {
		if (!isInitialized) {
			const { rootNodeId, nodes } = generateHierarchicalData(3, 4); // 3 branches, 4 levels = ~121 nodes

			// Create nodes in store
			nodes.forEach(({ id, parentId, name, level }) => {
				hierarchicalActions.createNode(id, {
					parent: parentId,
					data: { name, level },
					expanded: level < 2, // Auto-expand first 2 levels
				});
			});

			// Focus on root initially
			hierarchicalActions.focusNode(rootNodeId);

			// Enable hierarchical mode
			hierarchicalActions.setEnabled(true);

			// Update initial layout configuration with current layoutAlgorithm
			hierarchicalActions.updateLayoutConfig({
				nodeSpacing: 120 as any,
				levelSpacing: 100 as any,
				algorithm: layoutAlgorithm,
			});

			setIsInitialized(true);
		}
	}, [isInitialized]); // Remove layoutAlgorithm to prevent re-initialization

	// Handle layout algorithm changes - separate effect
	React.useEffect(() => {
		if (isInitialized) {
			hierarchicalActions.updateLayoutConfig({ algorithm: layoutAlgorithm });
		}
	}, [layoutAlgorithm, isInitialized]);

	// Handle layout algorithm change
	const handleLayoutChange = (algorithm: typeof layoutAlgorithm) => {
		setLayoutAlgorithm(algorithm);
	};

	// Handle zoom to specific node
	const handleZoomToNode = async (nodeId: TElementId) => {
		await viewportRef.current?.zoomToNode(nodeId, {
			targetZoom: 2.0 as any,
			duration: 500,
			easing: "ease-in-out",
		});
	};

	// Handle random node focus
	const handleRandomFocus = () => {
		// Use store proxy directly for non-reactive operations
		const nodes = Array.from(hierarchicalStore.nodes.values());
		const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
		if (randomNode) {
			handleZoomToNode(randomNode.id);
		}
	};

	// Handle reset view
	const handleResetView = async () => {
		await viewportRef.current?.resetView();
	};

	// Handle expand/collapse all
	const handleExpandAll = () => {
		// Use store proxy directly for non-reactive operations
		const nodes = Array.from(hierarchicalStore.nodes.values());
		nodes.forEach((node) => {
			if (!node.expanded) {
				hierarchicalActions.toggleNodeExpansion(node.id);
			}
		});
	};

	const handleCollapseAll = () => {
		// Use store proxy directly for non-reactive operations
		const nodes = Array.from(hierarchicalStore.nodes.values());
		nodes.forEach((node) => {
			if (node.expanded && node.children.length > 0) {
				hierarchicalActions.toggleNodeExpansion(node.id);
			}
		});
	};

	return (
		<div className="w-full h-screen flex flex-col bg-gray-100">
			{/* Header */}
			<div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
				<h1 className="text-2xl font-bold text-gray-800 mb-2">
					Hierarchical Network with Zoom-to-Node
				</h1>
				<p className="text-sm text-gray-600">
					Click any node to zoom to it with smooth animation. Navigate large
					hierarchical networks efficiently.
				</p>
			</div>

			{/* Controls */}
			<div className="bg-white shadow-sm border-b border-gray-200 px-6 py-3">
				<div className="flex items-center gap-4 flex-wrap">
					{/* Layout algorithm selector */}
					<div className="flex items-center gap-2">
						<label htmlFor="layout-select" className="text-sm font-medium text-gray-700">Layout:</label>
						<select
							id="layout-select"
							value={layoutAlgorithm}
							onChange={(e) => handleLayoutChange(e.target.value as any)}
							className="px-3 py-1 border border-gray-300 rounded text-sm"
						>
							<option value="tree">Tree</option>
							<option value="cluster">Cluster</option>
							<option value="radial">Radial</option>
							<option value="force">Force</option>
						</select>
					</div>

					{/* Action buttons */}
					<button
						type="button"
						onClick={handleRandomFocus}
						className="px-4 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
					>
						Random Focus
					</button>

					<button
						type="button"
						onClick={handleExpandAll}
						className="px-4 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600"
					>
						Expand All
					</button>

					<button
						type="button"
						onClick={handleCollapseAll}
						className="px-4 py-2 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
					>
						Collapse All
					</button>

					<button
						type="button"
						onClick={handleResetView}
						className="px-4 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
					>
						Reset View
					</button>

					{/* Node count indicator */}
					<div className="ml-auto text-sm text-gray-600">
						{hierarchical.nodeCount} nodes loaded
					</div>
				</div>
			</div>

			{/* Main content */}
			<div className="flex-1 flex">
				{/* Sidebar */}
				<div className="w-64 bg-white shadow-sm border-r border-gray-200 p-4 space-y-4">
					<BreadcrumbNavigation navigation={navigation} getNode={useNode} />
					<StatisticsPanel />

					{/* Quick actions */}
					<div className="bg-gray-50 rounded-lg p-4">
						<h3 className="text-sm font-semibold text-gray-700 mb-2">
							Quick Actions
						</h3>
						<div className="space-y-2">
							<button
								type="button"
								onClick={() =>
									viewportRef.current?.zoomToNode(hierarchical.rootNodes[0]!)
								}
								className="w-full px-3 py-2 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
							>
								Focus Root
							</button>
							<button
								type="button"
								onClick={() =>
									viewportRef.current?.zoomToNode(hierarchical.nodes[0]?.id!)
								}
								className="w-full px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
							>
								Focus First Node
							</button>
						</div>
					</div>
				</div>

				{/* Viewport */}
				<div className="flex-1 relative">
					{isInitialized && (
						<Viewport
							ref={viewportRef}
							id="hierarchical-network"
							hierarchical={true}
							controls={true}
							animationConfig={{
								targetZoom: 1.5 as any,
								duration: 400,
								easing: "ease-out",
								centerNode: true,
							}}
						>
							<HierarchicalNodeContainer
								nodeIds={Array.from(hierarchical.nodes.map((n) => n.id))}
								onNodeClick={handleZoomToNode}
								renderNode={(node) => (
									<NetworkNodeRenderer
										node={node}
										onClick={() => handleZoomToNode(node.id)}
									/>
								)}
							/>
						</Viewport>
					)}

					{!isInitialized && (
						<div className="flex items-center justify-center h-full">
							<div className="text-center">
								<div className="text-lg font-medium text-gray-600 mb-2">
									Generating hierarchical network...
								</div>
								<div className="text-sm text-gray-500">
									Creating ~{3 ** 4} nodes for demonstration
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default HierarchicalNetworkExample;
