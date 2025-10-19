import { useMemo } from "react";
import { Basis } from "@/lib/geometry/Basis";
import { Point } from "@/lib/geometry/Point";
import { AffineTransform } from "@/lib/geometry/transform";
import { useBasis } from "@/lib/hooks/useBasis";
import { useEntityBase } from "@/lib/hooks/useEntityBase";
import type { TSpaceId } from "@/types/branded.types";

export interface UseSpaceReturn {
	space: any;
	basis: any;
	at: (x: number, y: number, z?: number) => Point;
	atAnchor: () => Point;
	atMid: () => Point;
	polarOffset: (distance: number, angle: number) => Point;
	transformPoint: (point: Point) => Point;
	untransformPoint: (point: Point) => Point;
}

export const useSpace = (id?: string): UseSpaceReturn => {
	// Use entity base for space management
	const { entity: space } = useEntityBase({
		id,
		entityType: "space",
	});

	// Use basis hook for geometry operations
	const {
		basis,
		at,
		atAnchor,
		atMid,
		polarOffset,
		transformPoint,
		untransformPoint,
	} = useBasis({
		transform: space?.transform,
		fallbackToIdentity: true,
	});

	// Create fallback functions that always work
	const fallbackBasis = new Basis(AffineTransform.identity());
	const fallbackAt = (x: number, y: number, z = 0) =>
		new Point(fallbackBasis, { x, y, z });
	const fallbackAtAnchor = () => new Point(fallbackBasis, { x: 0, y: 0, z: 0 });
	const fallbackAtMid = () => new Point(fallbackBasis, { x: 0, y: 0 });
	const fallbackPolarOffset = (distance: number, angle: number) => {
		const x = distance * Math.cos(angle);
		const y = distance * Math.sin(angle);
		return new Point(fallbackBasis, { x, y });
	};
	const fallbackTransformPoint = (point: Point) => point;
	const fallbackUntransformPoint = (point: Point) => point;

	return {
		space,
		basis: basis || fallbackBasis,
		at: at || fallbackAt,
		atAnchor: atAnchor || fallbackAtAnchor,
		atMid: atMid || fallbackAtMid,
		polarOffset: polarOffset || fallbackPolarOffset,
		transformPoint: transformPoint || fallbackTransformPoint,
		untransformPoint: untransformPoint || fallbackUntransformPoint,
	};
};
