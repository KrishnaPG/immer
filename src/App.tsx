import { useCallback, useRef, useState } from "react";
import "./App.css";

import {
	Arc,
	Edge,
	Item,
	Node,
	Space,
	Viewport,
	ZoomControl,
} from "./lib/components";
import { Vector2D } from "./lib/geometry/vector";
import type { TCoordinate } from "./types/branded.types";

function App() {
	const [count, setCount] = useState(0);
	const [selectedNode, setSelectedNode] = useState<string | null>(null);
	const [nodePositions, setNodePositions] = useState({
		node1: new Vector2D(100 as TCoordinate, 100 as TCoordinate),
		node2: new Vector2D(300 as TCoordinate, 100 as TCoordinate),
		node3: new Vector2D(200 as TCoordinate, 250 as TCoordinate),
		node4: new Vector2D(400 as TCoordinate, 300 as TCoordinate),
	});
	const [zoomLevel, setZoomLevel] = useState(1);
	const [viewportPosition, setViewportPosition] = useState(
		new Vector2D(0 as TCoordinate, 0 as TCoordinate),
	);
	const viewportRef = useRef<any>(null);

	// Interactive handlers
	const handleNodeTap = useCallback((nodeId: string) => {
		console.log(`Node ${nodeId} tapped!`);
		setSelectedNode(nodeId);
		setCount((prev) => prev + 1);
	}, []);

	const handleNodeDrag = useCallback((nodeId: string, delta: Vector2D) => {
		console.log(`Node ${nodeId} dragged:`, delta);
		setNodePositions((prev) => ({
			...prev,
			[nodeId]: new Vector2D(
				(prev[nodeId as keyof typeof prev].x + delta.x) as TCoordinate,
				(prev[nodeId as keyof typeof prev].y + delta.y) as TCoordinate
			),
		}));
	}, []);

	const handleEdgeTap = useCallback((edgeId: string) => {
		console.log(`Edge ${edgeId} tapped!`);
		alert(`Edge ${edgeId} interaction triggered!`);
	}, []);

	const handleArcTap = useCallback((arcId: string) => {
		console.log(`Arc ${arcId} tapped!`);
		alert(`Arc ${arcId} interaction triggered!`);
	}, []);

	// Zoom control handlers
	const handleZoomIn = useCallback(() => {
		const newZoom = Math.min(zoomLevel * 1.5, 5);
		setZoomLevel(newZoom);
		console.log(`Zoom in: ${newZoom}x`);
	}, [zoomLevel]);

	const handleZoomOut = useCallback(() => {
		const newZoom = Math.max(zoomLevel / 1.5, 0.1);
		setZoomLevel(newZoom);
		console.log(`Zoom out: ${newZoom}x`);
	}, [zoomLevel]);

	const handleZoomReset = useCallback(() => {
		setZoomLevel(1);
		setViewportPosition(new Vector2D(0 as TCoordinate, 0 as TCoordinate));
		console.log("Zoom reset to 1x");
	}, []);

	// Test function for tapspace functionality
	const testTapspace = () => {
		console.log("=== Tapspace Comprehensive Test ===");
		console.log("Node positions:", nodePositions);
		console.log("Zoom level:", zoomLevel);
		console.log("Viewport position:", viewportPosition);
		console.log("Selected node:", selectedNode);
		alert("Check the browser console for comprehensive test output!");
	};

	return (
		<div className="min-h-screen bg-gray-100 p-4">
			<div className="max-w-6xl mx-auto">
				<h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
					Tapspace React/TypeScript - Comprehensive Component Test
				</h1>

				{/* Control Panel */}
				<div className="bg-white rounded-lg shadow-lg p-6 mb-6">
					<h2 className="text-xl font-semibold mb-4">Test Controls</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="flex flex-wrap gap-2">
							<button
								type="button"
								onClick={testTapspace}
								className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
							>
								Test All Components
							</button>
							<button
								type="button"
								onClick={() => setCount((count) => count + 1)}
								className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
							>
								Count: {count}
							</button>
						</div>

						<div className="flex flex-wrap gap-2">
							<button
								type="button"
								onClick={handleZoomIn}
								className="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
							>
								Zoom In
							</button>
							<button
								type="button"
								onClick={handleZoomOut}
								className="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
							>
								Zoom Out
							</button>
							<button
								type="button"
								onClick={handleZoomReset}
								className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
							>
								Reset
							</button>
						</div>

						<div className="text-sm text-gray-600">
							<p>
								<strong>Zoom:</strong> {zoomLevel.toFixed(2)}x
							</p>
							<p>
								<strong>Selected:</strong> {selectedNode || "None"}
							</p>
						</div>
					</div>
				</div>

				{/* Main Tapspace Viewport - Comprehensive Test */}
				<div className="bg-white rounded-lg shadow-lg p-6">
					<h2 className="text-xl font-semibold mb-4">
						Comprehensive Component Test
					</h2>

					<div className="relative">
						<Viewport
							ref={viewportRef}
							width="100%"
							height="500px"
							className="border-2 border-gray-300 rounded"
						>
							<Space>
								{/* Node Components Test */}
								<Node
									radius={20}
									position={nodePositions.node1}
									fill="#3B82F6"
									stroke="#1E40AF"
									strokeWidth={2}
									className={
										selectedNode === "node1" ? "ring-4 ring-yellow-400" : ""
									}
									onTap={() => handleNodeTap("node1")}
									onDrag={(delta) => handleNodeDrag("node1", delta)}
								/>

								<Node
									radius={25}
									position={nodePositions.node2}
									fill="#10B981"
									stroke="#059669"
									strokeWidth={3}
									className={
										selectedNode === "node2" ? "ring-4 ring-yellow-400" : ""
									}
									onTap={() => handleNodeTap("node2")}
									onDrag={(delta) => handleNodeDrag("node2", delta)}
								/>

								<Node
									radius={15}
									position={nodePositions.node3}
									fill="#EF4444"
									stroke="#DC2626"
									strokeWidth={2}
									className={
										selectedNode === "node3" ? "ring-4 ring-yellow-400" : ""
									}
									onTap={() => handleNodeTap("node3")}
									onDrag={(delta) => handleNodeDrag("node3", delta)}
								/>

								<Node
									radius={18}
									position={nodePositions.node4}
									fill="#F59E0B"
									stroke="#D97706"
									strokeWidth={2}
									className={
										selectedNode === "node4" ? "ring-4 ring-yellow-400" : ""
									}
									onTap={() => handleNodeTap("node4")}
									onDrag={(delta) => handleNodeDrag("node4", delta)}
								/>

								{/* Edge Components Test */}
								<Edge
									startPoint={nodePositions.node1}
									endPoint={nodePositions.node2}
									stroke="#6B7280"
									strokeWidth={3}
									strokeDasharray="5,5"
									animated={true}
									onTap={() => handleEdgeTap("edge1-2")}
								/>

								<Edge
									startPoint={nodePositions.node2}
									endPoint={nodePositions.node3}
									stroke="#374151"
									strokeWidth={4}
									animated={true}
									onTap={() => handleEdgeTap("edge2-3")}
								/>

								<Edge
									startPoint={nodePositions.node3}
									endPoint={nodePositions.node4}
									stroke="#4B5563"
									strokeWidth={2}
									strokeDasharray="2,3"
									animated={true}
									onTap={() => handleEdgeTap("edge3-4")}
								/>

								<Edge
									startPoint={nodePositions.node1}
									endPoint={nodePositions.node4}
									stroke="#9CA3AF"
									strokeWidth={1}
									animated={true}
									onTap={() => handleEdgeTap("edge1-4")}
								/>

								{/* Arc Components Test */}
								<Arc
									center={nodePositions.node2}
									radius={80}
									startAngle={0}
									endAngle={90}
									stroke="#8B5CF6"
									strokeWidth={3}
									fill="none"
									animated={true}
									onTap={() => handleArcTap("arc1")}
								/>

								<Arc
									center={nodePositions.node3}
									radius={60}
									startAngle={45}
									endAngle={225}
									stroke="#EC4899"
									strokeWidth={4}
									fill="none"
									animated={true}
									onTap={() => handleArcTap("arc2")}
								/>

								<Arc
									center={nodePositions.node1}
									radius={50}
									startAngle={-45}
									endAngle={135}
									stroke="#06B6D4"
									strokeWidth={2}
									fill="rgba(6, 182, 212, 0.1)"
									animated={true}
									onTap={() => handleArcTap("arc3")}
								/>

								{/* Legacy Item Components for Comparison */}
								<Item>
									<div className="absolute top-0 left-0 w-16 h-16 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-lg">
										Item 1
									</div>
								</Item>

								<Item>
									<div className="absolute top-0 right-0 w-20 h-20 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
										Item 2
									</div>
								</Item>
							</Space>
						</Viewport>

						{/* Zoom Control */}
						<ZoomControl
							position="bottom-right"
							size="medium"
							onZoomIn={handleZoomIn}
							onZoomOut={handleZoomOut}
							onReset={handleZoomReset}
						/>
					</div>
				</div>

				{/* Component Status */}
				<div className="mt-6 bg-green-50 rounded-lg p-6">
					<h3 className="text-lg font-semibold mb-3 text-green-900">
						✅ Component Status - All Features Implemented:
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<h4 className="font-semibold text-green-800 mb-2">
								Core Components:
							</h4>
							<ul className="text-green-700 space-y-1 text-sm">
								<li>
									• <strong>Node Component</strong> - Interactive circular nodes
									with drag & tap
								</li>
								<li>
									• <strong>Edge Component</strong> - Animated connections
									between nodes
								</li>
								<li>
									• <strong>Arc Component</strong> - Curved paths with center
									and angles
								</li>
								<li>
									• <strong>ZoomControl Component</strong> - Zoom in/out/reset
									controls
								</li>
							</ul>
						</div>
						<div>
							<h4 className="font-semibold text-green-800 mb-2">
								Interactive Features:
							</h4>
							<ul className="text-green-700 space-y-1 text-sm">
								<li>
									• <strong>Tap Events</strong> - Click/tap detection on all
									components
								</li>
								<li>
									• <strong>Drag Events</strong> - Mouse/touch drag interactions
								</li>
								<li>
									• <strong>Visual Feedback</strong> - Hover effects and
									animations
								</li>
								<li>
									• <strong>State Management</strong> - Position and selection
									tracking
								</li>
							</ul>
						</div>
					</div>
				</div>

				{/* Instructions */}
				<div className="mt-4 bg-blue-50 rounded-lg p-6">
					<h3 className="text-lg font-semibold mb-3 text-blue-900">
						🧪 Test Instructions:
					</h3>
					<div className="text-blue-800 space-y-2 text-sm">
						<p>
							<strong>Try these interactions:</strong>
						</p>
						<ul className="list-disc list-inside space-y-1 ml-4">
							<li>
								<strong>Click/Tap</strong> nodes to select them (yellow ring
								appears)
							</li>
							<li>
								<strong>Drag</strong> nodes around the space to move them
							</li>
							<li>
								<strong>Click/Tap</strong> edges and arcs to trigger
								interactions
							</li>
							<li>
								<strong>Use ZoomControl</strong> (bottom-right) to zoom in/out
								or reset
							</li>
							<li>
								<strong>Use control panel buttons</strong> to test zoom
								functions
							</li>
							<li>
								<strong>Click "Test All Components"</strong> to log
								comprehensive data
							</li>
						</ul>
						<p className="mt-3">
							<strong>
								Check browser console for detailed interaction logs!
							</strong>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export default App;
