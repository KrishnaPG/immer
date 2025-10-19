import { useMemo, useRef } from "react";
import { useSnapshot } from "valtio";
import {
	elementActions,
	spaceActions,
	store,
	viewportActions,
} from "@/lib/state/store";
import type { TElementId, TSpaceId, TViewportId } from "@/types/branded.types";

export interface EntityBaseConfig {
	id?: string;
	entityType: "space" | "element" | "viewport";
	requiredDependencies?: string[];
}

export interface EntityBaseReturn<T> {
	id: string;
	entity?: T;
	exists: boolean;
	createEntity: () => void;
	removeEntity: () => void;
}

/**
 * Base hook for entity management with common functionality
 */
export const useEntityBase = <T extends { id: string }>(
	config: EntityBaseConfig,
): EntityBaseReturn<T> => {
	const snapshot = useSnapshot(store);

	// Generate ID if not provided
	const id = useMemo(
		() =>
			config.id ||
			`${config.entityType}-${Math.random().toString(36).substr(2, 9)}`,
		[config.id, config.entityType],
	) as TElementId | TSpaceId | TViewportId;

	// Check if entity exists
	const exists = useMemo(() => {
		switch (config.entityType) {
			case "space":
				return snapshot.spaces.has(id as TSpaceId);
			case "element":
				return snapshot.elements.has(id as TElementId);
			case "viewport":
				return snapshot.viewports.has(id as TViewportId);
			default:
				return false;
		}
	}, [id, snapshot, config.entityType]);

	// Get entity from store
	const entity = useMemo(() => {
		switch (config.entityType) {
			case "space":
				return snapshot.spaces.get(id as TSpaceId) as T | undefined;
			case "element":
				return snapshot.elements.get(id as TElementId) as T | undefined;
			case "viewport":
				return snapshot.viewports.get(id as TViewportId) as T | undefined;
			default:
				return undefined;
		}
	}, [id, snapshot, config.entityType]);

	// Create entity if dependencies are met
	const createEntity = useMemo(() => {
		switch (config.entityType) {
			case "space":
				return () => {
					if (
						!exists &&
						!config.requiredDependencies?.some(
							(dep) => !snapshot.spaces.has(dep as TSpaceId),
						)
					) {
						spaceActions.createSpace(id as TSpaceId);
					}
				};
			case "element":
				return () => {
					if (
						!exists &&
						config.requiredDependencies?.some((dep) =>
							snapshot.spaces.has(dep as TSpaceId),
						)
					) {
						elementActions.createElement(
							id as TElementId,
							config.requiredDependencies[0] as TSpaceId,
						);
					}
				};
			case "viewport":
				return () => {
					if (
						!exists &&
						config.requiredDependencies?.some((dep) =>
							snapshot.spaces.has(dep as TSpaceId),
						)
					) {
						// Create viewport using the main store's viewportActions equivalent
						const space = snapshot.spaces.get(config.requiredDependencies[0] as TSpaceId);
						if (space) {
							const viewport: any = {
								id: id as TViewportId,
								space,
								camera: {
									position: { x: 0, y: 0 },
									rotation: 0,
									zoom: 1,
									projection: "orthographic",
								},
								container: document.createElement("div"),
							};
							snapshot.viewports.set(id as TViewportId, viewport);
							if (!snapshot.activeViewport) {
								store.activeViewport = id as TViewportId;
							}
						}
					}
				};
			default:
				return () => {};
		}
	}, [exists, id, snapshot, config.entityType, config.requiredDependencies]);

	// Remove entity
	const removeEntity = useMemo(() => {
		switch (config.entityType) {
			case "space":
				return () => {
					if (exists) {
						spaceActions.removeSpace(id as TSpaceId);
					}
				};
			case "element":
				return () => {
					if (exists) {
						elementActions.removeElement(id as TElementId);
					}
				};
			case "viewport":
				return () => {
					if (exists) {
						viewportActions.removeViewport(id as TViewportId);
					}
				};
			default:
				return () => {};
		}
	}, [exists, id, config.entityType]);

	return {
		id,
		entity,
		exists,
		createEntity,
		removeEntity,
	};
};

