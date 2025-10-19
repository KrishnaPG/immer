/**
 * @fileoverview Matrix operations for affine transformations using branded types
 * Pure functions optimized for tree-shaking and type safety
 */

import type {
	TAngleRad,
	TCoordinateX,
	TCoordinateY,
	TCoordinateZ,
	TMatrixA,
	TMatrixB,
	TMatrixC,
	TMatrixD,
	TMatrixE,
	TMatrixF,
	TMatScaleX,
	TMatScaleY,
	TMatTx,
	TMatTy,
	TScaleFactor,
} from "../../types/base-types";

import type { IVector } from "./vector-ops";

/**
 * 2D affine transformation matrix (3x3)
 * [a c e]
 * [b d f]
 * [0 0 1]
 */
export interface IMatrix2D {
	readonly a: TMatrixA; // Scale X / Cos rotation
	readonly b: TMatrixB; // Sin rotation / Shear YX
	readonly c: TMatrixC; // Shear XY / -Sin rotation
	readonly d: TMatrixD; // Scale Y / Cos rotation
	readonly e: TMatrixE; // Translation X
	readonly f: TMatrixF; // Translation Y
}

/**
 * 3D affine transformation matrix (4x4)
 * [a c e x]
 * [b d f y]
 * [0 0 1 z]
 * [0 0 0 1]
 */
export interface IMatrix3D extends IMatrix2D {
	readonly x: TCoordinateX; // 3D translation X
	readonly y: TCoordinateY; // 3D translation Y
	readonly z: TCoordinateZ; // 3D translation Z
}

/**
 * Identity matrix for 2D transformations
 */
export const IDENTITY_2D: IMatrix2D = {
	a: 1 as TMatrixA,
	b: 0 as TMatrixB,
	c: 0 as TMatrixC,
	d: 1 as TMatrixD,
	e: 0 as TMatrixE,
	f: 0 as TMatrixF,
};

/**
 * Identity matrix for 3D transformations
 */
export const IDENTITY_3D: IMatrix3D = {
	...IDENTITY_2D,
	x: 0 as TCoordinateX,
	y: 0 as TCoordinateY,
	z: 0 as TCoordinateZ,
};

/**
 * Create translation matrix for 2D
 * @param tx - Translation X
 * @param ty - Translation Y
 * @returns Translation matrix
 */
export function createTranslation2D(tx: TMatTx, ty: TMatTy): IMatrix2D {
	return {
		a: 1 as TMatrixA,
		b: 0 as TMatrixB,
		c: 0 as TMatrixC,
		d: 1 as TMatrixD,
		e: tx,
		f: ty,
	};
}

/**
 * Create translation matrix for 3D
 * @param tx - Translation X
 * @param ty - Translation Y
 * @param tz - Translation Z
 * @returns Translation matrix
 */
export function createTranslation3D(
	tx: TCoordinateX,
	ty: TCoordinateY,
	tz: TCoordinateZ,
): IMatrix3D {
	return {
		...IDENTITY_2D,
		x: tx,
		y: ty,
		z: tz,
	};
}

/**
 * Create uniform scale matrix for 2D
 * @param scale - Scale factor
 * @returns Scale matrix
 */
export function createScale2D(scale: TScaleFactor): IMatrix2D {
	return {
		a: scale as TMatScaleX,
		b: 0 as TMatrixB,
		c: 0 as TMatrixC,
		d: scale as TMatScaleY,
		e: 0 as TMatrixE,
		f: 0 as TMatrixF,
	};
}

/**
 * Create non-uniform scale matrix for 2D
 * @param sx - Scale X factor
 * @param sy - Scale Y factor
 * @returns Scale matrix
 */
export function createScale2DNonUniform(
	sx: TScaleFactor,
	sy: TScaleFactor,
): IMatrix2D {
	return {
		a: sx as TMatScaleX,
		b: 0 as TMatrixB,
		c: 0 as TMatrixC,
		d: sy as TMatScaleY,
		e: 0 as TMatrixE,
		f: 0 as TMatrixF,
	};
}

