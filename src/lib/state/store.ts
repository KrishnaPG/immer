import * as tf from "@tensorflow/tfjs";
import { proxy } from "valtio";
import { AffineTransform } from "@/lib/geometry/transform";
import { Vector2D } from "@/lib/geometry/vector";
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
import { Basis } from "../geometry/Basis";

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
			transform: AffineTransform.identity().getRaw() as unknown as TAffineTransform,
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

	updateSpaceTransform: (id: TSpaceId, transform: AffineTransform): void => {
		const space = store.spaces.get(id);
		if (space) {
			space.transform = transform.getRaw() as unknown as TAffineTransform;
		}
	},

	getSpace: (id: TSpaceId): ISpace | undefined => {
		return store.spaces.get(id);
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
			position: new Vector2D(new Basis(AffineTransform.identity()), {
				x: 0 as TCoordinate,
				y: 0 as TCoordinate,
			}),
			size: {
				width: 100 as TWidth,
				height: 100 as THeight,
				tensor: tf.tensor1d([100, 100]),
			},
			rotation: 0 as TAngle,
			scale: 1 as TScale,
			transform: AffineTransform.identity().getRaw() as unknown as TAffineTransform,
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
			element.transform = transform.getRaw() as unknown as TAffineTransform;
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
				position: new Vector2D(new Basis(AffineTransform.identity()), {
					x: 0 as TCoordinate,
					y: 0 as TCoordinate,
				}),
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

	getViewport: (id: TViewportId): IViewport | undefined => {
		return store.viewports.get(id);
	},

	getActiveViewport: (): IViewport | undefined => {
		return store.activeViewport
			? store.viewports.get(store.activeViewport)
			: undefined;
	},

	updateCamera: (id: TViewportId, updates: Partial<unknown>): void => {
		const viewport = store.viewports.get(id);
		if (viewport) {
			Object.assign(viewport.camera, updates);
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
