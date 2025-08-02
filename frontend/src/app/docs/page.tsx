"use client";
import React from "react";
import { motion } from "framer-motion";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BackgroundBeams } from "@/components/ui/background-beams";
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
    <main className="relative min-h-screen">
      <BackgroundBeams />
      <NavigationHeader />

      <section className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              KATA <span className="gradient-text">Documentation</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to know about using KATA Protocol for cross-chain DeFi trading
            </p>
          </motion.div>

          {/* Quick Start */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="glassmorphism border-0 text-center">
              <CardContent className="p-8">
                <Zap className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                <h2 className="text-2xl font-bold mb-4">Quick Start Guide</h2>
                <p className="text-muted-foreground mb-6">
                  Get started with KATA Protocol in just a few minutes
                </p>
                <div className="flex justify-center">
                  <motion.button
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>Start Trading</span>
                    <ArrowRight className="h-4 w-4" />
                  </motion.button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Documentation Sections */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {docSections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 + 0.3 }}
              >
                <Card className="glassmorphism border-0 hover-lift h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      <section.icon className={`h-6 w-6 ${section.color}`} />
                      <span>{section.title}</span>
                    </CardTitle>
                    <p className="text-muted-foreground">{section.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {section.items.map((item, itemIndex) => (
                        <motion.li
                          key={item}
                          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                          whileHover={{ x: 5 }}
                        >
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{item}</span>
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
                  <Card className="glassmorphism border-0 hover-lift cursor-pointer">
                    <CardContent className="p-6">
                      <tutorial.icon className="h-8 w-8 text-blue-500 mb-4" />
                      <h3 className="font-semibold mb-2">{tutorial.title}</h3>
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
            className="grid md:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            {quickLinks.map((link, index) => (
              <motion.div
                key={link.title}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="glassmorphism border-0 hover-lift cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <link.icon className="h-8 w-8 mx-auto mb-4 text-purple-500" />
                    <h3 className="font-semibold mb-2 flex items-center justify-center space-x-2">
                      <span>{link.title}</span>
                      {link.external && <ExternalLink className="h-4 w-4" />}
                    </h3>
                    <p className="text-sm text-muted-foreground">{link.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </main>
  );
}
