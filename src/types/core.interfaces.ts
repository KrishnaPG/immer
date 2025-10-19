import type * as tf from "@tensorflow/tfjs";
import type {
	TAffineTransform,
	TAngle,
	TAnimationDuration,
	TAnimationEasing,
	TComponentType,
	TCoordinate,
	TCoordinateX,
	TCoordinateY,
	TDistance,
	TElementId,
	TElementType,
	THeight,
	TScale,
	TSpaceId,
	TStateKey,
	TStateValue,
	TTransformOrigin,
	TViewportId,
	TWidth,
} from "./branded.types";

/**
 * Core geometry interfaces for 2D affine transformations using TensorFlow.js
 */
export interface IPoint2D {
	x: TCoordinateX;
	y: TCoordinateY;
}

export interface ITensorPoint2D extends IPoint2D {
	tensor: tf.Tensor1D;
}

export type IVector2D  = IPoint2D;

export interface ITensorVector2D extends IVector2D {
	tensor: tf.Tensor1D;
}

export interface ISize2D {
	width: TWidth;
	height: THeight;
}

export interface ITensorSize2D extends ISize2D {
	tensor: tf.Tensor1D;
}

export interface IRectangle extends IPoint2D, ISize2D {
}

export interface ITensorRectangle extends IRectangle {
	tensor: tf.Tensor1D;
}

export interface ITransform2D {
	translation: ITensorVector2D;
	rotation: TAngle;
	scale: TScale;
	origin?: TTransformOrigin;
}

export interface IAABB {
	min: ITensorPoint2D;
	max: ITensorPoint2D;
}

export interface ITensorAABB extends IAABB {
	tensor: tf.Tensor1D;
}

/**
 * Space and viewport interfaces
 */
export interface ISpace {
	id: TSpaceId;
	elements: Map<TElementId, IElement>;
	transform: TAffineTransform;
	bounds?: ITensorAABB;
}

export interface IViewport {
	id: TViewportId;
	space: ISpace;
	camera: ICamera;
	container: HTMLElement;
}

export interface ICamera {
	position: ITensorPoint2D;
	rotation: TAngle;
	zoom: TScale;
	projection: "orthographic" | "perspective";
}

/**
 * Element interfaces
 */
export interface IElement {
	id: TElementId;
	type: TElementType;
	position: ITensorPoint2D;
	size: ITensorSize2D;
	rotation: TAngle;
	scale: TScale;
	transform: TAffineTransform;
	visible: boolean;
	interactive: boolean;
	children: TElementId[];
	parent?: TElementId;
	component?: IComponent;
}

export interface IComponent {
	type: TComponentType;
	props: Record<string, unknown>;
	state: Map<TStateKey, TStateValue>;
}

/**
 * Interaction interfaces
 */
export interface IInteraction {
	type: "pan" | "zoom" | "rotate" | "tap" | "drag" | "pinch";
	enabled: boolean;
	handlers: IInteractionHandler[];
}

export interface IInteractionHandler {
	element: TElementId;
	handler: (event: IInteractionEvent) => void;
}

export interface IInteractionEvent {
	type: string;
	target: TElementId;
	position: ITensorPoint2D;
	delta?: ITensorVector2D;
	scale?: TScale;
	rotation?: TAngle;
	timestamp: number;
}

/**
 * Animation interfaces
 */
export interface IAnimation {
	id: string;
	target: TElementId;
	property: string;
	from: unknown;
	to: unknown;
	duration: TAnimationDuration;
	easing: TAnimationEasing;
	loop?: boolean;
	delay?: number;
}

export interface IAnimationController {
	play(animation: IAnimation): Promise<void>;
	pause(animationId: string): void;
	stop(animationId: string): void;
	seek(animationId: string, progress: number): void;
}

/**
 * State management interfaces
 */
export interface IStateManager {
	get<T>(key: TStateKey): T | undefined;
	set<T>(key: TStateKey, value: T): void;
	subscribe<T>(key: TStateKey, callback: (value: T) => void): () => void;
	unsubscribe(key: TStateKey): void;
}

/**
 * Event system interfaces
 */
export interface IEventEmitter {
	on(event: string, handler: (...args: unknown[]) => void): void;
	off(event: string, handler: (...args: unknown[]) => void): void;
	emit(event: string, ...args: unknown[]): void;
}

/**
 * Main tapspace interfaces
 */
export interface ITapspaceConfig {
	container: HTMLElement | string;
	width?: number;
	height?: number;
	backgroundColor?: string;
	enableGestures?: boolean;
	enableAnimations?: boolean;
	pixelRatio?: number;
}

export interface ITapspaceInstance {
	spaces: Map<TSpaceId, ISpace>;
	viewports: Map<TViewportId, IViewport>;
	animations: IAnimationController;
	state: IStateManager;
	events: IEventEmitter;

	createSpace(config: Partial<ISpace>): ISpace;
	createViewport(space: ISpace, container: HTMLElement): IViewport;
	destroy(): void;
}
