import { useState, useEffect, useRef, useContext } from "react";
import Recording from "./recording";

import { StateContext, StateDispatchContext } from "../utils/StateContext";
import { SnapContext } from './SnapContext';

import * as styles from './channelStyles';
import useKeyPress from "../utils/useKeyPress";

export default function Channel({channelName, channelData}) {

    const [editingName, setEditingName] = useState(false);
    const [name, setName] = useState(channelName);
    
    const tempName = useRef('');

    const dragStart = useRef(-1);
    const draggingRef = useRef(false);

    const keyPress = useKeyPress();

    const inputWrapperRef = useRef(null);
    const recordingsWrapperRef = useRef(null);
    useOutsideInput(inputWrapperRef);
    useOutsideRecordings(recordingsWrapperRef);

    const state = useContext(StateContext);
    const dispatch = useContext(StateDispatchContext);

    const snapState = useContext(SnapContext);

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
      }, [ref])
    }

    const updatePlayerPosition = (newPosition, recording, snapState) => {
        dispatch({type: 'updateRecordingPosition', 
            payload: {
              recording: recording,
              newPosition: newPosition,
              snapState: snapState
            }}
        );
    };

    const onStop = (e, data, recording) => {

        // onDrag
        if (draggingRef.current) {
          draggingRef.current = false;
   
          updatePlayerPosition(data.x, recording, snapState);
          dragStart.current = -1;
        }
  
        // onClick
        else {
          dispatch({type: 'selectRecording', payload: recording})
        }
    };
    
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
        event.stopPropagation();
        tempName.current = event.target.value;
    };

    const handleEnter = (event) => {
        event.stopPropagation();
        if (event.key === 'Enter' && tempName.current != '') {
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
      dispatch({type: 'selectChannel', payload: channelData.id});
    };

    // deletes selected recording
    const deleteSelectedRecording = () => {
      dispatch({type: 'deleteSelectedRecording', payload: {}})
    };

    const inflateRecordings = () => {
        return channelData.recordings.map((r, index) => (
          <Recording r={r}
            onDrag={onDrag}
            onStop={onStop}
            selected={state.selectedRecording}>
          </Recording>
        ));
    };

      useEffect(() => {
        switch(keyPress) {
          case 'Escape':

          case 'Backspace':
            if (state.selectedRecording != {}) {
              deleteSelectedRecording();
            }

          default: 
            return;
        }
      }, [keyPress])

    return [
        <styles.Channel selected={channelData.id == state.selectedChannel}
            onClick={handleSelect}>
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