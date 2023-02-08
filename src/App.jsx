import { useRef, useState, useEffect } from 'react'

import styled from 'styled-components';

import * as Tone from 'tone';
import { FileDrop } from 'react-file-drop';

import MainTransport from './mainTransport';
import Record from './recorder';
import Editor from './editor';

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
      height: 100vh;
      display: flex;
      flex-direction: column; 
      justify-content: space-between;
      align-items: center;
      background-color: #3a649e;
  `;

const TopView = styled.div`
  display: flex;
  max-height: 30vh;
  margin: 15px 0px;
  background-color: #4f8adb;
  border-radius: 10px;
  overflow: hidden;
`;

const MiddleView = styled.div`
  box-shadow: ${props => props.dropping
    ? "0 0 12px #ebeff5"
    : "none"}
`

const BottomView = styled.div`
  width: 100vw;
  display: flex;
  bottom: 10px;
  justify-content: center;
  align-items: center;
`;

const IconView = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 50px;
  width: 250px;
  border-radius: 4px;
  background-color: #e6f0ff;
  box-shadow: 0 0 3px #e6f0ff;
`;

const PlayButton = styled.button`
  width: 35px;
  height: 35px;
  background-color: transparent;
  border: none;
  background: ${props => props.playState
    ? "url('/images/pause.png') no-repeat;" 
    : "url('/images/play.png') no-repeat;"
  }
  background-size: 35px;
  -webkit-tap-highlight-color: transparent;
  :hover {cursor: pointer;}
`;

const DownloadButton = styled(PlayButton)`
  background: url('/images/down.png') no-repeat;
`;

const RestartButton = styled(PlayButton)`
  background: url('/images/restart.png') no-repeat;
`;

const MuteButton = styled(PlayButton)`
  background: ${props => props.mute 
    ? "url('/images/mute.png') no-repeat;"
    : "url('/images/unmute.png') no-repeat;"
  }
`;

  function toggle() {
    if (Tone.Transport.state === "started") {
      Tone.Transport.pause();
    }
    else {
      Tone.Transport.start();
    }
  }

function App() {
  
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const playPosition = useRef(0);
  const [recordings, setRecordings] = useState([]);
  const [selectedRecording, setSelectedRecording] = useState({});
  const [endRecordingsPosition, setEndRecordingsPosition] = useState(0);
  const [dropping, setDropping] = useState(false);
  const drawing = useRef();

  const audioReader = new FileReader();

  const checkEndPosition = (position) => {
    if (position > endRecordingsPosition) {
      setEndRecordingsPosition(position);
    }
  }

  const makeChannel = (recording, pan) => {
    const channel = new Tone.Channel({pan}).toDestination();
    let new_player = new Tone.Player({
      url: recording.data,
      loop: false
    }).sync().start(playPosition.current);
    if (typeof(recording.data) == "string") {
      new_player.buffer.onload = (buffer) => {
        addRecording(recording, buffer, new_player, channel)
      };
    } else {
      addRecording(recording, recording.data, new_player, channel);
    }
  }

  const addRecording = (recording, buffer, player, channel) => {
    setRecordings(existing => {
      if (existing.length === 0) {
        setEndRecordingsPosition(recording.position + buffer.duration);
        return [
          {...recording, 
            duration: buffer.duration, 
            player: player,
            channel: channel,
            buffer: buffer
          }
        ]
      } else {
        checkEndPosition(recording.position + buffer.duration);
        return [
          ...existing.slice(0, existing.length),
          {...recording, 
            duration: buffer.duration, 
            player: player, 
            channel: channel,
            buffer: buffer
          },
        ]
      }
    });
    playPosition.current += buffer.duration;
    player.connect(channel);
  }

  const updateRecordings = (updatedRecording, index) => {
    setRecordings(existing => {
      if (existing.length === 1) {
        return [{...updatedRecording}]
      }
      else return [
        ...existing.slice(0, index),
        {...updatedRecording},
        ...existing.slice(index + 1, existing.length)
      ]
    });
  }

  const receiveRecording = (recording) => {
    makeChannel(recording, 0);
  }

  const newPlayer = (delta, recording, index) => {
    recording.player.dispose();
    // new position is current position
    let new_pos = recording.position + (delta / PIX_TO_TIME);

    if (new_pos < 0) {new_pos = 0;} // no hiding clips
    let new_player = new Tone.Player({
      url: recording.url,
      loop: false
    }).sync().start(new_pos);

    new_player.buffer.onload = (buffer) => {
      recording.position = new_pos;
      recording.player = new_player;
      recording.buffer = buffer;

      checkEndPosition(new_pos + buffer.duration);

      new_player.connect(recording.channel);
      console.log(recording.position);
      updateRecordings(recording, index);
    }
  }

  const onPlay = () => {
    setPlaying(!playing);
    toggle();
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

  const download = async () => {
    let mp3Encoder = new window.lamejs.Mp3Encoder(1, 44100, 128);
   
    let renderedBuffer = await renderBuffer();
    let mix = Tone.getContext().createBufferSource();
    mix.buffer = renderedBuffer;
    mix.connect(Tone.getContext().rawContext.destination);
    let wav = bufferToWav(renderedBuffer);
    let blob = new window.Blob([new DataView(wav)], {
      type: 'audio/wav'
    });
    downloadBlob(blob);
  };

  const downloadBlob = (blob) => {
    let anchor = document.createElement('a');
    let url = window.URL.createObjectURL(blob);
    anchor.href = url;
    anchor.download = 'audio.wav';
    anchor.click();
    window.URL.revokeObjectURL(url);;
  }

  const renderBuffer = async () => {
    
    // OfflineAudioContext(numChannels, length, sampleRate)
    const offlineContext = new OfflineAudioContext(2, endRecordingsPosition, SAMPLE_RATE);
    recordings.forEach(function(recording) {
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
          console.log(audioReader.result);
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
    };
    receiveRecording(newRecording);
  }

  useEffect(() => {
   
  }, []);

  return (
    <View id="Tone" ref={drawing.current}>
      <TopView>
        <Record playPosition={playPosition} receiveRecording={receiveRecording}></Record>
      </TopView>
      <FileDrop onDrop={(files, event) => upload(files, event)}
          onFrameDragEnter={(event) => setDropping(true)}
          onFrameDragLeave={(event) => setDropping(false)}>
        <MiddleView dropping={dropping}>
          <Editor recording={selectedRecording}></Editor>
          <MainTransport recordings={recordings} newPlayer={newPlayer}
            selectRecording={setSelectedRecording}>
          </MainTransport>
        </MiddleView>
      </FileDrop>
      <BottomView>
        <IconView>
            <PlayButton id="play_btn" onClick={onPlay} playState={playing}></PlayButton>
            <MuteButton onClick={mute} mute={muted}></MuteButton>
            <RestartButton onClick={restart}></RestartButton>
            <DownloadButton onClick={download}></DownloadButton>
        </IconView>
      </BottomView>
    </View> 
  )
}

export default App;
