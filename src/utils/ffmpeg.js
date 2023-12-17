import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

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

const cleanUp = async (ffmpeg, fileName, outputFileName) => {
  try {
    await ffmpeg.deleteFile(fileName);
  } catch (cleanupError) {
    console.log("Error during cleanup:", cleanupError);
  }

  try {
    await ffmpeg.deleteFile(outputFileName);
  } catch (cleanupError) {
    console.log("Error during cleanup:", cleanupError);
  }

  return;
};

export const processMedia = async (
  ffmpeg,
  file,
  operation,
  start = null,
  end = null
) => {
  const fileType = file.name.split(".");
  const fileName = "input." + fileType[fileType.length - 1];
  const outputFileName = "output.mp3";
  let destroyFFmpeg = false;

  await cleanUp(ffmpeg, fileName, outputFileName);

  try {
    await ffmpeg.writeFile(fileName, await fetchFile(file.data));
  } catch (writeError) {
    console.error("Error during writeFile:", writeError);
    console.log("Retrying...");

    try {
      ffmpeg = await ffmpegLoad();
      await ffmpeg.writeFile(fileName, await fetchFile(file.data));
      destroyFFmpeg = true;
    } catch (retryError) {
      console.error("Error during retry writeFile:", retryError);
    }
  }

  try {
    let ffmpegCommand = ["-i", fileName];

    if (operation === "cutAudio") {
      ffmpegCommand.push("-ss", start.toString(), "-to", end.toString());
    } else if (operation === "videoToAudio") {
      ffmpegCommand.push("-vn", "-acodec", "copy");
    }

    ffmpegCommand.push(outputFileName, "-y");

    await ffmpeg.exec(ffmpegCommand);
    const data = await ffmpeg.readFile(outputFileName);

    await cleanUp(ffmpeg, fileName, outputFileName);

    // Convert ArrayBuffer to base64
    const base64String = arrayBufferToBase64(data.buffer);

    console.log("Operation completed successfully");
    return `data:audio/mpeg;base64,${base64String}`;
  } catch (error) {
    console.error("Error during ffmpeg processing:", error);

    // Cleanup even in case of error
    try {
      await cleanUp(ffmpeg, fileName, outputFileName);
    } catch (cleanupError) {
      console.error("Error during cleanup:", cleanupError);
    }
  }

  // if for some reason we had to reload ffmpeg, destroy it after use
  if (destroyFFmpeg) {
    ffmpeg.destroy();
    ffmpeg = null;
  }
};
