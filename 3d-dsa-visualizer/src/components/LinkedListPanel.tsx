import React, { useState } from "react";
import { useAlgorithmStore } from "../context/AlgorithmContext";
import { Plus, Trash2 } from "lucide-react";

export default function LinkedListPanel() {
  const { structureType, nodes, edges, insertLinkedList, deleteLinkedList, traverseLinkedList, isLoading } = useAlgorithmStore();
  const [val, setVal] = useState("25");
  const [insertIdx, setInsertIdx] = useState("0");
  const [deleteTarget, setDeleteTarget] = useState("");

  if (structureType !== "LINKED_LIST") return null;

  // Trace ordered nodes for the dropdown select
  const currentNodes = [...nodes];
  const currentEdges = [...edges];
  const toSet = new Set(currentEdges.map(e => String(e.to)));
  const headNode = currentNodes.find(n => !toSet.has(String(n.id)));
  
  const ordered: { id: string; val: number }[] = [];
  if (headNode) {
    let curr = headNode;
    while (curr) {
      const match = String(curr.label).match(/-?\d+/);
      const val = match ? parseInt(match[0], 10) : parseInt(String(curr.id), 10);
      ordered.push({
        id: String(curr.id),
        val: isNaN(val) ? 0 : val
      });
      const nextEdge = currentEdges.find(e => String(e.from) === String(curr.id));
      if (nextEdge) {
        const nextNode = currentNodes.find(n => String(n.id) === String(nextEdge.to));
        if (nextNode && !ordered.some(o => o.id === String(nextNode.id))) {
          curr = nextNode;
        } else {
          break;
        }
      } else {
        break;
      }
    }
  }

  const handleInsert = () => {
    const parsedVal = parseInt(val, 10);
    if (isNaN(parsedVal)) return;
    const parsedIdx = parseInt(insertIdx, 10);
    insertLinkedList(parsedVal, isNaN(parsedIdx) ? undefined : parsedIdx);
    // Cycle val
    setVal(String(Math.floor(Math.random() * 89) + 10));
  };

  const handleDelete = () => {
    const target = deleteTarget || (ordered.length > 0 ? ordered[0].id : "");
    if (!target) return;
    deleteLinkedList(target);
    setDeleteTarget("");
  };

  return (
    <div 
      id="linked-list-operations-control-panel"
      className="w-full bg-slate-900/60 border border-white/5 backdrop-blur-xl rounded-2xl shadow-xl p-5 text-white mb-4 pointer-events-auto select-none animate-in fade-in slide-in-from-bottom-2 duration-300"
    >
      <div className="flex items-center gap-2 mb-3.5">
        <div className="w-1.5 h-3 bg-pink-500 rounded-full" />
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-white/80 font-mono">
          Sequential Linked Engine
        </h3>
      </div>

      <div className="flex flex-col gap-3">
        {/* Insert row with Index select */}
        <div className="flex items-center gap-2">
          {/* Value input */}
          <div className="relative w-20">
            <input
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              disabled={isLoading}
              value={val}
              onChange={(e) => setVal(e.target.value.replace(/[^0-9-]/g, ""))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-pink-400/50 focus:ring-0 leading-none select-text"
              placeholder="Val"
            />
            <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[7px] font-mono text-white/30 pointer-events-none">
              VAL
            </span>
          </div>

          {/* Index Selector */}
          <div className="relative flex-1">
            <select
              value={insertIdx}
              onChange={(e) => setInsertIdx(e.target.value)}
              disabled={isLoading}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-400/50 focus:ring-0 leading-none select-text appearance-none"
            >
              <option value="0" className="bg-slate-900 text-white">At Head (Index 0)</option>
              {ordered.map((node, i) => (
                <option key={node.id} value={String(i + 1)} className="bg-slate-900 text-white">
                  After {node.val} (Index {i + 1})
                </option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/30 text-[9px]">▼</span>
          </div>

          <button
            id="linked-list-insert-trigger"
            onClick={handleInsert}
            disabled={isLoading || !val}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-pink-500 hover:bg-pink-400 text-white font-sans font-bold text-xs rounded-xl transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3px]" />
            <span>Insert</span>
          </button>
        </div>

        {/* Quick presets buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-white/30 font-sans">Quick Insert:</span>
          {[15, 25, 35, 45].map((num) => (
            <button
              id={`quick-ll-insert-${num}`}
              key={num}
              onClick={() => {
                // By default insert at end for simplicity
                insertLinkedList(num, ordered.length);
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

        {/* Delete Row */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <select
              value={deleteTarget}
              onChange={(e) => setDeleteTarget(e.target.value)}
              disabled={isLoading || ordered.length === 0}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-400/50 focus:ring-0 leading-none select-text appearance-none"
            >
              {ordered.length === 0 ? (
                <option value="" className="bg-slate-900 text-white">Empty List</option>
              ) : (
                ordered.map((node) => (
                  <option key={node.id} value={node.id} className="bg-slate-900 text-white">
                    Node: {node.val}
                  </option>
                ))
              )}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/30 text-[9px]">▼</span>
          </div>

          <button
            id="linked-list-delete-trigger"
            onClick={handleDelete}
            disabled={isLoading || ordered.length === 0}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 font-sans font-semibold text-xs rounded-xl transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-300" />
            <span>Delete</span>
          </button>
        </div>

        {/* Traverse Row */}
        <div className="h-px bg-white/5 my-0.5" />
        <div className="flex flex-col gap-2">
          <span className="text-[10px] text-white/30 font-sans text-left">Traverse List (Animate):</span>
          <button
            onClick={() => traverseLinkedList()}
            disabled={isLoading || ordered.length === 0}
            className="w-full py-2 bg-pink-500/10 border border-pink-500/30 text-pink-300 hover:bg-pink-500/20 font-sans font-bold text-xs rounded-xl transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Run Sequential Traversal
          </button>
        </div>
      </div>
    </div>
  );
}
