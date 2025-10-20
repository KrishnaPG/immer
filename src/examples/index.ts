import { InteractiveGraph } from "./advanced/InteractiveGraph";
import { BasicEdges } from "./basic/BasicEdges";
import { BasicNodes } from "./basic/BasicNodes";
import { Minimal } from "./basic/Minimal";
import { Grid } from "./coordinate/Grid";
import { TouchInteractions } from "./interactions/TouchInteractions";
import { HierarchicalNetworkExample } from "./hierarchical";

export interface ExampleInfo {
	id: string;
	title: string;
	description: string;
	category:
		| "basic"
		| "advanced"
		| "interactions"
		| "layouts"
		| "animations"
		| "data-visualization"
		| "coordinate"
		| "hierarchical";
	component: React.ComponentType;
	difficulty: "beginner" | "intermediate" | "advanced";
	tags: string[];
}

export const examples: ExampleInfo[] = [
	{
		id: "minimal",
		title: "Minimal",
		description:
			"The simplest possible tapspace example with basic colored squares demonstrating core positioning concepts.",
		category: "basic",
		component: Minimal,
		difficulty: "beginner",
		tags: ["minimal", "basics", "positioning", "colors"],
	},
	{
		id: "basic-nodes",
		title: "Basic Nodes",
		description:
			"Learn the fundamentals of Node components with different colors, sizes, and basic interactions.",
		category: "basic",
		component: BasicNodes,
		difficulty: "beginner",
		tags: ["nodes", "basics", "styling", "tap"],
	},
	{
		id: "basic-edges",
		title: "Basic Edges",
		description:
			"Explore Edge components that connect nodes with various styles and animations.",
		category: "basic",
		component: BasicEdges,
		difficulty: "beginner",
		tags: ["edges", "connections", "animation", "styling"],
	},
	{
		id: "interactive-graph",
		title: "Interactive Graph",
		description:
			"Advanced example featuring draggable nodes, connecting edges, arcs, and zoom controls.",
		category: "advanced",
		component: InteractiveGraph,
		difficulty: "intermediate",
		tags: ["graph", "drag", "zoom", "arcs", "complex"],
	},
	{
		id: "touch-interactions",
		title: "Touch Interactions",
		description:
			"Comprehensive demonstration of various touch and gesture interactions including tap, drag, scale, rotate, and hold.",
		category: "interactions",
		component: TouchInteractions,
		difficulty: "intermediate",
		tags: ["interactions", "gestures", "touch", "events", "debugging"],
	},
	{
		id: "coordinate-grid",
		title: "Coordinate Grid",
		description:
			"Demonstrates coordinate systems with a visual grid, axis labels, and draggable items for spatial understanding.",
		category: "coordinate",
		component: Grid,
		difficulty: "beginner",
		tags: ["coordinate", "grid", "spatial", "basics", "visualization"],
	},
	{
		id: "hierarchical-network",
		title: "Hierarchical Network",
		description:
			"Large hierarchical networks with smooth zoom-to-node functionality, multiple layout algorithms, and navigation history.",
		category: "hierarchical",
		component: HierarchicalNetworkExample,
		difficulty: "advanced",
		tags: ["hierarchical", "zoom-to-node", "layouts", "navigation", "network", "trees"],
	}
];

export const getExamplesByCategory = (category: ExampleInfo["category"]) => {
	return examples.filter((example) => example.category === category);
};

export const getExampleById = (id: string) => {
	return examples.find((example) => example.id === id);
};

export const getAllCategories = () => {
	return Array.from(new Set(examples.map((example) => example.category)));
};
