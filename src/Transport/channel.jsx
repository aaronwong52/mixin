import { useState, useEffect, useRef, useContext } from "react";
import Recording from "./recording";

import { StateContext, StateDispatchContext } from "../utils/StateContext";
import { SnapContext } from './SnapContext';

import * as styles from './channelStyles';
import useKeyPress from "../utils/useKeyPress";

export default function Channel({channelName, channelData}) {

    const [editingName, setEditingName] = useState(false);
    
    const tempName = useRef('');

    const dragStart = useRef(-1);
    const draggingRef = useRef(false);

    const keyPress = useKeyPress();

    const inputWrapperRef = useRef(null);
    useOutsideInput(inputWrapperRef);

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
            dispatch({
              type: 'editChannelName', 
              payload: {channelId: channelData.id, name: tempName.current}
            });
            setEditingName(false);
        } else if (event.key === 'Escape') {
            setEditingName(false);
        }
    };

    const handleDoubleClick = () => {
        setEditingName(true);
        let input = document.getElementById('channelNameInput');
        input.click();
    };

    const handleSelect = () => {
      dispatch({type: 'selectChannel', payload: channelData.id});
    };

    // deletes selected recording
    const deleteSelectedRecording = () => {
      dispatch({type: 'deleteSelectedRecording', payload: state.selectedRecording});
    };

    const deleteSelectedChannel = () => {
      dispatch({type: 'deleteSelectedChannel', payload: state.selectedChannel});
    }

    const inflateRecordings = () => {
        return channelData.recordings.map((r) => (
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

           /* on backspace pressed:
              if a recording is selected:
                  delete the recording
              
              else if a channel is selected:
                  delete the channel (and its recordings)
            */
          case 'Backspace':
            if (Object.keys(state.selectedRecording).length != 0) {
              deleteSelectedRecording();
            } else if (state.selectedChannel && state.channels.length > 1) {
              deleteSelectedChannel();
            }

          default: 
            return;
        }
      }, [keyPress])

    return [
        <styles.Channel selected={channelData.id == state.selectedChannel}
            onClick={handleSelect}
            length={state.transportLength + 100}>
            <styles.ChannelHeader>
                {editingName ? (
                    <styles.ChannelNameInput type="text" id="channelNameInput"
                        ref={inputWrapperRef}
                        onChange={handleEdit}
                        onKeyDown={handleEnter}
                        placeholder={channelName}
                        autoFocus={true}>
                    </styles.ChannelNameInput>
                ) : (
                    <styles.ChannelName onDoubleClick={handleDoubleClick}>{channelName}</styles.ChannelName>
                )}
            </styles.ChannelHeader>
            <styles.ChannelView>
                <styles.RecordingsView id="recordingsview" length={state.transportLength + 100}>
                    {inflateRecordings()}
                </styles.RecordingsView>
            </styles.ChannelView>
        </styles.Channel>
    ]
}