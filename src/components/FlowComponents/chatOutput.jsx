import { useEffect, useState, useCallback, useRef } from "react";
import { storeManager } from "../../store";
import { Handle, Position } from "reactflow";
import Container from "../Common/container";
import { HiOutlineTrash } from "react-icons/hi2";
import hljs from "highlight.js";
import { IoIosAdd } from "react-icons/io";
import PropTypes from "prop-types";
import { IoStopCircleOutline } from "react-icons/io5";

import "highlight.js/styles/atom-one-dark.css"; // Or any other style you prefer

function ChatOutputNode({ id, data }) {
  const containerRef = useRef(null);
  const store = storeManager.getSelectedStore();
  const abortRef = useRef(false);

  const {
    temperature,
    textModel,
    openAIInstance,
    getHistory,
    updateChildrenPosition,
    onDataTextUpdate,
    deleteUserNode,
    createNewInputNode,
  } = store(useCallback((state) => state, []));
  const [streamContent, setStreamContent] = useState("");
  const [currentHeight, setCurrentHeight] = useState(520);
  const [streaming, setStreaming] = useState(false);

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
          formattedText += `<pre><code class="${language} chatoutput nodrag">${escapeHtml(
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
        const history = getHistory(data.id);
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
        onDataTextUpdate(current, data.id);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error streaming data:", error);
        }
      }
      setStreaming(false);
    }

    if (data.text.trim().length) {
      setStreamContent((prevContent) => prevContent + data.text);
      return;
    }

    fetchStreamData();
  }, []);

  const stopStreaming = () => {
    abortRef.current = true;
  };

  useEffect(() => {
    hljs.highlightAll();
    let childId = parseInt(data.id) + 1;
    childId = childId.toString();
    const height = containerRef.current?.offsetHeight || 0;
    if (height > currentHeight) {
      const diff = height - currentHeight;
      setCurrentHeight(height);
      updateChildrenPosition(childId, diff);
    }
  }, [streamContent]);

  return (
    <Container
      innerRef={containerRef}
      title="Output"
      className="w-[750px] min-h-[520px] overflow-y-scroll flex items-left justify-start overflow-hidden pb-10"
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
      <div
        dangerouslySetInnerHTML={{ __html: formatStreamContent(streamContent) }}
        className=" w-full h-full"
      />
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
