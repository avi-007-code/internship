import React from "react";
import { useAlgorithmStore } from "../context/AlgorithmContext";
import { Sparkles, HelpCircle } from "lucide-react";

export default function ExplanationCard() {
  const { explanation, structureType, steps, currentStepIndex } = useAlgorithmStore();

  const formattedStructureName = (type: string) => {
    switch (type) {
      case "BST":
        return "Binary Search Tree";
      case "HEAP":
        return "Binary Heap";
      case "GRAPH":
        return "Graph Network";
      case "LINKED_LIST":
        return "Linked List";
      case "QUEUE":
        return "FIFO Queue";
      default:
        return type;
    }
  };

  const getStepSubtitle = () => {
    if (steps.length > 0 && currentStepIndex !== -1) {
      return `Traversal Step ${currentStepIndex + 1} of ${steps.length}`;
    }
    return "Structure Model Ready";
  };

  const getActiveText = () => {
    if (steps.length > 0 && currentStepIndex !== -1) {
      return steps[currentStepIndex].explanation;
    }
    return explanation;
  };

  return (
    <div className="w-full max-w-sm bg-slate-900/60 border border-white/5 backdrop-blur-xl rounded-2xl shadow-xl p-5 text-white pointer-events-auto select-none">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 font-semibold">
            {getStepSubtitle()}
          </span>
          <h2 className="text-base font-semibold text-white/90">
            {formattedStructureName(structureType)}
          </h2>
        </div>
        <div className="p-1.5 bg-white/5 rounded-lg text-white/80">
          <Sparkles className="w-4 h-4 animate-pulse text-white" />
        </div>
      </div>

      <div className="border-t border-white/5 my-3" />

      {/* Primary Educational Text */}
      <p className="text-xs text-white/70 leading-relaxed font-sans font-normal selection:bg-white/20 whitespace-pre-line">
        {getActiveText()}
      </p>

      {/* Extra Tips footer */}
      <div className="mt-4 flex items-center gap-1.5 p-2 bg-white/5 rounded-xl border border-white/5">
        <HelpCircle className="w-3.5 h-3.5 text-white/40" />
        <span className="text-[9.5px] text-white/40 font-sans leading-relaxed">
          Tip: Orbit the 3D grid with cursor to see depth perspectives.
        </span>
      </div>
    </div>
  );
}
