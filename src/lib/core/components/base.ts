/**
 * @fileoverview Abstract base class for all component classes with DOM integration
 * Provides shared functionality for UI components including DOM manipulation, event handling, and lifecycle management
 */

import type {
	TCoordinateX,
	TCoordinateY,
	TCoordinateZ,
	TDepth,
	TDistance,
	THeight,
	THtmlElement,
	TWidth,
} from "../../types/base-types";
import type {
	IBox3D,
	IPoint2D,
	IPoint3D,
	IRectangle,
} from "../../utils/math/geometry-utils";
import type { IMatrix2D, IMatrix3D } from "../../utils/math/matrix-ops";
import type { IVector } from "../../utils/math/vector-ops";
import {
	isBox3D,
	isPoint2D,
	isPoint3D,
	isRectangle,
	ValidationError,
} from "../../utils/validation/type-guards";
import { GeometryBase } from "../geometry/base";

/**
 * DOM element configuration
 */
export interface IDOMConfig {
	readonly tagName?: keyof HTMLElementTagNameMap;
	readonly className?: string;
	readonly id?: string;
	readonly attributes?: Record<string, string>;
	readonly styles?: Partial<CSSStyleDeclaration>;
	readonly content?: string;
	readonly children?: ComponentBase[];
}

/**
 * Component lifecycle hooks
 */
export interface IComponentLifecycle {
	readonly onMount?: () => void;
	readonly onUnmount?: () => void;
	readonly onUpdate?: (oldProps: Record<string, unknown>) => void;
	readonly onResize?: (bounds: IRectangle | IBox3D) => void;
	readonly onMove?: (position: IPoint2D | IPoint3D) => void;
}

/**
 * Event handler configuration
 */
export interface IEventHandlers {
	readonly [eventName: string]: EventListener;
}

/**
 * Component state interface
 */
export interface IComponentState {
	readonly isMounted: boolean;
	readonly isVisible: boolean;
	readonly isEnabled: boolean;
	readonly bounds: IRectangle | IBox3D;
	readonly position: IPoint2D | IPoint3D;
	readonly zIndex?: number;
}

/**
 * Component properties interface
 */
export interface IComponentProps {
	readonly position?: IPoint2D | IPoint3D;
	readonly size?: { width: TWidth; height: THeight; depth?: TDepth };
	readonly visible?: boolean;
	readonly enabled?: boolean;
	readonly className?: string;
	readonly styles?: Partial<CSSStyleDeclaration>;
	readonly events?: IEventHandlers;
	readonly lifecycle?: IComponentLifecycle;
	readonly dom?: IDOMConfig;
	readonly geometry?: GeometryBase;
}

/**
 * Abstract base class for all UI components with DOM integration
 */
export abstract class ComponentBase extends GeometryBase {
	protected element: HTMLElement | null = null;
	protected state: IComponentState;
	protected props: IComponentProps;
	protected eventListeners: Map<string, EventListener> = new Map();

	constructor(props: IComponentProps = {}) {
		super({
			id: props.geometry?.id,
			name: props.geometry?.name,
			metadata: props.geometry?.metadata,
		});

		this.props = props;

		// Initialize state with defaults
		this.state = {
			isMounted: false,
			isVisible: props.visible ?? true,
			isEnabled: props.enabled ?? true,
			bounds: this.calculateBounds(),
			position: props.position ?? this.getDefaultPosition(),
			zIndex: 0,
		};
	}

	/**
	 * Get the component type name
	 */
	public abstract readonly componentType: string;

	/**
	 * Get the DOM element tag name for this component
	 */
	protected abstract readonly defaultTagName: keyof HTMLElementTagNameMap;

	/**
	 * Get the default position for this component
	 */
	protected abstract getDefaultPosition(): IPoint2D | IPoint3D;

	/**
	 * Calculate the bounds for this component
	 */
	protected abstract calculateBounds(): IRectangle | IBox3D;

	/**
	 * Render the component content
	 */
	protected abstract render(): void;

