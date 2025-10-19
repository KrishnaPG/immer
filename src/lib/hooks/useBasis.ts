import { useMemo } from "react";
import { Basis } from "@/lib/geometry/Basis";
import { Point } from "@/lib/geometry/Point";
import { AffineTransform } from "@/lib/geometry/transform";
import { Vector } from "@/lib/geometry/vector";

export interface BasisConfig {
	transform?: any; // Raw transform data
	fallbackToIdentity?: boolean;
}

/**
 * Hook for creating and managing Basis objects with common geometry operations
 */
export const useBasis = (config: BasisConfig = {}) => {
	const { transform, fallbackToIdentity = true } = config;

	// Create basis from transform data
	const basis = useMemo(() => {
		if (transform) {
			try {
				const transformMatrix = new AffineTransform(
					transform.a,
					transform.b,
					transform.x,
					transform.c,
					transform.d,
					transform.y,
				);
				return new Basis(transformMatrix);
			} catch (error) {
				console.warn("Failed to create basis from transform:", error);
				return fallbackToIdentity
					? new Basis(AffineTransform.identity())
					: null;
			}
		}
		return fallbackToIdentity ? new Basis(AffineTransform.identity()) : null;
	}, [transform, fallbackToIdentity]);

	// Coordinate system methods
	const at = useMemo(() => {
		if (!basis) return () => null;
		return (x: number, y: number, z = 0) => new Point(basis, { x, y, z });
	}, [basis]);

	const atAnchor = useMemo(() => {
		if (!basis) return () => null;
		return () => new Point(basis, { x: 0, y: 0, z: 0 });
	}, [basis]);

	const atMid = useMemo(() => {
		if (!basis) return () => null;
		return () => new Point(basis, { x: 0, y: 0 });
	}, [basis]);

	const polarOffset = useMemo(() => {
		if (!basis) return () => null;
		return (distance: number, angle: number) => {
			const x = distance * Math.cos(angle);
			const y = distance * Math.sin(angle);
			return new Point(basis, { x, y });
		};
	}, [basis]);

	const transformPoint = useMemo(() => {
		if (!basis) return () => null;
		return (point: Point) => basis.transformPoint(point);
	}, [basis]);

	const untransformPoint = useMemo(() => {
		if (!basis) return () => null;
		return (point: Point) => basis.untransformPoint(point);
	}, [basis]);

	const createVector = useMemo(() => {
		if (!basis) return () => null;
		return (x: number, y: number) => new Vector(basis, { x, y });
	}, [basis]);

	return {
		basis,
		at,
		atAnchor,
		atMid,
		polarOffset,
		transformPoint,
		untransformPoint,
		createVector,
	};
};

/**
 * Hook for camera-based basis creation (used by Viewport)
 */
export const useCameraBasis = (camera?: any) => {
	const basis = useMemo(() => {
		if (!camera) {
			return new Basis(AffineTransform.identity());
		}

		try {
			const identityBasis = new Basis(AffineTransform.identity());
			const translationVector = new Vector(identityBasis, {
				x: -(camera.position.x as number),
				y: -(camera.position.y as number),
			});
			const translateTransform = AffineTransform.translateBy(translationVector);
			const scaleTransform = AffineTransform.scaleBy(camera.zoom as number);
			const transformMatrix = translateTransform.compose(scaleTransform);
			return new Basis(transformMatrix);
		} catch (error) {
			console.warn("Failed to create camera basis:", error);
			return new Basis(AffineTransform.identity());
		}
	}, [camera]);

	return { basis };
};
