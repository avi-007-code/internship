import React from "react";
import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";

interface LandingPageProps {
  onBegin: () => void;
  isWarping: boolean;
}

export default function LandingPage({ onBegin, isWarping }: LandingPageProps) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isWarping ? 0 : 1, scale: isWarping ? 0.35 : 1 }}
      exit={{ opacity: 0, scale: 0.2 }}
      transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
      className="absolute inset-0 z-40 flex flex-col items-center justify-between py-16 px-6 pointer-events-auto bg-transparent select-none"
    >
      {/* Decorative Top Accent */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 0.4 }}
        transition={{ delay: 0.2, duration: 1.0 }}
        className="font-mono text-[9px] tracking-[0.4em] text-cyan-400 uppercase"
      >
        // System.Init : 3D Space Architectural Engine
      </motion.div>

      {/* Main Core Centered Header Block */}
      <div className="flex flex-col items-center text-center my-auto">
        {/* Sub-header label */}
        <motion.span
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 0.6, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="font-mono text-[10px] sm:text-[11px] tracking-[0.6em] text-white/50 uppercase mb-3 ml-[0.6em]"
        >
          Interactive Algorithmic Space
        </motion.span>

        {/* Heading */}
        <motion.h1
          initial={{ letterSpacing: "0.1em", opacity: 0, scale: 0.95 }}
          animate={{ letterSpacing: "0.25em", opacity: 1, scale: 1 }}
          transition={{
            duration: 1.4,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="text-5xl sm:text-7xl md:text-8xl font-light text-white tracking-[0.25em] ml-[0.25em] leading-none select-none font-sans"
          style={{ textShadow: "0 0 40px rgba(255,255,255,0.05)" }}
        >
          DSA ARCHITECT
        </motion.h1>

        {/* Thick elegant line accent */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "80px", opacity: 0.2 }}
          transition={{ delay: 0.6, duration: 1.2 }}
          className="h-[1px] bg-white mt-8 mb-10"
        />

        {/* Spaced thin Breathing glow Button */}
        <motion.button
          onClick={onBegin}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05, letterSpacing: "0.45em" }}
          whileTap={{ scale: 0.98 }}
          transition={{
            y: { delay: 0.8, duration: 0.8 },
            letterSpacing: { duration: 0.3 },
            default: { ease: [0.25, 1, 0.5, 1] }
          }}
          className="relative px-8 py-3 rounded-full border border-white/10 hover:border-white/40 bg-slate-950/20 hover:bg-slate-900/10 backdrop-blur-sm cursor-pointer text-xs font-light text-white/85 tracking-[0.35em] uppercase transition-all duration-300 group shadow-[0_0_15px_rgba(255,255,255,0.02)]"
        >
          {/* Glowing background halo */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 opacity-30 group-hover:opacity-100 transition-opacity duration-700 animate-pulse" />
          
          <span className="relative z-10 ml-[0.35em] group-hover:text-white transition duration-300">
            Let's Begin
          </span>
        </motion.button>
      </div>

      {/* Footer indicator down arrow */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 0.5 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="flex flex-col items-center gap-1.5"
      >
        <span className="font-mono text-[8px] tracking-[0.3em] text-white/30 uppercase">
          Enter Space
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.0, ease: "easeInOut" }}
          className="text-white/40 cursor-pointer hover:text-white transition duration-300"
          onClick={onBegin}
        >
          <ChevronDown className="w-5 h-5 font-light" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