	/**
	 * Update the component when properties change
	 */
	protected abstract update(): void;

	/**
	 * Get the dimensionality of this component (2 or 3)
	 */
	public get dimensions(): 2 | 3 {
		return this.props.geometry?.dimensions ?? 2;
	}

	/**
	 * Get the component type
	 */
	public get type(): string {
		return this.componentType;
	}

	/**
	 * Check if the component is valid
	 */
	public isValid(): boolean {
		return this.element !== null && this.element.isConnected;
	}

	/**
	 * Get the DOM element for this component
	 */
	public getElement(): HTMLElement | null {
		return this.element;
	}

	/**
	 * Get the current component state
	 */
	public getState(): IComponentState {
		return { ...this.state };
	}

	/**
	 * Get the current component properties
	 */
	public getProps(): IComponentProps {
		return { ...this.props };
	}

	/**
	 * Get the component bounds
	 */
	public getBounds(): IRectangle | IBox3D {
		return this.state.bounds;
	}

	/**
	 * Get the component center point
	 */
	public getCenter(): IPoint2D | IPoint3D {
		return this.state.position;
	}

	/**
	 * Set the component position
	 * @param position - New position
	 */
	public setPosition(position: IPoint2D | IPoint3D): void {
		if (!this.isValidPoint(position)) {
			throw new ValidationError(
				"Invalid position for component",
				position,
				"IPoint2D | IPoint3D",
			);
		}

		const oldPosition = this.state.position;
		this.state = { ...this.state, position };

		if (this.element) {
			this.updateElementPosition();
		}

		// Trigger lifecycle hook
		this.props.lifecycle?.onMove?.(position);

		// Trigger update
		this.onPositionChange(oldPosition, position);
	}

	/**
	 * Set the component size
	 * @param size - New size
	 */
	public setSize(size: {
		width: TWidth;
		height: THeight;
		depth?: TDepth;
	}): void {
		const oldBounds = this.state.bounds;
		this.state = {
			...this.state,
			bounds: this.calculateBoundsWithSize(size),
		};

		if (this.element) {
			this.updateElementSize();
		}

		// Trigger lifecycle hook
		this.props.lifecycle?.onResize?.(this.state.bounds);

		// Trigger update
		this.onSizeChange(oldBounds, this.state.bounds);
	}

	/**
	 * Set the component visibility
	 * @param visible - Whether the component should be visible
	 */
	public setVisible(visible: boolean): void {
		const oldVisible = this.state.isVisible;
		this.state = { ...this.state, isVisible: visible };

		if (this.element) {
			this.element.style.display = visible ? "" : "none";
		}

		this.onVisibilityChange(oldVisible, visible);
	}

	/**
	 * Set the component enabled state
	 * @param enabled - Whether the component should be enabled
	 */
	public setEnabled(enabled: boolean): void {
		const oldEnabled = this.state.isEnabled;
		this.state = { ...this.state, isEnabled: enabled };

		if (this.element) {
			this.element.style.pointerEvents = enabled ? "" : "none";
			this.element.style.opacity = enabled ? "" : "0.5";
		}

		this.onEnabledChange(oldEnabled, enabled);
	}

	/**
	 * Set the component z-index
	 * @param zIndex - New z-index value
	 */
	public setZIndex(zIndex: number): void {
		this.state = { ...this.state, zIndex };

		if (this.element) {
			this.element.style.zIndex = zIndex.toString();
		}
	}

	/**
	 * Mount the component to a parent element
	 * @param parent - Parent element to mount to
	 * @param before - Optional element to insert before
	 */
	public mount(parent: HTMLElement, before?: Element): void {
		if (this.state.isMounted) {
			throw new Error("Component is already mounted");
		}

		this.createElement();
		this.render();

		if (before) {
			parent.insertBefore(this.element!, before);
		} else {
			parent.appendChild(this.element!);
		}

		this.state = { ...this.state, isMounted: true };

		// Set up event listeners
		this.setupEventListeners();

		// Trigger lifecycle hook
		this.props.lifecycle?.onMount?.();
	}

