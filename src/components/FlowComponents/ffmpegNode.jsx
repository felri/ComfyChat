import { useCallback, useRef, useEffect, useState } from "react";
import { FaFileAudio } from "react-icons/fa6";
import PropTypes from "prop-types";
import Container from "../Common/container";
import { useFileStore, storeManager } from "../../store";
import { Handle, Position } from "reactflow";

const steps = {
  loading: {
    text: "Loading FFmpeg, aprox. 10MB",
    icon: <FaFileAudio size={20} className="mr-2" />,
  },
  working: {
    text: "Cutting audio",
    icon: <FaFileAudio size={20} className="mr-2" />,
  },
  done: {
    text: "Done!",
    icon: <FaFileAudio size={20} className="mr-2" />,
  },
  error: {
    text: "Error. details in console",
    icon: <FaFileAudio size={20} className="mr-2" />,
  },
};

function Dropzone({ id, data, type }) {
  const nodeRef = useRef(null);

  const store = storeManager.getSelectedStore();
  const { findParentNodeByType } = store(({ findParentNodeByType }) => ({
    findParentNodeByType,
  }));

  const [step, setStep] = useState("loading");
  const { ffmpeg, setFFmpeg, files, cutAudio } = useFileStore(
    ({ ffmpeg, setFFmpeg, files, cutAudio }) => ({
      ffmpeg,
      setFFmpeg,
      files,
      cutAudio,
    })
  );

  useEffect(() => {
    if (!ffmpeg) {
      setFFmpeg();
    }
  }, [ffmpeg, setFFmpeg]);

  const handleCutAudio = useCallback(
    (file) => {
      if (file) {
        setStep("working");
        try {
          cutAudio(id, file, data.start, data.end).then(() => {
            setStep("done");
          });
        } catch (e) {
          setStep("error");
          console.log(e);
        }
      } else {
        setStep("error");
        console.log("file not found");
      }
    },
    [data.end, data.start, id]
  );

  useEffect(() => {
    const mediaParentNode = findParentNodeByType(id, "editor");
    console.log(mediaParentNode);
    if (!mediaParentNode) return;

    const file = files.find((f) => f.id === mediaParentNode.id.toString());
    console.log(files);
    console.log(file);
    if (files && file) {
      handleCutAudio(file);
    }
  }, [id]);

  return (
    <Container title="FFmpeg" innerRef={nodeRef} id={id} className="w-[500px]">
      <div className="mt-4 flex items-center justify-center h-full w-full py-4">
        <Handle type="source" position={Position.Bottom} />
        <Handle type="target" position={Position.Top} />

        {steps[step].icon}
        <p className="text-gray-400">{steps[step].text}</p>
      </div>
    </Container>
  );
}

Dropzone.propTypes = {
  id: PropTypes.string,
  data: PropTypes.object,
  type: PropTypes.string,
};

export default Dropzone;
