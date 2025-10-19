import { clsx } from "clsx";
import { motion } from "framer-motion";
import React from "react";
import { Vector2D } from "@/lib/geometry/vector";
import type { TCoordinate } from "@/types/branded.types";

export interface NodeProps {
	radius?: number;
	position?: Vector2D;
	fill?: string;
	stroke?: string;
	strokeWidth?: number;
	interactive?: boolean;
	className?: string;
	onTap?: (event: any) => void;
	onDrag?: (event: any) => void;
	onScale?: (event: any) => void;
	onRotate?: (event: any) => void;
	onHold?: (event: any) => void;
	onApproach?: (event: any) => void;
}

export const Node: React.FC<NodeProps> = ({
  radius = 10,
  position = new Vector2D(0 as TCoordinate, 0 as TCoordinate),
  fill = "currentColor",
  stroke = "none",
  strokeWidth = 0,
  interactive = true,
  className = "",
  onTap,
  onDrag,
  onScale,
  onRotate,
  onHold,
  onApproach,
}) => {
  const nodeRef = React.useRef<HTMLDivElement>(null);

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

  // Set up interaction handlers if interactive
  React.useEffect(() => {
    const element = nodeRef.current;
    if (!element || !interactive) return;

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
  }, [interactive, onTap, onScale, onRotate, onHold, onApproach]);

	return (
	  <motion.div
	    ref={nodeRef}
	    className={clsx("tapspace-node", className)}
	    style={{
	      position: "absolute",
	      width: radius * 2,
	      height: radius * 2,
	      borderRadius: "50%",
	      backgroundColor: fill,
	      border: strokeWidth ? `${strokeWidth}px solid ${stroke}` : stroke,
	      transform: `translate(${position.x - radius}px, ${position.y - radius}px)`,
	      cursor: interactive ? "pointer" : "default",
	    }}
	    initial={{
	      x: position.x - radius,
	      y: position.y - radius,
	      scale: 1,
	    }}
	    animate={{
	      x: position.x - radius,
	      y: position.y - radius,
	    }}
	    transition={{
	      type: "spring",
	      stiffness: 300,
	      damping: 30,
	    }}
	    whileHover={
	      interactive
	        ? {
	            scale: 1.1,
	            transition: { duration: 0.2 },
	          }
	        : undefined
	    }
	    whileTap={
	      interactive
	        ? {
	            scale: 0.95,
	            transition: { duration: 0.1 },
	          }
	        : undefined
	    }
	    onClick={interactive ? handleClick : undefined}
	    onMouseDown={interactive ? handleMouseDown : undefined}
	  />
	);
};
