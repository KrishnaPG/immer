import { useMemo } from 'react';
import { useSnapshot } from 'valtio';
import { Basis } from '@/lib/geometry/Basis';
import { AffineTransform } from '@/lib/geometry/transform';
import { Vector } from '@/lib/geometry/vector';
import { store, viewportActions } from '@/lib/state/store';
import type { TSpaceId, TViewportId } from '@/types/branded.types';
import type { ICamera, IViewport } from '@/types/core.interfaces';

export interface UseViewportReturn {
	viewport?: IViewport;
	basis: Basis;
	camera?: ICamera;
	updateCamera: (updates: Partial<unknown>) => void;
}

export const useViewport = (id?: string): UseViewportReturn => {
	const snapshot = useSnapshot(store);

	// Generate viewport ID if not provided
	const viewportId = useMemo(() => id || `viewport-${Math.random().toString(36).substr(2, 9)}`, [id]) as TViewportId;

	// Get or create viewport in store
	const viewport = useMemo(() => {
		// Create a default space for the viewport if needed
		const spaceId = `space-${viewportId}` as TSpaceId;
		if (!snapshot.spaces.has(spaceId)) {
			// Space doesn't exist, we can't create viewport yet
			return undefined;
		}

		if (!snapshot.viewports.has(viewportId)) {
			// Create viewport with existing space
			viewportActions.createViewport(viewportId, spaceId, document.createElement('div'));
		}
		return snapshot.viewports.get(viewportId);
	}, [viewportId, snapshot.viewports, snapshot.spaces]);

	// Create basis from camera transform
	const basis = useMemo(() => {
		if (viewport) {
			const camera = viewport.camera;
			const identityBasis = new Basis(AffineTransform.identity());
			const translationVector = new Vector(identityBasis, {
				x: -(camera.position.x as number),
				y: -(camera.position.y as number)
			});
			const translateTransform = AffineTransform.translateBy(translationVector);
			const scaleTransform = AffineTransform.scaleBy(camera.zoom as number);
			const transformMatrix = translateTransform.compose(scaleTransform);
			return new Basis(transformMatrix);
		}
		return new Basis(AffineTransform.identity());
	}, [viewport]);

	// Camera update function
	const updateCamera = useMemo(() => (updates: Partial<unknown>) => {
		if (viewport) {
			Object.assign(viewport.camera, updates);
		}
	}, [viewport]);

	return {
		viewport,
		basis,
		camera: viewport?.camera,
		updateCamera,
	};
};