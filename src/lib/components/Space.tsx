import { clsx } from "clsx";
import { motion } from "framer-motion";
import type React from "react";
import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import type { Basis } from "@/lib/geometry/Basis";
import { AffineTransform } from "@/lib/geometry/transform";
import { useSpace } from "./hooks/useSpace";

export interface SpaceProps {
	children: React.ReactNode;
	id?: string;
	transform?: AffineTransform;
	className?: string;
}

export const Space = forwardRef<Basis, SpaceProps>(
	({ children, id, transform, className = "" }, ref) => {
		const spaceRef = useRef<HTMLDivElement>(null);

		// Use the Valtio-based useSpace hook
		const { basis, space } = useSpace(id);

		// Expose basis API
		useImperativeHandle(ref, () => basis, [basis]);

		// Get current transform for animation
		const currentTransform = useMemo(() => {
			if (space) {
				const raw = space.transform as any;
				return new AffineTransform(raw.a, raw.b, raw.x, raw.c, raw.d, raw.y);
			}
			return transform || AffineTransform.identity();
		}, [space, transform]);

		return (
			<motion.div
				ref={spaceRef}
				className={clsx("affine-space", className)}
				style={{
					transform: `matrix(${currentTransform.toCSSMatrix()})`,
					transformOrigin: "0 0",
				}}
				animate={{
					scale: currentTransform.getScale(),
					rotate: currentTransform.getRotation(),
				}}
			>
				{children}
			</motion.div>
		);
	},
);
