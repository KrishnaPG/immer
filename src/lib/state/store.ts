import { proxy } from "valtio";
import { AABB } from "@/geometry/aabb";
import { AffineTransform } from "@/geometry/transform";
import { Vector2D } from "@/geometry/vector";
import type {
	TAffineTransform,
	TAngle,
	TCoordinate,
	TDistance,
	TElementId,
	TElementType,
	THeight,
	TScale,
	TSpaceId,
	TViewportId,
	TWidth,
} from "@/types/branded.types";
import type { IElement, ISpace, IViewport } from "@/types/core.interfaces";

/**
 * Valtio store for state management
 */
export interface ImmerStore {
	spaces: Map<TSpaceId, ISpace>;
	viewports: Map<TViewportId, IViewport>;
	elements: Map<TElementId, IElement>;
	activeSpace: TSpaceId | null;
	activeViewport: TViewportId | null;
	isInitialized: boolean;
}

/**
 * Create the main store
 */
export const store = proxy<ImmerStore>({
	spaces: new Map(),
	viewports: new Map(),
	elements: new Map(),
	activeSpace: null,
	activeViewport: null,
	isInitialized: false,
});

/**
 * Store actions for managing spaces
 */
export const spaceActions = {
	createSpace: (id: TSpaceId, config: Partial<ISpace> = {}): ISpace => {
		const space: ISpace = {
			id,
			elements: new Map(),
			transform: AffineTransform.identity().matrix as unknown as TAffineTransform,
			bounds: undefined,
			...config,
		};

		store.spaces.set(id, space);

		if (!store.activeSpace) {
			store.activeSpace = id;
		}

		return space;
	},

	removeSpace: (id: TSpaceId): void => {
		const space = store.spaces.get(id);
		if (space) {
			// Clean up elements
			space.elements.forEach((_, elementId) => {
				store.elements.delete(elementId);
			});

			store.spaces.delete(id);

			if (store.activeSpace === id) {
				store.activeSpace = store.spaces.keys().next().value || null;
			}
		}
	},

	setActiveSpace: (id: TSpaceId): void => {
		if (store.spaces.has(id)) {
			store.activeSpace = id;
		}
	},
};

/**
 * Store actions for managing viewports
 */
export const viewportActions = {
	createViewport: (
		id: TViewportId,
		spaceId: TSpaceId,
		container: HTMLElement,
	): IViewport => {
		const space = store.spaces.get(spaceId);
		if (!space) {
			throw new Error(`Space with id ${spaceId} not found`);
		}

		const viewport: IViewport = {
			id,
			space,
			camera: {
				position: new Vector2D(0 as TCoordinate, 0 as TCoordinate),
				rotation: 0 as TAngle,
				zoom: 1 as TScale,
				projection: "orthographic",
			},
			container,
		};

		store.viewports.set(id, viewport);

		if (!store.activeViewport) {
			store.activeViewport = id;
		}

		return viewport;
	},

	removeViewport: (id: TViewportId): void => {
		store.viewports.delete(id);

		if (store.activeViewport === id) {
			store.activeViewport = store.viewports.keys().next().value || null;
		}
	},

	setActiveViewport: (id: TViewportId): void => {
		if (store.viewports.has(id)) {
			store.activeViewport = id;
		}
	},
};

/**
 * Store actions for managing elements
 */
export const elementActions = {
	createElement: (
		id: TElementId,
		spaceId: TSpaceId,
		config: Partial<IElement> = {},
	): IElement => {
		const space = store.spaces.get(spaceId);
		if (!space) {
			throw new Error(`Space with id ${spaceId} not found`);
		}

		const element: IElement = {
			id,
			type: "element" as TElementType,
			position: new Vector2D(0 as TCoordinate, 0 as TCoordinate),
			size: {
				width: 100 as TWidth,
				height: 100 as THeight,
				tensor: new Vector2D(100 as TCoordinate, 100 as TCoordinate).tensor
			},
			rotation: 0 as TAngle,
			scale: 1 as TScale,
			transform: AffineTransform.identity().matrix as unknown as TAffineTransform,
			visible: true,
			interactive: true,
			children: [],
			...config,
		};

		store.elements.set(id, element);
		space.elements.set(id, element);

		return element;
	},

	removeElement: (id: TElementId): void => {
		const element = store.elements.get(id);
		if (element) {
			// Remove from parent's children
			if (element.parent) {
				const parent = store.elements.get(element.parent);
				if (parent) {
					parent.children = parent.children.filter((childId) => childId !== id);
				}
			}

			// Remove from space - find the space that contains this element
			for (const [_spaceId, space] of store.spaces.entries()) {
				if (space.elements.has(id)) {
					space.elements.delete(id);
					break;
				}
			}

			store.elements.delete(id);
		}
	},

	updateElementTransform: (
		id: TElementId,
		transform: AffineTransform,
	): void => {
		const element = store.elements.get(id);
		if (element) {
			element.transform = transform.matrix as unknown as TAffineTransform;
		}
	},
};

/**
 * Initialize the store
 */
export const initializeStore = (): void => {
	if (!store.isInitialized) {
		store.isInitialized = true;
	}
};

/**
 * Reset the store to initial state
 */
export const resetStore = (): void => {
	store.spaces.clear();
	store.viewports.clear();
	store.elements.clear();
	store.activeSpace = null;
	store.activeViewport = null;
	store.isInitialized = false;
};
