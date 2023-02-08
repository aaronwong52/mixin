import { useRef, useState, useEffect } from 'react'

import styled from 'styled-components';

import * as Tone from 'tone';
import { AudioWorkletNode } from "standardized-audio-context";

import MainTransport from './mainTransport';
import Record from './recorder';
import Editor from './editor';

import { bufferToWav, bufferFromToneBuffer } from './audio-utils';

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
      display: flex; 
      flex-direction: column; 
      align-items: center;
      background-color: #3a649e
  `;

const TopView = styled.div`
  display: flex;
  margin: 15px 0px;
  background-color: #4f8adb;
  border-radius: 10px;
  overflow: hidden;
`;

const BottomView = styled.div`
  padding: 10px 10px;
`;

const IconView = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 50px;
  width: 250px;
  border-radius: 4px;
  background-color: #e6f0ff;
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
    ? "url('/images/unmute.png') no-repeat;"
    : "url('/images/mute.png') no-repeat;"
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
  const [showDetails, setShowDetails] = useState(true);
  const playPosition = useRef(0);
  const [recordings, setRecordings] = useState([]);
  const [selectedRecording, setSelectedRecording] = useState({});
  const [endRecordingsPosition, setEndRecordingsPosition] = useState(0);
  // const processor = useRef();
  const drawing = useRef();

  const checkEndPosition = (position) => {
    if (position > endRecordingsPosition) {
      setEndRecordingsPosition(position);
    }
  }

  const makeChannel = (recording, pan) => {
    const channel = new Tone.Channel({pan}).toDestination();
    let new_player = new Tone.Player({
      url: recording.url,
      loop: false
    }).sync().start(playPosition.current);
    new_player.buffer.onload = (buffer) => {
      playPosition.current += buffer.duration;
      setRecordings(existing => {
        if (existing.length === 0) {
          setEndRecordingsPosition(recording.position + buffer.duration);
          return [
            {...recording, 
              duration: buffer.duration, 
              player: new_player, 
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
              player: new_player, 
              channel: channel,
              buffer: buffer
            },
          ]
        }
      });
      new_player.connect(channel);
    };
    
    // recording.player is set to this player (check deep assignment with useState)
    // needed for drag to update position
    // latest position also should be maintained with playPosition ?

    // // add a UI element
    // ui({
    //   name,
    //   tone: channel,
    //   parent: document.querySelector("#content")
    // });
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

  // const saveRecording = (recording) => {
  //     const url = URL.createObjectURL(recording);
  //     const anchor = document.createElement("a");
  //     anchor.download = "recording.webm";
  //     anchor.href = url;
  //     anchor.click();
  // }

  const displayNodeDetails = (nodeContent) => {
    setShowDetails(!showDetails);
  }

  const receiveRecording = (recording) => {
    makeChannel(recording, 0);
  
    // or done in transport?? it just seems like a pain to pass everything everywhere
    // the issue is that if I just pass the recordings object to the transport, the view will be synced. So it would be 
    // an extra step to explicitly tell the transport to schedule the recording 

    // what are potential negatives of scheduling it here? After each recording, it will immediately be scheduled. There
    // doesn't seem to be any difference, it's just organizationally offputting. The negative is that when things need
    // to be refactored or the logic becomes bigger in scope, it might be hard to figure out where things are happening.
    // So I just need to document everything. Even this way it makes sense because then the transport object only has to
    // worry about what it contains, not what's coming in and out. 

    // obviously this whole problem and separation of concerns will disappear if I just add redux. 


    // Received recordings should be scheduled on the transport according to where the playhead was when recording
    // should this be done here, after they are received?
    // right now the recorder is scheduling them when recording finishes...maybe separate these tasks?
    // So that all transport is handled by transport - all data is passed to where it should be
  }

  const newPlayer = (data, recording) => {
    recording.player.dispose();
    let new_pos = recording.position + (data.lastX / PIX_TO_TIME);

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
   
    let renderedBuffer = await render();
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

  const render = async () => {
    const offlineContext = new OfflineAudioContext(2, SAMPLE_RATE * 3, SAMPLE_RATE);
    recordings.forEach(function(recording) {
      let source = offlineContext.createBufferSource();
      source.buffer = bufferFromToneBuffer(recording.buffer);
      source.connect(offlineContext.destination);
      source.start();
    });
    return await offlineContext.startRendering();
  }

  // class ProcessorWorkletNode extends AudioWorkletNode {
  //   constructor(context) {
  //     super(context, "processor");
  //   }
  // }

  useEffect(() => {
    // async function addToneWorklet(processor) {
    //   const audioContext = Tone.getContext();
    //   await audioContext.addAudioWorkletModule("processor.js", "processor");
    //   let processingNode = audioContext.createAudioWorkletNode("processor");
    //   console.log(processingNode);
    //   processingNode.connect(audioContext.destination);
    //   processor.current = processingNode;
    // }

    // async function addAudioWorklet(processor) {
    //   const baseAudioContext = Tone.getContext();
    //   const audioContext = baseAudioContext.rawContext;
    //   await audioContext.audioWorklet.addModule("processor.js");
    //   const processingNode = new ProcessorWorkletNode(audioContext);
    //   processingNode.connect(audioContext.destination);
    //   processor.current = processingNode;
    // }
    // addAudioWorklet(processor);
  }, []);

  return (
    <View id="Tone" ref={drawing.current}>
      <TopView>
        <Record playPosition={playPosition} receiveRecording={receiveRecording}></Record>
      </TopView>
      <Editor recording={selectedRecording}></Editor>
      <MainTransport recordings={recordings} newPlayer={newPlayer}
        updateRecordings={updateRecordings}
        selectRecording={setSelectedRecording}>
      </MainTransport>
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
