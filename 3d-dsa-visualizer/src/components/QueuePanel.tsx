import React, { useState } from "react";
import { useAlgorithmStore } from "../context/AlgorithmContext";
import { Plus, Minus, Eye } from "lucide-react";

export default function QueuePanel() {
  const { structureType, enqueue, dequeue, peek, isLoading } = useAlgorithmStore();
  const [val, setVal] = useState("50");

  if (structureType !== "QUEUE") return null;

  const handleEnqueue = () => {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed)) return;
    enqueue(parsed);
    // Cycle to a random aesthetic next number to make consecutive operations effortless
    setVal(String(Math.floor(Math.random() * 89) + 10));
  };

  return (
    <div 
      id="queue-operations-control-panel"
      className="w-full bg-slate-900/60 border border-white/5 backdrop-blur-xl rounded-2xl shadow-xl p-5 text-white mb-4 pointer-events-auto select-none animate-in fade-in slide-in-from-bottom-2 duration-300"
    >
      <div className="flex items-center gap-2 mb-3.5">
        <div className="w-1.5 h-3 bg-cyan-400 rounded-full" />
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-white/80 font-mono">
          FIFO Queue Engine
        </h3>
      </div>

      <div className="flex flex-col gap-3">
        {/* Enqueue row */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              disabled={isLoading}
              value={val}
              onChange={(e) => setVal(e.target.value.replace(/[^0-9-]/g, ""))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50 focus:ring-0 leading-none select-text"
              placeholder="Value"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-mono text-white/30 pointer-events-none">
              INT
            </span>
          </div>

          <button
            id="queue-enqueue-trigger"
            onClick={handleEnqueue}
            disabled={isLoading || !val}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-cyan-500 text-slate-150 hover:bg-cyan-400 text-slate-950 font-sans font-bold text-xs rounded-xl transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3px]" />
            <span>Enqueue</span>
          </button>
        </div>

        {/* Quick presets buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-white/30 font-sans">Quick Insert:</span>
          {[12, 25, 60, 88].map((num) => (
            <button
              id={`quick-queue-insert-${num}`}
              key={num}
              onClick={() => {
                enqueue(num);
                setVal(String(Math.floor(Math.random() * 89) + 10));
              }}
              disabled={isLoading}
              className="text-[10px] font-mono bg-white/5 hover:bg-white/10 select-none border border-white/5 rounded-md px-1.5 py-0.5 text-white/60 hover:text-white transition cursor-pointer"
            >
              +{num}
            </button>
          ))}
        </div>

        <div className="h-px bg-white/5 my-0.5" />

        {/* Dequeue & Peek row */}
        <div className="grid grid-cols-2 gap-2">
          <button
            id="queue-dequeue-trigger"
            onClick={() => dequeue()}
            disabled={isLoading}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 font-sans font-semibold text-xs rounded-xl transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Minus className="w-3.5 h-3.5" />
            <span>Dequeue</span>
          </button>

          <button
            id="queue-peek-trigger"
            onClick={() => peek()}
            disabled={isLoading}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 font-sans font-semibold text-xs rounded-xl transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Peek Front</span>
          </button>
        </div>
      </div>
    </div>
  );
}
