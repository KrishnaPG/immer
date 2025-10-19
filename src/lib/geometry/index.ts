/**
 * Geometry Module - Immutable geometric objects for tapspace
 *
 * This module provides the core geometry classes that represent immutable
 * geometric objects in 2D and 3D space. All geometry objects are immutable,
 * meaning that operations return new objects rather than modifying existing ones.
 *
 * @example
 * ```typescript
 * import { Point, Vector, Box } from 'tapspace/geometry';
 *
 * const point = new Point(basis, { x: 10, y: 20 });
 * const vector = new Vector(basis, { x: 5, y: 5 });
 * const newPoint = point.addVector(vector);
 * ```
 */

import type {
  IBasis,
  IBox,
  IPoint,
  IPointCoordinates,
  ISize,
  ISizeDimensions,
  ITransform,
  ITransformMatrix,
  IVector,
  IVectorCoordinates,
} from '../types';

// Re-export types for convenience
export type {
	IBasis,
	IBox,
	IGeometry,
	IPoint,
	IPointCoordinates,
	IRawTensor,
	ISize,
	ISizeDimensions,
	ITransform,
	ITransformMatrix,
	IVector,
	IVectorCoordinates,
} from "../types";
// Additional geometry classes
export { Area } from "./Area";
export { Basis } from "./Basis";
export { Box } from "./Box";
export { Circle } from "./Circle";
export { Direction } from "./Direction";
export { Distance } from "./Distance";
export { Grid } from "./Grid";
export { Line } from "./Line";
export { Orientation } from "./Orientation";
export { Path } from "./Path";
// Core geometry classes
export { Point } from "./Point";
export { Polygon } from "./Polygon";
export { Ray } from "./Ray";
export { Scale } from "./Scale";
export { Size } from "./Size";
export { Sphere } from "./Sphere";
export { Transform } from "./Transform";
export { Vector } from "./Vector";
export { Volume } from "./Volume";

// Factory functions for common geometry creation
export const geometry = {
	/**
	 * Create a new point
	 */
	point: (basis: IBasis, coordinates: IPointCoordinates): IPoint =>
		new Point(basis, coordinates),

	/**
	 * Create a new vector
	 */
	vector: (basis: IBasis, coordinates: IVectorCoordinates): IVector =>
		new Vector(basis, coordinates),

	/**
	 * Create a new box
	 */
	box: (basis: IBasis, a: IPointCoordinates, b: IPointCoordinates): IBox =>
		new Box(basis, a, b),

	/**
	 * Create a new size
	 */
	size: (basis: IBasis, dimensions: ISizeDimensions): ISize =>
		new Size(basis, dimensions),

	/**
	 * Create a new transform
	 */
	transform: (basis: IBasis, matrix: ITransformMatrix): ITransform =>
		new Transform(basis, matrix),
};
