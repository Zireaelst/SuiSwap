"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, 
  X, 
  Wallet, 
  Settings, 
  BarChart3, 
  ArrowUpDown,
  Zap,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

export const NavigationHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const navItems = [
    { name: "Trading", href: "/trading", icon: ArrowUpDown },
    { name: "Portfolio", href: "/portfolio", icon: BarChart3 },
    { name: "Analytics", href: "/analytics", icon: Zap },
    { name: "Docs", href: "/docs", icon: Shield },
  ];

  return (
    <motion.nav
      className="relative z-50 w-full"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <motion.div
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 opacity-20 blur"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">KATA</h1>
              <p className="text-xs text-muted-foreground">Protocol</p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item, index) => (
              <motion.a
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  "hover:bg-accent hover:text-accent-foreground"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </motion.a>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Network Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Badge variant="secondary" className="hidden sm:flex items-center space-x-1">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-xs">Ethereum</span>
              </Badge>
            </motion.div>

            {/* Wallet Connection */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                onClick={() => setIsConnected(!isConnected)}
                className={cn(
                  "relative",
                  isConnected 
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700" 
                    : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                )}
              >
                <Wallet className="h-4 w-4 mr-2" />
                {isConnected ? "0x1234...5678" : "Connect Wallet"}
              </Button>
            </motion.div>

            {/* Settings */}
            <motion.button
              className="p-2 rounded-lg hover:bg-accent transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, rotate: -180 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Settings className="h-5 w-5" />
            </motion.button>

            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              whileTap={{ scale: 0.9 }}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="absolute top-full left-0 right-0 md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="glassmorphism m-4 rounded-2xl p-6 space-y-4">
              {navItems.map((item, index) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
