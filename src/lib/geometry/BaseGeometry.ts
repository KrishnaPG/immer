/**
 * @fileoverview Base geometry class that bridges GeometryBase and IGeometry interface
 * Provides common functionality for all geometry objects in the tapspace library
 */

import { GeometryBase } from "../core/geometry/base";
import type {
	IBasis,
	IGeometry,
	IRawTensor,
	TArea,
	TDistance,
	TVolume,
} from "../types";
import type {
	IBox3D,
	IPoint2D,
	IPoint3D,
	IRectangle,
} from "../utils/math/geometry-utils";

/**
 * Base geometry class that extends GeometryBase and implements IGeometry interface
 * Provides common functionality for all geometric objects in the tapspace library
 */
export abstract class BaseGeometry extends GeometryBase implements IGeometry {
 	public readonly basis: IBasis;

 	constructor(
 		basis: IBasis,
 		props?: { id?: string; name?: string; metadata?: Record<string, unknown> },
 	) {
 		super(props);
 		this.basis = basis;
 	}

	/**
	 * Get the type name of this geometry object
	 */
	public abstract readonly type: string;

	/**
	 * Get the dimensionality of this geometry object (2 or 3)
	 */
	public abstract readonly dimensions: 2 | 3;

	/**
	 * Check if this geometry object is valid
	 */
	public abstract isValid(): boolean;

	/**
	 * Get the bounding box of this geometry object
	 */
	public abstract getBounds(): IRectangle | IBox3D;

	/**
	 * Get the center point of this geometry object
	 */
	public abstract getCenter(): IPoint2D | IPoint3D;

	/**
	 * Transform this geometry object using a transformation matrix
	 */
	public abstract transform(options: any): BaseGeometry;

	/**
	 * Clone this geometry object
	 */
	public abstract clone(options?: any): BaseGeometry;

	/**
	 * Serialize this geometry object to a plain object
	 */
	public abstract serialize(options?: any): Record<string, unknown>;

	/**
	 * Calculate the distance from this geometry to a point
	 */
	public abstract distanceTo(point: IPoint2D | IPoint3D): TDistance;

	/**
	 * Check if this geometry contains a point
	 */
	public abstract contains(point: IPoint2D | IPoint3D): boolean;

	/**
	 * Check if this geometry intersects with another geometry
	 */
	public abstract intersects(other: BaseGeometry): boolean;

	/**
	 * Get the area (2D) or volume (3D) of this geometry
	 */
	public abstract getMeasure(): TArea | TVolume;

	/**
	 * Change the basis of this geometry object
	 */
	public abstract changeBasis(newBasis: IBasis): IGeometry;

	/**
	 * Get the raw tensor representation
	 */
	public abstract getRaw(): IRawTensor;

	/**
	 * Create a new geometry from raw tensor data
	 */
	public abstract transitRaw(rawTensor: IRawTensor): IGeometry;

	/**
	 * Validate the current state of this geometry object
	 */
	protected validate(): void {
		if (!this.isValid()) {
			throw new Error(`Invalid ${this.type} geometry object`);
		}
	}

	/**
	 * Create a copy of this geometry with modified properties
	 */
	protected copyWith(
		updates: {
			id?: string;
			name?: string;
			metadata?: Record<string, unknown>;
		} = {},
	): this {
		return Object.assign(Object.create(Object.getPrototypeOf(this)), {
			...this,
			...updates,
		});
	}

	/**
	 * Generate a unique identifier for this geometry object
	 */
	protected generateId(): string {
		return `${this.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Check if two numbers are approximately equal within epsilon
	 */
	protected almostEqual(
		a: number,
		b: number,
		epsilon: number = 1e-10,
	): boolean {
		return Math.abs(a - b) < epsilon;
	}

	/**
	 * Check if two points are approximately equal within epsilon
	 */
	protected pointsAlmostEqual(
		a: IPoint2D | IPoint3D,
		b: IPoint2D | IPoint3D,
		epsilon: number = 1e-10,
	): boolean {
		const dx = Number(a.x) - Number(b.x);
		const dy = Number(a.y) - Number(b.y);
		const distance = Math.sqrt(dx * dx + dy * dy);

		if (this.dimensions === 3) {
			const dz = Number((a as IPoint3D).z) - Number((b as IPoint3D).z);
			const distance3D = Math.sqrt(distance * distance + dz * dz);
			return distance3D < epsilon;
		}

		return distance < epsilon;
	}

	/**
	 * Calculate the distance between two points
	 */
	protected pointDistance(
		a: IPoint2D | IPoint3D,
		b: IPoint2D | IPoint3D,
	): TDistance {
		const dx = Number(a.x) - Number(b.x);
		const dy = Number(a.y) - Number(b.y);
		let distance = Math.sqrt(dx * dx + dy * dy);

		if (this.dimensions === 3) {
			const dz = Number((a as IPoint3D).z) - Number((b as IPoint3D).z);
			distance = Math.sqrt(distance * distance + dz * dz);
		}

		return distance as TDistance;
	}

	/**
	 * Format a number for serialization with specified precision
	 */
	protected formatNumber(value: number, precision?: number): number {
		if (precision === undefined) {
			return value;
		}
		const factor = 10 ** precision;
		return Math.round(value * factor) / factor;
	}

	/**
	 * Create a metadata object with default values
	 */
	protected createMetadata(
		additionalMetadata?: Record<string, unknown>,
	): Record<string, unknown> {
		return {
			created: new Date().toISOString(),
			type: this.type,
			dimensions: this.dimensions,
			basis: this.basis,
			...this.metadata,
			...additionalMetadata,
		};
	}

	/**
	 * Update metadata while preserving existing values
	 */
	protected updateMetadata(
		updates: Record<string, unknown>,
	): Record<string, unknown> {
		return {
			...this.metadata,
			...updates,
			updated: new Date().toISOString(),
		};
	}

	/**
	 * Get a string representation of this geometry
	 */
	public toString(): string {
		const bounds = this.getBounds();
		const center = this.getCenter();

		if (this.dimensions === 2) {
			const rect = bounds as IRectangle;
			const point = center as IPoint2D;
			return `${this.type}(x=${point.x}, y=${point.y}, width=${rect.width}, height=${rect.height})`;
		} else {
			const box = bounds as IBox3D;
			const point = center as IPoint3D;
			return `${this.type}(x=${point.x}, y=${point.y}, z=${point.z}, width=${box.width}, height=${box.height}, depth=${box.depth})`;
		}
	}
}
