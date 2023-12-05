import { useEffect, useState, useCallback, useRef } from "react";
import { useStore } from "../../store";
import { Handle, Position } from "reactflow";
import Container from "../Common/container";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css"; // Or any other style you prefer

function ChatOutputNode({ data }) {
  const containerRef = useRef(null);
  const {
    openAIInstance,
    openAIConfig,
    getHistory,
    updateChildrenPosition,
    onUpdateUserInput,
  } = useStore(useCallback((state) => state, []));
  const [streamContent, setStreamContent] = useState("");

  function escapeHtml(html) {
    return html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
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
          formattedText += `<pre><code class="${language}">${escapeHtml(
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
        formattedText += "<p class='mt-2'>" + escapeHtml(line) + "</p>\n";
      }
    }

    // Handle case where stream ends but code block is not closed
    if (inCodeBlock) {
      formattedText += `<pre><code class="${language}">${escapeHtml(
        codeContent
      )}</code></pre>\n`;
    }

    return formattedText;
  }

  useEffect(() => {
    async function fetchStreamData() {
      try {
        if (!openAIInstance) return;
        if (!openAIConfig || !openAIConfig.engine) return;
        const history = getHistory(data.id);
        console.log("history", history);
        const stream = await openAIInstance.chat.completions.create({
          model: openAIConfig.engine,
          temperature: Number(parseFloat(openAIConfig.temperature)),
          messages: history,
          stream: true,
        });
        let current = "";
        for await (const chunk of stream) {
          let content = chunk.choices[0]?.delta?.content || "";
          setStreamContent((prevContent) => {
            current = prevContent + content;
            return prevContent + content;
          });
        }
        onUpdateUserInput(current, data.id);

        // update node data text
      } catch (error) {
        console.error("Error streaming data:", error);
      }
    }

    fetchStreamData();
  }, []);

  useEffect(() => {
    hljs.highlightAll();
    let newId = parseInt(data.id) + 1;
    newId = newId.toString();
    const height = containerRef.current?.offsetHeight || 0;
    if (height > 520) {
      updateChildrenPosition(newId);
    }
  }, [streamContent]);

  return (
    <Container
      innerRef={containerRef}
      title="Chat Output"
      className="w-[720px] min-h-[520px] overflow-y-scroll flex items-left justify-start"
    >
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Top} />
      <div
        dangerouslySetInnerHTML={{ __html: formatStreamContent(streamContent) }}
        className=" w-full h-full"
      />
    </Container>
  );
}

export default ChatOutputNode;
