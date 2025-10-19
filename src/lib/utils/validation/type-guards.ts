/**
 * @fileoverview TypeScript type guards for runtime type checking and validation
 * Provides runtime validation for branded types and geometric objects
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
	TDuration,
	THeight,
	TIndex,
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
	TProgress,
	TScaleFactor,
	TTimestamp,
	TVolume,
	TWidth,
} from "../../types/base-types";
import type {
	IBox3D,
	ICircle,
	IPoint2D,
	IPoint3D,
	IRectangle,
	ISphere,
} from "../math/geometry-utils";
import type { IMatrix2D, IMatrix3D } from "../math/matrix-ops";
import type { IVector } from "../math/vector-ops";

/**
 * Validation error class for type validation failures
 */
export class ValidationError extends Error {
	public readonly value: unknown;
	public readonly expectedType: string;

	constructor(message: string, value: unknown, expectedType: string) {
		super(message);
		this.name = "ValidationError";
		this.value = value;
		this.expectedType = expectedType;
	}
}

/**
 * Validation result interface
 */
export interface IValidationResult<T = unknown> {
	readonly isValid: boolean;
	readonly value?: T;
	readonly error?: ValidationError;
}

/**
 * Type guard for branded coordinate types
 */
export function isCoordinate(value: unknown): value is TCoordinate {
	return typeof value === "number" && !isNaN(value) && isFinite(value);
}

/**
 * Type guard for branded coordinate X types
 */
export function isCoordinateX(value: unknown): value is TCoordinateX {
	return isCoordinate(value);
}

/**
 * Type guard for branded coordinate Y types
 */
export function isCoordinateY(value: unknown): value is TCoordinateY {
	return isCoordinate(value);
}

/**
 * Type guard for branded coordinate Z types
 */
export function isCoordinateZ(value: unknown): value is TCoordinateZ {
	return isCoordinate(value);
}

/**
 * Type guard for angle in radians
 */
export function isAngleRad(value: unknown): value is TAngleRad {
	return isCoordinate(value) && value >= -Math.PI * 2 && value <= Math.PI * 2;
}

/**
 * Type guard for distance measurements
 */
export function isDistance(value: unknown): value is TDistance {
	return isCoordinate(value) && value >= 0;
}

/**
 * Type guard for scale factors
 */
export function isScaleFactor(value: unknown): value is TScaleFactor {
	return isCoordinate(value) && value > 0;
}

/**
 * Type guard for area measurements
 */
export function isArea(value: unknown): value is TArea {
	return isCoordinate(value) && value >= 0;
}

/**
 * Type guard for volume measurements
 */
export function isVolume(value: unknown): value is TVolume {
	return isCoordinate(value) && value >= 0;
}

/**
 * Type guard for width measurements
 */
export function isWidth(value: unknown): value is TWidth {
	return isDistance(value);
}

/**
 * Type guard for height measurements
 */
export function isHeight(value: unknown): value is THeight {
	return isDistance(value);
}

/**
 * Type guard for depth measurements
 */
export function isDepth(value: unknown): value is TDepth {
	return isDistance(value);
}

/**
 * Type guard for progress values (0 to 1)
 */
export function isProgress(value: unknown): value is TProgress {
	return isCoordinate(value) && value >= 0 && value <= 1;
}

/**
 * Type guard for timestamp values
 */
export function isTimestamp(value: unknown): value is TTimestamp {
	return isCoordinate(value) && value >= 0;
}

/**
 * Type guard for duration values
 */
export function isDuration(value: unknown): value is TDuration {
	return isCoordinate(value) && value >= 0;
}

/**
 * Type guard for index values
 */
export function isIndex(value: unknown): value is TIndex {
	return isCoordinate(value) && value >= 0 && Number.isInteger(Number(value));
}

/**
 * Type guard for 2D vectors
 */
export function isVector2D(value: unknown): value is IVector {
	if (!value || typeof value !== "object") {
		return false;
	}

	const vec = value as Record<string, unknown>;
	return (
		isCoordinateX(vec.x) &&
		isCoordinateY(vec.y) &&
		(vec.z === undefined || isCoordinateZ(vec.z))
	);
}

/**
 * Type guard for 3D vectors
 */
export function isVector3D(value: unknown): value is IVector {
	if (!value || typeof value !== "object") {
		return false;
	}

	const vec = value as Record<string, unknown>;
	return isCoordinateX(vec.x) && isCoordinateY(vec.y) && isCoordinateZ(vec.z);
}

