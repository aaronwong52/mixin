import { useRef, useEffect, useContext} from 'react';
import p5 from 'p5';

import * as styles from './transportStyles';

import { Transport as ToneTransport } from 'tone';
import Channel from './channel';

import { modulo } from '../utils/audio-utils';
import {PIX_TO_TIME, TRANSPORT_LENGTH } from '../utils/constants';
import { StateContext, StateDispatchContext } from './StateContext';

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

function Transport({selectRecording, exporting}) {

    const transportRef = useRef();
    const state = useContext(StateContext);
    const dispatch = useContext(StateDispatchContext);

    const inflateChannels = () => {     
      return state.channels.map((c) => (
        <Channel channelName = {c.name} 
        recordings = {c.recordings}
        selectRecording = {selectRecording}>
        </Channel>
      ));
    };

    const updateTransportPosition = () => {
      dispatch({type: 'updateTransportPosition',
          payload: {
          time: ToneTransport.seconds
          }}
      );
    };  

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

          if (exporting) {
            return;
          }
          
          // if (stopSketchClick.current) {
          //   stopSketchClick.current = false;
          //   return;
          // }

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
        clips[c].style.width = (state.channels[0].recordings[c].duration * PIX_TO_TIME) + "px";
        if (!clips[c].style.left) {
          console.log(state.channels[0].recordings[c].position);
          clips[c].style.left = (state.channels[0].recordings[c].position * PIX_TO_TIME) + "px";
        }
      }
    }, [state.channels]);

    return (
        <styles.TransportView id="transportview">
          {inflateChannels()}
          <styles.TransportTimeline>
            <styles.TimelinePadding></styles.TimelinePadding>
            <styles.Timeline id="timeline" ref={transportRef}>
            </styles.Timeline>
          </styles.TransportTimeline>
        </styles.TransportView>
    )
}

export default Transport;