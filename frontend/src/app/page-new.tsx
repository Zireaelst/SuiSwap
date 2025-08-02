"use client";
import React from "react";
import { motion } from "framer-motion";
import { NavigationHeader } from "@/components/NavigationHeader";
import { ModernSwapInterface } from "@/components/ModernSwapInterface";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Spotlight } from "@/components/ui/spotlight";
import { FloatingDock } from "@/components/ui/floating-dock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Shield,
  Zap,
  ArrowUpDown,
  DollarSign,
  Activity
} from "lucide-react";

const statsCards = [
  {
    title: "Total Volume",
    value: "$2.4B",
    change: "+12.5%",
    icon: DollarSign,
    color: "text-green-500"
  },
  {
    title: "Active Orders",
    value: "1,247",
    change: "+5.2%",
    icon: Activity,
    color: "text-blue-500"
  },
  {
    title: "Average Slippage",
    value: "0.15%",
    change: "-0.05%",
    icon: TrendingUp,
    color: "text-purple-500"
  },
  {
    title: "Gas Saved",
    value: "$45K",
    change: "+8.3%",
    icon: Zap,
    color: "text-orange-500"
  }
];

const dockItems = [
  { title: "Swap", icon: <ArrowUpDown className="h-6 w-6" />, href: "/" },
  { title: "Portfolio", icon: <BarChart3 className="h-6 w-6" />, href: "/portfolio" },
  { title: "Orders", icon: <Clock className="h-6 w-6" />, href: "/orders" },
  { title: "Analytics", icon: <TrendingUp className="h-6 w-6" />, href: "/analytics" },
  { title: "Security", icon: <Shield className="h-6 w-6" />, href: "/security" },
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen">
      {/* Background Effects */}
      <BackgroundBeams />
      <Spotlight className="hidden md:block" />
      
      {/* Navigation */}
      <NavigationHeader />

      {/* Hero Section */}
      <section className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Badge variant="secondary" className="mb-4 glassmorphism">
                    <Zap className="h-3 w-3 mr-1" />
                    Cross-Chain DeFi Protocol
                  </Badge>
                </motion.div>
                
                <motion.h1
                  className="text-4xl md:text-6xl font-bold"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Advanced Trading
                  <span className="block gradient-text">
                    Made Simple
                  </span>
                </motion.h1>
                
                <motion.p
                  className="text-xl text-muted-foreground leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Experience the future of DeFi with programmable trading strategies, 
                  cross-chain swaps, and advanced order types powered by KATA Protocol.
                </motion.p>
              </div>

              {/* Feature Highlights */}
              <motion.div
                className="grid grid-cols-2 gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {[
                  { icon: Clock, title: "TWAP Orders", desc: "Time-weighted execution" },
                  { icon: TrendingUp, title: "Limit Orders", desc: "Set your target price" },
                  { icon: Shield, title: "Cross-Chain", desc: "Ethereum & Sui support" },
                  { icon: Zap, title: "Low Fees", desc: "Optimized gas usage" },
                ].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    className="p-4 glassmorphism rounded-xl hover-lift"
                    whileHover={{ scale: 1.05 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <feature.icon className="h-8 w-8 text-blue-500 mb-2" />
                    <h3 className="font-semibold text-sm">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground">{feature.desc}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Content - Swap Interface */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <ModernSwapInterface />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Protocol <span className="gradient-text">Analytics</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Real-time insights into the KATA ecosystem
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="glassmorphism border-0 hover-lift">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className={stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}>
                        {stat.change}
                      </span>
                      {' '}from last month
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Floating Dock */}
      <FloatingDock items={dockItems} />
    </main>
  );
}
