import type React from "react";
import { createContext, useContext } from "react";
import { useSpatialState } from "../components/hooks/useSpatialState";
import type { Viewport } from "../imperative/Viewport";

interface SpatialContextType {
	// Imperative API context
	viewport: Viewport | null;
	currentSpace: any | null;
	coordinateSystem: any | null;

	// Valtio store integration
	store: ReturnType<typeof useSpatialState>;
}

export const SpatialContext = createContext<SpatialContextType | null>(null);

export const useSpatialContext = () => {
	const context = useContext(SpatialContext);
	if (!context) {
		throw new Error("useSpatialContext must be used within SpatialProvider");
	}
	return context;
};

interface SpatialProviderProps {
	children: React.ReactNode;
	viewport?: Viewport | null;
	currentSpace?: any | null;
	coordinateSystem?: any | null;
}

export const SpatialProvider: React.FC<SpatialProviderProps> = ({
	children,
	viewport = null,
	currentSpace = null,
	coordinateSystem = null,
}) => {
	// Get Valtio store state
	const store = useSpatialState();

	const contextValue: SpatialContextType = {
		viewport,
		currentSpace,
		coordinateSystem,
		store,
	};

	return (
		<SpatialContext.Provider value={contextValue}>
			{children}
		</SpatialContext.Provider>
	);
};
