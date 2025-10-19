import { motion } from "framer-motion";
import type React from "react";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Basis } from "@/lib/geometry/Basis";
import { AffineTransform } from "@/lib/geometry/transform";
import { Vector } from "@/lib/geometry/vector";
import { useViewport } from "@/lib/hooks";
import styles from "@/styles/components/Viewport.module.css";
import { ZoomControl } from "./ZoomControl";

export interface ViewportProps {
	children: React.ReactNode;
	width?: number | string;
	height?: number | string;
	zoomable?: boolean;
	pannable?: boolean;
	focusable?: boolean;
	className?: string;
	onViewportChange?: (viewportBasis: Basis) => void;
}

export const Viewport = forwardRef<Basis, ViewportProps>(
	(
		{
			children,
			width = "100%",
			height = 400,
			zoomable = true,
			pannable = true,
			focusable = true,
			className = "",
			onViewportChange,
		},
		ref,
	) => {
		const viewportRef = useRef<HTMLDivElement>(null);
		const { basis, viewportStore } = useViewport();
		const { snapshot, actions } = viewportStore;

		// Initialize viewport basis
		useEffect(() => {
			actions.setViewportBasis(viewportStore.store, new Basis());
		}, []);

		// Expose viewport basis API
		useImperativeHandle(ref, () => basis);

		// Handle panning
		const handleMouseDown = (e: React.MouseEvent) => {
			if (!pannable) return;

			actions.setIsPanning(viewportStore.store, true);
			actions.setLastPanPoint(viewportStore.store, {
				x: e.clientX,
				y: e.clientY,
			});
			e.preventDefault();
		};

		const handleMouseMove = (e: MouseEvent) => {
			if (!snapshot.isPanning || !pannable) return;

			const deltaX = e.clientX - snapshot.lastPanPoint.x;
			const deltaY = e.clientY - snapshot.lastPanPoint.y;

			if (Math.abs(deltaX) > 0 || Math.abs(deltaY) > 0) {
				const translation = new Vector(basis, { x: deltaX, y: deltaY });
				const newTransform = AffineTransform.translateBy(translation);
				const newBasis = new Basis(newTransform);

				actions.setViewportBasis(viewportStore.store, newBasis);
				actions.setLastPanPoint(viewportStore.store, {
					x: e.clientX,
					y: e.clientY,
				});
				onViewportChange?.(newBasis);
			}
		};

		const handleMouseUp = () => {
			actions.setIsPanning(viewportStore.store, false);
		};

		// Handle zoom
		const handleWheel = (e: React.WheelEvent) => {
			if (!zoomable) return;

			e.preventDefault();

			const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
			const scaleTransform = AffineTransform.scaleBy(zoomFactor);
			const newTransform = basis.transform.compose(scaleTransform);
			const newBasis = new Basis(newTransform);

			actions.setViewportBasis(viewportStore.store, newBasis);
			onViewportChange?.(newBasis);
		};

		// Keyboard navigation
		const handleKeyDown = (e: KeyboardEvent) => {
			let transform = basis.transform;

			switch (e.key) {
				case "ArrowUp":
				case "w":
				case "W":
					transform = AffineTransform.translateBy(
						new Vector(basis, { x: 0, y: -10 }),
					);
					break;
				case "ArrowDown":
				case "s":
				case "S":
					transform = AffineTransform.translateBy(
						new Vector(basis, { x: 0, y: 10 }),
					);
					break;
				case "ArrowLeft":
				case "a":
				case "A":
					transform = AffineTransform.translateBy(
						new Vector(basis, { x: -10, y: 0 }),
					);
					break;
				case "ArrowRight":
				case "d":
				case "D":
					transform = AffineTransform.translateBy(
						new Vector(basis, { x: 10, y: 0 }),
					);
					break;
				case "+":
				case "=":
					transform = transform.compose(AffineTransform.scaleBy(1.1));
					break;
				case "-":
					transform = transform.compose(AffineTransform.scaleBy(0.9));
					break;
			}

			if (transform !== basis.transform) {
				const newBasis = new Basis(transform);
				actions.setViewportBasis(viewportStore.store, newBasis);
				onViewportChange?.(newBasis);
			}
		};

		// Set up keyboard event listeners
		useEffect(() => {
			if (!focusable) return;

			window.addEventListener("keydown", handleKeyDown);
			return () => window.removeEventListener("keydown", handleKeyDown);
		}, [basis, focusable, onViewportChange]);

		// Set up mouse event listeners for panning
		useEffect(() => {
			if (snapshot.isPanning) {
				document.addEventListener("mousemove", handleMouseMove);
				document.addEventListener("mouseup", handleMouseUp);
				return () => {
					document.removeEventListener("mousemove", handleMouseMove);
					document.removeEventListener("mouseup", handleMouseUp);
				};
			}
		}, [snapshot.isPanning]);

		return (
			<motion.div
				ref={viewportRef}
				className={`${styles.viewport} ${className}`}
				style={{ width, height }}
				onMouseDown={handleMouseDown}
				onWheel={handleWheel}
				tabIndex={focusable ? 0 : -1}
			>
				<motion.div
					className={styles.hyperspace}
					style={{
						transform: `matrix(${basis.transform.toCSSMatrix()})`,
						transformOrigin: "0 0",
					}}
				>
					{children}
				</motion.div>

				<ZoomControl
					position="bottom-right"
					size="medium"
					onZoomIn={() => {
						console.log("Viewport zoom in clicked");
						const newTransform = basis.transform.compose(
							AffineTransform.scaleBy(1.2),
						);
						const newBasis = new Basis(newTransform);
						actions.setViewportBasis(viewportStore.store, newBasis);
						onViewportChange?.(newBasis);
					}}
					onZoomOut={() => {
						console.log("Viewport zoom out clicked");
						const newTransform = basis.transform.compose(
							AffineTransform.scaleBy(0.8),
						);
						const newBasis = new Basis(newTransform);
						actions.setViewportBasis(viewportStore.store, newBasis);
						onViewportChange?.(newBasis);
					}}
					onReset={() => {
						console.log("Viewport zoom reset clicked");
						actions.resetViewport(viewportStore.store);
						onViewportChange?.(new Basis());
					}}
				/>
			</motion.div>
		);
	},
);
