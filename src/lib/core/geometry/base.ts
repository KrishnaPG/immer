/**
 * @fileoverview Abstract base class for all geometry classes with common methods
 * Provides shared functionality for geometric objects including validation, transformation, and serialization
 */

import type {
	TAngleRad,
	TArea,
	TCoordinateX,
	TCoordinateY,
	TCoordinateZ,
	TDistance,
	TProgress,
	TScaleFactor,
	TVolume,
} from "../../types/base-types";
import type {
	IBox3D,
	IPoint2D,
	IPoint3D,
	IRectangle,
} from "../../utils/math/geometry-utils";
import type { IMatrix2D, IMatrix3D } from "../../utils/math/matrix-ops";
import {
	isIdentity2D,
	isIdentity3D,
	transformVector2D,
	transformVector3D,
} from "../../utils/math/matrix-ops";
import type { IVector } from "../../utils/math/vector-ops";

import {
	isBox3D,
	isPoint2D,
	isPoint3D,
	isRectangle,
	isVector2D,
	isVector3D,
	ValidationError,
	validateType,
} from "../../utils/validation/type-guards";

/**
 * Common properties for all geometric objects
 */
export interface IGeometryBase {
	readonly id?: string;
	readonly name?: string;
	readonly metadata?: Record<string, unknown>;
}

/**
 * Transformation options for geometric objects
 */
export interface ITransformationOptions {
	readonly transform: IMatrix2D | IMatrix3D;
	readonly preserveOrientation?: boolean;
	readonly validateResult?: boolean;
}

/**
 * Cloning options for geometric objects
 */
export interface ICloneOptions {
	readonly deep?: boolean;
	readonly includeMetadata?: boolean;
	readonly transform?: IMatrix2D | IMatrix3D;
}

/**
 * Serialization options for geometric objects
 */
export interface ISerializationOptions {
	readonly includeMetadata?: boolean;
	readonly includeId?: boolean;
	readonly precision?: number;
	readonly format?: "json" | "object";
}

/**
 * Abstract base class for all geometric objects
 */
export abstract class GeometryBase implements IGeometryBase {
	public readonly id?: string;
	public readonly name?: string;
	public readonly metadata?: Record<string, unknown>;