/**
 * Create scale matrix for 3D
 * @param sx - Scale X factor
 * @param sy - Scale Y factor
 * @param sz - Scale Z factor
 * @returns Scale matrix
 */
export function createScale3D(
	sx: TScaleFactor,
	sy: TScaleFactor,
	sz: TScaleFactor,
): IMatrix3D {
	return {
		a: sx as TMatScaleX,
		b: 0 as TMatrixB,
		c: 0 as TMatrixC,
		d: sy as TMatScaleY,
		e: 0 as TMatrixE,
		f: 0 as TMatrixF,
		x: 0 as TCoordinateX,
		y: 0 as TCoordinateY,
		z: sz as number as TCoordinateZ,
	};
}

/**
 * Create rotation matrix for 2D
 * @param angle - Rotation angle in radians
 * @returns Rotation matrix
 */
export function createRotation2D(angle: TAngleRad): IMatrix2D {
	const cos = Math.cos(Number(angle));
	const sin = Math.sin(Number(angle));

	return {
		a: cos as TMatrixA,
		b: sin as TMatrixB,
		c: -sin as TMatrixC,
		d: cos as TMatrixD,
		e: 0 as TMatrixE,
		f: 0 as TMatrixF,
	};
}

/**
 * Create rotation matrix around X-axis for 3D
 * @param angle - Rotation angle in radians
 * @returns Rotation matrix
 */
export function createRotation3DX(angle: TAngleRad): IMatrix3D {
	const cos = Math.cos(Number(angle));
	const sin = Math.sin(Number(angle));

	return {
		a: 1 as TMatrixA,
		b: 0 as TMatrixB,
		c: 0 as TMatrixC,
		d: cos as TMatrixD,
		e: 0 as TMatrixE,
		f: sin as TMatrixF,
		x: 0 as TCoordinateX,
		y: 0 as TCoordinateY,
		z: 0 as TCoordinateZ,
	};
}

/**
 * Create rotation matrix around Y-axis for 3D
 * @param angle - Rotation angle in radians
 * @returns Rotation matrix
 */
export function createRotation3DY(angle: TAngleRad): IMatrix3D {
	const cos = Math.cos(Number(angle));
	const sin = Math.sin(Number(angle));

	return {
		a: cos as TMatrixA,
		b: 0 as TMatrixB,
		c: sin as TMatrixC,
		d: 1 as TMatrixD,
		e: 0 as TMatrixE,
		f: 0 as TMatrixF,
		x: 0 as TCoordinateX,
		y: 0 as TCoordinateY,
		z: 0 as TCoordinateZ,
	};
}

/**
 * Create rotation matrix around Z-axis for 3D
 * @param angle - Rotation angle in radians
 * @returns Rotation matrix
 */
export function createRotation3DZ(angle: TAngleRad): IMatrix3D {
	const cos = Math.cos(Number(angle));
	const sin = Math.sin(Number(angle));

	return {
		a: cos as TMatrixA,
		b: sin as TMatrixB,
		c: -sin as TMatrixC,
		d: cos as TMatrixD,
		e: 0 as TMatrixE,
		f: 0 as TMatrixF,
		x: 0 as TCoordinateX,
		y: 0 as TCoordinateY,
		z: 0 as TCoordinateZ,
	};
}

/**
 * Matrix multiplication for 2D matrices
 * @param a - First matrix
 * @param b - Second matrix
 * @returns Matrix product a * b
 */
export function multiplyMatrices2D(a: IMatrix2D, b: IMatrix2D): IMatrix2D {
	return {
		a: (Number(a.a) * Number(b.a) + Number(a.c) * Number(b.b)) as TMatrixA,
		b: (Number(a.b) * Number(b.a) + Number(a.d) * Number(b.b)) as TMatrixB,
		c: (Number(a.a) * Number(b.c) + Number(a.c) * Number(b.d)) as TMatrixC,
		d: (Number(a.b) * Number(b.c) + Number(a.d) * Number(b.d)) as TMatrixD,
		e: (Number(a.a) * Number(b.e) +
			Number(a.c) * Number(b.f) +
			Number(a.e)) as TMatrixE,
		f: (Number(a.b) * Number(b.e) +
			Number(a.d) * Number(b.f) +
			Number(a.f)) as TMatrixF,
	};
}

