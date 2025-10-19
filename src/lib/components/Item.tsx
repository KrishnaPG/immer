import { clsx } from "clsx";
import type React from "react";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { useSpatialContext } from "../context/SpatialContext";

export interface ItemProps {
	children: React.ReactNode;
	className?: string;
	draggable?: boolean;
	tappable?: boolean;
	scalable?: boolean;
	rotatable?: boolean;
	x?: number;
	y?: number;
	width?: number | string;
	height?: number | string;
	rotation?: number;
	scale?: number;
	onTap?: (event: any) => void;
	onDrag?: (event: any) => void;
	onScale?: (event: any) => void;
	onRotate?: (event: any) => void;
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
			x = 0,
			y = 0,
			width = "auto",
			height = "auto",
			rotation = 0,
			scale = 1,
			onTap,
			onDrag,
			onScale,
			onRotate,
		},
		ref,
	) => {
		const itemRef = useRef<HTMLDivElement>(null);
		const itemInstance = useRef<IItem | null>(null);
		const { viewport } = useSpatialContext();

		// Initialize item instance
		useEffect(() => {
			if (itemRef.current && !itemInstance.current) {
				const element = itemRef.current;

				// Set up element with affine-item class
				element.classList.add(clsx("affine-item", className));
				element.style.position = "absolute";
				element.style.transformOrigin = "center";

				// Apply initial transform
				const transform = `translate(${x}px, ${y}px) rotate(${rotation}rad) scale(${scale})`;
				element.style.transform = transform;

				// Apply size
				if (typeof width === "number") {
					element.style.width = `${width}px`;
				} else {
					element.style.width = width;
				}
				if (typeof height === "number") {
					element.style.height = `${height}px`;
				} else {
					element.style.height = height;
				}

				itemInstance.current = {
					element,
					draggable: (options = {}) => {
						if (isDraggable) {
							element.style.cursor = "move";
							element.draggable = true;

							const handleDragStart = (e: DragEvent) => {
								e.dataTransfer!.setData("text/plain", "");
								onDrag?.(e);
							};

							element.addEventListener("dragstart", handleDragStart);

							return () => {
								element.removeEventListener("dragstart", handleDragStart);
								element.draggable = false;
								element.style.cursor = "";
							};
						}
						return () => {};
					},
					tappable: (options = {}) => {
						if (isTappable) {
							element.style.cursor = "pointer";

							const handleClick = (e: MouseEvent) => {
								onTap?.(e);
							};

							element.addEventListener("click", handleClick);

							return () => {
								element.removeEventListener("click", handleClick);
								element.style.cursor = "";
							};
						}
						return () => {};
					},
					scalable: (options = {}) => {
						if (isScalable) {
							// Implementation would use mouse wheel or touch gestures
							const handleWheel = (e: WheelEvent) => {
								e.preventDefault();
								const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
								itemInstance.current?.scaleBy(scaleFactor);
								onScale?.(e);
							};

							element.addEventListener("wheel", handleWheel);

							return () => {
								element.removeEventListener("wheel", handleWheel);
							};
						}
						return () => {};
					},
					rotatable: (options = {}) => {
						if (isRotatable) {
							// Implementation would use touch gestures or keyboard
							const handleKeyDown = (e: KeyboardEvent) => {
								if (e.key === "r" || e.key === "R") {
									itemInstance.current?.rotateBy(Math.PI / 8); // 22.5 degrees
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
						element.style.transform = element.style.transform.replace(
							/translate\([^)]*\)/,
							`translate(${newX}px, ${newY}px)`,
						);
					},
					scaleBy: (scaleFactor: number) => {
						const currentScale = scale * scaleFactor;
						element.style.transform = element.style.transform.replace(
							/scale\([^)]*\)/,
							`scale(${currentScale})`,
						);
						onScale?.({ scale: currentScale });
					},
					rotateBy: (angle: number) => {
						const currentRotation = rotation + angle;
						element.style.transform = element.style.transform.replace(
							/rotate\([^)]*\)/,
							`rotate(${currentRotation}rad)`,
						);
						onRotate?.({ rotation: currentRotation });
					},
					animateOnce: (animation: any) => {
						// Implementation would use requestAnimationFrame for smooth animations
						console.log("animateOnce", animation);
					},
				};

				// Add to viewport if available
				if (viewport) {
					viewport.addChild(itemInstance.current);
				}

				// Initialize interactions
				const cleanupDraggable = itemInstance.current.draggable();
				const cleanupTappable = itemInstance.current.tappable();
				const cleanupScalable = itemInstance.current.scalable();
				const cleanupRotatable = itemInstance.current.rotatable();

				return () => {
					// Cleanup interactions
					cleanupDraggable?.();
					cleanupTappable?.();
					cleanupScalable?.();
					cleanupRotatable?.();

					// Remove from viewport
					if (viewport && itemInstance.current) {
						viewport.removeChild(itemInstance.current);
					}
				};
			}
		}, [
			viewport,
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
				data-item-id={`item-${Math.random().toString(36).substr(2, 9)}`}
			>
				{children}
			</div>
		);
	},
);
