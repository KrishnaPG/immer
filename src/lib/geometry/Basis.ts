import * as tf from "@tensorflow/tfjs";
import { Point } from "./Point";
import { AffineTransform } from "./transform";
import type { Vector2D } from "./vector";

export class Basis {
	readonly transform: AffineTransform;
	private _matrix: tf.Tensor2D;
	private _inverseMatrix: tf.Tensor2D | null = null;

	constructor(transform: AffineTransform = AffineTransform.identity()) {
		this.transform = transform;
		this._matrix = this.transformToMatrix(transform);
	}

	private transformToMatrix(transform: AffineTransform): tf.Tensor2D {
		// Create 3x3 affine transformation matrix
		// [a, b, x]
		// [c, d, y]
		// [0, 0, 1]
		const matrix = tf.tensor2d([
			[transform.a, transform.b, transform.x],
			[transform.c, transform.d, transform.y],
			[0, 0, 1],
		]);
		return matrix as tf.Tensor2D;
	}

	private getInverseMatrix(): tf.Tensor2D {
		if (!this._inverseMatrix) {
			// Convert 3x3 affine matrix to 4x4 for DOMMatrix inversion
			const values = this._matrix.dataSync();
			const matrix3x3 = [
				[values[0], values[1], values[2]],
				[values[3], values[4], values[5]],
				[values[6], values[7], values[8]]
			];

			// Pad to 4x4: add homogeneous coordinates row and column
			const matrix4x4 = [
				[matrix3x3[0][0], matrix3x3[0][1], matrix3x3[0][2], 0],
				[matrix3x3[1][0], matrix3x3[1][1], matrix3x3[1][2], 0],
				[matrix3x3[2][0], matrix3x3[2][1], matrix3x3[2][2], 0],
				[0, 0, 0, 1]
			];

			// Convert to column-major order for DOMMatrix
			const columnMajorArray = [
				matrix4x4[0][0], matrix4x4[1][0], matrix4x4[2][0], matrix4x4[3][0],
				matrix4x4[0][1], matrix4x4[1][1], matrix4x4[2][1], matrix4x4[3][1],
				matrix4x4[0][2], matrix4x4[1][2], matrix4x4[2][2], matrix4x4[3][2],
				matrix4x4[0][3], matrix4x4[1][3], matrix4x4[2][3], matrix4x4[3][3]
			];

			const domMatrix = new DOMMatrix(columnMajorArray);
			const invertedDomMatrix = domMatrix.inverse();

			if (Number.isNaN(invertedDomMatrix.m11)) {
				throw new Error('Matrix is not invertible');
			}

			// Extract the 3x3 part from the inverted 4x4 matrix
			const invValues = [
				invertedDomMatrix.m11, invertedDomMatrix.m12, invertedDomMatrix.m13,
				invertedDomMatrix.m21, invertedDomMatrix.m22, invertedDomMatrix.m23,
				invertedDomMatrix.m31, invertedDomMatrix.m32, invertedDomMatrix.m33
			];

			this._inverseMatrix = tf.tensor2d(invValues, [3, 3]);
		}
		return this._inverseMatrix;
	}

	static getTransformBetween(
		fromBasis: Basis,
		toBasis: Basis,
	): AffineTransform {
		// Calculate transformation from one basis to another
		const transformMatrix = tf.matMul(
			toBasis._matrix,
			fromBasis.getInverseMatrix(),
		);
		const [a, b, x, c, d, y] = transformMatrix.dataSync();

		return new AffineTransform(a, b, x, c, d, y);
	}

	translateBy(vector: Vector2D): Basis {
		const newTransform = AffineTransform.translateBy(vector);
		return new Basis(newTransform);
	}

	rotateBy(angle: number, origin?: Vector2D): Basis {
		const newTransform = AffineTransform.rotateBy(angle, origin);
		return new Basis(newTransform);
	}

	scaleBy(factor: number, origin?: Vector2D): Basis {
		const newTransform = AffineTransform.scaleBy(factor, origin);
		return new Basis(newTransform);
	}

	transformBy(transform: AffineTransform): Basis {
		const newTransform = this.transform.compose(transform);
		return new Basis(newTransform);
	}

	changeBasis(newBasis: Basis): Basis {
		const transform = Basis.getTransformBetween(this, newBasis);
		return this.transformBy(transform);
	}

	// Convert point from this basis to another basis
	transformPoint(point: Point): Point {
		const pointVector = tf.tensor2d([[point.x, point.y, 1]]);
		const result = tf.matMul(pointVector, this._matrix);
		const [x, y] = result.dataSync();

		pointVector.dispose();
		result.dispose();

		return new Point(this, { x, y });
	}

	// Convert point from another basis to this basis
	untransformPoint(point: Point): Point {
		const pointVector = tf.tensor2d([[point.x, point.y, 1]]);
		const inverseMatrix = this.getInverseMatrix();
		const result = tf.matMul(pointVector, inverseMatrix);
		const [x, y] = result.dataSync();

		pointVector.dispose();
		result.dispose();

		return new Point(this, { x, y });
	}

	getRaw() {
		return this.transform.getRaw();
	}

	dispose(): void {
		this._matrix.dispose();
		if (this._inverseMatrix) {
			this._inverseMatrix.dispose();
		}
	}
}
