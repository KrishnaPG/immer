/**
 * @fileoverview Basis transition utilities for converting coordinates between different basis systems
 * Functions for transforming coordinates between various coordinate spaces and basis systems
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
	TScaleFactor,
} from "../../types/base-types";
import type { IMatrix2D, IMatrix3D } from "../math/matrix-ops";
import {
	invertMatrix2D,
	invertMatrix3D,
	multiplyMatrices2D,
	multiplyMatrices3D,
} from "../math/matrix-ops";
import type { IVector } from "../math/vector-ops";

/**
 * Basis system interface for coordinate transformations
 */
export interface IBasisSystem {
	readonly origin: IVector;
	readonly basisX: IVector;
	readonly basisY: IVector;
	readonly basisZ?: IVector;
}

/**
 * 2D coordinate system transformation
 */
export interface ICoordinateSystem2D {
	readonly origin: { x: TCoordinateX; y: TCoordinateY };
	readonly scale: { x: TScaleFactor; y: TScaleFactor };
	readonly rotation: TAngleRad;
}

/**
 * 3D coordinate system transformation
 */
export interface ICoordinateSystem3D extends ICoordinateSystem2D {
	readonly z: TCoordinateZ;
	readonly scaleZ: TScaleFactor;
	readonly rotationX: TAngleRad;
	readonly rotationY: TAngleRad;
}

/**
 * Convert a point from one 2D basis system to another
 * @param point - Point in source basis
 * @param fromBasis - Source basis system
 * @param toBasis - Target basis system
 * @returns Point in target basis coordinates
 */
export function convertBasis2D(
	point: IVector,
	fromBasis: IBasisSystem,
	toBasis: IBasisSystem,
): IVector {
	// First, convert from source basis to world coordinates
	const worldPoint = basisToWorld2D(point, fromBasis);

	// Then, convert from world coordinates to target basis
	return worldToBasis2D(worldPoint, toBasis);
}

/**
 * Convert a point from one 3D basis system to another
 * @param point - Point in source basis
 * @param fromBasis - Source basis system
 * @param toBasis - Target basis system
 * @returns Point in target basis coordinates
 */
export function convertBasis3D(
	point: IVector,
	fromBasis: IBasisSystem,
	toBasis: IBasisSystem,
): IVector {
	// First, convert from source basis to world coordinates
	const worldPoint = basisToWorld3D(point, fromBasis);

	// Then, convert from world coordinates to target basis
	return worldToBasis3D(worldPoint, toBasis);
}

/**
 * Convert a point from basis coordinates to world coordinates (2D)
 * @param point - Point in basis coordinates
 * @param basis - Basis system definition
 * @returns Point in world coordinates
 */
export function basisToWorld2D(point: IVector, basis: IBasisSystem): IVector {
	// Linear combination of basis vectors plus origin
	const worldX =
		Number(basis.origin.x) +
		Number(point.x) * Number(basis.basisX.x) +
		Number(point.y) * Number(basis.basisY.x);

	const worldY =
		Number(basis.origin.y) +
		Number(point.x) * Number(basis.basisX.y) +
		Number(point.y) * Number(basis.basisY.y);

	return {
		x: worldX as TCoordinateX,
		y: worldY as TCoordinateY,
	};
}

/**
 * Convert a point from basis coordinates to world coordinates (3D)
 * @param point - Point in basis coordinates
 * @param basis - Basis system definition
 * @returns Point in world coordinates
 */
export function basisToWorld3D(point: IVector, basis: IBasisSystem): IVector {
	// Linear combination of basis vectors plus origin
	const worldX =
		Number(basis.origin.x) +
		Number(point.x) * Number(basis.basisX.x) +
		Number(point.y) * Number(basis.basisY.x) +
		Number(point.z ?? 0) * Number(basis.basisZ?.x ?? 0);

	const worldY =
		Number(basis.origin.y) +
		Number(point.x) * Number(basis.basisX.y) +
		Number(point.y) * Number(basis.basisY.y) +
		Number(point.z ?? 0) * Number(basis.basisZ?.y ?? 0);

	const worldZ =
		Number(basis.origin.z ?? 0) +
		Number(point.x) * Number(basis.basisX.z ?? 0) +
		Number(point.y) * Number(basis.basisY.z ?? 0) +
		Number(point.z ?? 0) * Number(basis.basisZ?.z ?? 0);

	return {
		x: worldX as TCoordinateX,
		y: worldY as TCoordinateY,
		z: worldZ as TCoordinateZ,
	};
}

