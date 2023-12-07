import { useState } from "react";
import PropTypes from "prop-types";
import { useOnSelectionChange } from "reactflow";

function Container({
  children,
  title = "Title",
  className = "",
  innerRef,
  id,
}) {
  const [selectedNodes, setSelectedNodes] = useState([]);
  useOnSelectionChange({
    onChange: ({ nodes }) => {
      setSelectedNodes(nodes.map((node) => node.id));
    },
  });

  const isSelected = selectedNodes.includes(id);

  return (
    <div
      ref={innerRef}
      className={` ${className} relative flex flex-col items-left justify-start text-left p-4 pt-7 border-2 border-gray-800 rounded-sm bg-gray-900 ${
        isSelected ? "!border-blue-500" : ""
      }`}
    >
      <h1 className="absolute top-0 left-0 flex items-center justify-center w-full text-sm text-white bg-gray-800 p-1">
        {title}
      </h1>
      {children}
    </div>
  );
}

Container.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
  className: PropTypes.string,
  innerRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
  id: PropTypes.string,
};

export default Container;
