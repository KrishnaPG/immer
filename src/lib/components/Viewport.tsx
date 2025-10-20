import clsx from "clsx";
import { motion, useAnimation } from "framer-motion";
import React, {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
} from "react";
import { Basis } from "@/lib/geometry/Basis";
import { AffineTransform } from "@/lib/geometry/transform";
import { Vector } from "@/lib/geometry/vector";
import { useViewport } from "@/lib/hooks";
import type { TElementId } from "@/types/branded.types";
import type { IZoomToNodeConfig } from "@/types/hierarchical.interfaces";
import { ZoomControl } from "./react/ZoomControl";

export interface ViewportProps {
	children: React.ReactNode;
	id?: string;
	width?: number | string;
	height?: number | string;
	controls?: boolean;
	zoomable?: boolean;
	pannable?: boolean;
	focusable?: boolean;
	hierarchical?: boolean;
	className?: string;
	onResize?: (dimensions: { width: number; height: number }) => void;
	onViewportChange?: (viewportBasis: Basis) => void;
	onNodeFocus?: (nodeId: TElementId) => void;
	onZoomComplete?: (nodeId: TElementId, transform: AffineTransform) => void;
	animationConfig?: Partial<IZoomToNodeConfig>;
}

export interface ViewportRef {
	zoomToNode: (
		nodeId: TElementId,
		config?: Partial<IZoomToNodeConfig>,
	) => Promise<void>;
	focusNode: (nodeId: TElementId) => void;
	getCurrentTransform: () => AffineTransform | null;
	resetView: () => Promise<void>;
	getBasis: () => Basis;
}

