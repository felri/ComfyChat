import { create } from "zustand";
import { addEdge, applyNodeChanges, applyEdgeChanges } from "reactflow";
import { persist } from "zustand/middleware";
import {
  createInputBelowOutputNode,
  deleteOneNode,
  getMessageHistory,
  createNewNode,
  generateStoreId,
  getStoredStoreIds,
} from "./utils";
import OpenAI from "openai";
import { initialLayouted } from "./constants";
import {
  visionModels,
  textModels,
  imageModels,
  ttsModels,
  sttModels,
} from "./defaultModels";

function createModelInstance(apiKey) {
  try {
    return new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true,
    });
  } catch (e) {
    console.log(e);
    return null;
  }
}

// Factory function to create a new store
const createStore = (initialLayouted, id) =>
  create(
    persist(
      (set, get) => ({
        id, // unique identifier for each store
        nodes: initialLayouted.nodes,
        edges: initialLayouted.edges,
        openAIInstance: null,
        apiKey: "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",
        temperature: 0.9,
        textModel: textModels[0],
        visionModel: visionModels[0],
        imageModel: imageModels[0],
        TTSModel: ttsModels[0],
        STTModel: sttModels[0],
        updateStore: (name, value) => {
          set((state) => ({
            ...state,
            [name]: value,
          }));
        },
        updateOpenAIKey: (newKey) => {
          set((state) => ({
            ...state,
            apiKey: newKey,
            openAIInstance:
              newKey.trim().length === 51 ? createModelInstance(newKey) : null,
          }));
        },
        createOpenAIInstance: () => {
          set((state) => ({
            openAIInstance: createModelInstance(state.apiKey),
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
        onDataTextUpdate: (text, id) => {
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
        getHistory: (id) => {
          return getMessageHistory(id, get().nodes, get().edges);
        },
        onChooseType: (id, modelType) => {
          const layouted = createNewNode(
            get().nodes,
            get().edges,
            id,
            250,
            "systemMessage",
            { modelType, text: "You are an AI Assistant talking with a human." }
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
        onUserInputSend: (id, parentHeight) => {
          // create a new output node and edge
          const layouted = createNewNode(
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
              [
                "id",
                "nodes",
                "edges",
                "apiKey",
                "temperature",
                "textModel",
                "visionModel",
                "imageModel",
                "TTSModel",
                "STTModel",
              ].includes(key)
            )
          ),
      }
    )
  );

const useSelectedStoreId = create(
  persist(
    (set) => ({
      selectedStoreId: getStoredStoreIds()[0],
      setSelectedStoreId: (id) => set({ selectedStoreId: id }),
    }),
    {
      name: "selected-store-id",
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) =>
            ["selectedStoreId"].includes(key)
          )
        ),
    }
  )
);

const storeManager = {
  stores: {},

  getSelectedStore() {
    return this.stores[useSelectedStoreId.getState().selectedStoreId];
  },

  setSelectedStore(id) {
    useSelectedStoreId.setState({ selectedStoreId: id });
  },

  initializeStores() {
    const storeIds = getStoredStoreIds();
    if (storeIds.length === 0) {
      this.createNewStore();
      return;
    }
    storeIds.forEach((id) => {
      this.stores[id] = createStore({}, id);
    });
  },

  createNewStore() {
    const id = generateStoreId();
    const newStore = createStore(initialLayouted, id);
    this.stores[id] = newStore;
    useSelectedStoreId.setState({ selectedStoreId: id });
    return newStore;
  },

  getStore(id) {
    if (!id) {
      if (Object.keys(this.stores).length === 0) {
        return this.createNewStore(initialLayouted);
      }
      return Object.values(this.stores)[0];
    }
    return this.stores[id];
  },

  removeStore(id) {
    delete this.stores[id];
    localStorage.removeItem(`store-${id}`); // Remove from local storage
  },
};

storeManager.initializeStores();

export { storeManager, useSelectedStoreId };
