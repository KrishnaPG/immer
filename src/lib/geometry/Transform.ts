/**
 * @fileoverview Transform class for affine transformation matrices
 * Represents affine transformations including rotation, scaling, and translation
 */

import type {
	IBasis,
	IPointCoordinates,
	IRawTensor,
	ITransform,
	ITransformMatrix,
	IVectorCoordinates,
	TAngleRad,
	TArea,
	TCoordinateX,
	TCoordinateY,
	TCoordinateZ,
	TDepth,
	TDistance,
	THeight,
	TMatrixA,
	TMatrixB,
	TMatrixC,
	TMatrixD,
	TMatrixE,
	TMatrixF,
	TName,
	TScaleFactor,
	TTensorData,
	TWidth,
} from "../types";
import type { IBox3D, IPoint3D } from "../utils/math/geometry-utils";
import { BaseGeometry } from "./BaseGeometry";

/**
 * Transform class - Represents affine transformation matrices
 *
 * A Transform represents an affine transformation in 2D/3D space, including
 * rotation, scaling, and translation operations. All operations return new
 * Transform instances rather than modifying the original transform.
 *
 * @example
 * ```typescript
 * const basis = new Basis(element, transform);
 * const transform = new Transform(basis, {
 *   a: 1, b: 0, c: 0, d: 1, e: 10, f: 20
 * });
 *
 * // Create a new transform by rotating
 * const rotatedTransform = transform.rotateBy(Math.PI / 4);
 * ```
 */
export class Transform extends BaseGeometry implements ITransform {
	public readonly isTransform = true as const;
	public readonly matrix: ITransformMatrix;

	constructor(
		basis: IBasis, // IBasis will be implemented later
		matrix: ITransformMatrix,
		props?: { id?: string; name?: string; metadata?: Record<string, unknown> },
	) {
		super(basis, props);
		this.matrix = { ...matrix };
	}

	/**
	 * Get the type name of this geometry object
	 */
	public readonly type = "Transform";

	/**
	 * Get the dimensionality of this geometry object (2 or 3)
	 */
	public readonly dimensions: 2 | 3 = 3;

	/**
	 * Check if this transform is valid
	 */
	public isValid(): boolean {
		// Check if the transformation matrix is valid (not singular)
		const { a, b, c, d } = this.matrix;
		const determinant = a * d - b * c;
		return Math.abs(determinant) > 1e-10;
	}

	/**
	 * Get the bounding box of this transform (represents the transformation bounds)
	 */
	public getBounds(): IBox3D {
		// For a transform, we return a unit box at origin
		// In a full implementation, this might depend on the basis
		return {
			x: 0 as TCoordinateX,
			y: 0 as TCoordinateY,
			z: 0 as TCoordinateZ,
			width: 1 as TWidth,
			height: 1 as THeight,
			depth: 1 as TDepth,
		};
	}

	/**
	 * Get the center point of this transform
	 */
	public getCenter(): IPoint3D {
		return {
			x: (this.matrix.e || 0) as TCoordinateX,
			y: (this.matrix.f || 0) as TCoordinateY,
			z: (0) as TCoordinateZ,
		};
	}

	/**
	 * Transform this geometry object using a transformation matrix
	 */
	public transform(options: Record<string, unknown>): Transform {
		const t = options.transform as ITransform;
		// For a transform, applying another transform composes them
		if (t?.isTransform) {
			return this.compose(t);
		}
		return this.clone();
	}

	/**
	 * Compose this transform with another transform (matrix multiplication)
	 */
	public compose(other: ITransform): Transform {
		const m1 = this.matrix;
		const m2 = other.matrix;

		const newMatrix: ITransformMatrix = {
			a: (m1.a * m2.a + m1.c * m2.b) as TMatrixA,
			b: (m1.b * m2.a + m1.d * m2.b) as TMatrixB,
			c: (m1.a * m2.c + m1.c * m2.d) as TMatrixC,
			d: (m1.b * m2.c + m1.d * m2.d) as TMatrixD,
			e: (m1.a * m2.e + m1.c * m2.f + m1.e) as TMatrixE,
			f: (m1.b * m2.e + m1.d * m2.f + m1.f) as TMatrixF,
		};

		return new Transform(this.basis, newMatrix, {
			id: this.generateId(),
			metadata: this.updateMetadata({ composed: true }),
		});
	}

	/**
	 * Clone this transform
	 */
	public clone(options?: Record<string, unknown>): Transform {
		return new Transform(this.basis, this.matrix, {
			id: options?.id as string || this.generateId(),
			name: options?.name as TName || this.name,
			metadata: options?.includeMetadata ? this.metadata : undefined,
		});
	}