/**
 * Matrix multiplication for 3D matrices
 * @param a - First matrix
 * @param b - Second matrix
 * @returns Matrix product a * b
 */
export function multiplyMatrices3D(a: IMatrix3D, b: IMatrix3D): IMatrix3D {
	return {
		a: (Number(a.a) * Number(b.a) + Number(a.c) * Number(b.b)) as TMatrixA,
		b: (Number(a.b) * Number(b.a) + Number(a.d) * Number(b.b)) as TMatrixB,
		c: (Number(a.a) * Number(b.c) + Number(a.c) * Number(b.d)) as TMatrixC,
		d: (Number(a.b) * Number(b.c) + Number(a.d) * Number(b.d)) as TMatrixD,
		e: (Number(a.a) * Number(b.e) +
			Number(a.c) * Number(b.f) +
			Number(a.e)) as TMatrixE,
		f: (Number(a.b) * Number(b.e) +
			Number(a.d) * Number(b.f) +
			Number(a.f)) as TMatrixF,
		x: (Number(a.a) * Number(b.x) +
			Number(a.c) * Number(b.y) +
			Number(a.e)) as TCoordinateX,
		y: (Number(a.b) * Number(b.x) +
			Number(a.d) * Number(b.y) +
			Number(a.f)) as TCoordinateY,
		z: Number(a.z) as TCoordinateZ,
	};
}

/**
 * Transform 2D vector using 2D matrix
 * @param vector - Vector to transform
 * @param matrix - Transformation matrix
 * @returns Transformed vector
 */
export function transformVector2D(vector: IVector, matrix: IMatrix2D): IVector {
	const x = Number(vector.x);
	const y = Number(vector.y);

	return {
		x: (Number(matrix.a) * x +
			Number(matrix.c) * y +
			Number(matrix.e)) as TCoordinateX,
		y: (Number(matrix.b) * x +
			Number(matrix.d) * y +
			Number(matrix.f)) as TCoordinateY,
		...(vector.z !== undefined && { z: vector.z }),
	};
}

/**
 * Transform 3D vector using 3D matrix
 * @param vector - Vector to transform
 * @param matrix - Transformation matrix
 * @returns Transformed vector
 */
export function transformVector3D(vector: IVector, matrix: IMatrix3D): IVector {
	const x = Number(vector.x);
	const y = Number(vector.y);
	const z = vector.z ? Number(vector.z) : 0;

	return {
		x: (Number(matrix.a) * x +
			Number(matrix.c) * y +
			Number(matrix.e)) as TCoordinateX,
		y: (Number(matrix.b) * x +
			Number(matrix.d) * y +
			Number(matrix.f)) as TCoordinateY,
		z: (Number(matrix.z) * z) as TCoordinateZ,
	};
}

/**
 * Get inverse of 2D matrix
 * @param matrix - Matrix to invert
 * @returns Inverse matrix
 * @throws Error if matrix is not invertible
 */
export function invertMatrix2D(matrix: IMatrix2D): IMatrix2D {
	const det =
		Number(matrix.a) * Number(matrix.d) - Number(matrix.b) * Number(matrix.c);

	if (Math.abs(det) < 1e-10) {
		throw new Error("Matrix is not invertible");
	}

	const invDet = 1 / det;

	return {
		a: (Number(matrix.d) * invDet) as TMatrixA,
		b: (-Number(matrix.b) * invDet) as TMatrixB,
		c: (-Number(matrix.c) * invDet) as TMatrixC,
		d: (Number(matrix.a) * invDet) as TMatrixD,
		e: ((Number(matrix.c) * Number(matrix.f) -
			Number(matrix.d) * Number(matrix.e)) *
			invDet) as TMatrixE,
		f: ((Number(matrix.b) * Number(matrix.e) -
			Number(matrix.a) * Number(matrix.f)) *
			invDet) as TMatrixF,
	};
}

