import { useGesture } from "@use-gesture/react";
import { useCallback, useRef } from "react";
import { AffineTransform } from "@/lib/geometry/transform";
import { Vector2D } from "@/lib/geometry/vector";
import type { TCoordinate, TScale } from "@/types/branded.types";

export interface SpatialGestureOptions {
	enableDrag?: boolean;
	enablePinch?: boolean;
	enableWheel?: boolean;
	enableHover?: boolean;
	dragThreshold?: number;
	pinchThreshold?: number;
}

export interface SpatialGestureState {
	isDragging: boolean;
	isPinching: boolean;
	lastPinchDistance: number;
	dragStartPoint: Vector2D | null;
}

export interface SpatialGestureHandlers {
	onDrag?: (delta: Vector2D, event: any) => void;
	onPinch?: (transform: AffineTransform, event: any) => void;
	onWheel?: (transform: AffineTransform, event: any) => void;
	onHover?: (active: boolean, event: any) => void;
	onTap?: (point: Vector2D, event: any) => void;
}

export const useSpatialGesture = (
	elementRef: React.RefObject<HTMLElement>,
	options: SpatialGestureOptions = {},
	handlers: SpatialGestureHandlers = {},
) => {
	const {
		enableDrag = true,
		enablePinch = true,
		enableWheel = true,
		enableHover = true,
		dragThreshold = 5,
		pinchThreshold = 10,
	} = options;

	const gestureState = useRef<SpatialGestureState>({
		isDragging: false,
		isPinching: false,
		lastPinchDistance: 0,
		dragStartPoint: null,
	});

	// Convert screen coordinates to spatial coordinates
	const screenToSpatialCoordinates = useCallback(
		(screenPoint: { x: number; y: number }): Vector2D => {
			// For now, return as-is. In a full implementation, this would
			// transform through the viewport's coordinate system
			return new Vector2D(
				screenPoint.x as TCoordinate,
				screenPoint.y as TCoordinate,
			);
		},
		[],
	);

	// Create spatial transform from screen delta
	const createSpatialTransform = useCallback(
		(gestureData: any): AffineTransform => {
			// Extract transformation data from gesture
			const { delta = [0, 0], scale = 1, rotation = 0 } = gestureData;

			// Create translation from delta
			const translation = AffineTransform.translation(delta[0], delta[1]);

			// Create scale transform if needed
			const scaleTransform =
				scale !== 1
					? AffineTransform.scaling(scale, scale)
					: AffineTransform.identity();

			// Create rotation transform if needed
			const rotationTransform =
				rotation !== 0
					? AffineTransform.rotation(rotation)
					: AffineTransform.identity();

			// Compose transforms: translation * rotation * scale
			return translation.compose(rotationTransform).compose(scaleTransform);
		},
		[],
	);

	const gestureHandler = useCallback(
		({ event, ...gestureData }: any) => {
			// Convert screen coordinates to spatial coordinates
			const spatialTransform = createSpatialTransform(gestureData);

			// Emit spatial gesture events
			elementRef.current?.dispatchEvent(
				new CustomEvent("spatialgesture", {
					detail: { event, spatialTransform, gestureData },
				}),
			);
		},
		[createSpatialTransform, elementRef],
	);

	const bind = useGesture(
		{
			onDrag: ({ active, delta: [dx, dy], first, last, tap, event }) => {
				if (first) {
					gestureState.current.isDragging = true;
					gestureState.current.dragStartPoint = new Vector2D(
						dx as TCoordinate,
						dy as TCoordinate,
					);
				}

				if (active && enableDrag) {
					const deltaVector = new Vector2D(
						dx as TCoordinate,
						dy as TCoordinate,
					);
					handlers.onDrag?.(deltaVector, event);
					gestureHandler({ event: "drag", delta: [dx, dy] });
				}

				if (last) {
					gestureState.current.isDragging = false;
					gestureState.current.dragStartPoint = null;
				}

				// Handle tap gesture
				if (tap && handlers.onTap) {
					// Safely extract client coordinates from different event types
					const clientX = 'clientX' in event ? event.clientX : 0;
					const clientY = 'clientY' in event ? event.clientY : 0;
					const tapPoint = screenToSpatialCoordinates({
						x: clientX,
						y: clientY,
					});
					handlers.onTap(tapPoint, event);
				}
			},

			onPinch: ({
				active,
				offset: [scale],
				origin: [ox, oy],
				first,
				last,
				event,
			}) => {
				if (first) {
					gestureState.current.isPinching = true;
					gestureState.current.lastPinchDistance = scale;
				}

				if (active && enablePinch) {
					const originVector = new Vector2D(
						ox as TCoordinate,
						oy as TCoordinate,
					);
					const scaleTransform = AffineTransform.scaling(
						scale as TScale,
						scale as TScale,
					);
					handlers.onPinch?.(scaleTransform, event);
					gestureHandler({ event: "pinch", scale, origin: [ox, oy] });
				}

				if (last) {
					gestureState.current.isPinching = false;
					gestureState.current.lastPinchDistance = 0;
				}
			},

			onWheel: ({ active, delta: [dx, dy], event }) => {
				if (enableWheel) {
					const zoomFactor = (dy > 0 ? 0.9 : 1.1) as TScale;
					const zoomTransform = AffineTransform.scaling(zoomFactor, zoomFactor);
					handlers.onWheel?.(zoomTransform, event);
					gestureHandler({ event: "wheel", delta: [dx, dy] });
				}
			},

			onPointerEnter: ({ event }) => {
				if (enableHover) {
					handlers.onHover?.(true, event);
					gestureHandler({ event: "pointerenter" });
				}
			},

			onPointerLeave: ({ event }) => {
				if (enableHover) {
					handlers.onHover?.(false, event);
					gestureHandler({ event: "pointerleave" });
				}
			},
		},
		{
			drag: {
				threshold: dragThreshold,
				filterTaps: true,
			},
			pinch: {
				threshold: pinchThreshold,
				scaleBounds: { min: 0.1, max: 10 },
			},
		},
	);

	return {
		bind,
		gestureState: gestureState.current,
		screenToSpatial: screenToSpatialCoordinates,
		createSpatialTransform,
	};
};