	/**
	 * Unmount the component from its parent
	 */
	public unmount(): void {
		if (!this.state.isMounted || !this.element) {
			return;
		}

		// Clean up event listeners
		this.cleanupEventListeners();

		// Remove from DOM
		this.element.remove();
		this.element = null;

		this.state = { ...this.state, isMounted: false };

		// Trigger lifecycle hook
		this.props.lifecycle?.onUnmount?.();
	}

	/**
	 * Update the component with new properties
	 * @param newProps - New properties to apply
	 */
	public updateProps(newProps: Partial<IComponentProps>): void {
		const oldProps = { ...this.props };
		this.props = { ...this.props, ...newProps };

		// Update geometry if provided
		if (newProps.geometry) {
			// Update base class properties
			Object.assign(this, {
				id: newProps.geometry.id,
				name: newProps.geometry.name,
				metadata: newProps.geometry.metadata,
			});
		}

		this.update();

		// Trigger lifecycle hook
		this.props.lifecycle?.onUpdate?.(oldProps);
	}

	/**
	 * Transform the component using a transformation matrix
	 * @param options - Transformation options
	 */
	public transform(options: {
		transform: IMatrix2D | IMatrix3D;
		preserveOrientation?: boolean;
		validateResult?: boolean;
	}): ComponentBase {
		// Transform the underlying geometry if present
		if (this.props.geometry) {
			const transformedGeometry = this.props.geometry.transform(options);

			// Update component with transformed geometry
			this.updateProps({ geometry: transformedGeometry });
		}

		// Apply transformation to DOM element if mounted
		if (this.element && this.state.isMounted) {
			this.applyTransformToElement(options.transform);
		}

		return this;
	}

	/**
	 * Clone this component
	 * @param options - Cloning options
	 */
	public clone(options?: {
		deep?: boolean;
		includeMetadata?: boolean;
		transform?: IMatrix2D | IMatrix3D;
	}): ComponentBase {
		const clonedProps: IComponentProps = { ...this.props };

		// Clone geometry if present
		if (this.props.geometry && options?.deep !== false) {
			clonedProps.geometry = this.props.geometry.clone(options);
		}

		// Clone DOM configuration
		if (this.props.dom && options?.deep !== false) {
			clonedProps.dom = {
				...this.props.dom,
				attributes: this.props.dom.attributes
					? { ...this.props.dom.attributes }
					: undefined,
				styles: this.props.dom.styles
					? { ...this.props.dom.styles }
					: undefined,
			};
		}

		// Clone lifecycle hooks
		if (this.props.lifecycle && options?.deep !== false) {
			clonedProps.lifecycle = { ...this.props.lifecycle };
		}

		// Clone event handlers
		if (this.props.events && options?.deep !== false) {
			clonedProps.events = { ...this.props.events };
		}

		const cloned = new (
			this.constructor as new (
				props: IComponentProps,
			) => ComponentBase
		)(clonedProps);

		// Apply transformation if specified
		if (options?.transform) {
			cloned.transform({ transform: options.transform });
		}

		return cloned;
	}

	/**
	 * Serialize this component to a plain object
	 * @param options - Serialization options
	 */
	public serialize(options?: {
		includeMetadata?: boolean;
		includeId?: boolean;
		precision?: number;
		format?: "json" | "object";
	}): Record<string, unknown> {
		const data: Record<string, unknown> = {
			type: this.componentType,
			dimensions: this.dimensions,
			state: {
				isVisible: this.state.isVisible,
				isEnabled: this.state.isEnabled,
				position: this.serializePoint(this.state.position, options?.precision),
				bounds: this.serializeBounds(this.state.bounds, options?.precision),
				zIndex: this.state.zIndex,
			},
			props: {
				className: this.props.className,
				styles: this.props.styles,
			},
		};

		if (options?.includeId !== false) {
			data.id = this.id;
		}

		if (options?.includeMetadata !== false) {
			data.metadata = this.metadata;
		}

		// Serialize geometry if present
		if (this.props.geometry) {
			data.geometry = this.props.geometry.serialize(options);
		}

		// Serialize DOM configuration
		if (this.props.dom) {
			data.dom = {
				tagName: this.props.dom.tagName,
				className: this.props.dom.className,
				id: this.props.dom.id,
				attributes: this.props.dom.attributes,
				styles: this.props.dom.styles,
			};
		}

		return data;
	}