	/**
	 * Serialize this transform to a plain object
	 */
	public serialize(options?: Record<string, unknown>): Record<string, unknown> {
		const precision = options?.precision as number || 10;

		return {
			type: this.type,
			id: options?.includeId ? this.id : undefined,
			name: this.name,
			metadata: options?.includeMetadata ? this.metadata : undefined,
			basis: this.basis,
			matrix: {
				a: this.formatNumber(this.matrix.a, precision),
				b: this.formatNumber(this.matrix.b, precision),
				c: this.formatNumber(this.matrix.c, precision),
				d: this.formatNumber(this.matrix.d, precision),
				e: this.formatNumber(this.matrix.e, precision),
				f: this.formatNumber(this.matrix.f, precision),
			},
		};
	}

	/**
	 * Calculate the distance from this transform to a point
	 */
	public distanceTo(point: IPoint3D): TDistance {
		// For a transform, distance to a point is the distance from the translation component
		const center = this.getCenter();
		const dx = point.x - center.x;
		const dy = point.y - center.y;
		const dz = (point.z || 0) - (center.z || 0);

		return Math.sqrt(dx * dx + dy * dy + dz * dz) as TDistance;
	}

	/**
	 * Check if this transform contains a point
	 */
	public contains(_point: IPoint3D): boolean {
		// A transform doesn't "contain" points in the traditional sense
		// This could be implemented based on specific requirements
		return false;
	}

	/**
	 * Check if this transform intersects with another geometry
	 */
	public intersects(_other: BaseGeometry): boolean {
		// Transform intersection logic would depend on the specific use case
		// For now, return false as transforms don't have spatial extent
		return false;
	}

	/**
	 * Get the measure (area/volume) of this transform
	 */
	public getMeasure(): TArea {
		// Transforms don't have area/volume in the traditional sense
		return 0 as TArea;
	}

	/**
	 * Get the inverse of this transform
	 */
	public inverse(): ITransform {
		const { a, b, c, d, e, f } = this.matrix;
		const det = a * d - b * c;

		if (Math.abs(det) < 1e-10) {
			throw new Error("Cannot invert singular transformation matrix");
		}

		const invDet = 1 / det;
		const newMatrix: ITransformMatrix = {
			a: (d * invDet) as TMatrixA,
			b: (-b * invDet) as TMatrixB,
			c: (-c * invDet) as TMatrixC,
			d: (a * invDet) as TMatrixD,
			e: ((c * f - d * e) * invDet) as TMatrixE,
			f: ((b * e - a * f) * invDet) as TMatrixF,
		};

		return new Transform(this.basis, newMatrix, {
			id: this.generateId(),
			metadata: this.updateMetadata({ inverted: true }),
		});
	}

	/**
	 * Multiply this transform by another transform (alias for compose)
	 */
	public multiply(other: ITransform): ITransform {
		return this.compose(other);
	}

	/**
	 * Get the translation vector of this transform
	 */
	public getTranslation(): IVectorCoordinates {
		return {
			x: this.matrix.e as number as TCoordinateX,
			y: this.matrix.f as number as TCoordinateY,
			z: 0 as TCoordinateZ,
		};
	}

	/**
	 * Get the rotation angle of this transform (in radians)
	 */
	public getRotation(): TAngleRad {
		// Extract rotation from the transformation matrix
		// For a 2D rotation matrix [[cos, -sin], [sin, cos]], we can extract the angle
		const { a, b, c, d } = this.matrix;

		// Check if this is a pure rotation (no scaling or shear)
		if (
			this.almostEqual(a * a + b * b, 1) &&
			this.almostEqual(c * c + d * d, 1) &&
			this.almostEqual(a * d - b * c, 1)
		) {
			return Math.atan2(b, a) as TAngleRad;
		}

		// For non-pure rotations, return 0
		return 0 as TAngleRad;
	}

	/**
	 * Get the scale factors of this transform
	 */
	public getScale(): { x: TScaleFactor; y: TScaleFactor; z?: TScaleFactor } {
		const { a, b, c, d } = this.matrix;

		// Extract scale factors from the matrix columns
		const scaleX = Math.sqrt(a * a + b * b) as TScaleFactor;
		const scaleY = Math.sqrt(c * c + d * d) as TScaleFactor;

		return {
			x: scaleX,
			y: scaleY,
			z: 1 as TScaleFactor, // Default for 2D transforms
		};
	}

	/**
	 * Create a new transform by translating
	 */
	public translateBy(vector: IVectorCoordinates): ITransform {
		const newMatrix: ITransformMatrix = {
			...this.matrix,
			e: (this.matrix.e + vector.x) as TMatrixE,
			f: (this.matrix.f + vector.y) as TMatrixF,
		};

		return new Transform(this.basis, newMatrix, {
			id: this.generateId(),
			metadata: this.updateMetadata({ translated: true }),
		});
	}

	/**
	 * Create a new transform by rotating
	 */
	public rotateBy(angle: TAngleRad): ITransform {
		const cos = Math.cos(angle);
		const sin = Math.sin(angle);

		const rotationMatrix: ITransformMatrix = {
			a: cos as TMatrixA,
			b: -sin as TMatrixB,
			c: sin as TMatrixC,
			d: cos as TMatrixD,
			e: 0 as TMatrixE,
			f: 0 as TMatrixF,
		};

		return this.multiply(new Transform(this.basis, rotationMatrix));
	}

