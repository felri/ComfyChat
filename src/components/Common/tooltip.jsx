import { useState } from "react";
import PropTypes from "prop-types";

const Tooltip = ({ children, text }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative flex items-center whitespace-nowrap">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {children}
      </div>
      {showTooltip && (
        <div className="absolute bottom-full mb-2 px-2 py-1 bg-gray-700 text-white text-sm rounded-md">
          {text}
        </div>
      )}
    </div>
  );
};

Tooltip.propTypes = {
  children: PropTypes.node,
  text: PropTypes.string,
};

export default Tooltip;
