import React from "react";
import { create } from "zustand";
import { Node3D, Edge3D, AlgStep, QuizQuestion, DSAStructure } from "../types";
import { PRESET_STRUCTURES } from "../data/presets";

export interface LogItem {
  id: string;
  message: string;
  time: string;
  type: "info" | "success" | "warning" | "error" | "code";
}

interface AlgorithmState {
  nodes: Node3D[];
  edges: Edge3D[];
  structureType: "LINKED_LIST" | "BST" | "GRAPH" | "HEAP" | "QUEUE" | "STACK";
  explanation: string;
  steps: AlgStep[];
  currentStepIndex: number;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  logs: LogItem[];
  quizQuestion: QuizQuestion | null;
  quizUserAnswer: number | null;
  quizSubmitted: boolean;
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  groqApiKey: string;
  setGroqApiKey: (key: string) => void;
  selectedProvider: "AISTUDIO" | "GROQ";
  setSelectedProvider: (provider: "AISTUDIO" | "GROQ") => void;

  addLog: (message: string, type?: LogItem["type"]) => void;
  setStructureType: (type: "LINKED_LIST" | "BST" | "GRAPH" | "HEAP" | "QUEUE" | "STACK") => void;
  nextStep: () => void;
  prevStep: () => void;
  setStep: (index: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setQuizUserAnswer: (index: number) => void;
  submitQuizAnswer: () => void;
  resetQuiz: () => void;
  loadPreset: (key: keyof typeof PRESET_STRUCTURES) => void;
  submitAIRequest: (prompt: string, actionType?: "CREATE_STRUCTURE" | "STEP_ALGORITHM" | "QUIZ_MODE") => Promise<void>;
  clearData: () => void;
  enqueue: (value: number) => void;
  dequeue: () => void;
  peek: () => void;
  pushStack: (value: number) => void;
  popStack: () => void;
  peekStack: () => void;
  insertHeap: (value: number) => void;
  extractMaxHeap: () => void;
  insertBST: (value: number) => void;
  insertLinkedList: (value: number, insertIndex?: number) => void;
  deleteLinkedList: (targetIdOrValue: string | number) => void;
  traverseBST: (type: "inorder" | "preorder" | "postorder") => void;
  traverseLinkedList: () => void;
  traverseGraph: (type: "bfs" | "dfs") => void;
}

let playTimer: NodeJS.Timeout | null = null;

const createInitialLog = (message: string, type: LogItem["type"]) => ({
  id: Math.random().toString(36).substring(2, 9),
  message,
  time: new Date().toLocaleTimeString(),
  type,
});

// Create our named Zustand store
export const useAlgorithmStore = create<AlgorithmState>((set, get) => ({
  nodes: PRESET_STRUCTURES.bst_insert.nodes,
  edges: PRESET_STRUCTURES.bst_insert.edges,
  structureType: "BST",
  explanation: PRESET_STRUCTURES.bst_insert.explanation,
  steps: PRESET_STRUCTURES.bst_insert.steps || [],
  currentStepIndex: -1,
  isPlaying: false,
  isLoading: false,
  error: null,
  logs: [
    createInitialLog("System initialized. AI General Counsel Online.", "success"),
    createInitialLog("Binary Search Tree demonstration loaded by default.", "info"),
  ],
  quizQuestion: PRESET_STRUCTURES.bst_insert.quiz_question || null,
  quizUserAnswer: null,
  quizSubmitted: false,
  geminiApiKey: typeof window !== "undefined" ? localStorage.getItem("gemini_api_key") || "" : "",
  groqApiKey: typeof window !== "undefined" ? localStorage.getItem("groq_api_key") || "" : "",
  selectedProvider: typeof window !== "undefined" ? (localStorage.getItem("selected_provider") || "AISTUDIO") as "AISTUDIO" | "GROQ" : "AISTUDIO",

  setGeminiApiKey: (key: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("gemini_api_key", key);
    }
    set({ geminiApiKey: key });
    get().addLog(key ? "Local Gemini API Key configured. AI traffic is routed client-side." : "Local Gemini API Key cleared. AI traffic is routed server-side.", "success");
  },

  setGroqApiKey: (key: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("groq_api_key", key);
    }
    set({ groqApiKey: key });
    get().addLog(key ? "Local Groq API Key configured. AI traffic is routed client-side via Groq." : "Local Groq API Key cleared.", "success");
  },

  setSelectedProvider: (provider: "AISTUDIO" | "GROQ") => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selected_provider", provider);
    }
    set({ selectedProvider: provider });
    get().addLog(`Switched active AI provider: ${provider === "AISTUDIO" ? "Google AI Studio" : "Groq"}`, "info");
  },

  addLog: (message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    const newLog: LogItem = {
      id: Math.random().toString(36).substring(2, 9),
      message,
      time: timestamp,
      type,
    };
    set((state) => ({ logs: [...state.logs, newLog] }));
  },

  setStructureType: (type) => {
    if (playTimer) {
      clearTimeout(playTimer);
      playTimer = null;
    }
    set({ structureType: type, isPlaying: false });
    get().addLog(`Switched target model archetype to details-space: ${type}`, "info");

    if (type === "BST") get().loadPreset("bst_insert");
    else if (type === "LINKED_LIST") get().loadPreset("linked_list_insert");
    else if (type === "GRAPH") get().loadPreset("graph_bfs");
    else if (type === "QUEUE") get().loadPreset("queue_preset");
    else if (type === "STACK") get().loadPreset("stack_preset");
    else {
      set({
        nodes: [
          { id: "1", label: "Max: 90", position: [0, 2, 0], color: "#FF1744" },
          { id: "2", label: "85", position: [-1.8, 0.5, 0], color: "#80F" },
          { id: "3", label: "70", position: [1.8, 0.5, 0], color: "#80F" },
          { id: "4", label: "65", position: [-2.6, -1, 0], color: "#D1C4E9" },
          { id: "5", label: "50", position: [-1.0, -1, 0], color: "#D1C4E9" },
        ],
        edges: [
          { id: "1-2", from: "1", to: "2", color: "#616161" },
          { id: "1-3", from: "1", to: "3", color: "#616161" },
          { id: "2-4", from: "2", to: "4", color: "#616161" },
          { id: "2-5", from: "2", to: "5", color: "#616161" },
        ],
        explanation: "A Binary Heap is a complete binary tree where parent key values are compared recursively with children (Max-Heap rules displayed).",
        steps: [],
        currentStepIndex: -1,
        quizQuestion: {
          question: "In a Max-Heap of size N, what is the complexity to extract the maximum element?",
          options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
          correct_index: 1,
          explanation: "Extracting the maximum root takes O(1) time, but restoring the heap property (heapify) takes O(log N).",
        },
        quizUserAnswer: null,
        quizSubmitted: false,
      });
    }
  },

  loadPreset: (key) => {
    if (playTimer) {
      clearTimeout(playTimer);
      playTimer = null;
    }
    const preset = PRESET_STRUCTURES[key];
    if (!preset) return;

    set({
      nodes: preset.nodes,
      edges: preset.edges,
      structureType: preset.structure_type,
      explanation: preset.explanation,
      steps: preset.steps || [],
      currentStepIndex: -1,
      isPlaying: false,
      quizQuestion: preset.quiz_question || null,
      quizUserAnswer: null,
      quizSubmitted: false,
      error: null,
    });

    get().addLog(`Successfully spun up pre-configured '${preset.structure_type}' demonstration environment.`, "success");
  },

  setStep: (index) => {
    const { steps, explanation } = get();
    if (index >= -1 && index < steps.length) {
      set({ currentStepIndex: index });
      if (index === -1) {
        const preset = Object.values(PRESET_STRUCTURES).find((p) => p.explanation === explanation);
        if (preset) {
          set({ nodes: preset.nodes, edges: preset.edges });
        }
        get().addLog(`Animation scrubbed to: [Completed Structure Execution State]`, "info");
      } else {
        const step = steps[index];
        set({ nodes: step.nodes, edges: step.edges });
        get().addLog(`[Step ${index + 1}/${steps.length}] - ${step.explanation}`, "code");
      }
    }
  },

  nextStep: () => {
    const { steps, currentStepIndex, setStep, setIsPlaying } = get();
    if (steps.length === 0) return;
    if (currentStepIndex < steps.length - 1) {
      setStep(currentStepIndex + 1);
    } else {
      setStep(-1);
      setIsPlaying(false);
      get().addLog(`Animation cycle finished.`, "success");
    }
  },

  prevStep: () => {
    const { steps, currentStepIndex, setStep } = get();
    if (steps.length === 0) return;
    if (currentStepIndex > -1) {
      setStep(currentStepIndex - 1);
    } else {
      setStep(steps.length - 1);
    }
  },

  setIsPlaying: (playing) => {
    set({ isPlaying: playing });
    if (playTimer) {
      clearTimeout(playTimer);
      playTimer = null;
    }

    if (playing) {
      const runAutoplay = () => {
        const state = useAlgorithmStore.getState();
        if (state.isPlaying && state.steps.length > 0) {
          state.nextStep();
          playTimer = setTimeout(runAutoplay, 2500);
        }
      };
      playTimer = setTimeout(runAutoplay, 2500);
    }
  },

  setQuizUserAnswer: (index) => {
    set({ quizUserAnswer: index });
  },

  submitQuizAnswer: () => {
    const { quizUserAnswer, quizQuestion } = get();
    if (quizUserAnswer === null) return;
    set({ quizSubmitted: true });
    const isCorrect = quizUserAnswer === quizQuestion?.correct_index;
    if (isCorrect) {
      get().addLog(`QUIZ ASSESSMENT: Correct! ${quizQuestion?.explanation}`, "success");
    } else {
      get().addLog(`QUIZ ASSESSMENT: Incorrect. Try reading the explanation: ${quizQuestion?.explanation}`, "warning");
    }
  },

  resetQuiz: () => {
    set({ quizUserAnswer: null, quizSubmitted: false });
    get().addLog(`Quiz reset. Select your answer when ready.`, "info");
  },

  clearData: () => {
    if (playTimer) {
      clearTimeout(playTimer);
      playTimer = null;
    }
    set({
      nodes: [],
      edges: [],
      steps: [],
      currentStepIndex: -1,
      isPlaying: false,
      quizQuestion: null,
      quizUserAnswer: null,
      quizSubmitted: false,
    });
  },

  submitAIRequest: async (prompt, actionType = "CREATE_STRUCTURE") => {
    if (playTimer) {
      clearTimeout(playTimer);
      playTimer = null;
    }
    const { structureType, nodes, edges, addLog, geminiApiKey, groqApiKey, selectedProvider } = get();
    set({ isLoading: true, error: null, isPlaying: false });

    const cleanNodesForAI = nodes.map(n => ({
      ...n,
      label: String(n.label)
        .replace(/^(?:Queue|Visiting|Visited|DFS Active|Backtracked|Front|Rear|Top|Base|Front\/Rear|Top\/Base|Incoming|New Front):\s*/i, "")
        .replace(/\s*\(New\)/g, "")
        .replace(/\s*\(Root\)/g, ""),
      isHighlighted: false
    }));

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
Request Type: ${actionType || "CREATE_STRUCTURE"}
Current Nodes State: ${JSON.stringify(cleanNodesForAI || [])}
Current Edges State: ${JSON.stringify(edges || [])}

Please calculate 3D coordinates, layout the nodes and edges, write the explanation, and include steps if animating an algorithm or operation.
If the request is to create, build, or generate a new structure (or start fresh, e.g. "create a...", "build a...", "generate...", "new..."), you MUST ignore the Current Nodes State and Current Edges State and build a brand-new layout from scratch.
Otherwise, if the request is an incremental modification (e.g. adding, connecting, deleting, or traversing elements in the existing structure), keep the existing structure intact and perform the operations incrementally on the current state!`;

    let rawData: DSAStructure;

    try {
      if (selectedProvider === "AISTUDIO" && geminiApiKey) {
        addLog(`Transceiving client-side architectural request to Google Gemini API (using local Key)...`, "info");
        
        const clientModels = [
          "gemini-2.5-flash",
          "gemini-2.0-flash",
          "gemini-1.5-flash",
          "gemini-2.5-pro",
          "gemini-1.5-pro"
        ];
        
        let response = null;
        let lastError: any = null;
        let resData: any = null;

        for (const modelName of clientModels) {
          let attempt = 0;
          const maxAttempts = 2; // Try each model up to 2 times
          let delay = 800; // ms
          let success = false;

          addLog(`Attempting contact with local client model tier: ${modelName}`, "info");

          while (attempt < maxAttempts) {
            try {
              attempt++;
              response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    contents: [
                      {
                        parts: [
                          {
                            text: userText,
                          },
                        ],
                      },
                    ],
                    systemInstruction: {
                      parts: [
                        {
                          text: systemInstruction,
                        },
                      ],
                    },
                    generationConfig: {
                      responseMimeType: "application/json",
                      temperature: 0.2,
                    },
                  }),
                }
              );

              if (response.ok) {
                resData = await response.json();
                success = true;
                break;
              } else {
                const errData = await response.json().catch(() => ({}));
                const errMsg = errData.error?.message || `HTTP ${response.status}: Failed to generate content.`;
                lastError = new Error(errMsg);

                // Stop immediately only if API key is invalid
                const isInvalidKey = errMsg.includes("API key not valid") || errMsg.includes("API_KEY_INVALID") || errMsg.includes("Key not found");
                if (isInvalidKey) {
                  throw lastError;
                }

                console.warn(`[Gemini Client] Model tier ${modelName} (Attempt ${attempt}/${maxAttempts}) failed: ${errMsg}`);
              }
            } catch (err: any) {
              lastError = err;
              if (String(err.message).includes("API key not valid") || String(err.message).includes("API_KEY_INVALID") || String(err.message).includes("Key not found")) {
                throw err;
              }
            }

            if (attempt < maxAttempts) {
              const jitterDelay = delay * Math.pow(2, attempt - 1) + Math.random() * 200;
              await new Promise((resolve) => setTimeout(resolve, jitterDelay));
            }
          }

          if (success && resData) {
            addLog(`Successfully generated content using local model tier: ${modelName}`, "success");
            break;
          }
          console.warn(`[Gemini Client] Model tier ${modelName} exhausted. Falling back to the next available tier...`);
        }

        if (!resData) {
          throw lastError || new Error("All client fallback model tiers failed to generate content.");
        }
        const responseText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!responseText) {
          throw new Error("Empty response received from local Gemini API key.");
        }

        let cleanJSON = responseText.trim();
        if (cleanJSON.startsWith("```json")) {
          cleanJSON = cleanJSON.substring(7);
        }
        if (cleanJSON.endsWith("```")) {
          cleanJSON = cleanJSON.substring(0, cleanJSON.length - 3);
        }
        cleanJSON = cleanJSON.trim();
        rawData = JSON.parse(cleanJSON);

      } else if (selectedProvider === "GROQ" && groqApiKey) {
        addLog(`Transceiving client-side architectural request to Groq API (using local Key)...`, "info");

        const groqModels = [
          "llama-3.3-70b-versatile",
          "mixtral-8x7b-32768",
          "llama3-70b-8192"
        ];

        let response = null;
        let lastError: any = null;
        let resData: any = null;

        for (const modelName of groqModels) {
          let attempt = 0;
          const maxAttempts = 2; // Try each model up to 2 times
          let delay = 800; // ms
          let success = false;

          addLog(`Attempting contact with local Groq model tier: ${modelName}`, "info");

          while (attempt < maxAttempts) {
            try {
              attempt++;
              response = await fetch(
                `https://api.groq.com/openai/v1/chat/completions`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${groqApiKey}`,
                  },
                  body: JSON.stringify({
                    model: modelName,
                    messages: [
                      {
                        role: "system",
                        content: systemInstruction,
                      },
                      {
                        role: "user",
                        content: userText,
                      },
                    ],
                    response_format: { type: "json_object" },
                    temperature: 0.2,
                  }),
                }
              );

              if (response.ok) {
                resData = await response.json();
                success = true;
                break;
              } else {
                const errData = await response.json().catch(() => ({}));
                const errMsg = errData.error?.message || `HTTP ${response.status}: Failed to generate content.`;
                lastError = new Error(errMsg);

                // Stop immediately if unauthorized or invalid API key
                const isInvalidKey = response.status === 401 || errMsg.includes("API key not valid") || errMsg.includes("invalid_api_key") || errMsg.includes("Key not found");
                if (isInvalidKey) {
                  throw lastError;
                }

                console.warn(`[Groq Client] Model tier ${modelName} (Attempt ${attempt}/${maxAttempts}) failed: ${errMsg}`);
              }
            } catch (err: any) {
              lastError = err;
              if (response?.status === 401 || String(err.message).includes("API key not valid") || String(err.message).includes("invalid_api_key") || String(err.message).includes("Key not found")) {
                throw err;
              }
            }

            if (attempt < maxAttempts) {
              const jitterDelay = delay * Math.pow(2, attempt - 1) + Math.random() * 200;
              await new Promise((resolve) => setTimeout(resolve, jitterDelay));
            }
          }

          if (success && resData) {
            addLog(`Successfully generated content using local Groq model tier: ${modelName}`, "success");
            break;
          }
          console.warn(`[Groq Client] Model tier ${modelName} exhausted. Falling back to the next available tier...`);
        }

        if (!resData) {
          throw lastError || new Error("All client Groq fallback model tiers failed to generate content.");
        }

        const responseText = resData.choices?.[0]?.message?.content;
        if (!responseText) {
          throw new Error("Empty response received from local Groq API key.");
        }

        let cleanJSON = responseText.trim();
        if (cleanJSON.startsWith("```json")) {
          cleanJSON = cleanJSON.substring(7);
        }
        if (cleanJSON.endsWith("```")) {
          cleanJSON = cleanJSON.substring(0, cleanJSON.length - 3);
        }
        cleanJSON = cleanJSON.trim();
        rawData = JSON.parse(cleanJSON);

      } else {
        addLog(`Transceiving architectural request to AI Core server endpoint...`, "info");
        const response = await fetch("/api/dsa/architect", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt,
            structureType,
            requestType: actionType,
            currentNodes: cleanNodesForAI,
            currentEdges: edges,
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || `HTTP ${response.status}: Unknown error`);
        }

        rawData = await response.json();
      }

      addLog(`AI response parsed successfully! Rebuilding 3D space.`, "success");

      const normalizedNodes = rawData.nodes
        ? rawData.nodes.map((n) => ({
            ...n,
            scale: n.isHighlighted ? 1.3 : 1.0,
          }))
        : [];

      set({
        structureType: rawData.structure_type,
        explanation: rawData.explanation,
        nodes: normalizedNodes,
        edges: rawData.edges || [],
        steps: rawData.steps || [],
        currentStepIndex: rawData.steps && rawData.steps.length > 0 ? 0 : -1,
        quizQuestion: rawData.quiz_question || null,
        quizUserAnswer: null,
        quizSubmitted: false,
      });

      if (rawData.steps && rawData.steps.length > 0) {
        set({
          nodes: rawData.steps[0].nodes,
          edges: rawData.steps[0].edges,
        });
        addLog(`Loaded ${rawData.steps.length} animation frames for algorithm sequence. Ready to play!`, "success");
        get().setIsPlaying(true);
      }

      addLog(`AI ARCHITECT: "${rawData.explanation}"`, "success");
    } catch (err: any) {
      console.error(err);
      set({ error: err.message || "An exception occurred while connecting with AI Core." });
      addLog(`AI Core Transmission Error: ${err.message}`, "error");
    } finally {
      set({ isLoading: false });
    }
  },

  enqueue: (value) => {
    const { nodes, addLog } = get();
    // Helper to extract values
    const sorted = [...nodes].sort((a, b) => a.position[0] - b.position[0]);
    const currentValues = sorted.map(n => {
      const match = n.label.match(/\d+/) || n.label.match(/-?\d+/);
      return match ? parseInt(match[0], 10) : 10;
    });

    if (currentValues.length >= 7) {
      addLog("Queue limit of 7 elements reached (for visual spacing limits). Dequeue some first!", "warning");
      return;
    }
    
    const newValues = [...currentValues, value];
    const steps: AlgStep[] = [];
    
    const getLayout = (vals: number[], highlightIndex: number | null = null, highlightNext: boolean = false) => {
      const spacing = 1.6;
      const startX = -((vals.length - 1) * spacing) / 2;
      
      const stepNodes = vals.map((v, idx) => {
        const isHeading = idx === 0;
        const isTrailing = idx === vals.length - 1;
        
        let label = `${v}`;
        if (isHeading && isTrailing) label = `Front/Rear: ${v}`;
        else if (isHeading) label = `Front: ${v}`;
        else if (isTrailing) label = `Rear: ${v}`;
        
        const isHighlighted = idx === highlightIndex;
        let color = "#80F";
        if (isHeading) color = "#00E5FF";
        else if (isTrailing) color = "#FF1744";
        
        if (isHighlighted) color = "#00E676";
        
        return {
          id: `Q-${idx}-${v}`,
          label,
          position: [startX + idx * spacing, 0, 0] as [number, number, number],
          color,
          isHighlighted,
        };
      });
      
      const stepEdges = stepNodes.slice(0, -1).map((sn, idx) => {
        const nextNode = stepNodes[idx + 1];
        const isHighlighted = highlightNext && idx === vals.length - 2;
        return {
          id: `${sn.id}-${nextNode.id}`,
          from: sn.id,
          to: nextNode.id,
          color: isHighlighted ? "#00E676" : "#475569",
          isHighlighted,
        };
      });
      
      return { nodes: stepNodes, edges: stepEdges };
    };

    // Step 1: Incoming Node at bottom-right offset
    const baseLayout = getLayout(currentValues);
    const spacing = 1.6;
    const endX = baseLayout.nodes.length > 0 ? baseLayout.nodes[baseLayout.nodes.length - 1].position[0] + spacing : 0;
    
    const incomingNode: Node3D = {
      id: "incoming",
      label: `Incoming: ${value}`,
      color: "#00E676",
      position: [endX, -1.2, 0],
      isHighlighted: true,
    };
    
    steps.push({
      nodes: [...baseLayout.nodes, incomingNode],
      edges: baseLayout.edges,
      explanation: `Enqueue initiates: Prepare to append incoming element ${value} to the rear of the Queue.`,
      actionType: "HIGHLIGHT",
      highlightedNodeId: "incoming",
    });
    
    // Step 2: Establish the reference connection from rear to incoming
    const linkedLayout = getLayout(newValues, newValues.length - 1, true);
    steps.push({
      nodes: linkedLayout.nodes,
      edges: linkedLayout.edges,
      explanation: `Link the former rear node to the incoming node ${value}. Pointer is ready to advance.`,
      actionType: "HIGHLIGHT",
      highlightedEdgeId: linkedLayout.edges[linkedLayout.edges.length - 1]?.id || null,
    });
    
    // Step 3: Rear pointer advances to incoming
    const finalLayout = getLayout(newValues);
    steps.push({
      nodes: finalLayout.nodes,
      edges: finalLayout.edges,
      explanation: `Successfully updated the 'rear' tracker reference to point to node ${value}. Enqueue complete!`,
      actionType: "INSERT",
      highlightedNodeId: `Q-${newValues.length - 1}-${value}`,
    });

    set({
      nodes: finalLayout.nodes,
      edges: finalLayout.edges,
      steps,
      currentStepIndex: 0,
      explanation: `Enqueued ${value} to the rear of the Queue.`,
      isPlaying: false,
    });
    addLog(`Enqueued element: ${value}. Current sequence: [${newValues.join(", ")}]`, "success");
  },

  dequeue: () => {
    const { nodes, addLog } = get();
    // Helper to extract values
    const sorted = [...nodes].sort((a, b) => a.position[0] - b.position[0]);
    const currentValues = sorted.map(n => {
      const match = n.label.match(/\d+/) || n.label.match(/-?\d+/);
      return match ? parseInt(match[0], 10) : 10;
    });

    if (currentValues.length === 0) {
      addLog("Queue is empty. Dequeue operation was skipped.", "warning");
      return;
    }
    
    const dequeuedValue = currentValues[0];
    const steps: AlgStep[] = [];
    
    const getLayout = (vals: number[], highlightIndex: number | null = null, highlightNextDelete: boolean = false) => {
      const spacing = 1.6;
      const startX = -((vals.length - 1) * spacing) / 2;
      
      const stepNodes = vals.map((v, idx) => {
        const isHeading = idx === 0;
        const isTrailing = idx === vals.length - 1;
        
        let label = `${v}`;
        if (isHeading && isTrailing) label = `Front/Rear: ${v}`;
        else if (isHeading) label = `Front: ${v}`;
        else if (isTrailing) label = `Rear: ${v}`;
        
        const isHighlighted = idx === highlightIndex;
        let color = "#80F";
        if (isHeading) color = "#00E5FF";
        else if (isTrailing) color = "#FF1744";
        
        if (isHighlighted) color = "#FF1744";
        
        return {
          id: `Q-${idx}-${v}`,
          label,
          position: [startX + idx * spacing, 0, 0] as [number, number, number],
          color,
          isHighlighted,
        };
      });
      
      const stepEdges = stepNodes.slice(0, -1).map((sn, idx) => {
        const nextNode = stepNodes[idx + 1];
        const isHighlighted = highlightNextDelete && idx === 0;
        return {
          id: `${sn.id}-${nextNode.id}`,
          from: sn.id,
          to: nextNode.id,
          color: isHighlighted ? "#FF1744" : "#475569",
          isHighlighted,
        };
      });
      
      return { nodes: stepNodes, edges: stepEdges };
    };

    const baseLayout = getLayout(currentValues);
    
    // Step 1: Highlight the Front element slated for deletion
    steps.push({
      nodes: baseLayout.nodes.map((n, i) => i === 0 ? { ...n, color: "#FF1744", isHighlighted: true } : n),
      edges: baseLayout.edges,
      explanation: `Identify current Front element (${dequeuedValue}) to be removed from the Queue.`,
      actionType: "HIGHLIGHT",
      highlightedNodeId: baseLayout.nodes[0]?.id || null,
    });
    
    // Step 2: Severe links and advance Front pointer
    if (currentValues.length > 1) {
      const nextFrontLayout = getLayout(currentValues, null, true);
      steps.push({
        nodes: nextFrontLayout.nodes.map((n, i) => {
          if (i === 0) return { ...n, color: "#FF1744", isHighlighted: true };
          if (i === 1) return { ...n, color: "#00E5FF", label: `New Front: ${currentValues[1]}`, isHighlighted: true };
          return n;
        }),
        edges: nextFrontLayout.edges,
        explanation: `Disconnect pointer leading from ${dequeuedValue}. Point 'front' tracker to the next node (${currentValues[1]}).`,
        actionType: "HIGHLIGHT",
        highlightedEdgeId: nextFrontLayout.edges[0]?.id || null,
      });
    }
    
    // Step 3: Dequeued outcome
    const remainingValues = currentValues.slice(1);
    const finalLayout = getLayout(remainingValues);
    steps.push({
      nodes: finalLayout.nodes,
      edges: finalLayout.edges,
      explanation: `Successfully dequeued element ${dequeuedValue}. The queue layout shifts remaining items cleanly.`,
      actionType: "DELETE",
    });

    set({
      nodes: finalLayout.nodes,
      edges: finalLayout.edges,
      steps,
      currentStepIndex: 0,
      explanation: `Dequeued ${dequeuedValue} from Front.`,
      isPlaying: false,
    });
    addLog(`Dequeued front element: ${dequeuedValue}. Remaining sequence: [${remainingValues.join(", ")}]`, "success");
  },

  peek: () => {
    const { nodes, addLog } = get();
    // Helper to extract values
    const sorted = [...nodes].sort((a, b) => a.position[0] - b.position[0]);
    const currentValues = sorted.map(n => {
      const match = n.label.match(/\d+/) || n.label.match(/-?\d+/);
      return match ? parseInt(match[0], 10) : 10;
    });

    if (currentValues.length === 0) {
      addLog("Queue is empty. Peek returned undefined status.", "warning");
      return;
    }
    
    const steps: AlgStep[] = [];
    const spacing = 1.6;
    const startX = -((currentValues.length - 1) * spacing) / 2;
    
    const highlightNodes = currentValues.map((v, idx) => {
      const isHeading = idx === 0;
      const isTrailing = idx === currentValues.length - 1;
      
      let label = `${v}`;
      if (isHeading && isTrailing) label = `Front/Rear: ${v}`;
      else if (isHeading) label = `Front: ${v}`;
      else if (isTrailing) label = `Rear: ${v}`;
      
      const isHighlighted = idx === 0;
      let color = isHighlighted ? "#00E676" : (isHeading ? "#00E5FF" : (isTrailing ? "#FF1744" : "#80F"));
      
      return {
        id: `Q-${idx}-${v}`,
        label,
        position: [startX + idx * spacing, 0, 0] as [number, number, number],
        color,
        isHighlighted,
        scale: isHighlighted ? 1.3 : 1.0,
      };
    });
    
    const stepEdges = highlightNodes.slice(0, -1).map((sn, idx) => {
      const nextNode = highlightNodes[idx + 1];
      return {
        id: `${sn.id}-${nextNode.id}`,
        from: sn.id,
        to: nextNode.id,
        color: "#475569",
      };
    });
    
    steps.push({
      nodes: highlightNodes,
      edges: stepEdges,
      explanation: `Peek views the Front element without mutating the structure. Returns Front value: ${currentValues[0]}.`,
      actionType: "HIGHLIGHT",
      highlightedNodeId: highlightNodes[0]?.id || null,
    });
    
    set({
      nodes: highlightNodes,
      edges: stepEdges,
      steps,
      currentStepIndex: 0,
      isPlaying: false,
    });
    addLog(`Peek queried Front of queue. Returned value: ${currentValues[0]}`, "success");
  },

  pushStack: (value) => {
    const { nodes, addLog } = get();
    // Sort by Y ascending to get bottom to top
    const sorted = [...nodes].sort((a, b) => a.position[1] - b.position[1]);
    const currentValues = sorted.map(n => {
      const match = n.label.match(/\d+/) || n.label.match(/-?\d+/);
      return match ? parseInt(match[0], 10) : 10;
    });

    if (currentValues.length >= 7) {
      addLog("Stack limit of 7 elements reached (for visual spacing limits). Pop some first!", "warning");
      return;
    }

    const newValues = [...currentValues, value];
    const steps: AlgStep[] = [];

    const getStackLayout = (vals: number[], highlightIndex: number | null = null, highlightNext: boolean = false) => {
      const spacing = 1.0;
      const startY = -((vals.length - 1) * spacing) / 2;
      const colors = ["#00E5FF", "#3B82F6", "#6366F1", "#8B5CF6", "#EC4899", "#F43F5E", "#FF1744"];
      
      const stepNodes = vals.map((v, idx) => {
        const isTop = idx === vals.length - 1;
        const isBase = idx === 0;
        
        let label = `${v}`;
        if (isTop && isBase) label = `Top/Base: ${v}`;
        else if (isTop) label = `Top: ${v}`;
        else if (isBase) label = `Base: ${v}`;
        
        const isHighlighted = idx === highlightIndex;
        let color = colors[idx % colors.length];
        
        if (isHighlighted) color = "#00E676";
        
        return {
          id: `S-${idx}-${v}`,
          label,
          position: [0, startY + idx * spacing, 0] as [number, number, number],
          color,
          isHighlighted,
        };
      });
      
      const stepEdges = [];
      for (let idx = stepNodes.length - 1; idx > 0; idx--) {
        const fromNode = stepNodes[idx];
        const toNode = stepNodes[idx - 1];
        const isHighlighted = highlightNext && idx === stepNodes.length - 1;
        stepEdges.push({
          id: `${fromNode.id}-${toNode.id}`,
          from: fromNode.id,
          to: toNode.id,
          color: isHighlighted ? "#00E676" : "#616161",
          isHighlighted,
        });
      }
      
      return { nodes: stepNodes, edges: stepEdges };
    };

    const baseLayout = getStackLayout(currentValues);
    const spacing = 1.0;
    const endY = baseLayout.nodes.length > 0 ? baseLayout.nodes[baseLayout.nodes.length - 1].position[1] + spacing : 0;
    
    const incomingNode: Node3D = {
      id: "incoming",
      label: `Incoming: ${value}`,
      color: "#00E676",
      position: [1.6, endY, 0],
      isHighlighted: true,
    };

    // Step 1: Spawn the incoming node offset horizontally
    steps.push({
      nodes: [...baseLayout.nodes, incomingNode],
      edges: baseLayout.edges,
      explanation: `Push initiates: Prepare to place incoming element ${value} on the Top of the Stack.`,
      actionType: "HIGHLIGHT",
      highlightedNodeId: "incoming",
    });

    // Step 2: Establish the reference pointer from the incoming node down to the current Top node
    const nextLayout = getStackLayout(newValues, newValues.length - 1, true);
    steps.push({
      nodes: nextLayout.nodes,
      edges: nextLayout.edges,
      explanation: `Establish pointer from the new incoming node down to the previous Top node.`,
      actionType: "HIGHLIGHT",
      highlightedEdgeId: nextLayout.edges[0]?.id || null,
    });

    // Step 3: Shift the incoming node to the final Top position and update titles
    const finalLayout = getStackLayout(newValues);
    steps.push({
      nodes: finalLayout.nodes,
      edges: finalLayout.edges,
      explanation: `Successfully pushed element ${value} onto Stack Top.`,
      actionType: "INSERT",
      highlightedNodeId: `S-${newValues.length - 1}-${value}`,
    });

    set({
      nodes: finalLayout.nodes,
      edges: finalLayout.edges,
      steps,
      currentStepIndex: 0,
      explanation: `Pushed ${value} onto Stack Top.`,
      isPlaying: false,
    });
    addLog(`Pushed element: ${value}. Current sequence: [${newValues.join(", ")}]`, "success");
  },

  popStack: () => {
    const { nodes, addLog } = get();
    const sorted = [...nodes].sort((a, b) => a.position[1] - b.position[1]);
    const currentValues = sorted.map(n => {
      const match = n.label.match(/\d+/) || n.label.match(/-?\d+/);
      return match ? parseInt(match[0], 10) : 10;
    });

    if (currentValues.length === 0) {
      addLog("Stack is empty. Pop operation was skipped.", "warning");
      return;
    }

    const poppedValue = currentValues[currentValues.length - 1];
    const steps: AlgStep[] = [];

    const getStackLayout = (vals: number[], highlightIndex: number | null = null, highlightNextDelete: boolean = false) => {
      const spacing = 1.0;
      const startY = -((vals.length - 1) * spacing) / 2;
      const colors = ["#00E5FF", "#3B82F6", "#6366F1", "#8B5CF6", "#EC4899", "#F43F5E", "#FF1744"];
      
      const stepNodes = vals.map((v, idx) => {
        const isTop = idx === vals.length - 1;
        const isBase = idx === 0;
        
        let label = `${v}`;
        if (isTop && isBase) label = `Top/Base: ${v}`;
        else if (isTop) label = `Top: ${v}`;
        else if (isBase) label = `Base: ${v}`;
        
        const isHighlighted = idx === highlightIndex;
        let color = colors[idx % colors.length];
        
        if (isHighlighted) color = "#FF1744";
        
        return {
          id: `S-${idx}-${v}`,
          label,
          position: [0, startY + idx * spacing, 0] as [number, number, number],
          color,
          isHighlighted,
        };
      });
      
      const stepEdges = [];
      for (let idx = stepNodes.length - 1; idx > 0; idx--) {
        const fromNode = stepNodes[idx];
        const toNode = stepNodes[idx - 1];
        const isHighlighted = highlightNextDelete && idx === stepNodes.length - 1;
        stepEdges.push({
          id: `${fromNode.id}-${toNode.id}`,
          from: fromNode.id,
          to: toNode.id,
          color: isHighlighted ? "#FF1744" : "#616161",
          isHighlighted,
        });
      }
      
      return { nodes: stepNodes, edges: stepEdges };
    };

    const baseLayout = getStackLayout(currentValues);

    // Step 1: Highlight Top element slated for deletion
    steps.push({
      nodes: baseLayout.nodes.map((n, i) => i === currentValues.length - 1 ? { ...n, color: "#FF1744", isHighlighted: true } : n),
      edges: baseLayout.edges,
      explanation: `Identify current Top element (${poppedValue}) to be popped from the Stack.`,
      actionType: "HIGHLIGHT",
      highlightedNodeId: baseLayout.nodes[baseLayout.nodes.length - 1]?.id || null,
    });

    // Step 2: Severe link and point Top tracker to the next node down
    if (currentValues.length > 1) {
      const nextLayout = getStackLayout(currentValues, null, true);
      steps.push({
        nodes: nextLayout.nodes.map((n, i) => {
          if (i === currentValues.length - 1) return { ...n, color: "#FF1744", isHighlighted: true };
          if (i === currentValues.length - 2) return { ...n, color: "#00E676", label: `New Top: ${currentValues[currentValues.length - 2]}`, isHighlighted: true };
          return n;
        }),
        edges: nextLayout.edges,
        explanation: `Sever pointer from Top node. Point 'Top' reference to the node below (${currentValues[currentValues.length - 2]}).`,
        actionType: "HIGHLIGHT",
        highlightedEdgeId: nextLayout.edges[0]?.id || null,
      });
    }

    // Step 3: Popped outcome
    const remainingValues = currentValues.slice(0, -1);
    const finalLayout = getStackLayout(remainingValues);
    steps.push({
      nodes: finalLayout.nodes,
      edges: finalLayout.edges,
      explanation: `Successfully popped element ${poppedValue} from Top. Remaining stack layout shifts.`,
      actionType: "DELETE",
    });

    set({
      nodes: finalLayout.nodes,
      edges: finalLayout.edges,
      steps,
      currentStepIndex: 0,
      explanation: `Popped ${poppedValue} from Top.`,
      isPlaying: false,
    });
    addLog(`Popped Top element: ${poppedValue}. Remaining sequence: [${remainingValues.join(", ")}]`, "success");
  },

  peekStack: () => {
    const { nodes, addLog } = get();
    const sorted = [...nodes].sort((a, b) => a.position[1] - b.position[1]);
    const currentValues = sorted.map(n => {
      const match = n.label.match(/\d+/) || n.label.match(/-?\d+/);
      return match ? parseInt(match[0], 10) : 10;
    });

    if (currentValues.length === 0) {
      addLog("Stack is empty. Peek returned undefined status.", "warning");
      return;
    }

    const steps: AlgStep[] = [];
    const spacing = 1.0;
    const startY = -((currentValues.length - 1) * spacing) / 2;
    const colors = ["#00E5FF", "#3B82F6", "#6366F1", "#8B5CF6", "#EC4899", "#F43F5E", "#FF1744"];

    const highlightNodes = currentValues.map((v, idx) => {
      const isTop = idx === currentValues.length - 1;
      const isBase = idx === 0;
      
      let label = `${v}`;
      if (isTop && isBase) label = `Top/Base: ${v}`;
      else if (isTop) label = `Top: ${v}`;
      else if (isBase) label = `Base: ${v}`;
      
      const isHighlighted = isTop;
      let color = isHighlighted ? "#00E676" : colors[idx % colors.length];
      
      return {
        id: `S-${idx}-${v}`,
        label,
        position: [0, startY + idx * spacing, 0] as [number, number, number],
        color,
        isHighlighted,
        scale: isHighlighted ? 1.3 : 1.0,
      };
    });

    const stepEdges = [];
    for (let idx = highlightNodes.length - 1; idx > 0; idx--) {
      const fromNode = highlightNodes[idx];
      const toNode = highlightNodes[idx - 1];
      stepEdges.push({
        id: `${fromNode.id}-${toNode.id}`,
        from: fromNode.id,
        to: toNode.id,
        color: "#616161",
      });
    }

    steps.push({
      nodes: highlightNodes,
      edges: stepEdges,
      explanation: `Peek views the Top element without mutating the stack. Returns Top value: ${currentValues[currentValues.length - 1]}.`,
      actionType: "HIGHLIGHT",
      highlightedNodeId: highlightNodes[highlightNodes.length - 1]?.id || null,
    });

    set({
      nodes: highlightNodes,
      edges: stepEdges,
      steps,
      currentStepIndex: 0,
      isPlaying: false,
    });
    addLog(`Peek queried Top of stack. Returned value: ${currentValues[currentValues.length - 1]}`, "success");
  },

  insertHeap: (value) => {
    const { nodes, addLog } = get();
    // Reconstruct current heap array sorted by standard index sequence
    const parsedNodes = [...nodes].map(n => {
      const idNum = parseInt(String(n.id), 10);
      const match = n.label.match(/\d+/) || n.label.match(/-?\d+/);
      const val = match ? parseInt(match[0], 10) : 0;
      return { idNum, val };
    }).filter(n => !isNaN(n.idNum));

    // Sort by idNum ascending to get complete binary tree sequence
    parsedNodes.sort((a, b) => a.idNum - b.idNum);
    const currentValues = parsedNodes.map(n => n.val);

    if (currentValues.length >= 7) {
      addLog("Heap limit of 7 elements reached (for visual spacing limits). Extract some first!", "warning");
      return;
    }

    const steps: AlgStep[] = [];
    const newValues = [...currentValues, value];

    // Node positioning helper matching dynamic complete binary tree structure
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

    // Layout generator helper
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

    // Step 1: Show incoming node at offset
    const baseLayout = getHeapLayout(currentValues);
    const incomingNode: Node3D = {
      id: "incoming",
      label: `Incoming: ${value}`,
      color: "#00E676",
      position: [2.5, -1.2, 0],
      isHighlighted: true,
      scale: 1.2
    };

    steps.push({
      nodes: [...baseLayout.nodes, incomingNode],
      edges: baseLayout.edges,
      explanation: `Heap Insertion: Prepare to place incoming element ${value} at the next available leaf position.`,
      actionType: "HIGHLIGHT",
      highlightedNodeId: "incoming",
    });

    // Step 2: Append as leaf
    const leafLayout = getHeapLayout(newValues, newValues.length);
    steps.push({
      nodes: leafLayout.nodes,
      edges: leafLayout.edges,
      explanation: `Place ${value} in the first empty leaf slot at index ${newValues.length} to preserve the complete binary tree structure.`,
      actionType: "INSERT",
      highlightedNodeId: `${newValues.length}`,
    });

    // Bubble up heapification
    let curr = newValues.length;
    while (curr > 1) {
      const parent = Math.floor(curr / 2);
      const currVal = newValues[curr - 1];
      const parentVal = newValues[parent - 1];

      // Comparison step
      const compareLayout = getHeapLayout(newValues, curr, parent);
      steps.push({
        nodes: compareLayout.nodes,
        edges: compareLayout.edges,
        explanation: `Compare child value ${currVal} at index ${curr} with parent value ${parentVal} at index ${parent}.`,
        actionType: "HIGHLIGHT",
        highlightedNodeId: `${curr}`,
      });

      if (currVal > parentVal) {
        // Swap values
        newValues[curr - 1] = parentVal;
        newValues[parent - 1] = currVal;

        // Swap step
        const swapLayout = getHeapLayout(newValues, curr, parent);
        steps.push({
          nodes: swapLayout.nodes,
          edges: swapLayout.edges,
          explanation: `Since child (${currVal}) > parent (${parentVal}), we swap them to satisfy the Max-Heap property.`,
          actionType: "HIGHLIGHT",
          highlightedNodeId: `${parent}`,
        });
        curr = parent;
      } else {
        break;
      }
    }

    // Final clean step
    const finalLayout = getHeapLayout(newValues);
    steps.push({
      nodes: finalLayout.nodes,
      edges: finalLayout.edges,
      explanation: `Max-Heap property is fully satisfied. Insertion of ${value} completed successfully!`,
      actionType: "NONE",
    });

    set({
      nodes: finalLayout.nodes,
      edges: finalLayout.edges,
      steps,
      currentStepIndex: 0,
      explanation: `Inserted ${value} into the Max-Heap, executing bubble-up operations.`,
      isPlaying: false,
    });
    addLog(`Inserted element ${value} into Max-Heap. Current elements: [${newValues.join(", ")}]`, "success");
  },

  extractMaxHeap: () => {
    const { nodes, addLog } = get();
    // Reconstruct current heap array
    const parsedNodes = [...nodes].map(n => {
      const idNum = parseInt(String(n.id), 10);
      const match = n.label.match(/\d+/) || n.label.match(/-?\d+/);
      const val = match ? parseInt(match[0], 10) : 0;
      return { idNum, val };
    }).filter(n => !isNaN(n.idNum));

    parsedNodes.sort((a, b) => a.idNum - b.idNum);
    const currentValues = parsedNodes.map(n => n.val);

    if (currentValues.length === 0) {
      addLog("Heap is empty. Extraction skipped.", "warning");
      return;
    }

    const steps: AlgStep[] = [];
    const extractedVal = currentValues[0];

    // Position helper
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

    // Layout generator helper
    const getHeapLayout = (vals: number[], highlightIndex1?: number, highlightIndex2?: number) => {
      const stepNodes = vals.map((v, idx) => {
        const id = idx + 1;
        const isRoot = id === 1;
        
        let label = `${v}`;
        if (isRoot) label = `Max: ${v}`;
        
        const isHighlighted = id === highlightIndex1 || id === highlightIndex2;
        let color = "#80F";
        if (isRoot) color = "#FF1744";
        
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

    // Step 1: Highlight root (Max)
    const initLayout = getHeapLayout(currentValues, 1);
    steps.push({
      nodes: initLayout.nodes.map(n => n.id === "1" ? { ...n, color: "#FF1744", isHighlighted: true } : n),
      edges: initLayout.edges,
      explanation: `Extract Max: The root node (${extractedVal}) holds the maximum value and is selected for removal.`,
      actionType: "HIGHLIGHT",
      highlightedNodeId: "1",
    });

    if (currentValues.length === 1) {
      steps.push({
        nodes: [],
        edges: [],
        explanation: `Removed the last remaining node from the Heap. Structure is now empty.`,
        actionType: "DELETE",
      });
      set({
        nodes: [],
        edges: [],
        steps,
        currentStepIndex: 0,
        explanation: `Extracted maximum node ${extractedVal} from Heap.`,
        isPlaying: false,
      });
      addLog(`Extracted root element ${extractedVal}. Heap is now empty.`, "success");
      return;
    }

    // Step 2: Swap root and last leaf
    const lastVal = currentValues[currentValues.length - 1];
    const swappedValues = [...currentValues];
    swappedValues[0] = lastVal;
    swappedValues[swappedValues.length - 1] = extractedVal;

    const swapLayout = getHeapLayout(swappedValues, 1, swappedValues.length);
    steps.push({
      nodes: swapLayout.nodes,
      edges: swapLayout.edges,
      explanation: `Swap the root node (${extractedVal}) with the last leaf node (${lastVal}) at index ${swappedValues.length} to prepare for deletion.`,
      actionType: "HIGHLIGHT",
      highlightedNodeId: "1",
    });

    // Step 3: Remove last leaf
    const activeValues = currentValues.slice(0, -1);
    activeValues[0] = lastVal; // Now root has the last leaf value

    const removedLayout = getHeapLayout(activeValues, 1);
    steps.push({
      nodes: removedLayout.nodes,
      edges: removedLayout.edges,
      explanation: `Successfully removed the old maximum node. Now, the new root (${lastVal}) must bubble-down to restore heap order.`,
      actionType: "DELETE",
      highlightedNodeId: "1",
    });

    // Bubble down heapification
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

        // Comparison step
        const compareLayout = getHeapLayout(activeValues, curr, largest);
        steps.push({
          nodes: compareLayout.nodes,
          edges: compareLayout.edges,
          explanation: `Compare parent (${currVal}) at index ${curr} with its largest child (${childVal}) at index ${largest}.`,
          actionType: "HIGHLIGHT",
          highlightedNodeId: `${largest}`,
        });

        // Swap values
        activeValues[curr - 1] = childVal;
        activeValues[largest - 1] = currVal;

        // Swap step
        const swapStepLayout = getHeapLayout(activeValues, curr, largest);
        steps.push({
          nodes: swapStepLayout.nodes,
          edges: swapStepLayout.edges,
          explanation: `Since child (${childVal}) > parent (${currVal}), swap them to maintain Max-Heap order.`,
          actionType: "HIGHLIGHT",
          highlightedNodeId: `${curr}`,
        });

        curr = largest;
      } else {
        break;
      }
    }

    // Final clean step
    const finalLayout = getHeapLayout(activeValues);
    steps.push({
      nodes: finalLayout.nodes,
      edges: finalLayout.edges,
      explanation: `Max-Heap property is fully restored. Extraction of maximum node completed successfully!`,
      actionType: "NONE",
    });

    set({
      nodes: finalLayout.nodes,
      edges: finalLayout.edges,
      steps,
      currentStepIndex: 0,
      explanation: `Extracted root maximum node ${extractedVal} and executed bubble-down operations.`,
      isPlaying: false,
    });
    addLog(`Extracted maximum element ${extractedVal} from root. Remaining elements: [${activeValues.join(", ")}]`, "success");
  },
  insertBST: (value) => {
    const { nodes, edges, addLog } = get();
    // 1. Reconstruct current tree state
    const hasCurrentState = nodes && nodes.length > 0;
    const baseNodes = hasCurrentState
      ? nodes.map((n) => {
          const match = String(n.label).match(/-?\d+/);
          const val = match ? parseInt(match[0], 10) : parseInt(String(n.id), 10);
          return {
            id: String(n.id),
            val: isNaN(val) ? 0 : val,
            label: String(n.label).replace(/\s*\(New\)/g, "").replace(/\s*\(Root\)/g, ""),
            position: n.position,
            color: n.color || "#80F"
          };
        })
      : [];

    const baseEdges = hasCurrentState
      ? edges.map((e) => ({
          id: String(e.id),
          from: String(e.from),
          to: String(e.to),
          color: e.color || "#616161"
        }))
      : [];

    // Check size limit to prevent overlapping in R3F view
    if (baseNodes.length >= 15) {
      addLog("BST node limit of 15 elements reached for manual visualizer safety.", "warning");
      return;
    }

    // Determine root of BST
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
      if (value < currNode.val) {
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

      const isLeftChild = value < lastParentNode.val;
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
    const steps: AlgStep[] = [];

    // Path highlights
    for (let i = 0; i < path.length; i++) {
      const currentPathId = path[i];
      const currentPathNode = baseNodes.find(n => n.id === currentPathId)!;
      const targetEdgeId = i > 0 ? `${path[i - 1]}-${currentPathId}` : null;

      steps.push({
        nodes: baseNodes.map(n => {
          const isCurrent = n.id === currentPathId;
          return {
            id: n.id,
            label: n.id === path[0] ? `${n.val} (Root)` : `${n.val}`,
            position: n.position,
            color: isCurrent ? "#FF1744" : n.color,
            isHighlighted: isCurrent
          };
        }),
        edges: baseEdges.map(e => {
          const isCurrent = e.id === targetEdgeId || (i > 0 && e.from === path[i - 1] && e.to === currentPathId);
          return {
            id: e.id,
            from: e.from,
            to: e.to,
            color: isCurrent ? "#FF1744" : e.color,
            isHighlighted: isCurrent
          };
        }),
        explanation: `Compare value ${value} with Node ${currentPathNode.val}. Since ${value} ${value >= currentPathNode.val ? '>=' : '<'} ${currentPathNode.val}, we traverse ${value >= currentPathNode.val ? 'right' : 'left'}.`,
        actionType: "HIGHLIGHT",
        highlightedNodeId: currentPathId,
        highlightedEdgeId: targetEdgeId
      });
    }

    // Final insertion step
    const newEdgeId = lastParentId ? `${lastParentId}-${value}` : "";
    const finalNodes = [
      ...baseNodes.map(n => ({
        id: n.id,
        label: n.id === path[0] ? `${n.val} (Root)` : `${n.val}`,
        position: n.position,
        color: n.color,
        isHighlighted: false
      })),
      { id: `${value}`, label: baseNodes.length === 0 ? `${value} (Root)` : `${value} (New)`, position: newPosition, color: "#00E676", isHighlighted: true }
    ];
    const finalEdges = lastParentId
      ? [
          ...baseEdges.map(e => ({ ...e, isHighlighted: false })),
          { id: newEdgeId, from: lastParentId, to: `${value}`, color: "#00E676", isHighlighted: true }
        ]
      : [];

    steps.push({
      nodes: finalNodes,
      edges: finalEdges,
      explanation: lastParentId
        ? `The child spot is empty. Successfully linked node ${value} under parent ${lastParentId} in BST layout!`
        : `Tree was empty. Successfully inserted Node ${value} as the Root of the BST!`,
      actionType: "INSERT",
      highlightedNodeId: `${value}`,
      highlightedEdgeId: newEdgeId || null
    });

    const rootCandidateId = baseNodes.length > 0 ? path[0] : `${value}`;
    const returnedNodes = [
      ...baseNodes.map(n => ({
        id: n.id,
        label: n.id === rootCandidateId ? `${n.val} (Root)` : `${n.val}`,
        position: n.position,
        color: n.color,
        scale: 1.0
      })),
      { id: `${value}`, label: baseNodes.length === 0 ? `${value} (Root)` : `${value}`, position: newPosition, color: "#80F", isHighlighted: true, scale: 1.2 }
    ];
    const returnedEdges = lastParentId
      ? [
          ...baseEdges,
          { id: `${lastParentId}-${value}`, from: lastParentId, to: `${value}`, color: "#616161", isHighlighted: false }
        ]
      : [];

    set({
      nodes: returnedNodes,
      edges: returnedEdges,
      steps,
      currentStepIndex: 0,
      explanation: `Inserted ${value} into the Binary Search Tree.`,
      isPlaying: false,
    });
    addLog(`Inserted element: ${value} to BST.`, "success");
  },
  insertLinkedList: (value, insertIndex) => {
    const { nodes, edges, addLog } = get();
    
    // 1. Trace current list to get ordered sequence
    const currentNodes = [...nodes];
    const currentEdges = [...edges];
    const toSet = new Set(currentEdges.map(e => String(e.to)));
    let headNode = currentNodes.find(n => !toSet.has(String(n.id)));
    
    const ordered: any[] = [];
    if (headNode) {
      let curr = headNode;
      while (curr) {
        const match = String(curr.label).match(/-?\d+/);
        const val = match ? parseInt(match[0], 10) : parseInt(String(curr.id), 10);
        ordered.push({
          id: String(curr.id),
          val: isNaN(val) ? 0 : val,
          color: curr.color || "#80F"
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

    if (ordered.length >= 8) {
      addLog("Linked List node limit of 8 elements reached.", "warning");
      return;
    }

    // Determine actual index to insert at
    const idx = (insertIndex === undefined || insertIndex < 0 || insertIndex > ordered.length)
      ? ordered.length
      : insertIndex;

    const newId = `LL-${Date.now()}-${value}`;
    const steps: AlgStep[] = [];

    const getPosition = (i: number, total: number): [number, number, number] => {
      const spacing = 1.8;
      const startX = -((total - 1) * spacing) / 2;
      return [startX + i * spacing, 0, 0];
    };

    const getListLayout = (items: { id: string; val: number; color?: string }[], highlightIndex?: number, highlightEdgeIndex?: number) => {
      const stepNodes = items.map((item, i) => {
        let label = `${item.val}`;
        if (items.length === 1) label = `Head/Tail: ${item.val}`;
        else if (i === 0) label = `Head: ${item.val}`;
        else if (i === items.length - 1) label = `Tail: ${item.val}`;

        const isHighlighted = i === highlightIndex;
        let color = item.color || "#80F";
        if (i === 0 || i === items.length - 1) color = "#00E5FF";
        if (isHighlighted) color = "#00E676";

        return {
          id: item.id,
          label,
          position: getPosition(i, items.length),
          color,
          isHighlighted,
        };
      });

      const stepEdges = [];
      for (let i = 0; i < stepNodes.length - 1; i++) {
        const fromNode = stepNodes[i];
        const toNode = stepNodes[i + 1];
        const isHighlighted = i === highlightEdgeIndex;
        stepEdges.push({
          id: `${fromNode.id}-${toNode.id}`,
          from: fromNode.id,
          to: toNode.id,
          color: isHighlighted ? "#00E676" : (i === 0 || i === stepNodes.length - 2 ? "#00E5FF" : "#80F"),
          isHighlighted,
        });
      }

      return { nodes: stepNodes, edges: stepEdges };
    };

    // Step 1: Traverse the list up to the insertion point
    const baseItems = [...ordered];
    const initialLayout = getListLayout(baseItems);

    for (let i = 0; i < Math.max(1, idx); i++) {
      if (baseItems.length === 0) break;
      const currentPathId = baseItems[i].id;
      steps.push({
        nodes: initialLayout.nodes.map(n => n.id === currentPathId ? { ...n, color: "#FF1744", isHighlighted: true } : n),
        edges: initialLayout.edges.map(e => i > 0 && e.from === baseItems[i - 1].id && e.to === currentPathId ? { ...e, color: "#FF1744", isHighlighted: true } : e),
        explanation: i === 0
          ? `Traversing the linked list: We start at Head (Node ${baseItems[0].val}).`
          : `We traverse to the next node: Node ${baseItems[i].val}.`,
        actionType: "HIGHLIGHT",
        highlightedNodeId: currentPathId,
        highlightedEdgeId: i > 0 ? `${baseItems[i-1].id}-${currentPathId}` : null
      });
    }

    // Step 2: Highlight "incoming" node at an offset
    const spacing = 1.8;
    const insertX = idx === 0
      ? -((ordered.length) * spacing) / 2
      : getPosition(idx - 1, ordered.length)[0] + spacing / 2;

    const incomingNode: Node3D = {
      id: newId,
      label: `Incoming: ${value}`,
      color: "#00E676",
      position: [insertX, -1.2, 0],
      isHighlighted: true,
      scale: 1.2
    };

    steps.push({
      nodes: [...initialLayout.nodes, incomingNode],
      edges: initialLayout.edges,
      explanation: `Prepare to insert incoming element ${value} at index ${idx} in the list.`,
      actionType: "HIGHLIGHT",
      highlightedNodeId: newId
    });

    // Step 3: Insert new node into list items and establish links
    const newItems = [...ordered];
    newItems.splice(idx, 0, { id: newId, val: value, color: "#00E676" });
    const insertionLayout = getListLayout(newItems, idx);

    // Highlight the newly created edge connections in emerald green
    const updatedEdges = insertionLayout.edges.map(e => {
      const isNewLink = e.from === newId || e.to === newId;
      return isNewLink ? { ...e, color: "#00E676", isHighlighted: true } : e;
    });

    steps.push({
      nodes: insertionLayout.nodes,
      edges: updatedEdges,
      explanation: idx === 0
        ? `Successfully established the new node ${value} as the Head of the list!`
        : `Pointers updated: redirect predecessor's next pointer to ${value}, and point ${value}'s next to successor.`,
      actionType: "INSERT",
      highlightedNodeId: newId,
    });

    // Final state
    const finalLayout = getListLayout(newItems);
    set({
      nodes: finalLayout.nodes,
      edges: finalLayout.edges,
      steps,
      currentStepIndex: 0,
      explanation: `Inserted ${value} at index ${idx} of the Linked List.`,
      isPlaying: false,
    });
    addLog(`Inserted element: ${value} at index ${idx}.`, "success");
  },
  deleteLinkedList: (targetIdOrValue) => {
    const { nodes, edges, addLog } = get();

    // 1. Trace current list to get ordered sequence
    const currentNodes = [...nodes];
    const currentEdges = [...edges];
    const toSet = new Set(currentEdges.map(e => String(e.to)));
    let headNode = currentNodes.find(n => !toSet.has(String(n.id)));
    
    const ordered: any[] = [];
    if (headNode) {
      let curr = headNode;
      while (curr) {
        const match = String(curr.label).match(/-?\d+/);
        const val = match ? parseInt(match[0], 10) : parseInt(String(curr.id), 10);
        ordered.push({
          id: String(curr.id),
          val: isNaN(val) ? 0 : val,
          color: curr.color || "#80F"
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

    if (ordered.length === 0) {
      addLog("Linked List is empty. Deletion skipped.", "warning");
      return;
    }

    // Find the target node in ordered sequence
    let targetIdx = ordered.findIndex(item => String(item.id) === String(targetIdOrValue) || item.val === Number(targetIdOrValue));
    if (targetIdx === -1 && typeof targetIdOrValue === "string") {
      // Try to parse number from string
      const parsedNum = parseInt(targetIdOrValue, 10);
      if (!isNaN(parsedNum)) {
        targetIdx = ordered.findIndex(item => item.val === parsedNum);
      }
    }

    if (targetIdx === -1) {
      addLog(`Node matching '${targetIdOrValue}' was not found in the list.`, "warning");
      return;
    }

    const targetNode = ordered[targetIdx];
    const steps: AlgStep[] = [];

    const getPosition = (i: number, total: number): [number, number, number] => {
      const spacing = 1.8;
      const startX = -((total - 1) * spacing) / 2;
      return [startX + i * spacing, 0, 0];
    };

    const getListLayout = (items: { id: string; val: number; color?: string }[], highlightIndex?: number, highlightEdgeIndex?: number) => {
      const stepNodes = items.map((item, i) => {
        let label = `${item.val}`;
        if (items.length === 1) label = `Head/Tail: ${item.val}`;
        else if (i === 0) label = `Head: ${item.val}`;
        else if (i === items.length - 1) label = `Tail: ${item.val}`;

        const isHighlighted = i === highlightIndex;
        let color = item.color || "#80F";
        if (i === 0 || i === items.length - 1) color = "#00E5FF";
        if (isHighlighted) color = "#00E676";

        return {
          id: item.id,
          label,
          position: getPosition(i, items.length),
          color,
          isHighlighted,
        };
      });

      const stepEdges = [];
      for (let i = 0; i < stepNodes.length - 1; i++) {
        const fromNode = stepNodes[i];
        const toNode = stepNodes[i + 1];
        const isHighlighted = i === highlightEdgeIndex;
        stepEdges.push({
          id: `${fromNode.id}-${toNode.id}`,
          from: fromNode.id,
          to: toNode.id,
          color: isHighlighted ? "#00E676" : (i === 0 || i === stepNodes.length - 2 ? "#00E5FF" : "#80F"),
          isHighlighted,
        });
      }

      return { nodes: stepNodes, edges: stepEdges };
    };

    const initialLayout = getListLayout(ordered);

    // Step 1: Traverse the list up to the target node
    for (let i = 0; i <= targetIdx; i++) {
      const currentPathId = ordered[i].id;
      steps.push({
        nodes: initialLayout.nodes.map((n, idx) => idx === i ? { ...n, color: "#FF1744", isHighlighted: true } : n),
        edges: initialLayout.edges.map(e => i > 0 && e.from === ordered[i - 1].id && e.to === currentPathId ? { ...e, color: "#FF1744", isHighlighted: true } : e),
        explanation: i === 0
          ? `To delete Node ${targetNode.val}, we initiate a traversal search from the list Head (Node ${ordered[0].val}).`
          : `We traverse to Node ${ordered[i].val} to find our target.`,
        actionType: "HIGHLIGHT",
        highlightedNodeId: currentPathId,
        highlightedEdgeId: i > 0 ? `${ordered[i-1].id}-${currentPathId}` : null
      });
    }

    // Step 2: Bypass & Detach Target Node
    const bypassNodes = ordered.map((item, i) => {
      let label = `${item.val}`;
      if (ordered.length === 1) label = `Head/Tail: ${item.val}`;
      else if (i === 0) label = `Head: ${item.val}`;
      else if (i === ordered.length - 1) label = `Tail: ${item.val}`;

      if (i === targetIdx) {
        label = `Decoupled: ${item.val}`;
      }

      const isTarget = i === targetIdx;
      let color = item.color || "#80F";
      if (i === 0 || i === ordered.length - 1) color = "#00E5FF";
      if (isTarget) color = "#D50000";

      const [x, y, z] = getPosition(i, ordered.length);
      return {
        id: item.id,
        label,
        position: [x, isTarget ? 1.2 : y, z] as [number, number, number],
        color,
        isHighlighted: isTarget
      };
    });

    const bypassEdges: Edge3D[] = [];
    for (let i = 0; i < ordered.length - 1; i++) {
      const fromNode = ordered[i];
      const toNode = ordered[i + 1];
      const isTargetInvolved = i === targetIdx || i + 1 === targetIdx;
      bypassEdges.push({
        id: `${fromNode.id}-${toNode.id}`,
        from: fromNode.id,
        to: toNode.id,
        color: isTargetInvolved ? "#D50000" : "#616161",
      });
    }

    let bypassEdgeId = null;
    if (targetIdx > 0 && targetIdx < ordered.length - 1) {
      const pred = ordered[targetIdx - 1];
      const succ = ordered[targetIdx + 1];
      bypassEdgeId = `${pred.id}-${succ.id}`;
      bypassEdges.push({
        id: bypassEdgeId,
        from: pred.id,
        to: succ.id,
        color: "#00E676",
        isHighlighted: true
      });
    }

    steps.push({
      nodes: bypassNodes,
      edges: bypassEdges,
      explanation: targetIdx === 0
        ? `Bypass & Detach: Head reference is advanced to Node ${ordered[1]?.val}. Target Head node ${targetNode.val} is physically decoupled and lifted out!`
        : targetIdx === ordered.length - 1
        ? `Bypass & Detach: Predecessor node ${ordered[targetIdx - 1].val} sets its next reference to null. Target Tail node ${targetNode.val} is decoupled and lifted out!`
        : `Bypass & Detach: Predecessor Node ${ordered[targetIdx - 1].val} redirects its reference directly to successor Node ${ordered[targetIdx + 1].val}. Target Node ${targetNode.val} is physically decoupled and lifted out!`,
      actionType: "DELETE",
      highlightedNodeId: targetNode.id,
      highlightedEdgeId: bypassEdgeId
    });

    // Step 3: Dequeued/Removed outcome
    const remainingItems = ordered.filter((_, i) => i !== targetIdx);
    const finalLayout = getListLayout(remainingItems);

    steps.push({
      nodes: finalLayout.nodes,
      edges: finalLayout.edges,
      explanation: `The decoupled node is removed and memory garbage-collected. The remaining nodes shift into a clean, unified chain!`,
      actionType: "NONE"
    });

    set({
      nodes: finalLayout.nodes,
      edges: finalLayout.edges,
      steps,
      currentStepIndex: 0,
      explanation: `Deleted ${targetNode.val} from the Linked List.`,
      isPlaying: false,
    });
    addLog(`Deleted element: ${targetNode.val} from Linked List.`, "success");
  },
  traverseBST: (type) => {
    const { nodes, edges, addLog } = get();
    if (nodes.length === 0) {
      addLog("BST is empty. Traversal skipped.", "warning");
      return;
    }
    
    // 1. Reconstruct current tree state
    const baseNodes = nodes.map((n) => {
      const match = String(n.label).match(/-?\d+/);
      const val = match ? parseInt(match[0], 10) : parseInt(String(n.id), 10);
      return {
        id: String(n.id),
        val: isNaN(val) ? 0 : val,
        label: String(n.label).replace(/\s*\(New\)/g, "").replace(/\s*\(Root\)/g, ""),
        position: n.position,
        color: n.color || "#80F"
      };
    });

    const baseEdges = edges.map((e) => ({
      id: String(e.id),
      from: String(e.from),
      to: String(e.to),
      color: e.color || "#616161"
    }));

    // Find root
    const incomingTargets = new Set(baseEdges.map(e => e.to));
    const rootNode = baseNodes.find(n => !incomingTargets.has(n.id)) || baseNodes[0];
    if (!rootNode) return;

    // Build adj list for left and right children
    const childrenMap: Record<string, { left?: string; right?: string }> = {};
    baseNodes.forEach(node => {
      childrenMap[node.id] = {};
      const outgoing = baseEdges.filter(e => e.from === node.id);
      outgoing.forEach(e => {
        const child = baseNodes.find(n => n.id === e.to);
        if (child) {
          if (child.val < node.val) {
            childrenMap[node.id].left = child.id;
          } else {
            childrenMap[node.id].right = child.id;
          }
        }
      });
    });

    const traverseOrder: string[] = [];
    const traverseSteps: { nodeId: string; explanation: string }[] = [];

    const visit = (nodeId: string) => {
      const node = baseNodes.find(n => n.id === nodeId)!;
      if (type === "preorder") {
        traverseOrder.push(nodeId);
        traverseSteps.push({ nodeId, explanation: `Visit Node ${node.val} (Pre-Order: Root -> Left -> Right)` });
      }
      
      if (childrenMap[nodeId]?.left) {
        const leftId = childrenMap[nodeId].left!;
        const leftNode = baseNodes.find(n => n.id === leftId)!;
        traverseSteps.push({ nodeId, explanation: `Traverse left child of Node ${node.val} (Node ${leftNode.val})` });
        visit(leftId);
      }
      
      if (type === "inorder") {
        traverseOrder.push(nodeId);
        traverseSteps.push({ nodeId, explanation: `Visit Node ${node.val} (In-Order: Left -> Root -> Right)` });
      }

      if (childrenMap[nodeId]?.right) {
        const rightId = childrenMap[nodeId].right!;
        const rightNode = baseNodes.find(n => n.id === rightId)!;
        traverseSteps.push({ nodeId, explanation: `Traverse right child of Node ${node.val} (Node ${rightNode.val})` });
        visit(rightId);
      }

      if (type === "postorder") {
        traverseOrder.push(nodeId);
        traverseSteps.push({ nodeId, explanation: `Visit Node ${node.val} (Post-Order: Left -> Right -> Root)` });
      }
    };

    visit(rootNode.id);

    // Generate animation steps
    const steps: AlgStep[] = [];
    const visitedSet = new Set<string>();

    traverseSteps.forEach((stepInfo) => {
      const isVisitStep = stepInfo.explanation.startsWith("Visit");
      if (isVisitStep) {
        visitedSet.add(stepInfo.nodeId);
      }

      steps.push({
        nodes: baseNodes.map(n => {
          const isCurrent = n.id === stepInfo.nodeId;
          const hasBeenVisited = visitedSet.has(n.id);
          let color = n.color;
          if (isCurrent) color = "#FF1744"; // traversal pointer
          else if (hasBeenVisited) color = "#00E676"; // visited
          
          return {
            id: n.id,
            label: n.id === rootNode.id ? `${n.val} (Root)` : `${n.val}`,
            position: n.position,
            color,
            isHighlighted: isCurrent
          };
        }),
        edges: baseEdges.map(e => {
          const isFromVisited = visitedSet.has(e.from) || e.from === stepInfo.nodeId;
          const isToVisited = visitedSet.has(e.to) || e.to === stepInfo.nodeId;
          const isCurrentEdge = e.to === stepInfo.nodeId;
          
          return {
            id: e.id,
            from: e.from,
            to: e.to,
            color: isCurrentEdge ? "#FF1744" : (isFromVisited && isToVisited ? "#00E676" : e.color),
            isHighlighted: isCurrentEdge
          };
        }),
        explanation: stepInfo.explanation,
        actionType: "HIGHLIGHT",
        highlightedNodeId: stepInfo.nodeId
      });
    });

    // Final step: highlight everything visited
    steps.push({
      nodes: baseNodes.map(n => ({
        id: n.id,
        label: n.id === rootNode.id ? `${n.val} (Root)` : `${n.val}`,
        position: n.position,
        color: "#00E676",
        isHighlighted: false
      })),
      edges: baseEdges.map(e => ({
        id: e.id,
        from: e.from,
        to: e.to,
        color: "#00E676",
        isHighlighted: false
      })),
      explanation: `BST ${type === "inorder" ? "In-Order" : type === "preorder" ? "Pre-Order" : "Post-Order"} traversal animation complete! Sequence: [${traverseOrder.map(id => baseNodes.find(n => n.id === id)!.val).join(", ")}]`,
      actionType: "NONE"
    });

    set({
      steps,
      currentStepIndex: 0,
      explanation: `Executing BST ${type === "inorder" ? "In-Order" : type === "preorder" ? "Pre-Order" : "Post-Order"} traversal.`,
    });
    get().setIsPlaying(true);
    addLog(`Started BST ${type === "inorder" ? "In-Order" : type === "preorder" ? "Pre-Order" : "Post-Order"} traversal animation.`, "success");
  },
  traverseLinkedList: () => {
    const { nodes, edges, addLog } = get();
    
    // 1. Trace current list to get ordered sequence
    const currentNodes = [...nodes];
    const currentEdges = [...edges];
    const toSet = new Set(currentEdges.map(e => String(e.to)));
    let headNode = currentNodes.find(n => !toSet.has(String(n.id)));
    
    const ordered: any[] = [];
    if (headNode) {
      let curr = headNode;
      while (curr) {
        const match = String(curr.label).match(/-?\d+/);
        const val = match ? parseInt(match[0], 10) : parseInt(String(curr.id), 10);
        ordered.push({
          id: String(curr.id),
          val: isNaN(val) ? 0 : val,
          color: curr.color || "#80F"
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

    if (ordered.length === 0) {
      addLog("Linked List is empty. Traversal skipped.", "warning");
      return;
    }

    const steps: AlgStep[] = [];
    const getPosition = (i: number, total: number): [number, number, number] => {
      const spacing = 1.8;
      const startX = -((total - 1) * spacing) / 2;
      return [startX + i * spacing, 0, 0];
    };

    const getListLayout = (items: { id: string; val: number; color?: string }[], highlightIdx?: number) => {
      return items.map((item, i) => {
        let label = `${item.val}`;
        if (items.length === 1) label = `Head/Tail: ${item.val}`;
        else if (i === 0) label = `Head: ${item.val}`;
        else if (i === items.length - 1) label = `Tail: ${item.val}`;

        let color = item.color || "#80F";
        if (i === 0 || i === items.length - 1) color = "#00E5FF";
        if (highlightIdx !== undefined && i <= highlightIdx) {
          color = i === highlightIdx ? "#FF1744" : "#00E676";
        }

        return {
          id: item.id,
          label,
          position: getPosition(i, items.length),
          color,
          isHighlighted: i === highlightIdx,
        };
      });
    };

    const getListEdges = (nodeCount: number, highlightIdx?: number) => {
      const listEdges = [];
      for (let i = 0; i < nodeCount - 1; i++) {
        const fromNode = ordered[i];
        const toNode = ordered[i + 1];
        let color = (i === 0 || i === nodeCount - 2 ? "#00E5FF" : "#80F");
        if (highlightIdx !== undefined && i < highlightIdx) {
          color = i === highlightIdx - 1 ? "#FF1744" : "#00E676";
        }
        listEdges.push({
          id: `${fromNode.id}-${toNode.id}`,
          from: fromNode.id,
          to: toNode.id,
          color,
          isHighlighted: highlightIdx !== undefined && i === highlightIdx - 1,
        });
      }
      return listEdges;
    };

    for (let i = 0; i < ordered.length; i++) {
      steps.push({
        nodes: getListLayout(ordered, i),
        edges: getListEdges(ordered.length, i),
        explanation: i === 0
          ? `Start sequential traversal at the Head node (${ordered[0].val}).`
          : `Advance through the next pointer to Node ${ordered[i].val}.`,
        actionType: "HIGHLIGHT",
        highlightedNodeId: ordered[i].id,
        highlightedEdgeId: i > 0 ? `${ordered[i-1].id}-${ordered[i].id}` : null
      });
    }

    // Final step: highlight all in green
    steps.push({
      nodes: ordered.map((item, i) => {
        let label = `${item.val}`;
        if (ordered.length === 1) label = `Head/Tail: ${item.val}`;
        else if (i === 0) label = `Head: ${item.val}`;
        else if (i === ordered.length - 1) label = `Tail: ${item.val}`;
        return {
          id: item.id,
          label,
          position: getPosition(i, ordered.length),
          color: "#00E676",
          isHighlighted: false
        };
      }),
      edges: getListEdges(ordered.length).map(e => ({ ...e, color: "#00E676" })),
      explanation: `Sequential traversal complete! Traversed list in order: [${ordered.map(item => item.val).join(" -> ")}]`,
      actionType: "NONE"
    });

    set({
      steps,
      currentStepIndex: 0,
      explanation: "Executing Linked List sequential traversal.",
    });
    get().setIsPlaying(true);
    addLog("Started Linked List sequential traversal animation.", "success");
  },
  traverseGraph: (type) => {
    const { nodes, edges, addLog } = get();
    if (nodes.length === 0) {
      addLog("Graph is empty. Traversal skipped.", "warning");
      return;
    }

    const baseNodes = nodes.map(n => ({
      id: String(n.id),
      label: String(n.label).replace(/^(?:Queue|Visiting|Visited|DFS Active|Backtracked):\s*/i, ""),
      position: n.position,
      color: n.color || "#80F"
    }));

    const baseEdges = edges.map(e => ({
      id: String(e.id),
      from: String(e.from),
      to: String(e.to),
      color: e.color || "#616161"
    }));

    const startNode = baseNodes[0];
    const steps: AlgStep[] = [];
    const visited: string[] = [];
    const stepLogs: { nodes: any[]; edges: any[]; explanation: string; activeId: string }[] = [];

    if (type === "bfs") {
      const q = [startNode.id];
      const visitedSet = new Set<string>([startNode.id]);
      
      stepLogs.push({
        nodes: baseNodes.map(n => ({
          ...n,
          color: n.id === startNode.id ? "#FFD600" : n.color,
          label: n.id === startNode.id ? `Queue: ${n.label}` : n.label
        })),
        edges: baseEdges,
        explanation: `Initialize BFS at starting Node (${startNode.label}). Place it in the FIFO queue.`,
        activeId: startNode.id
      });

      while (q.length > 0) {
        const currId = q.shift()!;
        visited.push(currId);
        const currNode = baseNodes.find(n => n.id === currId)!;

        stepLogs.push({
          nodes: baseNodes.map(n => {
            const isVisited = visited.includes(n.id);
            const isInQ = q.includes(n.id);
            const isActive = n.id === currId;
            let color = n.color;
            if (isActive) color = "#FF1744";
            else if (isVisited) color = "#00E676";
            else if (isInQ) color = "#FFD600";
            
            return {
              ...n,
              color,
              label: isActive ? `Visiting: ${n.label}` : isVisited ? `Visited: ${n.label}` : isInQ ? `Queue: ${n.label}` : n.label
            };
          }),
          edges: baseEdges.map(e => {
            const involvesCurrent = e.from === currId || e.to === currId;
            return {
              ...e,
              color: involvesCurrent ? "#FF1744" : e.color
            };
          }),
          explanation: `Dequeue Node (${currNode.label}) and visit it. Explore its immediate neighbors.`,
          activeId: currId
        });

        const neighbors: string[] = [];
        baseEdges.forEach(e => {
          if (e.from === currId && !visitedSet.has(e.to)) {
            neighbors.push(e.to);
          } else if (e.to === currId && !visitedSet.has(e.from)) {
            neighbors.push(e.from);
          }
        });

        neighbors.forEach(neighborId => {
          visitedSet.add(neighborId);
          q.push(neighborId);
          const neighborNode = baseNodes.find(n => n.id === neighborId)!;

          stepLogs.push({
            nodes: baseNodes.map(n => {
              const isVisited = visited.includes(n.id);
              const isInQ = q.includes(n.id);
              const isActive = n.id === currId;
              let color = n.color;
              if (isActive) color = "#FF1744";
              else if (isVisited) color = "#00E676";
              else if (isInQ) color = "#FFD600";
              
              return {
                ...n,
                color,
                label: isActive ? `Visiting: ${n.label}` : isVisited ? `Visited: ${n.label}` : isInQ ? `Queue: ${n.label}` : n.label
              };
            }),
            edges: baseEdges.map(e => {
              const connectsToNeighbor = (e.from === currId && e.to === neighborId) || (e.to === currId && e.from === neighborId);
              return {
                ...e,
                color: connectsToNeighbor ? "#FFD600" : e.color
              };
            }),
            explanation: `Found unvisited neighbor Node (${neighborNode.label}). Enqueue it. Queue is now [${q.map(id => baseNodes.find(n => n.id === id)!.label).join(", ")}].`,
            activeId: neighborId
          });
        });
      }
    } else {
      const visitedSet = new Set<string>();
      
      const dfsVisit = (currId: string, parentId?: string) => {
        visitedSet.add(currId);
        visited.push(currId);
        const currNode = baseNodes.find(n => n.id === currId)!;

        stepLogs.push({
          nodes: baseNodes.map(n => {
            const isVisited = visitedSet.has(n.id);
            const isActive = n.id === currId;
            let color = n.color;
            if (isActive) color = "#FF1744";
            else if (isVisited) color = "#00E676";
            
            return {
              ...n,
              color,
              label: isActive ? `DFS Active: ${n.label}` : isVisited ? `Visited: ${n.label}` : n.label
            };
          }),
          edges: baseEdges.map(e => {
            const isLink = parentId && ((e.from === parentId && e.to === currId) || (e.to === parentId && e.from === currId));
            return {
              ...e,
              color: isLink ? "#FF1744" : e.color
            };
          }),
          explanation: parentId 
            ? `Traverse deeper: follow edge from Node (${baseNodes.find(n => n.id === parentId)!.label}) to Node (${currNode.label}). Mark visited.`
            : `Initialize DFS at start Node (${currNode.label}). Mark visited.`,
          activeId: currId
        });

        const neighbors: string[] = [];
        baseEdges.forEach(e => {
          if (e.from === currId && !visitedSet.has(e.to)) {
            neighbors.push(e.to);
          } else if (e.to === currId && !visitedSet.has(e.from)) {
            neighbors.push(e.from);
          }
        });

        neighbors.forEach(neighborId => {
          if (!visitedSet.has(neighborId)) {
            dfsVisit(neighborId, currId);
            
            stepLogs.push({
              nodes: baseNodes.map(n => {
                const isVisited = visitedSet.has(n.id);
                const isActive = n.id === currId;
                let color = n.color;
                if (isActive) color = "#FF1744";
                else if (isVisited) color = "#00E676";
                
                return {
                  ...n,
                  color,
                  label: isActive ? `Backtracked: ${n.label}` : isVisited ? `Visited: ${n.label}` : n.label
                };
              }),
              edges: baseEdges,
              explanation: `Backtrack to Node (${currNode.label}) to check other unvisited branches.`,
              activeId: currId
            });
          }
        });
      };

      dfsVisit(startNode.id);
    }

    stepLogs.forEach((sLog) => {
      steps.push({
        nodes: sLog.nodes,
        edges: sLog.edges,
        explanation: sLog.explanation,
        actionType: "HIGHLIGHT",
        highlightedNodeId: sLog.activeId
      });
    });

    steps.push({
      nodes: baseNodes.map(n => ({
        ...n,
        color: "#00E676",
        label: `Visited: ${n.label}`
      })),
      edges: baseEdges.map(e => ({
        ...e,
        color: "#00E676"
      })),
      explanation: `Graph ${type.toUpperCase()} traversal complete! Visited nodes in sequence: [${visited.map(id => baseNodes.find(n => n.id === id)!.label).join(" -> ")}]`,
      actionType: "NONE"
    });

    set({
      steps,
      currentStepIndex: 0,
      explanation: `Executing Graph ${type.toUpperCase()} traversal.`,
    });
    get().setIsPlaying(true);
    addLog(`Started Graph ${type.toUpperCase()} traversal animation.`, "success");
  }
  }));

// Provide a structural context provider placeholder to keep App.tsx backward compatible
export const AlgorithmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};
