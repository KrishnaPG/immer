// Direction will be imported dynamically to avoid circular dependency
import type {
	IBasis,
	IPoint,
	IRawTensor,
	ITransform,
	IVector,
	IVectorCoordinates,
	TAngleRad,
	TCoordinateX,
	TCoordinateY,
	TCoordinateZ,
	TDistance,
	TScaleFactor,
} from "../types";

/**
 * Vector class - Represents a 3D displacement vector in space
 *
 * A Vector represents a displacement in 3D space with direction and magnitude
 * but no position. All operations on vectors return new Vector instances
 * rather than modifying the original vector.
 *
 * @example
 * ```typescript
 * const basis = new Basis(element, transform);
 * const vector = new Vector(basis, { x: 5, y: 10, z: 0 });
 *
 * // Create a new vector by scaling
 * const scaledVector = vector.scaleBy(2);
 *
 * // Get the magnitude of the vector
 * const magnitude = vector.getDistance();
 * ```
 */
export class Vector implements IVector {
	readonly isVector = true as const;
	readonly basis: IBasis;
	readonly vec: IVectorCoordinates;

	constructor(basis: IBasis, vec: IVectorCoordinates) {
		this.basis = basis;
		this.vec = { ...vec };

		// Ensure z coordinate exists for 3D space
		if (this.vec.z === undefined) {
			(this.vec as any).z = 0 as TCoordinateZ;
		}
	}

	/**
	 * Add another vector to this vector
	 */
	add(other: IVector): IVector {
		if (!other.isVector) {
			throw new Error("add requires a Vector instance");
		}

		const newCoords: IVectorCoordinates = {
			x: (this.vec.x + other.vec.x) as TCoordinateX,
			y: (this.vec.y + other.vec.y) as TCoordinateY,
			z: ((this.vec.z || 0) + (other.vec.z || 0)) as TCoordinateZ,
		};

		return new Vector(this.basis, newCoords);
	}

	/**
	 * Subtract another vector from this vector
	 */
	subtract(other: IVector): IVector {
		if (!other.isVector) {
			throw new Error("subtract requires a Vector instance");
		}

		const newCoords: IVectorCoordinates = {
			x: (this.vec.x - other.vec.x) as TCoordinateX,
			y: (this.vec.y - other.vec.y) as TCoordinateY,
			z: ((this.vec.z || 0) - (other.vec.z || 0)) as TCoordinateZ,
		};

		return new Vector(this.basis, newCoords);
	}

	/**
	 * Scale this vector by a factor
	 */
	scaleBy(factor: TScaleFactor): IVector {
		const newCoords: IVectorCoordinates = {
			x: (this.vec.x * factor) as TCoordinateX,
			y: (this.vec.y * factor) as TCoordinateY,
			z: (this.vec.z || (0 as TCoordinateZ) * factor) as TCoordinateZ,
		};

		return new Vector(this.basis, newCoords);
	}

	/**
	 * Get the magnitude (distance) of this vector
	 */
	getDistance(): TDistance {
		const magnitude = Math.sqrt(
			this.vec.x * this.vec.x +
				this.vec.y * this.vec.y +
				(this.vec.z || 0) * (this.vec.z || 0),
		);
		return magnitude as TDistance;
	}

	/**
	 * Normalize this vector to unit length
	 */
	normalize(): IVector {
		const magnitude = this.getDistance();
		if (magnitude === 0) {
			throw new Error("Cannot normalize a zero-length vector");
		}
		return this.scaleBy((1.0 / magnitude) as TScaleFactor);
	}

	/**
	 * Get the direction of this vector
	 */
	getDirection(): any {
		// Import Direction class dynamically to avoid circular dependency
		const angle = Math.atan2(this.vec.y, this.vec.x) as TAngleRad;
		// For now, return the angle directly
		return angle;
	}

	/**
	 * Calculate dot product with another vector
	 */
	dot(other: IVector): TDistance {
		if (!other.isVector) {
			throw new Error("dot requires a Vector instance");
		}

		const dotProduct =
			this.vec.x * other.vec.x +
			this.vec.y * other.vec.y +
			(this.vec.z || 0) * (other.vec.z || 0);

		return dotProduct as TDistance;
	}

