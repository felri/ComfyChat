import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

export const ffmpegLoad = async () => {
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.4/dist/esm";
  const ffmpeg = new FFmpeg();
  ffmpeg.on("log", ({ message }) => {
    console.log(message);
  });
  // toBlobURL is used to bypass CORS issue, urls with the same
  // domain can be used directly.
  try {
    const coreURL = await toBlobURL(
      `${baseURL}/ffmpeg-core.js`,
      "text/javascript"
    );
    const wasmURL = await toBlobURL(
      `${baseURL}/ffmpeg-core.wasm`,
      "application/wasm"
    );
    await ffmpeg.load({
      coreURL,
      wasmURL,
    });
  } catch (e) {
    console.log(e);
  }
  return ffmpeg;
};

export const cutAudio = async (ffmpeg, file, start, end) => {
  const startStr = start.toString();
  const endStr = end.toString();

  const fileType = file.name.split(".");
  const fileName = "input." + fileType[fileType.length - 1];
  await ffmpeg.writeFile(fileName, await fetchFile(file.data));

  try {
    await ffmpeg.exec([
      "-i",
      fileName,
      "-ss",
      startStr,
      "-to",
      endStr,
      "output.mp3",
      "-y",
    ]);
    const data = await ffmpeg.readFile("output.mp3");
    await ffmpeg.deleteFile(fileName);
    await ffmpeg.deleteFile("output.mp3");
    // Cleanup: deleteFile the input and output files from FFmpeg's file system
    console.log("Cut audio successfully");
    return new File([data.buffer], "output.mp3");
  } catch (error) {
    console.error("Error during ffmpeg processing:", error);
    // Cleanup even in case of error
    try {
      await ffmpeg.deleteFile(fileName);
      await ffmpeg.deleteFile("output.mp3");
    } catch (cleanupError) {
      console.error("Error during cleanup:", cleanupError);
    }
  }
};

export const videoToAudio = async (ffmpeg, file) => {
  const fileType = file.name.split(".");
  const fileName = fileType.slice(0, fileType.length - 1).join(".");
  await ffmpeg.writeFile(fileName, await fetchFile(file));
  await ffmpeg.exec(["-i", fileName, "output.mp3"]);
  const data = await ffmpeg.readFile("output.mp3");
  return new File([data.buffer], "output.mp3");
};