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

const DetailedView = styled.div`
  display: flex;
  justify-content: center;
  display: ${props => props.display ? "flex" : "none"};
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
  
  const [showDetails, setShowDetails] = useState(false);
  const [playPosition, setPlayPosition] = useState(0);
  const [recordings, setRecordings] = useState([]);
  const playing = useRef(false); // no re rendering please
  const drawing = useRef();

  const makeChannel = (name, url, pan) => {
    const channel = new Tone.Channel({
      pan
    }).toDestination();
    const player = new Tone.Player({
      url: url,
      loop: false
    }).sync().start(0);
    player.connect(channel);

    // // add a UI element
    // ui({
    //   name,
    //   tone: channel,
    //   parent: document.querySelector("#content")
    // });
  }

  useEffect(() => {
  
  }, []);

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
    setRecordings((prevRecordings) => [...prevRecordings, recording]);
    makeChannel("Test", recording.url, 0);
  
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

  return (
    <View id="Tone" ref={drawing.current}>
      <Tree prop={displayNodeDetails}>
      </Tree>
      <MainTransport display={showDetails} recordings={recordings} 
        playPosition={playPosition} setPosition={setPlayPosition} play={play}></MainTransport>
      <DetailedView display={showDetails}>
        <Record playPosition={playPosition} receiveRecording={receiveRecording}></Record>
      </DetailedView>
    </View> 
  )
}

export default App;
