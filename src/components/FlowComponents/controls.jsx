import { useCallback } from "react";
import { useReactFlow } from "reactflow";
import { CiSquarePlus, CiSquareMinus, CiMonitor } from "react-icons/ci";
import LockView from "../Common/lockView";
import Tooltip from "../Common/tooltip";

function Controls() {
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
    <div className="p-1 cursor-pointer flex items-center justify-center flex-col">
      <Tooltip text="Zoom in" className="mr-4">
        <CiSquarePlus onClick={handleZoomIn} size={35} />
      </Tooltip>
      <Tooltip text="Zoom out" className="mr-4">
        <CiSquareMinus onClick={handleZoomOut} size={35} />
      </Tooltip>
      <Tooltip text="Fit view">
        <CiMonitor
          onClick={handleFitView}
          size={35}
        />
      </Tooltip>
      <Tooltip text="Lock scroll in output">
        <LockView />
      </Tooltip>
    </div>
  );
}

export default Controls;
