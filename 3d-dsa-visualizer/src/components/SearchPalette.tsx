import React, { useState } from "react";
import { useAlgorithmStore } from "../context/AlgorithmContext";
import { Search, Sparkles, ArrowRight, AlertTriangle } from "lucide-react";

// Command parsing engine for completely offline manual operations
function parseCommand(input: string, currentStructure: string) {
  const text = input.trim();
  if (!text) return null;

  // 1. Switch archetype commands
  const switchRegex = /^(?:switch\s+(?:to\s+)?|go\s+to\s+|change\s+(?:to\s+)?)(bst|linked\s*list|linkedlist|graph|heap|queue|stack)$/i;
  const switchMatch = text.match(switchRegex);
  if (switchMatch) {
    const raw = switchMatch[1].toLowerCase().replace(/\s+/g, "");
    let structType: "BST" | "LINKED_LIST" | "GRAPH" | "HEAP" | "QUEUE" | "STACK" = "BST";
    let displayName = "";
    if (raw === "bst") { structType = "BST"; displayName = "Binary Search Tree"; }
    else if (raw === "linkedlist" || raw === "linked_list") { structType = "LINKED_LIST"; displayName = "Linked List"; }
    else if (raw === "graph") { structType = "GRAPH"; displayName = "Graph Network"; }
    else if (raw === "heap") { structType = "HEAP"; displayName = "Max-Heap"; }
    else if (raw === "queue") { structType = "QUEUE"; displayName = "Queue"; }
    else if (raw === "stack") { structType = "STACK"; displayName = "Stack"; }

    return {
      type: "switch" as const,
      structure: structType,
      displayName,
      label: `Switch structure to: ${displayName}`
    };
  }

  // 2. Clear / Reset commands
  const clearRegex = /^(?:clear|reset|empty)$/i;
  if (clearRegex.test(text)) {
    return {
      type: "clear" as const,
      label: "Clear active visualization space"
    };
  }

  // 3. Peek command
  const peekRegex = /^(?:peek|front|inspect)$/i;
  if (peekRegex.test(text)) {
    if (currentStructure !== "QUEUE" && currentStructure !== "STACK") {
      return {
        type: "error" as const,
        label: "Peek operation is only supported for Queue or Stack structures"
      };
    }
    return {
      type: "peek" as const,
      label: currentStructure === "QUEUE" 
        ? "Peek Front element of the active Queue"
        : "Peek Top element of the active Stack"
    };
  }

  // 4. Insert / Enqueue / Push / Add commands
  const insertRegex = /^(?:insert|add|enqueue|push|in)\s+(-?\d+)(?:\s+(?:at|index)\s+(\d+))?$/i;
  const insertMatch = text.match(insertRegex);
  if (insertMatch) {
    const val = parseInt(insertMatch[1], 10);
    const idx = insertMatch[2] !== undefined ? parseInt(insertMatch[2], 10) : undefined;

    if (currentStructure === "BST") {
      return {
        type: "insert" as const,
        value: val,
        label: `Insert ${val} into BST layout (computes dynamic coordinate space)`
      };
    } else if (currentStructure === "LINKED_LIST") {
      return {
        type: "insert" as const,
        value: val,
        index: idx,
        label: idx !== undefined 
          ? `Insert ${val} into Linked List at index ${idx}` 
          : `Append ${val} to Linked List Tail`
      };
    } else if (currentStructure === "QUEUE") {
      return {
        type: "insert" as const,
        value: val,
        label: `Enqueue ${val} onto Queue Rear`
      };
    } else if (currentStructure === "STACK") {
      return {
        type: "insert" as const,
        value: val,
        label: `Push ${val} onto Stack Top`
      };
    } else if (currentStructure === "HEAP") {
      return {
        type: "insert" as const,
        value: val,
        label: `Insert ${val} into Max-Heap with complete binary tree bubbling`
      };
    } else {
      return {
        type: "error" as const,
        label: "Insertion is not supported locally for Graph structure"
      };
    }
  }

  // 5. Delete / Dequeue / Pop / Extract / Del commands
  const deleteRegex = /^(?:delete|remove|dequeue|pop|extract|del)\s*(.*)$/i;
  const deleteMatch = text.match(deleteRegex);
  if (deleteMatch) {
    const arg = deleteMatch[1].trim();

    if (currentStructure === "QUEUE") {
      return {
        type: "delete" as const,
        label: "Dequeue Front element from Queue"
      };
    } else if (currentStructure === "STACK") {
      return {
        type: "delete" as const,
        label: "Pop Top element from Stack"
      };
    } else if (currentStructure === "HEAP") {
      if (arg.toLowerCase() === "max" || arg === "") {
        return {
          type: "delete" as const,
          target: "max",
          label: "Extract Max element from Heap root (triggers bubble-down)"
        };
      }
      return {
        type: "error" as const,
        label: "Heaps only support extracting the Max element ('extract max')"
      };
    } else if (currentStructure === "LINKED_LIST") {
      if (arg === "") {
        return {
          type: "error" as const,
          label: "Please specify node value to delete, e.g. 'delete 15'"
        };
      }
      const val = parseInt(arg, 10);
      if (isNaN(val)) {
        return {
          type: "error" as const,
          label: `Invalid node identifier: '${arg}'. Use a number.`
        };
      }
      return {
        type: "delete" as const,
        value: val,
        label: `Delete node with value ${val} from Linked List (triggers 3D bypass & lift)`
      };
    } else if (currentStructure === "BST") {
      return {
        type: "error" as const,
        label: "BST deletion is only supported through online AI Core"
      };
    } else {
      return {
        type: "error" as const,
        label: "Deletion not supported locally for Graph structure"
      };
    }
  }

  return null;
}

