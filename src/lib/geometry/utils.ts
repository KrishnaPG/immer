import * as tf from "@tensorflow/tfjs";
import type { TAngle, TCoordinate, TScale } from "@/types/branded.types";
import { AABB } from "./aabb";
import { AffineMatrix } from "./matrix";
import { AffineTransform } from "./transform";
import type { Vector2D } from "./vector";

/**
 * Utility functions for geometric operations
 */

/**
 * Convert degrees to radians
 */
export function degToRad(degrees: number): number {
	return (degrees * Math.PI) / 180;
}

/**
 * Convert radians to degrees
 */
export function radToDeg(radians: number): number {
	return (radians * 180) / Math.PI;
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values
 */
export function lerp(a: number, b: number, t: number): number {
	return a + (b - a) * t;
}

/**
 * Map value from one range to another
 */
export function mapRange(
	value: number,
	fromMin: number,
	fromMax: number,
	toMin: number,
	toMax: number,
): number {
	return toMin + ((value - fromMin) * (toMax - toMin)) / (fromMax - fromMin);
}

/**
 * Check if two numbers are approximately equal within epsilon
 */
export function approximatelyEqual(
	a: number,
	b: number,
	epsilon: number = 1e-6,
): boolean {
	return Math.abs(a - b) < epsilon;
}

/**
 * Calculate distance between two points
 */
export function distance(
	x1: TCoordinate,
	y1: TCoordinate,
	x2: TCoordinate,
	y2: TCoordinate,
): number {
	const dx = (x2 as number) - (x1 as number);
	const dy = (y2 as number) - (y1 as number);
	return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate angle between two points
 */
export function angle(
	x1: TCoordinate,
	y1: TCoordinate,
	x2: TCoordinate,
	y2: TCoordinate,
): TAngle {
	return Math.atan2(
		(y2 as number) - (y1 as number),
		(x2 as number) - (x1 as number),
	) as TAngle;
}

/**
 * Normalize angle to [0, 2π) range
 */
export function normalizeAngle(angle: TAngle): TAngle {
	const twoPi = 2 * Math.PI;
	let normalized = (angle as number) % twoPi;
	if (normalized < 0) {
		normalized += twoPi;
	}
	return normalized as TAngle;
}

/**
 * Calculate shortest angle between two angles
 */
export function angleDifference(from: TAngle, to: TAngle): TAngle {
	const diff = (to as number) - (from as number);
	const twoPi = 2 * Math.PI;

	let normalized = diff % twoPi;
	if (normalized > Math.PI) {
		normalized -= twoPi;
	} else if (normalized < -Math.PI) {
		normalized += twoPi;
	}

	return normalized as TAngle;
}

/**
 * Create transformation matrix from components
 */
export function createTransformMatrix(
	translation: { x: TCoordinate; y: TCoordinate },
	rotation: TAngle,
	scale: { x: TScale; y: TScale },
	origin?: { x: TCoordinate; y: TCoordinate },
): AffineMatrix {
	// Start with identity
	let matrix = AffineMatrix.identity();

	// Apply translation to origin if specified
	if (origin) {
		const originTx = AffineMatrix.translation(
			-(origin.x as number),
			-(origin.y as number),
		);
		matrix = originTx.multiply(matrix);
	}

	// Apply scale
	const scaleMatrix = AffineMatrix.scaling(
		scale.x as number,
		scale.y as number,
	);
	matrix = scaleMatrix.multiply(matrix);

	// Apply rotation
	const rotationMatrix = AffineMatrix.rotation(rotation as number);
	matrix = rotationMatrix.multiply(matrix);

	// Apply translation back from origin if specified
	if (origin) {
		const originTxBack = AffineMatrix.translation(
			origin.x as number,
			origin.y as number,
		);
		matrix = originTxBack.multiply(matrix);
	}

	// Apply final translation
	const translationMatrix = AffineMatrix.translation(
		translation.x as number,
		translation.y as number,
	);
	matrix = translationMatrix.multiply(matrix);

	return matrix;
}

/**
 * Decompose transformation matrix into components
 */
export function decomposeTransform(matrix: AffineMatrix): {
	translation: { x: TCoordinate; y: TCoordinate };
	rotation: TAngle;
	scale: { x: TScale; y: TScale };
} {
	const values = matrix.tensor.dataSync();

	// Extract translation
	const translation = {
		x: values[2] as TCoordinate,
		y: values[5] as TCoordinate,
	};

	// Extract scale (approximate)
	const scaleX = Math.sqrt(values[0] * values[0] + values[3] * values[3]);
	const scaleY = Math.sqrt(values[1] * values[1] + values[4] * values[4]);

	// Extract rotation (approximate)
	const rotation = Math.atan2(values[3], values[0]);

	return {
		translation,
		rotation: rotation as TAngle,
		scale: {
			x: scaleX as TScale,
			y: scaleY as TScale,
		},
	};
}

/**
 * Create bounding box for a set of points
 */
export function createBoundingBox(points: Vector2D[]): AABB {
	if (points.length === 0) {
		throw new Error("Cannot create bounding box from empty point list");
	}

	let minX = points[0].x as number;
	let minY = points[0].y as number;
	let maxX = points[0].x as number;
	let maxY = points[0].y as number;

	for (let i = 1; i < points.length; i++) {
		const x = points[i].x as number;
		const y = points[i].y as number;

		minX = Math.min(minX, x);
		minY = Math.min(minY, y);
		maxX = Math.max(maxX, x);
		maxY = Math.max(maxY, y);
	}

	return new AABB(
		{ x: minX as TCoordinate, y: minY as TCoordinate },
		{ x: maxX as TCoordinate, y: maxY as TCoordinate },
	);
}

/**
 * Check if point is inside triangle
 */
export function pointInTriangle(
	point: Vector2D,
	v1: Vector2D,
	v2: Vector2D,
	v3: Vector2D,
): boolean {
	const area =
		(v1.x as number) * (v2.y as number) -
		(v1.y as number) * (v2.x as number) +
		(v2.x as number) * (v3.y as number) -
		(v2.y as number) * (v3.x as number) +
		(v3.x as number) * (v1.y as number) -
		(v3.y as number) * (v1.x as number);

	const s =
		(v1.x as number) * (v3.y as number) -
		(v1.y as number) * (v3.x as number) +
		(((v3.x as number) - v1.x) as number) * (point.y as number) -
		(((v3.y as number) - v1.y) as number) * (point.x as number);

	const t =
		(v2.x as number) * (v1.y as number) -
		(v2.y as number) * (v1.x as number) +
		(((v1.x as number) - v2.x) as number) * (point.y as number) -
		(((v1.y as number) - v2.y) as number) * (point.x as number);

	if (area < 0) {
		return s <= 0 && t <= 0 && s + t >= area;
	} else {
		return s >= 0 && t >= 0 && s + t <= area;
	}
}
