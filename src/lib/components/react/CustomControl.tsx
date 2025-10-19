import { motion } from "framer-motion";
import type React from "react";
import styles from "@/styles/components/CustomControl.module.css";

export interface CustomControlProps {
	position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
	children: React.ReactNode;
	className?: string;
	onPositionChange?: (position: { x: number; y: number }) => void;
}

export const CustomControl: React.FC<CustomControlProps> = ({
	position = "top-right",
	children,
	className = "",
	onPositionChange,
}) => {
	return (
		<motion.div
			className={`${styles.control} ${styles[position]} ${className}`}
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.3 }}
			drag
			dragMomentum={false}
			onDragEnd={(_, { offset }) => {
				onPositionChange?.(offset);
			}}
		>
			{children}
		</motion.div>
	);
};
