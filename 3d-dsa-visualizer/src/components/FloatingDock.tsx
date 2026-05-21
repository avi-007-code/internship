import React from "react";
import { useAlgorithmStore } from "../context/AlgorithmContext";
import { 
  GitBranch, 
  Layers, 
  Network, 
  Link as LinkIcon,
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw,
  ListOrdered,
  SquareStack
} from "lucide-react";

export default function FloatingDock() {
  const {
    structureType,
    setStructureType,
    steps,
    currentStepIndex,
    setStep,
    isPlaying,
    setIsPlaying,
    nextStep,
    prevStep
  } = useAlgorithmStore();

  const dockItems = [
    { type: "BST" as const, label: "Binary Search Tree", icon: GitBranch },
    { type: "HEAP" as const, label: "Binary Heap", icon: Layers },
    { type: "GRAPH" as const, label: "Graph Network", icon: Network },
    { type: "LINKED_LIST" as const, label: "Linked List", icon: LinkIcon },
    { type: "QUEUE" as const, label: "FIFO Queue", icon: ListOrdered },
    { type: "STACK" as const, label: "LIFO Stack", icon: SquareStack },
  ];

  return (
    <div className="flex flex-col items-center gap-3 w-full pointer-events-auto select-none">
      
      {/* 1. Integrated Minimalist Playback Controls pill (only shown if steps exist) */}
      {steps.length > 0 && (
        <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-900/60 border border-white/10 backdrop-blur-xl rounded-full shadow-lg">
          <button
            onClick={prevStep}
            title="Step Back"
            className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1 rounded-full text-[11px] font-sans font-medium flex items-center gap-1.5 transition-all ${
              isPlaying
                ? "bg-white/10 border border-white/10 text-white"
                : "bg-white text-slate-950 font-semibold"
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3 h-3 fill-white" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-slate-950" />
                <span>Play Animation</span>
              </>
            )}
          </button>

          <button
            onClick={nextStep}
            title="Step Forward"
            className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-white/10 mx-1" />

          {/* Stepper / Scrubber state indicator */}
          <span className="text-[10px] font-mono text-white/40 px-1">
            Frame {currentStepIndex === -1 ? "End" : `${currentStepIndex + 1}/${steps.length}`}
          </span>

          <button
            onClick={() => setStep(-1)}
            title="Wipe step & reset to full"
            className="p-1.5 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. macOS Inspired Floating Dock */}
      <div className="flex items-center justify-center p-2 bg-slate-900/60 border border-white/5 backdrop-blur-xl rounded-2xl shadow-2xl gap-1">
        {dockItems.map((item) => {
          const isActive = structureType === item.type;
          const IconComponent = item.icon;

          return (
            <button
              key={item.type}
              onClick={() => setStructureType(item.type)}
              title={item.label}
              className={`relative flex items-center justify-center p-3.5 rounded-xl transition-all duration-300 group ${
                isActive
                  ? "bg-white text-slate-950 scale-110 shadow-lg shadow-white/10"
                  : "text-white/60 hover:text-white hover:bg-white/5 hover:scale-105"
              }`}
            >
              <IconComponent className="w-5 h-5 transition-transform group-active:scale-95" />
              
              {/* Tooltip on hover */}
              <span className="absolute bottom-full mb-3 hidden group-hover:block whitespace-nowrap bg-slate-950/90 border border-white/10 text-[10px] text-white/90 font-sans px-2.5 py-1 rounded-lg shadow-xl pointer-events-none transition-all duration-200">
                {item.label}
              </span>

              {/* Red dot indicator for active selection on bottom */}
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-slate-950" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
