import { DSAStructure } from "../types";

export const PRESET_STRUCTURES: Record<string, DSAStructure> = {
  bst_insert: {
    action: "STEP_ALGORITHM",
    structure_type: "BST",
    explanation: "A Binary Search Tree (BST) keeps left subtree keys smaller and right subtree keys larger than the root. Watch how 12 is placed.",
    nodes: [
      { id: "15", label: "15 (Root)", position: [0, 2, 0], color: "#00E5FF" },
      { id: "10", label: "10", position: [-2, 0.5, 0], color: "#80F" },
      { id: "20", label: "20", position: [2, 0.5, 0], color: "#80F" },
      { id: "5", label: "5", position: [-3, -1, 0], color: "#D1C4E9" },
      { id: "12", label: "12", position: [-1, -1, 0], color: "#FF1744", isHighlighted: true },
    ],
    edges: [
      { id: "15-10", from: "15", to: "10", color: "#616161" },
      { id: "15-20", from: "15", to: "20", color: "#616161" },
      { id: "10-5", from: "10", to: "5", color: "#616161" },
      { id: "10-12", from: "10", to: "12", color: "#FF1744" },
    ],
    steps: [
      {
        nodes: [
          { id: "15", label: "15 (Root)", position: [0, 2, 0], color: "#FF1744", isHighlighted: true },
          { id: "10", label: "10", position: [-2, 0.5, 0], color: "#80F" },
          { id: "20", label: "20", position: [2, 0.5, 0], color: "#80F" },
          { id: "5", label: "5", position: [-3, -1, 0], color: "#D1C4E9" },
        ],
        edges: [
          { id: "15-10", from: "15", to: "10", color: "#6e6e6e" },
          { id: "15-20", from: "15", to: "20", color: "#6e6e6e" },
          { id: "10-5", from: "10", to: "5", color: "#6e6e6e" },
        ],
        explanation: "Inserting 12. Compare 12 with Root (15). Since 12 < 15, we traverse left.",
        actionType: "HIGHLIGHT",
        highlightedNodeId: "15",
      },
      {
        nodes: [
          { id: "15", label: "15 (Root)", position: [0, 2, 0], color: "#00E5FF" },
          { id: "10", label: "10", position: [-2, 0.5, 0], color: "#FF1744", isHighlighted: true },
          { id: "20", label: "20", position: [2, 0.5, 0], color: "#80F" },
          { id: "5", label: "5", position: [-3, -1, 0], color: "#D1C4E9" },
        ],
        edges: [
          { id: "15-10", from: "15", to: "10", color: "#FF1744", isHighlighted: true },
          { id: "15-20", from: "15", to: "20", color: "#6e6e6e" },
          { id: "10-5", from: "10", to: "5", color: "#6e6e6e" },
        ],
        explanation: "Traversed left edge (15 -> 10). Now compare 12 with 10. Since 12 > 10, we traverse right.",
        actionType: "HIGHLIGHT",
        highlightedNodeId: "10",
        highlightedEdgeId: "15-10",
      },
      {
        nodes: [
          { id: "15", label: "15 (Root)", position: [0, 2, 0], color: "#00E5FF" },
          { id: "10", label: "10", position: [-2, 0.5, 0], color: "#80F" },
          { id: "20", label: "20", position: [2, 0.5, 0], color: "#80F" },
          { id: "5", label: "5", position: [-3, -1, 0], color: "#D1C4E9" },
          { id: "12", label: "12", position: [-1, -1, 0], color: "#00E676", isHighlighted: true },
        ],
        edges: [
          { id: "15-10", from: "15", to: "10", color: "#6e6e6e" },
          { id: "15-20", from: "15", to: "20", color: "#6e6e6e" },
          { id: "10-5", from: "10", to: "5", color: "#6e6e6e" },
          { id: "10-12", from: "10", to: "12", color: "#00E676", isHighlighted: true },
        ],
        explanation: "The right child of 10 is empty. Successfully insert 12 as the right child of 10!",
        actionType: "INSERT",
        highlightedNodeId: "12",
        highlightedEdgeId: "10-12",
      },
    ],
    quiz_question: {
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
  },
  linked_list_insert: {
    action: "STEP_ALGORITHM",
    structure_type: "LINKED_LIST",
    explanation: "A Linked List is a linear data structure where elements are stored in nodes, each holding a pointer to the next.",
    nodes: [
      { id: "A", label: "Head: 10", position: [-3, 0, 0], color: "#00E5FF" },
      { id: "B", label: "20", position: [-1, 0, 0], color: "#80F" },
      { id: "C", label: "30", position: [1, 0, 0], color: "#80F" },
      { id: "D", label: "Tail: 40", position: [3, 0, 0], color: "#00E5FF" },
    ],
    edges: [
      { id: "A-B", from: "A", to: "B", color: "#00E5FF" },
      { id: "B-C", from: "B", to: "C", color: "#80F" },
      { id: "C-D", from: "C", to: "D", color: "#00E5FF" },
    ],
    steps: [
      {
        nodes: [
          { id: "A", label: "Head: 10", position: [-3, 0, 0], color: "#00E5FF" },
          { id: "B", label: "20", position: [-1, 0, 0], color: "#00E676", isHighlighted: true },
          { id: "C", label: "30", position: [1, 0, 0], color: "#80F" },
          { id: "D", label: "Tail: 40", position: [3, 0, 0], color: "#00E5FF" },
        ],
        edges: [
          { id: "A-B", from: "A", to: "B", color: "#00E5FF" },
          { id: "B-C", from: "B", to: "C", color: "#80F" },
          { id: "C-D", from: "C", to: "D", color: "#00E5FF" },
        ],
        explanation: "Traversing the linked list: We start at Head and follow the pointers to find Node 20.",
        actionType: "HIGHLIGHT",
        highlightedNodeId: "B",
      },
      {
        nodes: [
          { id: "A", label: "Head: 10", position: [-3, 0, 0], color: "#00E5FF" },
          { id: "B", label: "20", position: [-1, 0, 0], color: "#80F" },
          { id: "C", label: "30", position: [1, 0, 0], color: "#ff007f", isHighlighted: true },
          { id: "D", label: "Tail: 40", position: [3, 0, 0], color: "#00E5FF" },
        ],
        edges: [
          { id: "A-B", from: "A", to: "B", color: "#00E5FF" },
          { id: "B-C", from: "B", to: "C", color: "#ff007f", isHighlighted: true },
          { id: "C-D", from: "C", to: "D", color: "#00E5FF" },
        ],
        explanation: "Traversed pointer: B -> C. We are now at Node 30. Notice the pointer links are directed step-by-step.",
        actionType: "HIGHLIGHT",
        highlightedNodeId: "C",
        highlightedEdgeId: "B-C",
      },
    ],
    quiz_question: {
      question: "What is the time complexity to access an element at the k-th index in a singly linked list containing N elements?",
      options: ["O(1)", "O(log N)", "O(N)", "O(k log N)"],
      correct_index: 2,
      explanation: "Access in a singly list is O(N) because you must traverse from the head element one by one.",
    },
  },
  graph_bfs: {
    action: "STEP_ALGORITHM",
    structure_type: "GRAPH",
    explanation: "Breadth-First Search (BFS) is a graph traversal technique. It starts at a source node, explores all neighbors at the present depth level, and then moves to the nodes at the next depth level.",
    nodes: [
      { id: "0", label: "Node 0", position: [0, 1.5, 0], color: "#00E5FF" },
      { id: "1", label: "Node 1", position: [-1.8, 0, 1], color: "#80F" },
      { id: "2", label: "Node 2", position: [1.8, 0, 1], color: "#80F" },
      { id: "3", label: "Node 3", position: [-1, -1.5, -1], color: "#80F" },
      { id: "4", label: "Node 4", position: [1, -1.5, -1], color: "#80F" },
    ],
    edges: [
      { id: "0-1", from: "0", to: "1", color: "#616161" },
      { id: "0-2", from: "0", to: "2", color: "#616161" },
      { id: "1-3", from: "1", to: "3", color: "#616161" },
      { id: "2-4", from: "2", to: "4", color: "#616161" },
      { id: "3-4", from: "3", to: "4", color: "#616161" },
    ],
    steps: [
      {
        nodes: [
          { id: "0", label: "Visited: 0", position: [0, 1.5, 0], color: "#00E676", isHighlighted: true },
          { id: "1", label: "Queue: 1", position: [-1.8, 0, 1], color: "#FFD600" },
          { id: "2", label: "Queue: 2", position: [1.8, 0, 1], color: "#FFD600" },
          { id: "3", label: "Node 3", position: [-1, -1.5, -1], color: "#80F" },
          { id: "4", label: "Node 4", position: [1, -1.5, -1], color: "#80F" },
        ],
        edges: [
          { id: "0-1", from: "0", to: "1", color: "#FFD600", isHighlighted: true },
          { id: "0-2", from: "0", to: "2", color: "#FFD600", isHighlighted: true },
          { id: "1-3", from: "1", to: "3", color: "#616161" },
          { id: "2-4", from: "2", to: "4", color: "#616161" },
          { id: "3-4", from: "3", to: "4", color: "#616161" },
        ],
        explanation: "Initialize BFS at Node 0 (Mark visited). We enqueue its immediate children, Node 1 and Node 2. (Queue is [1, 2]).",
        actionType: "HIGHLIGHT",
        highlightedNodeId: "0",
      },
      {
        nodes: [
          { id: "0", label: "Visited: 0", position: [0, 1.5, 0], color: "#00E676" },
          { id: "1", label: "Visited: 1", position: [-1.8, 0, 1], color: "#00E676", isHighlighted: true },
          { id: "2", label: "Queue: 2", position: [1.8, 0, 1], color: "#FFD600" },
          { id: "3", label: "Queue: 3", position: [-1, -1.5, -1], color: "#FFD600" },
          { id: "4", label: "Node 4", position: [1, -1.5, -1], color: "#80F" },
        ],
        edges: [
          { id: "0-1", from: "0", to: "1", color: "#00E676" },
          { id: "0-2", from: "0", to: "2", color: "#FFD600" },
          { id: "1-3", from: "1", to: "3", color: "#FFD600", isHighlighted: true },
          { id: "2-4", from: "2", to: "4", color: "#616161" },
          { id: "3-4", from: "3", to: "4", color: "#616161" },
        ],
        explanation: "Dequeue Node 1, visit its unvisited neighbors. Enqueue Node 3. (Queue is [2, 3]).",
        actionType: "HIGHLIGHT",
        highlightedNodeId: "1",
        highlightedEdgeId: "1-3",
      },
      {
        nodes: [
          { id: "0", label: "Visited: 0", position: [0, 1.5, 0], color: "#00E676" },
          { id: "1", label: "Visited: 1", position: [-1.8, 0, 1], color: "#00E676" },
          { id: "2", label: "Visited: 2", position: [1.8, 0, 1], color: "#00E676", isHighlighted: true },
          { id: "3", label: "Queue: 3", position: [-1, -1.5, -1], color: "#FFD600" },
          { id: "4", label: "Queue: 4", position: [1, -1.5, -1], color: "#FFD600" },
        ],
        edges: [
          { id: "0-1", from: "0", to: "1", color: "#00E676" },
          { id: "0-2", from: "0", to: "2", color: "#00E676" },
          { id: "1-3", from: "1", to: "3", color: "#00E676" },
          { id: "2-4", from: "2", to: "4", color: "#FFD600", isHighlighted: true },
          { id: "3-4", from: "3", to: "4", color: "#616161" },
        ],
        explanation: "Dequeue Node 2, visit its unvisited neighbors. Enqueue Node 4. (Queue is [3, 4]).",
        actionType: "HIGHLIGHT",
        highlightedNodeId: "2",
        highlightedEdgeId: "2-4",
      },
      {
        nodes: [
          { id: "0", label: "Visited: 0", position: [0, 1.5, 0], color: "#00E676" },
          { id: "1", label: "Visited: 1", position: [-1.8, 0, 1], color: "#00E676" },
          { id: "2", label: "Visited: 2", position: [1.8, 0, 1], color: "#00E676" },
          { id: "3", label: "Visited: 3", position: [-1, -1.5, -1], color: "#00E676", isHighlighted: true },
          { id: "4", label: "Queue: 4", position: [1, -1.5, -1], color: "#FFD600" },
        ],
        edges: [
          { id: "0-1", from: "0", to: "1", color: "#00E676" },
          { id: "0-2", from: "0", to: "2", color: "#00E676" },
          { id: "1-3", from: "1", to: "3", color: "#00E676" },
          { id: "2-4", from: "2", to: "4", color: "#00E676" },
          { id: "3-4", from: "3", to: "4", color: "#616161" },
        ],
        explanation: "Dequeue Node 3. Since all its neighbors (Node 1, Node 4) are already visited or enqueued, we mark Node 3 visited. (Queue is [4]).",
        actionType: "HIGHLIGHT",
        highlightedNodeId: "3",
      },
      {
        nodes: [
          { id: "0", label: "Visited: 0", position: [0, 1.5, 0], color: "#00E676" },
          { id: "1", label: "Visited: 1", position: [-1.8, 0, 1], color: "#00E676" },
          { id: "2", label: "Visited: 2", position: [1.8, 0, 1], color: "#00E676" },
          { id: "3", label: "Visited: 3", position: [-1, -1.5, -1], color: "#00E676" },
          { id: "4", label: "Visited: 4", position: [1, -1.5, -1], color: "#00E676", isHighlighted: true },
        ],
        edges: [
          { id: "0-1", from: "0", to: "1", color: "#00E676" },
          { id: "0-2", from: "0", to: "2", color: "#00E676" },
          { id: "1-3", from: "1", to: "3", color: "#00E676" },
          { id: "2-4", from: "2", to: "4", color: "#00E676" },
          { id: "3-4", from: "3", to: "4", color: "#00E676" },
        ],
        explanation: "Dequeue Node 4. Since all its neighbors are visited, we mark Node 4 visited. The Queue is now empty, and BFS traversal is complete!",
        actionType: "NONE",
        highlightedNodeId: "4",
      },
    ],
    quiz_question: {
      question: "Which data structure is typically used internally to implement Breath-First Search of a graph?",
      options: [
        "Stack",
        "Queue",
        "Max-Heap",
        "Binary Search Tree",
      ],
      correct_index: 1,
      explanation: "BFS uses a Queue (First-In, First-Out) to visit nodes breadth-by-breadth, while DFS uses a Stack (depth-first).",
    },
  },
  queue_preset: {
    action: "STEP_ALGORITHM",
    structure_type: "QUEUE",
    explanation: "A Queue is a linear data structure following First-In, First-Out (FIFO). The 'front' pointer tracks where elements are dequeued; 'rear' tracks where new elements are enqueued.",
    nodes: [
      { id: "Q0", label: "Front: 10", position: [-3, 0, 0], color: "#00E5FF" },
      { id: "Q1", label: "20", position: [-1, 0, 0], color: "#80F" },
      { id: "Q2", label: "30", position: [1, 0, 0], color: "#80F" },
      { id: "Q3", label: "Rear: 40", position: [3, 0, 0], color: "#FF1744" },
    ],
    edges: [
      { id: "Q0-Q1", from: "Q0", to: "Q1", color: "#616161" },
      { id: "Q1-Q2", from: "Q1", to: "Q2", color: "#616161" },
      { id: "Q2-Q3", from: "Q2", to: "Q3", color: "#616161" },
    ],
    steps: [],
    quiz_question: {
      question: "Which of the following principles does a Queue data structure strictly follow?",
      options: [
        "LIFO (Last-In, First-Out)",
        "FIFO (First-In, First-Out)",
        "LILO (Last-In, Last-Out)",
        "Both FIFO and LIFO",
      ],
      correct_index: 1,
      explanation: "A Queue operates under First-In, First-Out (FIFO) rules, which are essential for fair scheduling systems.",
    },
  },
  stack_preset: {
    action: "STEP_ALGORITHM",
    structure_type: "STACK",
    explanation: "A Stack is a linear data structure following Last-In, First-Out (LIFO) rules.",
    nodes: [
      { id: "S3", label: "Top: 40", position: [0, 1.5, 0], color: "#8B5CF6" },
      { id: "S2", label: "30", position: [0, 0.5, 0], color: "#6366F1" },
      { id: "S1", label: "20", position: [0, -0.5, 0], color: "#3B82F6" },
      { id: "S0", label: "Base: 10", position: [0, -1.5, 0], color: "#00E5FF" }
    ],
    edges: [
      { id: "S3-S2", from: "S3", to: "S2", color: "#616161" },
      { id: "S2-S1", from: "S2", to: "S1", color: "#616161" },
      { id: "S1-S0", from: "S1", to: "S0", color: "#616161" }
    ],
    steps: [],
    quiz_question: {
      question: "Which of the following operations describes accessing the top element of a stack without removing it?",
      options: ["Pop", "Push", "Peek", "Search"],
      correct_index: 2,
      explanation: "Peek (or Top) allows viewing the element at the top of the stack without modifying the stack structure."
    }
  }
};
