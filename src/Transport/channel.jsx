import { useState, useRef, useContext } from "react";

import { StateDispatchContext } from "./StateContext";
import Draggable from 'react-draggable';
import * as styles from './channelHeaderStyles';

export default function Channel({channelName, recordings, selectRecording}) {

    const [editingName, setEditingName] = useState(false);
    const [name, setName] = useState(channelName);
    const tempName = useRef('');

    const dragStart = useRef(-1);
    const draggingRef = useRef(false);

    const dispatch = useContext(StateDispatchContext);


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
          selectRecording(state.recording);
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

    const inflateRecordings = () => {
        return recordings.map((r, index) => (
          <Draggable key={"drag_rec_clip_" + index}
              onDrag={(e) => onDrag(e)}
              onStop={(e) => onStop(e, r, index)}
              bounds={'#recordingsview'}
              grid={[25, 25]}>
            <styles.RecordingView className="recording_clip">
            </styles.RecordingView>
          </Draggable>
        ));
    };

    return [
        <styles.Channel>
            <styles.ChannelHeader>
                {editingName ? (
                    <styles.ChannelNameInput type="text" 
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