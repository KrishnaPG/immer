import type {
	IBasis,
	IPoint,
	IPointCoordinates,
	IRawTensor,
	ITransform,
	ITransformMatrix,
	IVector,
	IVectorCoordinates,
	TAngleRad,
	TCoordinate,
	TCoordinateX,
	TCoordinateY,
	TCoordinateZ,
	TDistance,
} from "../types";
import { Vector } from "./Vector";
// Vector will be imported dynamically to avoid circular dependency

/**
 * Point class - Represents a 3D point in space
 *
 * A Point represents a specific location in 3D space with immutable coordinates.
 * All operations on points return new Point instances rather than modifying
 * the original point.
 *
 * @example
 * ```typescript
 * const basis = new Basis(element, transform);
 * const point = new Point(basis, { x: 10, y: 20, z: 0 });
 *
 * // Create a new point by adding a vector
 * const vector = new Vector(basis, { x: 5, y: 5, z: 0 });
 * const newPoint = point.addVector(vector);
 * ```
 */
export class Point implements IPoint {
	readonly isPoint = true as const;
	readonly basis: IBasis;
	readonly point: IPointCoordinates;

	constructor(basis: IBasis, point: IPointCoordinates) {
		this.basis = basis;
		this.point = { ...point };

		// Ensure z coordinate exists for 3D space
		if (this.point.z === undefined) {
			(this.point as any).z = 0 as TCoordinateZ;
		}
	}

	/**
	 * Add a vector to this point to create a new point
	 */
	addVector(vector: IVector): IPoint {
		if (!vector.isVector) {
			throw new Error("addVector requires a Vector instance");
		}

		const newCoords: IPointCoordinates = {
			x: (this.point.x + vector.vec.x) as TCoordinateX,
			y: (this.point.y + vector.vec.y) as TCoordinateY,
			z: ((this.point.z || 0) + (vector.vec.z || 0)) as TCoordinateZ,
		};

		return new Point(this.basis, newCoords);
	}

	/**
	 * Get the distance to another point
	 */
	getDistanceTo(other: IPoint): TDistance {
		if (!other.isPoint) {
			throw new Error("getDistanceTo requires a Point instance");
		}

		const dx = (this.point.x - other.point.x) as TCoordinateX;
		const dy = (this.point.y, other.point.y) as TCoordinateY;
		const dz = ((this.point.z || (0 as TCoordinateZ)) - (other.point.z || (0 as TCoordinateZ)))as TCoordinateZ;

		const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
		return distance as TDistance;
	}

	/**
	 * Get the vector from this point to another point
	 */
	getVectorTo(other: IPoint): IVector {
		if (!other.isPoint) {
			throw new Error("getVectorTo requires a Point instance");
		}

		const vectorCoords: IVectorCoordinates = {
			x: (other.point.x - this.point.x) as TCoordinateX,
			y: (other.point.y - this.point.y) as TCoordinateY,
			z: ((other.point.z || 0) - (this.point.z || 0)) as TCoordinateZ,
		};

		// Import Vector class dynamically to avoid circular dependency
		return new Vector(this.basis, vectorCoords);
	}

	/**
	 * Create a new point by offsetting this point
	 */
	offset(offset: IVectorCoordinates): IPoint {
		const newCoords: IPointCoordinates = {
			x: (this.point.x + offset.x) as TCoordinateX,
			y: (this.point.y + offset.y) as TCoordinateY,
			z: (
				(this.point.z || (0 as TCoordinateZ)) +
				(offset.z || (0 as TCoordinateZ))
			) as TCoordinateZ,
		};

		return new Point(this.basis, newCoords);
	}

	/**
	 * Create a new point by translating this point by a vector
	 */
	translateBy(vector: IVectorCoordinates): IPoint {
		return this.offset(vector);
	}

	/**
	 * Transform this point by applying a transformation
	 */
	transformBy(transform: ITransform): IPoint {
		if (!transform.isTransform) {
			throw new Error("transformBy requires a Transform instance");
		}

		// Apply transformation matrix to point coordinates
		const x = this.point.x;
		const y = this.point.y;
		const z = this.point.z || (0 as TCoordinateZ);

		const newCoords: IPointCoordinates = {
			x: (transform.transform.a * x + transform.transform.c * y + transform.transform.e) as TCoordinateX,
			y: (transform.transform.b * x + transform.transform.d * y + transform.transform.f) as TCoordinateY,
			z: z,
		};
		return new Point(this.basis, newCoords);
	}

