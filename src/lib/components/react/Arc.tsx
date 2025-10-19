import { clsx } from "clsx";
import { motion } from "framer-motion";
import React from "react";
import { Vector2D } from "@/lib/geometry/vector";
import type { TCoordinate } from "@/types/branded.types";

export interface ArcProps {
	center: Vector2D;
	radius: number;
	startAngle: number;
	endAngle: number;
	stroke?: string;
	strokeWidth?: number;
	fill?: string;
	className?: string;
	animated?: boolean;
	onTap?: (event: any) => void;
	onDrag?: (event: any) => void;
	onScale?: (event: any) => void;
	onRotate?: (event: any) => void;
	onHold?: (event: any) => void;
	onApproach?: (event: any) => void;
}

export const Arc: React.FC<ArcProps> = ({
  center,
  radius,
  startAngle,
  endAngle,
  stroke = "currentColor",
  strokeWidth = 1,
  fill = "none",
  className = "",
  animated = false,
  onTap,
  onDrag,
  onScale,
  onRotate,
  onHold,
  onApproach,
}) => {
  const arcRef = React.useRef<HTMLDivElement>(null);

  // Calculate arc properties
  const angle = endAngle - startAngle;
  const largeArcFlag = angle > 180 ? 1 : 0;

  // Convert angles to radians for calculations
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;

  const startX = center.x + radius * Math.cos(startRad);
  const startY = center.y + radius * Math.sin(startRad);
  const endX = center.x + radius * Math.cos(endRad);
  const endY = center.y + radius * Math.sin(endRad);

  // Create SVG path data
  const pathData = [
    `M ${startX} ${startY}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
    ].join(" ");

  // Calculate bounding box for positioning
  const minX = Math.min(startX, endX) - strokeWidth;
  const minY = Math.min(startY, endY) - strokeWidth;
  const width = Math.abs(endX - startX) + strokeWidth * 2;
  const height = Math.abs(endY - startY) + strokeWidth * 2;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onTap?.(e)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDrag) {
      const startPos = { x: e.clientX, y: e.clientY }

      const handleMouseMove = (e: MouseEvent) => {
        const deltaX = e.clientX - startPos.x
        const deltaY = e.clientY - startPos.y
        onDrag(new Vector2D(deltaX as TCoordinate, deltaY as TCoordinate))
      }

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }
  }

  // Set up interaction handlers
  React.useEffect(() => {
    const element = arcRef.current;
    if (!element) return;

    if (onTap) element.addEventListener("tap", onTap);
    if (onScale) element.addEventListener("scale", onScale);
    if (onRotate) element.addEventListener("rotate", onRotate);
    if (onHold) element.addEventListener("hold", onHold);
    if (onApproach) element.addEventListener("approach", onApproach);

    return () => {
      if (onTap) element.removeEventListener("tap", onTap);
      if (onScale) element.removeEventListener("scale", onScale);
      if (onRotate) element.removeEventListener("rotate", onRotate);
      if (onHold) element.removeEventListener("hold", onHold);
      if (onApproach) element.removeEventListener("approach", onApproach);
    };
  }, [onTap, onScale, onRotate, onHold, onApproach]);

	return (
	  <motion.div
	    ref={arcRef}
	    className={clsx("tapspace-arc", className)}
	    style={{
	      position: "absolute",
	      left: minX,
	      top: minY,
	      width: width,
	      height: height,
	      overflow: "visible",
	      cursor: "pointer",
	    }}
	    initial={
	      animated
	        ? {
	            opacity: 0,
	            scale: 0.8,
	          }
	        : undefined
	    }
	    animate={
	      animated
	        ? {
	            opacity: 1,
	            scale: 1,
	          }
	        : undefined
	    }
	    transition={
	      animated
	        ? {
	            duration: 0.6,
	            ease: "easeOut",
	          }
	        : undefined
	    }
	    whileHover={{
	      scale: 1.05,
	      transition: { duration: 0.2 },
	    }}
	    whileTap={{
	      scale: 0.95,
	      transition: { duration: 0.1 },
	    }}
	    onClick={handleClick}
	    onMouseDown={handleMouseDown}
	  >
			<svg
				width={width}
				height={height}
				style={{
					position: "absolute",
					overflow: "visible",
				}}
				role="img"
				aria-label={`Arc from ${startAngle}° to ${endAngle}°`}
			>
				<motion.path
					d={pathData}
					fill={fill}
					stroke={stroke}
					strokeWidth={strokeWidth}
					style={{
						filter: "drop-shadow(0px 0px 2px rgba(0,0,0,0.1))",
						strokeLinecap: "round",
					}}
					initial={
						animated
							? {
									pathLength: 0,
									opacity: 0,
								}
							: undefined
					}
					animate={
						animated
							? {
									pathLength: 1,
									opacity: 1,
								}
							: undefined
					}
					transition={
						animated
							? {
									pathLength: { duration: 1.2, ease: "easeInOut" },
									opacity: { duration: 0.3, delay: 0.2 },
								}
							: undefined
					}
				/>

				{/* Optional: Add center point indicator */}
				{fill === "none" && (
					<circle
						cx={center.x - minX}
						cy={center.y - minY}
						r={Math.max(1, strokeWidth / 2)}
						fill={stroke}
						opacity={0.6}
					/>
				)}
			</svg>
		</motion.div>
	);
};
