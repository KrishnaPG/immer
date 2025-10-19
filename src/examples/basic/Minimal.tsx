import type React from "react";
import { Item, Space, Viewport } from "@/lib/components";

export const Minimal: React.FC = () => {
	return (
		<div style={{ width: "100%", height: "400px" }}>
			<Viewport width="100%" height="100%">
				<Space id="main-space">
					{/* Simple colored squares demonstrating basic positioning */}
					<Item x={-100} y={-50} spaceId="main-space">
						<div
							style={{
								width: "80px",
								height: "80px",
								backgroundColor: "#ff6b6b",
								borderRadius: "8px",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								color: "white",
								fontSize: "14px",
								fontWeight: "bold",
								userSelect: "none",
							}}
						>
							Red
						</div>
					</Item>

					<Item x={100} y={-50} spaceId="main-space">
						<div
							style={{
								width: "80px",
								height: "80px",
								backgroundColor: "#4ecdc4",
								borderRadius: "8px",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								color: "white",
								fontSize: "14px",
								fontWeight: "bold",
								userSelect: "none",
							}}
						>
							Blue
						</div>
					</Item>

					<Item x={-50} y={100} spaceId="main-space">
						<div
							style={{
								width: "80px",
								height: "80px",
								backgroundColor: "#45b7d1",
								borderRadius: "8px",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								color: "white",
								fontSize: "14px",
								fontWeight: "bold",
								userSelect: "none",
							}}
						>
							Green
						</div>
					</Item>

					<Item x={50} y={100} spaceId="main-space">
						<div
							style={{
								width: "80px",
								height: "80px",
								backgroundColor: "#f9ca24",
								borderRadius: "8px",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								color: "white",
								fontSize: "14px",
								fontWeight: "bold",
								userSelect: "none",
							}}
						>
							Yellow
						</div>
					</Item>
				</Space>
			</Viewport>
		</div>
	);
};
