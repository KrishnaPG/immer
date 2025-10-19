/**
 * @fileoverview Basis class for coordinate system transformations
 * Represents a coordinate system basis with an HTML element and transform
 */

import type {
 	IBasis,
 	IRawTensor,
 	ITransform,
 	ITransformMatrix,
 	TArea,
 	TCoordinateX,
 	TCoordinateY,
 	TCoordinateZ,
 	TDeltaMode,
 	TDepth,
 	TDistance,
 	THeight,
 	THtmlElement,
 	TMatrixA,
 	TMatrixB,
 	TMatrixC,
 	TMatrixD,
 	TMatrixE,
 	TMatrixF,
    TName,
		TWidth,
} from "../types";
import type { IBox3D, IPoint2D, IPoint3D } from "../utils/math/geometry-utils";
import { BaseGeometry } from "./BaseGeometry";
import { Transform } from "./Transform";

/**
 * Basis class - Represents a coordinate system basis for transformations
 *
 * A Basis represents a coordinate system defined by an HTML element and
 * a transformation matrix. It serves as the foundation for all geometric
 * objects in tapspace, providing the context for their position and orientation.
 *
 * @example
 * ```typescript
 * const element = document.getElementById('myElement');
 * const transform = new Transform(basis, { a: 1, b: 0, c: 0, d: 1, e: 10, f: 20 });
 * const basis = new Basis(element, transform);
 *
 * const point = new Point(basis, { x: 5, y: 10, z: 0 });
 * ```
 */
export class Basis extends BaseGeometry implements IBasis {
	public readonly element: THtmlElement;
	public readonly matrix: ITransformMatrix;

	constructor(
		element: THtmlElement,
		matrix: ITransformMatrix,
		props?: { id?: string; name?: string; metadata?: Record<string, unknown> },
	) {
		// Create a minimal basis for the basis itself
		const basis = { element, matrix };
		super(basis, props);
		this.element = element;
		this.matrix = { ...matrix };
	}

	/**
	 * Get the type name of this geometry object
	 */
	public readonly type = "Basis";

	/**
	 * Get the dimensionality of this geometry object (2 or 3)
	 */
	public readonly dimensions: 2 | 3 = 3;

	/**
	 * Check if this basis is valid
	 */
	public isValid(): boolean {
		return this.element !== null && this.element !== undefined;
	}

	/**
	 * Get the bounding box of this basis
	 */
	public getBounds(): IBox3D {
		const rect = this.element.getBoundingClientRect();
		return {
			x: rect.left as TCoordinateX,
			y: rect.top as TCoordinateY,
			z: 0 as TCoordinateZ,
			width: rect.width as TWidth,
			height: rect.height as THeight,
			depth: 0 as TDepth,
		};
	}

	/**
	 * Get the center point of this basis
	 */
	public getCenter(): IPoint3D {
		const rect = this.element.getBoundingClientRect();
		return {
			x: (rect.left + rect.width / 2) as TCoordinateX,
			y: (rect.top + rect.height / 2) as TCoordinateY,
			z: (0) as TCoordinateZ,
		};
	}

	/**
	 * Transform this basis (creates a new basis with composed transform)
	 */
	public transform(options: Record<string, unknown>): Basis {
    const t = options.transform as ITransform;
		if (t?.isTransform) {
			const composedTransform = t.multiply(
				new Transform(this.basis, this.matrix),
			);
			return new Basis(this.element, composedTransform.matrix, {
				id: this.generateId(),
				metadata: this.updateMetadata({ transformed: true }),
			});
		}
		return this.clone();
	}

	/**
	 * Clone this basis
	 */
	public clone(options?: Record<string, unknown>): Basis {
		return new Basis(this.element, this.matrix, {
			id: options?.id as string || this.generateId(),
			name: options?.name as TName || this.name,
			metadata: options?.includeMetadata ? this.metadata : undefined,
		});
	}

	/**
	 * Serialize this basis to a plain object
	 */
	public serialize(options?: Record<string, unknown>): Record<string, unknown> {
		const rect = this.element.getBoundingClientRect();

		return {
			type: this.type,
			id: options?.includeId ? this.id : undefined,
			name: this.name,
			metadata: options?.includeMetadata ? this.metadata : undefined,
			element: {
				tagName: this.element.tagName,
				id: this.element.id,
				className: this.element.className,
			},
			bounds: {
				x: rect.left,
				y: rect.top,
				width: rect.width,
				height: rect.height,
			},
			transform: this.transform,
		};
	}