	/**
	 * Calculate distance from component to a point
	 * @param point - Target point
	 */
	public distanceTo(point: IPoint2D | IPoint3D): TDistance {
		if (this.props.geometry) {
			return this.props.geometry.distanceTo(point);
		}

		// Fallback to distance from center point
		return this.pointDistance(this.state.position, point);
	}

	/**
	 * Check if component contains a point
	 * @param point - Point to test
	 */
	public contains(point: IPoint2D | IPoint3D): boolean {
		if (this.props.geometry) {
			return this.props.geometry.contains(point);
		}

		// Fallback to bounds check
		return this.pointInBounds(point, this.state.bounds);
	}

	/**
	 * Check if component intersects with another component
	 * @param other - Other component to test
	 */
	public intersects(other: ComponentBase): boolean {
		if (this.props.geometry && other.props.geometry) {
			return this.props.geometry.intersects(other.props.geometry);
		}

		// Fallback to bounds intersection
		return this.boundsIntersect(this.state.bounds, other.state.bounds);
	}

	/**
	 * Get the area (2D) or volume (3D) of this component
	 */
	public getMeasure(): any {
		if (this.props.geometry) {
			return this.props.geometry.getMeasure();
		}

		// Fallback to bounds measure
		return this.calculateBoundsMeasure(this.state.bounds);
	}

	/**
	 * Create the DOM element for this component
	 */
	protected createElement(): void {
		const config = this.props.dom || {};
		const tagName = config.tagName || this.defaultTagName;

		this.element = document.createElement(tagName);

		// Set attributes
		if (config.id) {
			this.element.id = config.id;
		}

		if (config.className) {
			this.element.className = config.className;
		}

		if (config.attributes) {
			for (const [key, value] of Object.entries(config.attributes)) {
				this.element.setAttribute(key, value);
			}
		}

		// Set styles
		if (config.styles) {
			Object.assign(this.element.style, config.styles);
		}

		// Set content
		if (config.content) {
			this.element.innerHTML = config.content;
		}

		// Set initial position and size
		this.updateElementPosition();
		this.updateElementSize();
	}

	/**
	 * Update the element position in the DOM
	 */
	protected updateElementPosition(): void {
		if (!this.element) return;

		if (this.dimensions === 2) {
			const pos = this.state.position as IPoint2D;
			this.element.style.position = "absolute";
			this.element.style.left = `${Number(pos.x)}px`;
			this.element.style.top = `${Number(pos.y)}px`;
		} else {
			const pos = this.state.position as IPoint3D;
			this.element.style.position = "absolute";
			this.element.style.left = `${Number(pos.x)}px`;
			this.element.style.top = `${Number(pos.y)}px`;
			// Note: CSS doesn't support 3D positioning natively
			// This would need CSS 3D transforms for true 3D positioning
		}
	}

	/**
	 * Update the element size in the DOM
	 */
	protected updateElementSize(): void {
		if (!this.element) return;

		if (this.dimensions === 2) {
			const bounds = this.state.bounds as IRectangle;
			this.element.style.width = `${Number(bounds.width)}px`;
			this.element.style.height = `${Number(bounds.height)}px`;
		} else {
			const bounds = this.state.bounds as IBox3D;
			this.element.style.width = `${Number(bounds.width)}px`;
			this.element.style.height = `${Number(bounds.height)}px`;
			// Note: CSS doesn't support depth natively
		}
	}

