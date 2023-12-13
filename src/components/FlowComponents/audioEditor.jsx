import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { WaveSurfer, WaveForm, Region } from "wavesurfer-react";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions";
import TimelinePlugin from "wavesurfer.js/dist/plugins/timeline";
import Container from "../Common/container";
import { Handle, Position } from "reactflow";
import PropTypes from "prop-types";
import {
  CiPlay1,
  CiPause1,
  CiZoomIn,
  CiZoomOut,
  CiStop1,
} from "react-icons/ci";
import { RxSpaceBetweenHorizontally } from "react-icons/rx";
import Tooltip from "../Common/tooltip";
import { useFileStore } from "../../store";

/**
 * @param min
 * @param max
 * @returns {*}
 */
function generateNum(min, max) {
  return Math.random() * (max - min + 1) + min;
}

function AudioEditor({ id }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const { files } = useFileStore((state) => state);

  const audioFile = files.find((file) => file.id === id);

  const plugins = useMemo(() => {
    return [
      {
        key: "regions",
        plugin: RegionsPlugin,
        options: { dragSelection: true },
      },
      {
        key: "top-timeline",
        plugin: TimelinePlugin,
        options: {
          height: 20,
          insertPosition: "beforebegin",
          style: {
            color: "#2D5B88",
          },
        },
      },
    ].filter(Boolean);
  }, []);

  const [regions, setRegions] = useState([]);

  // use regions ref to pass it inside useCallback
  // so it will use always the most fresh version of regions list
  const regionsRef = useRef(regions);

  useEffect(() => {
    regionsRef.current = regions;
  }, [regions]);

  const regionCreatedHandler = useCallback(
    (region) => {
      console.log("region-created --> region:", region);

      if (region.data.systemRegionId) return;

      setRegions([
        ...regionsRef.current,
        { ...region, data: { ...region.data, systemRegionId: -1 } },
      ]);
    },
    [regionsRef]
  );

  const wavesurferRef = useRef();

  const handleWSMount = useCallback(
    (waveSurfer) => {
      wavesurferRef.current = waveSurfer;

      if (wavesurferRef.current) {
        wavesurferRef.current.load(audioFile.data);

        wavesurferRef.current.on("region-created", regionCreatedHandler);

        wavesurferRef.current.on("ready", () => {
          console.log("WaveSurfer is ready");
          setIsLoaded(true);
          generateRegion();
        });

        wavesurferRef.current.on("region-removed", (region) => {
          console.log("region-removed --> ", region);
        });

        wavesurferRef.current.on("loading", (data) => {
          console.log("loading --> ", data);
        });

        if (window) {
          window.surferidze = wavesurferRef.current;
        }
      }
    },
    [regionCreatedHandler]
  );

  const generateRegion = useCallback(() => {
    if (!wavesurferRef.current) return;
    let maxTimestampInSeconds = wavesurferRef.current.getDuration();
    maxTimestampInSeconds = Math.min(maxTimestampInSeconds, 600); // 600 seconds = 10 minutes

    const r = generateNum(0, 255);
    const g = generateNum(0, 255);
    const b = generateNum(0, 255);

    setRegions([
      ...regions,
      {
        id: `custom-${generateNum(0, 9999)}`,
        start: 0,
        end: maxTimestampInSeconds,
        color: `rgba(${r}, ${g}, ${b}, 0.5)`,
      },
    ]);
  }, [regions, wavesurferRef]);

  const play = useCallback(() => {
    setIsPlaying(!isPlaying);
    wavesurferRef.current.playPause();
  }, [isPlaying]);

  const stop = useCallback(() => {
    setIsPlaying(false);
    wavesurferRef.current.stop();
    wavesurferRef.current.seekTo(
      regions[0].start / wavesurferRef.current.getDuration()
    );
  }, [regions]);

  const handleRegionUpdate = useCallback(
    (region) => {
      const updatedRegions = regions.map((r) => {
        if (r.id === region.id) {
          return region;
        }
        return r;
      });
      // set start play position
      wavesurferRef.current.seekTo(
        region.start / wavesurferRef.current.getDuration()
      );
      setRegions(updatedRegions);
    },
    [regions]
  );

  const increaseZoom = () => {
    if (wavesurferRef.current.options.minPxPerSec >= 100) return;
    wavesurferRef.current.zoom(wavesurferRef.current.options.minPxPerSec + 10);
  };

  const decreaseZoom = () => {
    if (wavesurferRef.current.options.minPxPerSec <= 1) return;
    wavesurferRef.current.zoom(wavesurferRef.current.options.minPxPerSec - 10);
  };

  const setFullAudioAsRegion = useCallback(() => {
    if (!wavesurferRef.current) return;

    let region = regions[0];

    if (!region) return;

    const max = Math.min(wavesurferRef.current.getDuration(), 600); // 600 seconds = 10 minutes

    if (region.end === max) return;

    region = { ...region, start: 0, end: max };
    setRegions([region]);
  }, [regions, wavesurferRef]);

  if (!audioFile) return null;

  return (
    <Container title="Input" id={id} className="w-[1200px] h-[300px]">
      <div>
        <WaveSurfer
          plugins={plugins}
          onMount={handleWSMount}
          cursorColor="transparent"
          container={`#wavesurfer${id}`}
        >
          <WaveForm className="w-full" id={`wavesurfer${id}`}>
            {isLoaded &&
              regions.map((regionProps) => (
                <Region
                  onUpdateEnd={handleRegionUpdate}
                  key={regionProps.id}
                  {...regionProps}
                />
              ))}
          </WaveForm>
          <div id="timeline" />
        </WaveSurfer>
      </div>
      <div className="flex items-center justify-center space-x-4 h-full">
        <Tooltip position="bottom-full" text="Play">
          <div onClick={play}>
            {isPlaying ? <CiPause1 size={35} /> : <CiPlay1 size={35} />}
          </div>
        </Tooltip>
        <Tooltip position="bottom-full" text="Stop">
          <div onClick={stop}>
            <CiStop1 size={35} />
          </div>
        </Tooltip>
        <Tooltip position="bottom-full" text="Set entire audio as region">
          <div onClick={setFullAudioAsRegion}>
            <RxSpaceBetweenHorizontally size={32} />
          </div>
        </Tooltip>
        <Tooltip position="bottom-full" text="Increase zoom">
          <div onClick={increaseZoom}>
            <CiZoomIn size={35} />
          </div>
        </Tooltip>
        <Tooltip position="bottom-full" text="Decrease zoom">
          <div onClick={decreaseZoom}>
            <CiZoomOut size={35} />
          </div>
        </Tooltip>
      </div>

      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Top} />

      <div className="absolute bottom-0 right-0 flex items-center justify-center pr-5 space-x-2 pb-2 cursor-pointer hover:text-red-500 transition-colors duration-300 ease-in-out">
        <CiPlay1 size={35} />
        <p>Transcribe</p>
      </div>
    </Container>
  );
}

AudioEditor.propTypes = {
  id: PropTypes.string,
};

export default AudioEditor;