	/**
	 * Calculate the distance from this basis to a point
	 */
	public distanceTo(point: IPoint3D): TDistance {
		const center = this.getCenter();
		const dx = Number(point.x) - Number(center.x);
		const dy = Number(point.y) - Number(center.y);
		const dz = Number(point.z || 0) - Number(center.z || 0);

		return Math.sqrt(dx * dx + dy * dy + dz * dz) as TDistance;
	}

	/**
	 * Check if this basis contains a point
	 */
	public contains(point: IPoint2D): boolean {
		const rect = this.element.getBoundingClientRect();
		return (
			point.x >= rect.left &&
			point.x <= rect.right &&
			point.y >= rect.top &&
			point.y <= rect.bottom
		);
	}

	/**
	 * Check if this basis intersects with another geometry
	 */
	public intersects(other: BaseGeometry): boolean {
		if (other.type === "Basis") {
			const thisRect = this.element.getBoundingClientRect();
			const otherRect = (other as Basis).element.getBoundingClientRect();

			return !(
				thisRect.right < otherRect.left ||
				thisRect.left > otherRect.right ||
				thisRect.bottom < otherRect.top ||
				thisRect.top > otherRect.bottom
			);
		}
		return false;
	}

	/**
	 * Get the measure (area/volume) of this basis
	 */
	public getMeasure(): TArea {
		const rect = this.element.getBoundingClientRect();
		return rect.width * rect.height as TArea; // Area in pixels
	}

	/**
	 * Change the basis of this basis (creates identity transformation)
	 */
	public changeBasis(newBasis: IBasis): Basis {
		// For now, return a new basis with the same element but identity transform
		// In a full implementation, this would transform between coordinate systems
		const identityTransform: ITransformMatrix = {
			a: 1 as TMatrixA,
			b: 0 as TMatrixB,
			c: 0 as TMatrixC,
			d: 1 as TMatrixD,
			e: 0 as TMatrixE,
			f: 0 as TMatrixF,
		};

		return new Basis(this.element, identityTransform, {
			id: this.generateId(),
			metadata: this.updateMetadata({ basisChanged: true }),
		});
	}

	/**
	 * Get the raw tensor representation
	 */
	public getRaw(): IRawTensor {
		const rect = this.element.getBoundingClientRect();
		return {
			basis: this,
			tensor: new Float32Array([
				rect.left,
				rect.top,
				rect.width,
				rect.height,
			]) as any,
		};
	}

	/**
	 * Create a new basis from raw tensor data
	 */
	public transitRaw(rawTensor: IRawTensor): Basis {
		// For a basis, we need to reconstruct from the tensor data
		// This is a simplified implementation
		const identityTransform: ITransformMatrix = {
			a: 1 as TMatrixA,
			b: 0 as TMatrixB,
			c: 0 as TMatrixC,
			d: 1 as TMatrixD,
			e: (rawTensor.tensor[0] || 0) as TMatrixE,
			f: (rawTensor.tensor[1] || 0) as TMatrixF,
		};

		return new Basis(this.element, identityTransform);
	}

	/**
	 * Get the client rectangle of the element
	 */
	public getClientRect(): {
		left: number;
		top: number;
		width: number;
		height: number;
	} {
		return this.element.getBoundingClientRect();
	}

	/**
	 * Check if this basis is visible
	 */
	public isVisible(): boolean {
		const rect = this.element.getBoundingClientRect();
		return (
			rect.width > 0 && rect.height > 0 && this.element.offsetParent !== null
		);
	}

	/**
	 * Get the computed style of the element
	 */
	public getComputedStyle(): CSSStyleDeclaration {
		return window.getComputedStyle(this.element);
	}

	/**
	 * Check if this basis is almost equal to another basis
	 */
	public almostEqualTo(other: Basis, tolerance: number = 1e-6): boolean {
		if (!other.element || this.element.tagName !== other.element.tagName) {
			return false;
		}

		const thisRect = this.getClientRect();
		const otherRect = other.getClientRect();

		return (
			this.almostEqual(thisRect.left, otherRect.left, tolerance) &&
			this.almostEqual(thisRect.top, otherRect.top, tolerance) &&
			this.almostEqual(thisRect.width, otherRect.width, tolerance) &&
			this.almostEqual(thisRect.height, otherRect.height, tolerance)
		);
	}

	/**
	 * Check if this basis is exactly equal to another basis
	 */
	public equal(other: Basis): boolean {
		return this.almostEqualTo(other, 0);
	}

	/**
	 * Get a string representation of this basis
	 */
	public toString(): string {
		const rect = this.element.getBoundingClientRect();
		return `Basis(${this.element.tagName}${this.element.id ? `#${this.element.id}` : ""} at ${rect.left},${rect.top} ${rect.width}×${rect.height})`;
	}
}
