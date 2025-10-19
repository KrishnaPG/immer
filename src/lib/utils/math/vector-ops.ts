/**
 * @fileoverview Vector operations for 2D/3D vectors using branded types
 * Pure functions optimized for tree-shaking and type safety
 */

import type {
	TAngleRad,
	TCoordinate,
	TCoordinateX,
	TCoordinateY,
	TCoordinateZ,
	TDistance,
	TScaleFactor,
} from "../../types/base-types";

/**
 * 2D/3D Vector interface using branded coordinates
 */
export interface IVector {
	readonly x: TCoordinateX;
	readonly y: TCoordinateY;
	readonly z?: TCoordinateZ;
}

/**
 * Vector addition: adds two vectors component-wise
 * @param a - First vector
 * @param b - Second vector
 * @returns New vector representing a + b
 */
export function addVectors(a: IVector, b: IVector): IVector {
	const z = (a.z ?? 0) + (b.z ?? 0);
	return {
		x: (a.x + b.x) as TCoordinateX,
		y: (a.y + b.y) as TCoordinateY,
		...(z !== 0 && { z: z as TCoordinateZ }),
	};
}

/**
 * Vector subtraction: subtracts second vector from first
 * @param a - First vector
 * @param b - Second vector to subtract
 * @returns New vector representing a - b
 */
export function subtractVectors(a: IVector, b: IVector): IVector {
	const z = (a.z ?? 0) - (b.z ?? 0);
	return {
		x: (a.x - b.x) as TCoordinateX,
		y: (a.y - b.y) as TCoordinateY,
		...(z !== 0 && { z: z as TCoordinateZ }),
	};
}

/**
 * Scalar multiplication: scales vector by a factor
 * @param vector - Vector to scale
 * @param scalar - Scale factor
 * @returns New scaled vector
 */
export function scaleVector(vector: IVector, scalar: TScaleFactor): IVector {
	const scaledX = (Number(vector.x) * Number(scalar)) as TCoordinateX;
	const scaledY = (Number(vector.y) * Number(scalar)) as TCoordinateY;
	const scaledZ = vector.z
		? ((Number(vector.z) * Number(scalar)) as TCoordinateZ)
		: undefined;

	return {
		x: scaledX,
		y: scaledY,
		...(scaledZ !== undefined && { z: scaledZ }),
	};
}

/**
 * Vector negation: returns the negative of the vector
 * @param vector - Vector to negate
 * @returns New vector representing -vector
 */
export function negateVector(vector: IVector): IVector {
	return scaleVector(vector, -1 as TScaleFactor);
}

/**
 * Dot product: calculates scalar product of two vectors
 * @param a - First vector
 * @param b - Second vector
 * @returns Scalar dot product value
 */
export function dotProduct(a: IVector, b: IVector): TDistance {
	const aZ = a.z ?? 0;
	const bZ = b.z ?? 0;
	const result =
		Number(a.x) * Number(b.x) + Number(a.y) * Number(b.y) + aZ * bZ;
	return result as TDistance;
}

/**
 * Cross product for 2D vectors (returns scalar) or 3D vectors (returns vector)
 * @param a - First vector
 * @param b - Second vector
 * @returns Cross product (scalar for 2D, vector for 3D)
 */
export function crossProduct(a: IVector, b: IVector): TDistance | IVector {
	const aZ = a.z ?? 0;
	const bZ = b.z ?? 0;

	if (aZ === 0 && bZ === 0) {
		// 2D cross product (scalar)
		const result = Number(a.x) * Number(b.y) - Number(a.y) * Number(b.x);
		return result as TDistance;
	} else {
		// 3D cross product (vector)
		const x = (Number(a.y) * bZ - aZ * Number(b.y)) as TCoordinateX;
		const y = (aZ * Number(b.x) - Number(a.x) * bZ) as TCoordinateY;
		const z = (Number(a.x) * Number(b.y) -
			Number(a.y) * Number(b.x)) as TCoordinateZ;

		return { x, y, z };
	}
}

