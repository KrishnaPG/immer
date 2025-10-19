import type {
	Branded,
	TAngleRad,
	TCoordinateX,
	TCoordinateY,
	TCoordinateZ,
	TDeltaMode,
	TDescription,
	TDistance,
	TDuration,
	THtmlElement,
	TKeyCode,
	TKeyName,
	TName,
	TProgress,
	TScaleFactor,
	TSubscriptionId,
	TTapCount,
	TTimestamp,
} from "./base-types";
import type { IComponent } from "./components";
import type { IPoint, ITransform, IVector } from "./geometry";

/**
 * Event types for the tapspace library
 */

// Event types
export type TEventType =
	| "tap"
	| "hold"
	| "drag"
	| "wheel"
	| "keydown"
	| "keyup"
	| "pointerdown"
	| "pointerup"
	| "pointermove"
	| "touchstart"
	| "touchend"
	| "touchmove"
	| "mousedown"
	| "mouseup"
	| "mousemove"
	| "gesturestart"
	| "gesturechange"
	| "gestureend";

// Event handler type
export type TEventHandler = (event: IEvent) => void;

// Base event interface
export interface IEvent {
	readonly type: TEventType;
	readonly target: IComponent;
	readonly point: IPoint;
	readonly vector?: IVector;
	readonly originalEvent: Event;
	readonly timestamp: TTimestamp;
}

// Interaction event interface
export interface IInteractionEvent extends IEvent {
	readonly interactionType: TInteractionType;
	readonly duration?: TDuration;
	readonly distance?: TDistance;
}

// Gesture event interface
export interface IGestureEvent extends IInteractionEvent {
	readonly gestureType: TGestureType;
	readonly scale?: TScaleFactor;
	readonly rotation?: TAngleRad;
	readonly velocity?: IVector;
}

// Tap event interface
export interface ITapEvent extends IEvent {
	readonly tapCount: TTapCount;
	readonly pointerType: TPointerType;
}

// Hold event interface
export interface IHoldEvent extends IInteractionEvent {
	readonly holdDuration: TDuration;
	readonly pointerType: TPointerType;
}

// Drag event interface
export interface IDragEvent extends IInteractionEvent {
	readonly startPoint: IPoint;
	readonly currentPoint: IPoint;
	readonly delta: IVector;
	readonly velocity: IVector;
	readonly pointerType: TPointerType;
}

// Wheel event interface
export interface IWheelEvent extends IEvent {
	readonly deltaX: TCoordinateX;
	readonly deltaY: TCoordinateY;
	readonly deltaZ?: TCoordinateZ;
	readonly deltaMode: TDeltaMode;
}

// Keyboard event interface
export interface IKeyboardEvent extends IEvent {
	readonly key: TKeyName;
	readonly code: TKeyCode;
	readonly altKey: boolean;
	readonly ctrlKey: boolean;
	readonly metaKey: boolean;
	readonly shiftKey: boolean;
	readonly repeat: boolean;
}

// Transform event interface
export interface ITransformEvent extends IEvent {
	readonly transform: ITransform;
	readonly oldTransform: ITransform;
}

// Animation event interface
export interface IAnimationEvent extends IEvent {
	readonly animationName: TName;
	readonly elapsedTime: TDuration;
	readonly progress: TProgress;
}

// Error event interface
export interface IErrorEvent extends IEvent {
	readonly error: Error;
	readonly errorType: TErrorType;
}

// Interaction types
export type TInteractionType =
	| "pointer"
	| "touch"
	| "mouse"
	| "keyboard"
	| "gesture";

// Gesture types
export type TGestureType =
	| "tap"
	| "doubletap"
	| "hold"
	| "drag"
	| "pinch"
	| "rotate"
	| "pan"
	| "swipe";

// Pointer types
export type TPointerType = "mouse" | "pen" | "touch" | "unknown";

// Error types
export type TErrorType =
	| "network"
	| "loading"
	| "rendering"
	| "interaction"
	| "validation"
	| "unknown";

// Event listener options
export interface IEventListenerOptions {
	readonly capture?: boolean;
	readonly passive?: boolean;
	readonly once?: boolean;
}

// Event emitter interface
export interface IEventEmitter {
	addEventListener(
		type: TEventType,
		listener: TEventHandler,
		options?: IEventListenerOptions,
	): void;
	removeEventListener(
		type: TEventType,
		listener: TEventHandler,
		options?: IEventListenerOptions,
	): void;
	dispatchEvent(event: IEvent): boolean;
	emit(type: TEventType, data?: Record<string, unknown>): void;
}

// Event target interface
export interface IEventTarget extends IEventEmitter {
	readonly element: THtmlElement;
}

// Interaction state interface
export interface IInteractionState {
	readonly isActive: boolean;
	readonly startPoint?: IPoint;
	readonly currentPoint?: IPoint;
	readonly startTime?: TTimestamp;
	readonly pointerType?: TPointerType;
	readonly pointerId?: TPointerId;
}

// Pointer ID type
export type TPointerId = Branded<number, "PointerId">;

// Event phase types
export type TEventPhase = "none" | "capturing" | "at-target" | "bubbling";

// Custom event interface
export interface ICustomEvent<T = unknown> extends IEvent {
	readonly detail: T;
}

// Event delegation interface
export interface IEventDelegation {
	readonly selector: string;
	readonly handler: TEventHandler;
	readonly options?: IEventListenerOptions;
}

// Event bus interface
export interface IEventBus extends IEventEmitter {
	subscribe(event: TEventType, handler: TEventHandler): TSubscription;
	unsubscribe(subscription: TSubscription): void;
	clear(): void;
}

// Subscription type alias
export type TSubscription = ISubscription;

// Subscription interface
export interface ISubscription {
  readonly id: TSubscriptionId;
  readonly event: TEventType;
  readonly handler: TEventHandler;
  readonly unsubscribe: () => void;
}
