import type React from "react";
import { useCallback, useState } from "react";
import { Node, Space, Viewport } from "../../lib/components";
import { Basis } from "../../lib/geometry/Basis";
import { AffineTransform } from "../../lib/geometry/transform";
import { Vector2D } from "../../lib/geometry/vector";
import type { TCoordinate } from "../../types/branded.types";

export const TouchInteractions: React.FC = () => {
	const [interactionLog, setInteractionLog] = useState<string[]>([]);
	const [selectedNode, setSelectedNode] = useState<string | null>(null);
	const identityBasis = new Basis(AffineTransform.identity());

	const addToLog = useCallback((message: string) => {
		setInteractionLog((prev) => [
			...prev.slice(-4),
			`${new Date().toLocaleTimeString()}: ${message}`,
		]);
	}, []);

	const handleNodeTap = useCallback(
		(nodeId: string) => {
			setSelectedNode(nodeId);
			addToLog(`Node ${nodeId} tapped`);
		},
		[addToLog],
	);

	const handleNodeDrag = useCallback(
		(nodeId: string, delta: Vector2D) => {
			addToLog(
				`Node ${nodeId} dragged (${delta.x.toFixed(0)}, ${delta.y.toFixed(0)})`,
			);
		},
		[addToLog],
	);

	const handleNodeScale = useCallback(
		(nodeId: string, event: any) => {
			addToLog(
				`Node ${nodeId} scaled by ${event.scale?.toFixed(2) || "unknown"}`,
			);
		},
		[addToLog],
	);

	const handleNodeRotate = useCallback(
		(nodeId: string, event: any) => {
			addToLog(
				`Node ${nodeId} rotated by ${event.angle?.toFixed(1) || "unknown"}°`,
			);
		},
		[addToLog],
	);

	const handleNodeHold = useCallback(
		(nodeId: string) => {
			addToLog(`Node ${nodeId} held (long press)`);
		},
		[addToLog],
	);

	const handleNodeApproach = useCallback(
		(nodeId: string, event: any) => {
			addToLog(
				`Node ${nodeId} approach detected (${event.distance?.toFixed(0) || "unknown"}px)`,
			);
		},
		[addToLog],
	);

	return (
		<div className="w-full">
			<h3 className="text-lg font-semibold mb-4">Touch Interactions Example</h3>
			<p className="text-sm text-gray-600 mb-4">
				This example demonstrates various touch and interaction events. Try
				different gestures: tap, drag, pinch-to-zoom, rotate, and long-press.
			</p>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Interactive Area */}
				<div className="h-96">
					<Viewport
						width="100%"
						height="100%"
						className="border-2 border-gray-300 rounded"
					>
						<Space>
							<Node
								radius={30}
								position={
									new Vector2D(identityBasis, {
										x: 150 as TCoordinate,
										y: 150 as TCoordinate,
									})
								}
								fill="#3B82F6"
								stroke="#1E40AF"
								strokeWidth={3}
								className={
									selectedNode === "interactive" ? "ring-4 ring-yellow-400" : ""
								}
								onTap={() => handleNodeTap("interactive")}
								onDrag={(delta) => handleNodeDrag("interactive", delta)}
								onScale={(event) => handleNodeScale("interactive", event)}
								onRotate={(event) => handleNodeRotate("interactive", event)}
								onHold={() => handleNodeHold("interactive")}
								onApproach={(event) => handleNodeApproach("interactive", event)}
							/>

							<Node
								radius={20}
								position={
									new Vector2D(identityBasis, {
										x: 100 as TCoordinate,
										y: 100 as TCoordinate,
									})
								}
								fill="#10B981"
								stroke="#059669"
								strokeWidth={2}
								onTap={() => handleNodeTap("static")}
							/>

							<Node
								radius={25}
								position={
									new Vector2D(identityBasis, {
										x: 200 as TCoordinate,
										y: 200 as TCoordinate,
									})
								}
								fill="#EF4444"
								stroke="#DC2626"
								strokeWidth={2}
								onTap={() => handleNodeTap("static2")}
							/>
						</Space>
					</Viewport>
				</div>

				{/* Interaction Log */}
				<div className="h-96">
					<h4 className="font-semibold mb-3">Interaction Log</h4>
					<div className="bg-gray-50 border rounded p-4 h-80 overflow-y-auto">
						{interactionLog.length === 0 ? (
							<p className="text-gray-500 text-sm">
								No interactions yet. Try interacting with the nodes!
							</p>
						) : (
							<div className="space-y-2">
								{interactionLog.map((log, index) => (
									<div
										key={index}
										className="text-sm font-mono bg-white p-2 rounded border"
									>
										{log}
									</div>
								))}
							</div>
						)}
					</div>
					<button
						onClick={() => setInteractionLog([])}
						className="mt-3 px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
					>
						Clear Log
					</button>
				</div>
			</div>

			{/* Instructions */}
			<div className="mt-6 bg-blue-50 rounded-lg p-4">
				<h4 className="font-semibold mb-2 text-blue-900">
					Try These Interactions:
				</h4>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
					<div>
						<h5 className="font-medium mb-1">Basic:</h5>
						<ul className="space-y-1">
							<li>
								• <strong>Tap/Click</strong> nodes to select them
							</li>
							<li>
								• <strong>Drag</strong> the large blue node around
							</li>
						</ul>
					</div>
					<div>
						<h5 className="font-medium mb-1">Advanced:</h5>
						<ul className="space-y-1">
							<li>
								• <strong>Pinch</strong> to scale the blue node
							</li>
							<li>
								• <strong>Rotate</strong> with two fingers
							</li>
							<li>
								• <strong>Long press</strong> for hold event
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
};
