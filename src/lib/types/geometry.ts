import type { Branded, TAngleRad, TArea, TCoordinateX, TCoordinateY, TCoordinateZ, TDepth, TDistance, THeight, THtmlElement, TIndex, TMatrixA, TMatrixB, TMatrixC, TMatrixD, TMatrixE, TMatrixF, TScaleFactor, TTensorData, TVolume, TWidth } from "./base-types";

// Point coordinates interface
export interface I3DCoordinates {
	readonly x: TCoordinateX;
	readonly y: TCoordinateY;
	readonly z?: TCoordinateZ;
}

export type IPointCoordinates = I3DCoordinates;
export type IVectorCoordinates = I3DCoordinates;

// Size dimensions interface
export interface ISizeDimensions {
	readonly w: TWidth;
	readonly h: THeight;
	readonly d?: TDepth;
}

// Box boundaries interface
export interface IBoxBoundaries {
	readonly a: IPointCoordinates; // Top-left-front corner
	readonly b: IPointCoordinates; // Bottom-right-back corner
}

// Transform matrix interface
export interface ITransformMatrix {
	readonly a: TMatrixA;
	readonly b: TMatrixB;
	readonly c: TMatrixC;
	readonly d: TMatrixD;
	readonly e: TMatrixE;
	readonly f: TMatrixF;
}


// Basis interface for coordinate system transformations
export interface IBasis {
	readonly element: THtmlElement;
	readonly matrix: ITransformMatrix;
}

// Raw tensor representation
export interface IRawTensor {
	readonly basis: IBasis;
	readonly tensor: TTensorData;
}

// Geometry class interface
export interface IGeometry {
	readonly basis: IBasis;
	readonly isPoint?: boolean;
	readonly isVector?: boolean;
	readonly isBox?: boolean;
	readonly isTransform?: boolean;

	// Core methods
	changeBasis(newBasis: IBasis): IGeometry;
	getRaw(): IRawTensor;
	transitRaw(rawTensor: IRawTensor): IGeometry;
}

// Point geometry interface
export interface IPoint extends IGeometry {
	readonly isPoint: true;
	readonly point: IPointCoordinates;

	// Point-specific methods
	addVector(vector: IVector): IPoint;
	getDistanceTo(point: IPoint): TDistance;
	getVectorTo(point: IPoint): IVector;
	offset(offset: IVectorCoordinates): IPoint;
	translateBy(vector: IVectorCoordinates): IPoint;
}

// Vector geometry interface
export interface IVector extends IGeometry {
	readonly isVector: true;
	readonly vec: IVectorCoordinates;

	// Vector-specific methods
	add(other: IVector): IVector;
	cross(other: IVector): IVector;
	getDistance(): TDistance;
	getDirection(): IDirection;
	normalize(): IVector;
	rotateBy(radians: TAngleRad, origin?: IPoint): IVector;
	scaleBy(factor: TScaleFactor): IVector;
}

// Box geometry interface
export interface IBox extends IGeometry {
	readonly isBox: true;
	readonly a: IPointCoordinates;
	readonly b: IPointCoordinates;

	// Box-specific methods
	getSize(): ISize;
	getCenter(): IPoint;
	contains(point: IPoint): boolean;
}

// Transform interface for active transformations
export interface ITransform extends IGeometry {
 	readonly isTransform: true;
 	readonly matrix: ITransformMatrix;

 	// Transform-specific methods
 	inverse(): ITransform;
 	multiply(other: ITransform): ITransform;
 }

// Size interface
export interface ISize extends IGeometry, ISizeDimensions {
	// Size-specific methods
	scaleBy(factor: TScaleFactor): ISize;
}

// Direction interface
export interface IDirection extends IGeometry {
	readonly angle: TAngleRad;

	// Direction-specific methods
	getVector(): IVector;
}

// Distance interface
export interface IDistance {
	readonly distance: TDistance;

	// Distance-specific methods
	add(other: IDistance): IDistance;
	scaleBy(factor: TScaleFactor): IDistance;
}

// Area interface
export interface IArea extends IGeometry {
	readonly area: TArea;
}

// Volume interface
export interface IVolume extends IGeometry {
	readonly volume: TVolume;
}

// Circle geometry interface
export interface ICircle extends IGeometry {
	readonly center: IPoint;
	readonly radius: TDistance;

	// Circle-specific methods
	getBoundingBox(): IBox;
	contains(point: IPoint): boolean;
}

// Sphere geometry interface
export interface ISphere extends IGeometry {
	readonly center: IPoint;
	readonly radius: TDistance;

	// Sphere-specific methods
	getBoundingBox(): IBox;
	contains(point: IPoint): boolean;
}

// Line geometry interface
export interface ILine extends IGeometry {
	readonly start: IPoint;
	readonly end: IPoint;

	// Line-specific methods
	getDirection(): IDirection;
	getLength(): TDistance;
	getMidpoint(): IPoint;
}

// Path geometry interface
export interface IPath extends IGeometry {
	readonly points: readonly IPoint[];

	// Path-specific methods
	getLength(): TDistance;
	getBoundingBox(): IBox;
}

// Polygon geometry interface
export interface IPolygon extends IGeometry {
	readonly points: readonly IPoint[];

	// Polygon-specific methods
	getArea(): IArea;
	getBoundingBox(): IBox;
	contains(point: IPoint): boolean;
}

// Ray geometry interface
export interface IRay extends IGeometry {
	readonly origin: IPoint;
	readonly direction: IDirection;

	// Ray-specific methods
	getPointAt(distance: TDistance): IPoint;
}

// Scale interface
export interface IScale extends IGeometry {
	readonly factor: TScaleFactor;

	// Scale-specific methods
	inverse(): IScale;
	multiply(other: IScale): IScale;
}

// Orientation interface
export interface IOrientation extends IGeometry {
	readonly angle: TAngleRad;

	// Orientation-specific methods
	rotateBy(radians: TAngleRad): IOrientation;
}

// Grid geometry interface
export interface IGrid extends IGeometry {
	readonly origin: IPoint;
	readonly size: ISize;
	readonly spacing: IVector;

	// Grid-specific methods
	getPointAt(x: TIndex, y: TIndex): IPoint;
}
