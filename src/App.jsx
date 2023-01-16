import { useRef, useState, useEffect } from 'react'

import styled from 'styled-components';

import * as Tone from 'tone';
import MainTransport from './mainTransport';
import Tree from './treeview';
import Record from './recorder';

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
      justify-content: center; 
      align-items: center;
      align-content: center;
  `;

const TopView = styled.div`
  width: 100vw;
  display: flex;
  justify-content: flex-start;
  margin-bottom: 100px;
`;

const Button = styled.button`
  margin: 30px 10px;
`;

const RecordButton = styled(Button)`
  width: 35px;
  height: 35px;
  background-color: transparent;
  border: none;
  background: url('/images/record.png') no-repeat;
  background-size: 35px;
  `;

  const PlayButton = styled(Button)`
  width: 35px;
  height: 35px;
  background-color: transparent;
  border: none;
  background: url('/images/play-button.png') no-repeat;
  background-size: 35px;
  `;

  function play() {
    Tone.Transport.start();
  }

function App() {
  
  const [showDetails, setShowDetails] = useState(true);
  const playPosition = useRef(0);
  const [recordings, setRecordings] = useState([]);
  const playing = useRef(false); // no re rendering please
  const drawing = useRef();

  const makeChannel = (recording, pan) => {
    const channel = new Tone.Channel({pan}).toDestination();
    let new_player = new Tone.Player({
      url: recording.url,
      loop: false
    }).sync().start(playPosition.current);
    new_player.buffer.onload = (buffer) => {
      playPosition.current += buffer.duration;
    };
    new_player.connect(channel);
    
    setRecordings(existing => {
      if (existing.length === 0) {
        return [{...recording, player: new_player, channel: channel}]
      }
      else return [
        existing.slice(0, existing.length - 1),
        {...recording, player: new_player, channel: channel},
      ]
    });
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
        ...existing.slice(index, existing.length)
      ]
    });
    console.log(recordings);
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

  const updatePlayer = (recording) => {
    recording.player.dispose();
    let new_player = new Tone.Player({
      url: recording.url,
      loop: false
    });
    return new_player;
  }

  useEffect(() => {

  }, []);

  return (
    <View id="Tone" ref={drawing.current}>
      <TopView>
        <Record playPosition={playPosition} receiveRecording={receiveRecording}></Record>
      </TopView>
      <MainTransport recordings={recordings} updatePlayer={updatePlayer}
        updateRecordings={updateRecordings} play={play}>
      </MainTransport>
    </View> 
  )
}

export default App;
