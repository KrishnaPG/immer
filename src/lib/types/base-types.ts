import type {
	Branded,
	TDescription,
	TName,
	TSize,
} from "../../types/branded.types";

// Re-export Branded for use in other modules
export type { Branded, TName, TDescription };

/**
 * Base branded types for the tapspace library
 */

// Coordinate system types using branded types for type safety
export type TCoordinate = Branded<number, "Coordinate">;
export type TCoordinateX = Branded<TCoordinate, "CoordinateX">;
export type TCoordinateY = Branded<TCoordinate, "CoordinateY">;
export type TCoordinateZ = Branded<TCoordinate, "CoordinateZ">;

export type TWidth = Branded<TSize, "Width">;
export type THeight = Branded<TSize, "Height">;
export type TDepth = Branded<TSize, "Depth">;

export type TMeasurement = Branded<number, "Measure">;

export type TDistance = Branded<TMeasurement, "Distance">;
export type TIndex = Branded<TMeasurement, "Index">;
export type TScaleFactor = Branded<TMeasurement, "ScaleFactor">;
export type TAngleRad = Branded<TMeasurement, "Radians">;
export type TArea = Branded<TMeasurement, "Area">;
export type TVolume = Branded<TMeasurement, "Volume">;

// Matrix component types
export type TMatrixA = Branded<number, "MatrixA">;
export type TMatrixB = Branded<number, "MatrixB">;
export type TMatrixC = Branded<number, "MatrixC">;
export type TMatrixD = Branded<number, "MatrixD">;
export type TMatrixE = Branded<number, "MatrixE">;
export type TMatrixF = Branded<number, "MatrixF">;

// Element types
export type THtmlElement = Branded<HTMLElement, "BasisElement">;
export type TTensorData = Branded<Float32Array, "TensorData">;

export type TTimestamp = Branded<number, "Timestamp">;
export type TDuration = Branded<number, "Duration">;
export type TProgress = Branded<number, "Progress">;
export type TTapCount = Branded<number, "TapCount">;
export type TDeltaMode = Branded<number, "DeltaMode">;

// Key types
export type TKeyName = Branded<string, "KeyName">;
export type TKeyCode = Branded<string, "KeyCode">;

// Subscription types
export type TSubscriptionId = Branded<string, "SubscriptionId">;