export default function SearchPalette() {
  const {
    submitAIRequest,
    isLoading,
    structureType,
    setStructureType,
    clearData,
    enqueue,
    dequeue,
    peek,
    pushStack,
    popStack,
    peekStack,
    insertHeap,
    extractMaxHeap,
    insertBST,
    insertLinkedList,
    deleteLinkedList,
    addLog,
  } = useAlgorithmStore();

  const [promptInput, setPromptInput] = useState("");
  const [requestMode, setRequestMode] = useState<"CREATE_STRUCTURE" | "STEP_ALGORITHM" | "QUIZ_MODE">("STEP_ALGORITHM");

  const parsedCommand = parseCommand(promptInput, structureType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim() || isLoading) return;

    // Check offline commands first
    if (parsedCommand) {
      if (parsedCommand.type === "error") {
        addLog(parsedCommand.label, "error");
        return;
      }
      
      // Perform local store operation
      if (parsedCommand.type === "switch" && parsedCommand.structure) {
        setStructureType(parsedCommand.structure);
      } else if (parsedCommand.type === "clear") {
        clearData();
        addLog("Visualization space cleared.", "success");
      } else if (parsedCommand.type === "peek") {
        if (structureType === "QUEUE") {
          peek();
        } else if (structureType === "STACK") {
          peekStack();
        }
      } else if (parsedCommand.type === "insert" && parsedCommand.value !== undefined) {
        if (structureType === "BST") {
          insertBST(parsedCommand.value);
        } else if (structureType === "LINKED_LIST") {
          insertLinkedList(parsedCommand.value, parsedCommand.index);
        } else if (structureType === "QUEUE") {
          enqueue(parsedCommand.value);
        } else if (structureType === "STACK") {
          pushStack(parsedCommand.value);
        } else if (structureType === "HEAP") {
          insertHeap(parsedCommand.value);
        }
      } else if (parsedCommand.type === "delete") {
        if (structureType === "QUEUE") {
          dequeue();
        } else if (structureType === "STACK") {
          popStack();
        } else if (structureType === "HEAP" && parsedCommand.target === "max") {
          extractMaxHeap();
        } else if (structureType === "LINKED_LIST" && parsedCommand.value !== undefined) {
          deleteLinkedList(parsedCommand.value);
        }
      }
      
      setPromptInput("");
      return;
    }

    // Default: submit request to API
    submitAIRequest(promptInput, requestMode);
    setPromptInput("");
  };

  const handleSuggestionClick = (text: string, mode: "CREATE_STRUCTURE" | "STEP_ALGORITHM" | "QUIZ_MODE") => {
    setPromptInput(text);
    setRequestMode(mode);
    submitAIRequest(text, mode);
  };

  const suggestions = [
    { label: "Insert 35 in Tree", text: "Insert a node with value 35 into the current Binary Search Tree, highlighting each path comparison.", mode: "STEP_ALGORITHM" as const },
    { label: "Breadth-First Search", text: "Walk through depth-by-depth graph traversal using Breath-First Search step-by-step.", mode: "STEP_ALGORITHM" as const },
    { label: "Create loop Graph", text: "Create an undirected loop graph with 5 vertices in an aesthetic circle layout.", mode: "CREATE_STRUCTURE" as const },
    { label: "Take Tree Quiz", text: "Generate an interactive multiple choice quiz about Binary Search Tree traversal complexity.", mode: "QUIZ_MODE" as const },
  ];

  const getPlaceholderText = () => {
    if (parsedCommand) {
      return `Ask AI... or run local commands (e.g., "insert 45", "switch to bst")`;
    }
    return `Ask AI... (e.g. "build a loop graph") or run local commands (e.g. "insert 45")`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-stretch gap-0 pointer-events-auto">
      {/* Main Search Input Form Container */}
      <form
        onSubmit={handleSubmit}
        className="w-full bg-slate-900/60 border border-white/10 backdrop-blur-xl rounded-2xl shadow-[0_24px_50px_-12px_rgba(0,0,0,0.8)] focus-within:border-white/20 transition-all duration-300 overflow-hidden flex items-center pr-3 z-20"
      >
        <div className="pl-4 pr-2 text-white/40">
          <Search className="w-5 h-5" />
        </div>

        <input
          type="text"
          value={promptInput}
          onChange={(e) => setPromptInput(e.target.value)}
          placeholder={getPlaceholderText()}
          className="flex-1 py-4 bg-transparent text-white placeholder-white/30 text-sm focus:outline-none focus:ring-0 leading-none select-text min-w-0"
          disabled={isLoading}
        />

        <button
          type="submit"
          disabled={isLoading || !promptInput.trim()}
          className={`shrink-0 p-2 rounded-xl transition-all ${
            isLoading || !promptInput.trim()
              ? "bg-white/5 text-white/20 cursor-not-allowed"
              : "bg-white text-slate-950 hover:opacity-90 active:scale-95 shadow-sm"
          }`}
        >
          {isLoading ? (
            <div className="w-4 h-4 rounded-full border border-t-transparent animate-spin border-slate-950" />
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}
        </button>
      </form>

      {/* Live Preview Command Badge */}
      {parsedCommand && (
        <div className={`w-full mt-2.5 p-3.5 rounded-xl border flex items-center justify-between gap-3 animate-fade-in backdrop-blur-xl shadow-lg transition-all duration-300 ${
          parsedCommand.type === "error"
            ? "bg-rose-950/40 border-rose-500/30 text-rose-200"
            : "bg-slate-900/80 border-emerald-500/30 text-emerald-200"
        }`}>
          <div className="flex items-center gap-2.5">
            {parsedCommand.type === "error" ? (
              <AlertTriangle className="w-4.5 h-4.5 text-rose-400 shrink-0 animate-pulse" />
            ) : (
              <div className="p-1 bg-emerald-500/10 rounded-lg text-emerald-400 shrink-0">
                <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
              </div>
            )}
            <div className="flex flex-col text-left">
              <span className="text-[9px] uppercase font-mono tracking-wider text-white/40">
                {parsedCommand.type === "error" ? "Unresolved Local Action" : "Instant Offline Action Detected"}
              </span>
              <span className="text-xs font-sans font-medium text-white/90">
                {parsedCommand.label}
              </span>
            </div>
          </div>
          
          {parsedCommand.type !== "error" && (
            <span className="text-[9px] font-sans font-semibold tracking-wider text-slate-300 bg-white/5 border border-white/10 px-2 py-1 rounded-md shrink-0 select-none">
              Press Enter
            </span>
          )}
        </div>
      )}

      {/* Recommended Quick Tags */}
      {!parsedCommand && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2.5">
          <span className="text-[10px] font-sans font-medium text-white/30 flex items-center gap-1 select-none">
            <Sparkles className="w-3 h-3 text-white/40" /> Recommended:
          </span>
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isLoading}
              onClick={() => handleSuggestionClick(s.text, s.mode)}
              className="px-2.5 py-1 rounded-full bg-slate-900/30 border border-white/5 hover:border-white/10 text-[10px] font-sans font-medium text-white/50 hover:text-white transition duration-200 backdrop-blur-md"
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
