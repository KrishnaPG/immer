import type React from "react";
import { useState } from "react";
import { Node, Space, Viewport } from "../../lib/components";
import { Basis } from "../../lib/geometry/Basis";
import { AffineTransform } from "../../lib/geometry/transform";
import { Vector2D } from "../../lib/geometry/vector";
import type { TCoordinate } from "../../types/branded.types";

export const BasicNodes: React.FC = () => {
	const [selectedNode, setSelectedNode] = useState<string | null>(null);

	// Create identity basis for simple positioning
	const identityBasis = new Basis(AffineTransform.identity());

	const handleNodeTap = (nodeId: string) => {
		console.log(`Node ${nodeId} tapped!`);
		setSelectedNode(nodeId);
	};

	return (
		<div className="w-full h-96">
			<h3 className="text-lg font-semibold mb-4">Basic Nodes Example</h3>
			<p className="text-sm text-gray-600 mb-4">
				This example demonstrates basic Node components with different colors
				and sizes. Click on nodes to select them and see the visual feedback.
			</p>
			<Viewport
				width="100%"
				height="100%"
				className="border-2 border-gray-300 rounded"
			>
				<Space>
					<Node
						radius={20}
						position={
							new Vector2D(identityBasis, {
								x: 100 as TCoordinate,
								y: 100 as TCoordinate,
							})
						}
						fill="#3B82F6"
						stroke="#1E40AF"
						strokeWidth={2}
						className={selectedNode === "blue" ? "ring-4 ring-yellow-400" : ""}
						onTap={() => handleNodeTap("blue")}
					/>

					<Node
						radius={25}
						position={
							new Vector2D(identityBasis, {
								x: 200 as TCoordinate,
								y: 150 as TCoordinate,
							})
						}
						fill="#10B981"
						stroke="#059669"
						strokeWidth={3}
						className={selectedNode === "green" ? "ring-4 ring-yellow-400" : ""}
						onTap={() => handleNodeTap("green")}
					/>

					<Node
						radius={15}
						position={
							new Vector2D(identityBasis, {
								x: 150 as TCoordinate,
								y: 250 as TCoordinate,
							})
						}
						fill="#EF4444"
						stroke="#DC2626"
						strokeWidth={2}
						className={selectedNode === "red" ? "ring-4 ring-yellow-400" : ""}
						onTap={() => handleNodeTap("red")}
					/>
				</Space>
			</Viewport>
		</div>
	);
};
