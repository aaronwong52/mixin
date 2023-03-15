import { useState, useEffect, useRef, useContext } from 'react';
import * as Tone from 'tone';

import { RecordButton } from './Styles/recorderStyles';

import { StateContext, StateDispatchContext } from '../utils/StateContext';
import { ActionType, State } from '../Reducer/AppReducer';
import { IncompleteRecording } from '../Transport/recording';

interface RecorderProps {
    receiveRecording: (r: IncompleteRecording) => void;
    exporting: boolean;
}

function Recorder({receiveRecording, exporting}: RecorderProps) {

    const state = useContext(StateContext) as unknown as State;
    const dispatch = useContext(StateDispatchContext);

    const recordingRef = useRef<boolean>(false);
    const exportingRef = useRef<boolean>(false);
    const [recording, setRecording] = useState(false);

    const recorder = new Tone.Recorder();

    // @ts-ignore
    const openMic = async (mic) => {
        mic.connect(recorder);
        await mic.open();
    };

    // @ts-ignore
    const closeMic = (mic) => {
        mic.disconnect(recorder);
        mic.close();
    };

    const toggleRecording = async (e: MouseEvent) => {
        e.stopPropagation();
        if (!state.mic) {
            return;
        }
        Tone.context.resume(); // https://github.com/Tonejs/Tone.js/issues/341
        if (recordingRef.current) {
            closeMic(state.mic);
            let data: Blob = await recorder.stop();
            let blobUrl = URL.createObjectURL(data);
            let newRecording = {
                id: '',
                channel: '', // string based index
                position: Tone.Transport.seconds, // start of recording - same as recording.start, but is not mutated by cropping
                duration: 0, // exact position in seconds when recording should stop (real duration in player.buffer)
                start: Tone.Transport.seconds, // exact position in seconds when recording should start
                data: blobUrl, 
                player: undefined,
                solo: false,
                loaded: false,
            };
            receiveRecording(newRecording);
            recordingRef.current = false;
            setRecording(false);
            // @ts-ignore
            dispatch({type: ActionType.toggleRecordingState, payload: false});
        } else { // functionality is locked while export menu is open
            await openMic(state.mic);
            recorder.start();
            recordingRef.current = true;
            setRecording(true);
            // @ts-ignore
            dispatch({type: ActionType.toggleRecordingState, payload: true});
        }
    };

    useEffect(() => {
        exportingRef.current = exporting;        
    }, [exporting]);

    useEffect(() => {
        let recBtn = document.getElementById("rec_btn");

        // @ts-ignore
        recBtn.disabled = !Tone.UserMedia.supported;
        // @ts-ignore
        recBtn.addEventListener("click", (e) => toggleRecording(e));
        return () => {
            // @ts-ignore
            recBtn.removeEventListener("click", (e) => toggleRecording(e));
        }
        // @ts-ignore
    }, [state.mic]);

    return (
        // @ts-ignore
        <RecordButton type="button" id="rec_btn" recording={recording}></RecordButton>
    )
}

export default Recorder;