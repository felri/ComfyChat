import { create } from "zustand";
import { addEdge, applyNodeChanges, applyEdgeChanges } from "reactflow";
import { persist } from "zustand/middleware";
import {
  deleteOneNode,
  getMessageHistory,
  createNewNode,
  generateStoreId,
  getStoredStoreIds,
} from "./utils/helpers";
import { initialLayouted } from "./utils/constants";
import { useFileStore } from "./useFileStore";
import { useConfigStore } from "./useConfigStore";

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
        countWordsInHistory: (id) => {
          const history = get().getHistory(id);
          return history.reduce((acc, curr) => {
            return acc + curr.text.split(" ").length;
          }, 0);
        },

        findParentNodeByType: (id, type) => {
          const node = get().nodes.find((node) => node.id === id);
          const edges = get().edges.filter((edge) => edge.target === id);

          if (node?.type === type) {
            return node;
          }

          if (edges?.length === 0) {
            return null;
          }

          return get().findParentNodeByType(edges[0].source, type);
        },
        findChildNodeByType: (id, type) => {
          const node = get().nodes.find((node) => node.id === id);
          const edges = get().edges.filter((edge) => edge.source === id);

          if (node?.type === type) {
            return node;
          }

          if (edges.length === 0) {
            return null;
          }

          return get().findChildNodeByType(edges[0].target, type);
        },
        createAndUpdateNode: (id, parentHeight, type, extraData = {}) => {
          const layouted = createNewNode(
            get().nodes,
            get().edges,
            id,
            parentHeight,
            type,
            extraData
          );

          set({
            nodes: [...layouted.nodes],
            edges: [...layouted.edges],
          });

          return layouted;
        },
        updateNodePosition: (id, diff) => {
          const nodes = get().nodes.map((node) => {
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

          set({ nodes });
        },
        // Update the specific functions to use the new, more generic ones.
        onChooseType: (id, type, parentHeight = 250) => {
          const { nodes } = get().createAndUpdateNode(id, 250, "systemMessage", {
            text: "You are an AI Assistant talking with a human.",
            type,
          });
          const lastNode = nodes[nodes.length - 1];
          get().createAndUpdateNode(lastNode.id, parentHeight, type, { type });
        },
        onUserInputSend: (
          id,
          parentHeight,
          type = "chatOutput",
          childType = "text"
        ) => {
          const { nodes } = get().createAndUpdateNode(id, parentHeight, type);
          const lastNode = nodes[nodes.length - 1];
          get().createAndUpdateNode(lastNode.id, parentHeight + 125, childType);
        },
        createNewSTTNode: (id, parentHeight) => {
          get().createAndUpdateNode(id, parentHeight, "stt", { type: "stt" });
        },
        createNewInputNode: (id, parentHeight = 100) => {
          get().createAndUpdateNode(id, parentHeight, "text");
        },
        updateChildrenPosition: (id, diff) => {
          get().updateNodePosition(id, diff);
        },
        onAudioEditorSend: (id, start, end, type) => {
          get().createAndUpdateNode(id, 200, "ffmpeg", { start, end, type });
        },
        createSTTOutputNode: (id) => {
          get().createAndUpdateNode(id, 200, "sttOutput");
        },
        onAudioDrop: (id, file, parentHeight) => {
          const { nodes } = get().createAndUpdateNode(id, parentHeight, "editor", {
            modelType: "stt",
          });

          const lastNode = nodes[nodes.length - 1];
          useFileStore.setState({
            files: [
              ...useFileStore.getState().files,
              {
                name: file.name,
                data: file.result,
                id: lastNode.id,
              },
            ],
          });
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
      this.stores[id] = createStore(id);
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

export { storeManager };
