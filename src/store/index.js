import { create } from "zustand";
import { addEdge, applyNodeChanges, applyEdgeChanges } from "reactflow";
import { persist } from "zustand/middleware";
import { createInputBelowOutputNode, deleteOneNode } from "./utils";
import OpenAI from "openai";

const initialNodes = [
  {
    id: "1",
    type: "openAIConfig",
    position: { x: -350, y: 275 },
  },
  {
    id: "2",
    type: "systemMessageInput",
    data: { text: "", id: "2" },
    position: { x: 0, y: 250 },
  },
  {
    id: "3",
    type: "userInput",
    data: { text: "", id: "3", quantity: 1 },
    position: { x: -100, y: 600 },
  },
];

const initialEdges = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    animated: false,
    type: "smoothstep",
  },
  {
    id: "e2-3",
    source: "2",
    target: "3",
    animated: false,
    type: "smoothstep",
  },
];

const initialLayouted = {
  nodes: initialNodes,
  edges: initialEdges,
};

function getMessageHistory(id, systemMessage, nodes, edges) {
  console.log("getMessageHistory", nodes, edges);
  const history = [];

  let currentNodeId = id;
  while (currentNodeId !== null) {
    const currentNode = nodes.find((node) => node.id === currentNodeId);
    if (currentNode && currentNode.data?.text) {
      // Prepend system messages and user input to the history array.
      history.unshift({
        role: currentNode.type === "userInput" ? "user" : "assistant",
        content: currentNode.data.text,
      });
    }
    // Find the edge that points to the current node.
    const currentEdge = edges.find((edge) => edge.target === currentNodeId);
    // Update the currentNodeId to be the source of the current edge (to move to the previous node).
    currentNodeId = currentEdge ? currentEdge.source : null;
  }

  // Prepend the initial system message to the history array.
  history.unshift({
    role: "assistant",
    content: systemMessage,
  });

  return history;
}

function calculateNewNodePosition(nodes, edges, parentId, parentHeight) {
  const horizontalOffset = 800; // Horizontal offset for each child
  const verticalSpacing = 150; // Vertical spacing from the parent node

  // Find the parent node
  const parentNode = nodes.find((node) => node.id === parentId);
  if (!parentNode) {
    throw new Error("Parent node not found");
  }

  // Count the number of child nodes for the given parent
  const childCount = edges.filter((edge) => edge.source === parentId).length;

  // Calculate the x position based on the number of child nodes
  const newXPosition = childCount * horizontalOffset + parentNode.position.x;

  // Calculate the y position based on the parent node's position and height
  // Add some additional spacing to avoid overlapping with the parent node
  const newYPosition = parentNode.position.y + parentHeight + verticalSpacing;

  return {
    x: newXPosition,
    y: newYPosition,
  };
}

function createNewOutputNode(
  nodes,
  edges,
  parentId,
  parentHeight,
  type = "chatOutput"
) {
  const newNodePosition = calculateNewNodePosition(
    nodes,
    edges,
    parentId,
    parentHeight
  );

  const newNodeId = `${parseInt(nodes[nodes.length - 1].id) + 1}`;
  const newNode = {
    id: newNodeId,
    type,
    data: { text: "", id: newNodeId },
    position: newNodePosition,
  };

  const newEdge = {
    id: `e${parentId}-${newNodeId}`,
    source: parentId,
    target: newNodeId,
    animated: false,
    type: "smoothstep",
  };

  return {
    nodes: [...nodes, newNode],
    edges: [...edges, newEdge],
  };
}

const useStore = create(
  persist(
    (set, get) => ({
      nodes: initialLayouted.nodes,
      edges: initialLayouted.edges,
      openAIInstance: null,
      openAIConfig: {
        apiKey: "",
        engine: "gpt-3.5-turbo-1106",
        temperature: 0.9,
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
      createOpenAIInstance: () => {
        set((state) => ({
          openAIInstance: new OpenAI({
            apiKey: state.openAIConfig.apiKey,
            dangerouslyAllowBrowser: true,
          }),
        }));
      },
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
      deleteUserNode: (id) => {
        const layouted = deleteOneNode(get().nodes, get().edges, id);
        set({
          nodes: layouted.nodes,
          edges: layouted.edges,
        });
      },
      deleteChatNode: (deletedNodes, nodes, edges) => {
        deletedNodes.forEach((node) => {
          const layouted = deleteOneNode(nodes, edges, node.id);
          set({
            nodes: layouted.nodes,
            edges: layouted.edges,
          });
        });
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
        const sytemMessage = get().openAIConfig.systemMessage;
        return getMessageHistory(id, sytemMessage, get().nodes, get().edges);
      },
      onUserInputSend: (id, parentHeight) => {
        // create a new output node and edge
        const layouted = createNewOutputNode(
          get().nodes,
          get().edges,
          id,
          parentHeight
        );

        const lastNode = layouted.nodes[layouted.nodes.length - 1];

        // create a new input node and edge
        const inputLayouted = createInputBelowOutputNode(
          layouted.nodes,
          layouted.edges,
          lastNode.id
        );

        set({
          nodes: inputLayouted.nodes,
          edges: inputLayouted.edges,
        });
      },
      createNewInputNode: (id, parentHeigth) => {
        const layouted = createInputBelowOutputNode(
          get().nodes,
          get().edges,
          id,
          parentHeigth
        );

        set({
          nodes: layouted.nodes,
          edges: layouted.edges,
        });
      },
      updateChildrenPosition: (id, diff) => {
        const layouted = get().nodes.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              position: {
                x: node.position.x,
                y: node.position.y + diff,
              },
            };
          }
          return node;
        });
        set({ nodes: layouted });
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
