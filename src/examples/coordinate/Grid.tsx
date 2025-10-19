import type React from "react";
import { useMemo } from "react";
import { Item, Space, Viewport } from "@/lib/components";
import { Basis } from "@/lib/geometry/Basis";
import { AffineTransform } from "@/lib/geometry/transform";
import { Vector } from "@/lib/geometry/vector";

export interface GridProps {
	size?: number;
	step?: number;
	color?: string;
}

export const Grid: React.FC<GridProps> = ({
	size = 1000,
	step = 50,
	color = "#e0e0e0",
}) => {
	const gridLines = useMemo(() => {
		const lines = [];

		// Vertical lines
		for (let x = -size; x <= size; x += step) {
			lines.push(
				<Item key={`v-${x}`}>
					<div
						style={{
							position: "absolute",
							left: `${x}px`,
							top: `${-size}px`,
							width: "1px",
							height: `${size * 2}px`,
							backgroundColor: color,
							opacity: x === 0 ? 0.8 : 0.3,
						}}
					/>
				</Item>,
			);
		}

		// Horizontal lines
		for (let y = -size; y <= size; y += step) {
			lines.push(
				<Item key={`h-${y}`}>
					<div
						style={{
							position: "absolute",
							left: `${-size}px`,
							top: `${y}px`,
							width: `${size * 2}px`,
							height: "1px",
							backgroundColor: color,
							opacity: y === 0 ? 0.8 : 0.3,
						}}
					/>
				</Item>,
			);
		}

		// Axis labels
		lines.push(
			<Item key="x-axis-label">
				<div
					style={{
						position: "absolute",
						left: `${size - 30}px`,
						top: "10px",
						fontSize: "12px",
						color: "#666",
						fontFamily: "monospace",
					}}
				>
					X
				</div>
			</Item>,
		);

		lines.push(
			<Item key="y-axis-label">
				<div
					style={{
						position: "absolute",
						left: "10px",
						top: `${size - 20}px`,
						fontSize: "12px",
						color: "#666",
						fontFamily: "monospace",
					}}
				>
					Y
				</div>
			</Item>,
		);

		return lines;
	}, [size, step, color]);

	return (
		<div style={{ width: "100%", height: "400px" }}>
			<Viewport width="100%" height="100%">
				<Space>
					{gridLines}

					{/* Interactive draggable items */}
					<Item x={100} y={100} draggable={true}>
						<div
							style={{
								width: "60px",
								height: "60px",
								backgroundColor: "#ff6b6b",
								borderRadius: "50%",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								color: "white",
								fontSize: "12px",
								fontWeight: "bold",
								cursor: "move",
								userSelect: "none",
							}}
						>
							Drag
						</div>
					</Item>

					<Item x={-150} y={-80} draggable={true}>
						<div
							style={{
								width: "80px",
								height: "40px",
								backgroundColor: "#4ecdc4",
								borderRadius: "4px",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								color: "white",
								fontSize: "11px",
								cursor: "move",
								userSelect: "none",
							}}
						>
							Rectangle
						</div>
					</Item>
				</Space>
			</Viewport>
		</div>
	);
};
