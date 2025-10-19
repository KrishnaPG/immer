import * as tf from "@tensorflow/tfjs";
import { useMemo } from "react";
import { Basis } from "@/lib/geometry/Basis";
import { AffineTransform } from "@/lib/geometry/transform";
import { Vector } from "@/lib/geometry/vector";
import { useEntityBase } from "@/lib/hooks/useEntityBase";
import { useSpatialState } from "@/lib/hooks/useSpatialState";
import type { TElementId, TSpaceId } from "@/types/branded.types";

export interface UseItemReturn {
  elementId: string,
	element?: any;
	basis: Basis;
	position: Vector;
	updatePosition: (x: number, y: number) => void;
	updateTransform: (transform: AffineTransform) => void;
}

export const useItem = (id?: string, spaceId?: string): UseItemReturn => {
	// Use entity base for element management
	const { entity: element, id: elementId } = useEntityBase({
		id,
		entityType: "element",
		requiredDependencies: spaceId ? [spaceId] : undefined
	});

	// Use spatial state for accessing element data
	const { useElement: getElement } = useSpatialState();
	const elementData = getElement(elementId);

	// Create basis for element coordinate system
	const basis = useMemo(() => {
		if (elementData) {
			const raw = elementData.transform as any;
			const transformMatrix = new AffineTransform(
				raw.a,
				raw.b,
				raw.x,
				raw.c,
				raw.d,
				raw.y,
			);
			return new Basis(transformMatrix);
		}
		return new Basis(AffineTransform.identity());
	}, [elementData]);

	// Get position vector
	const position = useMemo(() => {
		if (elementData) {
			return new Vector(basis, {
				x: elementData.position.x as number,
				y: elementData.position.y as number,
			});
		}
		return new Vector(basis, { x: 0, y: 0 });
	}, [elementData, basis]);

	// Update position function
	const updatePosition = useMemo(
		() => (x: number, y: number) => {
			if (elementData) {
				elementData.position = {
					x: x as any,
					y: y as any,
					tensor: tf.tensor1d([x, y]),
				};
			}
		},
		[elementData],
	);

	// Update transform function
	const updateTransform = useMemo(
		() => (transform: AffineTransform) => {
			if (elementData) {
				elementData.transform = transform.getRaw() as any;
			}
		},
		[elementData],
	);

	return {elementId,
		element: elementData,
		basis,
		position,
		updatePosition,
		updateTransform,
	};
};