	/**
	 * Apply a transformation matrix to the DOM element
	 * @param transform - Transformation matrix
	 */
	protected applyTransformToElement(transform: IMatrix2D | IMatrix3D): void {
		if (!this.element) return;

		if (this.dimensions === 2) {
			const matrix = transform as IMatrix2D;
			const cssTransform = `matrix(${Number(matrix.a)}, ${Number(matrix.b)}, ${Number(matrix.c)}, ${Number(matrix.d)}, ${Number(matrix.e)}, ${Number(matrix.f)})`;
			this.element.style.transform = cssTransform;
		} else {
			// For 3D transforms, we'd need to decompose the matrix
			// This is a simplified version
			this.element.style.transform = "translate3d(0, 0, 0)";
		}
	}

	/**
	 * Set up event listeners for the component
	 */
	protected setupEventListeners(): void {
		if (!this.element || !this.props.events) return;

		for (const [eventName, handler] of Object.entries(this.props.events)) {
			this.element.addEventListener(eventName, handler);
			this.eventListeners.set(eventName, handler);
		}
	}

	/**
	 * Clean up event listeners for the component
	 */
	protected cleanupEventListeners(): void {
		if (!this.element) return;

		for (const [eventName, handler] of this.eventListeners) {
			this.element.removeEventListener(eventName, handler);
		}

		this.eventListeners.clear();
	}

	/**
	 * Calculate bounds with a specific size
	 * @param size - Target size
	 */
	protected calculateBoundsWithSize(size: {
		width: TWidth;
		height: THeight;
		depth?: TDepth;
	}): IRectangle | IBox3D {
		if (this.dimensions === 2) {
			return {
				x: this.state.position.x,
				y: this.state.position.y,
				width: size.width,
				height: size.height,
			};
		} else {
			return {
				x: this.state.position.x,
				y: this.state.position.y,
				z: (this.state.position as IPoint3D).z,
				width: size.width,
				height: size.height,
				depth: size.depth ?? (0 as TDepth),
			};
		}
	}

	/**
	 * Validate that a point is compatible with this component's dimensions
	 * @param point - Point to validate
	 */
	protected isValidPoint(point: IPoint2D | IPoint3D): boolean {
		if (this.dimensions === 2) {
			return isPoint2D(point);
		} else {
			return isPoint3D(point);
		}
	}

	/**
	 * Check if a point is within bounds
	 * @param point - Point to test
	 * @param bounds - Bounds to test against
	 */
	protected pointInBounds(
		point: IPoint2D | IPoint3D,
		bounds: IRectangle | IBox3D,
	): boolean {
		if (this.dimensions === 2) {
			const rect = bounds as IRectangle;
			return (
				Number(point.x) >= Number(rect.x) &&
				Number(point.x) <= Number(rect.x) + Number(rect.width) &&
				Number(point.y) >= Number(rect.y) &&
				Number(point.y) <= Number(rect.y) + Number(rect.height)
			);
		} else {
			const box = bounds as IBox3D;
			return (
				Number(point.x) >= Number(box.x) &&
				Number(point.x) <= Number(box.x) + Number(box.width) &&
				Number(point.y) >= Number(box.y) &&
				Number(point.y) <= Number(box.y) + Number(box.height) &&
				Number((point as IPoint3D).z) >= Number(box.z) &&
				Number((point as IPoint3D).z) <= Number(box.z) + Number(box.depth)
			);
		}
	}

