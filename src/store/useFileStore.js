import { create } from "zustand";
import { ffmpegLoad, processMedia } from "../utils/ffmpeg";

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

export { useFileStore };
