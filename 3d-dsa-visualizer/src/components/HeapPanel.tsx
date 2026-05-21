import React, { useState } from "react";
import { useAlgorithmStore } from "../context/AlgorithmContext";
import { Plus, Minus } from "lucide-react";

export default function HeapPanel() {
  const { structureType, insertHeap, extractMaxHeap, isLoading, nodes } = useAlgorithmStore();
  const [val, setVal] = useState("95");

  if (structureType !== "HEAP") return null;

  const handleInsert = () => {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed)) return;
    insertHeap(parsed);
    // Cycle to a random aesthetic next number
    setVal(String(Math.floor(Math.random() * 89) + 10));
  };

  return (
    <div 
      id="heap-operations-control-panel"
      className="w-full bg-slate-900/60 border border-white/5 backdrop-blur-xl rounded-2xl shadow-xl p-5 text-white mb-4 pointer-events-auto select-none animate-in fade-in slide-in-from-bottom-2 duration-300"
    >
      <div className="flex items-center gap-2 mb-3.5">
        <div className="w-1.5 h-3 bg-indigo-500 rounded-full" />
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-white/80 font-mono">
          Max-Heap Engine
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
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-0 leading-none select-text"
              placeholder="Value"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-mono text-white/30 pointer-events-none">
              INT
            </span>
          </div>

          <button
            id="heap-insert-trigger"
            onClick={handleInsert}
            disabled={isLoading || !val || nodes.length >= 7}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-sans font-bold text-xs rounded-xl transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3px]" />
            <span>Insert</span>
          </button>
        </div>

        {/* Quick presets buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-white/30 font-sans">Quick Insert:</span>
          {[45, 75, 88, 99].map((num) => (
            <button
              id={`quick-heap-insert-${num}`}
              key={num}
              onClick={() => {
                insertHeap(num);
                setVal(String(Math.floor(Math.random() * 89) + 10));
              }}
              disabled={isLoading || nodes.length >= 7}
              className="text-[10px] font-mono bg-white/5 hover:bg-white/10 select-none border border-white/5 rounded-md px-1.5 py-0.5 text-white/60 hover:text-white transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              +{num}
            </button>
          ))}
        </div>

        {nodes.length >= 7 && (
          <p className="text-[10px] text-amber-400/80 font-medium font-sans">
            Max layout capacity reached (7 nodes). Extract nodes to insert more!
          </p>
        )}

        <div className="h-px bg-white/5 my-0.5" />

        {/* Extract Max button */}
        <button
          id="heap-extract-max-trigger"
          onClick={() => extractMaxHeap()}
          disabled={isLoading || nodes.length === 0}
          className="w-full flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-355 text-rose-400 hover:bg-rose-500/20 font-sans font-bold text-xs rounded-xl transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Minus className="w-3.5 h-3.5 stroke-[3px]" />
          <span>Extract Max (Root)</span>
        </button>
      </div>
    </div>
  );
}
