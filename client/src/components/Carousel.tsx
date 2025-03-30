import { useRef, useEffect, useState } from "react";
import { motion, useAnimation, useMotionValue } from "framer-motion";

const features = [
  {
    title: "AI-Powered Staking Assistant",
    description:
      "Maximize your staking rewards with AI-driven recommendations. Plutus analyzes protocols, APYs, risks, and lock-up periods to suggest the best staking strategies tailored to your goals.",
    icon: "✨",
  },
  {
    title: " Unified Cross-Chain Dashboard",
    description:
      "Track all your assets in one place. Plutus aggregates balances, staking rewards, and governance participation across multiple blockchains like Ethereum, Solana, and Polygon.",
    icon: "📱",
  },
  {
    title: "Fast Performance",
    description: "Lightning-quick load times for smooth user interactions.",
    icon: "⚡",
  },
  {
    title: "Accessibility",
    description: "Inclusive design practices for all users.",
    icon: "🌈",
  },
  {
    title: "Tracker",
    description:
      "Get best insights on projects and Tokens through our AI Tracking mechanism, copy profitable wallets and track investments across multiple chains.",
    icon: "🔍",
  },
];

export default function FeatureCarousel() {
  const [width, setWidth] = useState(0);
  const carousel = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const controls = useAnimation();

  useEffect(() => {
    if (carousel.current) {
      setWidth(carousel.current.scrollWidth - carousel.current.offsetWidth);
    }

    // Start the automatic animation
    const startAutoScroll = async () => {
      await controls.start({
        x: -width,
        transition: {
          duration: 25,
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop",
        },
      });
    };

    if (width > 0) {
      startAutoScroll();
    }
  }, [width, controls]);

  const handleDragEnd = () => {
    // Resume the animation after drag ends
    controls.start({
      x: -width,
      transition: {
        duration: 25,
        ease: "linear",
        repeat: Infinity,
        repeatType: "loop",
      },
    });
  };

  return (
    <div className="py-20 bg-white">
      <div className="w-full mx-auto relative">
        <h2 className="text-3xl font-bold text-center mb-12 text-black font-montserrat">
          Why Choose Us
        </h2>
        {/* Add fade effect similar to marquee */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white z-10" />
        
        <motion.div ref={carousel} className="cursor-grab overflow-hidden">
          <motion.div
            drag="x"
            dragConstraints={{ right: 0, left: -width }}
            whileTap={{ cursor: "grabbing" }}
            animate={controls}
            style={{ x }}
            onDragEnd={handleDragEnd}
            className="flex"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="min-w-[300px] h-[400px] p-8 m-4 bg-black rounded-3xl shadow-lg flex flex-col justify-between transition-all duration-300 ease-in-out border-2 border-black group"
                whileHover={{
                  scale: 1.05,
                  zIndex: 10,
                  transition: { duration: 0.2 },
                }}
              >
                <div>
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2 text-white font-montserrat">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 font-montserrat">
                    {feature.description}
                  </p>
                </div>
                <div className="mt-4">
                  <a
                    href="#"
                    className="text-white hover:underline font-montserrat inline-flex items-center"
                  >
                    Learn more <span className="ml-1">→</span>
                  </a>
                </div>
              </motion.div>
            ))}

            {/* Duplicate the features to create a seamless loop */}
            {features.map((feature, index) => (
              <motion.div
                key={`duplicate-${index}`}
                className="min-w-[300px] h-[400px] p-8 m-4 bg-black rounded-3xl shadow-lg flex flex-col justify-between transition-all duration-300 ease-in-out border-2 border-black group"
                whileHover={{
                  scale: 1.05,
                  zIndex: 10,
                  transition: { duration: 0.2 },
                }}
              >
                <div>
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2 text-white font-montserrat">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 font-montserrat">
                    {feature.description}
                  </p>
                </div>
                <div className="mt-4">
                  <a
                    href="#"
                    className="text-white hover:underline font-montserrat inline-flex items-center"
                  >
                    Learn more <span className="ml-1">→</span>
                  </a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
