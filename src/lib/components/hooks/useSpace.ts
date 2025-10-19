import { useMemo } from "react";
import { useSnapshot } from "valtio";
import { Basis } from "@/lib/geometry/Basis";
import { Point } from "@/lib/geometry/Point";
import { AffineTransform } from "@/lib/geometry/transform";
import { spaceActions, store } from "@/lib/state/store";

export interface UseSpaceReturn {
	space: any;
	basis: Basis;
	at: (x: number, y: number, z?: number) => Point;
	atAnchor: () => Point;
	atMid: () => Point;
	polarOffset: (distance: number, angle: number) => Point;
	transformPoint: (point: Point) => Point;
	untransformPoint: (point: Point) => Point;
}

export const useSpace = (id?: string): UseSpaceReturn => {
	const snapshot = useSnapshot(store);

	// Generate space ID if not provided
	const spaceId = useMemo(
		() => id || `space-${Math.random().toString(36).substr(2, 9)}`,
		[id],
	);

	// Get or create space in store
	const space = useMemo(() => {
		if (!snapshot.spaces.has(spaceId as any)) {
			spaceActions.createSpace(spaceId as any);
		}
		return snapshot.spaces.get(spaceId as any);
	}, [spaceId, snapshot.spaces]);

	// Create basis from space transform
	const basis = useMemo(() => {
		if (space) {
			const raw = space.transform as any;
			const transformMatrix = new AffineTransform(raw.a, raw.b, raw.x, raw.c, raw.d, raw.y);
			return new Basis(transformMatrix);
		}
		return new Basis(AffineTransform.identity());
	}, [space]);

	// Coordinate system methods
	const at = useMemo(
		() =>
			(x: number, y: number, z = 0) => {
				return new Point(basis, { x, y, z });
			},
		[basis],
	);

	const atAnchor = useMemo(
		() => () => {
			return new Point(basis, { x: 0, y: 0, z: 0 });
		},
		[basis],
	);

	const atMid = useMemo(
		() => () => {
			return new Point(basis, { x: 0, y: 0 }); // Will be updated by component
		},
		[basis],
	);

	const polarOffset = useMemo(
		() => (distance: number, angle: number) => {
			const x = distance * Math.cos(angle);
			const y = distance * Math.sin(angle);
			return new Point(basis, { x, y });
		},
		[basis],
	);

	const transformPoint = useMemo(
		() => (point: Point) => {
			return basis.transformPoint(point);
		},
		[basis],
	);

	const untransformPoint = useMemo(
		() => (point: Point) => {
			return basis.untransformPoint(point);
		},
		[basis],
	);

	return {
		space,
		basis,
		at,
		atAnchor,
		atMid,
		polarOffset,
		transformPoint,
		untransformPoint,
	};
};
