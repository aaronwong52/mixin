import { useState, useRef, useEffect } from 'react';
import p5 from 'p5';

import styled from 'styled-components';
import Draggable from 'react-draggable';
import { Transport } from 'tone';
import Playhead from './playline';

import {TRANSPORT_LENGTH, PIX_TO_TIME } from './utils';

const TransportView = styled.div`
  width: 100vw;
  display: ${props => props.display ? "none" : "flex"};
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  border: 1px dotted grey;
  border-bottom: none;
  border-left: none;
  border-right: none;
`;

const TransportTimeline = styled.div`
  overflow: scroll;
  display: flex;
  flex-direction: column;
  width: 100vw;
  padding-bottom: 10px;
  margin-bottom: 50px;
  -ms-overflow-style: none;  /* Internet Explorer 10+ */
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
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
  padding-top: 5px;
`;

const RecordingView = styled.div`
    width: 100px;
    height: 75px;
    background-color: #d6b8f5;
    border: 1px dashed grey;
    opacity: 0.5;
    :hover {cursor: grab;}
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


/* 

To sync playline with transport
Transport.seconds to pixels to css

*/

function MainTransport({display, recordings, newPlayer, 
  updateRecordings, selectRecording}) {

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
        let y = 25;

        sketch.setup = () => {
          sketch.createCanvas(x, y);
        };

        sketch.draw = () => {
          sketch.background("white");
          sketch.fill(51)
          sketch.textSize(12);

          sketch.line(0, y - 20, x, y - 20); // baseline
          sketch.stroke('blue');
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
            <Playhead></Playhead>
            <RecordingsView id="recordingsview">
                {inflateRecordings()}
            </RecordingsView>
          <TransportTimeline id="timeline" ref={transportRef}>
          </TransportTimeline>
        </TransportView>
    )
}

export default MainTransport;