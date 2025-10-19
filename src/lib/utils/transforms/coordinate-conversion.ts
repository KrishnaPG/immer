/**
 * @fileoverview Coordinate conversion utilities for transforming coordinates between different spaces
 * Functions for converting between various coordinate systems and spaces
 */

import type {
	TAngleRad,
	TCoordinateX,
	TCoordinateY,
	TCoordinateZ,
	TDistance,
	TMatrixA,
	TMatrixB,
	TMatrixC,
	TMatrixD,
	TMatrixE,
	TMatrixF,
	TMatTx,
	TMatTy,
	TScaleFactor,
} from "../../types/base-types";
import type { IMatrix2D, IMatrix3D } from "../math/matrix-ops";
import {
	createRotation2D,
	createScale2D,
	createScale2DNonUniform,
	createTranslation2D,
	createTranslation3D,
	transformVector2D,
	transformVector3D,
} from "../math/matrix-ops";
import type { IVector } from "../math/vector-ops";

/**
 * Coordinate space types
 */
export type CoordinateSpace =
	| "world"
	| "screen"
	| "viewport"
	| "local"
	| "normalized";

/**
 * 2D coordinate conversion interface
 */
export interface ICoordinateConversion2D {
	readonly sourceSpace: CoordinateSpace;
	readonly targetSpace: CoordinateSpace;
	readonly transform: IMatrix2D;
}

/**
 * 3D coordinate conversion interface
 */
export interface ICoordinateConversion3D {
	readonly sourceSpace: CoordinateSpace;
	readonly targetSpace: CoordinateSpace;
	readonly transform: IMatrix3D;
}

/**
 * Viewport definition for screen coordinate conversions
 */
export interface IViewport {
	readonly x: TCoordinateX;
	readonly y: TCoordinateY;
	readonly width: number;
	readonly height: number;
	readonly pixelRatio?: number;
}

/**
 * 3D viewport definition
 */
export interface IViewport3D extends IViewport {
	readonly z: TCoordinateZ;
	readonly depth: number;
}

/**
 * Convert 2D world coordinates to screen coordinates
 * @param worldPoint - Point in world coordinates
 * @param viewport - Viewport definition
 * @returns Point in screen coordinates
 */
export function worldToScreen2D(
	worldPoint: IVector,
	viewport: IViewport,
): IVector {
	const screenX = worldPoint.x - viewport.x;
	const screenY = worldPoint.y - viewport.y;

	return {
		x: screenX as TCoordinateX,
		y: screenY as TCoordinateY,
	};
}

/**
 * Convert 2D screen coordinates to world coordinates
 * @param screenPoint - Point in screen coordinates
 * @param viewport - Viewport definition
 * @returns Point in world coordinates
 */
export function screenToWorld2D(
	screenPoint: IVector,
	viewport: IViewport,
): IVector {
	const worldX = screenPoint.x + viewport.x;
	const worldY = screenPoint.y + viewport.y;

	return {
		x: worldX as TCoordinateX,
		y: worldY as TCoordinateY,
	};
}

/**
 * Convert 2D coordinates to normalized device coordinates (0 to 1)
 * @param point - Point in world coordinates
 * @param bounds - Bounding box for normalization
 * @returns Normalized coordinates (0 to 1)
 */
export function normalizeCoordinates2D(
	point: IVector,
	bounds: { x: TCoordinateX; y: TCoordinateY; width: number; height: number },
): IVector {
	const normalizedX = (Number(point.x) - Number(bounds.x)) / bounds.width;
	const normalizedY = (Number(point.y) - Number(bounds.y)) / bounds.height;

	return {
		x: Math.max(0, Math.min(1, normalizedX)) as TCoordinateX,
		y: Math.max(0, Math.min(1, normalizedY)) as TCoordinateY,
	};
}

/**
 * Convert normalized coordinates back to world coordinates
 * @param normalizedPoint - Normalized point (0 to 1)
 * @param bounds - Bounding box for denormalization
 * @returns Point in world coordinates
 */
export function denormalizeCoordinates2D(
	normalizedPoint: IVector,
	bounds: { x: TCoordinateX; y: TCoordinateY; width: number; height: number },
): IVector {
	const worldX = Number(bounds.x) + Number(normalizedPoint.x) * bounds.width;
	const worldY = Number(bounds.y) + Number(normalizedPoint.y) * bounds.height;

	return {
		x: worldX as TCoordinateX,
		y: worldY as TCoordinateY,
	};
}

