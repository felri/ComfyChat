import PropTypes from "prop-types";

function TextInput({
  onChange,
  value,
  type = "text",
  label = "Text",
  placeholder = "Enter some text",
  name = "text",
  ...props
}) {
  const handleChange = (evt) => {
    onChange(evt);
  };

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

TextInput.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  type: PropTypes.string,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  name: PropTypes.string,
};

export default TextInput;
