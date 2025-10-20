/**
 * Consolidated hooks exports
 * This file brings together all hook-related functionality in one logical location
 */

export {
	type UseItemReturn,
	useItem,
} from "../components/hooks/useItem";
export {
	type UseSpaceReturn,
	useSpace,
} from "../components/hooks/useSpace";
// Basis and geometry utilities
export { type BasisConfig, useBasis, useCameraBasis } from "./useBasis";
// Base entity management hook
export {
	type EntityBaseConfig,
	type EntityBaseReturn,
	useEntityBase,
} from "./useEntityBase";
// Spatial state hooks
export {
	useActiveSpace,
	useActiveViewport,
	useElements,
	useSpaces,
	useSpatialState,
	useViewports,
} from "./useSpatialState";
// Component hooks (maintain backward compatibility)
export {
	type UseViewportReturn,
	useViewport,
} from "./useViewport";
