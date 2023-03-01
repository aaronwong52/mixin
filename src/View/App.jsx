import { useRef, useEffect, useState, useReducer } from 'react'

import * as styles from './AppStyles';

import * as Tone from 'tone';
import { FileDrop } from 'react-file-drop';
import { createPlayer } from '../utils/audio-utils';

import { recordingReducer } from '../Reducer/recordingReducer';
import Transport from '../Transport/transport';
import Recorder from '../Recorder/recorder';
import Editor from '../Editor/editor';
import TransportClock from '../Transport/transportClock';
import ExportMix from '../Export/exportMix';

import { StateContext, StateDispatchContext } from '../utils/StateContext';

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
    channels: [],
    selectedRecording: {},
    selectedChannel: 0, // id-based system, set to 0 when no channels are selected
    endPosition: 0,
    soloChannel: null,
    time: 0,
    playing: false,
    transportLength: 3000
};

// app serves to put views together and act as a data processor + connector to the reducer
// maintains Control state
function App() {
  
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [state, dispatch] = useReducer(recordingReducer, initialState);
  
  const [dropping, setDropping] = useState(false);
  const [exporting, setExporting] = useState(false);

  const drawing = useRef();

  const audioReader = new FileReader();

  // logic for this with reducer is a little tricky
  // any state operations that need to read state -> place in reducer
  // we have to place the onload callback here so that we don't have to dispatch another action from inside the reducer


  // receive from Recorder -> add to store and send to Transport
  const receiveRecording = (recording) => {
    recording.player = createPlayer(recording.data);
    
    // recording.data is blobUrl
    if (typeof(recording.data) == "string") {
      recording.player.buffer.onload = (buffer) => {
        recording.data = buffer;
        recording.duration = recording.start + buffer.duration;
        dispatch({type: 'updateBuffer', payload: recording});
        Tone.Transport.seconds = recording.duration;
        dispatch({type: 'updateTransportPosition', payload: recording.duration});
      };
      dispatch({type: 'scheduleNewRecording', payload: recording});
    } 
    // recording.data is the buffer itself
    else {
      dispatch({type: 'scheduleNewRecording', payload: recording});
    }
  };

  const toggle = () => {
    if (Tone.Transport.state === "started") {
      Tone.Transport.pause();
      dispatch({type: 'togglePlay', payload: {playing: false, time: Tone.Transport.seconds}});
      return true;
    }

    else if (state.channels.length > 0) {
      Tone.context.resume();
      Tone.Transport.start();
      dispatch({type: 'togglePlay', payload: {playing: true, time: Tone.Transport.seconds}});
      return true;
    }
    return false;
  };

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
    dispatch({type: 'togglePlay', payload: {playing: false, time: 0}});
    dispatch({type: 'updateTransportPosition', payload: 0});
  };

  const mute = () => {
    if (exporting) {
      return;
    }
    let mute = Tone.getContext().destination.mute;
    mute = !mute;
    setMuted(!muted);
  };

  // takes current solo state (boolean)
  // soloes or un soloes
  const solo = (soloState) => { 
    if (soloState) {
      dispatch({type: 'unsoloClip',  payload: state.selectedRecording});
    } else {
      dispatch({type: 'soloClip',  payload: state.selectedRecording});
    }
  };
  
  const setExportingState = () => {
    setExporting(!exporting);
  };


  const upload = (files, e) => {
    e.preventDefault();
    setDropping(false);
    if (files) {
      if (files[0].type !== "audio/mpeg" && files[0].type !== "audio/wav") {
        return;
      } else {
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
  };

  const newRecordingFromBuffer = (buffer) => {
    let recordingTime = Tone.Transport.seconds;
    let newRecording = {
      position: recordingTime,
      start: recordingTime,
      duration: recordingTime + buffer.duration, 
      data: buffer,
      player: null,
      channel: null,
      loaded: true
    };
    receiveRecording(newRecording);
  };

  useEffect(() => {
    dispatch({type: 'initializeChannels', payload: {}});
  }, []);

  return (
    <StateContext.Provider value={state}>
      <StateDispatchContext.Provider value={dispatch}>
        <styles.View id="Tone" ref={drawing.current}>
          <styles.TopView>
            <styles.MixologyMenu>
              <styles.MenuLabels>
                <styles.Title>MIXIN</styles.Title>
                <styles.MenuOption onClick={setExportingState}>Export</styles.MenuOption>
              </styles.MenuLabels>
              <ExportMix displayState={exporting} channels={state.channels}></ExportMix>
            </styles.MixologyMenu>
            <Recorder 
              receiveRecording={receiveRecording} 
              exporting={exporting}>
            </Recorder>
          </styles.TopView>
          <FileDrop 
              onDrop={(files, event) => upload(files, event)}
              onFrameDragEnter={(event) => setDropping(true)}
              onFrameDragLeave={(event) => setDropping(false)}>
            <styles.MiddleView dropping={dropping}>
              <Editor 
                recording={state.selectedRecording} 
                solo={solo}
                exporting={exporting}>
              </Editor>
              <Transport 
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
      </StateDispatchContext.Provider>
    </StateContext.Provider> 
  )
}

export default App;