	/**
	 * Check if two bounds intersect
	 * @param a - First bounds
	 * @param b - Second bounds
	 */
	protected boundsIntersect(
		a: IRectangle | IBox3D,
		b: IRectangle | IBox3D,
	): boolean {
		if (this.dimensions === 2) {
			const rectA = a as IRectangle;
			const rectB = b as IRectangle;
			return !(
				Number(rectA.x) + Number(rectA.width) <= Number(rectB.x) ||
				Number(rectB.x) + Number(rectB.width) <= Number(rectA.x) ||
				Number(rectA.y) + Number(rectA.height) <= Number(rectB.y) ||
				Number(rectB.y) + Number(rectB.height) <= Number(rectA.y)
			);
		} else {
			const boxA = a as IBox3D;
			const boxB = b as IBox3D;
			return !(
				Number(boxA.x) + Number(boxA.width) <= Number(boxB.x) ||
				Number(boxB.x) + Number(boxB.width) <= Number(boxA.x) ||
				Number(boxA.y) + Number(boxA.height) <= Number(boxB.y) ||
				Number(boxB.y) + Number(boxB.height) <= Number(boxA.y) ||
				Number(boxA.z) + Number(boxA.depth) <= Number(boxB.z) ||
				Number(boxB.z) + Number(boxB.depth) <= Number(boxA.z)
			);
		}
	}

	/**
	 * Calculate the measure of bounds
	 * @param bounds - Bounds to measure
	 */
	protected calculateBoundsMeasure(bounds: IRectangle | IBox3D): any {
		if (this.dimensions === 2) {
			const rect = bounds as IRectangle;
			return (Number(rect.width) * Number(rect.height)) as any;
		} else {
			const box = bounds as IBox3D;
			return (Number(box.width) *
				Number(box.height) *
				Number(box.depth)) as any;
		}
	}

	/**
	 * Serialize a point for output
	 * @param point - Point to serialize
	 * @param precision - Number precision
	 */
	protected serializePoint(
		point: IPoint2D | IPoint3D,
		precision?: number,
	): Record<string, number> {
		const result: Record<string, number> = {
			x: this.formatNumber(Number(point.x), precision),
			y: this.formatNumber(Number(point.y), precision),
		};

		if (this.dimensions === 3) {
			result.z = this.formatNumber(Number((point as IPoint3D).z), precision);
		}

		return result;
	}

	/**
	 * Serialize bounds for output
	 * @param bounds - Bounds to serialize
	 * @param precision - Number precision
	 */
	protected serializeBounds(
		bounds: IRectangle | IBox3D,
		precision?: number,
	): Record<string, number> {
		if (this.dimensions === 2) {
			const rect = bounds as IRectangle;
			return {
				x: this.formatNumber(Number(rect.x), precision),
				y: this.formatNumber(Number(rect.y), precision),
				width: this.formatNumber(Number(rect.width), precision),
				height: this.formatNumber(Number(rect.height), precision),
			};
		} else {
			const box = bounds as IBox3D;
			return {
				x: this.formatNumber(Number(box.x), precision),
				y: this.formatNumber(Number(box.y), precision),
				z: this.formatNumber(Number(box.z), precision),
				width: this.formatNumber(Number(box.width), precision),
				height: this.formatNumber(Number(box.height), precision),
				depth: this.formatNumber(Number(box.depth), precision),
			};
		}
	}

	/**
	 * Lifecycle hook called when position changes
	 * @param oldPosition - Previous position
	 * @param newPosition - New position
	 */
	protected onPositionChange(
		oldPosition: IPoint2D | IPoint3D,
		newPosition: IPoint2D | IPoint3D,
	): void {
		// Override in subclasses for custom behavior
	}

	/**
	 * Lifecycle hook called when size changes
	 * @param oldBounds - Previous bounds
	 * @param newBounds - New bounds
	 */
	protected onSizeChange(
		oldBounds: IRectangle | IBox3D,
		newBounds: IRectangle | IBox3D,
	): void {
		// Override in subclasses for custom behavior
	}

	/**
	 * Lifecycle hook called when visibility changes
	 * @param oldVisible - Previous visibility state
	 * @param newVisible - New visibility state
	 */
	protected onVisibilityChange(oldVisible: boolean, newVisible: boolean): void {
		// Override in subclasses for custom behavior
	}

	/**
	 * Lifecycle hook called when enabled state changes
	 * @param oldEnabled - Previous enabled state
	 * @param newEnabled - New enabled state
	 */
	protected onEnabledChange(oldEnabled: boolean, newEnabled: boolean): void {
		// Override in subclasses for custom behavior
	}
}
