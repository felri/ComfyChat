// text area component that can be used in the flow editor

import { useCallback } from "react";

function TextArea({
  onChange,
  value,
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
      <textarea
        onChange={handleChange}
        className="nodrag"
        value={value}
        name={name}
        placeholder={placeholder}
        {...props}
      />
    </div>
  );
}

export default TextArea;