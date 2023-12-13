import { useState, useEffect, useCallback } from "react";
import ReactFlow, { useReactFlow, Background, Panel } from "reactflow";
import { storeManager, useConfigStore } from "../../store";
import { HiOutlineTrash } from "react-icons/hi2";
import "reactflow/dist/style.css";
import Tooltip from "../Common/tooltip";
import { CiFileOn } from "react-icons/ci";
import { FaGithub } from "react-icons/fa";
import ApiKeyNode from "./apiKey";
import FFMpegNode from "./ffmpegNode";
import UserInputNode from "./userInput";
import SttOutputNode from "./sttOutput";
import SystemMessageInput from "./systemInput";
import DropFilesNode from "./dropFiles";
import Controls from "./controls";
import EditorNode from "./mediaEditor";
import ChatOutputNode from "./chatOutput";
import History from "../Common/history";

const selectedSelector = (state) => ({
  selectedStoreId: state.selectedStoreId,
  setSelectedStoreId: state.setSelectedStoreId,
});

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  openAIConfig: state.openAIConfig,
  createOpenAIInstance: state.createOpenAIInstance,
  deleteChatNode: state.deleteChatNode,
  resetStore: state.resetStore,
  cleanEmptyEdges: state.cleanEmptyEdges,

});

const nodeTypes = {
  text: UserInputNode,
  systemMessage: SystemMessageInput,
  chatOutput: ChatOutputNode,
  apiKey: ApiKeyNode,
  stt: DropFilesNode,
  editor: EditorNode,
  ffmpeg: FFMpegNode,
  sttOutput: SttOutputNode,
};

function Flow() {
  const { fitView, setViewport, getViewport } = useReactFlow();
  const { apiKey, createOpenAIInstance, openAIInstance } = useConfigStore(
    (state) => state
  );
  const { selectedStoreId, setSelectedStoreId } =
    useConfigStore(selectedSelector);
  const store = storeManager.getSelectedStore();
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    deleteChatNode,
    resetStore,
  } = store(selector, (state, next) => {
    return (
      state.nodes === next.nodes &&
      state.edges === next.edges &&
      state.defaultTemperature === next.defaultTemperature &&
      state.onNodesChange === next.onNodesChange &&
      state.onEdgesChange === next.onEdgesChange &&
      state.onConnect === next.onConnect &&
      state.openAIConfig === next.openAIConfig &&
      state.createOpenAIInstance === next.createOpenAIInstance &&
      state.deleteChatNode === next.deleteChatNode &&
      state.resetStore === next.resetStore &&
      state.cleanEmptyEdges === next.cleanEmptyEdges
    );
  });
  const [currentNodeLength, setCurrentNodeLength] = useState(nodes?.length);

  useEffect(() => {
    if (nodes.length === currentNodeLength) return;
    const sliceSize = nodes.length < currentNodeLength ? -3 : -2;
    setCurrentNodeLength(nodes.length);
    fitView({
      nodes: nodes.slice(sliceSize),
      duration: 500,
    });
  }, [nodes, currentNodeLength, fitView]);

  useEffect(() => {
    if (!apiKey || apiKey.length === 0 || !selectedStoreId || !!openAIInstance)
      return;
    async function createInstance() {
      await createOpenAIInstance(apiKey);
    }
    createInstance();
  }, [apiKey, createOpenAIInstance, openAIInstance, selectedStoreId]);

  const updateScene = (id) => {
    setSelectedStoreId(id);
  };

  const createNewChatPage = () => {
    storeManager.createNewStore();
  };

  const onNodesDelete = (nodesDeleted) => {
    deleteChatNode(nodesDeleted, nodes, edges);
  };

  const handleKeyPress = useCallback(
    (e) => {
      if (e.ctrlKey && e.code === "Space") {
        const lastNode = nodes[nodes.length - 1];
        // Calculate the center X position of the last node
        const nodeCenterX = lastNode.position.x + lastNode.width / 2;

        // Calculate the desired new X position of the viewport
        // This will align the center of the viewport with the center of the last node
        const newX = window.innerWidth / 2 - nodeCenterX;

        // Calculate the bottom Y of the last node
        const nodeBottom = lastNode.position.y + lastNode.height;

        // Get the current viewport
        const viewport = getViewport();

        // Calculate the desired new Y position of the viewport
        // This will align the bottom of the viewport with the bottom of the last node
        const newY = window.innerHeight - nodeBottom;

        // Apply the adjustment if there is a significant change
        if (
          Math.abs(viewport.x - newX) > 1 ||
          Math.abs(viewport.y - newY) > 1
        ) {
          setViewport({ x: newX, y: newY, zoom: 1 }, { duration: 200 });
        }
      }
      // create new chat page
      // control + shift + n
      if (e.shiftKey && e.code === "KeyN") {
        createNewChatPage();
      }
    },
    [getViewport, nodes, setViewport]
  );

  // listen for keypresses control + space and focus one the last node
  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <div className="w-screen h-screen" key={selectedStoreId}>
      <ReactFlow
        panOnScroll
        onNodesDelete={onNodesDelete}
        nodeTypes={nodeTypes}
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        minZoom={0.1}
        maxZoom={1}
        zoomActivationKeyCode="Space"
      >
        <Panel position="top-left" className="cursor-pointer">
          <Tooltip text="New chat">
            <CiFileOn
              onClick={createNewChatPage}
              size={35}
              className="mb-1 hover:text-red-500 transition-colors duration-300 ease-in-out"
            />
          </Tooltip>
          <History
            updateScene={updateScene}
            currentId={selectedStoreId}
            resetStore={resetStore}
          />
        </Panel>

        <Panel position="top-right">
          <div className="flex items-center space-y-3 w-full flex-col justify-end">
            <div className="flex items-center">
              <img src={"./logo.png"} alt="logo" className="w-6 mr-2 -ml-1" />
              <p className="text-white text-sm">ComfyChat</p>
            </div>
            <div className="flex justify-center items-start space-y-2 w-full h-1 flex-col">
            <a
              href="https://github.com/felri/ComfyChat"
              target="_blank"
              rel="noreferrer"
              className="flex items-center text-white decoration-none hover:text-white"
            >
              <FaGithub className="mr-2 text-sm" />
              <p className="text-white text-sm hover:underline">Github</p>
            </a>
          </div>
          </div>
        </Panel>

        <Panel position="bottom-right" className="cursor-pointer">
          <Tooltip text="Delete all nodes" position="right-full">
            <HiOutlineTrash
              onClick={resetStore}
              size={35}
              className="hover:text-red-500 transition-colors duration-300 ease-in-out"
            />
          </Tooltip>
        </Panel>

        <Background />
        <Panel position="bottom-left">
          <Controls resetStore={resetStore} />
        </Panel>
      </ReactFlow>
    </div>
  );
}

export default Flow;
