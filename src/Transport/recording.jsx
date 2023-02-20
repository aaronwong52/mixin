import { useRef, useEffect, useContext } from "react";

import { StateDispatchContext } from "../utils/StateContext";
import { PIX_TO_TIME } from "../utils/constants";
import Draggable from "react-draggable";
import * as styles from './channelStyles';

export default function Recording({r, onDrag, onStop, selected}) {

    const dispatch = useContext(StateDispatchContext);

    const recordingsWrapperRef = useRef(null);
    useOutsideRecordings(recordingsWrapperRef);

    function useOutsideRecordings(ref) {
        useEffect(() => {
            function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                if (event.target.id != "recordingsview") {
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
        let width = r.duration - r.start;
        recording.style.width = (width * PIX_TO_TIME) + "px";
        if (!recording.style.left) {
            recording.style.left = (r.start * PIX_TO_TIME) + "px";
        }
    }, [r]);

    return [
        <Draggable key={"drag_rec_clip_" + r.id}
            onDrag={(e) => onDrag(e)}
            onStop={(e) => onStop(e, r)}
            bounds={'#recordingsview'}>
            {/* grid={[25, 25]} */}
            <styles.RecordingView
                ref={recordingsWrapperRef}
                selected = {r.id == selected.id} 
                id = {"recording_clip_" + r.id}>
            </styles.RecordingView>
        </Draggable>
    ];
}