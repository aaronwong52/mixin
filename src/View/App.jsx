import { useRef, useState, useReducer } from 'react'

import * as styles from './AppStyles';

import * as Tone from 'tone';
import { FileDrop } from 'react-file-drop';

import { recordingReducer } from '../Reducer/recordingReducer';
import Transport from '../Transport/transport';
import Recorder from '../Recorder/recorder';
import Editor from '../Editor/editor';
import TransportClock from '../Transport/transportClock';
import ExportMenu from './exportMenu';

import { bufferToWav, bufferFromToneBuffer } from '../utils/audio-utils';

import { SAMPLE_RATE } from '../utils/constants';

/* 

core functionality (use Router):

 - open the mic
 - start/stop recording ( + UI )
 - play recording (be able to switch analyser between mic and player)
 - turn analyser on and off
 - detailed waveform view

*/



/* -----------------------------------------------------------------------

how to fix this: 

2 options: 

  1. on play, look first at playhead position and update all players' start with an offset

  2. everytime playhead is moved, look at playhead position and update all players' start with an offset

  The only advantage of two is if this offset ever needs to be used outside of pressing play
  It seems we only need to use the exact position of things for playing, and for section exports, as the UI is always synced
  So 1! We can just calculate it at play time. Shouldn't be expensive, relatively

*/

const initialState = {
    recordings: [],
    endPosition: 0,
    channel: new Tone.Channel().toDestination(),
    soloChannel: new Tone.Channel().toDestination()
};

