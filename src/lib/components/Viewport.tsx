import clsx from "clsx";
import type React from "react";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Basis } from "@/lib/geometry/Basis";
import { AffineTransform } from "@/lib/geometry/transform";
import { Viewport as ViewportClass } from "../imperative/Viewport";
import { useViewport } from "./hooks/useViewport";
import { ViewportControls } from "./ViewportControls";

export interface ViewportProps {
	children: React.ReactNode;
	id?: string;
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
			id,
			width = "100%",
			height = 400,
			controls = false,
			className = "",
			onResize,
		},
		ref,
	) => {
		const viewportRef = useRef<HTMLDivElement>(null);

		// Use the Valtio-based useViewport hook
		const { viewport, basis } = useViewport(id);

		// Update container reference in viewport
		useEffect(() => {
			if (viewportRef.current && viewport) {
				viewport.container = viewportRef.current;
			}
		}, [viewport]);

		// Expose imperative API
		useImperativeHandle(ref, () => {
			if (viewportRef.current && viewport) {
				return new ViewportClass(viewportRef.current);
			}
			throw new Error("Viewport not initialized");
		}, [viewport]);

		return (
			<div
				ref={viewportRef}
				className={clsx("affine-viewport", className)}
				style={{ width, height }}
			>
				<div
					className="affine-hyperspace"
					style={{
						transform: `matrix(${basis.transform.toCSSMatrix()})`,
						transformOrigin: "0 0",
					}}
				>
					{children}
				</div>
				{controls && <ViewportControls />}
			</div>
		);
	},
);
