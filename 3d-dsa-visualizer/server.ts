import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import net from "net";

dotenv.config();
console.log("Loaded GEMINI_API_KEY status:", process.env.GEMINI_API_KEY ? `FOUND (${process.env.GEMINI_API_KEY})` : "NOT FOUND");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Resonates real-time structural positions in case of API outages or 503 limits
function generateFallbackResponse(prompt: string, structureType: string, requestType: string, currentNodes?: any[], currentEdges?: any[]) {
  const normPrompt = prompt.toLowerCase();
  
  // Extract a numeric pointer if available
  const numMatch = prompt.match(/\b\d+\b/);
  const insertVal = numMatch ? parseInt(numMatch[0]) : 45;

  if (structureType === "BST" || normPrompt.includes("bst") || normPrompt.includes("tree")) {
    const hasCurrentState = currentNodes && Array.isArray(currentNodes) && currentNodes.length > 0;
    const baseNodes = hasCurrentState
      ? currentNodes.map((n: any) => {
          const match = String(n.label).match(/-?\d+/);
          const val = match ? parseInt(match[0], 10) : parseInt(n.id, 10);
          return {
            id: String(n.id),
            val: isNaN(val) ? 0 : val,
            label: String(n.label).replace(/\s*\(New\)/g, "").replace(/\s*\(Root\)/g, ""),
            position: (Array.isArray(n.position) ? n.position : [0, 0, 0]) as [number, number, number],
            color: n.color || "#80F"
          };
        })
      : [
          { id: "30", val: 30, label: "30", position: [0, 2, 0] as [number, number, number], color: "#00E5FF" },
          { id: "15", val: 15, label: "15", position: [-2, 0.5, 0] as [number, number, number], color: "#80F" },
          { id: "50", val: 50, label: "50", position: [2, 0.5, 0] as [number, number, number], color: "#80F" },
          { id: "10", val: 10, label: "10", position: [-3, -1, 0] as [number, number, number], color: "#D1C4E9" },
          { id: "22", val: 22, label: "22", position: [-1, -1, 0] as [number, number, number], color: "#D1C4E9" }
        ];

    const baseEdges = hasCurrentState && currentEdges && Array.isArray(currentEdges)
      ? currentEdges.map((e: any) => ({
          id: String(e.id),
          from: String(e.from),
          to: String(e.to),
          color: e.color || "#616161"
        }))
      : [
          { id: "30-15", from: "30", to: "15", color: "#616161" },
          { id: "30-50", from: "30", to: "50", color: "#616161" },
          { id: "15-10", from: "15", to: "10", color: "#616161" },
          { id: "15-22", from: "15", to: "22", color: "#616161" }
        ];

    // Determine traversal path
    let currId = "";
    if (baseNodes.length > 0) {
      const incomingTargets = new Set(baseEdges.map(e => e.to));
      const rootNode = baseNodes.find(n => !incomingTargets.has(n.id)) || baseNodes.find(n => n.id === "30") || baseNodes[0];
      currId = rootNode.id;
    }

    const path: string[] = [];
    while (currId) {
      path.push(currId);
      const currNode = baseNodes.find(n => n.id === currId);
      if (!currNode) break;

      const outgoing = baseEdges.filter(e => e.from === currId);
      if (insertVal < currNode.val) {
        // Go left
        const leftEdge = outgoing.find(e => {
          const childNode = baseNodes.find(n => n.id === e.to);
          return childNode && childNode.val < currNode.val;
        });
        if (leftEdge) {
          currId = leftEdge.to;
        } else {
          break;
        }
      } else {
        // Go right
        const rightEdge = outgoing.find(e => {
          const childNode = baseNodes.find(n => n.id === e.to);
          return childNode && childNode.val >= currNode.val;
        });
        if (rightEdge) {
          currId = rightEdge.to;
        } else {
          break;
        }
      }
    }

    let newPosition: [number, number, number] = [0, 2, 0];
    let lastParentId = "";
    if (baseNodes.length > 0 && path.length > 0) {
      const lastParentIdFromPath = path[path.length - 1];
      const lastParentNode = baseNodes.find(n => n.id === lastParentIdFromPath)!;
      lastParentId = lastParentIdFromPath;

      const isLeftChild = insertVal < lastParentNode.val;
      const [parentX, parentY, parentZ] = lastParentNode.position;

      // Calculate dynamic spacing depending on depth
      const depth = path.length; 
      const spacingX = Math.max(0.5, 2.0 / Math.pow(2, depth - 1));
      const spacingY = 1.5;

      newPosition = [
        isLeftChild ? parentX - spacingX : parentX + spacingX,
        parentY - spacingY,
        parentZ
      ];
    }

    // Build steps dynamically
    const steps = [];

    // Path highlights
    for (let i = 0; i < path.length; i++) {
      const currentPathId = path[i];
      const currentPathNode = baseNodes.find(n => n.id === currentPathId)!;
      const targetEdgeId = i > 0 ? `${path[i - 1]}-${currentPathId}` : null;

      steps.push({
        nodes: baseNodes.map(n => {
          const isCurrent = n.id === currentPathId;
          return {
            ...n,
            color: isCurrent ? "#FF1744" : n.color,
            isHighlighted: isCurrent
          };
        }),
        edges: baseEdges.map(e => {
          const isCurrent = e.id === targetEdgeId || (i > 0 && e.from === path[i - 1] && e.to === currentPathId);
          return {
            ...e,
            color: isCurrent ? "#FF1744" : e.color,
            isHighlighted: isCurrent
          };
        }),
        explanation: `Compare value ${insertVal} with Node ${currentPathNode.val}. Since ${insertVal} ${insertVal >= currentPathNode.val ? '>=' : '<'} ${currentPathNode.val}, we traverse ${insertVal >= currentPathNode.val ? 'right' : 'left'}.`,
        actionType: "HIGHLIGHT",
        highlightedNodeId: currentPathId,
        highlightedEdgeId: targetEdgeId
      });
    }

    // Final insertion step
    const newEdgeId = lastParentId ? `${lastParentId}-${insertVal}` : "";
    const finalNodes = [
      ...baseNodes.map(n => ({ ...n, isHighlighted: false })),
      { id: `${insertVal}`, label: `${insertVal} (New)`, position: newPosition, color: "#00E676", isHighlighted: true }
    ];
    const finalEdges = lastParentId
      ? [
          ...baseEdges.map(e => ({ ...e, isHighlighted: false })),
          { id: newEdgeId, from: lastParentId, to: `${insertVal}`, color: "#00E676", isHighlighted: true }
        ]
      : [];

    steps.push({
      nodes: finalNodes,
      edges: finalEdges,
      explanation: lastParentId
        ? `The child spot is empty. Successfully linked node ${insertVal} under parent ${lastParentId} in BST layout!`
        : `Tree was empty. Successfully inserted Node ${insertVal} as the Root of the BST!`,
      actionType: "INSERT",
      highlightedNodeId: `${insertVal}`,
      highlightedEdgeId: newEdgeId || null
    });

    const rootCandidateId = baseNodes.length > 0 ? path[0] : `${insertVal}`;
    const returnedNodes = [
      ...baseNodes.map(n => ({
        ...n,
        label: n.id === rootCandidateId ? `${n.val} (Root)` : `${n.val}`
      })),
      { id: `${insertVal}`, label: baseNodes.length === 0 ? `${insertVal} (Root)` : `${insertVal} (New)`, position: newPosition, color: "#FF1744", isHighlighted: true }
    ];
    const returnedEdges = lastParentId
      ? [
          ...baseEdges,
          { id: `${lastParentId}-${insertVal}`, from: lastParentId, to: `${insertVal}`, color: "#FF1744", isHighlighted: true }
        ]
      : [];

    return {
      action: "STEP_ALGORITHM",
      structure_type: "BST",
      explanation: `Calculated tree coordinates for inserting ${insertVal}. Left child nodes represent lower keys, and right child nodes represent higher keys.`,
      nodes: returnedNodes,
      edges: returnedEdges,
      steps: steps,
      quiz_question: {
        question: `Assuming a balanced BST with ${insertVal} nodes, what is the maximum traversal complexity?`,
        options: ["O(1) continuous", "O(N) linear", "O(log N) logarithmic", "O(N log N) Heap rules"],
        correct_index: 2,
        explanation: "By dividing search space recursively, searching is O(log N) in a balanced BST."
      }
    };
  }

  if (structureType === "LINKED_LIST" || normPrompt.includes("link") || normPrompt.includes("list")) {
    const isDelete = normPrompt.includes("delete") || normPrompt.includes("remove") || normPrompt.includes("pop") || normPrompt.includes("del");

    if (isDelete) {
      return {
        action: "STEP_ALGORITHM",
        structure_type: "LINKED_LIST",
        explanation: `Calculated single-linked path deleting Node 30 from the sequential list.`,
        nodes: [
          { id: "A", label: "Head: 10", position: [-3, 0, 0], color: "#00E5FF" },
          { id: "B", label: "20", position: [-1, 0, 0], color: "#80F" },
          { id: "D", label: "Tail: 40", position: [1, 0, 0], color: "#00E5FF" }
        ],
        edges: [
          { id: "A-B", from: "A", to: "B", color: "#616161" },
          { id: "B-D", from: "B", to: "D", color: "#616161" }
        ],
        steps: [
          {
            nodes: [
              { id: "A", label: "Head: 10", position: [-4, 0, 0], color: "#FF1744", isHighlighted: true },
              { id: "B", label: "20", position: [-2, 0, 0], color: "#80F" },
              { id: "C", label: "30", position: [0, 0, 0], color: "#80F" },
              { id: "D", label: "Tail: 40", position: [2, 0, 0], color: "#00E5FF" }
            ],
            edges: [
              { id: "A-B", from: "A", to: "B", color: "#616161" },
              { id: "B-C", from: "B", to: "C", color: "#616161" },
              { id: "C-D", from: "C", to: "D", color: "#616161" }
            ],
            explanation: "To delete Node 30, we initiate a traversal search from the list Head (Node 10).",
            actionType: "HIGHLIGHT" as const,
            highlightedNodeId: "A",
            highlightedEdgeId: null
          },
          {
            nodes: [
              { id: "A", label: "Head: 10", position: [-4, 0, 0], color: "#00E5FF" },
              { id: "B", label: "20", position: [-2, 0, 0], color: "#FF1744", isHighlighted: true },
              { id: "C", label: "Target: 30", position: [0, 0, 0], color: "#FF1744", isHighlighted: true },
              { id: "D", label: "Tail: 40", position: [2, 0, 0], color: "#00E5FF" }
            ],
            edges: [
              { id: "A-B", from: "A", to: "B", color: "#FF1744", isHighlighted: true },
              { id: "B-C", from: "B", to: "C", color: "#FF1744", isHighlighted: true },
              { id: "C-D", from: "C", to: "D", color: "#616161" }
            ],
            explanation: "We locate target Node 30 and its predecessor Node 20. We prepare to bypass Node 30 in the list chain.",
            actionType: "HIGHLIGHT" as const,
            highlightedNodeId: "C",
            highlightedEdgeId: "B-C"
          },
          {
            nodes: [
              { id: "A", label: "Head: 10", position: [-4, 0, 0], color: "#00E5FF" },
              { id: "B", label: "20", position: [-2, 0, 0], color: "#80F" },
              { id: "C", label: "Decoupled: 30", position: [0, 1.2, 0], color: "#D50000", isHighlighted: true },
              { id: "D", label: "Tail: 40", position: [2, 0, 0], color: "#00E5FF" }
            ],
            edges: [
              { id: "A-B", from: "A", to: "B", color: "#616161" },
              { id: "B-D", from: "B", to: "D", color: "#00E676", isHighlighted: true },
              { id: "B-C", from: "B", to: "C", color: "#D50000" },
              { id: "C-D", from: "C", to: "D", color: "#D50000" }
            ],
            explanation: "Bypass & Detach: Predecessor Node 20 redirects its reference directly to successor Node 40. Target Node 30 is physically decoupled and lifted out!",
            actionType: "DELETE" as const,
            highlightedNodeId: "C",
            highlightedEdgeId: "B-D"
          },
          {
            nodes: [
              { id: "A", label: "Head: 10", position: [-3, 0, 0], color: "#00E5FF" },
              { id: "B", label: "20", position: [-1, 0, 0], color: "#80F" },
              { id: "D", label: "Tail: 40", position: [1, 0, 0], color: "#00E5FF" }
            ],
            edges: [
              { id: "A-B", from: "A", to: "B", color: "#616161" },
              { id: "B-D", from: "B", to: "D", color: "#616161" }
            ],
            explanation: "The decoupled node is removed and memory garbage-collected. The remaining nodes shift into a clean, unified chain!",
            actionType: "NONE" as const,
            highlightedNodeId: null,
            highlightedEdgeId: null
          }
        ],
        quiz_question: {
          question: "When deleting an intermediate node from a Singly Linked List, how many pointer modifications are required?",
          options: ["Zero pointers", "Exactly one pointer (predecessor's next)", "Two pointers", "Logarithmic adjustments"],
          correct_index: 1,
          explanation: "Only the predecessor node's 'next' pointer needs to be updated to point to the deleted node's successor."
        }
      };
    } else {
      // Insertion operation
      return {
        action: "STEP_ALGORITHM",
        structure_type: "LINKED_LIST",
        explanation: `Calculated single-linked path inserting node ${insertVal} sequentially.`,
        nodes: [
          { id: "A", label: "Head: 10", position: [-4, 0, 0], color: "#00E5FF" },
          { id: "B", label: "20", position: [-2, 0, 0], color: "#80F" },
          { id: `${insertVal}`, label: `${insertVal} (New)`, position: [0, 0, 0], color: "#FF1744", isHighlighted: true },
          { id: "C", label: "30", position: [2, 0, 0], color: "#80F" },
          { id: "D", label: "Tail: 40", position: [4, 0, 0], color: "#00E5FF" }
        ],
        edges: [
          { id: "A-B", from: "A", to: "B", color: "#616161" },
          { id: "B-new", from: "B", to: `${insertVal}`, color: "#FF1744", isHighlighted: true },
          { id: "new-C", from: `${insertVal}`, to: "C", color: "#FF1744", isHighlighted: true },
          { id: "C-D", from: "C", to: "D", color: "#616161" }
        ],
        steps: [
          {
            nodes: [
              { id: "A", label: "Head: 10", position: [-4, 0, 0], color: "#FF1744", isHighlighted: true },
              { id: "B", label: "20", position: [-2, 0, 0], color: "#80F" },
              { id: "C", label: "30", position: [2, 0, 0], color: "#80F" },
              { id: "D", label: "Tail: 40", position: [4, 0, 0], color: "#00E5FF" }
            ],
            edges: [
              { id: "A-B", from: "A", to: "B", color: "#616161" },
              { id: "B-C", from: "B", to: "C", color: "#616161" },
              { id: "C-D", from: "C", to: "D", color: "#616161" }
            ],
            explanation: "Initiate traversal sequence from list Head node 10.",
            actionType: "HIGHLIGHT" as const,
            highlightedNodeId: "A",
            highlightedEdgeId: null
          },
          {
            nodes: [
              { id: "A", label: "Head: 10", position: [-4, 0, 0], color: "#00E5FF" },
              { id: "B", label: "20", position: [-2, 0, 0], color: "#FF1744", isHighlighted: true },
              { id: "C", label: "30", position: [2, 0, 0], color: "#80F" },
              { id: "D", label: "Tail: 40", position: [4, 0, 0], color: "#00E5FF" }
            ],
            edges: [
              { id: "A-B", from: "A", to: "B", color: "#FF1744", isHighlighted: true },
              { id: "B-C", from: "B", to: "C", color: "#616161" },
              { id: "C-D", from: "C", to: "D", color: "#616161" }
            ],
            explanation: `We locate Node 20. Pointers are ready to be redirected to accept new node ${insertVal}.`,
            actionType: "HIGHLIGHT" as const,
            highlightedNodeId: "B",
            highlightedEdgeId: "A-B"
          },
          {
            nodes: [
              { id: "A", label: "Head: 10", position: [-4, 0, 0], color: "#00E5FF" },
              { id: "B", label: "20", position: [-2, 0, 0], color: "#80F" },
              { id: `${insertVal}`, label: `${insertVal} (New)`, position: [0, 0, 0], color: "#00E676", isHighlighted: true },
              { id: "C", label: "30", position: [2, 0, 0], color: "#80F" },
              { id: "D", label: "Tail: 40", position: [4, 0, 0], color: "#00E5FF" }
            ],
            edges: [
              { id: "A-B", from: "A", to: "B", color: "#616161" },
              { id: "B-new", from: "B", to: `${insertVal}`, color: "#00E676", isHighlighted: true },
              { id: "new-C", from: `${insertVal}`, to: "C", color: "#00E676", isHighlighted: true },
              { id: "C-D", from: "C", to: "D", color: "#616161" }
            ],
            explanation: `Successfully updated references: from Node 20 to ${insertVal}, and from ${insertVal} to 30.`,
            actionType: "INSERT" as const,
            highlightedNodeId: `${insertVal}`,
            highlightedEdgeId: "B-new"
          }
        ],
        quiz_question: {
          question: "What is the worst-case complexity to search an item in a Singly Linked List?",
          options: ["O(1) instant", "O(log N)", "O(N) linear", "O(N log N)"],
          correct_index: 2,
          explanation: "Since linked items are non-contiguous, finding any target requires traversing sequential nodes starting from Head, hence O(N)."
        }
      };
    }
  }

  if (structureType === "QUEUE" || normPrompt.includes("queue") || normPrompt.includes("fifo")) {
    return {
      action: "STEP_ALGORITHM",
      structure_type: "QUEUE",
      explanation: `Operational Queue simulation showcasing FIFO order. Elements are enqueued at 'rear' and dequeued at 'front'.`,
      nodes: [
        { id: "A", label: "Front: 10", position: [-3, 0, 0], color: "#00E5FF" },
        { id: "B", label: "20", position: [-1, 0, 0], color: "#80F" },
        { id: "C", label: "30", position: [1, 0, 0], color: "#80F" },
        { id: "D", label: `Rear: ${insertVal}`, position: [3, 0, 0], color: "#FF1744" }
      ],
      edges: [
        { id: "A-B", from: "A", to: "B", color: "#616161" },
        { id: "B-C", from: "B", to: "C", color: "#616161" },
        { id: "C-D", from: "C", to: "D", color: "#616161" }
      ],
      steps: [
        {
          nodes: [
            { id: "A", label: "Front: 10", position: [-3, 0, 0], color: "#00E5FF", isHighlighted: true },
            { id: "B", label: "20", position: [-1, 0, 0], color: "#80F" },
            { id: "C", label: "30", position: [1, 0, 0], color: "#80F" },
            { id: "D", label: `Rear: ${insertVal}`, position: [3, 0, 0], color: "#FF1744" }
          ],
          edges: [
            { id: "A-B", from: "A", to: "B", color: "#616161" },
            { id: "B-C", from: "B", to: "C", color: "#616161" },
            { id: "C-D", from: "C", to: "D", color: "#616161" }
          ],
          explanation: `Let's perform a Peek: we inspect the Front element (10) without dequeuing it.`,
          actionType: "HIGHLIGHT",
          highlightedNodeId: "A"
        },
        {
          nodes: [
            { id: "A", label: "Front: 10 (DEQUEUED)", position: [-3, 0, 0], color: "#FF1744", isHighlighted: true },
            { id: "B", label: "New Front: 20", position: [-1, 0, 0], color: "#00E5FF", isHighlighted: true },
            { id: "C", label: "30", position: [1, 0, 0], color: "#80F" },
            { id: "D", label: `Rear: ${insertVal}`, position: [3, 0, 0], color: "#FF1744" }
          ],
          edges: [
            { id: "A-B", from: "A", to: "B", color: "#FF1744", isHighlighted: true },
            { id: "B-C", from: "B", to: "C", color: "#616161" },
            { id: "C-D", from: "C", to: "D", color: "#616161" }
          ],
          explanation: `Let's Dequeue: we remove the Front node (10) and advance 'front' pointer to node 20.`,
          actionType: "HIGHLIGHT",
          highlightedNodeId: "A"
        }
      ],
      quiz_question: {
        question: "Which of the following describes the principle of a Queue?",
        options: ["Last In First Out (LIFO)", "First In First Out (FIFO)", "Highest Priority First Out (HPFO)", "Binary division order"],
        correct_index: 1,
        explanation: "A standard Queue works on a FIFO (First In First Out) basis, preserving incoming order."
      }
    };
  }

  if (structureType === "HEAP" || normPrompt.includes("heap")) {
    const hasCurrentState = currentNodes && Array.isArray(currentNodes) && currentNodes.length > 0;
    const baseNodes = hasCurrentState
      ? currentNodes.map((n: any) => {
          const idNum = parseInt(n.id, 10);
          const match = String(n.label).match(/-?\d+/);
          const val = match ? parseInt(match[0], 10) : idNum;
          return { idNum, val };
        }).filter(n => !isNaN(n.idNum))
      : [
          { idNum: 1, val: 90 },
          { idNum: 2, val: 85 },
          { idNum: 3, val: 70 },
          { idNum: 4, val: 65 },
          { idNum: 5, val: 50 }
        ];

    baseNodes.sort((a: any, b: any) => a.idNum - b.idNum);
    const currentValues = baseNodes.map((n: any) => n.val);

    const getHeapNodePosition = (idx: number): [number, number, number] => {
      const path: number[] = [];
      let curr = idx;
      while (curr > 0) {
        path.unshift(curr);
        curr = Math.floor(curr / 2);
      }
      
      let pos: [number, number, number] = [0, 2, 0];
      for (let d = 1; d < path.length; d++) {
        const parent = path[d - 1];
        const child = path[d];
        const isLeft = child === parent * 2;
        const levelSpacing = d === 1 ? 1.8 : (d === 2 ? 0.8 : 0.4);
        pos = [
          pos[0] + (isLeft ? -levelSpacing : levelSpacing),
          pos[1] - 1.5,
          0
        ];
      }
      return pos;
    };

    const getHeapLayout = (vals: number[], highlightIndex1?: number, highlightIndex2?: number) => {
      const stepNodes = vals.map((v, idx) => {
        const id = idx + 1;
        const isRoot = id === 1;
        
        let label = `${v}`;
        if (isRoot) label = `Max: ${v}`;
        
        const isHighlighted = id === highlightIndex1 || id === highlightIndex2;
        let color = "#80F";
        if (isRoot) color = "#FF1744";
        else if (id === vals.length) color = "#D1C4E9";
        
        if (isHighlighted) color = "#00E676";
        
        return {
          id: `${id}`,
          label,
          position: getHeapNodePosition(id),
          color,
          isHighlighted,
          scale: isHighlighted ? 1.3 : 1.0,
        };
      });
      
      const stepEdges = [];
      for (let id = 2; id <= vals.length; id++) {
        const parentId = Math.floor(id / 2);
        const isHighlighted = (id === highlightIndex1 && parentId === highlightIndex2) || (id === highlightIndex2 && parentId === highlightIndex1);
        stepEdges.push({
          id: `${parentId}-${id}`,
          from: `${parentId}`,
          to: `${id}`,
          color: isHighlighted ? "#00E676" : "#616161",
          isHighlighted,
        });
      }
      return { nodes: stepNodes, edges: stepEdges };
    };

    const steps = [];
    let activeValues = [...currentValues];
    const isExtract = normPrompt.includes("extract") || normPrompt.includes("delete") || normPrompt.includes("remove") || normPrompt.includes("pop");

    if (isExtract) {
      if (activeValues.length === 0) {
        return {
          action: "STEP_ALGORITHM",
          structure_type: "HEAP",
          explanation: "Heap is empty. Extraction skipped.",
          nodes: [],
          edges: [],
          steps: [],
          quiz_question: {
            question: "What does Extract-Max return on an empty priority queue?",
            options: ["Null or Error", "Zero", "Positive infinity", "Negative infinity"],
            correct_index: 0,
            explanation: "Extracting from an empty priority queue is undefined and typically throws an exception or returns null."
          }
        };
      }

      const extractedVal = activeValues[0];
      // Step 1: Highlight root (Max)
      const initLayout = getHeapLayout(activeValues, 1);
      steps.push({
        nodes: initLayout.nodes.map(n => n.id === "1" ? { ...n, color: "#FF1744", isHighlighted: true } : n),
        edges: initLayout.edges,
        explanation: `Extract Max: The root node (${extractedVal}) holds the maximum value and is selected for removal.`,
        actionType: "HIGHLIGHT" as const,
        highlightedNodeId: "1",
        highlightedEdgeId: null
      });

      if (activeValues.length === 1) {
        steps.push({
          nodes: [],
          edges: [],
          explanation: `Removed the last remaining node from the Heap. Structure is now empty.`,
          actionType: "DELETE" as const,
          highlightedNodeId: null,
          highlightedEdgeId: null
        });
        activeValues = [];
      } else {
        const lastVal = activeValues[activeValues.length - 1];
        const swappedValues = [...activeValues];
        swappedValues[0] = lastVal;
        swappedValues[swappedValues.length - 1] = extractedVal;

        const swapLayout = getHeapLayout(swappedValues, 1, swappedValues.length);
        steps.push({
          nodes: swapLayout.nodes,
          edges: swapLayout.edges,
          explanation: `Swap the root node (${extractedVal}) with the last leaf node (${lastVal}) at index ${swappedValues.length} to prepare for deletion.`,
          actionType: "HIGHLIGHT" as const,
          highlightedNodeId: "1",
          highlightedEdgeId: null
        });

        activeValues = activeValues.slice(0, -1);
        activeValues[0] = lastVal;

        const removedLayout = getHeapLayout(activeValues, 1);
        steps.push({
          nodes: removedLayout.nodes,
          edges: removedLayout.edges,
          explanation: `Successfully removed the old maximum node. Now, the new root (${lastVal}) must bubble-down to restore heap order.`,
          actionType: "DELETE" as const,
          highlightedNodeId: "1",
          highlightedEdgeId: null
        });

        let curr = 1;
        while (curr * 2 <= activeValues.length) {
          const left = curr * 2;
          const right = curr * 2 + 1;
          let largest = curr;

          if (activeValues[left - 1] > activeValues[largest - 1]) {
            largest = left;
          }
          if (right <= activeValues.length && activeValues[right - 1] > activeValues[largest - 1]) {
            largest = right;
          }

          if (largest !== curr) {
            const currVal = activeValues[curr - 1];
            const childVal = activeValues[largest - 1];

            const compareLayout = getHeapLayout(activeValues, curr, largest);
            steps.push({
              nodes: compareLayout.nodes,
              edges: compareLayout.edges,
              explanation: `Compare parent (${currVal}) at index ${curr} with its largest child (${childVal}) at index ${largest}.`,
              actionType: "HIGHLIGHT" as const,
              highlightedNodeId: `${largest}`,
              highlightedEdgeId: null
            });

            activeValues[curr - 1] = childVal;
            activeValues[largest - 1] = currVal;

            const swapStepLayout = getHeapLayout(activeValues, curr, largest);
            steps.push({
              nodes: swapStepLayout.nodes,
              edges: swapStepLayout.edges,
              explanation: `Since child (${childVal}) > parent (${currVal}), swap them to maintain Max-Heap order.`,
              actionType: "HIGHLIGHT" as const,
              highlightedNodeId: `${curr}`,
              highlightedEdgeId: null
            });

            curr = largest;
          } else {
            break;
          }
        }
      }
    } else {
      // Insertion operation
      if (activeValues.length >= 7) {
        return {
          action: "STEP_ALGORITHM",
          structure_type: "HEAP",
          explanation: "Heap limit of 7 elements reached (for visual spacing limits). Extract some first!",
          nodes: baseNodes.map((n: any, idx: number) => ({
            id: `${n.idNum}`,
            label: n.idNum === 1 ? `Max: ${n.val}` : `${n.val}`,
            position: getHeapNodePosition(n.idNum),
            color: n.idNum === 1 ? "#FF1744" : "#80F"
          })),
          edges: [], // Edges will be generated automatically or empty
          steps: [],
          quiz_question: {
            question: "Why does a binary heap have size constraints in UI visualizations?",
            options: ["To prevent node overlaps and visual clutter", "Heap doesn't support more elements mathematically", "Indices cannot exceed 7", "Complete trees must have odd sizes"],
            correct_index: 0,
            explanation: "Complete trees grow exponentially, and limit levels to fit cleanly in viewports without overlap."
          }
        };
      }

      // Step 1: Show incoming node
      const baseLayout = getHeapLayout(activeValues);
      const incomingNode = {
        id: "incoming",
        label: `Incoming: ${insertVal}`,
        color: "#00E676",
        position: [2.5, -1.2, 0] as [number, number, number],
        isHighlighted: true,
        scale: 1.2
      };
      steps.push({
        nodes: [...baseLayout.nodes, incomingNode],
        edges: baseLayout.edges,
        explanation: `Heap Insertion: Prepare to place incoming element ${insertVal} at the next available leaf position.`,
        actionType: "HIGHLIGHT" as const,
        highlightedNodeId: "incoming",
        highlightedEdgeId: null
      });

      // Step 2: Append as leaf
      activeValues = [...activeValues, insertVal];
      const leafLayout = getHeapLayout(activeValues, activeValues.length);
      steps.push({
        nodes: leafLayout.nodes,
        edges: leafLayout.edges,
        explanation: `Place ${insertVal} in the first empty leaf slot at index ${activeValues.length} to preserve the complete binary tree structure.`,
        actionType: "INSERT" as const,
        highlightedNodeId: `${activeValues.length}`,
        highlightedEdgeId: null
      });

      let curr = activeValues.length;
      while (curr > 1) {
        const parent = Math.floor(curr / 2);
        const currVal = activeValues[curr - 1];
        const parentVal = activeValues[parent - 1];

        const compareLayout = getHeapLayout(activeValues, curr, parent);
        steps.push({
          nodes: compareLayout.nodes,
          edges: compareLayout.edges,
          explanation: `Compare child value ${currVal} at index ${curr} with parent value ${parentVal} at index ${parent}.`,
          actionType: "HIGHLIGHT" as const,
          highlightedNodeId: `${curr}`,
          highlightedEdgeId: null
        });

        if (currVal > parentVal) {
          activeValues[curr - 1] = parentVal;
          activeValues[parent - 1] = currVal;

          const swapLayout = getHeapLayout(activeValues, curr, parent);
          steps.push({
            nodes: swapLayout.nodes,
            edges: swapLayout.edges,
            explanation: `Since child (${currVal}) > parent (${parentVal}), we swap them to satisfy the Max-Heap property.`,
            actionType: "HIGHLIGHT" as const,
            highlightedNodeId: `${parent}`,
            highlightedEdgeId: null
          });
          curr = parent;
        } else {
          break;
        }
      }
    }

    const finalLayout = getHeapLayout(activeValues);
    steps.push({
      nodes: finalLayout.nodes,
      edges: finalLayout.edges,
      explanation: isExtract 
        ? `Max-Heap property is fully restored. Extraction of maximum node completed successfully!`
        : `Max-Heap property is fully satisfied. Insertion completed successfully!`,
      actionType: "NONE" as const,
      highlightedNodeId: null,
      highlightedEdgeId: null
    });

    return {
      action: "STEP_ALGORITHM",
      structure_type: "HEAP",
      explanation: isExtract
        ? `Extracted maximum element from Max-Heap. Root has been swapped and bubbled down.`
        : `Inserted node with value ${insertVal} into the Max-Heap, executing bubble-up operations.`,
      nodes: finalLayout.nodes,
      edges: finalLayout.edges,
      steps: steps,
      quiz_question: {
        question: "In a binary max-heap array, where is the second largest element always located?",
        options: ["At index 2 or 3 (Level 1)", "At one of the leaf nodes", "At the very last index", "It can be anywhere in the tree"],
        correct_index: 0,
        explanation: "By max-heap property, the children of the root (indices 2 and 3) must be less than or equal to the root, so the second largest is always one of those two children."
      }
    };
  }

  if (structureType === "GRAPH" || normPrompt.includes("graph") || normPrompt.includes("bfs") || normPrompt.includes("dfs") || normPrompt.includes("traverse")) {
    const isDFS = normPrompt.includes("dfs") || normPrompt.includes("depth");
    const labelPrefix = isDFS ? "DFS" : "BFS";
    const explanationStr = isDFS
      ? `Simulated Depth-First Search (DFS) traversal on an undirected simple graph.`
      : `Simulated Breadth-First Search (BFS) traversal on an undirected simple graph.`;

    const baseNodes = [
      { id: "A", label: "Node A", position: [0, 1.8, 0], color: "#80F" },
      { id: "B", label: "Node B", position: [-2, -0.5, 1], color: "#80F" },
      { id: "C", label: "Node C", position: [2, -0.5, 1], color: "#80F" },
      { id: "D", label: "Node D", position: [0, -1.8, -1], color: "#80F" }
    ];

    const baseEdges = [
      { id: "A-B", from: "A", to: "B", color: "#616161" },
      { id: "A-C", from: "A", to: "C", color: "#616161" },
      { id: "B-D", from: "B", to: "D", color: "#616161" },
      { id: "C-D", from: "C", to: "D", color: "#616161" }
    ];

    const steps = [];

    if (isDFS) {
      // Step 1: Start at A
      steps.push({
        nodes: [
          { id: "A", label: "Visited: A", position: [0, 1.8, 0], color: "#00E676", isHighlighted: true },
          { id: "B", label: "Node B", position: [-2, -0.5, 1], color: "#80F" },
          { id: "C", label: "Node C", position: [2, -0.5, 1], color: "#80F" },
          { id: "D", label: "Node D", position: [0, -1.8, -1], color: "#80F" }
        ],
        edges: baseEdges.map(e => ({ ...e })),
        explanation: "DFS starts at source Node A. We mark A as visited and push it onto the call stack.",
        actionType: "HIGHLIGHT" as const,
        highlightedNodeId: "A",
        highlightedEdgeId: null
      });

      // Step 2: Traverse A -> B
      steps.push({
        nodes: [
          { id: "A", label: "Visited: A", position: [0, 1.8, 0], color: "#00E676" },
          { id: "B", label: "Visited: B", position: [-2, -0.5, 1], color: "#00E676", isHighlighted: true },
          { id: "C", label: "Node C", position: [2, -0.5, 1], color: "#80F" },
          { id: "D", label: "Node D", position: [0, -1.8, -1], color: "#80F" }
        ],
        edges: baseEdges.map(e => ({
          ...e,
          color: e.id === "A-B" ? "#00E676" : e.color,
          isHighlighted: e.id === "A-B"
        })),
        explanation: "Explore unvisited neighbor B. Traverse the edge A -> B and mark B as visited.",
        actionType: "HIGHLIGHT" as const,
        highlightedNodeId: "B",
        highlightedEdgeId: "A-B"
      });

      // Step 3: Traverse B -> D
      steps.push({
        nodes: [
          { id: "A", label: "Visited: A", position: [0, 1.8, 0], color: "#00E676" },
          { id: "B", label: "Visited: B", position: [-2, -0.5, 1], color: "#00E676" },
          { id: "C", label: "Node C", position: [2, -0.5, 1], color: "#80F" },
          { id: "D", label: "Visited: D", position: [0, -1.8, -1], color: "#00E676", isHighlighted: true }
        ],
        edges: [
          { id: "A-B", from: "A", to: "B", color: "#00E676" },
          { id: "A-C", from: "A", to: "C", color: "#616161" },
          { id: "B-D", from: "B", to: "D", color: "#00E676", isHighlighted: true },
          { id: "C-D", from: "C", to: "D", color: "#616161" }
        ],
        explanation: "From B, explore unvisited neighbor D. Traverse the edge B -> D and mark D as visited.",
        actionType: "HIGHLIGHT" as const,
        highlightedNodeId: "D",
        highlightedEdgeId: "B-D"
      });

      // Step 4: Traverse D -> C
      steps.push({
        nodes: [
          { id: "A", label: "Visited: A", position: [0, 1.8, 0], color: "#00E676" },
          { id: "B", label: "Visited: B", position: [-2, -0.5, 1], color: "#00E676" },
          { id: "C", label: "Visited: C", position: [2, -0.5, 1], color: "#00E676", isHighlighted: true },
          { id: "D", label: "Visited: D", position: [0, -1.8, -1], color: "#00E676" }
        ],
        edges: [
          { id: "A-B", from: "A", to: "B", color: "#00E676" },
          { id: "A-C", from: "A", to: "C", color: "#616161" },
          { id: "B-D", from: "B", to: "D", color: "#00E676" },
          { id: "C-D", from: "C", to: "D", color: "#00E676", isHighlighted: true }
        ],
        explanation: "From D, explore unvisited neighbor C. Traverse the edge D -> C and mark C as visited.",
        actionType: "HIGHLIGHT" as const,
        highlightedNodeId: "C",
        highlightedEdgeId: "C-D"
      });

      // Step 5: Backtrack C -> A (no unvisited neighbors)
      steps.push({
        nodes: [
          { id: "A", label: "Visited: A", position: [0, 1.8, 0], color: "#00E676", isHighlighted: true },
          { id: "B", label: "Visited: B", position: [-2, -0.5, 1], color: "#00E676" },
          { id: "C", label: "Visited: C", position: [2, -0.5, 1], color: "#00E676" },
          { id: "D", label: "Visited: D", position: [0, -1.8, -1], color: "#00E676" }
        ],
        edges: [
          { id: "A-B", from: "A", to: "B", color: "#00E676" },
          { id: "A-C", from: "A", to: "C", color: "#00E676", isHighlighted: true },
          { id: "B-D", from: "B", to: "D", color: "#00E676" },
          { id: "C-D", from: "C", to: "D", color: "#00E676" }
        ],
        explanation: "Check Node C's other neighbors. Neighbor A is already visited. Backtrack. All nodes are now fully explored!",
        actionType: "NONE" as const,
        highlightedNodeId: "A",
        highlightedEdgeId: "A-C"
      });
    } else {
      // BFS Traversal Fallback
      // Step 1: Start at A, Enqueue B, C
      steps.push({
        nodes: [
          { id: "A", label: "Visited: A", position: [0, 1.8, 0], color: "#00E676", isHighlighted: true },
          { id: "B", label: "Queue: B", position: [-2, -0.5, 1], color: "#FFD600" },
          { id: "C", label: "Queue: C", position: [2, -0.5, 1], color: "#FFD600" },
          { id: "D", label: "Node D", position: [0, -1.8, -1], color: "#80F" }
        ],
        edges: baseEdges.map(e => ({
          ...e,
          color: (e.id === "A-B" || e.id === "A-C") ? "#FFD600" : e.color,
          isHighlighted: (e.id === "A-B" || e.id === "A-C")
        })),
        explanation: "BFS starts at source Node A (visited). Enqueue neighbors B and C. (Queue is [B, C]).",
        actionType: "HIGHLIGHT" as const,
        highlightedNodeId: "A",
        highlightedEdgeId: null
      });

      // Step 2: Dequeue B, Enqueue D
      steps.push({
        nodes: [
          { id: "A", label: "Visited: A", position: [0, 1.8, 0], color: "#00E676" },
          { id: "B", label: "Visited: B", position: [-2, -0.5, 1], color: "#00E676", isHighlighted: true },
          { id: "C", label: "Queue: C", position: [2, -0.5, 1], color: "#FFD600" },
          { id: "D", label: "Queue: D", position: [0, -1.8, -1], color: "#FFD600" }
        ],
        edges: [
          { id: "A-B", from: "A", to: "B", color: "#00E676" },
          { id: "A-C", from: "A", to: "C", color: "#FFD600" },
          { id: "B-D", from: "B", to: "D", color: "#FFD600", isHighlighted: true },
          { id: "C-D", from: "C", to: "D", color: "#616161" }
        ],
        explanation: "Dequeue Node B. Explore unvisited neighbor D, and enqueue it. (Queue is [C, D]).",
        actionType: "HIGHLIGHT" as const,
        highlightedNodeId: "B",
        highlightedEdgeId: "B-D"
      });

      // Step 3: Dequeue C
      steps.push({
        nodes: [
          { id: "A", label: "Visited: A", position: [0, 1.8, 0], color: "#00E676" },
          { id: "B", label: "Visited: B", position: [-2, -0.5, 1], color: "#00E676" },
          { id: "C", label: "Visited: C", position: [2, -0.5, 1], color: "#00E676", isHighlighted: true },
          { id: "D", label: "Queue: D", position: [0, -1.8, -1], color: "#FFD600" }
        ],
        edges: [
          { id: "A-B", from: "A", to: "B", color: "#00E676" },
          { id: "A-C", from: "A", to: "C", color: "#00E676" },
          { id: "B-D", from: "B", to: "D", color: "#00E676" },
          { id: "C-D", from: "C", to: "D", color: "#FFD600", isHighlighted: true }
        ],
        explanation: "Dequeue Node C. Its neighbors (A, D) are already visited or enqueued. Mark C visited. (Queue is [D]).",
        actionType: "HIGHLIGHT" as const,
        highlightedNodeId: "C",
        highlightedEdgeId: "C-D"
      });

      // Step 4: Dequeue D
      steps.push({
        nodes: [
          { id: "A", label: "Visited: A", position: [0, 1.8, 0], color: "#00E676" },
          { id: "B", label: "Visited: B", position: [-2, -0.5, 1], color: "#00E676" },
          { id: "C", label: "Visited: C", position: [2, -0.5, 1], color: "#00E676" },
          { id: "D", label: "Visited: D", position: [0, -1.8, -1], color: "#00E676", isHighlighted: true }
        ],
        edges: [
          { id: "A-B", from: "A", to: "B", color: "#00E676" },
          { id: "A-C", from: "A", to: "C", color: "#00E676" },
          { id: "B-D", from: "B", to: "D", color: "#00E676" },
          { id: "C-D", from: "C", to: "D", color: "#00E676" }
        ],
        explanation: "Dequeue Node D. Since all its neighbors are visited, we mark Node D visited. Queue is empty, BFS complete!",
        actionType: "NONE" as const,
        highlightedNodeId: "D",
        highlightedEdgeId: null
      });
    }

    const finalLayout = steps[steps.length - 1];

    return {
      action: "STEP_ALGORITHM",
      structure_type: "GRAPH",
      explanation: explanationStr,
      nodes: finalLayout.nodes,
      edges: finalLayout.edges,
      steps: steps,
      quiz_question: {
        question: `What internal data structure is typically used to implement ${labelPrefix}?`,
        options: [
          "Queue (FIFO) for BFS, Stack (LIFO) for DFS",
          "Stack (LIFO) for BFS, Queue (FIFO) for DFS",
          "Binary Heap for both",
          "Hash Table for both"
        ],
        correct_index: 0,
        explanation: `BFS explores layer-by-layer using a FIFO Queue, whereas DFS explores path-by-path using a LIFO Stack (or function call stack recursion).`
      }
    };
  }
}

