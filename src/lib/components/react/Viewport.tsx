import { motion } from "framer-motion";
import type React from "react";
import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import { Basis } from "@/lib/geometry/Basis";
import { Point } from "@/lib/geometry/Point";
import { AffineTransform } from "@/lib/geometry/transform";
import { Vector } from "@/lib/geometry/vector";
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
		const [viewportBasis, setViewportBasis] = useState(new Basis());
		const [isPanning, setIsPanning] = useState(false);
		const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

		// Initialize viewport basis
		useEffect(() => {
			setViewportBasis(new Basis());
		}, []);

		// Expose viewport basis API
		useImperativeHandle(ref, () => viewportBasis);

		// Handle panning
		const handleMouseDown = (e: React.MouseEvent) => {
			if (!pannable) return;

			setIsPanning(true);
			setLastPanPoint({ x: e.clientX, y: e.clientY });
			e.preventDefault();
		};

		const handleMouseMove = (e: MouseEvent) => {
			if (!isPanning || !pannable) return;

			const deltaX = e.clientX - lastPanPoint.x;
			const deltaY = e.clientY - lastPanPoint.y;

			if (Math.abs(deltaX) > 0 || Math.abs(deltaY) > 0) {
				const translation = new Vector(viewportBasis, { x: deltaX, y: deltaY });
				const newTransform = AffineTransform.translateBy(translation);
				const newBasis = new Basis(newTransform);

				setViewportBasis(newBasis);
				setLastPanPoint({ x: e.clientX, y: e.clientY });
				onViewportChange?.(newBasis);
			}
		};

		const handleMouseUp = () => {
			setIsPanning(false);
		};

		// Handle zoom
		const handleWheel = (e: React.WheelEvent) => {
			if (!zoomable) return;

			e.preventDefault();

			const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
			const scaleTransform = AffineTransform.scaleBy(zoomFactor);
			const newTransform = viewportBasis.transform.compose(scaleTransform);
			const newBasis = new Basis(newTransform);

			setViewportBasis(newBasis);
			onViewportChange?.(newBasis);
		};

		// Keyboard navigation
		useEffect(() => {
			if (!focusable) return;

			const handleKeyDown = (e: KeyboardEvent) => {
				let transform = viewportBasis.transform;

				switch (e.key) {
					case "ArrowUp":
					case "w":
					case "W":
						transform = AffineTransform.translateBy(
							new Vector(viewportBasis, { x: 0, y: -10 }),
						);
						break;
					case "ArrowDown":
					case "s":
					case "S":
						transform = AffineTransform.translateBy(
							new Vector(viewportBasis, { x: 0, y: 10 }),
						);
						break;
					case "ArrowLeft":
					case "a":
					case "A":
						transform = AffineTransform.translateBy(
							new Vector(viewportBasis, { x: -10, y: 0 }),
						);
						break;
					case "ArrowRight":
					case "d":
					case "D":
						transform = AffineTransform.translateBy(
							new Vector(viewportBasis, { x: 10, y: 0 }),
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

				if (transform !== viewportBasis.transform) {
					const newBasis = new Basis(transform);
					setViewportBasis(newBasis);
					onViewportChange?.(newBasis);
				}
			};

			window.addEventListener("keydown", handleKeyDown);
			return () => window.removeEventListener("keydown", handleKeyDown);
		}, [viewportBasis, focusable, onViewportChange]);

		useEffect(() => {
			if (isPanning) {
				document.addEventListener("mousemove", handleMouseMove);
				document.addEventListener("mouseup", handleMouseUp);
				return () => {
					document.removeEventListener("mousemove", handleMouseMove);
					document.removeEventListener("mouseup", handleMouseUp);
				};
			}
		}, [isPanning]);

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
						transform: `matrix(${viewportBasis.transform.toCSSMatrix()})`,
						transformOrigin: "0 0",
					}}
				>
					{children}
				</motion.div>

				<ZoomControl
					onZoomIn={() => {
						const newTransform = viewportBasis.transform.compose(
							AffineTransform.scaleBy(1.2),
						);
						const newBasis = new Basis(newTransform);
						setViewportBasis(newBasis);
						onViewportChange?.(newBasis);
					}}
					onZoomOut={() => {
						const newTransform = viewportBasis.transform.compose(
							AffineTransform.scaleBy(0.8),
						);
						const newBasis = new Basis(newTransform);
						setViewportBasis(newBasis);
						onViewportChange?.(newBasis);
					}}
					onReset={() => {
						setViewportBasis(new Basis());
						onViewportChange?.(new Basis());
					}}
				/>
			</motion.div>
		);
	},
);