/**
 * Type guard for 2D points
 */
export function isPoint2D(value: unknown): value is IPoint2D {
	return isVector2D(value);
}

/**
 * Type guard for 3D points
 */
export function isPoint3D(value: unknown): value is IPoint3D {
	return isVector3D(value);
}

/**
 * Type guard for rectangles
 */
export function isRectangle(value: unknown): value is IRectangle {
	if (!value || typeof value !== "object") {
		return false;
	}

	const rect = value as Record<string, unknown>;
	return (
		isCoordinateX(rect.x) &&
		isCoordinateY(rect.y) &&
		isWidth(rect.width) &&
		isHeight(rect.height)
	);
}

/**
 * Type guard for 3D boxes
 */
export function isBox3D(value: unknown): value is IBox3D {
	if (!value || typeof value !== "object") {
		return false;
	}

	const box = value as Record<string, unknown>;
	return (
		isCoordinateX(box.x) &&
		isCoordinateY(box.y) &&
		isCoordinateZ(box.z) &&
		isWidth(box.width) &&
		isHeight(box.height) &&
		isDepth(box.depth)
	);
}

/**
 * Type guard for circles
 */
export function isCircle(value: unknown): value is ICircle {
	if (!value || typeof value !== "object") {
		return false;
	}

	const circle = value as Record<string, unknown>;
	return isPoint2D(circle.center) && isDistance(circle.radius);
}

/**
 * Type guard for spheres
 */
export function isSphere(value: unknown): value is ISphere {
	if (!value || typeof value !== "object") {
		return false;
	}

	const sphere = value as Record<string, unknown>;
	return isPoint3D(sphere.center) && isDistance(sphere.radius);
}

/**
 * Type guard for 2D transformation matrices
 */
export function isMatrix2D(value: unknown): value is IMatrix2D {
	if (!value || typeof value !== "object") {
		return false;
	}

	const matrix = value as Record<string, unknown>;
	return (
		isMatrixA(matrix.a) &&
		isMatrixB(matrix.b) &&
		isMatrixC(matrix.c) &&
		isMatrixD(matrix.d) &&
		isMatrixE(matrix.e) &&
		isMatrixF(matrix.f)
	);
}

/**
 * Type guard for 3D transformation matrices
 */
export function isMatrix3D(value: unknown): value is IMatrix3D {
	if (!value || typeof value !== "object") {
		return false;
	}

	const matrix = value as Record<string, unknown>;
	return (
		isMatrix2D(matrix) &&
		isCoordinateX(matrix.x) &&
		isCoordinateY(matrix.y) &&
		isCoordinateZ(matrix.z)
	);
}

/**
 * Type guard for matrix A component (scale X)
 */
export function isMatrixA(value: unknown): value is TMatrixA {
	return isCoordinate(value);
}

/**
 * Type guard for matrix B component (shear YX)
 */
export function isMatrixB(value: unknown): value is TMatrixB {
	return isCoordinate(value);
}

/**
 * Type guard for matrix C component (shear XY)
 */
export function isMatrixC(value: unknown): value is TMatrixC {
	return isCoordinate(value);
}

/**
 * Type guard for matrix D component (scale Y)
 */
export function isMatrixD(value: unknown): value is TMatrixD {
	return isCoordinate(value);
}

/**
 * Type guard for matrix E component (translation X)
 */
export function isMatrixE(value: unknown): value is TMatrixE {
	return isCoordinate(value);
}

/**
 * Type guard for matrix F component (translation Y)
 */
export function isMatrixF(value: unknown): value is TMatrixF {
	return isCoordinate(value);
}

/**
 * Type guard for matrix scale X component
 */
export function isMatScaleX(value: unknown): value is TMatScaleX {
	return isScaleFactor(value);
}

/**
 * Type guard for matrix scale Y component
 */
export function isMatScaleY(value: unknown): value is TMatScaleY {
	return isScaleFactor(value);
}

/**
 * Type guard for matrix translation X component
 */
export function isMatTx(value: unknown): value is TMatTx {
	return isCoordinate(value);
}

/**
 * Type guard for matrix translation Y component
 */
export function isMatTy(value: unknown): value is TMatTy {
	return isCoordinate(value);
}