export const Viewport = forwardRef<ViewportRef, ViewportProps>(
	(
		{
			children,
			id,
			width = "100%",
			height = 400,
			controls = false,
			zoomable = true,
			pannable = true,
			focusable = true,
			hierarchical = false,
			className = "",
			onResize,
			onViewportChange,
			onNodeFocus,
			onZoomComplete,
			animationConfig,
		},
		ref,
	) => {
		const viewportRef = useRef<HTMLDivElement>(null);
		const contentRef = useRef<HTMLDivElement>(null);
		const motionControls = useAnimation();

		// Use the consolidated viewport hook
		const viewportState = useViewport(id, hierarchical);
		const { basis } = viewportState;

		// Enhanced actions with callbacks - stable references
		const zoomToNodeWithCallbacks = useCallback(
			async (
				nodeId: TElementId,
				config?: Partial<IZoomToNodeConfig>,
			): Promise<void> => {
				if (hierarchical && viewportState.zoomToNode) {
					onNodeFocus?.(nodeId);
					await viewportState.zoomToNode(nodeId, config);
					const transform = viewportState.getCurrentTransform?.();
					if (transform) {
						onZoomComplete?.(nodeId, transform);
					}
				}
			},
			[viewportState, hierarchical, onNodeFocus, onZoomComplete],
		);

		const focusNodeWithCallbacks = useCallback(
			(nodeId: TElementId): void => {
				if (hierarchical && viewportState.focusNode) {
					onNodeFocus?.(nodeId);
					viewportState.focusNode(nodeId);
				}
			},
			[viewportState, hierarchical, onNodeFocus],
		);

		const resetViewWithCallbacks = useCallback(async (): Promise<void> => {
			if (hierarchical && viewportState.resetViewport) {
				await viewportState.resetViewport();
			} else {
				// For basic viewport, just call the reset function
				viewportState.resetViewport();
				onViewportChange?.(new Basis());
			}
		}, [viewportState, hierarchical, onViewportChange]);

		// Expose imperative API with stable references
		useImperativeHandle(
			ref,
			() => ({
				zoomToNode: zoomToNodeWithCallbacks,
				focusNode: focusNodeWithCallbacks,
				getCurrentTransform:
					viewportState.getCurrentTransform || (() => basis.transform),
				resetView: resetViewWithCallbacks,
				getBasis: () => basis,
			}),
			[
				viewportState,
				basis,
				zoomToNodeWithCallbacks,
				focusNodeWithCallbacks,
				resetViewWithCallbacks,
			],
		);

		// Update container size in store
		useEffect(() => {
			if (viewportRef.current && hierarchical && viewportState.updateContainerSize) {
				const rect = viewportRef.current.getBoundingClientRect();
				viewportState.updateContainerSize(rect.width, rect.height);
			}
		}, [hierarchical, viewportState.updateContainerSize]);

		// Handle resize
		useEffect(() => {
			if (!viewportRef.current) return;

			const observer = new ResizeObserver((entries) => {
				const entry = entries[0];
				if (entry) {
					const { width: w, height: h } = entry.contentRect;
					if (hierarchical && viewportState.updateContainerSize) {
						viewportState.updateContainerSize(w, h);
					}
					onResize?.({ width: w, height: h });
				}
			});

			observer.observe(viewportRef.current);

			return () => observer.disconnect();
		}, [hierarchical, viewportState.updateContainerSize, onResize]);

		// Sync Framer Motion with store state for hierarchical mode
		useEffect(() => {
			if (hierarchical && viewportState.transform) {
				const animationValues = {
					x: viewportState.transform.x,
					y: viewportState.transform.y,
					scale: viewportState.transform.getScale?.() || 1,
				};

				if (viewportState.isAnimating) {
					motionControls.start(animationValues);
				} else {
					motionControls.set(animationValues);
				}
			}
		}, [
			viewportState.transform,
			viewportState.isAnimating,
			motionControls,
			hierarchical,
		]);

		// Handle panning for non-hierarchical mode
		const handleMouseDown = useCallback(
			(e: React.MouseEvent) => {
				if (!pannable || hierarchical) return;

				if (viewportState.setIsPanning) {
					viewportState.setIsPanning(true);
					viewportState.setLastPanPoint({
						x: e.clientX,
						y: e.clientY,
					});
				}
				e.preventDefault();
			},
			[pannable, hierarchical, viewportState],
		);

		const handleMouseMove = useCallback(
			(e: MouseEvent) => {
				if (!pannable || hierarchical) return;

				if (!viewportState.isPanning) return;

				const deltaX = e.clientX - viewportState.lastPanPoint.x;
				const deltaY = e.clientY - viewportState.lastPanPoint.y;

				if (Math.abs(deltaX) > 0 || Math.abs(deltaY) > 0) {
					viewportState.panViewport(deltaX, deltaY);
					viewportState.setLastPanPoint({
						x: e.clientX,
						y: e.clientY,
					});
					onViewportChange?.(viewportState.basis);
				}
			},
			[
				pannable,
				hierarchical,
				viewportState,
				onViewportChange,
			],
		);

		const handleMouseUp = useCallback(() => {
			if (viewportState.setIsPanning) {
				viewportState.setIsPanning(false);
			}
		}, [viewportState]);

		// Handle zoom for non-hierarchical mode
		const handleWheel = useCallback(
			(e: React.WheelEvent) => {
				if (!zoomable || hierarchical) return;

				e.preventDefault();

				const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
				viewportState.zoomViewport(zoomFactor);
				onViewportChange?.(viewportState.basis);
			},
			[
				zoomable,
				hierarchical,
				viewportState,
				onViewportChange,
			],
		);

		// Keyboard navigation for non-hierarchical mode
		const handleKeyDown = useCallback(
			(e: KeyboardEvent) => {
				if (hierarchical) return;

				switch (e.key) {
					case "ArrowUp":
					case "w":
					case "W":
						viewportState.panViewport(0, -10);
						onViewportChange?.(viewportState.basis);
						break;
					case "ArrowDown":
					case "s":
					case "S":
						viewportState.panViewport(0, 10);
						onViewportChange?.(viewportState.basis);
						break;
					case "ArrowLeft":
					case "a":
					case "A":
						viewportState.panViewport(-10, 0);
						onViewportChange?.(viewportState.basis);
						break;
					case "ArrowRight":
					case "d":
					case "D":
						viewportState.panViewport(10, 0);
						onViewportChange?.(viewportState.basis);
						break;
					case "+":
					case "=":
						viewportState.zoomViewport(1.1);
						onViewportChange?.(viewportState.basis);
						break;
					case "-":
						viewportState.zoomViewport(0.9);
						onViewportChange?.(viewportState.basis);
						break;
				}
			},
			[
				hierarchical,
				viewportState,
				onViewportChange,
			],
		);

		// Set up keyboard event listeners
		useEffect(() => {
			if (!focusable || hierarchical) return;

			window.addEventListener("keydown", handleKeyDown);
			return () => window.removeEventListener("keydown", handleKeyDown);
		}, [focusable, hierarchical, handleKeyDown]);

		// Set up mouse event listeners for panning
		useEffect(() => {
			if (hierarchical) return;

			const snapshot = viewportState.viewportStore.snapshot;
			if (snapshot?.isPanning) {
				document.addEventListener("mousemove", handleMouseMove);
				document.addEventListener("mouseup", handleMouseUp);
				return () => {
					document.removeEventListener("mousemove", handleMouseMove);
					document.removeEventListener("mouseup", handleMouseUp);
				};
			}
		}, [
			hierarchical,
			viewportState.viewportStore.snapshot,
			handleMouseMove,
			handleMouseUp,
		]);

		// Render hierarchical content
		const renderHierarchicalContent = () => {
			if (!hierarchical || !viewportState.nodes || !viewportState.layout) {
				return children;
			}

			// Calculate layout if hierarchical mode is enabled
			const layoutResult = viewportState.layout.calculate(
				new Map(viewportState.nodes.map((n) => [n.id, n])),
			);

			return (
				<div className="affine-hierarchical-content">
					{React.Children.map(children, (child) => {
						if (React.isValidElement(child)) {
							return React.cloneElement(child as React.ReactElement<any>, {
								...(child.props || {}),
								hierarchical: true,
								onNodeClick: viewportState.handleNodeClick,
								layoutData: layoutResult,
							});
						}
						return child;
					})}
				</div>
			);
		};

		return (
			<div
				ref={viewportRef}
				className={clsx(
					"affine-viewport",
					"relative",
					"overflow-hidden",
					hierarchical && "affine-hierarchical-viewport",
					className,
				)}
				style={{ width, height }}
				data-viewport-id={id}
				onMouseDown={handleMouseDown}
				onWheel={handleWheel}
				tabIndex={focusable ? 0 : -1}
			>
				{hierarchical ? (
					<motion.div
						ref={contentRef}
						className="affine-viewport-content"
						animate={motionControls}
						style={{
							transformOrigin: "center center",
							width: "100%",
							height: "100%",
						}}
					>
						{renderHierarchicalContent()}
					</motion.div>
				) : (
					<motion.div
						className="affine-hyperspace"
						style={{
							transform: `matrix(${basis.transform.toCSSMatrix()})`,
							transformOrigin: "0 0",
						}}
					>
						{children}
					</motion.div>
				)}

				{controls && (
					<>
						{hierarchical ? (
							<HierarchicalViewportControls
								onZoomIn={() => viewportState.zoomBy?.(1.2)}
								onZoomOut={() => viewportState.zoomBy?.(0.8)}
								onReset={viewportState.resetViewport}
								onBack={
									viewportState.navigation?.canGoBack
										? viewportState.navigateBack
										: undefined
								}
								onForward={
									viewportState.navigation?.canGoForward
										? viewportState.navigateForward
										: undefined
								}
								breadcrumbTrail={
									viewportState.navigation?.breadcrumbTrail || []
								}
							/>
						) : (
							<ZoomControl
								position="bottom-right"
								size="medium"
								onZoomIn={() => {
									const newTransform = basis.transform.compose(
										AffineTransform.scaleBy(1.2),
									);
									const newBasis = new Basis(newTransform);
									viewportState.zoomViewport(1.2);
									onViewportChange?.(viewportState.basis);
								}}
								onZoomOut={() => {
									const newTransform = basis.transform.compose(
										AffineTransform.scaleBy(0.8),
									);
									const newBasis = new Basis(newTransform);
									viewportState.zoomViewport(0.8);
									onViewportChange?.(viewportState.basis);
								}}
								onReset={() => {
									viewportState.resetViewport();
									onViewportChange?.(new Basis());
								}}
							/>
						)}
					</>
				)}
			</div>
		);
	},
);

