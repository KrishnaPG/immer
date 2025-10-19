import { motion } from "framer-motion";
import type React from "react";
import styles from "@/styles/components/ZoomControl.module.css";

export interface ZoomControlProps {
	position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
	size?: "small" | "medium" | "large";
	onZoomIn?: () => void;
	onZoomOut?: () => void;
	onReset?: () => void;
}

export const ZoomControl: React.FC<ZoomControlProps> = ({
	position = "top-left",
	size = "medium",
	onZoomIn,
	onZoomOut,
	onReset,
}) => {
	return (
		<motion.div
			className={`${styles.control} ${styles[position]} ${styles[size]}`}
			initial={{ opacity: 0, scale: 0.8 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ delay: 0.2 }}
		>
			<div className={styles.container}>
				<button
					type="button"
					className={styles.button}
					onClick={onZoomIn}
					aria-label="Zoom in"
				>
					+
				</button>
				<button
					type="button"
					className={styles.button}
					onClick={onZoomOut}
					aria-label="Zoom out"
				>
					−
				</button>
				<button
					type="button"
					className={styles.button}
					onClick={onReset}
					aria-label="Reset zoom"
				>
					⟲
				</button>
			</div>
		</motion.div>
	);
};
