"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { TypewriterEffectSmooth } from "./ui/typewriter-effect";
import Login from "./Login";
import FeatureCarousel from "./Carousel";
import Marquee from "./ui/marquee";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ShieldCheck,
  Layers,
  BellIcon,
  CalendarIcon,
} from "lucide-react";

const ExploreSection = () => {
  const words = [
    {
      text: "Do",
      className: "text-black text-3xl font-montserrat",
    },
    {
      text: "PERSONAL",
      className: "text-black text-3xl font-montserrat",
    },
    {
      text: "AGENT",
      className: "text-black text-3xl font-montserrat",
    },
    {
      text: "COMPANION",
      className: "text-black text-3xl font-montserrat",
    },
    {
      text: "ON",
      className: "text-black text-3xl font-montserrat",
    },
    {
      text: "APTOS",
      className: "text-black text-3xl font-montserrat",
    },
    {
      text: "AURORA",
      className: "text-black text-4xl font-montserrat font-bold",
    },
  ];

  // Features data for BentoGrid
  const features = [
    {
      Icon: Sparkles,
      name: "SMART TRADING",
      description:
        "Advanced trading tools with real-time analytics for optimal performance.",
      href: "/smart-trading",
      cta: "Learn More",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 opacity-20" />
      ),
      className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
    },
    {
      Icon: ShieldCheck,
      name: "SECURE STORAGE",
      description:
        "Military-grade encryption for your assets with multi-layer protection.",
      href: "/secure-storage",
      cta: "Learn More",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-teal-500 opacity-20" />
      ),
      className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
    },
    {
      Icon: Layers,
      name: "MULTI-CHAIN SUPPORT",
      description:
        "Support for all major blockchain networks in one unified platform.",
      href: "/multi-chain-support",
      cta: "Learn More",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-orange-500 opacity-20" />
      ),
      className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
    },
    {
      Icon: CalendarIcon,
      name: "SCHEDULED PAYMENTS",
      description:
        "Automate utility payments and recurring transactions with ease.",
      href: "/scheduled-payments",
      cta: "Learn More",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-red-500 opacity-20" />
      ),
      className: "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2",
    },
    {
      Icon: BellIcon,
      name: "REAL-TIME NOTIFICATIONS",
      description:
        "Stay informed with instant alerts for trades, payments, and updates.",
      href: "/notifications",
      cta: "Learn More",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-violet-500 opacity-20" />
      ),
      className: "lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4",
    },
  ];

  return (
    <div className="bg-white text-black min-h-screen">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-black font-montserrat text-2xl font-light mb-4 border-b border-black pb-2 inline-block">
              WELCOME TO THE FUTURE
            </h2>

            <div className="mt-6">
              <TypewriterEffectSmooth words={words} />
            </div>

            <p className="mt-8 text-lg leading-relaxed font-montserrat border border-black p-6 rounded-2xl">
              Aurora: Your All-in-One Personal Agent on Aptos. Seamlessly manage wallets,
              trade with Echelon and Joule Finance, and make utility payments—all in one intuitive interface.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row gap-6">
              <button
                onClick={Login}
                className="px-8 py-4 bg-black text-white font-montserrat font-bold text-lg transition-transform hover:scale-105 rounded-full"
              >
                LOGIN TO DASHBOARD
              </button>
              <a
                href="#"
                className="px-8 py-4 border border-black text-black font-montserrat text-lg flex items-center justify-center sm:justify-start gap-2 transition-transform hover:scale-105 rounded-full"
              >
                LEARN MORE <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="bg-white rounded-2xl overflow-hidden">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/creative-SW6QDQbcVuwPgb6a2CYtYmRbsJa4k1.png"
                alt="Aurora Dashboard"
                className="w-full filter contrast-125 brightness-110 mix-blend-multiply"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section - Updated with BentoGrid */}
      <div className="bg-white text-black py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-montserrat font-bold text-center mb-16">
            KEY FEATURES
          </h2>

          <BentoGrid className="lg:grid-rows-3">
            {features.map((feature) => (
              <BentoCard key={feature.name} {...feature} />
            ))}
          </BentoGrid>
        </div>
        <div className="relative mt-12">
          <FeatureCarousel />
        </div>
      </div>
      <Marquee />

      {/* CTA Section */}
      <div className="bg-white text-black py-24 border-t border-black">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-montserrat font-bold mb-8">
            READY TO GET STARTED?
          </h2>
          <p className="text-xl font-montserrat max-w-2xl mx-auto mb-12">
            Join thousands of users already transforming their financial future
            with Aurora.
          </p>
          <Button
            size="lg"
            onClick={Login}
            className="px-12 py-5 bg-black text-white font-montserrat font-bold text-lg transition-transform hover:scale-105 rounded-full"
          >
            START NOW
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExploreSection;