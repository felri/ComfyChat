import { useState, useMemo, useEffect } from "react";
import ReactFlow, {
  useReactFlow,
  Background,
  Controls,
  Panel,
} from "reactflow";
import { storeManager, useSelectedStoreId } from "../../store";
import { FaGithub } from "react-icons/fa";
import "reactflow/dist/style.css";

// import OpenAIConfigNode from "./openaiConfig";
import ApiKeyNode from "./apiKey";
import UserInputNode from "./userInput";
import SystemMessageInput from "./systemMessageInput";
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
});

function Flow() {
  const { fitView } = useReactFlow();
  const { selectedStoreId, setSelectedStoreId } =
    useSelectedStoreId(selectedSelector);
  const store = storeManager.getSelectedStore();
  const {
    nodes,
    edges,
    apiKey,
    onNodesChange,
    onEdgesChange,
    deleteChatNode,
    createOpenAIInstance,
  } = store(selector, (state, next) => {
    return (
      state.nodes === next.nodes &&
      state.edges === next.edges &&
      state.apiKey === next.apiKey &&
      state.defaultTemperature === next.defaultTemperature &&
      state.onNodesChange === next.onNodesChange &&
      state.onEdgesChange === next.onEdgesChange &&
      state.onConnect === next.onConnect &&
      state.openAIConfig === next.openAIConfig &&
      state.createOpenAIInstance === next.createOpenAIInstance
    );
  });
  const [currentNodeLength, setCurrentNodeLength] = useState(nodes.length);

  // fitview when nodes change
  useEffect(() => {
    if (nodes.length === currentNodeLength) return;

    // if less than previous, fitview last three nodes
    if (nodes.length < currentNodeLength) {
      const lastThreeNodes = nodes.slice(-3);
      fitView({
        nodes: lastThreeNodes,
        duration: 500,
      });
      setCurrentNodeLength(nodes.length);
      return;
    }

    setCurrentNodeLength(nodes.length);
    const lastTwoNodes = nodes.slice(-2);
    fitView({
      nodes: lastTwoNodes,
      duration: 500,
    });
  }, [nodes]);

  useEffect(() => {
    if (!apiKey || apiKey.length === 0) return;
    async function createInstance() {
      await createOpenAIInstance();
    }
    createInstance();
  }, []);

  const nodeTypes = useMemo(
    () => ({
      // openAIConfig: OpenAIConfigNode,
      userInput: UserInputNode,
      systemMessage: SystemMessageInput,
      chatOutput: ChatOutputNode,
      apiKey: ApiKeyNode,
    }),
    []
  );

  const updateScene = (id) => {
    setSelectedStoreId(id);
  };

  const createNewChatPage = () => {
    storeManager.createNewStore();
  };

  const onNodesDelete = (nodesDeleted) => {
    deleteChatNode(nodesDeleted, nodes, edges);
  };

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
        <Panel position="top-left opacity-50">
          <div className="flex justify-center items-start space-y-2 w-full mb-2 flex-col hover:opacity-80 transition-opacity duration-300 ease-in-out">
            <div
              className="flex items-center cursor-pointer"
              onClick={createNewChatPage}
            >
              <img
                src={"./logo.png"}
                alt="logo"
                className="w-7 rounded-full  mr-2 -ml-1 bg-gray-600 p-1"
              />
              <p className="text-white">New chat +</p>
            </div>
          </div>
          <History updateScene={updateScene} />
        </Panel>

        <Panel position="top-right opacity-50">
          <div className="flex justify-center items-start space-y-2 w-full h-2 flex-col">
            <div className="flex items-center">
              <img src={"./logo.png"} alt="logo" className="w-6 mr-2 -ml-1" />
              <p className="text-white text-sm">ComfyChat</p>
            </div>
          </div>
        </Panel>

        <Panel position="bottom-right">
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
        </Panel>

        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export default Flow;
