// a flow node component that is used as a text input, it uses the textInput component

import { useCallback, useState, useRef, useEffect } from "react";
import { storeManager } from "../../store";
import { Handle, Position } from "reactflow";
import Container from "../Common/container";
import TextArea from "../Common/textarea";
import { IoMdSend } from "react-icons/io";
import { HiOutlineTrash } from "react-icons/hi2";
import PropTypes from "prop-types";

function UserInputNode({ id, data }) {
  const nodeRef = useRef(null);
  const store = storeManager.getSelectedStore();
  const { onDataTextUpdate, onUserInputSend, openAIInstance, deleteUserNode } =
    store(useCallback((state) => state, []));

  const [text, setText] = useState(data.text);
  const [wordCount, setWordCount] = useState(0);

  const onChange = (e) => {
    setText(e.target.value);
    onDataTextUpdate(e.target.value, id);
  };

  function countWords(text) {
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

  useEffect(() => {
    console.log("userInputNode", !!openAIInstance);
  }, [openAIInstance]);

  const placeHolderText = openAIInstance
    ? id === "3"
      ? `Enter to send
Shift + Enter new line
Space + Scroll to zoom
+ button adds a new input node
`
      : "Message ChatGPT..."
    : "Please add an API key";

  return (
    <Container title="Input" innerRef={nodeRef} id={id} className="w-[750px]">
      <div className="absolute top-1 right-1 hover:cursor-pointer">
        <HiOutlineTrash
          opacity={0.7}
          size={20}
          onClick={() => deleteUserNode(id)}
        />
      </div>
      <TextArea
        id={id}
        disabled={!openAIInstance}
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

UserInputNode.propTypes = {
  data: PropTypes.shape({
    text: PropTypes.string,
    id: PropTypes.string,
    quantity: PropTypes.number,
  }),
  id: PropTypes.string,
};

export default UserInputNode;
