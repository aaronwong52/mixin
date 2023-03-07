import { useRef, useEffect, useContext, useState} from 'react';
import p5 from 'p5';

import * as styles from './Styles/TransportStyles';

import { Transport as ToneTransport } from 'tone';
import { AppTheme } from '../View/Themes';

import Channel from './Channel';
import Recording from "./Recording";
import Playline from './playline';

import { _findChannelIndex } from '../Reducer/AppReducer';

import { modulo } from '../utils/audio-utils';
import { CHANNEL_SIZE, PIX_TO_TIME, TIMELINE_HEIGHT } from '../utils/constants';

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
    const draggingRef = useRef(false);

    const channelsWrapperRef = useRef(null);
    useOutsideChannels(channelsWrapperRef);

    function useOutsideChannels(ref) {
        useEffect(() => {
            function handleClickOutside(event) {
                if (ref.current && !ref.current.contains(event.target)) {
                    if (event.target.tagName == 'BUTTON') {
                        return;
                    }
                    dispatch({type: 'deselectRecordings', payload: {}});
                }
            }
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }, [ref]);
    }

    const _getGridHeight = () => {
        return TIMELINE_HEIGHT + (CHANNEL_SIZE * state.channels.length);
    };

    const onStop = (e, data, recording) => {
        // onDrag
        if (draggingRef.current) {
            draggingRef.current = false;
            updatePlayerPosition({x: data.x, y: data.y}, recording, snapState);
        }

      // onClick
        else {
            dispatch({type: 'selectRecording', payload: recording})
        }
    };

    const onDrag = (e) => {
        if (e.type === 'mousemove' || e.type === 'touchmove') {
            draggingRef.current = true;
        }
    };

    const updatePlayerPosition = (deltas, recording, snapState) => {
        dispatch({type: 'updateRecordingPosition', payload: {
            recording: recording,
            newPosition: deltas.x,
            snapState: snapState
        }});
        let index = _findChannelIndex(state.channels, recording.channel)
        let newIndex = Math.floor(deltas.y / CHANNEL_SIZE);
        if (newIndex != index) {
            recording.channel = state.channels[newIndex].id;
            dispatch({type: 'switchRecordingChannel', payload: {
                recording: recording,
                channelIndex: index,
                newChannelIndex: newIndex
            }})
        }
        // reselect recording to update playline in Editor
        if (state.selectedRecording.id == recording.id) {
            dispatch({type: 'selectRecording', payload: recording});
        }
    };

    const TransportSettings = (setExporting) => {

        const settingsRef = useRef(null);
        useOutsideSettings(settingsRef);

        function useOutsideSettings(ref) {
            useEffect(() => {
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
                    placeholder={state.transportLength / PIX_TO_TIME}>
                    </styles.LengthInput>s
                </styles.LengthView>
                <styles.SnapView>
                    <p>Snap</p>
                    <styles.SnapToggle snapState={snapState}
                    onClick={() => setSnapState(!snapState)}>
                    </styles.SnapToggle>
                </styles.SnapView>
            </styles.TransportSettings>
        );
    };

    const Channels = () => {
        return state.channels.map((c, index) => (
            <Channel key={(c.id + index).toString()} channelName = {c.name} 
            channelData = {{...c, index: index}}>
            </Channel>
        ));
    };

    const Recordings = () => {
        let recordings = [];
        state.channels.map((c) => {
            c.recordings.map((r) => {
                recordings.push(
                    <Recording key={r.id} r={r}
                        onDrag={onDrag}
                        onStop={onStop}
                        selected={state.selectedRecording}
                        channelIndex={c.index}>
                    </Recording>
                )
             })
        });
        return (
            <styles.Recordings id="recordings_view"
                height={_getGridHeight() - TIMELINE_HEIGHT}>
                {recordings}
            </styles.Recordings>
        );
    };

    const updateTransportPosition = (time) => {
        dispatch({type: 'updateTransportPosition', payload: time});
    };

    const handleKeyDown = (event) => {
        if (event.key == 'Enter') {
            let input = document.getElementById("transport_length_input");
            dispatch(({type: 'updateTransportLength', payload: input.value * PIX_TO_TIME}));
        }
    };

    useEffect(() => {
        const s = (sketch) => {
            let x = state.transportLength + 20;
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
                dispatch({type: 'togglePlay', payload: {playing: false, time: newPosition}});
                updateTransportPosition(newPosition);
            }
        };
        let transportp5 = new p5(s, transportRef.current);
        return () => transportp5.remove();
    }, [state.transportLength]);

    return (
        <styles.SpanWrap>
            <styles.TransportView id="transportview" ref={channelsWrapperRef}>
                <TransportSettings></TransportSettings>
                <styles.TransportGrid id="transportgrid" 
                    length={state.transportLength} 
                    height={_getGridHeight()}>
                    <styles.ChannelHeaders>
                        <Channels></Channels>
                        <styles.TimelinePadding id="timeline_padding">
                            <styles.AddChannelButton onClick={() => dispatch({type: 'addChannel', payload: {}})}>
                            </styles.AddChannelButton>
                        </styles.TimelinePadding>
                    </styles.ChannelHeaders>
                    <styles.GridArea id="grid_area">
                        <SnapContext.Provider value={snapState}>
                            <Recordings></Recordings>
                        </SnapContext.Provider>
                        <styles.TransportTimeline>
                            <styles.Timeline id="timeline" ref={transportRef}>
                                <Playline height={_getGridHeight()}></Playline>
                            </styles.Timeline>
                        </styles.TransportTimeline>
                    </styles.GridArea>
                </styles.TransportGrid>
            </styles.TransportView>
        </styles.SpanWrap>
    );
}

export default Transport;