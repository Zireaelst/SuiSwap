"use client";
import React from "react";
import { motion } from "framer-motion";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Spotlight } from "@/components/ui/spotlight";
import {
  BookOpen,
  Code,
  GitBranch,
  Zap,
  Shield,
  ArrowRight,
  ExternalLink,
  Clock,
  TrendingUp,
  ArrowUpDown,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const docSections = [
  {
    title: "Getting Started",
    description: "Learn the basics of KATA Protocol and start trading",
    icon: BookOpen,
    color: "text-blue-500",
    items: [
      "What is KATA Protocol",
      "Connect Your Wallet",
      "First Cross-Chain Swap",
      "Understanding Gas Fees",
    ],
  },
  {
    title: "Trading Features",
    description: "Master advanced trading strategies and order types",
    icon: TrendingUp,
    color: "text-green-500",
    items: [
      "Instant Swaps",
      "Limit Orders",
      "TWAP Strategies",
      "Cross-Chain Trading",
    ],
  },
  {
    title: "Developer Docs",
    description: "Integrate KATA Protocol into your applications",
    icon: Code,
    color: "text-purple-500",
    items: [
      "API Reference",
      "Smart Contracts",
      "SDK Integration",
      "Code Examples",
    ],
  },
  {
    title: "Security",
    description: "Learn about our security measures and best practices",
    icon: Shield,
    color: "text-orange-500",
    items: [
      "Audit Reports",
      "Security Best Practices",
      "Bug Bounty Program",
      "Emergency Procedures",
    ],
  },
];

const quickLinks = [
  {
    title: "Smart Contracts",
    description: "View our verified smart contracts on-chain",
    icon: GitBranch,
    href: "#",
    external: true,
  },
  {
    title: "API Documentation",
    description: "Complete API reference for developers",
    icon: Code,
    href: "#",
    external: true,
  },
  {
    title: "GitHub Repository",
    description: "Access our open-source codebase",
    icon: ExternalLink,
    href: "#",
    external: true,
  },
];

const tutorials = [
  {
    title: "How to perform your first cross-chain swap",
    duration: "5 min read",
    difficulty: "Beginner",
    icon: ArrowUpDown,
  },
  {
    title: "Setting up TWAP orders for large trades",
    duration: "8 min read",
    difficulty: "Intermediate",
    icon: Clock,
  },
  {
    title: "Advanced limit order strategies",
    duration: "12 min read",
    difficulty: "Advanced",
    icon: TrendingUp,
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <BackgroundBeams />
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      
      <NavigationHeader />

            <main className="relative pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            className="text-center mb-16 space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Badge variant="secondary" className="glassmorphism border-white/20 bg-white/10 text-white/90 px-4 py-2">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Comprehensive Documentation
                </Badge>
              </motion.div>
              
              <motion.h1
                className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                KATA
                <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Documentation
                </span>
              </motion.h1>
              
              <motion.p
                className="text-xl md:text-2xl text-white/70 max-w-4xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Master cross-chain DeFi trading with 1inch API integration and advanced strategies.
                Complete guides, tutorials, and API references.
              </motion.p>
            </div>
          </motion.div>

          {/* Quick Start */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="glassmorphism border-white/20 bg-white/5 backdrop-blur-xl text-center">
              <CardContent className="p-8">
                <div className="p-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl text-white inline-flex mb-6">
                  <Zap className="h-12 w-12" />
                </div>
                <h2 className="text-3xl font-bold mb-4 text-white">Quick Start Guide</h2>
                <p className="text-white/70 mb-8 text-lg leading-relaxed">
                  Get started with KATA Protocol in just a few minutes. Learn the basics and start trading.
                </p>
                <motion.button
                  className="flex items-center space-x-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-medium transition-colors mx-auto"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-lg">Start Trading</span>
                  <ArrowRight className="h-5 w-5" />
                </motion.button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Documentation Sections */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {docSections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 + 0.8 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className="glassmorphism border-white/20 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 h-full group">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-4 text-white text-xl">
                      <div className={`p-3 bg-gradient-to-r ${section.color === 'text-blue-500' ? 'from-blue-500 to-cyan-500' : section.color === 'text-green-500' ? 'from-green-500 to-emerald-500' : section.color === 'text-purple-500' ? 'from-purple-500 to-pink-500' : 'from-orange-500 to-red-500'} rounded-xl text-white group-hover:scale-110 transition-transform`}>
                        <section.icon className="h-6 w-6" />
                      </div>
                      <span className="group-hover:text-blue-200 transition-colors">{section.title}</span>
                    </CardTitle>
                    <p className="text-white/70 leading-relaxed">{section.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {section.items.map((item) => (
                        <motion.li
                          key={item}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group/item"
                          whileHover={{ x: 5 }}
                        >
                          <ChevronRight className="h-4 w-4 text-blue-400 group-hover/item:text-blue-300" />
                          <span className="text-white/80 group-hover/item:text-white transition-colors">{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Tutorials */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <h2 className="text-3xl font-bold mb-8 text-center">
              Featured <span className="gradient-text">Tutorials</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {tutorials.map((tutorial, index) => (
                <motion.div
                  key={tutorial.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 + 0.8 }}
                >
                  <Card className="backdrop-blur-sm bg-white/5 border-white/20 hover:bg-white/10 transition-all duration-300 cursor-pointer">
                    <CardContent className="p-6">
                      <tutorial.icon className="h-8 w-8 text-blue-500 mb-4" />
                      <h3 className="font-semibold mb-2 text-white">{tutorial.title}</h3>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{tutorial.duration}</span>
                        <Badge variant="secondary">{tutorial.difficulty}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
              Quick Links
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
            {quickLinks.map((link, index) => (
              <motion.div
                key={link.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 + 1.4 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <Card className="glassmorphism border-white/20 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 h-full group cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className={`inline-flex p-4 bg-gradient-to-r ${link.title === 'GitHub Repository' ? 'from-gray-500 to-gray-700' : link.title === 'API Reference' ? 'from-blue-500 to-cyan-500' : 'from-green-500 to-emerald-500'} rounded-xl mb-4 group-hover:scale-110 transition-transform`}>
                      <link.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2 flex items-center justify-center gap-2 text-white text-lg group-hover:text-blue-200 transition-colors">
                      <span>{link.title}</span>
                      {link.external && <ExternalLink className="h-4 w-4" />}
                    </h3>
                    <p className="text-white/70 leading-relaxed">{link.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
