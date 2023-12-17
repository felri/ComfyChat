import { useCallback, useState, useRef } from "react";
import { storeManager } from "../../store/storageManager";
import { useConfigStore } from "../../store/useConfigStore";
import { Handle, Position } from "reactflow";
import Container from "../Common/container";
import TextArea from "../Common/textarea";
import Tooltip from "../Common/tooltip";
import PropTypes from "prop-types";
import { voices, languages } from "../../store/utils/constants";
import Dropdown from "../Common/dropdown";
import TextInput from "../Common/text";

function TTSInput({ id, data }) {
  const nodeRef = useRef(null);
  const store = storeManager.getSelectedStore();
  const { openAIInstance, voice, updateStore, language, speed } =
    useConfigStore(
      ({ openAIInstance, voice, updateStore, language, speed }) => ({
        openAIInstance,
        voice,
        updateStore,
        speed,
        language,
      })
    );
  const { onDataTextUpdate, onUserInputSend } = store(
    useCallback(({ onDataTextUpdate, onUserInputSend }) => {
      return {
        onDataTextUpdate,
        onUserInputSend,
      };
    }, [])
  );

  const [text, setText] = useState(data.text);

  const onChange = (e) => {
    setText(e.target.value);
    onDataTextUpdate(e.target.value, id);
  };

  const onEnter = (e) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      openAIInstance &&
      text.trim().length > 0
    ) {
      // get the width and height via bounding client rect
      const height = nodeRef.current.getBoundingClientRect().height;
      onUserInputSend(id, height, "ttsOutput", "tts");
    }
  };

  const onSend = () => {
    if (openAIInstance && text.trim().length > 0) {
      // get the width and height via bounding client rect
      const height = nodeRef.current.getBoundingClientRect().height;
      onUserInputSend(id, height, "ttsOutput", "tts");
    }
  };

  const placeHolderText = openAIInstance
    ? `The text to be spoken, Enter to send, Shift + Enter new line`
    : "Please add an API key";

  return (
    <Container title="Input" innerRef={nodeRef} id={id} className="w-[800px]">
      <TextArea
        id={id}
        disabled={!openAIInstance}
        label=""
        placeholder={placeHolderText}
        value={text}
        rows={16}
        cols={65}
        name="text"
        onChange={onChange}
        onKeyDown={onEnter}
        autoFocus={true}
      />
      <div className="flex space-x-4">
        <div className="w-1/3">
          <Dropdown
            onClick={() => {}}
            label="Voice"
            type="text"
            disabled={!openAIInstance}
            options={voices}
            name="voice"
            value={voice}
            onChange={(e) => {
              updateStore("voice", e.target.value);
            }}
          />
          <span className="text-xs text-gray-400">
            You can hear the voices{" "}
            <a
              href="https://platform.openai.com/docs/guides/text-to-speech/voice-options"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500"
            >
              here
            </a>
            .
          </span>
        </div>
        <div className="w-1/3">
          <Dropdown
            onClick={() => {}}
            label="Output Language"
            type="text"
            disabled={!openAIInstance}
            options={Object.keys(languages)}
            name="language"
            value={language}
            onChange={(e) => {
              updateStore("language", e.target.value);
            }}
          />
        </div>
        <div className="w-1/3">
          <TextInput
            label="Speed (0.25-4.0)"
            onChange={(e) => {
              updateStore(e.target.name, e.target.value);
            }}
            value={speed}
            name="speed"
            type="number"
            min="0.25"
            max="4"
          />
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Top} />

      <div className="flex items-start justify-end space-x-4">
        <div>
          <Tooltip
            position="bottom-full"
            text="The transcriptions API takes as input the audio file you want to transcribe and the desired output file format for the transcription of the audio."
          >
            <button
              disabled={!openAIInstance}
              className={`border-2 border-gray-500 rounded-md whitespace-nowrap ${
                !openAIInstance ? "opacity-50" : ""
              }`}
              onClick={onSend}
            >
              <span>Speak</span>
            </button>
          </Tooltip>
        </div>
      </div>
    </Container>
  );
}

TTSInput.propTypes = {
  data: PropTypes.shape({
    text: PropTypes.string,
    id: PropTypes.string,
    quantity: PropTypes.number,
  }),
  id: PropTypes.string,
};

export default TTSInput;
