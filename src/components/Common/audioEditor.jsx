import { useState } from 'react';
import Wavesurfer from 'react-wavesurfer';
import PropTypes from 'prop-types';

const AudioEditor = ({ audioFile, onSelectionConfirm }) => {
  const [region, setRegion] = useState(null);
  const [wavesurfer, setWavesurfer] = useState(null);

  const handleWavesurferMount = (wavesurferInstance) => {
    setWavesurfer(wavesurferInstance);

    // Enable the user to create a region in the waveform
    wavesurferInstance.enableDragSelection({
      color: "rgba(0, 255, 0, 0.1)"  // example color
    });

    // Listen to region update and removal events
    wavesurferInstance.on('region-update-end', (updatedRegion) => {
      // Update the region state with the id and timing values
      setRegion({
        id: updatedRegion.id,
        start: updatedRegion.start,
        end: updatedRegion.end
      });
    });

    wavesurferInstance.on('region-removed', (removedRegion) => {
      // If the removed region is the one we're tracking, clear it from the state
      if (removedRegion.id === region?.id) {
        setRegion(null);
      }
    });
  };

  const confirmSelection = () => {
    if (region) {
      onSelectionConfirm(region);
    }
  };

  const handlePlayPause = () => {
    wavesurfer.playPause();
  };

  return (
    <div>
      <Wavesurfer
        src={audioFile}
        onMount={handleWavesurferMount}
        options={{
          container: '#waveform',
          waveColor: 'violet',
          progressColor: 'purple',
          height: 100,
          // plugins can be configured here if needed
        }}
      />
      <button onClick={handlePlayPause}>Play/Pause</button>
      <button onClick={confirmSelection} disabled={!region}>Confirm Selection</button>
    </div>
  );
};

AudioEditor.propTypes = {
  audioFile: PropTypes.string.isRequired,
  onSelectionConfirm: PropTypes.func.isRequired
};

export default AudioEditor;