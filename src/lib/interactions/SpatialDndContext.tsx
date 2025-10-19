import {
	type Active,
	type CollisionDetection,
	DndContext,
	type DragEndEvent,
	type DragMoveEvent,
	DragOverlay,
	type DragStartEvent,
	getFirstCollision,
	KeyboardSensor,
	type Over,
	PointerSensor,
	rectIntersection,
	useSensor,
	useSensors,
} from "@dnd-kit/core";

// Basic keyboard coordinate getter implementation
const sortableKeyboardCoordinates = (event: any, args: any) => {
	const { currentCoordinates } = args;
	const { x, y } = currentCoordinates;

	switch (event.code) {
		case "ArrowRight":
			return { x: x + 20, y };
		case "ArrowLeft":
			return { x: x - 20, y };
		case "ArrowDown":
			return { x, y: y + 20 };
		case "ArrowUp":
			return { x, y: y - 20 };
	}

	return currentCoordinates;
};

import type React from "react";
import { createContext, type ReactNode, useContext, useState } from "react";
import { AffineTransform } from "@/lib/geometry/transform";
import { Vector2D } from "@/lib/geometry/vector";
import type { TCoordinate } from "@/types/branded.types";

export interface SpatialDndContextType {
	activeId: string | number | null;
	activeItem: any | null;
	screenToSpatial: (screenPoint: { x: number; y: number }) => Vector2D;
	spatialToScreen: (spatialPoint: Vector2D) => { x: number; y: number };
	getDragOverlay: () => React.ReactNode;
	isDragging: boolean;
}

export interface SpatialDndProviderProps {
	children: ReactNode;
	onDragStart?: (event: DragStartEvent) => void;
	onDragEnd?: (event: DragEndEvent) => void;
	onDragOver?: (event: DragMoveEvent) => void;
	onDragCancel?: () => void;
	collisionDetection?: CollisionDetection;
	modifiers?: any[];
}

const SpatialDndContext = createContext<SpatialDndContextType | null>(null);

export const useSpatialDnd = () => {
	const context = useContext(SpatialDndContext);
	if (!context) {
		throw new Error("useSpatialDnd must be used within SpatialDndProvider");
	}
	return context;
};

export const SpatialDndProvider: React.FC<SpatialDndProviderProps> = ({
	children,
	onDragStart,
	onDragEnd,
	onDragOver,
	onDragCancel,
	collisionDetection = rectIntersection,
	modifiers,
}) => {
	const [active, setActive] = useState<Active | null>(null);
	const [over, setOver] = useState<Over | null>(null);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	// Convert screen coordinates to spatial coordinates
	const screenToSpatial = (screenPoint: { x: number; y: number }): Vector2D => {
		// For now, return as-is. In a full implementation, this would
		// transform through the viewport's coordinate system
		return new Vector2D(
			screenPoint.x as TCoordinate,
			screenPoint.y as TCoordinate,
		);
	};

	// Convert spatial coordinates to screen coordinates
	const spatialToScreen = (
		spatialPoint: Vector2D,
	): { x: number; y: number } => {
		// For now, return as-is. In a full implementation, this would
		// transform through the viewport's coordinate system
		return { x: spatialPoint.x as number, y: spatialPoint.y as number };
	};

	const handleDragStart = (event: DragStartEvent) => {
		setActive(event.active);
		onDragStart?.(event);
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, delta, over } = event;

		// Convert screen delta to spatial coordinates if needed
		const spatialDelta = screenToSpatial(delta);

		// Create enhanced event with spatial information
		const spatialEvent = {
			...event,
			spatial: {
				delta: spatialDelta,
				active: active.rect.current.translated,
			},
		};

		onDragEnd?.(spatialEvent);
		setActive(null);
		setOver(null);
	};

	const handleDragOver = (event: DragMoveEvent) => {
		setOver(event.over);
		onDragOver?.(event);
	};

	const handleDragCancel = () => {
		setActive(null);
		setOver(null);
		onDragCancel?.();
	};

	const contextValue: SpatialDndContextType = {
		activeId: active?.id || null,
		activeItem: active,
		screenToSpatial,
		spatialToScreen,
		getDragOverlay: () =>
			active ? <DragOverlay>{children}</DragOverlay> : null,
		isDragging: active !== null,
	};

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={collisionDetection}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
			onDragOver={handleDragOver}
			onDragCancel={handleDragCancel}
			modifiers={modifiers}
		>
			<SpatialDndContext.Provider value={contextValue}>
				{children}
			</SpatialDndContext.Provider>
		</DndContext>
	);
};

// Custom collision detection for spatial coordinates
export const spatialCollisionDetection: CollisionDetection = (args) => {
	// For now, use a simple implementation that checks basic intersection
	// TODO: In a full implementation, this would use spatial collision detection
	const collisions = []

	for (const container of args.droppableContainers) {
		if (container.id !== args.active.id) {
			collisions.push(container)
		}
	}

	return collisions
};

// Custom modifier for spatial constraints
export const createSpatialModifier = (constraints?: {
	minX?: number;
	maxX?: number;
	minY?: number;
	maxY?: number;
}) => {
	return ({ transform }: { transform: { x: number; y: number } }) => {
		const { x, y } = transform;

		return {
			x: Math.max(
				constraints?.minX ?? -Infinity,
				Math.min(constraints?.maxX ?? Infinity, x),
			),
			y: Math.max(
				constraints?.minY ?? -Infinity,
				Math.min(constraints?.maxY ?? Infinity, y),
			),
		};
	};
};

// Hook for spatial drag behavior
export const useSpatialDrag = (id: string, data?: any) => {
	const { screenToSpatial, spatialToScreen, isDragging } = useSpatialDnd();

	return {
		id,
		data: {
			...data,
			spatial: {
				screenToSpatial,
				spatialToScreen,
			},
		},
		isDragging,
	};
};

// Hook for spatial drop behavior
export const useSpatialDrop = (
	id: string,
	options?: {
		accept?: string | string[];
		collisionDetection?: CollisionDetection;
	},
) => {
	const { activeId, activeItem } = useSpatialDnd();

	const isActive = activeId !== null;
	const isOver = activeItem?.over?.id === id;

	return {
		id,
		isActive,
		isOver,
		accept: options?.accept,
		collisionDetection: options?.collisionDetection,
	};
};