	/**
	 * Create a new transform by scaling
	 */
	public scaleBy(factor: TScaleFactor): ITransform;
	public scaleBy(factors: {
		x: TScaleFactor;
		y: TScaleFactor;
		z?: TScaleFactor;
	}): ITransform;
	public scaleBy(
		factor:
			| TScaleFactor
			| { x: TScaleFactor; y: TScaleFactor; z?: TScaleFactor },
	): ITransform {
		let scaleMatrix: ITransformMatrix;

		if (typeof factor === "number") {
			scaleMatrix = {
				a: factor as TMatrixA,
				b: 0 as TMatrixB,
				c: 0 as TMatrixC,
				d: factor as TMatrixD,
				e: 0 as TMatrixE,
				f: 0 as TMatrixF,
			};
		} else {
			scaleMatrix = {
				a: factor.x as TMatrixA,
				b: 0 as TMatrixB,
				c: 0 as TMatrixC,
				d: factor.y as TMatrixD,
				e: 0 as TMatrixE,
				f: 0 as TMatrixF,
			};
		}

		return this.multiply(new Transform(this.basis, scaleMatrix));
	}

	/**
	 * Change the basis of this transform
	 */
	public changeBasis(newBasis: IBasis): ITransform {
		// For now, return a new transform with the same matrix
		// In a full implementation, this would transform between coordinate systems
		return new Transform(newBasis, this.matrix, {
			id: this.generateId(),
			metadata: this.updateMetadata({ basisChanged: true }),
		});
	}

	/**
	 * Get the raw tensor representation
	 */
	public getRaw(): IRawTensor {
		return {
			basis: this.basis,
			tensor: new Float32Array([
				this.matrix.a,
				this.matrix.b,
				this.matrix.c,
				this.matrix.d,
				this.matrix.e,
				this.matrix.f,
			]) as TTensorData,
		};
	}

	/**
	 * Create a new transform from raw tensor data
	 */
	public transitRaw(rawTensor: IRawTensor): ITransform {
		const matrix: ITransformMatrix = {
			a: rawTensor.tensor[0] as TMatrixA,
			b: rawTensor.tensor[1] as TMatrixB,
			c: rawTensor.tensor[2] as TMatrixC,
			d: rawTensor.tensor[3] as TMatrixD,
			e: rawTensor.tensor[4] as TMatrixE,
			f: rawTensor.tensor[5] as TMatrixF,
		};

		return new Transform(rawTensor.basis, matrix);
	}

	/**
	 * Apply this transform to a point
	 */
	public transformPoint(point: IPointCoordinates): IPointCoordinates {
		const x = point.x;
		const y = point.y;
		const z = point.z || 0;

		return {
			x: (this.matrix.a * x +
				this.matrix.c * y +
				this.matrix.e) as TCoordinateX,
			y: (this.matrix.b * x +
				this.matrix.d * y +
				this.matrix.f) as TCoordinateY,
			z: z as TCoordinateZ,
		};
	}

	/**
	 * Apply this transform to a vector
	 */
	public transformVector(vector: IVectorCoordinates): IVectorCoordinates {
		const x = vector.x;
		const y = vector.y;
		const z = vector.z || 0;

		return {
			x: (this.matrix.a * x + this.matrix.c * y) as TCoordinateX,
			y: (this.matrix.b * x + this.matrix.d * y) as TCoordinateY,
			z: z as TCoordinateZ,
		};
	}

	/**
	 * Check if this transform is almost equal to another transform
	 */
	public almostEqualTo(
		other: ITransform,
		tolerance: TDistance = 1e-6 as TDistance,
	): boolean {
		if (!other.isTransform) {
			return false;
		}

		return (
			this.almostEqual(Number(this.matrix.a), Number(other.matrix.a), Number(tolerance)) &&
			this.almostEqual(Number(this.matrix.b), Number(other.matrix.b), Number(tolerance)) &&
			this.almostEqual(Number(this.matrix.c), Number(other.matrix.c), Number(tolerance)) &&
			this.almostEqual(Number(this.matrix.d), Number(other.matrix.d), Number(tolerance)) &&
			this.almostEqual(Number(this.matrix.e), Number(other.matrix.e), Number(tolerance)) &&
			this.almostEqual(Number(this.matrix.f), Number(other.matrix.f), Number(tolerance))
		);
	}

	/**
	 * Check if this transform is exactly equal to another transform
	 */
	public equal(other: ITransform): boolean {
		return this.almostEqualTo(other, 0 as TDistance);
	}

	/**
	 * Get a string representation of this transform
	 */
	public toString(): string {
		return `Transform([${this.matrix.a}, ${this.matrix.b}; ${this.matrix.c}, ${this.matrix.d}; ${this.matrix.e}, ${this.matrix.f}])`;
	}
}
