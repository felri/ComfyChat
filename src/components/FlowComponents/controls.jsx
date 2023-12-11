import { useReactFlow } from "reactflow";
import { CiSquarePlus, CiSquareMinus } from "react-icons/ci";
import { TbFocus2 } from "react-icons/tb";
import LockView from "./lockView";
import Tooltip from "../Common/tooltip";

function Controls() {
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  return (
    <div className="p-1 cursor-pointer flex items-center justify-center">
      <Tooltip text="Zoom in" className="mr-4">
        <CiSquarePlus onClick={zoomIn} size={35} />
      </Tooltip>
      <Tooltip text="Zoom out" className="mr-4">
        <CiSquareMinus onClick={zoomOut} size={35} />
      </Tooltip>
      <Tooltip text="Fit view">
        <TbFocus2
          onClick={() =>
            fitView({
              duration: 500,
            })
          }
          size={35}
        />
      </Tooltip>
      <Tooltip text="Lock view in output">
        <LockView />
      </Tooltip>
    </div>
  );
}

export default Controls;
