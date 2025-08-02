"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FloatingDockProps {
  items: {
    title: string;
    icon: React.ReactNode;
    href: string;
  }[];
  className?: string;
}

export const FloatingDock = ({ items, className }: FloatingDockProps) => {
  return (
    <div className={cn("fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50", className)}>
      <motion.div
        className="flex items-center space-x-2 glassmorphism rounded-2xl px-4 py-3"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {items.map((item, index) => (
          <motion.a
            key={item.title}
            href={item.href}
            className="relative flex items-center justify-center w-12 h-12 rounded-xl hover:bg-white/10 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.3 }}
          >
            {item.icon}
            <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity">
              {item.title}
            </span>
          </motion.a>
        ))}
      </motion.div>
    </div>
  );
};
