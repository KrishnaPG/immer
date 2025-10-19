import * as tf from "@tensorflow/tfjs";
import type {
	TAngle,
	TCoordinate,
	TCoordinateX,
	TCoordinateY,
	TScale,
} from "@/types/branded.types";
import { Basis } from "./Basis";
import { Point } from "./Point";
import { Vector } from "./vector";

/**
 * Affine transformation for 2D coordinate systems
 * Combines translation, rotation, and scaling operations
 */
export class AffineTransform {
	readonly a: number; // scale x, shear
	readonly b: number; // shear, scale y
	readonly x: number; // translate x
	readonly c: number; // shear, scale x
	readonly d: number; // scale y, shear
	readonly y: number; // translate y

	constructor(a = 1, b = 0, x = 0, c = 0, d = 1, y = 0) {
		this.a = a;
		this.b = b;
		this.x = x;
		this.c = c;
		this.d = d;
		this.y = y;
	}

	/**
	 * Create identity transformation
	 */
	static identity(): AffineTransform {
		return new AffineTransform(1, 0, 0, 0, 1, 0);
	}

	/**
	 * Create translation transformation
	 */
	static translateBy(vector: Vector): AffineTransform {
		return new AffineTransform(
			1,
			0,
			vector.x as number,
			0,
			1,
			vector.y as number,
		);
	}

	/**
	 * Create rotation transformation
	 */
	static rotateBy(angle: number, origin?: Vector): AffineTransform {
		const cos = Math.cos(angle);
		const sin = Math.sin(angle);

		if (origin) {
			const tx =
				(origin.x as number) -
				(origin.x as number) * cos +
				(origin.y as number) * sin;
			const ty =
				(origin.y as number) -
				(origin.x as number) * sin -
				(origin.y as number) * cos;
			return new AffineTransform(cos, -sin, tx, sin, cos, ty);
		}

		return new AffineTransform(cos, -sin, 0, sin, cos, 0);
	}

	/**
	 * Create scale transformation
	 */
	static scaleBy(factor: number, origin?: Vector): AffineTransform {
		if (origin) {
			const tx = (origin.x as number) - (origin.x as number) * factor;
			const ty = (origin.y as number) - (origin.y as number) * factor;
			return new AffineTransform(factor, 0, tx, 0, factor, ty);
		}

		return new AffineTransform(factor, 0, 0, 0, factor, 0);
	}

	/**
	 * Combine transformations (this * other)
	 */
	compose(other: AffineTransform): AffineTransform {
		return new AffineTransform(
			this.a * other.a + this.b * other.c,
			this.a * other.b + this.b * other.d,
			this.a * other.x + this.b * other.y + this.x,
			this.c * other.a + this.d * other.c,
			this.c * other.b + this.d * other.d,
			this.c * other.x + this.d * other.y + this.y,
		);
	}

	/**
	 * Get inverse transform
	 */
	inverse(): AffineTransform {
		const det = this.a * this.d - this.b * this.c;
		if (Math.abs(det) < 1e-10) {
			throw new Error("Transform is not invertible");
		}

		const invDet = 1 / det;
		return new AffineTransform(
			this.d * invDet,
			-this.b * invDet,
			(this.b * this.y - this.d * this.x) * invDet,
			-this.c * invDet,
			this.a * invDet,
			(this.c * this.x - this.a * this.y) * invDet,
		);
	}

	/**
	 * Apply transform to point
	 */
	transformPoint(point: { x: number; y: number }): { x: number; y: number } {
		return {
			x: this.a * point.x + this.b * point.y + this.x,
			y: this.c * point.x + this.d * point.y + this.y,
		};
	}

	/**
	 * Get scale factor
	 */
	getScale(): number {
		const scaleX = Math.sqrt(this.a * this.a + this.c * this.c);
		const scaleY = Math.sqrt(this.b * this.b + this.d * this.d);
		return (scaleX + scaleY) / 2;
	}

	/**
	 * Get rotation angle
	 */
	getRotation(): number {
		return Math.atan2(this.b, this.a);
	}

	/**
	 * Get translation vector
	 */
	getTranslation(): Vector {
		// Create a basis for the translation vector
		const identityBasis = new Basis(AffineTransform.identity());
		return new Vector(identityBasis, {
			x: this.x as TCoordinateX,
			y: this.y as TCoordinateY,
		});
	}

	/**
	 * Convert to CSS matrix string
	 */
	toCSSMatrix(): string {
		return `${this.a}, ${this.b}, ${this.c}, ${this.d}, ${this.x}, ${this.y}`;
	}

	getRaw() {
		return { a: this.a, b: this.b, x: this.x, c: this.c, d: this.d, y: this.y };
	}

	equals(other: AffineTransform): boolean {
		return (
			this.a === other.a &&
			this.b === other.b &&
			this.x === other.x &&
			this.c === other.c &&
			this.d === other.d &&
			this.y === other.y
		);
	}
}
