import { useEffect, useState, useCallback } from "react";
import { useStore } from "../../store";
import { Handle, Position } from "reactflow";
import Container from "../Common/container";
import MarkdownIt from "markdown-it";

function ChatOutputNode({ data }) {
  const { openAIInstance, openAIConfig } = useStore(
    useCallback((state) => state, [])
  );
  const [streamContent, setStreamContent] = useState("");
  const md = new MarkdownIt();

  useEffect(() => {
    async function fetchStreamData() {
      try {
        const stream = await openAIInstance.chat.completions.create({
          model: openAIConfig.engine,
          temperature: openAIConfig.temperature,
          messages: data.messages,
          stream: true,
        });

        for await (const chunk of stream) {
          let content = chunk.choices[0]?.delta?.content || "";
          let markdownContent = md.render(content);
          setStreamContent((prevContent) => prevContent + markdownContent);
        }
      } catch (error) {
        console.error("Error streaming data:", error);
      }
    }

    fetchStreamData();
  }, [data.messages, openAIInstance]);

  return (
    <Container>
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Top} />
      <div dangerouslySetInnerHTML={{ __html: streamContent }} />
    </Container>
  );
}

export default ChatOutputNode;
