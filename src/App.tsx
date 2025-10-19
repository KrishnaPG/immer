import { useCallback, useState } from "react";
import "./App.css";
import {
	type ExampleInfo,
	examples,
	getAllCategories,
	getExamplesByCategory,
} from "./examples";

function App() {
	const [selectedExample, setSelectedExample] = useState<ExampleInfo | null>(examples[0]);
	const [sidebarOpen, setSidebarOpen] = useState(true);

	// Handle example selection
	const handleExampleSelect = useCallback((example: ExampleInfo) => {
		setSelectedExample(example);
	}, []);

	// Render example component
	const renderExample = () => {
		if (!selectedExample) {
			return (
				<div className="flex items-center justify-center h-full text-gray-500">
					<p>Select an example from the sidebar to get started</p>
				</div>
			);
		}

		const ExampleComponent = selectedExample.component;
		return <ExampleComponent />;
	};

	// Render sidebar content
	const renderSidebar = () => {
		const categories = getAllCategories();

		return (
			<div className="w-80 bg-white shadow-lg h-full overflow-y-auto">
				<div className="p-6 border-b">
					<h2 className="text-xl font-bold text-gray-800 mb-2">Tapspace Examples</h2>
					<p className="text-sm text-gray-600">
						Interactive examples demonstrating various features of the Tapspace library
					</p>
				</div>

				<div className="p-4">
					{categories.map((category) => {
						const categoryExamples = getExamplesByCategory(category);
						return (
							<div key={category} className="mb-6">
								<h3 className="text-lg font-semibold text-gray-700 mb-3 capitalize">
									{category}
								</h3>
								<div className="space-y-2">
									{categoryExamples.map((example) => (
										<button
											key={example.id}
											type="button"
											onClick={() => handleExampleSelect(example)}
											className={`w-full text-left p-3 rounded-lg border transition-colors ${
												selectedExample?.id === example.id
													? "bg-blue-50 border-blue-300 text-blue-700"
													: "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
											}`}
										>
											<div className="font-medium">{example.title}</div>
											<div className="text-sm text-gray-500 mt-1">
												{example.description}
											</div>
											<div className="flex items-center gap-2 mt-2">
												<span
													className={`px-2 py-1 text-xs rounded-full ${
														example.difficulty === "beginner"
															? "bg-green-100 text-green-700"
															: example.difficulty === "intermediate"
															? "bg-yellow-100 text-yellow-700"
															: "bg-red-100 text-red-700"
													}`}
												>
													{example.difficulty}
												</span>
												<div className="flex gap-1">
													{example.tags.slice(0, 2).map((tag) => (
														<span
															key={tag}
															className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
														>
															{tag}
														</span>
													))}
													{example.tags.length > 2 && (
														<span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
															+{example.tags.length - 2}
														</span>
													)}
												</div>
											</div>
										</button>
									))}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		);
	};

	return (
		<div className="min-h-screen bg-gray-100 flex">
			{/* Sidebar Toggle Button */}
			{!sidebarOpen && (
				<button
					type="button"
					onClick={() => setSidebarOpen(true)}
					className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50"
				>
					<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				</button>
			)}

			{/* Sidebar */}
			{sidebarOpen && (
				<div className="relative">
					{renderSidebar()}
					<button
						type="button"
						onClick={() => setSidebarOpen(false)}
						className="absolute top-4 right-4 p-2 bg-gray-200 rounded-lg hover:bg-gray-300"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
			)}

			{/* Main Content */}
			<div className="flex-1 p-6">
				<div className="max-w-7xl mx-auto">
					{/* Header */}
					<div className="mb-6">
						<div className="flex items-center gap-4 mb-4">
							{!sidebarOpen && (
								<button
									type="button"
									onClick={() => setSidebarOpen(true)}
									className="p-2 bg-white rounded-lg shadow hover:bg-gray-50"
								>
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
									</svg>
								</button>
							)}
							<div>
								<h1 className="text-3xl font-bold text-gray-800">
									{selectedExample?.title || "Tapspace Examples"}
								</h1>
								{selectedExample && (
									<p className="text-gray-600 mt-1">{selectedExample.description}</p>
								)}
							</div>
						</div>

						{/* Example Info Bar */}
						{selectedExample && (
							<div className="bg-white rounded-lg p-4 shadow-sm">
								<div className="flex items-center gap-4 text-sm">
									<span
										className={`px-3 py-1 rounded-full font-medium ${
											selectedExample.difficulty === "beginner"
												? "bg-green-100 text-green-700"
												: selectedExample.difficulty === "intermediate"
												? "bg-yellow-100 text-yellow-700"
												: "bg-red-100 text-red-700"
										}`}
									>
										{selectedExample.difficulty}
									</span>
									<span className="text-gray-600">
										Category: <span className="capitalize font-medium">{selectedExample.category}</span>
									</span>
									<div className="flex gap-1">
										{selectedExample.tags.map((tag) => (
											<span
												key={tag}
												className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
											>
												{tag}
											</span>
										))}
									</div>
								</div>
							</div>
						)}
					</div>

					{/* Example Content */}
					<div className="bg-white rounded-lg shadow-lg min-h-[600px]">
						{renderExample()}
					</div>
				</div>
			</div>
		</div>
	);
}

export default App;
