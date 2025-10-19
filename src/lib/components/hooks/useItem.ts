import * as tf from "@tensorflow/tfjs";
import { useMemo } from "react";
import { useSnapshot } from "valtio";
import { Basis } from "@/lib/geometry/Basis";
import { AffineTransform } from "@/lib/geometry/transform";
import { Vector } from "@/lib/geometry/vector";
import { elementActions, store } from "@/lib/state/store";
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
	const snapshot = useSnapshot(store);

	// Generate element ID if not provided
	const elementId = useMemo(
		() => id || `item-${Math.random().toString(36).substr(2, 9)}`,
		[id],
	) as TElementId;

	// Get or create element in store
	const element = useMemo(() => {
		if (!snapshot.elements.has(elementId)) {
			// Need a space to create element in
			if (spaceId && snapshot.spaces.has(spaceId as any)) {
				elementActions.createElement(elementId, spaceId as TSpaceId);
			}
		}
		return snapshot.elements.get(elementId);
	}, [elementId, spaceId, snapshot.elements, snapshot.spaces]);

	// Create basis for element coordinate system
	const basis = useMemo(() => {
		if (element) {
			const raw = element.transform as any;
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
	}, [element]);

	// Get position vector
	const position = useMemo(() => {
		if (element) {
			return new Vector(basis, {
				x: element.position.x as number,
				y: element.position.y as number,
			});
		}
		return new Vector(basis, { x: 0, y: 0 });
	}, [element, basis]);

	// Update position function
	const updatePosition = useMemo(
		() => (x: number, y: number) => {
			if (element) {
				element.position = {
					x: x as any,
					y: y as any,
					tensor: tf.tensor1d([x, y]),
				};
			}
		},
		[element],
	);

	// Update transform function
	const updateTransform = useMemo(
		() => (transform: AffineTransform) => {
			if (element) {
				element.transform = transform.getRaw() as any;
			}
		},
		[element],
	);

	return {elementId,
		element,
		basis,
		position,
		updatePosition,
		updateTransform,
	};
};
