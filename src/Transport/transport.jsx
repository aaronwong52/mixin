import { useRef, useEffect, useContext} from 'react';
import p5 from 'p5';

import * as styles from './transportStyles';

import { Transport as ToneTransport } from 'tone';
import Channel from './channel';

import { modulo } from '../utils/audio-utils';
import {PIX_TO_TIME, TRANSPORT_LENGTH } from '../utils/constants';
import { StateContext, StateDispatchContext } from '../utils/StateContext';

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

function Transport({exporting}) {

    const transportRef = useRef();
    const state = useContext(StateContext);
    const dispatch = useContext(StateDispatchContext);

    const inflateChannels = () => {
      return state.channels.map((c, index) => (
        <Channel channelName = {c.name} 
          channelData = {{...c, index: index}}>
        </Channel>
      ));
    };

    const updateTransportPosition = (time) => {
      dispatch({type: 'updateTransportPosition',
          payload: {
            time: time
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
              sketch.line(i + 0.5, y - 50, i + 1, y - 40); // dashes
            } else {
              sketch.line(i + 1, y - 50, i + 1, y - 45); // dashes
            }
            sketch.stroke(206, 212, 222, 20);
            sketch.textAlign(sketch.CENTER);
            i += 25;
          }
          let time = ToneTransport.seconds * PIX_TO_TIME;
          sketch.fill("#bac7db");
          sketch.rect(time + 1, 0, 1, 50, 4); // playline
        };

        sketch.mouseClicked = () => {

          // if mouse out of bounds
          if (sketch.mouseY < 0 || sketch.mouseY > y) {
            return;
          }

          if (exporting) {
            return;
          }
          
          let newPosition = (sketch.mouseX + 1) / PIX_TO_TIME;
          if (newPosition < 0.1) {
            newPosition = 0;
          }
          ToneTransport.seconds = newPosition;
          updateTransportPosition(newPosition);
        }
      };
      let transportp5 = new p5(s, transportRef.current);
      return () => transportp5.remove();
    }, []);

    return (
        <styles.TransportView id="transportview">
          {inflateChannels()}
          <styles.TransportTimeline>
            <styles.TimelinePadding>
            </styles.TimelinePadding>
            <styles.Timeline id="timeline" ref={transportRef}>
            </styles.Timeline>
          </styles.TransportTimeline>
        </styles.TransportView>
    )
}

export default Transport;