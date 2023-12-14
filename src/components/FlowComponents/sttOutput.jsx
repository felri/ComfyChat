import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { storeManager, useConfigStore, useFileStore } from "../../store";
import { Handle, Position } from "reactflow";
import Container from "../Common/container";
import TextArea from "../Common/textarea";
import { HiOutlineTrash } from "react-icons/hi2";
import hljs from "highlight.js";
import { IoIosAdd } from "react-icons/io";
import PropTypes from "prop-types";
import { IoStopCircleOutline } from "react-icons/io5";
import { FaSave } from "react-icons/fa";
import { IoIosRefresh } from "react-icons/io";
import { CiEdit } from "react-icons/ci";
import { uploadAudio } from "../../api/stt";
import Dropdown from "../Common/dropdown";
import { responseFormatSTT, languagesSTT } from "../../store/constants";
import Loading from "../Common/loading";
import "highlight.js/styles/github-dark.css"; // Or any other style you prefer

const AudioPlayer = ({ file }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [file]);

  return (
    <div className="flex items-center justify-center w-full">
      <audio
        ref={audioRef}
        controls
        className="w-full h-10"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        <source src={file?.data} type="audio/mp3" />
      </audio>
    </div>
  );
};

AudioPlayer.propTypes = {
  file: PropTypes.shape({
    data: PropTypes.string,
  }),
};

function SttOutputNode({ id, data }) {
  const containerRef = useRef(null);
  const store = storeManager.getSelectedStore();
  const [responseType, setResponseType] = useState("text");
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState(data.text);

  const { STTModel, apiKey } = useConfigStore((state) => ({
    STTModel: state.STTModel,
    apiKey: state.apiKey,
  }));

  const { files } = useFileStore(({ files }) => ({ files }));

  const { findParentNodeByType, onDataTextUpdate } = store(
    ({ findParentNodeByType, onDataTextUpdate }) => ({
      findParentNodeByType,
      onDataTextUpdate,
    })
  );

  const file = useMemo(() => {
    if (!id) return null;
    const parent = findParentNodeByType(id, "ffmpeg");
    if (!parent) return null;
    const file = files.find((f) => f.id === parent.id);
    return file;
  }, [id, findParentNodeByType, files]);

  const handleSend = useCallback(
    async (type) => {
      if (!file) return;
      setLoading(true);
      const data = await uploadAudio(
        STTModel,
        file,
        apiKey,
        type,
        languagesSTT[language],
        responseType
      );
      setLoading(false);
      setText(data);
      onDataTextUpdate(id, data);
    },
    [file, STTModel, apiKey, language, responseType, onDataTextUpdate, id]
  );

  return (
    <Container
      innerRef={containerRef}
      title="Output"
      className="w-[800px] min-h-[520px] overflow-y-scroll flex items-left justify-start overflow-hidden pb-10 relative"
      id={id}
    >
      <div className="flex items-center justify-between mt-10 flex-col">
        <AudioPlayer file={file} />

        <div className="flex items-center justify-between w-full pt-4">
          <div>
            <Dropdown
              label="Audio Language"
              name="language"
              onChange={(evt) => {
                setLanguage(evt.target.value);
              }}
              value={language}
              options={Object.keys(languagesSTT)}
            />
            <Dropdown
              label="Output Format"
              name="format"
              onChange={(evt) => {
                setResponseType(evt.target.value);
              }}
              value={responseType}
              options={responseFormatSTT}
            />
          </div>
          <div className="flex items-center justify-between space-x-4">
            <button
              disabled={!file}
              className={`border-2 border-gray-500 rounded-md ${
                !file ? "opacity-50" : ""
              }`}
              onClick={() => handleSend("transcriptions")}
            >
              <span>Transcribe</span>
            </button>

            <button
              disabled={!file}
              className={`border-2 border-gray-500 rounded-md ${
                !file ? "opacity-50" : ""
              }`}
              onClick={() => handleSend("translations")}
            >
              <span>Translate to english</span>
            </button>
          </div>
        </div>

        {loading && <Loading />}
        {text && (
          <TextArea
            id={id}
            label="Output"
            value={text}
            cols={65}
            name="text"
            onChange={(evt) => {
              setText(evt.target.value);
              onDataTextUpdate(id, evt.target.value);
            }}
            autoFocus
          />
        )}

        <Handle type="source" position={Position.Bottom} />
        <Handle type="target" position={Position.Top} />
      </div>
    </Container>
  );
}

SttOutputNode.propTypes = {
  id: PropTypes.string,
  data: PropTypes.shape({
    text: PropTypes.string,
    id: PropTypes.string,
    quantity: PropTypes.number,
  }),
};

export default SttOutputNode;
