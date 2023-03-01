import { useRef, useEffect, useContext, useState} from 'react';
import p5 from 'p5';

import * as styles from './transportStyles';

import { Transport as ToneTransport } from 'tone';
import Channel from './channel';
import Playline from './playline';

import { modulo } from '../utils/audio-utils';
import { PIX_TO_TIME } from '../utils/constants';

import { StateContext, StateDispatchContext } from '../utils/StateContext';
import { SnapContext } from './SnapContext';

/* 

User inputs transport length in seconds
Playline stops at that length - DONE
The animation leaves it there - DONE
Width of relevant inner components set to length
Width of transport view itself stays 92vw and scrolls within

*/

function Transport({exporting}) {

    const transportRef = useRef();
    const state = useContext(StateContext);
    const dispatch = useContext(StateDispatchContext);

    const [snapState, setSnapState] = useState(false);

    const channelsWrapperRef = useRef(null);
    useOutsideChannels(channelsWrapperRef);

    function useOutsideChannels(ref) {
      useEffect(() => {
        function handleClickOutside(event) {
          if (ref.current && !ref.current.contains(event.target)) {
            if (event.target.tagName == 'BUTTON') {
              return;
            }
            // clicked outside ref

            // Deselecting channels is not actually a useful function
            // Better to have one selected at all times
            // Support for selecting multiple channels and recordings would be nice

            // dispatch({type: 'deselectAllChannels', payload: {}});
          }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
      }, [ref])
    }

    const inflateChannels = () => {
      return state.channels.map((c, index) => (
        <Channel channelName = {c.name} 
          channelData = {{...c, index: index}}>
        </Channel>
      ));
    };

    const updateTransportPosition = (time) => {
      dispatch({type: 'updateTransportPosition', payload: time});
    };

    const handleKeyDown = (event) => {
      if (event.key == 'Enter') {
        let input = document.getElementById("transport_length_input");
        dispatch(({type: 'updateTransportLength', payload: input.value * 100}));
      }
    }

    useEffect(() => {
      const s = (sketch) => {
        let x = state.transportLength + 20;
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
    }, [state.transportLength]);

    return (
      <styles.SpanWrap>
        <styles.TransportView id="transportview" ref={channelsWrapperRef}>
          <SnapContext.Provider value={snapState}>
            {inflateChannels()}
          </SnapContext.Provider>
          <styles.TransportTimeline length={state.transportLength}>
            <styles.TimelinePadding id="timeline_padding">
              <styles.AddChannelButton onClick={() => dispatch({type: 'addChannel', payload: {}})}>
              </styles.AddChannelButton>
            </styles.TimelinePadding>
            <styles.Timeline id="timeline" ref={transportRef}>
              {Playline(150)}
            </styles.Timeline>
          </styles.TransportTimeline>
        </styles.TransportView>
        <styles.TransportSettings>
          <styles.LengthView>
            <styles.LengthLabel>Length:</styles.LengthLabel>
            <styles.LengthInput id="transport_length_input" onKeyDown={handleKeyDown}>
            </styles.LengthInput>s
          </styles.LengthView>
          <styles.SnapView>
            <p>Snap</p>
            <styles.SnapToggle 
              snapState={snapState} 
              onClick={() => setSnapState(!snapState)}>
            </styles.SnapToggle>
          </styles.SnapView>
        </styles.TransportSettings>
      </styles.SpanWrap>
    )
}

export default Transport;