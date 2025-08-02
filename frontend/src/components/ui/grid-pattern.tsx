"use client";
import React, { useId } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GridPatternProps {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  className?: string;
  strokeDasharray?: string | number;
}

export const GridPattern = ({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = 0,
  className,
  ...props
}: GridPatternProps) => {
  const id = useId();

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-gray-400/30 stroke-gray-400/30",
        className
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
};

interface BeamProps {
  className?: string;
  delay?: number;
}

export const Beam = ({ className, delay = 0 }: BeamProps) => {
  return (
    <motion.div
      initial={{ translateY: 0, scaleY: 0 }}
      animate={{ translateY: -100, scaleY: 1 }}
      transition={{
        duration: 2,
        repeat: Infinity,
        delay,
        ease: "linear",
      }}
      className={cn(
        "absolute top-0 h-full w-0.5 bg-gradient-to-t from-transparent via-blue-500 to-transparent opacity-75",
        className
      )}
    />
  );
};