/**
 * Get inverse of 3D matrix (simplified case for affine transformations)
 * @param matrix - Matrix to invert
 * @returns Inverse matrix
 * @throws Error if matrix is not invertible
 */
export function invertMatrix3D(matrix: IMatrix3D): IMatrix3D {
	// For affine transformations, we can compute the inverse
	const det2D =
		Number(matrix.a) * Number(matrix.d) - Number(matrix.b) * Number(matrix.c);

	if (Math.abs(det2D) < 1e-10) {
		throw new Error("Matrix is not invertible");
	}

	const invDet = 1 / det2D;

	return {
		a: (Number(matrix.d) * invDet) as TMatrixA,
		b: (-Number(matrix.b) * invDet) as TMatrixB,
		c: (-Number(matrix.c) * invDet) as TMatrixC,
		d: (Number(matrix.a) * invDet) as TMatrixD,
		e: ((Number(matrix.c) * Number(matrix.f) -
			Number(matrix.d) * Number(matrix.e)) *
			invDet) as TMatrixE,
		f: ((Number(matrix.b) * Number(matrix.e) -
			Number(matrix.a) * Number(matrix.f)) *
			invDet) as TMatrixF,
		x: 0 as TCoordinateX, // Simplified for affine case
		y: 0 as TCoordinateY, // Simplified for affine case
		z: (1 / Number(matrix.z)) as TCoordinateZ,
	};
}

/**
 * Compose multiple 2D transformations (applies them in reverse order)
 * @param matrices - Matrices to compose (applied right to left)
 * @returns Composed transformation matrix
 */
export function composeMatrices2D(...matrices: IMatrix2D[]): IMatrix2D {
	return matrices.reduce(
		(acc, matrix) => multiplyMatrices2D(acc, matrix),
		IDENTITY_2D,
	);
}

/**
 * Compose multiple 3D transformations (applies them in reverse order)
 * @param matrices - Matrices to compose (applied right to left)
 * @returns Composed transformation matrix
 */
export function composeMatrices3D(...matrices: IMatrix3D[]): IMatrix3D {
	return matrices.reduce(
		(acc, matrix) => multiplyMatrices3D(acc, matrix),
		IDENTITY_3D,
	);
}

/**
 * Extract translation components from 2D matrix
 * @param matrix - Transformation matrix
 * @returns Translation vector
 */
export function getTranslation2D(matrix: IMatrix2D): IVector {
	return {
		x: matrix.e as number as TCoordinateX,
		y: matrix.f as number as TCoordinateY,
	};
}

/**
 * Extract translation components from 3D matrix
 * @param matrix - Transformation matrix
 * @returns Translation vector
 */
export function getTranslation3D(matrix: IMatrix3D): IVector {
	return {
		x: matrix.x,
		y: matrix.y,
		z: matrix.z,
	};
}

/**
 * Extract scale components from 2D matrix
 * @param matrix - Transformation matrix
 * @returns Scale vector
 */
export function getScale2D(matrix: IMatrix2D): IVector {
	// Scale is magnitude of basis vectors
	const scaleX = Math.sqrt(
		Number(matrix.a) * Number(matrix.a) + Number(matrix.b) * Number(matrix.b),
	);
	const scaleY = Math.sqrt(
		Number(matrix.c) * Number(matrix.c) + Number(matrix.d) * Number(matrix.d),
	);

	return {
		x: scaleX as TCoordinateX,
		y: scaleY as TCoordinateY,
	};
}

/**
 * Extract rotation angle from 2D matrix
 * @param matrix - Transformation matrix
 * @returns Rotation angle in radians
 */
