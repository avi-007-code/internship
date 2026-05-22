import React, { useState, useEffect } from "react";
import { AlgorithmProvider, useAlgorithmStore } from "./context/AlgorithmContext";
import SearchPalette from "./components/SearchPalette";
import FloatingDock from "./components/FloatingDock";
import ExplanationCard from "./components/ExplanationCard";
import QueuePanel from "./components/QueuePanel";
import StackPanel from "./components/StackPanel";
import HeapPanel from "./components/HeapPanel";
import BSTPanel from "./components/BSTPanel";
import LinkedListPanel from "./components/LinkedListPanel";
import GraphPanel from "./components/GraphPanel";
import QuizCard from "./components/QuizCard";
import ExpertSettings from "./components/ExpertSettings";
import ThreeVisualizer from "./components/ThreeVisualizer";
import LandingPage from "./components/LandingPage";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Award, BookOpen } from "lucide-react";

function HUDLayout() {
  const { quizQuestion } = useAlgorithmStore();
  const [showQuiz, setShowQuiz] = useState(false);



  return (
    <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between p-6">
      
      {/* LAYOUT CONTAINER: TOP BAR (Left, Center, Right) */}
      <div className="w-full flex flex-col md:flex-row items-start justify-between gap-4 pointer-events-none">
        
        {/* Top-Left: Simplified Clean Jargon Title */}
        <div className="flex items-center gap-3 bg-slate-900/40 p-3 rounded-2xl border border-white/5 backdrop-blur-md pointer-events-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold tracking-wide text-white/90">
                AI Learning Assistant
              </h1>
              <span className="text-[8.5px] font-mono text-cyan-400 uppercase tracking-wider bg-cyan-950/40 px-1.5 py-0.5 rounded-full border border-cyan-800/20">
                Contest Entry
              </span>
            </div>
            <p className="text-[10px] text-white/40 leading-none mt-1 font-medium">
              Interactive 3D DSA Visualizer
            </p>
          </div>
        </div>

        {/* Top-Center: Premium search-first Spotlight Command Palette */}
        <div className="flex-1 w-full max-w-2xl px-2 md:px-6">
          <SearchPalette />
        </div>

        {/* Top-Right: Settings Gear Progressive Disclosure */}
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/45 px-3.5 py-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-[9.5px] text-white/40 font-mono">Creator</span>
            <span className="text-[10.5px] text-white/80 font-mono font-medium">Avinash</span>
          </div>
          <div className="w-px h-5 bg-white/10 mx-1 hidden sm:block" />
          <ExpertSettings />
        </div>

      </div>

      {/* LAYOUT CONTAINER: BOTTOM HUD (Left Card, Centered Dock, Right Card) */}
      <div className="w-full mt-auto flex flex-col lg:flex-row items-stretch lg:items-end justify-between gap-6 pointer-events-none select-none z-40">
        
        {/* Left flank: Left-aligned Assistive explanation widget */}
        <div className="w-full lg:w-96 flex flex-col justify-end pointer-events-auto">
          <QueuePanel />
          <StackPanel />
          <HeapPanel />
          <BSTPanel />
          <LinkedListPanel />
          <GraphPanel />
          <ExplanationCard />
        </div>

        {/* Center column: Pill Navigation Playback & macOS inspired Floating Dock */}
        <div className="flex-1 w-full flex flex-col items-center justify-end pb-1 pointer-events-auto">
          <FloatingDock />
        </div>

        {/* Right flank: Right-aligned Quiz Card HUD Bench positioned perfectly at bottom-right corner */}
        <div className="w-full lg:w-96 flex flex-col justify-end pointer-events-auto min-h-[80px]">
          {showQuiz ? (
            <QuizCard onCollapse={() => setShowQuiz(false)} />
          ) : (
            <button
              onClick={() => setShowQuiz(true)}
              className="w-full bg-slate-900/60 border border-white/5 hover:border-white/20 hover:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-xl p-4 text-white pointer-events-auto transition-all duration-300 flex items-center justify-between group active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#4f46e5]/10 rounded-xl text-indigo-400 group-hover:bg-[#4f46e5]/20 group-hover:scale-105 transition duration-300">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-left">
                  <h3 className="text-xs font-semibold text-white/90">Take Practice Quiz</h3>
                  <p className="text-[10px] text-white/40 font-mono">Test your memory bounds</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-950 text-[10.5px] font-sans font-semibold rounded-lg shadow transition">
                Start
              </div>
            </button>
          )}
        </div>

      </div>

    </div>
  );
}

export default function App() {
  const [isLanding, setIsLanding] = useState(true);
  const [isWarping, setIsWarping] = useState(false);

  const handleBegin = () => {
    setIsWarping(true);
    setTimeout(() => {
      setIsLanding(false);
      setIsWarping(false);
    }, 1500);
  };

  return (
    <AlgorithmProvider>
      <div 
        id="app-root-container" 
        className="relative w-screen h-screen bg-slate-950 font-sans text-white overflow-hidden select-none"
      >
        {/* SECTION 1: Full-Screen 3D Centerpiece Backdrop */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
          <ThreeVisualizer isLanding={isLanding} warpActive={isWarping} />
        </div>

        {/* Subtle decorative background gradients underneath */}
        <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[140px] pointer-events-none z-10" />

        {/* SECTION 2: Landing Overlay and HUD Layout */}
        <AnimatePresence>
          {isLanding && (
            <LandingPage key="landing" onBegin={handleBegin} isWarping={isWarping} />
          )}
        </AnimatePresence>

        {!isLanding && (
          <motion.div
            key="hud-layout-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.0, ease: "easeOut" }}
            className="absolute inset-0 pointer-events-none"
          >
            <HUDLayout />
          </motion.div>
        )}
      </div>
    </AlgorithmProvider>
  );
}
