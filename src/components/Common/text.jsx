// a text area component that can be used in the flow editor

import { useCallback } from "react";

function TextInput({
  onChange,
  value,
  type = "text",
  label = "Text",
  placeholder = "Enter some text",
  name = "text",
  ...props
}) {
  const handleChange = useCallback((evt) => {
    onChange(evt);
  }, []);

  return (
    <div className="flex flex-col">
      <label htmlFor="text">{label}</label>
      <input
        {...props}
        onChange={handleChange}
        className="nodrag"
        value={value}
        type={type}
        name={name}
        placeholder={placeholder}
        step="0.1"
      />
    </div>
  );
}

export default TextInput;
