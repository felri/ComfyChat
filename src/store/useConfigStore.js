import {
  visionModels,
  textModels,
  imageModels,
  ttsModels,
  sttModels,
} from "./utils/defaultModels";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import OpenAI from "openai";
import { voices } from "./utils/constants";
import { getStoredStoreIds } from "./utils/helpers";

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

export { useConfigStore };
