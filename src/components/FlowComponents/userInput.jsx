// a flow node component that is used as a text input, it uses the textInput component

import { useCallback, useState } from "react";
import { useStore } from "../../store";
import { Handle, Position } from "reactflow";
import Container from "../Common/container";
import TextArea from "../Common/textarea";
import { IoMdSend } from "react-icons/io";

function UserInputNode({ data }) {
  const { onUpdateUserInput, onUpdateUserQuantity, onSendUserInput } = useStore(
    useCallback((state) => state, [])
  );

  const [text, setText] = useState(data.text);
  const [quantity, setQuantity] = useState(data.quantity);

  const onChange = (e) => {
    setText(e.target.value);
    onUpdateUserInput(e.target.value, data.id);
  };

  const onEnter = (e) => {
    if (e.key === "Enter" && e.shiftKey) {
      onSendUserInput(data.id);
    }
  }

  const onChangeQuantity = (e) => {
    setQuantity(e.target.value);
    onUpdateUserQuantity(e.target.value, data.id);
  };

  return (
    <Container title="User Input">
      <TextArea
        label="Text"
        placeholder="Shift + Enter to send"
        value={text}
        rows={13}
        cols={45}
        name="text"
        onChange={onChange}
        onKeyDown={onEnter}
      />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Top} />

      <div className="flex w-full justify-end pt-2">
        <p className="text-gray-500 text-sm mr-2">Quantity</p>
        <input
          type="number"
          min="1"
          max="10"
          value={quantity}
          onChange={onChangeQuantity}
          className="border border-gray-300 rounded-md w-14 h-8 px-2 text-right"
        />
        <IoMdSend
          className="text-2xl text-gray-500 cursor-pointer"
          onClick={() => onSendUserInput(data.id)}
        />
      </div>
    </Container>
  );
}

export default UserInputNode;