export function getRotation2D(matrix: IMatrix2D): TAngleRad {
	const angle = Math.atan2(Number(matrix.b), Number(matrix.a));
	return angle as TAngleRad;
}

/**
 * Check if 2D matrix is identity (within epsilon)
 * @param matrix - Matrix to check
 * @param epsilon - Tolerance (default: 1e-10)
 * @returns True if matrix is approximately identity
 */
export function isIdentity2D(
	matrix: IMatrix2D,
	epsilon: number = 1e-10,
): boolean {
	return (
		Math.abs(Number(matrix.a) - 1) < epsilon &&
		Math.abs(Number(matrix.b)) < epsilon &&
		Math.abs(Number(matrix.c)) < epsilon &&
		Math.abs(Number(matrix.d) - 1) < epsilon &&
		Math.abs(Number(matrix.e)) < epsilon &&
		Math.abs(Number(matrix.f)) < epsilon
	);
}

/**
 * Check if 3D matrix is identity (within epsilon)
 * @param matrix - Matrix to check
 * @param epsilon - Tolerance (default: 1e-10)
 * @returns True if matrix is approximately identity
 */
export function isIdentity3D(
	matrix: IMatrix3D,
	epsilon: number = 1e-10,
): boolean {
	return (
		isIdentity2D(matrix, epsilon) &&
		Math.abs(Number(matrix.x)) < epsilon &&
		Math.abs(Number(matrix.y)) < epsilon &&
		Math.abs(Number(matrix.z) - 1) < epsilon
	);
}

/**
 * Linear interpolation between two 2D matrices
 * @param a - Start matrix
 * @param b - End matrix
 * @param t - Interpolation factor (0 = a, 1 = b)
 * @returns Interpolated matrix
 */
export function lerpMatrices2D(
	a: IMatrix2D,
	b: IMatrix2D,
	t: number,
): IMatrix2D {
	const clampedT = Math.max(0, Math.min(1, t));

	return {
		a: (Number(a.a) + (Number(b.a) - Number(a.a)) * clampedT) as TMatrixA,
		b: (Number(a.b) + (Number(b.b) - Number(a.b)) * clampedT) as TMatrixB,
		c: (Number(a.c) + (Number(b.c) - Number(a.c)) * clampedT) as TMatrixC,
		d: (Number(a.d) + (Number(b.d) - Number(a.d)) * clampedT) as TMatrixD,
		e: (Number(a.e) + (Number(b.e) - Number(a.e)) * clampedT) as TMatrixE,
		f: (Number(a.f) + (Number(b.f) - Number(a.f)) * clampedT) as TMatrixF,
	};
}

/**
 * Linear interpolation between two 3D matrices
 * @param a - Start matrix
 * @param b - End matrix
 * @param t - Interpolation factor (0 = a, 1 = b)
 * @returns Interpolated matrix
 */
export function lerpMatrices3D(
	a: IMatrix3D,
	b: IMatrix3D,
	t: number,
): IMatrix3D {
	const clampedT = Math.max(0, Math.min(1, t));

	return {
		a: (Number(a.a) + (Number(b.a) - Number(a.a)) * clampedT) as TMatrixA,
		b: (Number(a.b) + (Number(b.b) - Number(a.b)) * clampedT) as TMatrixB,
		c: (Number(a.c) + (Number(b.c) - Number(a.c)) * clampedT) as TMatrixC,
		d: (Number(a.d) + (Number(b.d) - Number(a.d)) * clampedT) as TMatrixD,
		e: (Number(a.e) + (Number(b.e) - Number(a.e)) * clampedT) as TMatrixE,
		f: (Number(a.f) + (Number(b.f) - Number(a.f)) * clampedT) as TMatrixF,
		x: (Number(a.x) + (Number(b.x) - Number(a.x)) * clampedT) as TCoordinateX,
		y: (Number(a.y) + (Number(b.y) - Number(a.y)) * clampedT) as TCoordinateY,
		z: (Number(a.z) + (Number(b.z) - Number(a.z)) * clampedT) as TCoordinateZ,
	};
}
