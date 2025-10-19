/**
 * @fileoverview Common geometric calculations and helper functions
 * Pure functions optimized for tree-shaking and type safety
 */

import type {
	TAngleRad,
	TArea,
	TCoordinate,
	TCoordinateX,
	TCoordinateY,
	TCoordinateZ,
	TDepth,
	TDistance,
	THeight,
	TVolume,
	TWidth,
} from "../../types/base-types";

import type { IVector } from "./vector-ops";

/**
 * 2D point interface using branded coordinates
 */
export interface IPoint2D {
	readonly x: TCoordinateX;
	readonly y: TCoordinateY;
}

/**
 * 3D point interface using branded coordinates
 */
export interface IPoint3D extends IPoint2D {
	readonly z: TCoordinateZ;
}

/**
 * Rectangle bounds interface
 */
export interface IRectangle {
	readonly x: TCoordinateX;
	readonly y: TCoordinateY;
	readonly width: TWidth;
	readonly height: THeight;
}

/**
 * 3D box bounds interface
 */
export interface IBox3D extends IRectangle {
	readonly z: TCoordinateZ;
	readonly depth: TDepth;
}

/**
 * Circle interface
 */
export interface ICircle {
	readonly center: IPoint2D;
	readonly radius: TDistance;
}

/**
 * Sphere interface
 */
export interface ISphere {
	readonly center: IPoint3D;
	readonly radius: TDistance;
}

/**
 * Line segment interface
 */
export interface ILineSegment {
	readonly start: IPoint2D;
	readonly end: IPoint2D;
}

/**
 * Distance between two 2D points
 * @param a - First point
 * @param b - Second point
 * @returns Distance between points
 */
export function distance2D(a: IPoint2D, b: IPoint2D): TDistance {
	const dx = a.x - b.x;
	const dy = a.y - b.y;
	return Math.sqrt(dx * dx + dy * dy) as TDistance;
}

/**
 * Distance between two 3D points
 * @param a - First point
 * @param b - Second point
 * @returns Distance between points
 */
export function distance3D(a: IPoint3D, b: IPoint3D): TDistance {
	const dx = a.x - b.x;
	const dy = a.y - b.y;
	const dz = a.z - b.z;
	return Math.sqrt(dx * dx + dy * dy + dz * dz) as TDistance;
}

/**
 * Manhattan distance between two 2D points
 * @param a - First point
 * @param b - Second point
 * @returns Manhattan distance
 */
export function manhattanDistance2D(a: IPoint2D, b: IPoint2D): TDistance {
	const dx = a.x > b.x ? a.x - b.x : b.x - a.x;
	const dy = a.y > b.y ? a.y - b.y : b.y - a.y;
	return (dx + dy) as TDistance;
}

/**
 * Manhattan distance between two 3D points
 * @param a - First point
 * @param b - Second point
 * @returns Manhattan distance
 */
export function manhattanDistance3D(a: IPoint3D, b: IPoint3D): TDistance {
	const dx = a.x > b.x ? a.x - b.x : b.x - a.x;
	const dy = a.y > b.y ? a.y - b.y : b.y - a.y;
	const dz = a.z > b.z ? a.z - b.z : b.z - a.z;
	return (dx + dy + dz) as TDistance;
}

/**
 * Check if two 2D points are approximately equal within epsilon
 * @param a - First point
 * @param b - Second point
 * @param epsilon - Tolerance (default: 1e-10)
 * @returns True if points are approximately equal
 */
export function pointsAlmostEqual2D(
	a: IPoint2D,
	b: IPoint2D,
	epsilon: number = 1e-10,
): boolean {
	return distance2D(a, b) < epsilon;
}

/**
 * Check if two 3D points are approximately equal within epsilon
 * @param a - First point
 * @param b - Second point
 * @param epsilon - Tolerance (default: 1e-10)
 * @returns True if points are approximately equal
 */
