import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { storeManager, useConfigStore, useFileStore } from "../../store";
import { Handle, Position } from "reactflow";
import Container from "../Common/container";
import TextArea from "../Common/textarea";
import { HiOutlineTrash } from "react-icons/hi2";
import hljs from "highlight.js";
import { IoIosAdd } from "react-icons/io";
import PropTypes from "prop-types";
import { IoStopCircleOutline } from "react-icons/io5";
import { FaSave } from "react-icons/fa";
import { IoIosRefresh } from "react-icons/io";
import { CiEdit } from "react-icons/ci";

import "highlight.js/styles/github-dark.css"; // Or any other style you prefer

const AudioPlayer = ({ file }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [file]);

  return (
    <div className="flex items-center justify-center w-full">
      <audio
        ref={audioRef}
        controls
        className="w-full h-10"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        <source src={file?.data} type="audio/mp3" />
      </audio>
      {isPlaying && (
        <IoStopCircleOutline
          size={20}
          className="ml-2 hover:cursor-pointer"
          onClick={() => {
            audioRef.current.pause();
            setIsPlaying(false);
          }}
        />
      )}
    </div>
  );
};

AudioPlayer.propTypes = {
  file: PropTypes.shape({
    data: PropTypes.string,
  }),
};

function SttOutputNode({ id, data }) {
  const containerRef = useRef(null);
  const store = storeManager.getSelectedStore();
  const abortRef = useRef(false);

  const { sttModel } = useConfigStore((state) => ({
    sttModel: state.sttModel,
  }));

  const { files } = useFileStore(({ files }) => ({ files }));

  const { findParentNodeByType } = store(
    useCallback(
      ({ findParentNodeByType }) => ({
        findParentNodeByType,
      }),
      []
    )
  );

  const file = useMemo(() => {
    if (!id) return null;
    const parent = findParentNodeByType(id, "editor");
    if (!parent) return null;
    return files.find((f) => f.id === parent.id.toString());
  }, [data, files, findParentNodeByType]);

  useEffect(() => {
    const parent = findParentNodeByType(id, "editor");
    if (!parent) return;

    const file = files.find((f) => f.id === parent.id.toString());
    if (!file) return;

    const textArea = containerRef.current.querySelector("textarea");
    if (!textArea) return;
  }, [data, files, findParentNodeByType]);

  return (
    <Container
      innerRef={containerRef}
      title="Output"
      className="w-[800px] min-h-[520px] overflow-y-scroll flex items-left justify-start overflow-hidden pb-10 relative"
      id={id}
    >
      <div className="flex items-center justify-between mt-10">
        <AudioPlayer file={file} />
        <Handle type="source" position={Position.Bottom} />
        <Handle type="target" position={Position.Top} />
        <div className="flex items-center justify-end absolute top-1 left-1 cursor-pointer"></div>
      </div>
    </Container>
  );
}

SttOutputNode.propTypes = {
  id: PropTypes.string,
  data: PropTypes.shape({
    text: PropTypes.string,
    id: PropTypes.string,
    quantity: PropTypes.number,
  }),
};

export default SttOutputNode;
