import { useCallback } from "react";
import { useStore } from "../../store";
import { Handle, Position } from "reactflow";
import Container from "../Common/container";
import TextInput from "../Common/text";
import Dropdown from "../Common/dropdown";

const openAIModels = [
  "gpt-4",
  "gpt-3.5-turbo-0613",
  "gpt-3.5-turbo-0301",
  "gpt-4-0314",
  "gpt-4-32k-0314",
  "gpt-4-1106-preview",
  "gpt-4-vision-preview",
  "gpt-4-32k",
  "gpt-4-0613",
  "gpt-4-32k-0613",
];

function OpenAIConfigNode() {
  const { openAIConfig, updateOpenAIConfig, updateOpenAIKey } = useStore(
    (state) => state
  );

  const onChange = useCallback(
    (e) => {
      updateOpenAIConfig({ [e.target.name]: e.target.value });
    },
    [updateOpenAIConfig]
  );

  const onChangeKey = useCallback(
    (e) => {
      const key = e.target.value;
      if (key.length !== 0) {
        updateOpenAIKey({ apiKey: key });
        return;
      }
    },
    [updateOpenAIConfig]
  );

  return (
    <Container title="OpenAI Config">
      <TextInput
        label="API Key"
        placeholder="Enter your API key"
        onChange={onChangeKey}
        value={openAIConfig.apiKey}
        name="apiKey"
      />
      <span className="text-xs text-gray-400">
        You can get your API key {" "}
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
      <Dropdown
        label="Engine"
        onChange={onChange}
        value={openAIConfig.engine}
        name="engine"
        options={openAIModels}
      />
      <TextInput
        label="Temperature"
        placeholder="Enter the temperature"
        onChange={onChange}
        value={openAIConfig.temperature}
        name="temperature"
        type="number"
      />
      <Handle type="source" position={Position.Right} id="a" />
    </Container>
  );
}

export default OpenAIConfigNode;