export function pointsAlmostEqual3D(
	a: IPoint3D,
	b: IPoint3D,
	epsilon: number = 1e-10,
): boolean {
	return distance3D(a, b) < epsilon;
}

/**
 * Calculate the midpoint between two 2D points
 * @param a - First point
 * @param b - Second point
 * @returns Midpoint
 */
export function midpoint2D(a: IPoint2D, b: IPoint2D): IPoint2D {
	const x = (a.x + b.x) / 2;
	const y = (a.y + b.y) / 2;
	return { x, y } as IPoint2D;
}

/**
 * Calculate the midpoint between two 3D points
 * @param a - First point
 * @param b - Second point
 * @returns Midpoint
 */
export function midpoint3D(a: IPoint3D, b: IPoint3D): IPoint3D {
	const x = (a.x + b.x) / 2;
	const y = (a.y + b.y) / 2;
	const z = (a.z + b.z) / 2;
	return { x, y, z } as IPoint3D;
}

/**
 * Calculate the centroid of multiple 2D points
 * @param points - Array of points
 * @returns Centroid point
 */
export function centroid2D(points: IPoint2D[]): IPoint2D {
	if (points.length === 0) {
		throw new Error("Cannot calculate centroid of empty point array");
	}

	const sum = points.reduce(
		(acc, point) =>
			({
				x: acc.x + point.x,
				y: acc.y + point.y,
			}) as IPoint2D,
		{ x: 0 as TCoordinateX, y: 0 as TCoordinateY },
	);

	const count = points.length;
	return {
		x: sum.x / count,
		y: sum.y / count,
	} as IPoint2D;
}

/**
 * Calculate the centroid of multiple 3D points
 * @param points - Array of points
 * @returns Centroid point
 */
export function centroid3D(points: IPoint3D[]): IPoint3D {
	if (points.length === 0) {
		throw new Error("Cannot calculate centroid of empty point array");
	}

	const sum = points.reduce(
		(acc, point) =>
			({
				x: acc.x + point.x,
				y: acc.y + point.y,
				z: acc.z + point.z,
			}) as IPoint3D,
		{ x: 0 as TCoordinateX, y: 0 as TCoordinateY, z: 0 as TCoordinateZ },
	);

	const count = points.length;
	return {
		x: sum.x / count,
		y: sum.y / count,
		z: sum.z / count,
	} as IPoint3D;
}

/**
 * Calculate area of a triangle defined by three 2D points
 * @param a - First vertex
 * @param b - Second vertex
 * @param c - Third vertex
 * @returns Area of triangle
 */
export function triangleArea2D(a: IPoint2D, b: IPoint2D, c: IPoint2D): TArea {
	// Using shoelace formula
	const area =
		Math.abs(a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y)) / 2;
	return area as TArea;
}

/**
 * Calculate area of a rectangle
 * @param rect - Rectangle bounds
 * @returns Area of rectangle
 */
export function rectangleArea(rect: IRectangle): TArea {
	return (rect.width * rect.height) as TArea;
}

/**
 * Calculate volume of a 3D box
 * @param box - Box bounds
 * @returns Volume of box
 */
export function boxVolume(box: IBox3D): TVolume {
	return (box.width * box.height * box.depth) as TVolume;
}

/**
 * Calculate circumference of a circle
 * @param circle - Circle definition
 * @returns Circumference
 */
export function circleCircumference(circle: ICircle): TDistance {
	return (2 * Math.PI * circle.radius) as TDistance;
}

/**
 * Calculate area of a circle
 * @param circle - Circle definition
 * @returns Area of circle
 */
export function circleArea(circle: ICircle): TArea {
	return (Math.PI * circle.radius * circle.radius) as TArea;
}

/**
 * Calculate surface area of a sphere
 * @param sphere - Sphere definition
 * @returns Surface area
 */
export function sphereSurfaceArea(sphere: ISphere): TArea {
	return (4 * Math.PI * sphere.radius * sphere.radius) as TArea;
}

