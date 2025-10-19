import { motion } from "framer-motion";
import type React from "react";
import {
	createContext,
	forwardRef,
	useContext,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import { Basis } from "@/lib/geometry/Basis";
import { Point } from "@/lib/geometry/Point";
import { AffineTransform } from "@/lib/geometry/transform";
import { Vector } from "@/lib/geometry/vector";
import styles from "@/styles/components/Space.module.css";

export interface SpaceProps {
	children: React.ReactNode;
	transform?: AffineTransform;
	className?: string;
	onTransform?: (transform: AffineTransform) => void;
}

export interface SpaceContextValue {
	space: Basis;
	at: (x: number, y: number, z?: number) => Point;
	atAnchor: () => Point;
	atMid: () => Point;
	polarOffset: (distance: number, angle: number) => Point;
	transformPoint: (point: Point) => Point;
	untransformPoint: (point: Point) => Point;
}

export const SpaceContext = createContext<SpaceContextValue | null>(null);

export const useSpace = () => {
	const context = useContext(SpaceContext);
	if (!context) {
		throw new Error("useSpace must be used within a Space component");
	}
	return context;
};

export const Space = forwardRef<Basis, SpaceProps>(
	(
		{
			children,
			transform = AffineTransform.identity(),
			className = "",
			onTransform,
		},
		ref,
	) => {
		const spaceRef = useRef<HTMLDivElement>(null);
		const [basis, setBasis] = useState(new Basis(transform));
		const [currentTransform, setCurrentTransform] = useState(transform);

		// Initialize basis
		useEffect(() => {
			setBasis(new Basis(transform));
			setCurrentTransform(transform);
		}, [transform]);

		// Expose basis API
		useImperativeHandle(ref, () => basis);

		const handleTransformChange = (newTransform: AffineTransform) => {
			setCurrentTransform(newTransform);
			setBasis(new Basis(newTransform));
			onTransform?.(newTransform);
		};

		// Coordinate system methods
		const at = (x: number, y: number, z = 0) => {
			return new Point(basis, { x, y, z });
		};

		const atAnchor = () => {
			return new Point(basis, { x: 0, y: 0, z: 0 });
		};

		const atMid = () => {
			if (spaceRef.current) {
				const rect = spaceRef.current.getBoundingClientRect();
				return new Point(basis, { x: rect.width / 2, y: rect.height / 2 });
			}
			return new Point(basis, { x: 0, y: 0 });
		};

		const polarOffset = (distance: number, angle: number) => {
			const x = distance * Math.cos(angle);
			const y = distance * Math.sin(angle);
			return new Point(basis, { x, y });
		};

		return (
			<motion.div
				ref={spaceRef}
				className={`${styles.space} ${className}`}
				style={{
					transform: `matrix(${currentTransform.toCSSMatrix()})`,
					transformOrigin: "0 0",
				}}
				animate={{
					scale: currentTransform.getScale(),
					rotate: currentTransform.getRotation(),
				}}
			>
				<SpaceContext.Provider
					value={{
						space: basis,
						at,
						atAnchor,
						atMid,
						polarOffset,
						transformPoint: (point: Point) => basis.transformPoint(point),
						untransformPoint: (point: Point) => basis.untransformPoint(point),
					}}
				>
					{children}
				</SpaceContext.Provider>
			</motion.div>
		);
	},
);