/**
 * Convert a point from world coordinates to basis coordinates (2D)
 * @param worldPoint - Point in world coordinates
 * @param basis - Target basis system
 * @returns Point in basis coordinates
 */
export function worldToBasis2D(
	worldPoint: IVector,
	basis: IBasisSystem,
): IVector {
	// Translate to origin
	const translatedX = Number(worldPoint.x) - Number(basis.origin.x);
	const translatedY = Number(worldPoint.y) - Number(basis.origin.y);

	// Project onto basis vectors
	// Using inverse of basis matrix for coordinate transformation
	const basisMatrix = [
		[Number(basis.basisX.x), Number(basis.basisY.x)],
		[Number(basis.basisX.y), Number(basis.basisY.y)],
	];

	const det =
		basisMatrix[0][0] * basisMatrix[1][1] -
		basisMatrix[0][1] * basisMatrix[1][0];

	if (Math.abs(det) < 1e-10) {
		throw new Error("Basis vectors are linearly dependent");
	}

	const invDet = 1 / det;
	const invMatrix = [
		[basisMatrix[1][1] * invDet, -basisMatrix[0][1] * invDet],
		[-basisMatrix[1][0] * invDet, basisMatrix[0][0] * invDet],
	];

	const basisX = translatedX * invMatrix[0][0] + translatedY * invMatrix[0][1];
	const basisY = translatedX * invMatrix[1][0] + translatedY * invMatrix[1][1];

	return {
		x: basisX as TCoordinateX,
		y: basisY as TCoordinateY,
	};
}

/**
 * Convert a point from world coordinates to basis coordinates (3D)
 * @param worldPoint - Point in world coordinates
 * @param basis - Target basis system
 * @returns Point in basis coordinates
 */
export function worldToBasis3D(
	worldPoint: IVector,
	basis: IBasisSystem,
): IVector {
	if (!basis.basisZ) {
		throw new Error("3D basis system requires Z basis vector");
	}

	// Translate to origin
	const translatedX = Number(worldPoint.x) - Number(basis.origin.x);
	const translatedY = Number(worldPoint.y) - Number(basis.origin.y);
	const translatedZ = Number(worldPoint.z ?? 0) - Number(basis.origin.z ?? 0);

	// Project onto basis vectors using matrix inversion
	const basisMatrix = [
		[Number(basis.basisX.x), Number(basis.basisY.x), Number(basis.basisZ.x)],
		[Number(basis.basisX.y), Number(basis.basisY.y), Number(basis.basisZ.y)],
		[
			Number(basis.basisX.z ?? 0),
			Number(basis.basisY.z ?? 0),
			Number(basis.basisZ.z),
		],
	];

	// Calculate determinant (simplified for 3x3)
	const det =
		basisMatrix[0][0] *
			(basisMatrix[1][1] * basisMatrix[2][2] -
				basisMatrix[1][2] * basisMatrix[2][1]) -
		basisMatrix[0][1] *
			(basisMatrix[1][0] * basisMatrix[2][2] -
				basisMatrix[1][2] * basisMatrix[2][0]) +
		basisMatrix[0][2] *
			(basisMatrix[1][0] * basisMatrix[2][1] -
				basisMatrix[1][1] * basisMatrix[2][0]);

	if (Math.abs(det) < 1e-10) {
		throw new Error("Basis vectors are linearly dependent");
	}

	// Calculate inverse matrix (simplified)
	const invDet = 1 / det;
	const invMatrix = [
		[
			(basisMatrix[1][1] * basisMatrix[2][2] -
				basisMatrix[1][2] * basisMatrix[2][1]) *
				invDet,
			-(
				basisMatrix[0][1] * basisMatrix[2][2] -
				basisMatrix[0][2] * basisMatrix[2][1]
			) * invDet,
			(basisMatrix[0][1] * basisMatrix[1][2] -
				basisMatrix[0][2] * basisMatrix[1][1]) *
				invDet,
		],
		[
			-(
				basisMatrix[1][0] * basisMatrix[2][2] -
				basisMatrix[1][2] * basisMatrix[2][0]
			) * invDet,
			(basisMatrix[0][0] * basisMatrix[2][2] -
				basisMatrix[0][2] * basisMatrix[2][0]) *
				invDet,
			-(
				basisMatrix[0][0] * basisMatrix[1][2] -
				basisMatrix[0][2] * basisMatrix[1][0]
			) * invDet,
		],
		[
			(basisMatrix[1][0] * basisMatrix[2][1] -
				basisMatrix[1][1] * basisMatrix[2][0]) *
				invDet,
			-(
				basisMatrix[0][0] * basisMatrix[2][1] -
				basisMatrix[0][1] * basisMatrix[2][0]
			) * invDet,
			(basisMatrix[0][0] * basisMatrix[1][1] -
				basisMatrix[0][1] * basisMatrix[1][0]) *
				invDet,
		],
	];

	const basisX =
		translatedX * invMatrix[0][0] +
		translatedY * invMatrix[0][1] +
		translatedZ * invMatrix[0][2];
	const basisY =
		translatedX * invMatrix[1][0] +
		translatedY * invMatrix[1][1] +
		translatedZ * invMatrix[1][2];
	const basisZ =
		translatedX * invMatrix[2][0] +
		translatedY * invMatrix[2][1] +
		translatedZ * invMatrix[2][2];

	return {
		x: basisX as TCoordinateX,
		y: basisY as TCoordinateY,
		z: basisZ as TCoordinateZ,
	};
}

