import clsx from "clsx";
import { motion } from "framer-motion";
import type React from "react";
import { forwardRef, useCallback } from "react";
import type { TCoordinate, TElementId } from "@/types/branded.types";
import type { IHierarchicalNode } from "@/types/hierarchical.interfaces";
import { useHierarchicalNode } from "../../hooks/useHierarchical";

export interface HierarchicalNodeProps {
	id: TElementId;
	children?: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
	renderNode?: (node: IHierarchicalNode) => React.ReactNode;
	onNodeClick?: (nodeId: TElementId) => void;
	onNodeDoubleClick?: (nodeId: TElementId) => void;
	onNodeRightClick?: (nodeId: TElementId) => void;
	draggable?: boolean;
	expandable?: boolean;
	selectable?: boolean;
	selected?: boolean;
	expanded?: boolean;
	layoutData?: any;
	hierarchical?: boolean;
}

export const HierarchicalNode = forwardRef<
	HTMLDivElement,
	HierarchicalNodeProps
>(
	(
		{
			id,
			children,
			className = "",
			style,
			renderNode,
			onNodeClick,
			onNodeDoubleClick,
			onNodeRightClick,
			draggable = false,
			expandable = true,
			selectable = true,
			selected = false,
			expanded,
			layoutData,
			hierarchical = true,
			...props
		},
		ref,
	) => {
		const {
			node,
			exists,
			children: nodeChildren,
			parent,
			level,
			depth,
			expanded: isExpanded,
			position,
			layoutPosition,
			data,
			updatePosition,
			toggleExpansion,
			focus,
		} = useHierarchicalNode(id);

		// Handle click events
		const handleClick = useCallback(
			(event: React.MouseEvent) => {
				event.stopPropagation();
				onNodeClick?.(id);
				if (hierarchical) {
					focus();
				}
			},
			[id, onNodeClick, hierarchical, focus],
		);

		const handleDoubleClick = useCallback(
			(event: React.MouseEvent) => {
				event.stopPropagation();
				onNodeDoubleClick?.(id);
			},
			[id, onNodeDoubleClick],
		);

		const handleRightClick = useCallback(
			(event: React.MouseEvent) => {
				event.preventDefault();
				event.stopPropagation();
				onNodeRightClick?.(id);
			},
			[id, onNodeRightClick],
		);

		const handleToggleExpansion = useCallback(
			(event: React.MouseEvent) => {
				event.stopPropagation();
				toggleExpansion();
			},
			[toggleExpansion],
		);

		// Use provided expanded state or node's internal state
		const isNodeExpanded = expanded !== undefined ? expanded : isExpanded;

		// Calculate position based on layout data or node position
		let nodePosition = { x: 0 as TCoordinate, y: 0 as TCoordinate };
		if (hierarchical && layoutData?.nodes?.has(id)) {
			const layoutNode = layoutData.nodes.get(id);
			nodePosition = layoutNode.position;
		} else if (position) {
			nodePosition = position;
		}

		if (!exists) {
			console.warn(`HierarchicalNode: Node with id ${id} does not exist`);
			return null;
		}

		// Default node renderer
		const defaultRenderer = (nodeData: IHierarchicalNode) => (
			<div
				className={clsx(
					"affine-hierarchical-node",
					"flex items-center justify-center",
					"min-w-[60px] min-h-[40px]",
					"px-3 py-2",
					"bg-white border-2 border-blue-300 rounded-lg",
					"shadow-sm hover:shadow-md transition-shadow",
					"cursor-pointer select-none",
					selected && "border-blue-500 bg-blue-50",
					"text-sm font-medium text-gray-700",
				)}
			>
				<div className="text-center">
					<div className="font-semibold">{data?.name || `Node ${level}`}</div>
					{nodeChildren.length > 0 && (
						<div className="text-xs text-gray-500">
							{nodeChildren.length} children
						</div>
					)}
				</div>

				{/* Expansion indicator */}
				{expandable && nodeChildren.length > 0 && (
					<div
						className={clsx(
							"absolute -bottom-1 -right-1",
							"w-4 h-4 bg-blue-500 text-white",
							"rounded-full flex items-center justify-center",
							"text-xs font-bold cursor-pointer",
							"hover:bg-blue-600 transition-colors",
						)}
						onClick={handleToggleExpansion}
						title={isNodeExpanded ? "Collapse" : "Expand"}
					>
						{isNodeExpanded ? "−" : "+"}
					</div>
				)}
			</div>
		);

		const nodeContent = renderNode ? renderNode(node!) : defaultRenderer(node!);

		return (
			<motion.div
				ref={ref}
				className={clsx(
					"affine-hierarchical-node-wrapper",
					"absolute",
					className,
				)}
				style={{
					transform: `translate(${nodePosition.x}px, ${nodePosition.y}px)`,
					...style,
				}}
				initial={{ scale: 0, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				exit={{ scale: 0, opacity: 0 }}
				transition={{
					type: "spring",
					stiffness: 200,
					damping: 20,
					delay: depth * 0.05,
				}}
				onClick={handleClick}
				onDoubleClick={handleDoubleClick}
				onContextMenu={handleRightClick}
				draggable={draggable}
				{...props}
			>
				{nodeContent}

				{/* Connection lines to children */}
				{hierarchical && isNodeExpanded && nodeChildren.length > 0 && (
					<svg
						className="absolute top-0 left-0 w-full h-full pointer-events-none"
						style={{ zIndex: -1 }}
					>
						{nodeChildren.map((childId) => (
							<ConnectionLine
								key={childId}
								parentId={id}
								childId={childId}
								layoutData={layoutData}
							/>
						))}
					</svg>
				)}

				{/* Render children */}
				{hierarchical && isNodeExpanded && children && (
					<div className="absolute">{children}</div>
				)}
			</motion.div>
		);
	},
);

HierarchicalNode.displayName = "HierarchicalNode";

/**
 * Connection line between parent and child nodes
 */
const ConnectionLine: React.FC<{
	parentId: TElementId;
	childId: TElementId;
	layoutData?: any;
}> = ({ parentId, childId, layoutData }) => {
	if (!layoutData?.nodes) return null;

	const parentNode = layoutData.nodes.get(parentId);
	const childNode = layoutData.nodes.get(childId);

	if (!parentNode || !childNode) return null;

	const x1 = parentNode.position.x + 30; // Center of node
	const y1 = parentNode.position.y + 20; // Bottom of node
	const x2 = childNode.position.x + 30; // Center of child
	const y2 = childNode.position.y; // Top of child

	return (
		<line
			x1={x1}
			y1={y1}
			x2={x2}
			y2={y2}
			stroke="#94a3b8"
			strokeWidth="2"
			strokeDasharray="4 2"
		/>
	);
};

/**
 * Hierarchical node container for rendering multiple nodes
 */
export const HierarchicalNodeContainer: React.FC<{
	nodeIds: TElementId[];
	renderNode?: (node: IHierarchicalNode) => React.ReactNode;
	onNodeClick?: (nodeId: TElementId) => void;
	className?: string;
}> = ({ nodeIds, renderNode, onNodeClick, className }) => {
	return (
		<div className={clsx("affine-hierarchical-container", className)}>
			{nodeIds.map((nodeId) => (
				<HierarchicalNode
					key={nodeId}
					id={nodeId}
					renderNode={renderNode}
					onNodeClick={onNodeClick}
				/>
			))}
		</div>
	);
};
