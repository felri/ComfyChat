import { useCallback } from "react";
import PropTypes from "prop-types";

function Dropdown({
  onChange,
  value,
  label = "Text",
  name = "text",
  options = [],
}) {
  const handleChange = useCallback((evt) => {
    onChange(evt);
  }, [onChange]);

  return (
    <div className="flex flex-col w-full w-full text-center">
      <label>{label}</label>
      <select
        onChange={handleChange}
        className="nodrag w-full text-center"
        value={value}
        name={name}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

Dropdown.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string,
  options: PropTypes.array,
};

export default Dropdown;
