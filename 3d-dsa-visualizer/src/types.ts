export interface Node3D {
  id: string | number;
  label: string;
  position: [number, number, number];
  color: string;
  isHighlighted?: boolean;
  scale?: number;
}

export interface Edge3D {
  id: string; // usually "from-to"
  from: string | number;
  to: string | number;
  color?: string;
  isHighlighted?: boolean;
}

export interface AlgStep {
  nodes: Node3D[];
  edges: Edge3D[];
  explanation: string;
  actionType?: "INSERT" | "HIGHLIGHT" | "DELETE" | "CREATE_STRUCTURE" | "STEP_ALGORITHM" | "NONE";
  highlightedNodeId?: string | number | null;
  highlightedEdgeId?: string | null;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface DSAStructure {
  action: "CREATE_STRUCTURE" | "STEP_ALGORITHM" | "QUIZ_MODE";
  structure_type: "LINKED_LIST" | "BST" | "GRAPH" | "HEAP" | "QUEUE" | "STACK";
  nodes: Node3D[];
  edges: Edge3D[];
  explanation: string;
  steps?: AlgStep[];
  quiz_question?: QuizQuestion;
}
