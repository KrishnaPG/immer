import * as tf from "@tensorflow/tfjs";
import type { TCoordinateX, TCoordinateY, TCoordinateZ } from "@/types/branded.types";
import { Basis } from "./Basis";
import type { AffineTransform } from "./transform";
import { Vector } from "./vector";

export class Point {
	readonly basis: Basis;
	readonly x: TCoordinateX;
	readonly y: TCoordinateY;
	readonly z: TCoordinateZ;

	constructor(basis: Basis, coordinates: { x: number; y: number; z?: number }) {
		this.basis = basis;
		this.x = coordinates.x as TCoordinateX;
		this.y = coordinates.y as TCoordinateY;
		this.z = (coordinates.z || 0) as TCoordinateZ; 
	}

	// Transform point to different coordinate system
	changeBasis(newBasis: Basis): Point {
		return this.basis.transformPoint(this).changeBasis(newBasis);
	}

	// Apply transformation within current basis
	transformBy(transform: AffineTransform): Point {
		const newBasis = new Basis(this.basis.transform.compose(transform));
		return new Point(newBasis, { x: this.x, y: this.y, z: this.z });
	}

	// Get vector from this point to another point
	getVectorTo(other: Point): Vector {
		const sameBasis =
			this.basis === other.basis ? other : other.changeBasis(this.basis);
		return new Vector(this.basis, {
			x: (sameBasis.x - this.x) as TCoordinateX,
			y: (sameBasis.y - this.y) as TCoordinateY,
		});
	}

	// Get distance to another point
	getDistanceTo(other: Point): number {
		const vector = this.getVectorTo(other);
		return Math.sqrt((vector.x as number) * (vector.x as number) + (vector.y as number) * (vector.y as number));
	}

	// Add vector to point
	addVector(vector: Vector): Point {
		return new Point(this.basis, {
			x: this.x + vector.x,
			y: this.y + vector.y,
			z: this.z,
		});
	}

	// Polar offset from this point
	polarOffset(distance: number, angle: number): Point {
		const x = this.x + distance * Math.cos(angle);
		const y = this.y + distance * Math.sin(angle);
		return new Point(this.basis, { x, y, z: this.z });
	}

	getRaw() {
		return { x: this.x, y: this.y, z: this.z };
	}

	equals(other: Point): boolean {
		return this.x === other.x && this.y === other.y && this.z === other.z;
	}
}
