"use client"

import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

interface LogoComponentProps {
  className?: string;
}

export const LogoComponent = ({ className }: LogoComponentProps) => {
  const NavigatorIcon = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle 
        cx="50" 
        cy="50" 
        r="46" 
        stroke="#EF4444" 
        strokeWidth="6" 
        fill="none" 
      />
      <path
        d="M50 25L30 65L50 55L70 65L50 25Z"
        fill="#EF4444"
      />
    </svg>
  );

  return (
    <div className={cn("flex items-center gap-2 -ml-1 bg-transparent", className)}>
      <motion.div
        whileHover={{ rotate: 360 }}
        transition={{ duration: 2, ease: "easeInOut" }}
        className="relative w-[36px] h-[36px] flex-shrink-0"
      >
        <NavigatorIcon />
      </motion.div>
      
    </div>
  );
}; 