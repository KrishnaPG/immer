import * as tf from "@tensorflow/tfjs";
import type { TAngle, TCoordinate, TScale } from "@/types/branded.types";
import { AffineMatrix } from "./matrix";
import type { Vector2D } from "./vector";

/**
 * Affine transformation for 2D coordinate systems
 * Combines translation, rotation, and scaling operations
 */
export class AffineTransform {
	public readonly matrix: AffineMatrix;

	constructor(matrix: AffineMatrix) {
		this.matrix = matrix;
	}

	/**
	 * Create identity transformation
	 */
	static identity(): AffineTransform {
		return new AffineTransform(AffineMatrix.identity());
	}

	/**
	 * Create translation transformation
	 */
	static translation(x: TCoordinate, y: TCoordinate): AffineTransform {
		return new AffineTransform(
			AffineMatrix.translation(x as number, y as number),
		);
	}

	/**
	 * Create rotation transformation
	 */
	static rotation(angle: TAngle): AffineTransform {
		return new AffineTransform(AffineMatrix.rotation(angle as number));
	}

	/**
	 * Create scaling transformation
	 */
	static scaling(sx: TScale, sy: TScale): AffineTransform {
		return new AffineTransform(
			AffineMatrix.scaling(sx as number, sy as number),
		);
	}

	/**
	 * Combine transformations (this * other)
	 */
	compose(other: AffineTransform): AffineTransform {
		const result = this.matrix.multiply(other.matrix);
		return new AffineTransform(result);
	}

	/**
	 * Apply inverse transformation
	 */
	inverse(): AffineTransform {
		const invMatrix = this.matrix.invert();
		return new AffineTransform(invMatrix);
	}

	/**
	 * Transform a point
	 */
	transformPoint(point: Vector2D): Vector2D {
		return point.transform(this.matrix.tensor);
	}

	/**
	 * Transform multiple points
	 */
	transformPoints(points: Vector2D[]): Vector2D[] {
		return points.map((point) => this.transformPoint(point));
	}

	/**
	 * Get translation components
	 */
	getTranslation(): { x: TCoordinate; y: TCoordinate } {
		const values = this.matrix.tensor.dataSync();
		return {
			x: values[2] as TCoordinate,
			y: values[5] as TCoordinate,
		};
	}

	/**
	 * Get rotation angle
	 */
	getRotation(): TAngle {
		const values = this.matrix.tensor.dataSync();
		return Math.atan2(values[3], values[0]) as TAngle;
	}

	/**
	 * Get scale factors
	 */
	getScale(): { x: TScale; y: TScale } {
		const values = this.matrix.tensor.dataSync();
		const scaleX = Math.sqrt(values[0] * values[0] + values[3] * values[3]);
		const scaleY = Math.sqrt(values[1] * values[1] + values[4] * values[4]);
		return {
			x: scaleX as TScale,
			y: scaleY as TScale,
		};
	}

	/**
	 * Clean up resources
	 */
	dispose(): void {
		this.matrix.dispose();
	}
}
