/**
 * Branded Types for Domain API
 * These provide stricter type safety by creating unique types for semantically different strings
 */

// Create a branded type utility
export declare const __brand: unique symbol;

// The brand stores both the root base-type and the accumulated tags
export type Brand<Root, Tags extends string> = {
  readonly [__brand]: {
    root: Root;
    tags: Record<Tags, true>;
  };
};

// Accumulate brands and preserve root
export type Branded<Base, Tag extends string> =
  Base extends { readonly [__brand]: { root: infer R; tags: infer T } }
    ? R & Brand<R, keyof T & string | Tag> // merge existing tags + new tag
    : Base & Brand<Base, Tag>;

/**
 * Type extraction helpers
 * @examples
 *  ```ts
      type RootType = RootOf<TGitRepoRootPath>; // string
      type AllTags = TagsOf<TGitRepoRootPath>; // "FolderPath" | "GitRepoRoot"
 *  ```
 */
export type RootOf<T> = T extends { readonly [__brand]: { root: infer R } } ? R : never;
export type TagsOf<T> = T extends { readonly [__brand]: { tags: Record<infer K, true> } } ? K : never;


/**
 * Utility types to strip brands from interface fields recursively
 */
type StripBrand<T> =  RootOf<T>;
export type StripBrands<T> = { [K in keyof T]: StripBrand<T[K]>; };


// basic types
export type TName = Branded<string, "Generic Name">;
export type TDescription = Branded<string, "Description">;
export type TEMail = Branded<string, "EMail">;

export type TSize = Branded<number, "Size">;
export type TCount = Branded<number, "Count">;
export type TIndexPos = Branded<number, "IndexPos">;

export type TJsonString = Branded<string, "JsonString">;

// time types
export type TMSSinceEpoch = Branded<number, "MSSinceEpoch">;
export type TSecSinceEpoch = Branded<number, "SecSinceEpoch">;
export type TISOString = Branded<string, "ISO Time String">;


// basic file/folder path types
export type TFileBaseName = Branded<TName, "FileBaseName">; // filename without ext
export type TFilePath = Branded<string, "FilePath">;
export type TFolderPath = Branded<string, "FolderPath">;
export type TFileHandle = Branded<number, "FileHandler">;

// Encoded Strings
export type TB58String = Branded<string, "B58String">;
export type TB64String = Branded<string, "B64String">;
export type THexString = Branded<string, "HexString">;

// SHA1/256
export type TSHA1Hex = Branded<THexString, "HexChar[40]">;
export type TSHA256B58 = Branded<TB58String, "sha256 base58 string">;
export type TSHA256B64 = Branded<TB64String, "sha256 base64 string">;
export type TSHA256Hex = Branded<TB58String, "sha256 hex string">;

// SQL String
export type TSQLString = Branded<string, "SQL">;

// Tapspace-specific types
export type TSpaceId = Branded<string, "SpaceId">;
export type TElementId = Branded<string, "ElementId">;
export type TViewportId = Branded<string, "ViewportId">;
export type TTransformId = Branded<string, "TransformId">;

// Geometry types
export type TAngle = Branded<number, "Angle">;
export type TScale = Branded<number, "Scale">;
export type TDistance = Branded<number, "Distance">;
export type TWidth  = Branded<TDistance, "Width">;
export type THeight = Branded<TDistance, "Height">;

export type TCoordinate = Branded<number, "Coordinate">;
export type TCoordinateX = Branded<TCoordinate, "CoordinateX">;
export type TCoordinateY = Branded<TCoordinate, "CoordinateY">;
export type TCoordinateZ = Branded<TCoordinate, "CoordinateZ">;


// Vector types
export type TVector2D = Branded<[TCoordinate, TCoordinate], "Vector2D">;
export type TVector3D = Branded<[TCoordinate, TCoordinate, TCoordinate], "Vector3D">;

// Matrix types
export type TMatrix3x3 = Branded<Float32Array, "Matrix3x3">;
export type TMatrix4x4 = Branded<Float32Array, "Matrix4x4">;

// Affine transform types
export type TAffineTransform = Branded<TMatrix3x3, "AffineTransform">;
export type TTransformOrigin = Branded<TVector2D, "TransformOrigin">;

// Interaction types
export type TGestureType = Branded<string, "GestureType">;
export type TInteractionMode = Branded<string, "InteractionMode">;

// Animation types
export type TAnimationDuration = Branded<number, "AnimationDuration">;
export type TAnimationEasing = Branded<string, "AnimationEasing">;

// Component types
export type TComponentType = Branded<string, "ComponentType">;
export type TElementType = Branded<string, "ElementType">;

// State types
export type TStateKey = Branded<string, "StateKey">;
export type TStateValue = Branded<unknown, "StateValue">;