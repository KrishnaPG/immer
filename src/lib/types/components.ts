import type { TDescription, THtmlElement, TName } from "./base-types";
import type { IEvent, TEventHandler, TEventType, TGestureType } from "./events";
import type { IBox, IPoint, ISize, ITransform, IVector } from "./geometry";

/**
 * Component types for the tapspace library
 */

// Base component interface
export interface IComponent {
	readonly element: THtmlElement;
	readonly isComponent: true;

	// Core methods
	getPosition(): IPoint;
	setPosition(point: IPoint): IComponent;
	getSize(): ISize;
	setSize(size: ISize): IComponent;
	getTransform(): ITransform;
	setTransform(transform: ITransform): IComponent;

	// Hierarchy methods
	getParent(): IComponent | null;
	setParent(parent: IComponent | null): IComponent;
	getChildren(): readonly IComponent[];

	// Event handling
	on(event: TEventType, handler: TEventHandler): IComponent;
	off(event: TEventType, handler: TEventHandler): IComponent;
}

// Viewport component interface
export interface IViewport extends IComponent {
	readonly isViewport: true;

	// Viewport-specific methods
	getSpace(): ISpace;
	setSpace(space: ISpace): IViewport;
	getZoom(): number;
	setZoom(zoom: number): IViewport;
	getCamera(): IPoint;
	setCamera(point: IPoint): IViewport;

	// Navigation methods
	panBy(vector: IVector): IViewport;
	zoomTo(point: IPoint, zoom: number): IViewport;
	fitBox(box: IBox): IViewport;
}

// Space component interface
export interface ISpace extends IComponent {
	readonly isSpace: true;

	// Space-specific methods
	getViewport(): IViewport | null;
	addChild(component: IComponent): ISpace;
	removeChild(component: IComponent): ISpace;
	getBoundingBox(): IBox;

	// Layout methods
	appendTo(element: THtmlElement): ISpace;
	remove(): ISpace;
}

// Item component interface
export interface IItem extends IComponent {
	readonly isItem: true;

	// Item-specific methods
	getContentElement(): THtmlElement;
	setContentElement(element: THtmlElement): IItem;
}

// Node component interface
export interface INode extends IItem {
	readonly isNode: true;

	// Node-specific methods
	getImage(): string | null;
	setImage(imageUrl: string): INode;
	getImageElement(): THtmlElement | null;
}

// Edge component interface
export interface IEdge extends IComponent {
	readonly isEdge: true;

	// Edge-specific methods
	getStartNode(): INode;
	getEndNode(): INode;
	setStartNode(node: INode): IEdge;
	setEndNode(node: INode): IEdge;
}

// Arc component interface
export interface IArc extends IComponent {
	readonly isArc: true;

	// Arc-specific methods
	getRadius(): number;
	setRadius(radius: number): IArc;
	getAngle(): number;
	setAngle(angle: number): IArc;
}

// Frame component interface
export interface IFrame extends IComponent {
	readonly isFrame: true;

	// Frame-specific methods
	getAnchor(): IPoint;
	setAnchor(point: IPoint): IFrame;
}

// Control component interface
export interface IControl extends IComponent {
	readonly isControl: true;

	// Control-specific methods
	getControlElement(): THtmlElement;
}

// Custom control component interface
export interface ICustomControl extends IControl {
	readonly isCustomControl: true;

	// Custom control-specific methods
	setContent(content: THtmlElement): ICustomControl;
}

// Interaction options
export interface IInteractionOptions {
	readonly preventDefault?: boolean;
	readonly stopPropagation?: boolean;
	readonly passive?: boolean;
}


// Loader options
export interface ILoaderOptions {
	readonly baseUrl?: string;
	readonly crossOrigin?: string;
	readonly timeout?: number;
}

// Image loader interface
export interface IImageLoader {
	loadImage(url: string, options?: ILoaderOptions): Promise<HTMLImageElement>;
	loadImages(
		urls: string[],
		options?: ILoaderOptions,
	): Promise<HTMLImageElement[]>;
}

// Tree loader interface
export interface ITreeLoader {
	loadTree(data: TTreeData, options?: ILoaderOptions): Promise<ISpace>;
}

// Tree data type
export type TTreeData = {
	readonly name: TName;
	readonly description?: TDescription;
	readonly children?: readonly TTreeData[];
	readonly image?: string;
	readonly position?: IPoint;
	readonly size?: ISize;
};
