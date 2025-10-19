import type React from "react";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { SpatialContext } from "../context/SpatialContext";
import { Viewport as ViewportClass } from "../imperative/Viewport";
import { ViewportControls } from "./ViewportControls";

export interface ViewportProps {
	children: React.ReactNode;
	width?: number | string;
	height?: number | string;
	controls?: boolean;
	className?: string;
	onResize?: (dimensions: { width: number; height: number }) => void;
}

export const Viewport = forwardRef<ViewportClass, ViewportProps>(
	(
		{
			children,
			width = "100%",
			height = 400,
			controls = false,
			className = "",
			onResize,
		},
		ref,
	) => {
		const viewportRef = useRef<HTMLDivElement>(null);
		const viewportInstance = useRef<ViewportClass | null>(null);

		// Initialize imperative instance
		useEffect(() => {
			if (viewportRef.current && !viewportInstance.current) {
				viewportInstance.current = new ViewportClass(viewportRef.current);
			}
		}, []);

		// Expose imperative API
		useImperativeHandle(ref, () => viewportInstance.current!);

		return (
			<div
				ref={viewportRef}
				className={`affine-viewport ${className}`}
				style={{ width, height }}
			>
				<SpatialContext.Provider value={{
					viewport: viewportInstance.current,
					currentSpace: null,
					coordinateSystem: null
				}}>
					<div className="affine-hyperspace">{children}</div>
					{controls && <ViewportControls />}
				</SpatialContext.Provider>
			</div>
		);
	},
);
