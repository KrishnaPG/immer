import type React from "react";
import { useCallback, useState } from "react";
import {
	Arc,
	Edge,
	Node,
	Space,
	Viewport,
	ZoomControl,
} from "../../lib/components";
import { Basis } from "../../lib/geometry/Basis";
import { AffineTransform } from "../../lib/geometry/transform";
import { Vector2D } from "../../lib/geometry/vector";
import type { TCoordinate } from "../../types/branded.types";

export const InteractiveGraph: React.FC = () => {
	const [selectedNode, setSelectedNode] = useState<string | null>(null);
	const [nodePositions, setNodePositions] = useState({
		center: new Vector2D(new Basis(AffineTransform.identity()), {
			x: 250 as TCoordinate,
			y: 200 as TCoordinate,
		}),
		top: new Vector2D(new Basis(AffineTransform.identity()), {
			x: 250 as TCoordinate,
			y: 80 as TCoordinate,
		}),
		right: new Vector2D(new Basis(AffineTransform.identity()), {
			x: 370 as TCoordinate,
			y: 200 as TCoordinate,
		}),
		bottom: new Vector2D(new Basis(AffineTransform.identity()), {
			x: 250 as TCoordinate,
			y: 320 as TCoordinate,
		}),
		left: new Vector2D(new Basis(AffineTransform.identity()), {
			x: 130 as TCoordinate,
			y: 200 as TCoordinate,
		}),
	});
	const [zoomLevel, setZoomLevel] = useState(1);

	const identityBasis = new Basis(AffineTransform.identity());

	const handleNodeTap = useCallback((nodeId: string) => {
		console.log(`Node ${nodeId} tapped!`);
		setSelectedNode(nodeId);
	}, []);

	const handleNodeDrag = useCallback(
		(nodeId: string, delta: Vector2D) => {
			console.log(`Node ${nodeId} dragged:`, delta);
			setNodePositions((prev) => ({
				...prev,
				[nodeId]: new Vector2D(identityBasis, {
					x: (prev[nodeId as keyof typeof prev].x + delta.x) as TCoordinate,
					y: (prev[nodeId as keyof typeof prev].y + delta.y) as TCoordinate,
				}),
			}));
		},
		[identityBasis],
	);

	const handleZoomIn = useCallback(() => {
		setZoomLevel((prev) => Math.min(prev * 1.5, 5));
	}, []);

	const handleZoomOut = useCallback(() => {
		setZoomLevel((prev) => Math.max(prev / 1.5, 0.1));
	}, []);

	const handleZoomReset = useCallback(() => {
		setZoomLevel(1);
	}, []);

	return (
		<div className="w-full h-96">
			<h3 className="text-lg font-semibold mb-4">Interactive Graph Example</h3>
			<p className="text-sm text-gray-600 mb-4">
				Advanced example with draggable nodes, connecting edges and arcs, plus
				zoom controls. Drag nodes to move them around and see how connections
				update.
			</p>
			<Viewport
				width="100%"
				height="100%"
				className="border-2 border-gray-300 rounded relative"
			>
				<Space>
					{/* Central node */}
					<Node
						radius={25}
						position={nodePositions.center}
						fill="#8B5CF6"
						stroke="#7C3AED"
						strokeWidth={3}
						className={
							selectedNode === "center" ? "ring-4 ring-yellow-400" : ""
						}
						onTap={() => handleNodeTap("center")}
						onDrag={(delta) => handleNodeDrag("center", delta)}
					/>

					{/* Connected nodes */}
					<Node
						radius={20}
						position={nodePositions.top}
						fill="#3B82F6"
						stroke="#1E40AF"
						strokeWidth={2}
						className={selectedNode === "top" ? "ring-4 ring-yellow-400" : ""}
						onTap={() => handleNodeTap("top")}
						onDrag={(delta) => handleNodeDrag("top", delta)}
					/>

					<Node
						radius={22}
						position={nodePositions.right}
						fill="#10B981"
						stroke="#059669"
						strokeWidth={2}
						className={selectedNode === "right" ? "ring-4 ring-yellow-400" : ""}
						onTap={() => handleNodeTap("right")}
						onDrag={(delta) => handleNodeDrag("right", delta)}
					/>

					<Node
						radius={18}
						position={nodePositions.bottom}
						fill="#EF4444"
						stroke="#DC2626"
						strokeWidth={2}
						className={
							selectedNode === "bottom" ? "ring-4 ring-yellow-400" : ""
						}
						onTap={() => handleNodeTap("bottom")}
						onDrag={(delta) => handleNodeDrag("bottom", delta)}
					/>

					<Node
						radius={20}
						position={nodePositions.left}
						fill="#F59E0B"
						stroke="#D97706"
						strokeWidth={2}
						className={selectedNode === "left" ? "ring-4 ring-yellow-400" : ""}
						onTap={() => handleNodeTap("left")}
						onDrag={(delta) => handleNodeDrag("left", delta)}
					/>

					{/* Connecting edges */}
					<Edge
						startPoint={nodePositions.center}
						endPoint={nodePositions.top}
						stroke="#6B7280"
						strokeWidth={3}
						animated={true}
					/>

					<Edge
						startPoint={nodePositions.center}
						endPoint={nodePositions.right}
						stroke="#374151"
						strokeWidth={4}
						animated={true}
					/>

					<Edge
						startPoint={nodePositions.center}
						endPoint={nodePositions.bottom}
						stroke="#4B5563"
						strokeWidth={2}
						strokeDasharray="5,5"
						animated={true}
					/>

					<Edge
						startPoint={nodePositions.center}
						endPoint={nodePositions.left}
						stroke="#9CA3AF"
						strokeWidth={3}
						animated={true}
					/>

					{/* Curved arcs */}
					<Arc
						center={nodePositions.center}
						radius={60}
						startAngle={0}
						endAngle={90}
						stroke="#8B5CF6"
						strokeWidth={3}
						fill="none"
						animated={true}
					/>

					<Arc
						center={nodePositions.center}
						radius={80}
						startAngle={180}
						endAngle={270}
						stroke="#EC4899"
						strokeWidth={4}
						fill="none"
						animated={true}
					/>
				</Space>

				{/* Zoom Control */}
				<ZoomControl
					position="bottom-right"
					size="medium"
					onZoomIn={handleZoomIn}
					onZoomOut={handleZoomOut}
					onReset={handleZoomReset}
				/>
			</Viewport>
		</div>
	);
};