/**
 * Calculate volume of a sphere
 * @param sphere - Sphere definition
 * @returns Volume of sphere
 */
export function sphereVolume(sphere: ISphere): TVolume {
	return ((4 / 3) * Math.PI * sphere.radius ** 3) as TVolume;
}

/**
 * Check if a 2D point is inside a circle
 * @param point - Point to test
 * @param circle - Circle to test against
 * @returns True if point is inside circle
 */
export function pointInCircle(point: IPoint2D, circle: ICircle): boolean {
	const dist = distance2D(point, circle.center);
	return dist <= circle.radius;
}

/**
 * Check if a 3D point is inside a sphere
 * @param point - Point to test
 * @param sphere - Sphere to test against
 * @returns True if point is inside sphere
 */
export function pointInSphere(point: IPoint3D, sphere: ISphere): boolean {
	const dist = distance3D(point, sphere.center);
	return dist <= sphere.radius;
}

/**
 * Check if a 2D point is inside a rectangle
 * @param point - Point to test
 * @param rect - Rectangle bounds
 * @returns True if point is inside rectangle
 */
export function pointInRectangle(point: IPoint2D, rect: IRectangle): boolean {
	return (
		point.x >= rect.x &&
		point.x <= rect.x + rect.width &&
		point.y >= rect.y &&
		point.y <= rect.y + rect.height
	);
}

/**
 * Check if a 3D point is inside a box
 * @param point - Point to test
 * @param box - Box bounds
 * @returns True if point is inside box
 */
export function pointInBox(point: IPoint3D, box: IBox3D): boolean {
	return (
		point.x >= box.x &&
		point.x <= box.x + box.width &&
		point.y >= box.y &&
		point.y <= box.y + box.height &&
		point.z >= box.z &&
		point.z <= box.z + box.depth
	);
}

/**
 * Calculate the bounding rectangle of multiple 2D points
 * @param points - Array of points
 * @returns Bounding rectangle
 */
export function boundingRectangle(points: IPoint2D[]): IRectangle {
	if (points.length === 0) {
		throw new Error("Cannot calculate bounding rectangle of empty point array");
	}

	let minX = points[0].x;
	let maxX = points[0].x;
	let minY = points[0].y;
	let maxY = points[0].y;

	for (let i = 1; i < points.length; i++) {
		const point = points[i];
		if (point.x < minX) minX = point.x;
		if (point.x > maxX) maxX = point.x;
		if (point.y < minY) minY = point.y;
		if (point.y > maxY) maxY = point.y;
	}

	return {
		x: minX,
		y: minY,
		width: maxX - minX,
		height: maxY - minY,
	} as IRectangle;
}

/**
 * Calculate the bounding box of multiple 3D points
 * @param points - Array of points
 * @returns Bounding box
 */
export function boundingBox(points: IPoint3D[]): IBox3D {
	if (points.length === 0) {
		throw new Error("Cannot calculate bounding box of empty point array");
	}

	let minX = points[0].x;
	let maxX = points[0].x;
	let minY = points[0].y;
	let maxY = points[0].y;
	let minZ = points[0].z;
	let maxZ = points[0].z;

	for (let i = 1; i < points.length; i++) {
		const point = points[i];
		if (point.x < minX) minX = point.x;
		if (point.x > maxX) maxX = point.x;
		if (point.y < minY) minY = point.y;
		if (point.y > maxY) maxY = point.y;
		if (point.z < minZ) minZ = point.z;
		if (point.z > maxZ) maxZ = point.z;
	}

	return {
		x: minX,
		y: minY,
		z: minZ,
		width: maxX - minX,
		height: maxY - minY,
		depth: maxZ - minZ,
	} as IBox3D;
}

/**
 * Calculate the length of a line segment
 * @param segment - Line segment
 * @returns Length of segment
 */