/**
 * Create a transformation matrix from a basis system (2D)
 * @param basis - Basis system definition
 * @returns Transformation matrix
 */
export function basisToMatrix2D(basis: IBasisSystem): IMatrix2D {
	return {
		a: basis.basisX.x as number as TMatrixA,
		b: basis.basisX.y as number as TMatrixB,
		c: basis.basisY.x as number as TMatrixC,
		d: basis.basisY.y as number as TMatrixD,
		e: basis.origin.x as number as TMatrixE,
		f: basis.origin.y as number as TMatrixF,
	};
}

/**
 * Create a transformation matrix from a basis system (3D)
 * @param basis - Basis system definition
 * @returns Transformation matrix
 */
export function basisToMatrix3D(basis: IBasisSystem): IMatrix3D {
	if (!basis.basisZ) {
		throw new Error("3D basis system requires Z basis vector");
	}

	return {
		...basisToMatrix2D(basis),
		x: basis.origin.x as TCoordinateX,
		y: basis.origin.y as TCoordinateY,
		z: basis.basisZ.z as TCoordinateZ,
	};
}

/**
 * Create a basis system from a transformation matrix (2D)
 * @param matrix - Transformation matrix
 * @returns Basis system definition
 */
export function matrixToBasis2D(matrix: IMatrix2D): IBasisSystem {
	return {
		origin: {
			x: matrix.e as number as TCoordinateX,
			y: matrix.f as number as TCoordinateY,
		},
		basisX: {
			x: matrix.a as number as TCoordinateX,
			y: matrix.b as number as TCoordinateY,
		},
		basisY: {
			x: matrix.c as number as TCoordinateX,
			y: matrix.d as number as TCoordinateY,
		},
	};
}

/**
 * Create a basis system from a transformation matrix (3D)
 * @param matrix - Transformation matrix
 * @returns Basis system definition
 */
export function matrixToBasis3D(matrix: IMatrix3D): IBasisSystem {
	return {
		origin: {
			x: matrix.x,
			y: matrix.y,
			z: matrix.z,
		},
		basisX: {
			x: matrix.a as number as TCoordinateX,
			y: matrix.b as number as TCoordinateY,
			z: 0 as TCoordinateZ,
		},
		basisY: {
			x: matrix.c as number as TCoordinateX,
			y: matrix.d as number as TCoordinateY,
			z: 0 as TCoordinateZ,
		},
		basisZ: {
			x: 0 as TCoordinateX,
			y: 0 as TCoordinateY,
			z: 1 as TCoordinateZ,
		},
	};
}

