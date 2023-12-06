// text area component that can be used in the flow editor

import { useCallback, useRef, useState } from "react";
import { useReactFlow } from "reactflow";
import TextareaAutosize from "react-textarea-autosize";

function TextArea({
  id,
  onChange,
  value,
  label = "Text",
  placeholder = "Enter some text",
  name = "text",
  autoFocus = false,
  ...props
}) {
  const textRef = useRef(null);

  const handleChange = useCallback((evt) => {
    onChange(evt);
  }, []);

  // focus on mouse enter
  // this is used in the flow editor
  const handleMouseEnter = useCallback(() => {
    if (autoFocus) {
      textRef.current.focus();
    }
  }, []);

  return (
    <div className="flex flex-col mt-2">
      <label htmlFor="text">{label}</label>
      <TextareaAutosize
        ref={textRef}
        autoFocus={autoFocus}
        onChange={handleChange}
        minRows={7}
        className="overflow-y-auto"
        value={value}
        name={name}
        placeholder={placeholder}
        onMouseEnter={handleMouseEnter}
        {...props}
      />
    </div>
  );
}

export default TextArea;
