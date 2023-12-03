import { useState, useCallback, useMemo, useEffect } from "react";
import ReactFlow, { useReactFlow, Background } from "reactflow";
import { useStore, getLayoutedElements } from "../../store";
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
});

function Flow() {
  const { fitView } = useReactFlow();
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useStore(
    selector,
    (state, next) => {
      return (
        state.nodes === next.nodes &&
        state.edges === next.edges &&
        state.onNodesChange === next.onNodesChange &&
        state.onEdgesChange === next.onEdgesChange &&
        state.onConnect === next.onConnect
      );
    }
  );

  const nodeTypes = useMemo(
    () => ({
      openAIConfig: OpenAIConfigNode,
      userInput: UserInputNode,
      systemMessageInput: SystemMessageInput,
      chatOutput: ChatOutputNode,
    }),
    []
  );

  const onLayout = useCallback(
    (direction) => {
      const layouted = getLayoutedElements(nodes, edges, { direction });

      onNodesChange(layouted.nodes);
      onEdgesChange(layouted.edges);

      window.requestAnimationFrame(() => {
        fitView();
      });
    },
    [nodes, edges]
  );

  // onLayout when the component mounts
  useEffect(() => {
    onLayout("TB");
  }, []);

  return (
    <div className="w-screen h-screen">
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
      >
        <Background />
      </ReactFlow>
    </div>
  );
}

export default Flow;
