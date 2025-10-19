import { useMemo, useState } from "react";
import { useSnapshot } from "valtio";
import { Basis } from "@/lib/geometry/Basis";
import { AffineTransform } from "@/lib/geometry/transform";
import { Vector2D } from "@/lib/geometry/vector";
import { useEntityBase } from "@/lib/hooks/useEntityBase";
import { useSpatialState } from "@/lib/hooks/useSpatialState";
import type {
	TAngle,
	TCoordinateX,
	TCoordinateY,
	TScale,
	TSpaceId,
	TViewportId,
} from "@/types/branded.types";
import type { ICamera, IViewport } from "@/types/core.interfaces";

export interface UseViewportReturn {
	viewport?: IViewport;
	basis: Basis;
	camera?: ICamera;
	updateCamera: (updates: Partial<unknown>) => void;
	// Component state for this viewport
	isPanning: boolean;
	lastPanPoint: { x: number; y: number };
	setIsPanning: (isPanning: boolean) => void;
	setLastPanPoint: (point: { x: number; y: number }) => void;
	panViewport: (deltaX: number, deltaY: number) => void;
	zoomViewport: (zoomFactor: number) => void;
	resetViewport: () => void;
}

export const useViewport = (id?: string): UseViewportReturn => {
	// Use entity base for viewport management
	const {
		entity: viewport,
		id: viewportId,
		exists,
	} = useEntityBase({
		id,
		entityType: "viewport",
	});

	// Use spatial state for accessing viewport data
	const { useViewport: getViewport } = useSpatialState();
	const viewportData = getViewport(viewportId);

	// Component state for this viewport
	const [isPanning, setIsPanning] = useState(false);
	const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

	// Create basis from camera transform
	const basis = useMemo(() => {
		if (viewportData) {
			const camera = viewportData.camera;
			const identityBasis = new Basis(AffineTransform.identity());
			const translationVector = new Vector2D(identityBasis, {
				x: -(camera.position.x as number),
				y: -(camera.position.y as number),
			});
			const translateTransform = AffineTransform.translateBy(translationVector);
			const scaleTransform = AffineTransform.scaleBy(camera.zoom as number);
			const transformMatrix = translateTransform.compose(scaleTransform);
			return new Basis(transformMatrix);
		}
		return new Basis(AffineTransform.identity());
	}, [viewportData]);

	// Camera update function
	const updateCamera = useMemo(
		() => (updates: Partial<unknown>) => {
			if (viewportData) {
				Object.assign(viewportData.camera, updates);
			}
		},
		[viewportData],
	);

	// Viewport interaction functions
	const panViewport = useMemo(
		() => (deltaX: number, deltaY: number) => {
			if (viewportData) {
				const translation = new Vector2D(basis, {
					x: deltaX,
					y: deltaY,
				});
				const newTransform = AffineTransform.translateBy(translation);
				// Update camera position using proper branded types
				viewportData.camera.position = {
					x: (viewportData.camera.position.x - deltaX) as TCoordinateX,
					y: (viewportData.camera.position.y - deltaY) as TCoordinateY,
					tensor: viewportData.camera.position.tensor,
				};
			}
		},
		[viewportData, basis],
	);

	const zoomViewport = useMemo(
		() => (zoomFactor: number) => {
			if (viewportData) {
				const scaleTransform = AffineTransform.scaleBy(zoomFactor);
				const newTransform = basis.transform.compose(scaleTransform);
				// Create new basis with updated transform
				const newBasis = new Basis(newTransform);
				// Update camera zoom using proper branded types
				viewportData.camera.zoom = (viewportData.camera.zoom *
					zoomFactor) as TScale;
			}
		},
		[viewportData, basis],
	);

	const resetViewport = useMemo(
		() => () => {
			if (viewportData) {
				// Reset camera using proper branded types
				viewportData.camera.position = {
					x: 0 as TCoordinateX,
					y: 0 as TCoordinateY,
					tensor: viewportData.camera.position.tensor,
				};
				viewportData.camera.rotation = 0 as TAngle;
				viewportData.camera.zoom = 1 as TScale;
				setIsPanning(false);
				setLastPanPoint({ x: 0, y: 0 });
			}
		},
		[viewportData],
	);

	return {
		viewport: viewportData,
		basis,
		camera: viewportData?.camera,
		updateCamera,
		isPanning,
		lastPanPoint,
		setIsPanning,
		setLastPanPoint,
		panViewport,
		zoomViewport,
		resetViewport,
	};
};
