import { useCallback, useRef } from "react";
import TextareaAutosize from "react-textarea-autosize";
import PropTypes from "prop-types";

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

  // focus on mouse enter
  const handleMouseEnter = useCallback(() => {
    if (autoFocus) {
      textRef.current.focus();
    }
  }, []);

  return (
    <div className="flex flex-col mt-2 w-full">
      <label>{label}</label>
      <TextareaAutosize
        ref={textRef}
        autoFocus={autoFocus}
        onChange={handleChange}
        minRows={7}
        className="nodrag w-full h-full overflow-y-auto"
        value={value}
        name={name}
        placeholder={placeholder}
        onMouseEnter={handleMouseEnter}
        {...props}
      />
    </div>
  );
}

TextArea.propTypes = {
  id: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  label: PropTypes.string,
  placeholder: PropTypes.string,
  name: PropTypes.string,
  autoFocus: PropTypes.bool,
  className: PropTypes.string,
};

export default TextArea;