	/**
	 * Change the basis of this point
	 */
	changeBasis(newBasis: IBasis): IPoint {
		// For now, return a new point with the same coordinates
		// In a full implementation, this would transform coordinates between bases
		return new Point(newBasis, this.point);
	}

	/**
	 * Get the raw tensor representation
	 */
	getRaw(): IRawTensor {
		return {
			basis: this.basis,
			tensor: new Float32Array([
				this.point.x,
				this.point.y,
				this.point.z || 0,
			]) as any,
		};
	}

	/**
	 * Create a new point from raw tensor data
	 */
	transitRaw(rawTensor: IRawTensor): IPoint {
		const coords: IPointCoordinates = {
			x: rawTensor.tensor[0] as TCoordinateX,
			y: rawTensor.tensor[1] as TCoordinateY,
			z: rawTensor.tensor[2] as TCoordinateZ,
		};

		return new Point(rawTensor.basis, coords);
	}

	/**
	 * Check if this point is almost equal to another point
	 */
	almostEqual(
		other: IPoint,
		tolerance: TDistance = 1e-6 as TDistance,
	): boolean {
		if (!other.isPoint) {
			return false;
		}

		const distance = this.getDistanceTo(other);
		return distance <= tolerance;
	}

	/**
	 * Check if this point is exactly equal to another point
	 */
	equal(other: IPoint): boolean {
		return this.almostEqual(other, 0 as TDistance);
	}

	/**
	 * Create a new point by rotating around an origin
	 */
	rotateBy(angle: TAngleRad, origin?: IPoint): IPoint {
		if (origin && !origin.isPoint) {
			throw new Error("rotateBy requires origin to be a Point instance");
		}

		const center =
			origin ||
			new Point(this.basis, {
				x: 0 as TCoordinateX,
				y: 0 as TCoordinateY,
				z: 0 as TCoordinateZ,
			});

		// Translate to origin
		const translated = this.translateBy({
			x: -center.point.x as TCoordinateX,
			y: -center.point.y as TCoordinateY,
			z: -(center.point.z || (0 as TCoordinateZ)) as TCoordinateZ,
		});

		// Rotate
		const cos = Math.cos(angle) as TCoordinateX;
		const sin = Math.sin(angle) as TCoordinateY;

		const rotatedCoords: IPointCoordinates = {
			x: (translated.point.x * cos - translated.point.y * sin) as TCoordinateX,
			y: (translated.point.x * sin + translated.point.y * cos) as TCoordinateY,
			z: translated.point.z,
		};

		// Translate back
		return new Point(this.basis, rotatedCoords).translateBy({
			x: center.point.x,
			y: center.point.y,
			z: center.point.z || (0 as TCoordinateZ),
		});
	}

	/**
	 * Create a new point by scaling around an origin
	 */
	scaleBy(factor: number, origin?: IPoint): IPoint {
		if (origin && !origin.isPoint) {
			throw new Error("scaleBy requires origin to be a Point instance");
		}

		const center =
			origin ||
			new Point(this.basis, {
				x: 0 as TCoordinateX,
				y: 0 as TCoordinateY,
				z: 0 as TCoordinateZ,
			});

		// Translate to origin
		const translated = this.translateBy({
			x: -center.point.x as TCoordinateX,
			y: -center.point.y as TCoordinateY,
			z: -(center.point.z || (0 as TCoordinateZ)) as TCoordinateZ,
		});

		// Scale
		const scaledCoords: IPointCoordinates = {
			x: (translated.point.x * factor) as TCoordinateX,
			y: (translated.point.y * factor) as TCoordinateY,
			z: translated.point.z,
		};

		// Translate back
		return new Point(this.basis, scaledCoords).translateBy({
			x: center.point.x,
			y: center.point.y,
			z: center.point.z || (0 as TCoordinateZ),
		});
	}

	/**
	 * Round coordinates to nearest integers
	 */
	round(): IPoint {
		const roundedCoords: IPointCoordinates = {
			x: Math.round(this.point.x) as TCoordinateX,
			y: Math.round(this.point.y) as TCoordinateY,
			z: this.point.z
				? (Math.round(this.point.z) as TCoordinateZ)
				: (0 as TCoordinateZ),
		};

		return new Point(this.basis, roundedCoords);
	}

	/**
	 * Get a string representation of this point
	 */
	toString(): string {
		return `Point(${this.point.x}, ${this.point.y}, ${this.point.z || 0})`;
	}


}
