import { useState, useEffect, useRef, useContext } from "react";

import { PIX_TO_TIME } from "../utils/constants";
import { StateContext, StateDispatchContext } from "./StateContext";
import Draggable from 'react-draggable';
import * as styles from './channelStyles';

export default function Channel({channelName, channelData, selectRecording}) {

    const [editingName, setEditingName] = useState(false);
    const [name, setName] = useState(channelName);
    const tempName = useRef('');

    const dragStart = useRef(-1);
    const draggingRef = useRef(false);

    const inputWrapperRef = useRef(null);
    // const channelWrapperRef = useRef(null);
    useOutsideInput(inputWrapperRef);
    // useOutsideChannel(channelWrapperRef);

    const state = useContext(StateContext);
    const dispatch = useContext(StateDispatchContext);

    function useOutsideInput(ref) {
      useEffect(() => {
        function handleClickOutside(event) {
          if (ref.current && !ref.current.contains(event.target)) {
            // clicked outside
            setEditingName(false);
          }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
      }, [ref])
    }

    // function useOutsideChannel(ref) {
    //   useEffect(() => {
    //     function handleClickOutside(event) {
    //       if (ref.current && !ref.current.contains(event.target)) {
    //         // clicked outside
    //         dispatch({type: 'deselectAllChannels', payload: {}});
    //       }
    //     }
    //     document.addEventListener("mousedown", handleClickOutside);
    //     return () => document.removeEventListener("mousedown", handleClickOutside);
    //   }, [ref])
    // }

    const updatePlayerPosition = (delta, recording, index) => {
        dispatch({type: 'updateRecordingPosition', 
            payload: {
            recording: recording,
            delta: delta
            }}
        );
    };

    const onStop = (e, recording, index) => {

        // onDrag
        if (draggingRef.current) {
          draggingRef.current = false;
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

    const handleEdit = (event) => {
        tempName.current = event.target.value;
    };

    const handleEnter = (event) => {
        if (event.key === 'Enter') {
            setName(tempName.current);
            setEditingName(false);
        } else if (event.key === 'Escape') {
            setEditingName(false);
        }
    };

    const handleDoubleClick = () => {
        setEditingName(true);
    };

    const handleSelect = () => {
      dispatch({type: 'selectChannel', payload: channelData.index});
    };

    const inflateRecordings = () => {
        return channelData.recordings.map((r, index) => (
          <Draggable key={"drag_rec_clip_" + index}
              onDrag={(e) => onDrag(e)}
              onStop={(e) => onStop(e, r, index)}
              bounds={'#recordingsview'}
              grid={[25, 25]}>
            <styles.RecordingView className={"recording_clip_" + channelData.index}>
            </styles.RecordingView>
          </Draggable>
        ));
    };

    useEffect(() => {
        let clips = document.getElementsByClassName("recording_clip_" + channelData.index);
        let recordings = channelData.recordings;
        for (let c = 0; c < clips.length; c++) {
          clips[c].style.width = (recordings[c].duration * PIX_TO_TIME) + "px";
          if (!clips[c].style.left) {
            clips[c].style.left = (recordings[c].position * PIX_TO_TIME) + "px";
          }
        }
      }, [channelData]);

    return [
        <styles.Channel selected={channelData.index == state.selectedChannel}
            onClick={handleSelect}>
            {/* // ref={channelWrapperRef} */}
            <styles.ChannelHeader>
                {editingName ? (
                    <styles.ChannelNameInput type="text" id="channelNameInput"
                        ref={inputWrapperRef}
                        onChange={handleEdit}
                        onKeyDown={handleEnter}
                        placeholder={name}>
                    </styles.ChannelNameInput>
                ) : (
                    <styles.ChannelName onDoubleClick={handleDoubleClick}>{name}</styles.ChannelName>
                )}
            </styles.ChannelHeader>
            <styles.ChannelView>
                <styles.RecordingsView id="recordingsview">
                    {inflateRecordings()}
                </styles.RecordingsView>
            </styles.ChannelView>
        </styles.Channel>
    ]
}