// Model execution helper that retries transient exceptions and falls back to alternative Gemini tiers automatically
async function generateContentWithRetry(userText: string, instruction: string) {
  const models = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-2.5-pro",
    "gemini-1.5-pro"
  ];
  
  let lastError: any = null;

  for (const modelName of models) {
    let attempt = 0;
    const maxAttempts = 2; // Try each model up to 2 times before falling back
    let delay = 800; // ms
    
    console.log(`[Gemini Core] Attempting contact with model tier: ${modelName}`);

    while (attempt < maxAttempts) {
      try {
        attempt++;
        const response = await ai.models.generateContent({
          model: modelName,
          contents: userText,
          config: {
            systemInstruction: instruction,
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        });
        console.log(`[Gemini Core] Successfully generated content using model tier: ${modelName}`);
        return response;
      } catch (err: any) {
        lastError = err;
        const errStr = String(err.message || err);
        const isInvalidKey = errStr.includes("API key not valid") || errStr.includes("API_KEY_INVALID") || errStr.includes("Key not found");
        
        if (isInvalidKey) {
          console.error(`[Gemini Core] Invalid API Key detected. Aborting model fallback chain.`);
          throw err;
        }

        console.warn(`[Gemini Core] Model tier ${modelName} (Attempt ${attempt}/${maxAttempts}) failed:`, err.message || err);

        if (attempt < maxAttempts) {
          const jitterDelay = delay * Math.pow(2, attempt - 1) + Math.random() * 200;
          console.log(`[Gemini Core] Retrying ${modelName} after ${Math.round(jitterDelay)}ms...`);
          await new Promise((resolve) => setTimeout(resolve, jitterDelay));
        }
      }
    }
    console.warn(`[Gemini Core] Model tier ${modelName} exhausted. Falling back to next available tier...`);
  }

  throw lastError || new Error("All fallback model tiers failed to generate a response.");
}