	constructor(props: IGeometryBase = {}) {
		this.id = props.id;
		this.name = props.name;
		this.metadata = props.metadata;
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
	 * @param options - Transformation options
	 * @returns New transformed geometry object
	 */
	public abstract transform(options: ITransformationOptions): GeometryBase;

	/**
	 * Clone this geometry object
	 * @param options - Cloning options
	 * @returns New cloned geometry object
	 */
	public abstract clone(options?: ICloneOptions): GeometryBase;

	/**
	 * Serialize this geometry object to a plain object
	 * @param options - Serialization options
	 * @returns Serialized representation
	 */
	public abstract serialize(
		options?: ISerializationOptions,
	): Record<string, unknown>;

	/**
	 * Calculate the distance from this geometry to a point
	 * @param point - Target point
	 * @returns Distance to the point
	 */
	public abstract distanceTo(point: IPoint2D | IPoint3D): TDistance;

	/**
	 * Check if this geometry contains a point
	 * @param point - Point to test
	 * @returns True if the point is contained within this geometry
	 */
	public abstract contains(point: IPoint2D | IPoint3D): boolean;

	/**
	 * Check if this geometry intersects with another geometry
	 * @param other - Other geometry to test
	 * @returns True if the geometries intersect
	 */
	public abstract intersects(other: GeometryBase): boolean;

	/**
	 * Get the area (2D) or volume (3D) of this geometry
	 * @returns Area or volume measurement
	 */
	public abstract getMeasure(): TArea | TVolume;

	/**
	 * Validate the current state of this geometry object
	 * @throws ValidationError if the object is in an invalid state
	 */
	protected validate(): void {
		if (!this.isValid()) {
			throw new ValidationError(
				`Invalid ${this.type} geometry object`,
				this,
				this.type,
			);
		}
	}

	/**
	 * Apply a transformation matrix to a point
	 * @param point - Point to transform
	 * @param transform - Transformation matrix
	 * @returns Transformed point
	 */
	protected applyTransformToPoint(
		point: IPoint2D | IPoint3D,
		transform: IMatrix2D | IMatrix3D,
	): IPoint2D | IPoint3D {
		if (this.dimensions === 2) {
			if (!isPoint2D(point)) {
				throw new ValidationError(
					"Expected 2D point for 2D geometry transformation",
					point,
					"IPoint2D",
				);
			}
			if ("x" in transform && "y" in transform && "z" in transform) {
				throw new ValidationError(
					"Cannot use 3D transform matrix for 2D geometry",
					transform,
					"IMatrix2D",
				);
			}
			return transformVector2D(point, transform as IMatrix2D);
		} else {
			if (!isPoint3D(point)) {
				throw new ValidationError(
					"Expected 3D point for 3D geometry transformation",
					point,
					"IPoint3D",
				);
			}
			return transformVector3D(point, transform as IMatrix3D);
		}
	}

	/**
	 * Validate that a transformation matrix is compatible with this geometry
	 * @param transform - Transformation matrix to validate
	 * @throws ValidationError if the matrix is incompatible
	 */
	protected validateTransform(transform: IMatrix2D | IMatrix3D): void {
		if (this.dimensions === 2) {
			if ("x" in transform && "y" in transform && "z" in transform) {
				throw new ValidationError(
					"Cannot use 3D transform matrix for 2D geometry",
					transform,
					"IMatrix2D",
				);
			}
		} else {
			if (!("x" in transform && "y" in transform && "z" in transform)) {
				throw new ValidationError(
					"3D geometry requires 3D transform matrix",
					transform,
					"IMatrix3D",
				);
			}
		}
	}

	/**
	 * Check if a transformation matrix is an identity transformation
	 * @param transform - Transformation matrix to check
	 * @returns True if the matrix is an identity transformation
	 */
	protected isIdentityTransform(transform: IMatrix2D | IMatrix3D): boolean {
		if (this.dimensions === 2) {
			return isIdentity2D(transform as IMatrix2D);
		} else {
			return isIdentity3D(transform as IMatrix3D);
		}
	}

	/**
	 * Create a copy of this geometry with modified properties
	 * @param updates - Properties to update
	 * @returns New geometry object with updated properties
	 */
	protected copyWith(updates: Partial<IGeometryBase> = {}): this {
		return Object.assign(Object.create(Object.getPrototypeOf(this)), {
			...this,
			...updates,
		});
	}

	/**
	 * Generate a unique identifier for this geometry object
	 * @returns Unique string identifier
	 */
	protected generateId(): string {
		return `${this.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Round a number to a specified precision
	 * @param value - Number to round
	 * @param precision - Number of decimal places
	 * @returns Rounded number
	 */
	protected roundToPrecision(value: number, precision: number = 10): number {
		const factor = 10 ** precision;
		return Math.round(value * factor) / factor;
	}

	/**
	 * Clamp a value between min and max
	 * @param value - Value to clamp
	 * @param min - Minimum value
	 * @param max - Maximum value
	 * @returns Clamped value
	 */
	protected clamp(value: number, min: number, max: number): number {
		return Math.min(Math.max(value, min), max);
	}

	/**
	 * Linear interpolation between two values
	 * @param a - Start value
	 * @param b - End value
	 * @param t - Interpolation factor (0 to 1)
	 * @returns Interpolated value
	 */
	protected lerp(a: number, b: number, t: TProgress): number {
		const clampedT = this.clamp(t, 0, 1) as TProgress;
		return a + (b - a) * clampedT;
	}

	/**
	 * Linear interpolation between two points
	 * @param a - Start point
	 * @param b - End point
	 * @param t - Interpolation factor (0 to 1)
	 * @returns Interpolated point
	 */
	protected lerpPoint(
		a: IPoint2D | IPoint3D,
		b: IPoint2D | IPoint3D,
		t: TProgress,
	): IPoint2D | IPoint3D {
		const clampedT = this.clamp(Number(t), 0, 1) as TProgress;

		if (this.dimensions === 2) {
			return {
				x: this.lerp(Number(a.x), Number(b.x), clampedT) as TCoordinateX,
				y: this.lerp(Number(a.y), Number(b.y), clampedT) as TCoordinateY,
			};
		} else {
			return {
				x: this.lerp(Number(a.x), Number(b.x), clampedT) as TCoordinateX,
				y: this.lerp(Number(a.y), Number(b.y), clampedT) as TCoordinateY,
				z: this.lerp(
					Number((a as IPoint3D).z),
					Number((b as IPoint3D).z),
					clampedT,
				) as TCoordinateZ,
			};
		}
	}

	/**
	 * Check if two numbers are approximately equal within epsilon
	 * @param a - First number
	 * @param b - Second number
	 * @param epsilon - Tolerance (default: 1e-10)
	 * @returns True if numbers are approximately equal
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
	 * @param a - First point
	 * @param b - Second point
	 * @param epsilon - Tolerance (default: 1e-10)
	 * @returns True if points are approximately equal
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
	 * @param a - First point
	 * @param b - Second point
	 * @returns Distance between points
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
	 * @param value - Number to format
	 * @param precision - Number of decimal places
	 * @returns Formatted number
	 */
	protected formatNumber(value: number, precision?: number): number {
		if (precision === undefined) {
			return value;
		}
		return this.roundToPrecision(value, precision);
	}

	/**
	 * Deep clone an object for cloning operations
	 * @param obj - Object to clone
	 * @returns Deep cloned object
	 */
	protected deepClone<T>(obj: T): T {
		if (obj === null || typeof obj !== "object") {
			return obj;
		}

		if (obj instanceof Date) {
			return new Date(obj.getTime()) as unknown as T;
		}

		if (Array.isArray(obj)) {
			return obj.map((item) => this.deepClone(item)) as unknown as T;
		}

		const cloned = {} as T;
		for (const key in obj) {
			if (Object.hasOwn(obj, key)) {
				(cloned as any)[key] = this.deepClone((obj as any)[key]);
			}
		}

		return cloned;
	}

	/**
	 * Create a metadata object with default values
	 * @param additionalMetadata - Additional metadata to include
	 * @returns Complete metadata object
	 */
	protected createMetadata(
		additionalMetadata?: Record<string, unknown>,
	): Record<string, unknown> {
		return {
			created: new Date().toISOString(),
			type: this.type,
			dimensions: this.dimensions,
			...this.metadata,
			...additionalMetadata,
		};
	}

	/**
	 * Update metadata while preserving existing values
	 * @param updates - Metadata updates
	 * @returns Updated metadata object
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
	 * Check if this geometry equals another geometry
	 * @param other - Other geometry to compare
	 * @param epsilon - Tolerance for comparison (default: 1e-10)
	 * @returns True if geometries are equal
	 */
	public equals(other: GeometryBase, epsilon: number = 1e-10): boolean {
		if (this.type !== other.type || this.dimensions !== other.dimensions) {
			return false;
		}

		// Compare bounding boxes
		const thisBounds = this.getBounds();
		const otherBounds = other.getBounds();

		if (this.dimensions === 2) {
			const thisRect = thisBounds as IRectangle;
			const otherRect = otherBounds as IRectangle;

			return (
				this.almostEqual(Number(thisRect.x), Number(otherRect.x), epsilon) &&
				this.almostEqual(Number(thisRect.y), Number(otherRect.y), epsilon) &&
				this.almostEqual(
					Number(thisRect.width),
					Number(otherRect.width),
					epsilon,
				) &&
				this.almostEqual(
					Number(thisRect.height),
					Number(otherRect.height),
					epsilon,
				)
			);
		} else {
			const thisBox = thisBounds as IBox3D;
			const otherBox = otherBounds as IBox3D;

			return (
				this.almostEqual(Number(thisBox.x), Number(otherBox.x), epsilon) &&
				this.almostEqual(Number(thisBox.y), Number(otherBox.y), epsilon) &&
				this.almostEqual(Number(thisBox.z), Number(otherBox.z), epsilon) &&
				this.almostEqual(
					Number(thisBox.width),
					Number(otherBox.width),
					epsilon,
				) &&
				this.almostEqual(
					Number(thisBox.height),
					Number(otherBox.height),
					epsilon,
				) &&
				this.almostEqual(Number(thisBox.depth), Number(otherBox.depth), epsilon)
			);
		}
	}

	/**
	 * Get a string representation of this geometry
	 * @returns String representation
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
