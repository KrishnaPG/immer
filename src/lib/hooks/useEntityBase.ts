import { useMemo, useRef } from "react";
import { useSnapshot } from "valtio";
import {
	elementActions,
	spaceActions,
	store,
	storeGetters,
	viewportActions,
} from "@/lib/state/store";
import type { TElementId, TSpaceId, TViewportId } from "@/types/branded.types";
import { generateId } from "../utils/id-generator";

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
	// Generate ID if not provided
	const id = useMemo(
		() =>	config.id || generateId(config.entityType),
		[config.id, config.entityType],
	) as TElementId | TSpaceId | TViewportId;

	// Only subscribe to the specific parts of the store we need
	const storeSnapshot = useSnapshot(store);
	const { spaces, elements, viewports, activeViewport } = storeSnapshot;

	// Check if entity exists
	const exists = useMemo(() => {
		switch (config.entityType) {
			case "space":
				return spaces.has(id as TSpaceId);
			case "element":
				return elements.has(id as TElementId);
			case "viewport":
				return viewports.has(id as TViewportId);
			default:
				return false;
		}
	}, [id, spaces, elements, viewports, config.entityType]);

	// Get entity from store
	const entity = useMemo(() => {
		switch (config.entityType) {
			case "space":
				return spaces.get(id as TSpaceId) as T | undefined;
			case "element":
				return elements.get(id as TElementId) as T | undefined;
			case "viewport":
				return viewports.get(id as TViewportId) as T | undefined;
			default:
				return undefined;
		}
	}, [id, spaces, elements, viewports, config.entityType]);

	// Create entity if dependencies are met
	const createEntity = useMemo(() => {
		switch (config.entityType) {
			case "space":
				return () => {
					if (
						!exists &&
						!config.requiredDependencies?.some(
							(dep) => !storeGetters.hasSpace(dep as TSpaceId),
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
							storeGetters.hasSpace(dep as TSpaceId),
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
							storeGetters.hasSpace(dep as TSpaceId),
						)
					) {
						// Create viewport using the main store's viewportActions equivalent
						const space = storeGetters.getSpace(config.requiredDependencies[0] as TSpaceId);
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
							// Use direct proxy access for mutations
							store.viewports.set(id as TViewportId, viewport);
							if (!storeGetters.getActiveViewport()) {
								store.activeViewport = id as TViewportId;
							}
						}
					}
				};
			default:
				return () => {};
		}
	}, [exists, id, config.entityType, config.requiredDependencies]);

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