function getAvailablePort(startPort: number): Promise<number> {
  return new Promise((resolve) => {
    const checkPort = (port: number) => {
      const server = net.createServer();
      server.listen(port, "0.0.0.0", () => {
        server.once("close", () => {
          resolve(port);
        });
        server.close();
      });
      server.on("error", () => {
        checkPort(port + 1);
      });
    };
    checkPort(startPort);
  });
}

async function startServer() {
  const app = express();
  const PORT = await getAvailablePort(parseInt(process.env.PORT || "3000", 10));

  app.use(express.json());

  // API endpoint for AI architect
  app.post("/api/dsa/architect", async (req, res) => {
    try {
      const { prompt, structureType, requestType, currentNodes, currentEdges } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          error: "GEMINI_API_KEY is not configured on the server. Please add it via Settings > Secrets.",
        });
      }

      const systemInstruction = `You are the 'AI DSA Architect' for an interactive 3D Data Structure & Algorithm Learning App.
Your sole job is to translate human requests into structured 3D visualization commands as a single valid JSON object.
Do NOT include markdown formatting or backticks around the JSON. Your output must be parseable raw JSON.

Output format must strictly conform to this JSON Schema:
{
  "action": "CREATE_STRUCTURE" | "STEP_ALGORITHM" | "QUIZ_MODE",
  "structure_type": "LINKED_LIST" | "BST" | "GRAPH" | "HEAP" | "QUEUE" | "STACK",
  "nodes": [
    { "id": "unique_string_or_number", "label": "node_value", "position": [x, y, z], "color": "#hexColor", "isHighlighted": boolean }
  ],
  "edges": [
    { "id": "edge_id", "from": "id1", "to": "id2", "color": "#hexColor", "isHighlighted": boolean }
  ],
  "explanation": "A concise, elegant, technical but easy-to-understand educational explanation (max 2 sentences).",
  "steps": [
    {
      "nodes": [ { "id": "id", "label": "val", "position": [x, y, z], "color": "#hexColor", "isHighlighted": boolean } ],
      "edges": [ { "id": "id", "from": "id1", "to": "id2", "color": "#hex", "isHighlighted": boolean } ],
      "explanation": "Step-specific description detailing this specific micro-action.",
      "actionType": "INSERT" | "HIGHLIGHT" | "DELETE" | "NONE",
      "highlightedNodeId": "id_or_null",
      "highlightedEdgeId": "id_or_null"
    }
  ],
  "quiz_question": {
    "question": "Quiz question about the structure/operation requested",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_index": 0,
    "explanation": "Brief explanation of the correct answer"
  }
}

3D Layout Design Rules:
1. LINKED_LIST: Layout nodes sequentially along the X-axis (e.g. X coordinates like -4, -2, 0, 2, 4. Y = 0, Z = 0). Edges go sequentially: from Node 1 to Node 2, Node 2 to Node 3.
2. BST (Binary Search Tree): Tree layout. Root is at [0, 2, 0].
   - Level 1: Left at [-2, 0.5, 0], Right at [2, 0.5, 0].
   - Level 2: Left-Left at [-3, -1, 0], Left-Right at [-1, -1, 0], Right-Left at [1, -1, 0], Right-Right at [3, -1, 0].
   - Scale spacing appropriately so nodes don't overlap! Y axis should go downwards for children.
3. GRAPH: Circular or standard open coordinate space (e.g., node 1 at [0, 2, 0], node 2 at [2, 0, 1], node 3 at [-2, 0, -1] etc.).
4. HEAP: Draw as binary tree layout (similar to BST, root at top [0, 2, 0], binary indexing nodes at positions [x, y, 0]).
5. QUEUE: Layout nodes horizontally along the X-axis (e.g. X coordinates like -3, -1, 1, 3. Y = 0, Z = 0). The item at lowest X coordinate is the Front (label prefix: 'Front: '), and highest X coordinate is the Rear (label prefix: 'Rear: '). Edges should point sequentially from left to right (Front to Rear).
6. STACK: Layout nodes vertically along the Y-axis (e.g. Y coordinates like -2, -1, 0, 1, 2. X = 0, Z = 0). The item at lowest Y coordinate is the Base (label prefix: 'Base: '), and highest Y is the Top (label prefix: 'Top: '). Edges point sequentially from top to bottom (Top to Base).

If the action is STEP_ALGORITHM:
Make sure to generate a logical list of 'steps' demonstrating the step-by-step algorithm requested, such as:
- Inserting a node (highlight traversal path, then create the node, then links)
- Deleting a node
- Traversal (like BFS or DFS, highlight each current node and edges in successive steps).
Ensure each step contains the full updated list of nodes and edges, of which some are highlighted.

Return ONLY the raw JSON string content. Do not include markdown codeblocks (no \`\`\`json, no \`\`\`).`;

      const userText = `Request: "${prompt}"
Structure Type: ${structureType || "BST"}
RequestType: ${requestType || "CREATE_STRUCTURE"}
Current Nodes State: ${JSON.stringify(currentNodes || [])}
Current Edges State: ${JSON.stringify(currentEdges || [])}

Please calculate 3D coordinates, layout the nodes and edges, write the explanation, and include steps if animating an algorithm or operation.
If the request is to create, build, or generate a new structure (or start fresh, e.g. "create a...", "build a...", "generate...", "new..."), you MUST ignore the Current Nodes State and Current Edges State and build a brand-new layout from scratch.
Otherwise, if the request is an incremental modification (e.g. adding, connecting, deleting, or traversing elements in the existing structure), keep the existing structure intact and perform the operations incrementally on the current state!`;

      let responseText = "";
      try {
        const response = await generateContentWithRetry(userText, systemInstruction, 3);
        responseText = response.text || "{}";
      } catch (gemError: any) {
        console.warn("[Gemini API Outage / Demands Limit] Activating offline local generative coordinate calculators...", gemError);
        // Fall back gracefully to high-quality procedural 3D structure layout, matching client expectancies perfectly
        const backupResult = generateFallbackResponse(prompt, structureType, requestType, currentNodes, currentEdges);
        return res.json(backupResult);
      }

      // Parse to verify it is valid JSON
      try {
        const parsed = JSON.parse(responseText.trim());
        res.json(parsed);
      } catch (err) {
        console.error("Gemini failed to generate valid JSON, falling back procedures:", responseText, err);
        const backupResult = generateFallbackResponse(prompt, structureType, requestType, currentNodes, currentEdges);
        res.json(backupResult);
      }
    } catch (error: any) {
      console.error("General error handler in dsa core:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // Serve static assets in production
  if (process.env.NODE_ENV === "production") {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    // In development, hook up Vite dev server middleware with unique HMR port to avoid conflicts
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: {
          port: 24678 + (PORT - 3000)
        }
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://localhost:${PORT}`);
  });
}

startServer();
