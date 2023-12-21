import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { storeManager } from "../../store/storageManager";
import { useConfigStore } from "../../store/useConfigStore";
import { Handle, Position } from "reactflow";
import Container from "../Common/container";
import PropTypes from "prop-types";
import Loading from "../Common/loading";
import AudioPlayer from "../Common/audioPlayer";
import "highlight.js/styles/github-dark.css";

function TTSOutputNode({ id }) {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [regenerate, setRegenerate] = useState(false);
  const [audio, setAudio] = useState(null);

  const store = storeManager.getSelectedStore();
  const { findNode } = store(({ findNode }) => ({
    findNode,
  }));

  const text = useMemo(() => {
    const parent = findNode(id, "tts", "parent");
    if (parent) {
      return parent.data.text;
    }
    return "";
  }, [findNode, id]);

  const childNode = useMemo(() => {
    const child = findNode(id, "tts", "child");
    if (child) {
      return child;
    }
    return null;
  }, [findNode, id]);

  const { TTSModel, openAIInstance, voice, language, speed } = useConfigStore(
    ({ TTSModel, openAIInstance, voice, language, speed }) => ({
      TTSModel,
      openAIInstance,
      voice,
      language,
      speed,
    })
  );

  const sendText = useCallback(async () => {
    setLoading(true);
    if (openAIInstance && text.trim().length > 0 && !audio) {
      setRegenerate(false);
      const mp3 = await openAIInstance.audio.speech.create({
        model: TTSModel,
        input: text,
        voice,
        speed,
        language,
      });
      const blob = new Blob([await mp3.arrayBuffer()], { type: "audio/mp3" });
      const audioUrl = URL.createObjectURL(blob);
      setAudio({ data: audioUrl });
    }
    setLoading(false);
  }, [openAIInstance, text, audio, TTSModel, voice, speed, language]);

  useEffect(() => {
    // this is to stop the request if this is a reloading of the page
    // as everything runs again when the page reloads and if there is a lot of audios
    // it will take make a lot of requests to the api
    if (childNode?.data?.text?.trim().length > 0) {
      setLoading(false);
      setRegenerate(true);
      return;
    }
    sendText();
  }, []);

  return (
    <Container
      innerRef={containerRef}
      title="Output"
      className="w-[500px] min-h-[150px] overflow-y-scroll flex items-center justify-center overflow-hidden pb-10 relative"
      id={id}
    >
      <div className="flex flex-col items-center justify-center w-full">
        <Handle type="source" position={Position.Bottom} />
        <Handle type="target" position={Position.Top} />
        {loading && <Loading />}
        {audio && <AudioPlayer file={audio} />}
        {regenerate && (
          <button
            className="p-2 border border-gray-300 rounded-md duration-200 ease-in-out"
            onClick={sendText}
          >
            Regenerate
          </button>
        )}
      </div>
    </Container>
  );
}

TTSOutputNode.propTypes = {
  id: PropTypes.string,
  data: PropTypes.shape({
    text: PropTypes.string,
    id: PropTypes.string,
  }),
};

export default TTSOutputNode;
