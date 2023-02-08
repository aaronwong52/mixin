import { useRef, useEffect } from 'react';
import p5 from 'p5';

import styled from 'styled-components';
import { Timeline, Transport } from 'tone';
import NewRecording from './newrecording';

const TransportView = styled.div`
  height: 400px;
  width: 100vw;
  display: ${props => props.display ? "none" : "flex"};
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
`;

const TransportObjects = styled.div`
  height: 200px;
  width: 100vw;
`;

const TransportTimeline = styled.div`
  overflow: scroll;
  max-width: 90vw;
  -ms-overflow-style: none;  /* Internet Explorer 10+ */
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
  margin-bottom: 50px;
`;

const PlayButton = styled.button`
  width: 35px;
  height: 35px;
  margin-bottom: 50px;
  background-color: transparent;
  border: none;
  background: url('/images/play-button.png') no-repeat;
  background-size: 35px;
  :hover {cursor: pointer;}
`;

const RecordingsView = styled.div`
  width: 90vw;
  height: 110px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding-left: 10px;
`;

const RecordingView = styled.div`
    width: 100px;
    height: 75px;
    background-color: #d6b8f5;
    border-radius: 10px;
    margin-right: 15px;
`;

/* 

need to define structure for transport: playhead, placement of audio pieces (start, end)
how should position be represented? What is the division of time - milliseconds sounds good?
So every audio piece has a start and end, in milliseconds (milliseconds after 0)
playhead is current position in milliseconds

use seconds because tonejs uses seconds

todo: get things going with tonejs transport and mixer

MAKE it scrollable! Figure out how to repesent events and audio on the transport

implement waveform view for entire audio clip
implement moving an audio piece around the transport

begin implementing basic editing / performance: cutting, joining, looping, mute, solo, delete
creation of new audio node

block swipe to go back

*/

function MainTransport({display, recordings, playPosition, setPlayPosition, play}) {

    let playBtn = document.getElementById("play_btn");
    const transport = useRef();
    const length = 2000;

    const inflateRecordings = () => {
      return recordings.map(r => (
        <RecordingView className="recording_clip"></RecordingView>
        // <NewRecording key={Math.random() * 1000}
        //   newRecording={r} setPlayPosition={setPlayPosition}>
        // </NewRecording>
      ));
    }	

    useEffect(() => {
      const s = (sketch) => {
        let x = length;
        let y = 30;

        sketch.setup = () => {
          sketch.createCanvas(x, y);
        };

        sketch.draw = () => {
          sketch.background("white");
          sketch.fill(51)
          sketch.textSize(12);
          sketch.line(0, y-20, x, y-20); // baseline
          let i = 0;
          while (i < x) {
            sketch.line(i + 10, y-25, i + 10, y-15);
            sketch.text(i, i+10, y);
            sketch.textAlign(sketch.CENTER);
            i = i + 50;
          }
        };
      };
      let wavep5 = new p5(s, transport.current);
    }, []);

    useEffect(() => {
      let clips = document.getElementsByClassName("recording_clip");
      for (let c=0; c < clips.length; c++) {
        clips[c].style.width = (recordings[c].size / 150) + "px";
      }
      
    }, [recordings]);

    return (
        <TransportView id="transportview" display={display}>
          <RecordingsView>
            {inflateRecordings()}
          </RecordingsView>
          <TransportTimeline id="timeline" ref={transport}>
          </TransportTimeline>
            <PlayButton type="button" id="play_btn" onClick={play}></PlayButton>
        </TransportView>
    )
}

export default MainTransport;