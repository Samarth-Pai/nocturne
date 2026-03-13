"use client";

import { motion, HTMLMotionProps } from "framer-motion";

interface BentoBoxProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
}

export function BentoBox({ children, className, ...props }: BentoBoxProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { type: "spring", stiffness: 260, damping: 20 },
        },
      }}
      className={`rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-md shadow-lg ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
