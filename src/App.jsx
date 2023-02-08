import { useRef, useState, useEffect } from 'react'

import styled from 'styled-components';

import * as Tone from 'tone';
import { AudioWorkletNode } from "standardized-audio-context";

import MainTransport from './mainTransport';
import Record from './recorder';
import Editor from './editor';

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
  justify-content: space-evenly;
  align-items: center;
  height: 50px;
  width: 200px;
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
  :hover {cursor: pointer;}
`;

const DownloadButton = styled(PlayButton)`
  background: url('/images/down.png') no-repeat;
`;

const RestartButton = styled(PlayButton)`
  background: url('/images/restart.png') no-repeat;
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
  const [showDetails, setShowDetails] = useState(true);
  const playPosition = useRef(0);
  const [recordings, setRecordings] = useState([]);
  const [selectedRecording, setSelectedRecording] = useState({});
  const processor = useRef();
  const drawing = useRef();

  const makeChannel = (recording, pan) => {
    console.log(processor.current);
    const channel = new Tone.Channel({pan}).connect(processor.current);
    let new_player = new Tone.Player({
      url: recording.url,
      loop: false
    }).sync().start(playPosition.current);
    new_player.buffer.onload = (buffer) => {
      playPosition.current += buffer.duration;
      setRecordings(existing => {
        if (existing.length === 0) {
          return [
            {...recording, 
              duration: buffer.duration, 
              player: new_player, 
              channel: channel
            }
          ]
        }
        else return [
          ...existing.slice(0, existing.length),
          {...recording, 
            duration: buffer.duration, 
            player: new_player, 
            channel: channel
          },
        ]
      });
      new_player.connect(channel);
      console.log(channel);
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

  const newPlayer = (recording) => {
    recording.player.dispose();
    let new_player = new Tone.Player({
      url: recording.url,
      loop: false
    });
    return new_player;
  }

  const onPlay = () => {
    setPlaying(!playing);
    toggle();
  };

  const restart = () => {
    setPlaying(false);
    Tone.Transport.stop();
  }

  const download = async () => {
    
  };

  class ProcessorWorkletNode extends AudioWorkletNode {
    constructor(context) {
      super(context, "processor");
    }
  }

  useEffect(() => {
    // async function addToneWorklet(processor) {
    //   const audioContext = Tone.getContext();
    //   await audioContext.addAudioWorkletModule("processor.js", "processor");
    //   let processingNode = audioContext.createAudioWorkletNode("processor");
    //   console.log(processingNode);
    //   processingNode.connect(audioContext.destination);
    //   processor.current = processingNode;
    // }

    async function addAudioWorklet(processor) {
      const baseAudioContext = Tone.getContext();
      const audioContext = baseAudioContext.rawContext;
      await audioContext.audioWorklet.addModule("processor.js");
      const processingNode = new ProcessorWorkletNode(audioContext);
      processingNode.connect(audioContext.destination);
      processor.current = processingNode;
    }
    addAudioWorklet(processor);
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
            <RestartButton onClick={restart}></RestartButton>
            <DownloadButton onClick={download}></DownloadButton>
        </IconView>
      </BottomView>
    </View> 
  )
}

export default App;
