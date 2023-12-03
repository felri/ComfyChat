import { create } from "zustand";
import { addEdge, applyNodeChanges, applyEdgeChanges } from "reactflow";
import { persist, createJSONStorage } from "zustand/middleware";
import Dagre from "@dagrejs/dagre";

import OpenAI from "openai";

const initialNodes = [
  {
    id: "config",
    type: "openAIConfig",
    position: { x: 0, y: 0 },
  },
  {
    id: "system",
    type: "systemMessageInput",
    data: { text: "", id: "2" },
    position: { x: 350, y: 0 },
  },
  {
    id: "3",
    type: "userInput",
    data: { text: "", id: "3", quantity: 1 },
    position: { x: 350, y: 350 },
  },
];

const initialEdges = [
  {
    id: "config-system",
    source: "config",
    target: "system",
    type: "step",
    animated: true,
  },
  {
    id: "system-3",
    source: "system",
    target: "3",
    type: "step",
    animated: true,
  },
];

function getMessageHistory(id, nodes, edges) {
  const history = [];
  let currentNodeId = id;

  console.log("nodes", nodes);
  while (currentNodeId !== null) {
    const currentNode = nodes.find((node) => node.id === currentNodeId);
    if (
      (currentNode && currentNode.type === "systemMessageInput") ||
      currentNode.type === "userInput"
    ) {
      // Prepend system messages and user input to the history array.
      history.unshift(currentNode.data.text);
    }
    // Find the edge that points to the current node.
    const currentEdge = edges.find((edge) => edge.target === currentNodeId);
    // Update the currentNodeId to be the source of the current edge (to move to the previous node).
    currentNodeId = currentEdge ? currentEdge.source : null;
  }
  console.log("history", history);

  return history;
}

const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

export const getLayoutedElements = (nodes, edges, options) => {
  g.setGraph({ rankdir: options.direction });

  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  nodes.forEach((node) => g.setNode(node.id, node));

  Dagre.layout(g);

  return {
    nodes: nodes.map((node) => {
      const { x, y } = g.node(node.id);

      return { ...node, position: { x, y } };
    }),
    edges,
  };
};

function createNewOutputNode(nodes, edges, id) {
  const lastNode = nodes[nodes.length - 1];
  const lastEdge = edges[edges.length - 1];
  const newId = parseInt(lastNode.id) + 1;
  const newEdgeId = parseInt(lastEdge.id) + 1;
  const newNode = {
    id: newId.toString(),
    type: "chatOutput",
    data: { messages: [], id: newId.toString() },
    position: { x: 350, y: 350 },
  };
  const newEdge = {
    id: newEdgeId.toString(),
    source: id,
    target: newId.toString(),
    type: "step",
    animated: true,
  };

  return { newNode, newEdge };
}

const useStore = create(
  persist(
    (set, get) => ({
      openAIInstance: null,
      openAIConfig: {
        apiKey: "",
        engine: "gpt-4",
        temperature: 0.7,
        systemMessage: "You are a chatbot. You are talking to a human.",
      },
      updateOpenAIConfig: (newConfig) => {
        set((state) => ({
          openAIConfig: { ...state.openAIConfig, ...newConfig },
        }));
      },
      updateOpenAIKey: (newKey) => {
        set((state) => ({
          openAIConfig: { ...state.openAIConfig, ...newKey },
          openAIInstance: new OpenAI({
            apiKey: newKey.apiKey,
            dangerouslyAllowBrowser: true,
          }),
        }));
      },
      nodes: initialNodes,
      edges: initialEdges,
      onNodesChange: (changes) => {
        set({
          nodes: applyNodeChanges(changes, get().nodes),
        });
      },
      onEdgesChange: (changes) => {
        set({
          edges: applyEdgeChanges(changes, get().edges),
        });
      },
      onConnect: (connection) => {
        set({
          edges: addEdge(connection, get().edges),
        });
      },
      onUpdateUserInput: (text, id) => {
        set((state) => ({
          nodes: state.nodes.map((node) => {
            if (node.id === id) {
              return { ...node, data: { text } };
            }
            return node;
          }),
        }));
      },
      onUpdateUserQuantity: (quantity, id) => {
        set((state) => ({
          nodes: state.nodes.map((node) => {
            if (node.id === id) {
              return { ...node, data: { quantity } };
            }
            return node;
          }),
        }));
      },
      getHistory: (id) => {
        return getMessageHistory(id, get().nodes, get().edges);
      },
      onSendUserInput: (id) => {
        // create a new output node and edge
        const { newNode, newEdge } = createNewOutputNode(
          get().nodes,
          get().edges,
          id
        );
        const layouted = getLayoutedElements(
          [...get().nodes, newNode],
          [...get().edges, newEdge],
          { direction: "TB" }
        );
        // update the nodes and edges
        set({
          nodes: layouted.nodes,
          edges: layouted.edges,
        });
      },
    }),
    {
      name: "flow-editor",
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) =>
            ["openAIConfig"].includes(key)
          )
        ),
    }
  )
);

export { useStore };
