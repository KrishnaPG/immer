import { clsx } from "clsx";
import { motion } from "framer-motion";
import React from "react";
import { Vector2D } from "@/lib/geometry/vector";
import type { TCoordinate } from "@/types/branded.types";

export interface EdgeProps {
	startPoint: Vector2D;
	endPoint: Vector2D;
	stroke?: string;
	strokeWidth?: number;
	strokeDasharray?: string;
	className?: string;
	animated?: boolean;
	onTap?: (event: any) => void;
	onDrag?: (event: any) => void;
	onScale?: (event: any) => void;
	onRotate?: (event: any) => void;
	onHold?: (event: any) => void;
	onApproach?: (event: any) => void;
}

export const Edge: React.FC<EdgeProps> = ({
  startPoint,
  endPoint,
  stroke = "currentColor",
  strokeWidth = 1,
  strokeDasharray,
  className = "",
  animated = false,
  onTap,
  onDrag,
  onScale,
  onRotate,
  onHold,
  onApproach,
}) => {
  const edgeRef = React.useRef<HTMLDivElement>(null);

  // Calculate edge properties
  const dx = endPoint.x - startPoint.x;
  const dy = endPoint.y - startPoint.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

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
    const element = edgeRef.current;
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
	    ref={edgeRef}
	    className={clsx("tapspace-edge", className)}
	    style={{
	      position: "absolute",
	      width: length,
	      height: strokeWidth,
	      backgroundColor: stroke,
	      border: "none",
	      transform: `translate(${startPoint.x}px, ${startPoint.y}px) rotate(${angle}deg)`,
	      transformOrigin: "0 50%",
	      cursor: "pointer",
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
	            pathLength: { duration: 0.8, ease: "easeInOut" },
	            opacity: { duration: 0.3 },
	          }
	        : undefined
	    }
	    whileHover={{
	      height: strokeWidth * 1.5,
	      transition: { duration: 0.2 },
	    }}
	    whileTap={{
	      height: strokeWidth * 0.8,
	      transition: { duration: 0.1 },
	    }}
	    onClick={handleClick}
	    onMouseDown={handleMouseDown}
	  >
			{/* SVG-based edge for better rendering */}
			<svg
				width={length}
				height={strokeWidth * 2}
				style={{
					position: "absolute",
					top: -strokeWidth,
					left: 0,
					overflow: "visible",
				}}
				role="img"
				aria-label="Edge connection"
			>
				<line
					x1={0}
					y1={strokeWidth}
					x2={length}
					y2={strokeWidth}
					stroke={stroke}
					strokeWidth={strokeWidth}
					strokeDasharray={strokeDasharray}
					style={{
						filter: "drop-shadow(0px 0px 2px rgba(0,0,0,0.1))",
					}}
				/>
			</svg>
		</motion.div>
	);
};