/**
 * Vector magnitude (Euclidean norm)
 * @param vector - Vector to measure
 * @returns Magnitude as distance
 */
export function vectorMagnitude(vector: IVector): TDistance {
	const x = Number(vector.x);
	const y = Number(vector.y);
	const z = vector.z ? Number(vector.z) : 0;
	const magnitude = Math.sqrt(x * x + y * y + z * z);
	return magnitude as TDistance;
}

/**
 * Vector normalization: returns unit vector in same direction
 * @param vector - Vector to normalize
 * @returns Unit vector (magnitude = 1)
 */
export function normalizeVector(vector: IVector): IVector {
	const magnitude = vectorMagnitude(vector);
	if (magnitude === 0) {
		throw new Error("Cannot normalize zero vector");
	}
	return scaleVector(vector, (1 / magnitude) as TScaleFactor);
}

/**
 * Vector rotation in 2D plane
 * @param vector - Vector to rotate
 * @param angle - Rotation angle in radians
 * @returns New rotated vector
 */
export function rotateVector2D(vector: IVector, angle: TAngleRad): IVector {
	const cos = Math.cos(Number(angle));
	const sin = Math.sin(Number(angle));
	const x = Number(vector.x);
	const y = Number(vector.y);

	const rotatedX = (x * cos - y * sin) as TCoordinateX;
	const rotatedY = (x * sin + y * cos) as TCoordinateY;

	return {
		x: rotatedX,
		y: rotatedY,
		...(vector.z !== undefined && { z: vector.z }),
	};
}

/**
 * Vector rotation around X-axis (3D)
 * @param vector - Vector to rotate
 * @param pitch - Rotation angle around X-axis in radians
 * @returns New rotated vector
 */
export function rotateVectorX(vector: IVector, pitch: TAngleRad): IVector {
	const cos = Math.cos(Number(pitch));
	const sin = Math.sin(Number(pitch));
	const y = Number(vector.y);
	const z = vector.z ? Number(vector.z) : 0;

	const rotatedY = (y * cos - z * sin) as TCoordinateY;
	const rotatedZ = (y * sin + z * cos) as TCoordinateZ;

	return {
		x: vector.x,
		y: rotatedY,
		z: rotatedZ,
	};
}

/**
 * Vector rotation around Y-axis (3D)
 * @param vector - Vector to rotate
 * @param yaw - Rotation angle around Y-axis in radians
 * @returns New rotated vector
 */
export function rotateVectorY(vector: IVector, yaw: TAngleRad): IVector {
	const cos = Math.cos(Number(yaw));
	const sin = Math.sin(Number(yaw));
	const x = Number(vector.x);
	const z = vector.z ? Number(vector.z) : 0;

	const rotatedX = (x * cos + z * sin) as TCoordinateX;
	const rotatedZ = (-x * sin + z * cos) as TCoordinateZ;

	return {
		x: rotatedX,
		y: vector.y,
		z: rotatedZ,
	};
}

/**
 * Vector rotation around Z-axis (3D)
 * @param vector - Vector to rotate
 * @param roll - Rotation angle around Z-axis in radians
 * @returns New rotated vector
 */
export function rotateVectorZ(vector: IVector, roll: TAngleRad): IVector {
	const cos = Math.cos(Number(roll));
	const sin = Math.sin(Number(roll));
	const x = Number(vector.x);
	const y = Number(vector.y);

	const rotatedX = (x * cos - y * sin) as TCoordinateX;
	const rotatedY = (x * sin + y * cos) as TCoordinateY;

	return {
		x: rotatedX,
		y: rotatedY,
		...(vector.z !== undefined && { z: vector.z }),
	};
}

/**
 * Combined rotation for 3D vectors
 * @param vector - Vector to rotate
 * @param roll - Rotation around Z-axis in radians
 * @param pitch - Rotation around X-axis in radians (optional)
 * @param yaw - Rotation around Y-axis in radians (optional)
 * @returns New rotated vector
 */
