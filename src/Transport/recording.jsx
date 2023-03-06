import { useRef, useEffect, useContext } from "react";

import { StateDispatchContext } from "../utils/StateContext";
import { SnapContext } from "./SnapContext";
import { CHANNEL_SIZE, PIX_TO_TIME } from "../utils/constants";
import Draggable from "react-draggable";

import { AppTheme } from "../View/Themes";
import styled from 'styled-components';

const RecordingView = styled.div`
    position: absolute;
    width: ${CHANNEL_SIZE}px;
    height: ${CHANNEL_SIZE}px;
    background-color: ${props => props.selected 
        ? AppTheme.RecordingColor
        : AppTheme.SelectedRecordingColor
    };
    border: none;
    border-radius: 4px;
    :hover {cursor: pointer;}
    z-index: 3;
`;

export default function Recording({r, onDrag, onStop, selected, channelIndex}) {

    const dispatch = useContext(StateDispatchContext);
    const snapState = useContext(SnapContext);

    const recordingsWrapperRef = useRef(null);
    useOutsideRecordings(recordingsWrapperRef);

    function useOutsideRecordings(ref) {
        useEffect(() => {
            function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                if (event.target.id != "recordings_view") {
                    return;
                }
                // clicked outside
                dispatch({type: 'deselectRecordings', payload: {}});
            }
            }
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }, [ref]);
    }

    useEffect(() => {
        let recording = document.getElementById("recording_clip_" + r.id);
        let clipWidth = r.duration - r.start;
        recording.style.width = (clipWidth * PIX_TO_TIME) + "px";

        // drag position is handled not internally by draggable but by following r.start in draggable position prop
    }, [r]);

    // currently each channel contains its own recordings represented as Draggables 

    // need a system where recordings can be dragged around the transport, snapping vertically to a channel
    // consider a representation where the recordings belong not directly to a channel but are placed as 
    // direct children of the transport, and they snap to a channel in a UI invariant that is easily discernible

    // currently on each channel, the x position is calculated by r.start
    // for this new system, the y position will be calculated by channel index
    // this way recordings will not be limited to one channel and can be moved around
    return [
        <Draggable key={"drag_rec_clip_" + r.id}
            onDrag={(e) => onDrag(e)}
            onStop={(e, data) => onStop(e, data, r)}
            bounds={"parent"}
            position={{x: r.start * PIX_TO_TIME, y: channelIndex * CHANNEL_SIZE}}
            grid={snapState ? [25, CHANNEL_SIZE] : [-1, CHANNEL_SIZE]}
            scale={1}>
            <RecordingView
                ref={recordingsWrapperRef}
                selected = {r.id == selected.id} 
                id = {"recording_clip_" + r.id}>
            </RecordingView>
        </Draggable>
    ];
}