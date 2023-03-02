import { useState, useEffect, useRef, useContext } from 'react';

import { RecordButton } from './recorderStyles';

import { v4 as uuidv4 } from 'uuid';

import { StateContext, StateDispatchContext } from '../utils/StateContext';
import * as Tone from 'tone';

function Recorder({receiveRecording, exporting}) {

    const state = useContext(StateContext);
    const dispatch = useContext(StateDispatchContext);

    const recordingState = useRef(false);
    const [recording, setRecording] = useState(false);

    const recorder = new Tone.Recorder();

    const openMic = (mic) => {
        mic.connect(recorder);
        mic.open();
    };

    const closeMic = (mic) => {
        mic.disconnect(recorder);
        mic.close();
    };

    const toggleRecording = async () => {
        Tone.context.resume(); // https://github.com/Tonejs/Tone.js/issues/341
        if (recordingState.current) {
            dispatch({type: 'toggleRecordingState', payload: false});
            closeMic(state.mic);
            let data = await recorder.stop();
            let blobUrl = URL.createObjectURL(data);
            let newRecording = {
                id: uuidv4(),
                channel: null, // id of channel
                position: Tone.Transport.seconds, // start of recording - same as recording.start, but is not mutated by cropping
                duration: 0, // exact position in seconds when recording should stop (real duration in player.buffer)
                start: Tone.Transport.seconds, // exact position in seconds when recording should start
                data: blobUrl, 
                player: null,
                solo: false,
                loaded: false,
            };
            receiveRecording(newRecording);
            recordingState.current = false;
            setRecording(false);
        }
        else if (!exporting) { // functionality is locked while export menu is open
            dispatch({type: 'toggleRecordingState', payload: true});
            openMic(state.mic);
            recorder.start();
            recordingState.current = true;
            setRecording(true);
        }
    };

    useEffect(() => {
        // for some reason (Tone?) this only works by binding a click listener, DOMException when using onClick prop
        let recBtn = document.getElementById("rec_btn");

        // recBtn.disabled = !Tone.UserMedia.supported;
        recBtn.addEventListener("click", toggleRecording)
        return () => {
            recBtn.removeEventListener("click", toggleRecording);
        }
    }, [exporting, state.mic]);

    return (
        <RecordButton type="button" id="rec_btn" recording={recording}></RecordButton>
    )
}

export default Recorder;