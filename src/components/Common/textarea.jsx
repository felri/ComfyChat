// text area component that can be used in the flow editor

import { useCallback, useRef, useEffect } from "react";
import TextareaAutosize from 'react-textarea-autosize';

function TextArea({
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

  // auto focus the text area when it is first rendered
  // this is used in the flow editor
  useEffect(() => {
    if (autoFocus) {
      textRef.current.focus();
    }
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
