import { useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { FaFileAudio } from "react-icons/fa6";
import PropTypes from "prop-types";
import Container from "../Common/container";
import { storeManager } from "../../store";
import { Handle, Position } from "reactflow";

function Dropzone({ id, disable }) {
  const nodeRef = useRef(null);
  const store = storeManager.getSelectedStore();
  const { onAudioDrop } = store(
    (state) => state,
    (state, next) => {
      return state.onAudioDrop === next.onAudioDrop;
    }
  );

  const onDrop = useCallback((acceptedFiles) => {
    for (const file of acceptedFiles) {
      const reader = new FileReader();
      reader.onload = () => {
        onAudioDrop(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: "audio/*",
    multiple: true,
  });

  return (
    <Container title="Input" innerRef={nodeRef} id={id} className="w-[500px]">
      <div
        {...getRootProps()}
        className="flex items-center justify-center h-full w-full border-dashed	rounded border-2 border-gray-400 hover:bg-gray-800 py-4 px-12  cursor-pointer text-center whitespace-nowrap"
      >
        <Handle type="source" position={Position.Bottom} />
        <Handle type="target" position={Position.Top} />

        <input {...getInputProps()} disabled={disable} />
        <FaFileAudio size={20} className="mr-2" />
        <span className="text-xs mr-3">Drop audio file here</span>
      </div>
    </Container>
  );
}

Dropzone.propTypes = {
  id: PropTypes.string,
  disable: PropTypes.bool,
};

export default Dropzone;