/**
 * Validate a value and return a typed result
 * @param value - Value to validate
 * @param typeGuard - Type guard function
 * @param typeName - Name of the expected type for error messages
 * @returns Validation result
 */
export function validateType<T>(
	value: unknown,
	typeGuard: (value: unknown) => value is T,
	typeName: string,
): IValidationResult<T> {
	if (typeGuard(value)) {
		return { isValid: true, value: value as T };
	}

	return {
		isValid: false,
		error: new ValidationError(
			`Expected ${typeName}, but received ${typeof value}`,
			value,
			typeName,
		),
	};
}

/**
 * Validate multiple values of the same type
 * @param values - Array of values to validate
 * @param typeGuard - Type guard function
 * @param typeName - Name of the expected type for error messages
 * @returns Validation result with array of valid values
 */
export function validateArray<T>(
	values: unknown[],
	typeGuard: (value: unknown) => value is T,
	typeName: string,
): IValidationResult<T[]> {
	const validValues: T[] = [];
	const errors: ValidationError[] = [];

	for (let i = 0; i < values.length; i++) {
		const result = validateType(values[i], typeGuard, `${typeName}[${i}]`);
		if (result.isValid && result.value !== undefined) {
			validValues.push(result.value);
		} else if (result.error) {
			errors.push(result.error);
		}
	}

	if (errors.length > 0) {
		return {
			isValid: false,
			error: new ValidationError(
				`Multiple validation errors: ${errors.map((e) => e.message).join(", ")}`,
				values,
				`Array<${typeName}>`,
			),
		};
	}

	return { isValid: true, value: validValues };
}

/**
 * Assert that a value is of a specific type, throwing an error if not
 * @param value - Value to validate
 * @param typeGuard - Type guard function
 * @param typeName - Name of the expected type for error messages
 * @returns The validated value
 * @throws ValidationError if the value is not of the expected type
 */
export function assertType<T>(
	value: unknown,
	typeGuard: (value: unknown) => value is T,
	typeName: string,
): T {
	const result = validateType(value, typeGuard, typeName);
	if (!result.isValid) {
		throw result.error;
	}
	return result.value!;
}

/**
 * Check if a number is within a specified range
 * @param value - Number to check
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns True if value is within range
 */
export function isInRange(value: number, min: number, max: number): boolean {
	return value >= min && value <= max;
}

/**
 * Validate that a number is within a specified range
 * @param value - Number to validate
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @param rangeName - Name of the range for error messages
 * @returns Validation result
 */
export function validateRange(
	value: unknown,
	min: number,
	max: number,
	rangeName: string,
): IValidationResult<number> {
	if (typeof value !== "number" || isNaN(value) || !isFinite(value)) {
		return {
			isValid: false,
			error: new ValidationError(
				`Expected a number for ${rangeName}`,
				value,
				"number",
			),
		};
	}

	if (value < min || value > max) {
		return {
			isValid: false,
			error: new ValidationError(
				`Expected ${rangeName} to be between ${min} and ${max}, but received ${value}`,
				value,
				rangeName,
			),
		};
	}

	return { isValid: true, value };
}

/**
 * Check if an array is not empty
 * @param value - Array to check
 * @returns True if array is not empty
 */
export function isNonEmpty<T>(value: T[]): value is [T, ...T[]] {
	return value.length > 0;
}

/**
 * Validate that an array is not empty
 * @param value - Array to validate
 * @param arrayName - Name of the array for error messages
 * @returns Validation result
 */
export function validateNonEmpty<T>(
	value: unknown,
	arrayName: string,
): IValidationResult<[T, ...T[]]> {
	if (!Array.isArray(value)) {
		return {
			isValid: false,
			error: new ValidationError(
				`Expected array for ${arrayName}`,
				value,
				"array",
			),
		};
	}

	if (value.length === 0) {
		return {
			isValid: false,
			error: new ValidationError(
				`Expected ${arrayName} to be non-empty`,
				value,
				"non-empty array",
			),
		};
	}

	return { isValid: true, value: value as [T, ...T[]] };
}

/**
 * Check if a string matches a pattern
 * @param value - String to check
 * @param pattern - Regular expression pattern
 * @returns True if string matches pattern
 */
export function matchesPattern(value: string, pattern: RegExp): boolean {
	return pattern.test(value);
}

/**
 * Validate that a string matches a pattern
 * @param value - String to validate
 * @param pattern - Regular expression pattern
 * @param patternName - Name of the pattern for error messages
 * @returns Validation result
 */
