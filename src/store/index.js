import { create } from "zustand";
import { addEdge, applyNodeChanges, applyEdgeChanges } from "reactflow";
import { persist } from "zustand/middleware";
import {
  deleteOneNode,
  getMessageHistory,
  createNewNode,
  generateStoreId,
  getStoredStoreIds,
} from "./utils";
import OpenAI from "openai";
import { initialLayouted, voices } from "./constants";
import { ffmpegLoad, processMedia } from "../utils/ffmpeg";
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

const useFileStore = create((set, get) => ({
  files: [],
  ffmpeg: null,
  setFiles: (files) => set({ files }),
  addFile: (file) => set((state) => ({ files: [...state.files, file] })),
  removeFile: (file) =>
    set((state) => ({
      files: state.files.filter((f) => f.name !== file.name),
    })),
  removeAllFiles: () => set({ files: [] }),
  setFFmpeg: async () => {
    const ffmpeg = await ffmpegLoad();
    set({ ffmpeg });
  },
  cutAudio: async (id, file, start, end) => {
    const data = await processMedia(
      useFileStore.getState().ffmpeg,
      file,
      "cutAudio",
      start,
      end
    );

    const newFiles = [
      ...get().files,
      {
        name: file.name,
        data,
        id,
      },
    ];

    set({ files: newFiles });
  },
}));

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
        onChooseType: (id, type, parentHeight = 250) => {
          const layouted = createNewNode(
            get().nodes,
            get().edges,
            id,
            250,
            "systemMessage",
            { text: "You are an AI Assistant talking with a human.", type }
          );
          const lastNode = layouted.nodes[layouted.nodes.length - 1];

          // create a new input node and edge
          const inputLayouted = createNewNode(
            layouted.nodes,
            layouted.edges,
            lastNode.id,
            parentHeight,
            type,
            { type }
          );

          set({
            nodes: [...inputLayouted.nodes],
            edges: [...inputLayouted.edges],
          });
        },
        onUserInputSend: (
          id,
          parentHeight,
          type = "chatOutput",
          childType = "text"
        ) => {
          // create a new output node and edge
          const layouted = createNewNode(
            get().nodes,
            get().edges,
            id,
            parentHeight,
            type
          );
          const lastNode = layouted.nodes[layouted.nodes.length - 1];

          // create a new input node and edge
          const inputLayouted = createNewNode(
            layouted.nodes,
            layouted.edges,
            lastNode.id,
            parentHeight + 125,
            childType
          );

          set({
            nodes: [...inputLayouted.nodes],
            edges: [...inputLayouted.edges],
          });
        },
        createNewSTTNode: (id, parentHeight) => {
          const layouted = createNewNode(
            get().nodes,
            get().edges,
            id,
            parentHeight,
            "stt",
            { type: "stt" }
          );

          set({
            nodes: [...layouted.nodes],
            edges: [...layouted.edges],
          });
        },
        createNewInputNode: (id, parentHeigth) => {
          const layouted = createNewNode(
            get().nodes,
            get().edges,
            id,
            parentHeigth,
            "text"
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
        onAudioDrop: (id, file, parentHeight) => {
          const layouted = createNewNode(
            get().nodes,
            get().edges,
            id,
            parentHeight,
            "editor",
            { modelType: "stt" }
          );

          console.log(file);
          const lastNode = layouted.nodes[layouted.nodes.length - 1];
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

          set({
            nodes: [...layouted.nodes],
            edges: [...layouted.edges],
          });
        },
        findParentNodeByType: (id, type) => {
          const node = get().nodes.find((node) => node.id === id);
          const edges = get().edges.filter((edge) => edge.target === id);

          if (node.type === type) {
            return node;
          }

          if (edges.length === 0) {
            return null;
          }

          return get().findParentNodeByType(edges[0].source, type);
        },
        findChildNodeByType: (id, type) => {
          const node = get().nodes.find((node) => node.id === id);
          const edges = get().edges.filter((edge) => edge.source === id);

          if (node.type === type) {
            return node;
          }

          if (edges.length === 0) {
            return null;
          }

          return get().findChildNodeByType(edges[0].target, type);
        },
        onAudioEditorSend: (id, start, end, type) => {
          const layouted = createNewNode(
            get().nodes,
            get().edges,
            id,
            200,
            "ffmpeg",
            { start, end, type }
          );

          set({
            nodes: [...layouted.nodes],
            edges: [...layouted.edges],
          });
        },
        createSTTOutputNode: (id) => {
          const layouted = createNewNode(
            get().nodes,
            get().edges,
            id,
            200,
            "sttOutput"
          );

          set({
            nodes: [...layouted.nodes],
            edges: [...layouted.edges],
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
      voice: voices[0],
      language: "English",
      speed: 1,
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
              "voice",
              "language",
              "speed",
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

export { storeManager, useConfigStore, useFileStore };
