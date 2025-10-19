import type {
	TCoordinate,
	TCoordinateX,
	TCoordinateY,
} from "@/types/branded.types";
import type { Basis } from "./Basis";
import type { AffineTransform } from "./transform";
import { Vector2D } from "./vector";

export class Box {
	readonly basis: Basis;
	readonly position: Vector2D;
	readonly size: Vector2D;

	constructor(basis: Basis, position: Vector2D, size: Vector2D) {
		this.basis = basis;
		this.position = position;
		this.size = size;
	}

	static fromPoints(basis: Basis, p1: Vector2D, p2: Vector2D): Box {
		const minX = Math.min(p1.x, p2.x) as TCoordinateX;
		const minY = Math.min(p1.y, p2.y) as TCoordinateY;
		const maxX = Math.max(p1.x, p2.x) as TCoordinateX;
		const maxY = Math.max(p1.y, p2.y) as TCoordinateY;

		const position = new Vector2D({ x: minX, y: minY });
		const size = new Vector2D({
			x: (maxX - minX) as TCoordinateX,
			y: (maxY - minY) as TCoordinateY,
		});

		return new Box(basis, position, size);
	}

	transformBy(transform: AffineTransform): Box {
		const newPosition = this.position.transform(transform.matrix.tensor);
		const newSize = this.size.transform(transform.matrix.tensor);
		return new Box(this.basis, newPosition, newSize);
	}

	detectCollision(other: Box): boolean {
		return !(
			this.position.x + this.size.x < other.position.x ||
			other.position.x + other.size.x < this.position.x ||
			this.position.y + this.size.y < other.position.y ||
			other.position.y + other.size.y < this.position.y
		);
	}

	getRaw() {
		return {
			x: this.position.x,
			y: this.position.y,
			width: this.size.x,
			height: this.size.y,
		};
	}
}
