import React, { useState, useEffect } from "react";
import { useAlgorithmStore } from "../context/AlgorithmContext";
import { BookOpen, CheckCircle, AlertCircle, HelpCircle, Sparkles, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

interface Question {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

const STATIC_PRESETS: Record<string, Question[]> = {
  BST: [
    {
      question: "Which of the following is true for children of any node in a Binary Search Tree?",
      options: [
        "Left child is larger, right child is smaller",
        "Left child is smaller, right child is larger",
        "Both children must be smaller than parent",
        "Both children must be larger than parent",
      ],
      correct_index: 1,
      explanation: "By definition, the left subtree contains values smaller than the node, and the right subtree contains values larger.",
    },
    {
      question: "What is the in-order traversal of a BST always guaranteed to output?",
      options: [
        "A sorted sequence in ascending order",
        "A sequence in descending order",
        "Breadth-first-search layer sequence",
        "A randomized set of node values",
      ],
      correct_index: 0,
      explanation: "In-order traversal visits left subtree, root, then right subtree recursively, resulting in a sorted sequence in ascending order.",
    },
    {
      question: "What is the worst-case space/time search complexity in a highly unbalanced BST (linear chain) of size N?",
      options: ["O(1) constant", "O(log N)", "O(N) linear", "O(N log N)"],
      correct_index: 2,
      explanation: "If a BST is skewed like a chain, finding any node behaves like traversing a Singly Linked List, requiring O(N) comparisons.",
    },
    {
      question: "Which tree variant automatically performs node rotations upon insertion to keep heights proportional to O(log N)?",
      options: ["Simple Bin-Tree", "Binary Heap", "AVL Tree or Red-Black Tree", "Strict Linked List"],
      correct_index: 2,
      explanation: "AVL and Red-Black trees track subtree balance factors and trigger rotations to guarantee logarithmic height boundaries.",
    },
  ],
  HEAP: [
    {
      question: "In a Max-Heap containing N elements, what is the time complexity to retrieve yet restore the maximum node?",
      options: ["O(1) directly", "O(log N) after bubble", "O(N) linear scan", "O(N log N)"],
      correct_index: 1,
      explanation: "Reading the maximum at root is O(1), but removing it requires swapping with the last node and bubbled-down re-heapification, taking O(log N) time.",
    },
    {
      question: "Which structural integrity constraint must a Binary Heap satisfy structurally?",
      options: [
        "It must be completely unbalanced",
        "It must be a complete binary tree filled layer-by-layer",
        "No node can have more than one child",
        "The root node value must always be zero",
      ],
      correct_index: 1,
      explanation: "A Binary Heap is a complete binary tree where all levels are fully filled except possibly the last level, storing elements left-to-right.",
    },
    {
      question: "In a 1-indexed array representation of a binary heap, where do the left and right children of parent i sit?",
      options: ["At i-1 and i+1", "At 2i and 2i+1", "At i/2 and i/2 + 1", "At i and 2i"],
      correct_index: 1,
      explanation: "By array binary index rules, left child sits at index 2i and right child sits at index 2i+1 relative to parent node index i.",
    },
    {
      question: "What is the mathematical time complexity of building a Max-Heap from an unsorted array of size N elements?",
      options: ["O(1) constant", "O(log N)", "O(N) optimal linear line", "O(N log N)"],
      correct_index: 2,
      explanation: "Floyd's optimal heap build algorithm runs bottom-up starting at leaf nodes, yielding O(N) linear-time execution rather than naive O(N log N).",
    }
  ],
  GRAPH: [
    {
      question: "Which data structure is typically used internally to manage BFS traversals breadth-by-breadth?",
      options: ["FIFO Queue", "LIFO Stack", "Max-Heap Priority", "Binary Search Tree"],
      correct_index: 0,
      explanation: "Breadth-First Search (BFS) enqueues children first-in, first-out (FIFO) to explore nodes depth-level-by-depth-level.",
    },
    {
      question: "What traversal method uses a recursive function stack (or LIFO stack) to plunge deep down paths before backtracking?",
      options: ["Breadth-First Search (BFS)", "Depth-First Search (DFS)", "Dijkstra's Pathfinding", "Prime-Kruskal Forest"],
      correct_index: 1,
      explanation: "Depth-First Search visits descendant branches sequentially down to leaf levels, relying on standard recursion stack properties (LIFO).",
    },
    {
      question: "According to the handshake lemma, what does the sum of vertex-degrees in any undirected simple graph equate to?",
      options: ["The number of vertices", "Twice the total number of edges", "Number of edges squared", "Half the node density"],
      correct_index: 1,
      explanation: "Since each simple edge connects exactly two distinct vertices, each edge contributes exactly 2 to the sum of all vertex degrees.",
    },
    {
      question: "Which graph representation uses a square V x V Boolean matrix to flag connections?",
      options: ["Adjacency List array", "Adjacency Matrix grid", "Flat Edge List", "Path Spanning Matrix"],
      correct_index: 1,
      explanation: "An Adjacency Matrix occupies V^2 space, storing 1s/0s or true/false to index-identify active edge links between vertices.",
    }
  ],
  LINKED_LIST: [
    {
      question: "What is the worst-case time complexity to search/access an element at index k in a Single Linked List?",
      options: ["O(1) instant lookup", "O(log N)", "O(N) linear search", "O(N log N)"],
      correct_index: 2,
      explanation: "Unlike contiguous arrays, linked list elements do not have index offsets. Access requires pointer chasing from the Head node, taking O(N).",
    },
    {
      question: "What is the primary advantage of a Doubly Linked List over a standard Singly Linked List?",
      options: [
        "It uses significantly less memory overhead",
        "It supports bidirectional traversal next & prev",
        "Retrieval is always constant O(1)",
        "Nodes are kept sorted in active memory"
      ],
      correct_index: 1,
      explanation: "By including both 'next' and 'prev' pointers inside node structures, doubly linked elements support sequential walks backwards and forwards.",
    },
    {
      question: "Given a direct pointer pointer to node N in a linked list, inserting a new element after it takes how many operations?",
      options: ["O(1) constant pointer edits", "O(log N) heights", "O(N) sequential search", "O(N^2) quadratics"],
      correct_index: 0,
      explanation: "Since node N is already located, we just instantiate the new node and redirect next-pointer bounds, completing instantly in O(1) time.",
    },
    {
      question: "What is the primary structural benefit of a dummy 'sentinel' node in linked list nodes?",
      options: [
        "Speeds up browser WebGL rendering engines",
        "Prevents heap garbage collector leaks",
        "Simplifies edge operations by eliminating null pointer checks on root/head/tail bounds",
        "Compiles direct binary scripts on runtime"
      ],
      correct_index: 2,
      explanation: "Sentinel nodes remain as permanent anchor structures (empty space placeholder), allowing deletions and insertions near extremes without checking if nodes are null."
    }
  ]
};

interface QuizCardProps {
  onCollapse?: () => void;
}

export default function QuizCard({ onCollapse }: QuizCardProps) {
  const { quizQuestion, structureType, addLog } = useAlgorithmStore();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<number, boolean>>({});

  // Compile active quiz deck when structureType or AI quizQuestion changes
  useEffect(() => {
    const list = [...(STATIC_PRESETS[structureType] || STATIC_PRESETS.BST)];
    
    if (quizQuestion) {
      // Avoid duplicate insertion of similar questions
      const exists = list.some(q => q.question.toLowerCase() === quizQuestion.question.toLowerCase());
      if (!exists) {
        // Prepend customizable AI questions at top so it is showcased instantly
        list.unshift({
          question: quizQuestion.question,
          options: quizQuestion.options,
          correct_index: quizQuestion.correct_index,
          explanation: quizQuestion.explanation
        });
      }
    }
    
    setQuestions(list.slice(0, 5)); // Keep active 3-5 questions
    setCurrentIdx(0);
    setUserAnswers({});
    setSubmittedAnswers({});
  }, [structureType, quizQuestion]);

  if (questions.length === 0) return null;

  const activeQuestion = questions[currentIdx];
  const selectedAns = userAnswers[currentIdx];
  const isSubmitted = submittedAnswers[currentIdx];

  const handleSelectOption = (opIdx: number) => {
    if (isSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [currentIdx]: opIdx }));
  };

  const handleVerify = () => {
    if (selectedAns === undefined) return;
    setSubmittedAnswers(prev => ({ ...prev, [currentIdx]: true }));

    const isCorrect = selectedAns === activeQuestion.correct_index;
    if (isCorrect) {
      addLog(`Quiz Bench: Correct on Q${currentIdx + 1}!`, "success");
    } else {
      addLog(`Quiz Bench: Incorrect on Q${currentIdx + 1}. Review the analysis rules below.`, "warning");
    }
  };

  const handleReset = () => {
    setUserAnswers(prev => {
      const clone = { ...prev };
      delete clone[currentIdx];
      return clone;
    });
    setSubmittedAnswers(prev => {
      const clone = { ...prev };
      delete clone[currentIdx];
      return clone;
    });
    addLog(`Q${currentIdx + 1} reference cleared. Select a choice.`, "info");
  };

  // Score stats for completed questions in this deck
  const completedCount = Object.keys(submittedAnswers).length;
  const correctCount = Object.entries(submittedAnswers).filter(([qIndex, sub]) => {
    const idx = parseInt(qIndex);
    return sub && userAnswers[idx] === questions[idx]?.correct_index;
  }).length;

  return (
    <div className="w-full max-w-sm bg-slate-900/60 border border-white/5 backdrop-blur-xl rounded-2xl shadow-xl p-5 text-white pointer-events-auto select-none transition-all duration-300">
      
      {/* 2. Top Navigation header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 text-white/50 text-[10px] font-mono uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5 text-white/40" />
          <span>Interactive Quiz Deck</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Score count header badges */}
          {completedCount > 0 && (
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/30 px-2 py-0.5 rounded-full font-medium">
              Score: {correctCount}/{completedCount}
            </span>
          )}

          {/* Close/Minimize button */}
          {onCollapse && (
            <button
              onClick={onCollapse}
              title="Minimize Quiz"
              className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-minimize-2"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" x2="21" y1="10" y2="3"/><line x1="10" x2="3" y1="14" y2="21"/></svg>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {/* Question sentence */}
        <p className="text-[11.5px] font-medium text-white/95 leading-relaxed font-sans">
          <span className="text-white/40 font-mono mr-1">Q{currentIdx + 1}.</span>
          {activeQuestion.question}
        </p>

        {/* Options lists */}
        <div className="space-y-1.5">
          {activeQuestion.options.map((opt, opIdx) => {
            const isSelected = selectedAns === opIdx;
            const isCorrectAnswer = activeQuestion.correct_index === opIdx;

            let optionStyle = "border-white/5 bg-white/5 hover:bg-white/10 text-white/70";
            if (isSelected) {
              optionStyle = "bg-white/15 border-white text-white font-semibold";
            }
            if (isSubmitted) {
              if (isSelected) {
                optionStyle = isCorrectAnswer
                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-medium"
                  : "bg-rose-500/10 border-rose-500/50 text-rose-300";
              } else if (isCorrectAnswer) {
                optionStyle = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-medium";
              } else {
                optionStyle = "border-white/5 text-white/30 opacity-40";
              }
            }

            return (
              <button
                key={opIdx}
                type="button"
                disabled={isSubmitted}
                onClick={() => handleSelectOption(opIdx)}
                className={`w-full text-left px-3 py-2 rounded-xl border text-[11px] font-sans transition-all duration-150 flex items-center justify-between ${optionStyle}`}
              >
                <span>{opt}</span>
                {isSelected && !isSubmitted && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white shadow-md animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Action Controls for verify and feedback */}
        <div className="pt-1.5">
          {!isSubmitted ? (
            <button
              type="button"
              onClick={handleVerify}
              disabled={selectedAns === undefined}
              className={`w-full py-1.5 text-center text-[10px] font-semibold font-sans uppercase rounded-xl transition duration-200 ${
                selectedAns === undefined
                  ? "bg-white/5 text-white/20 cursor-not-allowed"
                  : "bg-white text-slate-950 font-bold hover:bg-slate-100 shadow-md active:scale-[0.98]"
              }`}
            >
              Verify Answer
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2 p-3 rounded-xl bg-white/5 border border-white/5 text-[10px] leading-relaxed font-sans text-white/70">
                {selectedAns === activeQuestion.correct_index ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-semibold block text-white/90">
                    {selectedAns === activeQuestion.correct_index ? "Correct diagnosis!" : "Incorrect diagnosis."}
                  </span>
                  {activeQuestion.explanation}
                </div>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="w-full py-1 hover:bg-white/5 text-center text-[9.5px] font-sans font-medium text-white/40 hover:text-white rounded-lg transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Retry Choice</span>
              </button>
            </div>
          )}
        </div>

        {/* Horizontal Navigation row slider */}
        <div className="border-t border-white/5 pt-3 mt-1 flex items-center justify-between pointer-events-auto">
          <button
            type="button"
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx(prev => prev - 1)}
            className="p-1 rounded-md hover:bg-white/5 text-white/40 hover:text-white disabled:opacity-20 transition"
            title="Prev Question"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5">
            {questions.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIdx(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                  idx === currentIdx
                    ? "bg-white scale-125"
                    : submittedAnswers[idx]
                    ? userAnswers[idx] === questions[idx]?.correct_index
                      ? "bg-emerald-400"
                      : "bg-rose-400"
                    : "bg-white/20 hover:bg-white/45"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            disabled={currentIdx === questions.length - 1}
            onClick={() => setCurrentIdx(prev => prev + 1)}
            className="p-1 rounded-md hover:bg-white/5 text-white/40 hover:text-white disabled:opacity-20 transition"
            title="Next Question"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
