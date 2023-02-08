import { useState, useRef, useEffect } from 'react';
import p5 from 'p5';

import styled from 'styled-components';
import Draggable from 'react-draggable';
import { Timeline, Transport } from 'tone';
import NewRecording from './newrecording';

import {TRANSPORT_LENGTH, PIX_TO_TIME } from './utils';

const TransportView = styled.div`
  height: 400px;
  width: 90vw;
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
  display: flex;
  flex-direction: column;
  max-width: 90vw;
  padding-bottom: 10px;
  margin-bottom: 20px;
  border: 1px dotted grey;
  -ms-overflow-style: none;  /* Internet Explorer 10+ */
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
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
  position: relative;
  overflow: auto; 
  width: 100%;
  height: 75px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-left: 16px;
`;

const RecordingView = styled.div`
    width: 100px;
    height: 75px;
    background-color: #d6b8f5;
    border: 1px dashed grey;
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

function MainTransport({display, recordings, newPlayer, 
  updateRecordings, selectRecording, toggle}) {

    const dragging = useRef(false);
    const transportRef = useRef();

    const edit = (recording) => {
      selectRecording(recording);
    }
  
    // update start time for dropped element's player
    const updatePlayer = (data, recording, index) => {
      let new_player = newPlayer(recording);
      let new_pos = recording.position + (data.lastX / PIX_TO_TIME);

      new_player.sync().start(new_pos);
      new_player.connect(recording.channel); 
      console.log(new_pos)
      recording.player = new_player;
      
      updateRecordings(recording, index);
    }
    
    const onStop = (data, recording, index) => {
      if (dragging.current) {
        dragging.current = false;
        updatePlayer(data, recording, index);
      }
      else {
        edit(recording);
      }
    }

    const onDrag = (e, data, recording, index) => {
      if (e.type === 'mousemove' || e.type === 'touchmove') {
        dragging.current = true;
      }
    }

    const inflateRecordings = () => {
      return recordings.map((r, index) => (
        <Draggable key={"rec_clip_" + index}
            onDrag={(e, data) => onDrag(e, data, r, index)}
            onStop={(e, data) => onStop(data, r, index)}
            bounds={'#recordingsview'}>
          <RecordingView className="recording_clip">
          </RecordingView>
        </Draggable>
      ));
    }	

    useEffect(() => {
      const s = (sketch) => {
        let x = TRANSPORT_LENGTH;
        let y = 75;

        sketch.setup = () => {
          sketch.createCanvas(x, y);
        };

        sketch.draw = () => {
          let time = (Transport.seconds * PIX_TO_TIME) + 10;
          sketch.background("white");
          sketch.fill(51)
          sketch.textSize(12);

          sketch.line(0, y - 20, x, y - 20); // baseline
          sketch.stroke('blue');
          sketch.line(time, -30, time, y - 15);
          sketch.stroke('grey');

          let i = 0;
          while (i < x) {
            sketch.line(i + 10, y - 25, i + 10, y - 15);
            sketch.text(i / PIX_TO_TIME, i + 10, y);
            sketch.textAlign(sketch.CENTER);
            i += 50;
          }
        };
      };
      let wavep5 = new p5(s, transportRef.current);
      return () => wavep5.remove();
    }, []);

    useEffect(() => {
      let clips = document.getElementsByClassName("recording_clip");
      for (let c = 0; c < clips.length; c++) {
        clips[c].style.width = (recordings[c].duration * PIX_TO_TIME) + "px";
      }
      
    }, [recordings]);

    return (
        <TransportView id="transportview" display={display}>
           <RecordingsView id="recordingsview">
              {inflateRecordings()}
            </RecordingsView>
          <TransportTimeline id="timeline" ref={transportRef}>
          </TransportTimeline>
            <PlayButton type="button" id="play_btn" onClick={toggle}></PlayButton>
        </TransportView>
    )
}

export default MainTransport;