export function validatePattern(
	value: unknown,
	pattern: RegExp,
	patternName: string,
): IValidationResult<string> {
	if (typeof value !== "string") {
		return {
			isValid: false,
			error: new ValidationError(
				`Expected string for ${patternName}`,
				value,
				"string",
			),
		};
	}

	if (!pattern.test(value)) {
		return {
			isValid: false,
			error: new ValidationError(
				`Expected string to match pattern ${patternName}, but received "${value}"`,
				value,
				patternName,
			),
		};
	}

	return { isValid: true, value };
}

/**
 * Check if an object has all required properties
 * @param obj - Object to check
 * @param requiredProps - Array of required property names
 * @returns True if object has all required properties
 */
export function hasProperties(
	obj: Record<string, unknown>,
	requiredProps: string[],
): boolean {
	return requiredProps.every((prop) => prop in obj);
}

/**
 * Validate that an object has all required properties
 * @param value - Object to validate
 * @param requiredProps - Array of required property names
 * @param objectName - Name of the object for error messages
 * @returns Validation result
 */
export function validateProperties<T extends Record<string, unknown>>(
	value: unknown,
	requiredProps: string[],
	objectName: string,
): IValidationResult<T> {
	if (!value || typeof value !== "object") {
		return {
			isValid: false,
			error: new ValidationError(
				`Expected object for ${objectName}`,
				value,
				"object",
			),
		};
	}

	const obj = value as Record<string, unknown>;
	const missingProps = requiredProps.filter((prop) => !(prop in obj));

	if (missingProps.length > 0) {
		return {
			isValid: false,
			error: new ValidationError(
				`Expected ${objectName} to have properties: ${missingProps.join(", ")}`,
				value,
				objectName,
			),
		};
	}

	return { isValid: true, value: obj as T };
}

/**
 * Combine multiple validation results
 * @param results - Array of validation results
 * @returns Combined validation result
 */
export function combineValidations<T>(
	results: IValidationResult[],
): IValidationResult<T[]> {
	const validValues: T[] = [];
	const errors: ValidationError[] = [];

	for (const result of results) {
		if (result.isValid && result.value !== undefined) {
			validValues.push(result.value as T);
		} else if (result.error) {
			errors.push(result.error);
		}
	}

	if (errors.length > 0) {
		return {
			isValid: false,
			error: new ValidationError(
				`Multiple validation errors: ${errors.map((e) => e.message).join(", ")}`,
				results,
				"combined validation",
			),
		};
	}

	return { isValid: true, value: validValues };
}

/**
 * Create a custom type guard with validation
 * @param typeGuard - Base type guard function
 * @param validator - Additional validation function
 * @returns Enhanced type guard
 */
export function createValidatedTypeGuard<T>(
	typeGuard: (value: unknown) => value is T,
	validator: (value: T) => boolean,
): (value: unknown) => value is T {
	return (value: unknown): value is T => {
		return typeGuard(value) && validator(value);
	};
}

/**
 * Validate a vector has reasonable magnitude (not NaN or infinite)
 * @param vector - Vector to validate
 * @returns True if vector has reasonable magnitude
 */
export function isValidVector(vector: IVector): boolean {
	const magnitude = Math.sqrt(
		Number(vector.x) * Number(vector.x) +
			Number(vector.y) * Number(vector.y) +
			(vector.z ? Number(vector.z) * Number(vector.z) : 0),
	);

	return !isNaN(magnitude) && isFinite(magnitude);
}

/**
 * Validate a matrix is invertible (has non-zero determinant)
 * @param matrix - Matrix to validate
 * @returns True if matrix is invertible
 */
export function isInvertibleMatrix2D(matrix: IMatrix2D): boolean {
	const det =
		Number(matrix.a) * Number(matrix.d) - Number(matrix.b) * Number(matrix.c);
	return Math.abs(det) > 1e-10;
}

/**
 * Validate a 3D matrix is invertible (has non-zero determinant)
 * @param matrix - Matrix to validate
 * @returns True if matrix is invertible
 */
export function isInvertibleMatrix3D(matrix: IMatrix3D): boolean {
	// Simplified check for 3D affine transformation matrix
	const det2D =
		Number(matrix.a) * Number(matrix.d) - Number(matrix.b) * Number(matrix.c);
	return Math.abs(det2D) > 1e-10;
}
