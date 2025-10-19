import * as tf from "@tensorflow/tfjs";
import type { TCoordinate, TDistance } from "@/types/branded.types";
import { Vector2D } from "./vector";

/**
 * Axis-Aligned Bounding Box for 2D collision detection and spatial queries
 */
export class AABB {
	public readonly min: Vector2D;
	public readonly max: Vector2D;
	public readonly tensor: tf.Tensor1D;

	constructor(
		min: Vector2D | { x: TCoordinate; y: TCoordinate },
		max: Vector2D | { x: TCoordinate; y: TCoordinate },
	) {
		this.min = min instanceof Vector2D ? min : new Vector2D(min.x, min.y);
		this.max = max instanceof Vector2D ? max : new Vector2D(max.x, max.y);

		// Create combined tensor for efficient operations
		this.tensor = tf.tensor1d([
			this.min.x as number,
			this.min.y as number,
			this.max.x as number,
			this.max.y as number,
		]);
	}

	/**
	 * Create AABB from center and size
	 */
	static fromCenter(
		center: Vector2D,
		width: TDistance,
		height: TDistance,
	): AABB {
		const halfWidth = (width as number) / 2;
		const halfHeight = (height as number) / 2;

		const min = new Vector2D(
			((center.x as number) - halfWidth) as TCoordinate,
			((center.y as number) - halfHeight) as TCoordinate,
		);
		const max = new Vector2D(
			((center.x as number) + halfWidth) as TCoordinate,
			((center.y as number) + halfHeight) as TCoordinate,
		);

		return new AABB(min, max);
	}

	/**
	 * Get width of the bounding box
	 */
	get width(): TDistance {
		return ((this.max.x as number) - (this.min.x as number)) as TDistance;
	}

	/**
	 * Get height of the bounding box
	 */
	get height(): TDistance {
		return ((this.max.y as number) - (this.min.y as number)) as TDistance;
	}

	/**
	 * Get center point of the bounding box
	 */
	get center(): Vector2D {
		const centerX = ((this.min.x as number) + (this.max.x as number)) / 2;
		const centerY = ((this.min.y as number) + (this.max.y as number)) / 2;
		return new Vector2D(centerX as TCoordinate, centerY as TCoordinate);
	}

	/**
	 * Check if point is inside the bounding box
	 */
	contains(point: Vector2D): boolean {
		return (
			point.x >= this.min.x &&
			point.x <= this.max.x &&
			point.y >= this.min.y &&
			point.y <= this.max.y
		);
	}

	/**
	 * Check if this AABB intersects with another AABB
	 */
	intersects(other: AABB): boolean {
		return !(
			this.max.x < other.min.x ||
			this.min.x > other.max.x ||
			this.max.y < other.min.y ||
			this.min.y > other.max.y
		);
	}

	/**
	 * Get intersection area with another AABB
	 */
	intersection(other: AABB): AABB | null {
		if (!this.intersects(other)) {
			return null;
		}

		const minX = Math.max(this.min.x as number, other.min.x as number);
		const minY = Math.max(this.min.y as number, other.min.y as number);
		const maxX = Math.min(this.max.x as number, other.max.x as number);
		const maxY = Math.min(this.max.y as number, other.max.y as number);

		return new AABB(
			{ x: minX as TCoordinate, y: minY as TCoordinate },
			{ x: maxX as TCoordinate, y: maxY as TCoordinate },
		);
	}

	/**
	 * Create union with another AABB
	 */
	union(other: AABB): AABB {
		const minX = Math.min(this.min.x as number, other.min.x as number);
		const minY = Math.min(this.min.y as number, other.min.y as number);
		const maxX = Math.max(this.max.x as number, other.max.x as number);
		const maxY = Math.max(this.max.y as number, other.max.y as number);

		return new AABB(
			{ x: minX as TCoordinate, y: minY as TCoordinate },
			{ x: maxX as TCoordinate, y: maxY as TCoordinate },
		);
	}

	/**
	 * Expand AABB by offset
	 */
	expand(offset: TDistance): AABB {
		const offsetNum = offset as number;
		return new AABB(
			{
				x: ((this.min.x as number) - offsetNum) as TCoordinate,
				y: ((this.min.y as number) - offsetNum) as TCoordinate,
			},
			{
				x: ((this.max.x as number) + offsetNum) as TCoordinate,
				y: ((this.max.y as number) + offsetNum) as TCoordinate,
			},
		);
	}

	/**
	 * Convert to array representation
	 */
	toArray(): [TCoordinate, TCoordinate, TCoordinate, TCoordinate] {
		return [this.min.x, this.min.y, this.max.x, this.max.y];
	}

	/**
	 * Clean up tensor resources
	 */
	dispose(): void {
		this.min.dispose();
		this.max.dispose();
		this.tensor.dispose();
	}
}
