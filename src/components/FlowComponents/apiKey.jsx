import { useEffect, useRef } from "react";
import { storeManager, useConfigStore } from "../../store";
import { Handle, Position } from "reactflow";
import Container from "../Common/container";
import TextInput from "../Common/text";
import { IoMdText } from "react-icons/io";
import { FaEye } from "react-icons/fa";
import { AiOutlineSound } from "react-icons/ai";
import { BsSoundwave } from "react-icons/bs";
import { CiImageOn } from "react-icons/ci";
import PropTypes from "prop-types";

const buttons = [
  {
    icon: <IoMdText size={20} />,
    label: "Chat",
    type: "text",
  },
  // {
  //   icon: <FaEye size={20} />,
  //   label: "Vision",
  //   type: "vision",
  // },
  // {
  //   icon: <CiImageOn size={20} />,
  //   label: "Create Image",
  //   type: "image",
  // },
  {
    icon: <BsSoundwave size={20} />,
    label: "Speech to Text",
    type: "stt",
  },
  {
    icon: <AiOutlineSound size={20} />,
    label: "Text to Speech",
    type: "tts",
  },
];

function IconButton({ icon, onClick, label, type, disabled }) {
  return (
    <button
      disabled={disabled}
      className="flex w-1/3 flex-col items-center justify-center h-16 rounded  hover:bg-gray-800 p-1 cursor-pointer text-center disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={() => onClick(type)}
    >
      {icon}
      <span className="text-xs mt-1 h-10">{label}</span>
    </button>
  );
}

IconButton.propTypes = {
  icon: PropTypes.element,
  onClick: PropTypes.func,
  label: PropTypes.string,
  type: PropTypes.string,
  disabled: PropTypes.bool,
};

function ApiKeyNode({ id }) {
  const nodeRef = useRef(null);
  const store = storeManager.getSelectedStore();
  const { apiKey, setApiKey, createOpenAIInstance } = useConfigStore(
    (state) => state
  );
  const { onChooseType } = store((state) => state);

  const onChange = (e) => {
    setApiKey(e.target.value);
    if (e.target.value.length === 0) {
      store((state) => {
        state.openAIInstance = null;
      });
    }

    if (e.target.value.length > 0) {
      createOpenAIInstance();
    }
  };

  useEffect(() => {
    if (!apiKey || apiKey.length === 0) return;
    async function createInstance() {
      await createOpenAIInstance();
    }
    createInstance();
  }, [apiKey, createOpenAIInstance]);

  return (
    <Container title="OpenAI Config">
      <div ref={nodeRef}>
        <TextInput
          type="text"
          label="API Key"
          placeholder="Enter your API key"
          onChange={onChange}
          value={apiKey}
          name="apiKey"
        />
        <span className="text-xs text-gray-400">
          You can get your API key{" "}
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500"
          >
            here
          </a>
          .
        </span>

        <p className="w-full pt-4 text-center text-gray-400 text-sm">
          Select a service to start
        </p>
        <div className="flex justify-center items-center space-x-4 mt-2">
          {buttons.map((button) => (
            <IconButton
              disabled={apiKey.length === 0}
              key={button.label}
              icon={button.icon}
              label={button.label}
              onClick={() =>
                onChooseType(id, button.type, 290)
              }
            />
          ))}
        </div>

        <Handle type="source" position={Position.Bottom} id="a" />
      </div>
    </Container>
  );
}

ApiKeyNode.propTypes = {
  id: PropTypes.string,
};

export default ApiKeyNode;
