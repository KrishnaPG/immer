import * as tf from '@tensorflow/tfjs';
import type { TCoordinate } from '@/types/branded.types';
import type { IVector2D } from '@/types/core.interfaces';

/**
 * 2D Vector wrapper for TensorFlow.js operations
 * Provides tapspace-specific coordinate system abstractions
 */
export class Vector2D {
  public readonly tensor: tf.Tensor1D;

  constructor(x: TCoordinate | tf.Tensor1D | IVector2D, y?: TCoordinate) {
    if (typeof x === 'number' && typeof y === 'number') {
      this.tensor = tf.tensor1d([x, y]);
    } else if (x instanceof tf.Tensor) {
      this.tensor = x as tf.Tensor1D;
    } else {
      // Handle IVector2D case
      const vec = x as IVector2D;
      this.tensor = tf.tensor1d([vec.x as number, vec.y as number]);
    }
  }

  get x(): TCoordinate {
    return this.tensor.dataSync()[0] as TCoordinate;
  }

  get y(): TCoordinate {
    return this.tensor.dataSync()[1] as TCoordinate;
  }

  /**
   * Create vector from TensorFlow tensor
   */
  static fromTensor(tensor: tf.Tensor1D): Vector2D {
    return new Vector2D(tensor);
  }

  /**
   * Create zero vector
   */
  static zero(): Vector2D {
    return new Vector2D(0 as TCoordinate, 0 as TCoordinate);
  }

  /**
   * Transform vector using affine transformation matrix
   */
  transform(matrix: tf.Tensor2D): Vector2D {
    // Convert to homogeneous coordinates [x, y, 1]
    const homogeneous = tf.tensor2d([[this.x, this.y, 1]], [1, 3]);

    // Apply transformation
    const result = tf.matMul(homogeneous, matrix);

    // Convert back from homogeneous coordinates
    const values = result.dataSync();
    const newX = values[0] / values[2];
    const newY = values[1] / values[2];

    homogeneous.dispose();
    result.dispose();

    return new Vector2D(newX as TCoordinate, newY as TCoordinate);
  }

  /**
   * Convert to plain object for JSON serialization
   */
  toObject(): IVector2D {
    return { x: this.x, y: this.y };
  }

  /**
   * Clean up tensor resources
   */
  dispose(): void {
    this.tensor.dispose();
  }
}