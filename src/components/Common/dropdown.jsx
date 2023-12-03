// a dropdown component

import { useCallback } from "react";

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

export default Dropdown;