/**
 * Compose two basis transformations (2D)
 * @param first - First basis transformation
 * @param second - Second basis transformation
 * @returns Composed basis transformation
 */
export function composeBasis2D(
	first: IBasisSystem,
	second: IBasisSystem,
): IBasisSystem {
	const firstMatrix = basisToMatrix2D(first);
	const secondMatrix = basisToMatrix2D(second);
	const composedMatrix = multiplyMatrices2D(firstMatrix, secondMatrix);

	return matrixToBasis2D(composedMatrix);
}

/**
 * Compose two basis transformations (3D)
 * @param first - First basis transformation
 * @param second - Second basis transformation
 * @returns Composed basis transformation
 */
export function composeBasis3D(
	first: IBasisSystem,
	second: IBasisSystem,
): IBasisSystem {
	const firstMatrix = basisToMatrix3D(first);
	const secondMatrix = basisToMatrix3D(second);
	const composedMatrix = multiplyMatrices3D(firstMatrix, secondMatrix);

	return matrixToBasis3D(composedMatrix);
}

/**
 * Invert a basis transformation (2D)
 * @param basis - Basis transformation to invert
 * @returns Inverted basis transformation
 */
export function invertBasis2D(basis: IBasisSystem): IBasisSystem {
	const matrix = basisToMatrix2D(basis);
	const invertedMatrix = invertMatrix2D(matrix);

	return matrixToBasis2D(invertedMatrix);
}

/**
 * Invert a basis transformation (3D)
 * @param basis - Basis transformation to invert
 * @returns Inverted basis transformation
 */
export function invertBasis3D(basis: IBasisSystem): IBasisSystem {
	const matrix = basisToMatrix3D(basis);
	const invertedMatrix = invertMatrix3D(matrix);

	return matrixToBasis3D(invertedMatrix);
}

/**
 * Create a standard Cartesian basis system
 * @param origin - Origin point (default: (0, 0) or (0, 0, 0))
 * @returns Standard basis system
 */
export function createCartesianBasis(
	origin: IVector = { x: 0 as TCoordinateX, y: 0 as TCoordinateY },
): IBasisSystem {
	return {
		origin,
		basisX: { x: 1 as TCoordinateX, y: 0 as TCoordinateY },
		basisY: { x: 0 as TCoordinateX, y: 1 as TCoordinateY },
		...(origin.z !== undefined && {
			basisZ: {
				x: 0 as TCoordinateX,
				y: 0 as TCoordinateY,
				z: 1 as TCoordinateZ,
			},
		}),
	};
}

/**
 * Create a rotated basis system (2D)
 * @param origin - Origin point
 * @param angle - Rotation angle in radians
 * @returns Rotated basis system
 */
export function createRotatedBasis2D(
	origin: IVector,
	angle: TAngleRad,
): IBasisSystem {
	const cos = Math.cos(Number(angle));
	const sin = Math.sin(Number(angle));

	return {
		origin,
		basisX: { x: cos as TCoordinateX, y: sin as TCoordinateY },
		basisY: { x: -sin as TCoordinateX, y: cos as TCoordinateY },
	};
}

/**
 * Create a scaled basis system (2D)
 * @param origin - Origin point
 * @param scaleX - Scale factor for X axis
 * @param scaleY - Scale factor for Y axis
 * @returns Scaled basis system
 */
export function createScaledBasis2D(
	origin: IVector,
	scaleX: TScaleFactor,
	scaleY: TScaleFactor,
): IBasisSystem {
	return {
		origin,
		basisX: { x: Number(scaleX) as TCoordinateX, y: 0 as TCoordinateY },
		basisY: { x: 0 as TCoordinateX, y: Number(scaleY) as TCoordinateY },
	};
}

/**
 * Create a sheared basis system (2D)
 * @param origin - Origin point
 * @param shearX - Shear factor for X axis
 * @param shearY - Shear factor for Y axis
 * @returns Sheared basis system
 */
export function createShearedBasis2D(
	origin: IVector,
	shearX: number,
	shearY: number,
): IBasisSystem {
	return {
		origin,
		basisX: { x: 1 as TCoordinateX, y: shearY as TCoordinateY },
		basisY: { x: shearX as TCoordinateX, y: 1 as TCoordinateY },
	};
}
