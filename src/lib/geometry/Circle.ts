import type { TCoordinateX, TCoordinateY } from "@/types/branded.types";
import type { Basis } from "./Basis";
import { Box } from "./Box";
import type { AffineTransform } from "./transform";
import { Vector2D } from "./vector";

export class Circle {
	readonly basis: Basis;
	readonly center: Vector2D;
	readonly radius: number;

	constructor(basis: any, center: Vector2D, radius: number) {
		this.basis = basis;
		this.center = center;
		this.radius = radius;
	}

	transformBy(transform: AffineTransform): Circle {
		const newCenter = this.center.transform(transform.matrix.tensor);
		const scale = transform.getScale();
		const newRadius = this.radius * scale.x;
		return new Circle(this.basis, newCenter, newRadius);
	}

	getBoundingBox(): Box {
		const halfSize = this.radius * Math.SQRT2;
		const position = new Vector2D(
			(this.center.x - halfSize) as TCoordinateX,
			(this.center.y - halfSize) as TCoordinateY,
		);
		const size = new Vector2D(
			(halfSize * 2) as TCoordinateX,
			(halfSize * 2) as TCoordinateY,
		);
		return new Box(this.basis, position, size);
	}

	getRaw() {
		return {
			cx: this.center.x,
			cy: this.center.y,
			r: this.radius,
		};
	}
}
