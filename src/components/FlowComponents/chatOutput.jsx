import { useEffect, useState, useCallback, useRef } from "react";
import { storeManager, useConfigStore } from "../../store";
import { Handle, Position } from "reactflow";
import { useReactFlow } from "reactflow";
import Container from "../Common/container";
import TextArea from "../Common/textarea";
import { HiOutlineTrash } from "react-icons/hi2";
import hljs from "highlight.js";
import { IoIosAdd } from "react-icons/io";
import PropTypes from "prop-types";
import { IoStopCircleOutline } from "react-icons/io5";
import { FaEdit, FaSave } from "react-icons/fa";

import "highlight.js/styles/github-dark.css"; // Or any other style you prefer

function ChatOutputNode({ id, data }) {
  const containerRef = useRef(null);
  const store = storeManager.getSelectedStore();
  const abortRef = useRef(false);

  const { lockViewInOutput, textModel, openAIInstance } = useConfigStore(
    (state) => ({
      lockViewInOutput: state.lockViewInOutput,
      textModel: state.textModel,
      openAIInstance: state.openAIInstance,
    })
  );

  const {
    temperature,
    getHistory,
    updateChildrenPosition,
    onDataTextUpdate,
    deleteUserNode,
    createNewInputNode,
  } = store(useCallback((state) => state, []));
  const [streamContent, setStreamContent] = useState("");
  const [currentHeight, setCurrentHeight] = useState(520);
  const [streaming, setStreaming] = useState(false);
  const [editing, setEditing] = useState(false);
  const { setViewport, getViewport } = useReactFlow();

  function escapeHtml(html) {
    return html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function processSingleBacktickLine(line) {
    const regex = /`([^`]+)`/g;
    return (
      "<p class='mt-3 chatoutput nodrag'>" +
      escapeHtml(line).replace(
        regex,
        "<span class='font-bold bg-gray-700 p-1 rounded'>$1</span>"
      ) +
      "</p>\n"
    );
  }

  function formatStreamContent(text) {
    const backticks = "```";
    let inCodeBlock = false;
    let language = "";
    let formattedText = "";
    let codeContent = "";

    for (const line of text.split("\n")) {
      if (line.startsWith(backticks)) {
        if (inCodeBlock) {
          // End of a code block
          formattedText += `<div class="p-1 px-2 bg-black rounded-t flex items-center justify-start text-white">${language}</div><pre><code class="${language} chatoutput nodrag">${escapeHtml(
            codeContent
          )}</code></pre>\n`;
          inCodeBlock = false;
          codeContent = "";
        } else {
          // Start of a code block
          inCodeBlock = true;
          language = line.substring(backticks.length).trim();
        }
      } else if (inCodeBlock) {
        codeContent += line + "\n";
      } else {
        formattedText += processSingleBacktickLine(line);
      }
    }

    // Handle case where stream ends but code block is not closed
    if (inCodeBlock) {
      formattedText += `<pre><code class="${language} chatoutput nodrag">${escapeHtml(
        codeContent
      )}</code></pre>\n`;
    }

    return formattedText;
  }

  useEffect(() => {
    async function fetchStreamData() {
      try {
        if (!openAIInstance) {
          setStreamContent("Something went wrong, please check your API key");
          return;
        }
        const history = getHistory(id);
        setStreaming(true);
        const stream = await openAIInstance.chat.completions.create({
          model: textModel,
          temperature: Number(parseFloat(temperature)),
          messages: history,
          stream: true,
        });
        let current = "";
        for await (const chunk of stream) {
          if (abortRef.current) {
            setStreaming(false);
            break;
          }
          let content = chunk.choices[0]?.delta?.content || "";
          setStreamContent((prevContent) => {
            current = prevContent + content;
            return prevContent + content;
          });
        }
        onDataTextUpdate(current, id);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error streaming data:", error);
        }
      }
      setStreaming(false);
    }

    if (data.text.trim().length && streamContent.trim().length === 0) {
      setStreamContent((prevContent) => prevContent + data.text);
      return;
    }

    fetchStreamData();
  }, []);

  useEffect(() => {
    hljs.highlightAll();
  }, [streaming, editing, streamContent]);

  const stopStreaming = () => {
    abortRef.current = true;
  };

  useEffect(() => {
    let childId = parseInt(id) + 1;
    childId = childId.toString();
    const height = containerRef.current?.offsetHeight || 0;
    if (height > currentHeight) {
      const diff = height - currentHeight;
      setCurrentHeight(height);
      if (streaming) {
        updateChildrenPosition(childId, diff);
        if (lockViewInOutput) {
          const viewport = getViewport();
          // Modify the y position to account for the height difference
          const newY = viewport.y - (diff * 1.2);
          setViewport({ ...viewport, y: newY }, { duration: 100 });
        }
      }
    }
  }, [streamContent]);

  const handleEditSave = () => {
    setEditing(false);
    onDataTextUpdate(streamContent, id);
  };

  return (
    <Container
      innerRef={containerRef}
      title="Output"
      className="w-[800px] min-h-[520px] overflow-y-scroll flex items-left justify-start overflow-hidden pb-10 relative"
      id={id}
    >
      <div className="absolute top-1 right-1 hover:cursor-pointer">
        {streaming ? (
          <IoStopCircleOutline
            size={25}
            className="hover:cursor-pointer"
            onClick={stopStreaming}
          />
        ) : (
          <HiOutlineTrash
            opacity={0.7}
            size={20}
            onClick={() => deleteUserNode(id)}
          />
        )}
      </div>
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center justify-end absolute top-1 left-1 cursor-pointer">
        {editing ? (
          <FaSave
            size={20}
            className="hover:cursor-pointer"
            onClick={handleEditSave}
          />
        ) : (
          <FaEdit
            size={20}
            className="hover:cursor-pointer"
            onClick={() => setEditing(true)}
          />
        )}
      </div>

      {editing ? (
        <TextArea
          id={id}
          label=""
          value={streamContent}
          cols={65}
          name="text"
          onChange={(evt) => setStreamContent(evt.target.value)}
          autoFocus
        />
      ) : (
        <div
          dangerouslySetInnerHTML={{
            __html: formatStreamContent(streamContent),
          }}
          className="w-full h-full"
        />
      )}
      <div className="flex justify-end items-center absolute bottom-0 right-0 w-full h-10 cursor-pointer">
        <IoIosAdd
          size={30}
          className="hover:cursor-pointer"
          onClick={() => createNewInputNode(id, currentHeight)}
        />
      </div>
    </Container>
  );
}

ChatOutputNode.propTypes = {
  id: PropTypes.string,
  data: PropTypes.shape({
    text: PropTypes.string,
    id: PropTypes.string,
    quantity: PropTypes.number,
  }),
};

export default ChatOutputNode;