export function lineSegmentLength(segment: ILineSegment): TDistance {
	return distance2D(segment.start, segment.end);
}

/**
 * Calculate the direction vector of a line segment
 * @param segment - Line segment
 * @returns Direction vector (unit length)
 */
export function lineSegmentDirection(segment: ILineSegment): IVector {
	const dx = segment.end.x - segment.start.x;
	const dy = segment.end.y - segment.start.y;
	const length = Math.sqrt(dx * dx + dy * dy);

	if (length === 0) {
		return { x: 0 as TCoordinateX, y: 0 as TCoordinateY };
	}

	return {
		x: dx / length,
		y: dy / length,
	} as IPoint2D;
}

/**
 * Calculate the angle between two 2D vectors
 * @param a - First vector
 * @param b - Second vector
 * @returns Angle between vectors in radians
 */
export function angleBetweenVectors(a: IVector, b: IVector): TAngleRad {
	const dot = a.x * b.x + a.y * b.y + (a.z ? a.z * (b.z ?? 0) : 0);
	const magA = Math.sqrt(a.x * a.x + a.y * a.y + (a.z ? a.z * a.z : 0));
	const magB = Math.sqrt(b.x * b.x + b.y * b.y + (b.z ? b.z * b.z : 0));

	if (magA === 0 || magB === 0) {
		return 0 as TAngleRad;
	}

	const cos = dot / (magA * magB);
	const clampedCos = Math.max(-1, Math.min(1, cos));
	return Math.acos(clampedCos) as TAngleRad;
}

/**
 * Linear interpolation between two 2D points
 * @param a - Start point
 * @param b - End point
 * @param t - Interpolation factor (0 = a, 1 = b)
 * @returns Interpolated point
 */
export function lerpPoints2D(a: IPoint2D, b: IPoint2D, t: number): IPoint2D {
	const clampedT = Math.max(0, Math.min(1, t));
	const x = a.x + (b.x - a.x) * clampedT;
	const y = a.y + (b.y - a.y) * clampedT;

	return { x, y } as IPoint2D;
}

/**
 * Linear interpolation between two 3D points
 * @param a - Start point
 * @param b - End point
 * @param t - Interpolation factor (0 = a, 1 = b)
 * @returns Interpolated point
 */
export function lerpPoints3D(a: IPoint3D, b: IPoint3D, t: number): IPoint3D {
	const clampedT = Math.max(0, Math.min(1, t));
	const x = a.x + (b.x - a.x) * clampedT;
	const y = a.y + (b.y - a.y) * clampedT;
	const z = a.z + (b.z - a.z) * clampedT;

	return { x, y, z } as IPoint3D;
}

/**
 * Clamp a 2D point to rectangle bounds
 * @param point - Point to clamp
 * @param rect - Rectangle bounds
 * @returns Clamped point
 */
export function clampPointToRectangle(
	point: IPoint2D,
	rect: IRectangle,
): IPoint2D {
	const x =
		point.x < rect.x
			? rect.x
			: point.x > rect.x + rect.width
				? rect.x + rect.width
				: point.x;
	const y =
		point.y < rect.y
			? rect.y
			: point.y > rect.y + rect.height
				? rect.y + rect.height
				: point.y;

	return { x, y } as IPoint2D;
}

/**
 * Clamp a 3D point to box bounds
 * @param point - Point to clamp
 * @param box - Box bounds
 * @returns Clamped point
 */
export function clampPointToBox(point: IPoint3D, box: IBox3D): IPoint3D {
	const x =
		point.x < box.x
			? box.x
			: point.x > box.x + box.width
				? box.x + box.width
				: point.x;
	const y =
		point.y < box.y
			? box.y
			: point.y > box.y + box.height
				? box.y + box.height
				: point.y;
	const z =
		point.z < box.z
			? box.z
			: point.z > box.z + box.depth
				? box.z + box.depth
				: point.z;

	return { x, y, z } as IPoint3D;
}
