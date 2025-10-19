import * as tf from '@tensorflow/tfjs';
import type { TCoordinateX, TCoordinateY, TCoordinateZ } from '@/types/branded.types';
import { Basis } from './Basis';
import { Point } from './Point';

/**
 * Vector class with coordinate system support
 */
export class Vector {
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

  static fromPoints(basis: Basis, fromPoint: Point, toPoint: Point): Vector {
    const sameBasisToPoint = toPoint.basis === basis ? toPoint : toPoint.changeBasis(basis);
    return new Vector(basis, {
      x: (sameBasisToPoint.x as number) - (fromPoint.x as number),
      y: (sameBasisToPoint.y as number) - (fromPoint.y as number),
      z: (sameBasisToPoint.z as number) - (fromPoint.z as number)
    });
  }

  changeBasis(newBasis: Basis): Vector {
    const transform = Basis.getTransformBetween(this.basis, newBasis);
    const point = new Point(this.basis, { x: this.x as number, y: this.y as number, z: this.z as number });
    const transformedPoint = point.transformBy(transform);
    return new Vector(newBasis, {
      x: transformedPoint.x as number,
      y: transformedPoint.y as number,
      z: transformedPoint.z as number
    });
  }

  add(other: Vector): Vector {
    const sameBasis = this.basis === other.basis ? other : other.changeBasis(this.basis);
    return new Vector(this.basis, {
      x: (this.x as number) + (sameBasis.x as number),
      y: (this.y as number) + (sameBasis.y as number),
      z: (this.z as number) + (sameBasis.z as number)
    });
  }

  scale(factor: number): Vector {
    return new Vector(this.basis, {
      x: (this.x as number) * factor,
      y: (this.y as number) * factor,
      z: (this.z as number) * factor
    });
  }

  normalize(): Vector {
    const length = Math.sqrt((this.x as number) * (this.x as number) + (this.y as number) * (this.y as number) + (this.z as number) * (this.z as number));
    if (length === 0) return this;
    return this.scale(1 / length);
  }

  dot(other: Vector): number {
    const sameBasis = this.basis === other.basis ? other : other.changeBasis(this.basis);
    return (this.x as number) * (sameBasis.x as number) + (this.y as number) * (sameBasis.y as number) + (this.z as number) * (sameBasis.z as number);
  }

  cross(other: Vector): Vector {
    const sameBasis = this.basis === other.basis ? other : other.changeBasis(this.basis);
    return new Vector(this.basis, {
      x: (this.y as number) * (sameBasis.z as number) - (this.z as number) * (sameBasis.y as number),
      y: (this.z as number) * (sameBasis.x as number) - (this.x as number) * (sameBasis.z as number),
      z: (this.x as number) * (sameBasis.y as number) - (this.y as number) * (sameBasis.x as number)
    });
  }

  getLength(): number {
    return Math.sqrt((this.x as number) * (this.x as number) + (this.y as number) * (this.y as number) + (this.z as number) * (this.z as number));
  }

  getRaw() {
    return { x: this.x as number, y: this.y as number, z: this.z as number };
  }
}

// Export Vector2D as alias for backward compatibility
export { Vector as Vector2D };