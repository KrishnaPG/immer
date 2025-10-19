import type { ITransform } from "./geometry";

// Animation options
export interface IAnimationOptions {
  readonly duration?: number;
  readonly easing?: TEasingFunction;
  readonly delay?: number;
}

// Easing function type
export type TEasingFunction =
  | "linear"
  | "ease-in"
  | "ease-out"
  | "ease-in-out"
  | "bounce"
  | "elastic";

// Transition interface
export interface ITransition {
  readonly from: ITransform;
  readonly to: ITransform;
  readonly options: IAnimationOptions;
}