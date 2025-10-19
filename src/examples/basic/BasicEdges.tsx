import type React from "react";
import { useState } from "react";
import { Edge, Node, Space, Viewport } from "../../lib/components";
import { Basis } from "../../lib/geometry/Basis";
import { AffineTransform } from "../../lib/geometry/transform";
import { Vector2D } from "../../lib/geometry/vector";
import type { TCoordinate } from "../../types/branded.types";

export const BasicEdges: React.FC = () => {
	const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
	const identityBasis = new Basis(AffineTransform.identity());

	const handleEdgeTap = (edgeId: string) => {
		console.log(`Edge ${edgeId} tapped!`);
		setSelectedEdge(edgeId);
	};

	return (
		<div className="w-full h-96">
			<h3 className="text-lg font-semibold mb-4">Basic Edges Example</h3>
			<p className="text-sm text-gray-600 mb-4">
				This example demonstrates Edge components connecting Node components.
				Click on edges to see interaction feedback.
			</p>
			<Viewport
				width="100%"
				height="100%"
				className="border-2 border-gray-300 rounded"
			>
				<Space>
					{/* Connected nodes */}
					<Node
						radius={20}
						position={
							new Vector2D(identityBasis, {
								x: 150 as TCoordinate,
								y: 100 as TCoordinate,
							})
						}
						fill="#3B82F6"
						stroke="#1E40AF"
						strokeWidth={2}
					/>

					<Node
						radius={25}
						position={
							new Vector2D(identityBasis, {
								x: 300 as TCoordinate,
								y: 200 as TCoordinate,
							})
						}
						fill="#10B981"
						stroke="#059669"
						strokeWidth={3}
					/>

					<Node
						radius={18}
						position={
							new Vector2D(identityBasis, {
								x: 100 as TCoordinate,
								y: 250 as TCoordinate,
							})
						}
						fill="#EF4444"
						stroke="#DC2626"
						strokeWidth={2}
					/>

					{/* Connecting edges */}
					<Edge
						startPoint={
							new Vector2D(identityBasis, {
								x: 150 as TCoordinate,
								y: 100 as TCoordinate,
							})
						}
						endPoint={
							new Vector2D(identityBasis, {
								x: 300 as TCoordinate,
								y: 200 as TCoordinate,
							})
						}
						stroke="#6B7280"
						strokeWidth={3}
						strokeDasharray="5,5"
						animated={true}
						onTap={() => handleEdgeTap("edge1")}
					/>

					<Edge
						startPoint={
							new Vector2D(identityBasis, {
								x: 300 as TCoordinate,
								y: 200 as TCoordinate,
							})
						}
						endPoint={
							new Vector2D(identityBasis, {
								x: 100 as TCoordinate,
								y: 250 as TCoordinate,
							})
						}
						stroke="#374151"
						strokeWidth={4}
						animated={true}
						onTap={() => handleEdgeTap("edge2")}
					/>

					<Edge
						startPoint={
							new Vector2D(identityBasis, {
								x: 100 as TCoordinate,
								y: 250 as TCoordinate,
							})
						}
						endPoint={
							new Vector2D(identityBasis, {
								x: 150 as TCoordinate,
								y: 100 as TCoordinate,
							})
						}
						stroke="#4B5563"
						strokeWidth={2}
						strokeDasharray="2,3"
						animated={true}
						onTap={() => handleEdgeTap("edge3")}
					/>
				</Space>
			</Viewport>
		</div>
	);
};
