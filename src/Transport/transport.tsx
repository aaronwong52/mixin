import { useRef, useEffect, useContext, useState} from 'react';
import p5 from 'p5';

// @ts-ignore
import * as styles from './Styles/TransportStyles';

import { Transport as ToneTransport } from 'tone';
import { AppTheme } from '../View/Themes';

// @ts-ignore
import Channel from './Channel';
// @ts-ignore
import Recording from "./Recording";
import Playline from './Playline';

// @ts-ignore
import { _findChannelIndex } from '../Reducer/AppReducer';

import { modulo } from '../utils/audio-utils';
// @ts-ignore
import { CHANNEL_SIZE, PIX_TO_TIME, TIMELINE_HEIGHT } from '../utils/constants';

// @ts-ignore
import { StateContext, StateDispatchContext } from '../utils/StateContext';
// @ts-ignore
import { SnapContext } from './SnapContext';

/* 

User inputs transport length in seconds
Playline stops at that length - DONE
The animation leaves it there - DONE
Width of relevant inner components set to length
Width of transport view itself stays 92vw and scrolls within

*/

// @ts-ignore
function Transport({exporting}) {

    const transportRef = useRef();
    const state = useContext(StateContext);
    const dispatch = useContext(StateDispatchContext);

    const [snapState, setSnapState] = useState(false);
    const draggingRef = useRef(false);

    const _getGridHeight = (): number => {
        // @ts-ignore
        return TIMELINE_HEIGHT + (CHANNEL_SIZE * state.channels.length);
    };

    // @ts-ignore
    const onStop = (e, data, recording): void => {
        // onDrag
        if (draggingRef.current) {
            draggingRef.current = false;
            updatePlayerPosition({x: data.x, y: data.y}, recording, snapState);
        }

      // onClick
        else {
            // @ts-ignore
            dispatch({type: 'selectRecording', payload: recording})
        }
    };

    // @ts-ignore
    const onDrag = (e): void => {
        if (e.type === 'mousemove' || e.type === 'touchmove') {
            draggingRef.current = true;
        }
    };

    // @ts-ignore
    const updatePlayerPosition = (deltas, recording, snapState): void => {
        // @ts-ignore
        dispatch({type: 'updateRecordingPosition', payload: {
            recording: recording,
            newPosition: deltas.x,
            snapState: snapState
        }});
        // @ts-ignore
        let index = _findChannelIndex(state.channels, recording.channel)
        let newIndex = Math.floor(deltas.y / CHANNEL_SIZE);
        if (newIndex != index) {
            // @ts-ignore
            recording.channel = state.channels[newIndex].id;
            // @ts-ignore
            dispatch({type: 'switchRecordingChannel', payload: {
                recording: recording,
                channelIndex: index,
                newChannelIndex: newIndex
            }})
        }
        // reselect recording to update playline in Editor
        // @ts-ignore
        if (state.selectedRecording.id == recording.id) {
            // @ts-ignore
            dispatch({type: 'selectRecording', payload: recording});
        }
    };

    // @ts-ignore
    const TransportSettings = (setExporting) => {

        const settingsRef = useRef(null);
        useOutsideSettings(settingsRef);

        // @ts-ignore
        function useOutsideSettings(ref) {
            useEffect(() => {
                // @ts-ignore
                function handleClickOutside(event) {
                    if (ref.current && !ref.current.contains(event.target)) {
                        if (event.target.id != "recordingsview") {
                            return;
                        }
                        // clicked outside
                        setExporting(!exporting);
                    }
                }
                document.addEventListener("mousedown", handleClickOutside);
                return () => document.removeEventListener("mousedown", handleClickOutside);
            }, [ref]);
        }
        return (
            <styles.TransportSettings>
                <styles.LengthView>
                    <styles.LengthLabel>Length:</styles.LengthLabel>
                    <styles.LengthInput id="transport_length_input" onKeyDown={handleKeyDown}
                    // @ts-ignore
                    placeholder={state.transportLength / PIX_TO_TIME}>
                    </styles.LengthInput>s
                </styles.LengthView>
                <styles.SnapView>
                    <p>Snap</p>
                    {/* @ts-ignore */}
                    <styles.SnapToggle snapState={snapState}
                    onClick={() => setSnapState(!snapState)}>
                    </styles.SnapToggle>
                </styles.SnapView>
            </styles.TransportSettings>
        );
    };

    const Channels = () => {
        // @ts-ignore
        return state.channels.map((c, index) => (
            /* @ts-ignore */
            <Channel key={(c.id + index).toString()} channelName = {c.name} 
            channelData = {{...c, index: index}}>
            </Channel>
        ));
    };

    const Recordings = () => {
        // @ts-ignore
        let recordings = [];
        // @ts-ignore
        state.channels.map((c) => {
            // @ts-ignore
            c.recordings.map((r) => {
                recordings.push(
                    // @ts-ignore
                    <Recording key={r.id} r={r}
                        onDrag={onDrag}
                        onStop={onStop}
                        // @ts-ignore
                        selected={state.selectedRecording}
                        channelIndex={c.index}>
                    </Recording>
                )
             })
        });
        return (
            <styles.Recordings id="recordings_view"
            // @ts-ignore
                height={_getGridHeight() - TIMELINE_HEIGHT}>
                {/* @ts-ignore */}
                {recordings}
            </styles.Recordings>
        );
    };

    // @ts-ignore
    const updateTransportPosition = (time) => {
        // @ts-ignore
        dispatch({type: 'updateTransportPosition', payload: time});
    };

    // @ts-ignore
    const handleKeyDown = (event) => {
        if (event.key == 'Enter') {
            let input = document.getElementById("transport_length_input");
            // @ts-ignore
            dispatch(({type: 'updateTransportLength', payload: input.value * PIX_TO_TIME}));
        }
    };

    // @ts-ignore
    useEffect(() => {
        // @ts-ignore
        const s = (sketch) => {
            // @ts-ignore
            let x = state.transportLength;
            let y = TIMELINE_HEIGHT;

            sketch.setup = () => {
                sketch.createCanvas(x, y);
            };

            sketch.draw = () => {
                sketch.background(AppTheme.AppSecondaryColor);
                sketch.fill(51)
                sketch.textSize(12);

                sketch.line(0, 0, x, 0); // baseline

                let i = 0;
                while (i < x) {
                    sketch.fill(AppTheme.AppTextColor);
                    if (modulo(i, 50) == 0) {
                    if (i != 0) {
                        sketch.text(i / PIX_TO_TIME, i, y - 20); // seconds
                    }
                    sketch.line(i + 0.5, y - 50, i + 0.5, y - 40); // dashes
                    } else {
                    sketch.line(i + 0.5, y - 50, i + 0.5, y - 45); // dashes
                    }
                    sketch.stroke(206, 212, 222, 20);
                    sketch.textAlign(sketch.CENTER);
                    i += 25;
                }
            };

            sketch.mouseClicked = () => {
                // if mouse out of bounds
                if (sketch.mouseY < 0 || sketch.mouseY > y || exporting) {
                    return;
                }
                ToneTransport.pause();
                
                let newPosition = (sketch.mouseX + 1) / PIX_TO_TIME;
                if (newPosition < 0.1) {
                    newPosition = 0;
                }

                ToneTransport.seconds = newPosition;
                // @ts-ignore
                dispatch({type: 'togglePlay', payload: {playing: false, time: newPosition}});
                updateTransportPosition(newPosition);
            }
        };
        let transportp5 = new p5(s, transportRef.current);
        return () => transportp5.remove();
        // @ts-ignore
    }, [state.transportLength]);

    return (
        // @ts-ignore
        <styles.Wrap length={state.transportLength}>
            <styles.TransportView>
                <styles.ChannelHeaders>
                <Channels></Channels>
                    <styles.TimelinePadding id="timeline_padding">
                        {/* @ts-ignore */}
                        <styles.AddChannelButton onClick={() => dispatch({type: 'addChannel', payload: {}})}>
                        </styles.AddChannelButton>
                    </styles.TimelinePadding>
                </styles.ChannelHeaders>
                {/* @ts-ignore */}
                <styles.GridArea id="grid_area" length={state.transportLength}>
                    <SnapContext.Provider value={snapState}>
                        <Recordings></Recordings>
                    </SnapContext.Provider>
                    <styles.Transport>
                        {/* @ts-ignore */}
                        <styles.Timeline id="timeline" ref={transportRef}>
                            <Playline height={_getGridHeight()}></Playline>
                        </styles.Timeline>
                    </styles.Transport>
                </styles.GridArea>
            </styles.TransportView>
        </styles.Wrap>
    );
}

export default Transport;