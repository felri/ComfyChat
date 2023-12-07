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
  }, []);

  return (
    <div className="flex flex-col w-full">
      <label htmlFor="text">{label}</label>
      <select
        onChange={handleChange}
        className="nodrag w-full"
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
