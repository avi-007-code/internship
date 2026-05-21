import React, { useState } from "react";
import { useAlgorithmStore } from "../context/AlgorithmContext";
import { Plus } from "lucide-react";

export default function BSTPanel() {
  const { structureType, insertBST, traverseBST, isLoading, nodes } = useAlgorithmStore();
  const [val, setVal] = useState("12");

  if (structureType !== "BST") return null;

  const handleInsert = () => {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed)) return;
    insertBST(parsed);
    // Cycle to a random aesthetic next number
    setVal(String(Math.floor(Math.random() * 89) + 10));
  };

  return (
    <div 
      id="bst-operations-control-panel"
      className="w-full bg-slate-900/60 border border-white/5 backdrop-blur-xl rounded-2xl shadow-xl p-5 text-white mb-4 pointer-events-auto select-none animate-in fade-in slide-in-from-bottom-2 duration-300"
    >
      <div className="flex items-center gap-2 mb-3.5">
        <div className="w-1.5 h-3 bg-purple-400 rounded-full" />
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-white/80 font-mono">
          BST Tree Engine
        </h3>
      </div>

      <div className="flex flex-col gap-3">
        {/* Insert row */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              disabled={isLoading}
              value={val}
              onChange={(e) => setVal(e.target.value.replace(/[^0-9-]/g, ""))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-400/50 focus:ring-0 leading-none select-text"
              placeholder="Value"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-mono text-white/30 pointer-events-none">
              INT
            </span>
          </div>

          <button
            id="bst-insert-trigger"
            onClick={handleInsert}
            disabled={isLoading || !val}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white font-sans font-bold text-xs rounded-xl transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3px]" />
            <span>Insert</span>
          </button>
        </div>

        {/* Quick presets buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-white/30 font-sans">Quick Insert:</span>
          {[8, 14, 25, 42].map((num) => (
            <button
              id={`quick-bst-insert-${num}`}
              key={num}
              onClick={() => {
                insertBST(num);
                setVal(String(Math.floor(Math.random() * 89) + 10));
              }}
              disabled={isLoading}
              className="text-[10px] font-mono bg-white/5 hover:bg-white/10 select-none border border-white/5 rounded-md px-1.5 py-0.5 text-white/60 hover:text-white transition cursor-pointer"
            >
              +{num}
            </button>
          ))}
        </div>

        {/* Traverse Row */}
        <div className="h-px bg-white/5 my-0.5" />
        <div className="flex flex-col gap-2">
          <span className="text-[10px] text-white/30 font-sans text-left">Traverse Tree (Animate):</span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => traverseBST("inorder")}
              disabled={isLoading || nodes.length === 0}
              className="px-2 py-1.5 bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 font-sans font-semibold text-[10px] rounded-lg transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              In-Order
            </button>
            <button
              onClick={() => traverseBST("preorder")}
              disabled={isLoading || nodes.length === 0}
              className="px-2 py-1.5 bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 font-sans font-semibold text-[10px] rounded-lg transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Pre-Order
            </button>
            <button
              onClick={() => traverseBST("postorder")}
              disabled={isLoading || nodes.length === 0}
              className="px-2 py-1.5 bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 font-sans font-semibold text-[10px] rounded-lg transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Post-Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
