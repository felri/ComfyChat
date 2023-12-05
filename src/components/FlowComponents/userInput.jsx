// a flow node component that is used as a text input, it uses the textInput component

import { useCallback, useState, useRef } from "react";
import { useStore } from "../../store";
import { Handle, Position, useReactFlow } from "reactflow";
import Container from "../Common/container";
import TextArea from "../Common/textarea";
import { IoMdSend } from "react-icons/io";

function UserInputNode({ data }) {
  const nodeRef = useRef(null);

  const {
    onUpdateUserInput,
    onUpdateUserQuantity,
    onSendUserInput,
    openAIInstance,
  } = useStore(useCallback((state) => state, []));

  const [id] = useState(data.id);
  const [text, setText] = useState(data.text);
  const [quantity, setQuantity] = useState(data.quantity);

  const onChange = (e) => {
    setText(e.target.value);
    onUpdateUserInput(e.target.value, id);
  };

  const onEnter = (e) => {
    if (e.key === "Enter" && e.shiftKey && openAIInstance && text.length > 0) {
      // get the width and height via bounding client rect
      const height = nodeRef.current.getBoundingClientRect().height;
      onSendUserInput(id, height);
    }
  };

  const onChangeQuantity = (e) => {
    setQuantity(e.target.value);
    onUpdateUserQuantity(e.target.value, id);
  };

  return (
    <Container title="User Input" innerRef={nodeRef}>
      <TextArea
        disabled={openAIInstance == null}
        label=""
        placeholder={
          openAIInstance ? "Shift + Enter to send" : "Please add an API key"
        }
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
        {/* <p className="text-gray-500 text-sm mr-2">How many times?</p>
        <input
          disabled={openAIInstance == null}
          type="number"
          min="1"
          max="10"
          value={quantity}
          onChange={onChangeQuantity}
          className="border border-gray-300 rounded-md w-14 h-8 px-2 text-right"
        /> */}
        <IoMdSend
          className="text-2xl text-gray-500 cursor-pointer"
          onClick={() => onSendUserInput(id, nodeRef?.current?.getBoundingClientRect().width)}
        />
      </div>
    </Container>
  );
}

export default UserInputNode;
