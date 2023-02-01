import { useRef, useState, useEffect, useReducer } from 'react'

import styled from 'styled-components';

import * as Tone from 'tone';
import { FileDrop } from 'react-file-drop';

import MainTransport from './mainTransport';
import Record from './recorder';
import Editor from './editor';
import TransportClock from './transportClock';
import ExportMenu from './exportMenu';

import { bufferToWav, bufferFromToneBuffer } from './audio-utils';

// https://github.com/zhuker/lamejs
import Mp3Encoder from './encoder';

import { SAMPLE_RATE, PIX_TO_TIME } from './utils';

/* 

core functionality (use Router):

 - open the mic
 - start/stop recording ( + UI )
 - play recording (be able to switch analyser between mic and player)
 - turn analyser on and off
 - detailed waveform view

*/

const View = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column; 
  justify-content: flex-start;
  align-items: center;
  background: linear-gradient(to right, #1e2126, #282f38 50%, #1e2126);
`;

const TopView = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  justify-content: space-evenly;

  padding: 25px 25px;
  border-radius: 10px;
`;

const MixologyMenu = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  color: #ced4de;
  margin-left: 25px;
`;

const MenuLabels = styled.div`
`;

const Title = styled.h2`
  font-size: 24px;
  margin-bottom: 0px;
`;
const MenuOption = styled.h3`
  font-size: 18px;
  margin: 35px 0px;
  :hover {cursor: pointer; color: white;}
`;

const MiddleView = styled.div`
  box-shadow: ${props => props.dropping
    ? "0 0 12px #ebeff5"
    : "none"
  };
`
const ControlView = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 50px;
  width: 350px;
  margin-top: 40px;
  border-radius: 10px;
  background-color: #1e2126;
  box shadow: 0 0 3px #e6f0ff;
`;  

const PlayButton = styled.button`
  width: 30px;
  height: 30px;
  border: none;
  padding: 0;
  background: ${props => props.playState
    ? "url('/images/pause_white.png') center;" 
    : "url('/images/play_white.png') center;"
  }
  background-size: 30px;
  -webkit-tap-highlight-color: transparent;
  :hover {cursor: pointer;}
`;

const RestartButton = styled(PlayButton)`
  background: url('/images/restart_white.png') center;
`;

const MuteButton = styled(PlayButton)`
  background: ${props => props.mute 
    ? "url('/images/mute_white.png') center;"
    : "url('/images/unmute_white.png') center/99%;"
  }
`;

const ClockArea = styled.div`
  display: flex;
  justify-content: center;
  width: 100px;
  height: 35px;
  background-color: #465261;
  border-radius: 10px;
`;

const initialState = {
  recordings: [],
  endPosition: 0,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'addRecording':
      return addRecording(state, action.payload);
    case 'updateRecording':
      return updateRecording(state, action.payload);
    case 'soloClip':
      return soloClip(state, action.payload);
    case 'unsoloClip':
      return unsoloClip(state, action.payload);
  }
};

const addRecording = (state, recording) => {
  recording.index = state.recordings.length;
  let newDuration = recording.data.duration;
  if (state.recordings.length === 0) {
      return {recordings: [recording], endPosition: recording.position + newDuration};
  } else {
    let newEndPosition = recording.position + newDuration > state.endPosition
      ? recording.position
      : state.endPosition;
    console.log({
      recordings: [
        ...state.recordings.slice(0, state.recordings.length),
        recording
      ],
      endPosition: newEndPosition
    });
    return {
      recordings: [
        ...state.recordings.slice(0, state.recordings.length),
        recording
      ],
      endPosition: newEndPosition
    };
  }
};

const updateRecording = (state, payload) => {
  let clipIndex = payload.index;
  let existingLength = state.recordings.length;
  if (existingLength === 1) {
    return {
     ...state, 
     recordings: [{...payload}]
    };
  } else return {
    ...state,
    recordings: [
      ...state.recordings.slice(0, clipIndex),
      {...payload},
      ...state.recordings.slice(clipIndex + 1, existingLength)
    ]
  }
};

// solo: route player to solo channel and solo it

const soloClip = (state, payload) => {
  payload.recording.player.connect(payload.soloChannel);
  payload.soloChannel.solo = true;
  payload.recording.solo = true;
  return updateRecording(state, payload.recording);
};

const unsoloClip = (state, payload) => {
  payload.recording.player.disconnect(); // disconnect() -> disconnect all
  payload.recording.player.connect(payload.channel); // reconnect to original channel
  payload.soloChannel.solo = false;
  payload.recording.solo = false;
  return updateRecording(state, payload.recording);
}