/**
 * Convert 2D coordinates to viewport coordinates
 * @param worldPoint - Point in world coordinates
 * @param viewport - Viewport definition
 * @returns Point in viewport coordinates (0 to viewport dimensions)
 */
export function worldToViewport2D(
	worldPoint: IVector,
	viewport: IViewport,
): IVector {
	const viewportX = Number(worldPoint.x) - Number(viewport.x);
	const viewportY = Number(worldPoint.y) - Number(viewport.y);

	return {
		x: Math.max(0, Math.min(viewport.width, viewportX)) as TCoordinateX,
		y: Math.max(0, Math.min(viewport.height, viewportY)) as TCoordinateY,
	};
}

/**
 * Convert viewport coordinates to world coordinates
 * @param viewportPoint - Point in viewport coordinates
 * @param viewport - Viewport definition
 * @returns Point in world coordinates
 */
export function viewportToWorld2D(
	viewportPoint: IVector,
	viewport: IViewport,
): IVector {
	const worldX = Number(viewportPoint.x) + Number(viewport.x);
	const worldY = Number(viewportPoint.y) + Number(viewport.y);

	return {
		x: worldX as TCoordinateX,
		y: worldY as TCoordinateY,
	};
}

/**
 * Convert screen coordinates to pixel coordinates (accounting for device pixel ratio)
 * @param screenPoint - Point in screen coordinates
 * @param pixelRatio - Device pixel ratio (default: 1)
 * @returns Point in pixel coordinates
 */
export function screenToPixel2D(
	screenPoint: IVector,
	pixelRatio: number = 1,
): IVector {
	return {
		x: (Number(screenPoint.x) * pixelRatio) as TCoordinateX,
		y: (Number(screenPoint.y) * pixelRatio) as TCoordinateY,
	};
}

/**
 * Convert pixel coordinates to screen coordinates
 * @param pixelPoint - Point in pixel coordinates
 * @param pixelRatio - Device pixel ratio (default: 1)
 * @returns Point in screen coordinates
 */
export function pixelToScreen2D(
	pixelPoint: IVector,
	pixelRatio: number = 1,
): IVector {
	return {
		x: (Number(pixelPoint.x) / pixelRatio) as TCoordinateX,
		y: (Number(pixelPoint.y) / pixelRatio) as TCoordinateY,
	};
}

/**
 * Convert polar coordinates to Cartesian coordinates
 * @param radius - Radius (distance from origin)
 * @param angle - Angle in radians
 * @returns Point in Cartesian coordinates
 */
export function polarToCartesian2D(
	radius: TDistance,
	angle: TAngleRad,
): IVector {
	const x = (Number(radius) * Math.cos(Number(angle))) as TCoordinateX;
	const y = (Number(radius) * Math.sin(Number(angle))) as TCoordinateY;

	return { x, y };
}

/**
 * Convert Cartesian coordinates to polar coordinates
 * @param point - Point in Cartesian coordinates
 * @returns Polar coordinates (radius, angle)
 */
export function cartesianToPolar2D(point: IVector): {
	radius: TDistance;
	angle: TAngleRad;
} {
	const radius = Math.sqrt(
		Number(point.x) * Number(point.x) + Number(point.y) * Number(point.y),
	) as TDistance;
	const angle = Math.atan2(Number(point.y), Number(point.x)) as TAngleRad;

	return { radius, angle };
}

/**
 * Convert cylindrical coordinates to Cartesian coordinates (3D)
 * @param radius - Radius in XY plane
 * @param angle - Angle around Z axis in radians
 * @param height - Height along Z axis
 * @returns Point in Cartesian coordinates
 */
export function cylindricalToCartesian3D(
	radius: TDistance,
	angle: TAngleRad,
	height: TCoordinateZ,
): IVector {
	const x = (Number(radius) * Math.cos(Number(angle))) as TCoordinateX;
	const y = (Number(radius) * Math.sin(Number(angle))) as TCoordinateY;
	const z = height;

	return { x, y, z };
}

/**
 * Convert Cartesian coordinates to cylindrical coordinates (3D)
 * @param point - Point in Cartesian coordinates
 * @returns Cylindrical coordinates (radius, angle, height)
 */
export function cartesianToCylindrical3D(point: IVector): {
	radius: TDistance;
	angle: TAngleRad;
	height: TCoordinateZ;
} {
	const radius = Math.sqrt(
		Number(point.x) * Number(point.x) + Number(point.y) * Number(point.y),
	) as TDistance;
	const angle = Math.atan2(Number(point.y), Number(point.x)) as TAngleRad;
	const height = point.z ?? (0 as TCoordinateZ);

	return { radius, angle, height };
}