	/**
	 * Calculate cross product with another vector
	 */
	cross(other: IVector): IVector {
		if (!other.isVector) {
			throw new Error("cross requires a Vector instance");
		}

		const x = this.vec.y * (other.vec.z || 0) - (this.vec.z || 0) * other.vec.y;
		const y = (this.vec.z || 0) * other.vec.x - this.vec.x * (other.vec.z || 0);
		const z = this.vec.x * other.vec.y - this.vec.y * other.vec.x;

		const newCoords: IVectorCoordinates = {
			x: x as TCoordinateX,
			y: y as TCoordinateY,
			z: z as TCoordinateZ,
		};

		return new Vector(this.basis, newCoords);
	}

	/**
	 * Rotate this vector by an angle around an origin
	 */
	rotateBy(angle: TAngleRad, origin?: IPoint): IVector {
		if (origin && !origin.isPoint) {
			throw new Error("rotateBy requires origin to be a Point instance");
		}

		const cos = Math.cos(angle) as TCoordinateX;
		const sin = Math.sin(angle) as TCoordinateY;

		const newCoords: IVectorCoordinates = {
			x: (this.vec.x * cos - this.vec.y * sin) as TCoordinateX,
			y: (this.vec.x * sin + this.vec.y * cos) as TCoordinateY,
			z: this.vec.z,
		};

		return new Vector(this.basis, newCoords);
	}

	/**
	 * Transform this vector by applying a transformation
	 */
	transformBy(transform: ITransform): IVector {
		if (!transform.isTransform) {
			throw new Error("transformBy requires a Transform instance");
		}

		// Apply transformation matrix to vector coordinates
		const x = this.vec.x;
		const y = this.vec.y;
		const z = this.vec.z || (0 as TCoordinateZ);

		const newCoords: IVectorCoordinates = {
			x: (transform.transform.a * x + transform.transform.c * y + transform.transform.e) as TCoordinateX,
			y: (transform.transform.b * x + transform.transform.d * y + transform.transform.f) as TCoordinateY,
			z: z,
		};
		return new Vector(this.basis, newCoords);
	}

	/**
	 * Change the basis of this vector
	 */
	changeBasis(newBasis: IBasis): IVector {
		// For now, return a new vector with the same coordinates
		// In a full implementation, this would transform coordinates between bases
		return new Vector(newBasis, this.vec);
	}

	/**
	 * Get the raw tensor representation
	 */
	getRaw(): IRawTensor {
		return {
			basis: this.basis,
			tensor: new Float32Array([
				this.vec.x,
				this.vec.y,
				this.vec.z || 0,
			]) as any,
		};
	}

	/**
	 * Create a new vector from raw tensor data
	 */
	transitRaw(rawTensor: IRawTensor): IVector {
		const coords: IVectorCoordinates = {
			x: rawTensor.tensor[0] as TCoordinateX,
			y: rawTensor.tensor[1] as TCoordinateY,
			z: rawTensor.tensor[2] as TCoordinateZ,
		};

		return new Vector(rawTensor.basis, coords);
	}

	/**
	 * Check if this vector is almost equal to another vector
	 */
	almostEqual(
		other: IVector,
		tolerance: TDistance = 1e-6 as TDistance,
	): boolean {
		if (!other.isVector) {
			return false;
		}

		const difference = this.subtract(other);
		return difference.getDistance() <= tolerance;
	}

	/**
	 * Check if this vector is exactly equal to another vector
	 */
	equal(other: IVector): boolean {
		return this.almostEqual(other, 0 as TDistance);
	}

	/**
	 * Create a copy of this vector
	 */
	copy(): IVector {
		return new Vector(this.basis, this.vec);
	}

	/**
	 * Negate this vector
	 */
	negate(): IVector {
		return this.scaleBy(-1 as TScaleFactor);
	}

	/**
	 * Get a string representation of this vector
	 */
	toString(): string {
		return `Vector(${this.vec.x}, ${this.vec.y}, ${this.vec.z || 0})`;
	}
}
