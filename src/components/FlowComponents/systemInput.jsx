import { useCallback } from "react";
import { storeManager, useConfigStore } from "../../store";
import { Handle, Position } from "reactflow";
import Container from "../Common/container";
import TextArea from "../Common/textarea";
import Dropdown from "../Common/dropdown";
import { IoIosAdd } from "react-icons/io";
import PropTypes from "prop-types";
import TextInput from "../Common/text";

import {
  visionModels,
  textModels,
  imageModels,
  ttsModels,
  sttModels,
} from "../../store/defaultModels";

function selectModel(type) {
  switch (type) {
    case "vision":
      return visionModels;
    case "text":
      return textModels;
    case "image":
      return imageModels;
    case "tts":
      return ttsModels;
    case "stt":
      return sttModels;
    default:
      return textModels;
  }
}

function getModelType(type) {
  switch (type) {
    case "text":
      return "textModel";
    case "vision":
      return "visionModel";
    case "image":
      return "imageModel";
    case "tts":
      return "TTSModel";
    case "stt":
      return "STTModel";
    default:
      return "textModel";
  }
}

function SystemMessageNode({ id, data }) {
  const store = storeManager.getSelectedStore();
  const dropdownData = selectModel(data.type);
  const {
    updateStore,
    textModel,
    visionModel,
    imageModel,
    TTSModel,
    STTModel,
  } = useConfigStore((state) => state);
  const { createNewInputNode, onDataTextUpdate, temperature, updateStore: updateStoreNode  } = store(
    useCallback((state) => state, [])
  );

  const defaultDropdownValue = () => {
    switch (data.type) {
      case "text":
        return textModel;
      case "vision":
        return visionModel;
      case "image":
        return imageModel;
      case "tts":
        return TTSModel;
      case "stt":
        return STTModel;
      default:
        return textModel;
    }
  };

  const onChange = useCallback(
    (e) => {
      updateStore(getModelType(data.type), e.target.value);
    },
    [updateStore]
  );

  const onTemperatureChange = useCallback(
    (e) => {
      updateStoreNode(e.target.name, e.target.value);
    },
    [updateStore]
  );

  const onDataUpdate = useCallback(
    (e) => {
      onDataTextUpdate(e.target.value, id);
    },
    [onDataTextUpdate, id]
  );

  return (
    <Container title="System Message" className="pb-10 w-[600px]" id="2">
      <Dropdown
        label="Model"
        name="type"
        onChange={onChange}
        value={defaultDropdownValue()}
        options={dropdownData}
      />
      <div className="h-1" />

      <span className="text-xs text-gray-400">
        You can read about the models{" "}
        <a
          href="https://platform.openai.com/docs/models"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500"
        >
          here
        </a>
        .
      </span>
      <div className="h-2" />
      <TextInput
        label="Temperature"
        placeholder="Enter the temperature"
        onChange={onTemperatureChange}
        value={temperature}
        name="temperature"
        type="number"
        min="0"
        max="1"
      />
      <TextArea
        placeholder="Enter your message and examples here"
        label="Message"
        rows={7}
        cols={45}
        name="text"
        onChange={onDataUpdate}
        value={data.text}
      />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Top} />
      <div className="flex justify-center items-center absolute bottom-0 right-0 w-10 h-10 cursor-pointer">
        <IoIosAdd
          size={30}
          className="hover:cursor-pointer"
          onClick={() => createNewInputNode("2")}
        />
      </div>
    </Container>
  );
}

SystemMessageNode.propTypes = {
  id: PropTypes.string,
  data: PropTypes.shape({
    text: PropTypes.string,
    type: PropTypes.string,
  }),
  position: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
  }),
};

export default SystemMessageNode;