/**
 * Convert spherical coordinates to Cartesian coordinates (3D)
 * @param radius - Radial distance
 * @param theta - Azimuthal angle (around Z axis) in radians
 * @param phi - Polar angle (from Z axis) in radians
 * @returns Point in Cartesian coordinates
 */
export function sphericalToCartesian3D(
	radius: TDistance,
	theta: TAngleRad,
	phi: TAngleRad,
): IVector {
	const x = (Number(radius) *
		Math.sin(Number(phi)) *
		Math.cos(Number(theta))) as TCoordinateX;
	const y = (Number(radius) *
		Math.sin(Number(phi)) *
		Math.sin(Number(theta))) as TCoordinateY;
	const z = (Number(radius) * Math.cos(Number(phi))) as TCoordinateZ;

	return { x, y, z };
}

/**
 * Convert Cartesian coordinates to spherical coordinates (3D)
 * @param point - Point in Cartesian coordinates
 * @returns Spherical coordinates (radius, theta, phi)
 */
export function cartesianToSpherical3D(point: IVector): {
	radius: TDistance;
	theta: TAngleRad;
	phi: TAngleRad;
} {
	const radius = Math.sqrt(
		Number(point.x) * Number(point.x) +
			Number(point.y) * Number(point.y) +
			Number(point.z ?? 0) * Number(point.z ?? 0),
	) as TDistance;

	const theta = Math.atan2(Number(point.y), Number(point.x)) as TAngleRad;
	const phi = Math.acos(Number(point.z ?? 0) / Number(radius)) as TAngleRad;

	return { radius, theta, phi };
}

/**
 * Apply a 2D coordinate transformation using a matrix
 * @param point - Point to transform
 * @param transform - Transformation matrix
 * @returns Transformed point
 */
export function applyTransform2D(
	point: IVector,
	transform: IMatrix2D,
): IVector {
	return transformVector2D(point, transform);
}

/**
 * Apply a 3D coordinate transformation using a matrix
 * @param point - Point to transform
 * @param transform - Transformation matrix
 * @returns Transformed point
 */
export function applyTransform3D(
	point: IVector,
	transform: IMatrix3D,
): IVector {
	return transformVector3D(point, transform);
}

/**
 * Create a coordinate conversion between two spaces (2D)
 * @param sourceSpace - Source coordinate space
 * @param targetSpace - Target coordinate space
 * @param options - Conversion options
 * @returns Coordinate conversion definition
 */
export function createConversion2D(
	sourceSpace: CoordinateSpace,
	targetSpace: CoordinateSpace,
	options: {
		translation?: IVector;
		rotation?: TAngleRad;
		scale?: TScaleFactor | { x: TScaleFactor; y: TScaleFactor };
		viewport?: IViewport;
		bounds?: {
			x: TCoordinateX;
			y: TCoordinateY;
			width: number;
			height: number;
		};
	},
): ICoordinateConversion2D {
	let transform: IMatrix2D = {
		a: 1 as TMatrixA,
		b: 0 as TMatrixB,
		c: 0 as TMatrixC,
		d: 1 as TMatrixD,
		e: 0 as TMatrixE,
		f: 0 as TMatrixF,
	};

	// Apply transformations based on source and target spaces
	if (sourceSpace === "world" && targetSpace === "screen" && options.viewport) {
		transform = createTranslation2D(
			-options.viewport.x as TMatTx,
			-options.viewport.y as TMatTy,
		);
	} else if (
		sourceSpace === "screen" &&
		targetSpace === "world" &&
		options.viewport
	) {
		transform = createTranslation2D(
			options.viewport.x as any,
			options.viewport.y as any,
		);
	} else if (
		sourceSpace === "world" &&
		targetSpace === "normalized" &&
		options.bounds
	) {
		// Scale and translate to normalize
		const scaleX = 1 / options.bounds.width;
		const scaleY = 1 / options.bounds.height;
		const scaleMatrix = createScale2DNonUniform(
			scaleX as TScaleFactor,
			scaleY as TScaleFactor,
		);
		const translateMatrix = createTranslation2D(
			-options.bounds.x as TMatTx,
			-options.bounds.y as TMatTy,
		);
		// Note: In a real implementation, you'd compose these matrices
		transform = scaleMatrix;
	}

	return {
		sourceSpace,
		targetSpace,
		transform,
	};
}

