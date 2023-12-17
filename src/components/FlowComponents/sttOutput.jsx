import { useState, useCallback, useRef, useMemo } from "react";
import { storeManager } from "../../store/storageManager";
import { useConfigStore } from "../../store/useConfigStore";
import { useFileStore } from "../../store/useFileStore";
import { Handle, Position } from "reactflow";
import Container from "../Common/container";
import TextArea from "../Common/textarea";
import PropTypes from "prop-types";
import { uploadAudio } from "../../api/stt";
import Dropdown from "../Common/dropdown";
import { responseFormatSTT, languages } from "../../store/utils/constants";
import Loading from "../Common/loading";
import "highlight.js/styles/github-dark.css"; // Or any other style you prefer
import Tooltip from "../Common/tooltip";
import AudioPlayer from "../Common/audioPlayer";

function SttOutputNode({ id, data }) {
  const containerRef = useRef(null);
  const store = storeManager.getSelectedStore();
  const [responseType, setResponseType] = useState("text");
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState(data.text);
  const [prompt, setPrompt] = useState("");

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
        languages[language],
        responseType,
        prompt
      );
      setLoading(false);
      setText(data);
      onDataTextUpdate(data, id);
    },
    [file, STTModel, apiKey, language, responseType, onDataTextUpdate, id, prompt]
  );

  return (
    <Container
      innerRef={containerRef}
      title="Output"
      className="w-[800px] min-h-[520px] overflow-y-scroll flex items-left justify-start overflow-hidden pb-10 relative"
      id={id}
    >
      <div className="flex items-center justify-between flex-col">
        <TextArea
          id={id}
          label="Prompt"
          placeholder="An optional text to guide the model's style. The prompt should match the audio language. You can add uncommon words for context: ZyntriQix, Digique Plus, CynapseFive, VortiQore V8, EchoNix Array, OrbitalLink Seven, DigiFractal Matrix, PULSE, RAPT, B.R.I.C.K., Q.U.A.R.T.Z., F.L.I.N.T."
          value={prompt}
          cols={65}
          name="prompt"
          onChange={(evt) => {
            setPrompt(evt.target.value);
          }}
          autoFocus
        />
        <div className="m-2" />
        <AudioPlayer file={file} />

        <div className="flex items-center justify-between w-full pt-4">
          <div className="flex items-center justify-between space-x-4">
            <Dropdown
              label="Translate to"
              name="language"
              onChange={(evt) => {
                setLanguage(evt.target.value);
              }}
              value={language}
              options={Object.keys(languages)}
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
          <div className="flex items-start justify-between space-x-4">
            <div>
              <Tooltip
                position="bottom-full"
                text="The transcriptions API takes as input the audio file you want to transcribe and the desired output file format for the transcription of the audio."
              >
                <button
                  disabled={!file}
                  className={`border-2 border-gray-500 rounded-md whitespace-nowrap ${
                    !file ? "opacity-50" : ""
                  }`}
                  onClick={() => handleSend("transcriptions")}
                >
                  <span>Transcribe</span>
                </button>
              </Tooltip>
            </div>
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
