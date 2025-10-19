import { clsx } from "clsx";
import type React from "react";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { AffineTransform } from "@/lib/geometry/transform";
import { useItem } from "./hooks/useItem";

export interface ItemProps {
	children: React.ReactNode;
	className?: string;
	draggable?: boolean;
	tappable?: boolean;
	scalable?: boolean;
	rotatable?: boolean;
	holdable?: boolean;
	approachable?: boolean;
	x?: number;
	y?: number;
	width?: number | string;
	height?: number | string;
	rotation?: number;
	scale?: number;
	// Enhanced interaction props
	enableGestures?: boolean;
	enableDnd?: boolean;
	dndId?: string;
	onTap?: (event: any) => void;
	onDrag?: (event: any) => void;
	onScale?: (event: any) => void;
	onRotate?: (event: any) => void;
	onHold?: (event: any) => void;
	onApproach?: (event: any) => void;
	// Spatial gesture options
	gestureOptions?: {
		dragThreshold?: number;
		pinchThreshold?: number;
		enableHover?: boolean;
	};
}

export interface IItem {
	element: HTMLElement;
	draggable: (options?: any) => () => void;
	tappable: (options?: any) => () => void;
	scalable: (options?: any) => () => void;
	rotatable: (options?: any) => () => void;
	moveTo: (x: number, y: number) => void;
	scaleBy: (scale: number) => void;
	rotateBy: (angle: number) => void;
	animateOnce: (animation: any) => void;
}

export const Item = forwardRef<IItem, ItemProps>(
	(
		{
			children,
			className = "",
			draggable: isDraggable = false,
			tappable: isTappable = false,
			scalable: isScalable = false,
			rotatable: isRotatable = false,
			holdable: isHoldable = false,
			approachable: isApproachable = false,
			x = 0,
			y = 0,
			width = "auto",
			height = "auto",
			rotation = 0,
			scale = 1,
			enableGestures = true,
			enableDnd = false,
			dndId,
			onTap,
			onDrag,
			onScale,
			onRotate,
			onHold,
			onApproach,
			gestureOptions = {},
		},
		ref,
	) => {
		const itemRef = useRef<HTMLDivElement>(null);
		const itemInstance = useRef<IItem | null>(null);

		// Use Valtio-based useItem hook
		const { elementId: itemId, element, basis, updatePosition, updateTransform } = useItem();

		// Initialize item instance
		useEffect(() => {
			if (itemRef.current && !itemInstance.current) {
				const domElement = itemRef.current;

				// Set up element with affine-item class
				domElement.classList.add(clsx("affine-item", className));
				domElement.style.position = "absolute";
				domElement.style.transformOrigin = "center";

				// Apply initial transform using Valtio state
				if (domElement && element) {
					const valtioElement = element; // Valtio element from useItem hook
					const currentTransform = valtioElement.transform as any;
					const transformMatrix = new AffineTransform(
						currentTransform.a,
						currentTransform.b,
						currentTransform.x,
						currentTransform.c,
						currentTransform.d,
						currentTransform.y
					);
					domElement.style.transform = `matrix(${transformMatrix.toCSSMatrix()})`;
				}

				// Apply size
				if (typeof width === "number") {
					domElement.style.width = `${width}px`;
				} else {
					domElement.style.width = width;
				}
				if (typeof height === "number") {
					domElement.style.height = `${height}px`;
				} else {
					domElement.style.height = height;
				}

				itemInstance.current = {
					element: domElement,
					draggable: (options = {}) => {
						if (isDraggable) {
							domElement.style.cursor = "move";
							domElement.draggable = true;

							const handleDragStart = (e: DragEvent) => {
								e.dataTransfer!.setData("text/plain", "");
								onDrag?.(e);
							};

							domElement.addEventListener("dragstart", handleDragStart);

							return () => {
								domElement.removeEventListener("dragstart", handleDragStart);
								domElement.draggable = false;
								domElement.style.cursor = "";
							};
						}
						return () => {};
					},
					tappable: (options = {}) => {
						if (isTappable) {
							domElement.style.cursor = "pointer";

							const handleClick = (e: MouseEvent) => {
								onTap?.(e);
							};

							domElement.addEventListener("click", handleClick);

							return () => {
								domElement.removeEventListener("click", handleClick);
								domElement.style.cursor = "";
							};
						}
						return () => {};
					},
					scalable: (options = {}) => {
						if (isScalable) {
							const handleWheel = (e: WheelEvent) => {
								e.preventDefault();
								const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
								itemInstance.current?.scaleBy(scaleFactor);
								onScale?.(e);
							};

							domElement.addEventListener("wheel", handleWheel);

							return () => {
								domElement.removeEventListener("wheel", handleWheel);
							};
						}
						return () => {};
					},
					rotatable: (options = {}) => {
						if (isRotatable) {
							const handleKeyDown = (e: KeyboardEvent) => {
								if (e.key === "r" || e.key === "R") {
									itemInstance.current?.rotateBy(Math.PI / 8);
									onRotate?.(e);
								}
							};

							document.addEventListener("keydown", handleKeyDown);

							return () => {
								document.removeEventListener("keydown", handleKeyDown);
							};
						}
						return () => {};
					},
					moveTo: (newX: number, newY: number) => {
						updatePosition(newX, newY);
						domElement.style.transform = domElement.style.transform.replace(
							/translate\([^)]*\)/,
							`translate(${newX}px, ${newY}px)`,
						);
					},
					scaleBy: (scaleFactor: number) => {
						const currentScale = scale * scaleFactor;
						domElement.style.transform = domElement.style.transform.replace(
							/scale\([^)]*\)/,
							`scale(${currentScale})`,
						);
						onScale?.({ scale: currentScale });
					},
					rotateBy: (angle: number) => {
						const currentRotation = rotation + angle;
						domElement.style.transform = domElement.style.transform.replace(
							/rotate\([^)]*\)/,
							`rotate(${currentRotation}rad)`,
						);
						onRotate?.({ rotation: currentRotation });
					},
					animateOnce: (animation: any) => {
						console.log("animateOnce", animation);
					},
				};

				// Initialize interactions
				const cleanupDraggable = itemInstance.current.draggable();
				const cleanupTappable = itemInstance.current.tappable();
				const cleanupScalable = itemInstance.current.scalable();
				const cleanupRotatable = itemInstance.current.rotatable();

				return () => {
					cleanupDraggable?.();
					cleanupTappable?.();
					cleanupScalable?.();
					cleanupRotatable?.();
				};
			}
		}, [
			element,
			className,
			isDraggable,
			isTappable,
			isScalable,
			isRotatable,
			x,
			y,
			width,
			height,
			rotation,
			scale,
			updatePosition,
			onTap,
			onDrag,
			onScale,
			onRotate,
		]);

		// Expose item API
		useImperativeHandle(ref, () => itemInstance.current!);

		return (
			<div
				ref={itemRef}
				className={`affine-item ${className}`}
				data-item-id={itemId}
			>
				{children}
			</div>
		);
	},
);
