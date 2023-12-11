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
const createStore = (id) =>
  create(
    persist(
      (set, get) => ({
        id,
        nodes: [...initialLayouted.nodes],
        edges: [...initialLayouted.edges],
        temperature: 0.9,
        resetStore: () => {
          set({
            nodes: [...initialLayouted.nodes],
            edges: [...initialLayouted.edges],
          });
        },
        updateStore: (name, value) => {
          set({
            [name]: value,
          });
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
            nodes: [...inputLayouted.nodes],
            edges: [...inputLayouted.edges],
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
            nodes: [...inputLayouted.nodes],
            edges: [...inputLayouted.edges],
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
        name: `store-${id}`,
        partialize: (state) =>
          Object.fromEntries(
            Object.entries(state).filter(([key]) =>
              ["id", "nodes", "edges", "temperature"].includes(key)
            )
          ),
      }
    )
  );

const useConfigStore = create(
  persist(
    (set) => ({
      selectedStoreId: getStoredStoreIds()[0],
      apiKey: "",
      openAIInstance: null,
      lockViewInOutput: true,
      textModel: textModels[0],
      visionModel: visionModels[0],
      imageModel: imageModels[0],
      TTSModel: ttsModels[0],
      STTModel: sttModels[0],
      setSelectedStoreId: (id) => set({ selectedStoreId: id }),
      setApiKey: (key) => set({ apiKey: key }),
      setLockViewInOutput: (lock) => set({ lockViewInOutput: lock }),
      updateStore: (name, value) => {
        set({
          [name]: value,
        });
      },
      createOpenAIInstance: () => {
        set((state) => ({
          openAIInstance: createModelInstance(state.apiKey),
        }));
      },
    }),
    {
      name: "config-store",
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) =>
            [
              "selectedStoreId",
              "apiKey",
              "lockViewInOutput",
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

const storeManager = {
  stores: {},

  getSelectedStore() {
    return this.stores[useConfigStore.getState().selectedStoreId];
  },

  setSelectedStore(id) {
    useConfigStore.setState({ selectedStoreId: id });
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
    const newStore = createStore(id);
    this.stores[id] = newStore;
    useConfigStore.setState({ selectedStoreId: id });
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
    localStorage.removeItem(`store-${id}`);
    if (Object.keys(this.stores).length === 0) {
      this.createNewStore();
    }
  },
};

storeManager.initializeStores();

export { storeManager, useConfigStore };
