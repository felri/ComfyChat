// a flow node component that is used as a text input, it uses the textInput component

import { useCallback, useState, useRef, useEffect } from "react";
import { useStore } from "../../store";
import { Handle, Position, useReactFlow } from "reactflow";
import Container from "../Common/container";
import TextArea from "../Common/textarea";
import { IoMdSend } from "react-icons/io";
import { HiOutlineTrash } from "react-icons/hi2";

function UserInputNode({ data }) {
  const nodeRef = useRef(null);

  const { onUpdateUserInput, onUserInputSend, openAIInstance, deleteUserNode } =
    useStore(useCallback((state) => state, []));

  const [id] = useState(data.id);
  const [text, setText] = useState(data.text);
  const [wordCount, setWordCount] = useState(0);

  const onChange = (e) => {
    setText(e.target.value);
    onUpdateUserInput(e.target.value, id);
  };

  function countWords(text) {
    // count words, not including spaces
    return text.trim().split(/\s+/).length;
  }

  useEffect(() => {
    if (!data?.text?.length) {
      setWordCount(0);
      return;
    }
    setWordCount(countWords(data.text));
  }, [data.text]);

  const onEnter = (e) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      openAIInstance &&
      text.trim().length > 0
    ) {
      // get the width and height via bounding client rect
      const height = nodeRef.current.getBoundingClientRect().height;
      onUserInputSend(id, height);
    }
  };

  const placeHolderText = openAIInstance
    ? id === "3"
      ? `Enter to send
Shift + Enter new line
Scroll or drag to any direction
Shift + Scroll to zoom
+ button adds a new input node
`
      : "Message ChatGPT..."
    : "Please add an API key";

  return (
    <Container title="Input" innerRef={nodeRef} id={id}>
      <div className="absolute top-1 right-1 hover:cursor-pointer">
        <HiOutlineTrash
          opacity={0.7}
          size={20}
          onClick={() => deleteUserNode(id)}
        />
      </div>
      <TextArea
        id={id}
        disabled={openAIInstance == null}
        label=""
        placeholder={placeHolderText}
        value={text}
        rows={16}
        cols={65}
        name="text"
        onChange={onChange}
        onKeyDown={onEnter}
        autoFocus
      />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Top} />

      <div className="flex w-full justify-end pt-4 items-center space-x-2">
        <p className="text-gray-500 text-sm mr-2">Word Count: {wordCount}</p>

        <IoMdSend
          className="text-2xl text-gray-500 cursor-pointer"
          onClick={() =>
            onUserInputSend(id, nodeRef?.current?.getBoundingClientRect().width)
          }
        />
      </div>
    </Container>
  );
}

export default UserInputNode;
