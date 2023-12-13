import { useCallback, useRef, useEffect, useState, useMemo } from "react";
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

function FFmpegNode({ id, data, type }) {
  const nodeRef = useRef(null);

  const store = storeManager.getSelectedStore();
  const { findParentNodeByType, createSTTOutputNode } = store(
    ({ findParentNodeByType, createSTTOutputNode }) => ({
      findParentNodeByType,
      createSTTOutputNode,
    })
  );

  const [step, setStep] = useState("loading");
  const { ffmpeg, setFFmpeg, files, cutAudio } = useFileStore(
    ({ ffmpeg, setFFmpeg, files, cutAudio }) => ({
      ffmpeg,
      setFFmpeg,
      files,
      cutAudio,
    })
  );

  const mediaParentNode = useMemo(() => {
    return findParentNodeByType(id, "editor");
  }, [id]);

  useEffect(() => {
    if (!ffmpeg) {
      setFFmpeg();
    }
  }, [ffmpeg, setFFmpeg]);

  const handleCutAudio = useCallback(
    async (file) => {
      if (file) {
        setStep("working");
        try {
          await cutAudio(mediaParentNode.id, file, data.start, data.end);
          setStep("done");
          createSTTOutputNode(id);
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
    if (!mediaParentNode) return;
    const file = files.find((f) => f.id === mediaParentNode.id.toString());
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

FFmpegNode.propTypes = {
  id: PropTypes.string,
  data: PropTypes.object,
  type: PropTypes.string,
};

export default FFmpegNode;
