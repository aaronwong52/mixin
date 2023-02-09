import { useRef, useEffect } from 'react';
import p5 from 'p5';

import * as styles from './TransportStyles';

import Draggable from 'react-draggable';

import { Transport as ToneTransport } from 'tone';
import ChannelHeader from './channelHeader';

import { modulo } from '../utils/audio-utils';
import {PIX_TO_TIME, TRANSPORT_LENGTH } from '../utils/constants';

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

function Transport({recordings, updateTransportPosition, updatePlayerPosition, 
  selectRecording, exporting}) {

    const draggingRef = useRef(false);
    const dragStart = useRef(-1);
    const stopSketchClick = useRef(false);
    const transportRef = useRef();

    const onStop = (e, recording, index) => {

      // onDrag
      if (draggingRef.current) {
        draggingRef.current = false;
        stopSketchClick.current = true; // to stop playhead moving when dragging stops 
        // final mouse position shift !!! for Desktop only, mobile uses touch events?
        let delta = e.clientX - dragStart.current;
        updatePlayerPosition(delta, recording, index);
        dragStart.current = -1;
      }

      // onClick
      else {
        selectRecording(recording);
      }
    }

    const onDrag = (e) => {
      if (dragStart.current < 0) {
        // initial mouse position
        dragStart.current = e.clientX; // desktop
      }
      if (e.type === 'mousemove' || e.type === 'touchmove') {
        draggingRef.current = true;
      }
    };

    const inflateRecordings = () => {
      return recordings.map((r, index) => (
        <Draggable key={"drag_rec_clip_" + index}
            onDrag={(e) => onDrag(e)}
            onStop={(e) => onStop(e, r, index)}
            bounds={'#recordingsview'}
            grid={[25, 25]}>
          <styles.RecordingView className="recording_clip">
          </styles.RecordingView>
        </Draggable>
      ));
    }	

    useEffect(() => {
      const s = (sketch) => {
        let x = TRANSPORT_LENGTH;
        let y = 50;

        sketch.setup = () => {
          sketch.createCanvas(x, y);
        };

        sketch.draw = () => {
          sketch.background("#282f38");
          sketch.fill(51)
          sketch.textSize(12);

          
          sketch.line(0, y - 50, x, y - 50); // baseline

          let i = 0;
          while (i < x) {
            sketch.fill('white');
            if (modulo(i, 50) == 0) {
              if (i != 0) {
                sketch.text(i / PIX_TO_TIME, i, y - 25); // seconds
              }
              sketch.line(i + 0.5, y - 50, i + 0.5, y - 40); // dashes
            } else {
              sketch.line(i + 0.5, y - 50, i + 0.5, y - 45); // dashes
            }
            sketch.stroke(206, 212, 222, 30);
            sketch.textAlign(sketch.CENTER);
            i += 25;
          }
          let time = ToneTransport.seconds * PIX_TO_TIME;
          sketch.fill("#bac7db");
          sketch.rect(time + 0.5, 0, 1, 50, 4); // playline
        };

        sketch.mouseClicked = () => {

          // if mouse out of bounds
          if (sketch.mouseY < 0 || sketch.mouseY > y) {
            return;
          }

          // if dragging a clip, or if export menu is open
          if (draggingRef.current || exporting) {
            return;
          }
          
          if (stopSketchClick.current) {
            stopSketchClick.current = false;
            return;
          }

          ToneTransport.seconds = (sketch.mouseX - 10) / PIX_TO_TIME;
          if (ToneTransport.seconds < 0.1) {
            ToneTransport.seconds = 0;
          }
          updateTransportPosition();
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
        <styles.TransportView id="transportview">
          <styles.Channel>
              <ChannelHeader channelName="Audio"></ChannelHeader>
              <styles.ChannelView>
                <styles.RecordingsView id="recordingsview">
                    {inflateRecordings()}
                </styles.RecordingsView>
              </styles.ChannelView>
          </styles.Channel>
          <styles.TransportTimeline>
            <styles.TimelinePadding></styles.TimelinePadding>
            <styles.Timeline id="timeline" ref={transportRef}>
            </styles.Timeline>
          </styles.TransportTimeline>
        </styles.TransportView>
    )
}

export default Transport;