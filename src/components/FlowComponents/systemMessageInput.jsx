// a flow node component that is used as a text input, it uses the textInput component

import { useCallback } from "react";
import { useStore } from "../../store";
import { Handle, Position } from "reactflow";
import Container from "../Common/container";
import TextArea from "../Common/textarea";

function SystemMessageNode() {
  const { updateOpenAIConfig, openAIConfig } = useStore(
    useCallback((state) => state, [])
  );

  const onChange = useCallback(
    (e) => {
      updateOpenAIConfig({ systemMessage: e.target.value });
    },
    [updateOpenAIConfig]
  );

  return (
    <Container title="System Message">
      <TextArea
        label="Text"
        rows={7}
        cols={45}
        name="text"
        onChange={onChange}
        value={openAIConfig.systemMessage}
      />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Top} />
    </Container>
  );
}

export default SystemMessageNode;
