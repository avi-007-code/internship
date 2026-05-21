import React from "react";
import { useAlgorithmStore } from "../context/AlgorithmContext";
import { GitBranch, Play } from "lucide-react";

export default function GraphPanel() {
  const { structureType, traverseGraph, isLoading, nodes } = useAlgorithmStore();

  if (structureType !== "GRAPH") return null;

  return (
    <div
      id="graph-operations-control-panel"
      className="w-full bg-slate-900/60 border border-white/5 backdrop-blur-xl rounded-2xl shadow-xl p-5 text-white mb-4 pointer-events-auto select-none animate-in fade-in slide-in-from-bottom-2 duration-300"
    >
      <div className="flex items-center gap-2 mb-3.5">
        <div className="w-1.5 h-3 bg-emerald-500 rounded-full" />
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-white/80 font-mono">
          Graph Network Engine
        </h3>
      </div>

      <div className="flex flex-col gap-3">
        <div className="text-[10px] text-white/50 leading-relaxed">
          Traverse the 3D graph network step-by-step using standard search heuristics. Watch queue actions in BFS and backtracking lines in DFS.
        </div>

        <div className="h-px bg-white/5 my-0.5" />

        {/* Traverse Buttons Row */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] text-white/30 font-sans text-left">
            Graph Traversal (Animate):
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => traverseGraph("bfs")}
              disabled={isLoading || nodes.length === 0}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 font-sans font-bold text-xs rounded-xl transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              <span>Breadth-First (BFS)</span>
            </button>
            <button
              onClick={() => traverseGraph("dfs")}
              disabled={isLoading || nodes.length === 0}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 font-sans font-bold text-xs rounded-xl transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
              <span>Depth-First (DFS)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