function App() {
  
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [state, dispatch] = useReducer(recordingReducer, initialState);
  
  const [selectedRecording, setSelectedRecording] = useState({});
  const [dropping, setDropping] = useState(false);
  const [exporting, setExporting] = useState(false);
  const drawing = useRef();

  const audioReader = new FileReader();

  // logic for this with reducer is a little tricky
  // any state operations that need to read state -> place in reducer
  // we have to place the onload callback here so that we don't have to dispatch another action from inside the reducer

  const receiveRecording = (recording) => {
    recording.player = createPlayer(recording);
    
    if (typeof(recording.data) == "string") { // from recorder
      dispatch({type: 'scheduleRecording', payload: recording}); // buffer should load before re-render
      recording.player.buffer.onload = (buffer) => {
        recording.data = buffer;
        recording.duration = buffer.duration;
        dispatch({type: 'updateBuffer', payload: recording});
      };
    } else {
      dispatch({type: 'scheduleRecording', payload: recording});
    }
  }

  const updatePlayerPosition = (delta, recording, index) => {
    dispatch({type: 'updateRecordingPosition', 
      payload: {
        recording: recording,
        delta: delta
      }}
    );
  }

  const createPlayer = (recording) => {
    return new Tone.Player({
      url: recording.data,
      loop: false
    });
  };

  const toggle = () => {
    console.log(state.recordings);
    if (Tone.Transport.state === "started") {
      Tone.Transport.pause();
      return true;
    }
    else if (state.recordings.length > 0) {
      Tone.Transport.start();
      return true;
    }
    return false;
  }

  const onPlay = () => {
    if (exporting) {
      return;
    }
    let tryPlay = toggle();
    if (tryPlay) {
      setPlaying(!playing);
    }
  };

  const restart = () => {
    if (exporting) {
      return;
    }
    setPlaying(false);
    Tone.Transport.stop();
  }

  const mute = () => {
    if (exporting) {
      return;
    }
    let mute = Tone.getContext().destination.mute;
    mute = !mute;
    setMuted(!muted);
  }

  // takes current solo state (boolean)
  // soloes or un soloes
  const solo = (soloState) => { 
    if (soloState) {
      dispatch({type: 'unsoloClip',  payload: selectedRecording});
    } else {
      dispatch({type: 'soloClip',  payload: selectedRecording});
    }
  }
  
  const bounce = (fileFormat, ranges) => {

    if (fileFormat == 'mp3') {
      exportAsMp3(ranges);
    } else {
      exportAsWav(ranges);
    }
  }

  const exportAsWav = async (ranges) => {
    let renderedBuffer = await renderBuffer();

    /* ????? necessary? */
    let mix = Tone.getContext().createBufferSource();
    mix.buffer = renderedBuffer;
    mix.connect(Tone.getContext().rawContext.destination);
    
    let wav = bufferToWav(renderedBuffer);
    exportFile(wav, 'audio/wav');
  };

  const exportAsMp3 = async (ranges) => {
    let mp3 = [];
    let renderedBuffer = await renderBuffer();

    // https://github.com/zhuker/lamejs
    let mp3Encoder = new window.lamejs.Mp3Encoder(1, 44100, 128);
    
    let tempMP3 = mp3Encoder.encodeBuffer(renderedBuffer);
    mp3.push(tempMP3);

    // get end of mp3
    tempMP3 = mp3Encoder.flush();
    mp3.push(tempMP3);

    exportFile(mp3, 'audio/mpeg');
  };

  const exportFile = (file, fileFormat) => {
    let blob = new window.Blob([new DataView(file)], {
      type: fileFormat
    });
    downloadBlob(blob);
  };

  const setExportingState = () => {
    setExporting(!exporting);
  }

  const downloadBlob = (blob) => {
    let anchor = document.createElement('a');
    let url = window.URL.createObjectURL(blob);
    anchor.href = url;
    anchor.download = 'audio.wav';
    anchor.click();
    window.URL.revokeObjectURL(url);;
  }

  // invariant: as long as all the audio is set up through Tone, the render will be correct

  // how to export a range? is there a way to easily do it with Tone? or offlineContext?
  const renderBuffer = async () => {
    // OfflineAudioContext(numChannels, length, sampleRate)
    const offlineContext = new OfflineAudioContext(2, state.endPosition, SAMPLE_RATE);
    state.recordings.forEach(function(recording) {
      let source = offlineContext.createBufferSource();
      source.buffer = bufferFromToneBuffer(recording.buffer);
      source.connect(offlineContext.destination);
      source.start();
    }); 
    return await offlineContext.startRendering();
  }

  const upload = (files, e) => {
    e.preventDefault();
    setDropping(false);
    if (files) {
      if (files[0].type !== "audio/mpeg" && files[0].type !== "audio/wav") {
        // alert user
        return;
      } else {
        // move on
        let mp3Encoder = new window.lamejs.Mp3Encoder(1, 44100, 128);
        audioReader.readAsArrayBuffer(files[0]);
        audioReader.onload = async () => {
          let buffer = audioReader.result;
          // encoded to audio buffer into Player into recording
          try {
            let decodedBuffer = await Tone.getContext().rawContext.decodeAudioData(buffer);
            newRecordingFromBuffer(decodedBuffer);
          } catch(e) {
            // Bad format?
            console.log(e);
          }
        }
        audioReader.onerror = () => {
          console.log(audioReader.error);
        }
      } 
    }
  }

  const newRecordingFromBuffer = (buffer) => {
    let newRecording = {
      position: Tone.Transport.seconds,
      duration: buffer.duration, 
      data: buffer,
      player: newPlayer,
      channel: null,
      loaded: true
    };
    receiveRecording(newRecording);
  }

  return (
    <styles.View id="Tone" ref={drawing.current}>
      <styles.TopView>
        <styles.MixologyMenu>
          <styles.MenuLabels>
            <styles.Title>MIXOLOGY</styles.Title>
            <styles.MenuOption onClick={setExportingState}>Export</styles.MenuOption>
          </styles.MenuLabels>
        </styles.MixologyMenu>
        <Recorder 
          receiveRecording={receiveRecording} 
          exporting={exporting}>
        </Recorder>
        <ExportMenu displayState={exporting} bounce={bounce}></ExportMenu>
      </styles.TopView>
      <FileDrop 
          onDrop={(files, event) => upload(files, event)}
          onFrameDragEnter={(event) => setDropping(true)}
          onFrameDragLeave={(event) => setDropping(false)}>
        <styles.MiddleView dropping={dropping}>
          <Editor 
            recording={selectedRecording} 
            solo={solo}
            exporting={exporting}>
          </Editor>
          <Transport 
            recordings={state.recordings} 
            updatePlayerPosition={updatePlayerPosition}
            selectRecording={setSelectedRecording} 
            exporting={exporting}>
          </Transport>
        </styles.MiddleView>
      </FileDrop>
      <styles.ControlView>
          <styles.PlayButton id="play_btn" onClick={onPlay} playState={playing}></styles.PlayButton>
          <styles.MuteButton onClick={mute} mute={muted}></styles.MuteButton>
          <styles.RestartButton onClick={restart}></styles.RestartButton>
          <styles.ClockArea>
            <TransportClock></TransportClock>
          </styles.ClockArea>
      </styles.ControlView>
    </styles.View> 
  )
}

export default App;