export function rotateVector3D(
	vector: IVector,
	roll: TAngleRad,
	pitch?: TAngleRad,
	yaw?: TAngleRad,
): IVector {
	let result = vector;

	// Apply rotations in order: roll (Z), pitch (X), yaw (Y)
	if (roll !== 0) {
		result = rotateVectorZ(result, roll);
	}
	if (pitch && pitch !== 0) {
		result = rotateVectorX(result, pitch);
	}
	if (yaw && yaw !== 0) {
		result = rotateVectorY(result, yaw);
	}

	return result;
}

/**
 * Distance between two points (as vectors from origin)
 * @param a - First point vector
 * @param b - Second point vector
 * @returns Distance between points
 */
export function distanceBetween(a: IVector, b: IVector): TDistance {
	const diff = subtractVectors(a, b);
	return vectorMagnitude(diff);
}

/**
 * Linear interpolation between two vectors
 * @param a - Start vector
 * @param b - End vector
 * @param t - Interpolation factor (0 = a, 1 = b)
 * @returns Interpolated vector
 */
export function lerpVectors(a: IVector, b: IVector, t: number): IVector {
	const clampedT = Math.max(0, Math.min(1, t));
	const diff = subtractVectors(b, a);
	const scaledDiff = scaleVector(diff, clampedT as TScaleFactor);
	return addVectors(a, scaledDiff);
}

/**
 * Check if two vectors are approximately equal within epsilon
 * @param a - First vector
 * @param b - Second vector
 * @param epsilon - Tolerance for comparison (default: 1e-10)
 * @returns True if vectors are approximately equal
 */
export function vectorsAlmostEqual(
	a: IVector,
	b: IVector,
	epsilon: number = 1e-10,
): boolean {
	const diff = subtractVectors(a, b);
	const magnitude = vectorMagnitude(diff);
	return Number(magnitude) < epsilon;
}

/**
 * Create vector from polar coordinates (2D)
 * @param magnitude - Vector magnitude
 * @param angle - Angle in radians
 * @returns Vector in Cartesian coordinates
 */
export function vectorFromPolar(
	magnitude: TDistance,
	angle: TAngleRad,
): IVector {
	const x = (Number(magnitude) * Math.cos(Number(angle))) as TCoordinateX;
	const y = (Number(magnitude) * Math.sin(Number(angle))) as TCoordinateY;
	return { x, y };
}

/**
 * Create vector from spherical coordinates (3D)
 * @param magnitude - Vector magnitude
 * @param theta - Azimuthal angle in radians (around Z-axis)
 * @param phi - Polar angle in radians (from Z-axis)
 * @returns Vector in Cartesian coordinates
 */
export function vectorFromSpherical(
	magnitude: TDistance,
	theta: TAngleRad,
	phi: TAngleRad,
): IVector {
	const mag = Number(magnitude);
	const x = (mag *
		Math.sin(Number(phi)) *
		Math.cos(Number(theta))) as TCoordinateX;
	const y = (mag *
		Math.sin(Number(phi)) *
		Math.sin(Number(theta))) as TCoordinateY;
	const z = (mag * Math.cos(Number(phi))) as TCoordinateZ;

	return { x, y, z };
}

/**
 * Get polar coordinates from vector (2D)
 * @param vector - Input vector
 * @returns Object with magnitude and angle
 */
export function vectorToPolar(vector: IVector): {
	magnitude: TDistance;
	angle: TAngleRad;
} {
	const magnitude = vectorMagnitude(vector);
	const angle = Math.atan2(Number(vector.y), Number(vector.x)) as TAngleRad;
	return { magnitude, angle };
}

/**
 * Get spherical coordinates from vector (3D)
 * @param vector - Input vector
 * @returns Object with magnitude, theta, and phi
 */
export function vectorToSpherical(vector: IVector): {
	magnitude: TDistance;
	theta: TAngleRad;
	phi: TAngleRad;
} {
	const magnitude = vectorMagnitude(vector);
	const theta = Math.atan2(Number(vector.y), Number(vector.x)) as TAngleRad;
	const phi = Math.acos(Number(vector.z ?? 0) / Number(magnitude)) as TAngleRad;

	return { magnitude, theta, phi };
}