Viewport.displayName = "Viewport";

/**
 * Hierarchical viewport controls component
 */
const HierarchicalViewportControls: React.FC<{
	onZoomIn: () => void;
	onZoomOut: () => void;
	onReset: () => void;
	onBack?: () => void;
	onForward?: () => void;
	breadcrumbTrail: TElementId[];
}> = React.memo(
	({ onZoomIn, onZoomOut, onReset, onBack, onForward, breadcrumbTrail }) => {
		return (
			<div className="absolute top-4 right-4 flex flex-col gap-2">
				{/* Navigation controls */}
				<div className="flex gap-1">
					{onBack && (
						<button
							type="button"
							onClick={onBack}
							className="px-2 py-1 bg-white rounded shadow hover:bg-gray-100"
							title="Navigate back"
						>
							←
						</button>
					)}
					{onForward && (
						<button
							type="button"
							onClick={onForward}
							className="px-2 py-1 bg-white rounded shadow hover:bg-gray-100"
							title="Navigate forward"
						>
							→
						</button>
					)}
				</div>

				{/* Zoom controls */}
				<div className="flex flex-col gap-1">
					<button
						type="button"
						onClick={onZoomIn}
						className="px-2 py-1 bg-white rounded shadow hover:bg-gray-100"
						title="Zoom in"
					>
						+
					</button>
					<button
						type="button"
						onClick={onZoomOut}
						className="px-2 py-1 bg-white rounded shadow hover:bg-gray-100"
						title="Zoom out"
					>
						−
					</button>
					<button
						type="button"
						onClick={onReset}
						className="px-2 py-1 bg-white rounded shadow hover:bg-gray-100"
						title="Reset view"
					>
						⟲
					</button>
				</div>

				{/* Breadcrumb trail */}
				{breadcrumbTrail.length > 1 && (
					<div className="flex flex-wrap gap-1 max-w-48">
						{breadcrumbTrail.map((nodeId, index) => (
							<span
								key={nodeId}
								className="text-xs px-1 py-0.5 bg-blue-100 rounded truncate"
								title={`Node ${index + 1}`}
							>
								{index + 1}
							</span>
						))}
					</div>
				)}
			</div>
		);
	},
);
