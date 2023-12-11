import { useCallback } from "react";
import { useReactFlow } from "reactflow";
import { CiSquarePlus, CiSquareMinus } from "react-icons/ci";
import { TbFocus2 } from "react-icons/tb";
import { HiOutlineTrash } from "react-icons/hi2";
import LockView from "./lockView";
import Tooltip from "../Common/tooltip";
import PropTypes from "prop-types";

function Controls({ resetStore }) {
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  const handleZoomIn = useCallback(() => {
    zoomIn();
  }, [zoomIn]);

  const handleZoomOut = useCallback(() => {
    zoomOut();
  }, [zoomOut]);

  const handleFitView = useCallback(() => {
    fitView({
      duration: 500,
    });
  }, [fitView]);

  return (
    <div className="p-1 cursor-pointer flex items-center justify-center">
      <Tooltip text="Delete all nodes">
        <HiOutlineTrash
          onClick={resetStore}
          size={35}
          className="mr-4 hover:text-red-500 transition-colors duration-300 ease-in-out"
        />
      </Tooltip>
      <Tooltip text="Zoom in" className="mr-4">
        <CiSquarePlus onClick={handleZoomIn} size={35} />
      </Tooltip>
      <Tooltip text="Zoom out" className="mr-4">
        <CiSquareMinus onClick={handleZoomOut} size={35} />
      </Tooltip>
      <Tooltip text="Fit view">
        <TbFocus2
          onClick={handleFitView}
          size={35}
        />
      </Tooltip>
      <Tooltip text="Lock view in output">
        <LockView />
      </Tooltip>
    </div>
  );
}

Controls.propTypes = {
  resetStore: PropTypes.func.isRequired,
};

export default Controls;
