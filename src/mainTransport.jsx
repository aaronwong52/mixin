import { useRef, useEffect } from 'react';
import p5 from 'p5';

import styled from 'styled-components';
import Draggable from 'react-draggable';

import { Transport } from 'tone';

import {TRANSPORT_LENGTH, PIX_TO_TIME } from './utils';

const TransportView = styled.div`
  width: 100vw;
  overflow: scroll;
  display: ${props => props.display ? "none" : "flex"};
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  background-color: #1e2126;
`;

const TransportTimeline = styled.div`
  overflow: scroll;
  display: flex;
  flex-direction: column;
  width: 95vw;
  padding-bottom: 5px;
  background-color: #bed2ed;
  border-radius: 4px;
  -ms-overflow-style: none;  /* Internet Explorer 10+ */
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const RecordingsView = styled.div`
  position: relative;
  display: flex;
  margin-left: 10px;
  background-color: #1f324d;
  z-index: 999;
`;

const RecordingView = styled.div`
    position: absolute;
    width: 100px;
    height: 85px;
    margin-top: 10px;
    background-color: #1f324d;
    border: none;
    border-radius: 4px;
    opacity: 0.75;
    :hover {cursor: pointer;}
    z-index: 999;
    
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

function MainTransport({display, recordings, updatePlayer, 
  selectRecording}) {

    const draggingRef = useRef(false);
    const dragStart = useRef(-1);
    const stopSketchClick = useRef(false);
    const transportRef = useRef();

    const onStop = (e, data, recording, index) => {

      // onDrag
      if (draggingRef.current) {
        draggingRef.current = false;
        stopSketchClick.current = true;
        // final mouse position shift !!! for Desktop only, mobile uses touch events?
        let delta = e.clientX - dragStart.current;
        updatePlayer(delta, recording, index);
        dragStart.current = -1;
      }

      // onClick
      else {
        selectRecording(recording);
      }
    }

    const onDrag = (e, data, recording, index) => {
      if (dragStart.current < 0) {
        // initial mouse position
        dragStart.current = e.clientX; // desktop
      }
      if (e.type === 'mousemove' || e.type === 'touchmove') {
        draggingRef.current = true;
      }
    }

    const inflateRecordings = () => {
      return recordings.map((r, index) => (
        <Draggable key={"rec_clip_" + index}
            onDrag={(e, data) => onDrag(e, data, r, index)}
            onStop={(e, data) => onStop(e, data, r, index)}
            bounds={'#recordingsview'}>
          <RecordingView className="recording_clip">
          </RecordingView>
        </Draggable>
      ));
    }	

    useEffect(() => {
      const s = (sketch) => {
        let x = TRANSPORT_LENGTH;
        let y = 140;

        sketch.setup = () => {
          sketch.createCanvas(x, y);
        };

        sketch.draw = () => {
          sketch.background("#bed2ed");
          sketch.fill(51)
          sketch.textSize(12);

          sketch.line(0, y - 30, x, y - 30); // baseline
          sketch.line(10, 0, x, 0);
          sketch.stroke('blue');
          sketch.stroke('grey');

          let i = 0;
          while (i < x) {
            sketch.line(i + 10, y - 35, i + 10, y - 25);
            sketch.text(i / PIX_TO_TIME, i + 10, y - 10);
            sketch.textAlign(sketch.CENTER);
            i += 50;
          }
          let time = Transport.seconds * PIX_TO_TIME;
          sketch.fill("#bac7db");
          sketch.rect(time + 10, 0, 4, 110, 500); // playline
        };

        sketch.mouseClicked = () => {
          if (sketch.mouseY < 0 || sketch.mouseY > y) {
            return;
          }
          if (draggingRef.current) {
            return;
          }
          if (stopSketchClick.current) {
            stopSketchClick.current = false;
            return;
          }
          Transport.seconds = (sketch.mouseX - 10) / PIX_TO_TIME;
          if (Transport.seconds < 0.1) {
            Transport.seconds = 0;
          }
        }
      };
      let transportp5 = new p5(s, transportRef.current);
      return () => transportp5.remove();
    }, []);

    useEffect(() => {
      let clips = document.getElementsByClassName("recording_clip");
      for (let c = 0; c < clips.length; c++) {
        clips[c].style.width = (recordings[c].duration * PIX_TO_TIME) + "px";
        if (!clips[c].style.left) {
          clips[c].style.left = (recordings[c].position * PIX_TO_TIME) + "px";
        }
      }
    }, [recordings]);

    return (
        <TransportView id="transportview" display={display}>
          <TransportTimeline id="timeline" ref={transportRef}>
            <RecordingsView id="recordingsview">
                {inflateRecordings()}
            </RecordingsView>
          </TransportTimeline>
        </TransportView>
    )
}

export default MainTransport;