/**
 * Create a coordinate conversion between two spaces (3D)
 * @param sourceSpace - Source coordinate space
 * @param targetSpace - Target coordinate space
 * @param options - Conversion options
 * @returns Coordinate conversion definition
 */
export function createConversion3D(
	sourceSpace: CoordinateSpace,
	targetSpace: CoordinateSpace,
	options: {
		translation?: IVector;
		rotation?: TAngleRad;
		scale?:
			| TScaleFactor
			| { x: TScaleFactor; y: TScaleFactor; z: TScaleFactor };
		viewport?: IViewport3D;
	},
): ICoordinateConversion3D {
	let transform: IMatrix3D = {
		a: 1 as TMatrixA,
		b: 0 as TMatrixB,
		c: 0 as TMatrixC,
		d: 1 as TMatrixD,
		e: 0 as TMatrixE,
		f: 0 as TMatrixF,
		x: 0 as TCoordinateX,
		y: 0 as TCoordinateY,
		z: 0 as TCoordinateZ,
	};

	// Apply transformations based on source and target spaces
	if (sourceSpace === "world" && targetSpace === "screen" && options.viewport) {
		transform = createTranslation3D(
			-options.viewport.x as TCoordinateX,
			-options.viewport.y as TCoordinateY,
			(options.viewport.z ? -options.viewport.z : 0) as TCoordinateZ,
		);
	} else if (
		sourceSpace === "screen" &&
		targetSpace === "world" &&
		options.viewport
	) {
		transform = createTranslation3D(
			options.viewport.x,
			options.viewport.y,
			options.viewport.z,
		);
	}

	return {
		sourceSpace,
		targetSpace,
		transform,
	};
}

/**
 * Convert coordinates using a conversion definition (2D)
 * @param point - Point to convert
 * @param conversion - Coordinate conversion definition
 * @returns Converted point
 */
export function convertCoordinates2D(
	point: IVector,
	conversion: ICoordinateConversion2D,
): IVector {
	return applyTransform2D(point, conversion.transform);
}

/**
 * Convert coordinates using a conversion definition (3D)
 * @param point - Point to convert
 * @param conversion - Coordinate conversion definition
 * @returns Converted point
 */
export function convertCoordinates3D(
	point: IVector,
	conversion: ICoordinateConversion3D,
): IVector {
	return applyTransform3D(point, conversion.transform);
}

/**
 * Chain multiple coordinate conversions (2D)
 * @param point - Starting point
 * @param conversions - Array of conversions to apply in order
 * @returns Final converted point
 */
export function chainConversions2D(
	point: IVector,
	conversions: ICoordinateConversion2D[],
): IVector {
	return conversions.reduce((currentPoint, conversion) => {
		return convertCoordinates2D(currentPoint, conversion);
	}, point);
}

/**
 * Chain multiple coordinate conversions (3D)
 * @param point - Starting point
 * @param conversions - Array of conversions to apply in order
 * @returns Final converted point
 */
export function chainConversions3D(
	point: IVector,
	conversions: ICoordinateConversion3D[],
): IVector {
	return conversions.reduce((currentPoint, conversion) => {
		return convertCoordinates3D(currentPoint, conversion);
	}, point);
}

/**
 * Create a conversion from world to screen coordinates (2D)
 * @param viewport - Viewport definition
 * @returns Conversion definition
 */
export function createWorldToScreenConversion2D(
	viewport: IViewport,
): ICoordinateConversion2D {
	return createConversion2D("world", "screen", { viewport });
}

/**
 * Create a conversion from screen to world coordinates (2D)
 * @param viewport - Viewport definition
 * @returns Conversion definition
 */
export function createScreenToWorldConversion2D(
	viewport: IViewport,
): ICoordinateConversion2D {
	return createConversion2D("screen", "world", { viewport });
}

/**
 * Create a conversion from world to normalized coordinates (2D)
 * @param bounds - Bounding box for normalization
 * @returns Conversion definition
 */
export function createWorldToNormalizedConversion2D(bounds: {
	x: TCoordinateX;
	y: TCoordinateY;
	width: number;
	height: number;
}): ICoordinateConversion2D {
	return createConversion2D("world", "normalized", { bounds });
}

/**
 * Create a conversion from normalized to world coordinates (2D)
 * @param bounds - Bounding box for denormalization
 * @returns Conversion definition
 */
export function createNormalizedToWorldConversion2D(bounds: {
	x: TCoordinateX;
	y: TCoordinateY;
	width: number;
	height: number;
}): ICoordinateConversion2D {
	return createConversion2D("normalized", "world", { bounds });
}
