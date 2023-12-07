import { create } from "zustand";
import { addEdge, applyNodeChanges, applyEdgeChanges } from "reactflow";
import { persist } from "zustand/middleware";
import {
  createInputBelowOutputNode,
  deleteOneNode,
  getMessageHistory,
  createNewOutputNode,
  defaultEdgeOptions,
} from "./utils";
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
    ...defaultEdgeOptions,
  },
  {
    id: "e2-3",
    source: "2",
    target: "3",
    ...defaultEdgeOptions,
  },
];

const initialLayouted = {
  nodes: initialNodes,
  edges: initialEdges,
};

// Factory function to create a new store
const createStore = (initialLayouted, id) =>
  create(
    persist(
      (set, get) => ({
        id, // unique identifier for each store
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
        name: `store-${id}`, // unique key for local storage persistence
        partialize: (state) =>
          Object.fromEntries(
            Object.entries(state).filter(([key]) =>
              ["openAIConfig", "id", "nodes", "edges"].includes(key)
            )
          ),
      }
    )
  );

const storeManager = {
  stores: {},

  initializeStores() {
    const storeIds = this.getStoredStoreIds();
    storeIds.forEach((id) => {
      this.stores[id] = createStore({}, id);
    });
  },

  createNewStore(initialLayouted, id) {
    const newStore = createStore(initialLayouted, id);
    this.stores[id] = newStore;
    return newStore;
  },

  getStore(id) {
    return this.stores[id];
  },

  removeStore(id) {
    delete this.stores[id];
    localStorage.removeItem(`store-${id}`); // Remove from local storage
  },

  getStoredStoreIds() {
    const storeIds = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("store-")) {
        const id = key.substring(6); // Extract ID part of the key
        storeIds.push(id);
      }
    }
    return storeIds;
  },
};

// Initialize store manager when app starts
storeManager.initializeStores();

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