/* -----------------------------------------------------------------------

how to fix this: 

2 options: 

  1. on play, look first at playhead position and update all players' start with an offset

  2. everytime playhead is moved, look at playhead position and update all players' start with an offset

  The only advantage of two is if this offset ever needs to be used outside of pressing play
  It seems we only need to use the exact position of things for playing, and for section exports, as the UI is always synced
  So 1! We can just calculate it at play time. Shouldn't be expensive, relatively
/* 



*/
function App() {

  const channel = new Tone.Channel().toDestination();
  const soloChannel = new Tone.Channel().toDestination();
  
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [selectedRecording, setSelectedRecording] = useState({});
  const [dropping, setDropping] = useState(false);
  const [exporting, setExporting] = useState(false);
  const drawing = useRef();

  const audioReader = new FileReader();

  const createPlayer = (recording) => {
    return new Tone.Player({
      url: recording.data,
      loop: false
    });
  }

  const schedulePlayer = (recording) => {
    // cancel current scheduling
    // Tone.Transport.clear(recording.id);

    // replace with player.sync.start(offset)
    // because scheduling things on the transport is not built to support playback in the middle of a sample via player

    let offset = calculatePlayOffset(Tone.Transport.seconds, recording.position);
    recording.player.sync().start(offset);
  }

  const calculatePlayOffset = (mouseX, currentPosition) => {
    return mouseX - currentPosition; // check what happens if value is negative (values past buffer end should be fine)
  }

  const receiveRecording = (recording) => {
    recording.player = createPlayer(recording);
    schedulePlayer(recording, Tone.Transport.seconds);
    recording.player.connect(channel);
    if (typeof(recording.data) == "string") { // from recorder
      recording.player.buffer.onload = (buffer) => {
        recording.data = buffer;
        recording.duration = buffer.duration;
        dispatch({type: 'addRecording', payload: recording});
      };
    } else { // from file
      dispatch({type: 'addRecording', payload: recording});
    }
  }

  const updatePlayer = (delta, recording, index) => {
    recording.position = (recording.position + (delta / PIX_TO_TIME) < 0)
      ? 0     // no hiding clips
      : recording.position + (delta / PIX_TO_TIME)

    schedulePlayer(recording);
    dispatch({type: 'updateRecording', payload: recording});
  }

  const toggle = () => {
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
    let tryPlay = toggle();
    if (tryPlay) {
      setPlaying(!playing);
    }
  };

  const restart = () => {
    setPlaying(false);
    Tone.Transport.stop();
  }

  const mute = () => {
    let mute = Tone.getContext().destination.mute;
    mute = !mute;
    setMuted(!muted);
  }

  // takes current solo state (boolean)
  // soloes or un soloes
  const solo = (soloState) => {
    let payload = {
      recording: selectedRecording,
      channel: channel,
      soloChannel: soloChannel
    }
    
    if (soloState) {
      dispatch({type: 'unsoloClip',  payload: payload});
    } else {
      dispatch({type: 'soloClip',  payload: payload});
    }
  }

  const exportAsWav = async () => {
    let renderedBuffer = await renderBuffer();

    /* ????? */
    let mix = Tone.getContext().createBufferSource();
    mix.buffer = renderedBuffer;
    mix.connect(Tone.getContext().rawContext.destination);
    
    let wav = bufferToWav(renderedBuffer);
    exportFile(wav, 'audio/wav');
  };

  const exportAsMp3 = async () => {
    let mp3 = [];
    let renderedBuffer = await renderBuffer();
    let mp3Encoder = new window.lamejs.Mp3Encoder(1, 44100, 128);
    
    let tempMP3 = mp3Encoder.encodeBuffer(renderedBuffer);
    mp3.push(tempMP3);

    // get end of mp3
    tempMP3 = mp3Encoder.flush();
    mp3.push(tempMP3);

    exportFile(mp3, 'audio/mpeg');
  };

  const exportFile = (file, type) => {
    let blob = new window.Blob([new DataView(file)], {
      type: type
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

  useEffect(() => {
    
  }, []);

  return (
    <View id="Tone" ref={drawing.current}>
      <TopView>
        <MixologyMenu>
          <MenuLabels>
            <Title>MIXOLOGY</Title>
            <MenuOption onClick={setExporting}>Export</MenuOption>
          </MenuLabels>
        </MixologyMenu>
        <Record 
          receiveRecording={receiveRecording} 
          exporting={exporting}>
        </Record>
        <ExportMenu displayState={exporting}></ExportMenu>
      </TopView>
      <FileDrop 
          onDrop={(files, event) => upload(files, event)}
          onFrameDragEnter={(event) => setDropping(true)}
          onFrameDragLeave={(event) => setDropping(false)}>
        <MiddleView dropping={dropping}>
          <Editor 
            recording={selectedRecording} 
            solo={solo}>
          </Editor>
          <MainTransport 
            recordings={state.recordings} 
            updatePlayer={updatePlayer}
            selectRecording={setSelectedRecording} 
            exporting={exporting}>
          </MainTransport>
        </MiddleView>
      </FileDrop>
      <ControlView>
          <PlayButton id="play_btn" onClick={onPlay} playState={playing}></PlayButton>
          <MuteButton onClick={mute} mute={muted}></MuteButton>
          <RestartButton onClick={restart}></RestartButton>
          <ClockArea>
            <TransportClock></TransportClock>
          </ClockArea>
      </ControlView>
    </View> 
  )
}

export default App;
