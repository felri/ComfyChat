import { useState } from "react";
import PropTypes from "prop-types";

const Tooltip = ({ children, text, position = "left-full"}) => {
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
        <div className={`absolute mb-2 px-2 py-1 bg-gray-700 text-white text-sm rounded-md ${position}`}>
          {text}
        </div>
      )}
    </div>
  );
};

Tooltip.propTypes = {
  children: PropTypes.node,
  text: PropTypes.string,
  position: PropTypes.string,
};

export default Tooltip;
