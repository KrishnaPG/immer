import { clsx } from "clsx";
import type React from "react";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { useSpatialContext } from "../context/SpatialContext";

export interface SpaceProps {
	children: React.ReactNode;
	className?: string;
	id?: string;
}

export interface ISpace {
	element: HTMLElement;
	id: string;
	addChild: (child: any) => void;
	removeChild: (child: any) => void;
	getBoundingBox: () => any;
	transformBy: (transform: any) => void;
	translateBy: (x: number, y: number) => void;
	scaleBy: (scale: number) => void;
	rotateBy: (angle: number) => void;
}

export const Space = forwardRef<ISpace, SpaceProps>(
	(
		{
			children,
			className = "",
			id = `space-${Math.random().toString(36).substr(2, 9)}`,
		},
		ref,
	) => {
		const spaceRef = useRef<HTMLDivElement>(null);
		const spaceInstance = useRef<ISpace | null>(null);
		const { viewport, currentSpace } = useSpatialContext();

		// Initialize space instance
		useEffect(() => {
			if (spaceRef.current && !spaceInstance.current) {
				const element = spaceRef.current;

				// Create space instance with zero size for pointer event delegation
				element.style.width = "0px";
				element.style.height = "0px";
				element.style.position = "absolute";
				element.classList.add(clsx("affine-space", className));

				spaceInstance.current = {
					element,
					id,
					addChild: (child: any) => {
						element.appendChild(child.element || child);
					},
					removeChild: (child: any) => {
						element.removeChild(child.element || child);
					},
					getBoundingBox: () => {
						// Calculate bounding box of all children
						const rect = element.getBoundingClientRect();
						return {
							left: rect.left,
							top: rect.top,
							width: rect.width,
							height: rect.height,
							right: rect.right,
							bottom: rect.bottom,
						};
					},
					transformBy: (transform: any) => {
						// Apply affine transform to space
						const currentTransform = element.style.transform || "";
						element.style.transform = `${currentTransform} ${transform}`.trim();
					},
					translateBy: (x: number, y: number) => {
						const currentTransform = element.style.transform || "";
						element.style.transform =
							`${currentTransform} translate(${x}px, ${y}px)`.trim();
					},
					scaleBy: (scale: number) => {
						const currentTransform = element.style.transform || "";
						element.style.transform =
							`${currentTransform} scale(${scale})`.trim();
					},
					rotateBy: (angle: number) => {
						const currentTransform = element.style.transform || "";
						element.style.transform =
							`${currentTransform} rotate(${angle}rad)`.trim();
					},
				};

				// Add to viewport if available
				if (viewport) {
					viewport.addChild(spaceInstance.current);
				}
			}

			return () => {
				// Cleanup
				if (spaceInstance.current && viewport) {
					viewport.removeChild(spaceInstance.current);
				}
			};
		}, [viewport, className, id]);

		// Expose space API
		useImperativeHandle(ref, () => spaceInstance.current!);

		return (
			<div
				ref={spaceRef}
				className={clsx("affine-space", className)}
				data-space-id={id}
			>
				{children}
			</div>
		);
	},
);
