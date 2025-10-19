import * as tf from '@tensorflow/tfjs';

/**
 * 3x3 Affine transformation matrix for 2D transformations
 * Uses TensorFlow.js for high-performance matrix operations
 */
export class AffineMatrix {
  public readonly tensor: tf.Tensor2D;

  constructor(tensor: tf.Tensor2D) {
    if (tensor.shape[0] !== 3 || tensor.shape[1] !== 3) {
      throw new Error('AffineMatrix must be a 3x3 tensor');
    }
    this.tensor = tensor;
  }

  /**
   * Create identity matrix
   */
  static identity(): AffineMatrix {
    const tensor = tf.tensor2d([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ]);
    return new AffineMatrix(tensor);
  }

  /**
   * Create translation matrix
   */
  static translation(x: number, y: number): AffineMatrix {
    const tensor = tf.tensor2d([
      [1, 0, x],
      [0, 1, y],
      [0, 0, 1]
    ]);
    return new AffineMatrix(tensor);
  }

  /**
   * Create rotation matrix
   */
  static rotation(angle: number): AffineMatrix {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const tensor = tf.tensor2d([
      [cos, -sin, 0],
      [sin, cos, 0],
      [0, 0, 1]
    ]);
    return new AffineMatrix(tensor);
  }

  /**
   * Create scaling matrix
   */
  static scaling(sx: number, sy: number): AffineMatrix {
    const tensor = tf.tensor2d([
      [sx, 0, 0],
      [0, sy, 0],
      [0, 0, 1]
    ]);
    return new AffineMatrix(tensor);
  }

  /**
   * Multiply two matrices
   */
  multiply(other: AffineMatrix): AffineMatrix {
    const result = tf.matMul(this.tensor, other.tensor);
    return new AffineMatrix(result);
  }

  /**
   * Invert the matrix
   */
  invert(): AffineMatrix {
    const det = this.determinant();
    if (Math.abs(det) < 1e-10) {
      throw new Error('Matrix is not invertible');
    }

    // Calculate inverse using formula for 3x3 matrix
    const values = this.tensor.dataSync();
    const invDet = 1 / det;

    const invValues = [
      (values[4] * values[8] - values[5] * values[7]) * invDet,
      (values[2] * values[7] - values[1] * values[8]) * invDet,
      (values[1] * values[5] - values[2] * values[4]) * invDet,
      (values[5] * values[6] - values[3] * values[8]) * invDet,
      (values[0] * values[8] - values[2] * values[6]) * invDet,
      (values[2] * values[3] - values[0] * values[5]) * invDet,
      (values[3] * values[7] - values[4] * values[6]) * invDet,
      (values[1] * values[6] - values[0] * values[7]) * invDet,
      (values[0] * values[4] - values[1] * values[3]) * invDet
    ];

    const result = tf.tensor2d(invValues, [3, 3]) as tf.Tensor2D;
    return new AffineMatrix(result);
  }

  /**
   * Calculate determinant
   */
  determinant(): number {
    const values = this.tensor.dataSync();
    return (
      values[0] * (values[4] * values[8] - values[5] * values[7]) -
      values[1] * (values[3] * values[8] - values[5] * values[6]) +
      values[2] * (values[3] * values[7] - values[4] * values[6])
    );
  }

  /**
   * Clean up tensor resources
   */
  dispose(): void {
    this.tensor.dispose();
  }
}