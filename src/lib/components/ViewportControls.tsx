import type React from "react";

export interface ViewportControlsProps {
	className?: string;
}

export const ViewportControls: React.FC<ViewportControlsProps> = ({
	className = "",
}) => {
	return (
		<div className={`affine-controls ${className}`}>
			{/* Default viewport controls would go here */}
			{/* Zoom controls, pan controls, etc. */}
		</div>
	);
};
