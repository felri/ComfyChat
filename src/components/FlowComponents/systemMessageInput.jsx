// a flow node component that is used as a text input, it uses the textInput component

import { useCallback } from "react";
import { useStore } from "../../store";
import { Handle, Position } from "reactflow";
import Container from "../Common/container";
import TextArea from "../Common/textarea";
import { IoIosAdd } from "react-icons/io";

function SystemMessageNode() {
  const { updateOpenAIConfig, openAIConfig, createNewInputNode, nodes } = useStore(
    useCallback((state) => state, [])
  );

  const onChange = useCallback(
    (e) => {
      updateOpenAIConfig({ systemMessage: e.target.value });
    },
    [updateOpenAIConfig]
  );

  return (
    <Container title="System Message" className="pb-10" id="2">
      <TextArea
        label="Text"
        rows={7}
        cols={45}
        name="text"
        onChange={onChange}
        value={openAIConfig.systemMessage}
      />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Left} />
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

export default SystemMessageNode;
