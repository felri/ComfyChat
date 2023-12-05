import { useState, useCallback, useMemo, useEffect } from "react";
import ReactFlow, { useReactFlow, Background } from "reactflow";
import { useStore } from "../../store";
import "reactflow/dist/style.css";

import OpenAIConfigNode from "./openaiConfig";
import UserInputNode from "./userInput";
import SystemMessageInput from "./systemMessageInput";
import ChatOutputNode from "./chatOutput";

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  openAIConfig: state.openAIConfig,
  createOpenAIInstance: state.createOpenAIInstance,
});

function Flow() {
  const { fitView } = useReactFlow();
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    openAIConfig,
    createOpenAIInstance,
  } = useStore(selector, (state, next) => {
    return (
      state.nodes === next.nodes &&
      state.edges === next.edges &&
      state.onNodesChange === next.onNodesChange &&
      state.onEdgesChange === next.onEdgesChange &&
      state.onConnect === next.onConnect
    );
  });
  const [currentNodeLength, setCurrentNodeLength] = useState(nodes.length);

  // fitview when nodes change
  useEffect(() => {
    if (nodes.length === currentNodeLength) return;
    setCurrentNodeLength(nodes.length);
    const lastTwoNodes = nodes.slice(-2);
    fitView({
      nodes: lastTwoNodes,
      duration: 500,
    });
  }, [nodes]);

  useEffect(() => {
    if (
      !openAIConfig ||
      !openAIConfig.apiKey ||
      openAIConfig.apiKey.length === 0
    )
      return;
    async function createInstance() {
      await createOpenAIInstance();
    }
    createInstance();
  }, []);

  const nodeTypes = useMemo(
    () => ({
      openAIConfig: OpenAIConfigNode,
      userInput: UserInputNode,
      systemMessageInput: SystemMessageInput,
      chatOutput: ChatOutputNode,
    }),
    []
  );

  return (
    <div className="w-screen h-screen">
      <ReactFlow
        panOnScroll
        nodeTypes={nodeTypes}
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        minZoom={0.1}
        maxZoom={2.5}
      >
        <Background />
      </ReactFlow>
    </div>
  );
}

export default Flow;
