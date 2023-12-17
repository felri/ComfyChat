import { useEffect, useRef } from "react";
import PropTypes from "prop-types";

const AudioPlayer = ({ file }) => {
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [file]);

  return (
    <div className="flex items-center justify-center w-full">
      <audio ref={audioRef} controls className="w-full h-10">
        <source src={file?.data} type="audio/mp3" />
      </audio>
    </div>
  );
};

AudioPlayer.propTypes = {
  file: PropTypes.shape({
    data: PropTypes.string,
  }),
};

export default AudioPlayer;